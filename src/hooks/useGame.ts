// src/hooks/useGame.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import type { Idl, Wallet } from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  PublicKey, LAMPORTS_PER_SOL, SystemProgram, SYSVAR_RENT_PUBKEY,
  TransactionMessage, VersionedTransaction,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { IDL } from '../idl/messi_ronaldo_idl';
import { MINT_A, MINT_B, PROGRAM_ID } from '../utils/constants';
import { getRoundPDA, getBidPDA, getAssociatedTokenAddress, toRawAmount } from '../utils/program';

const DEFAULT_POLL_MS = 30_000;
const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS ?? DEFAULT_POLL_MS);

export const CLAIM_DELAY_SECS = Number(import.meta.env.VITE_CLAIM_DELAY_SECS ?? 1800);
const NEW_LAYOUT_FROM_ROUND = Number(import.meta.env.VITE_NEW_LAYOUT_FROM_ROUND ?? 7);
const TOKEN_PROGRAM_ID_STR = import.meta.env.VITE_TOKEN_PROGRAM_ID;

function sleep(ms: number) { return new Promise((res) => setTimeout(res, ms)); }
function isRateLimitError(err: unknown) {
  const e = err as Record<string, unknown>;
  const msg = typeof e?.message === 'string' ? e.message : String(err);
  return msg.includes('429') || msg.includes('Too Many Requests') || e?.status === 429 || e?.code === 429;
}
async function withBackoff<T>(fn: () => Promise<T>, tries = 5, base = 500): Promise<T> {
  let attempt = 0;
  while (true) {
    try { return await fn(); } catch (err) {
      attempt++;
      if (!isRateLimitError(err) || attempt >= tries) throw err;
      const delay = base * Math.pow(2, attempt) + Math.floor(Math.random() * base);
      console.warn(`[useGame] RPC 429, retrying in ${delay}ms (${attempt}/${tries})`);
      await sleep(delay);
    }
  }
}

export type TeamName = 'MESSI' | 'RONALDO';

export interface RoundState {
  roundNumber: number; startTs: number; endTs: number; settledAt: number;
  mintA: string; mintB: string; escrowA: string; escrowB: string;
  totalA: string; totalB: string;
  highestBidA: string; highestBidAAmount: string;
  highestBidB: string; highestBidBAmount: string;
  settled: boolean; winnerTeam: number;
  randomRewardAmount: string; randomRewardFilled: boolean;
  randomWinner: string; claimedRandom: boolean;
  highestBidderRewardAmount: string; claimedHighest: boolean;
  proportionalRewardAmount: string; proportionalRewardFilled: boolean;
  proportionalWinningTotal: string; proportionalExcludedAmount: string;
  operator: string; bump: number; pda: string;
  isLegacy: boolean;
}

export interface BidState {
  amount: string; claimedReturn: boolean; claimedPrize: boolean; pda: string;
}
export interface UserBids { messi: BidState | null; ronaldo: BidState | null; }
export interface TokenBalances { messi: number; ronaldo: number; }
export interface TxStatus { type: 'pending' | 'success' | 'error'; msg: string; }

export function claimUnlockSecondsLeft(round: RoundState | null, nowSecs: number): number {
  if (!round || !round.settled) return 0;
  if (round.isLegacy || round.settledAt === 0) return 0;
  return Math.max(0, round.settledAt + CLAIM_DELAY_SECS - nowSecs);
}

interface BidAccountData {
  amount: { toString(): string }; claimedReturn: boolean; claimedPrize: boolean;
}
interface GameProgram {
  coder: { accounts: { decode(name: string, data: Buffer): unknown } };
  account: {
    round: { fetch: (pda: PublicKey) => Promise<Record<string, unknown>> };
    bid: { fetch: (pda: PublicKey) => Promise<BidAccountData> };
  };
  methods: {
    depositBid: (amount: BN) => MethodBuilder;
    claimReturn: () => MethodBuilder;
    claimProportional: () => MethodBuilder;
    claimHighestBidder: () => MethodBuilder;
    claimRandomWinner: () => MethodBuilder;
  };
}
interface MethodBuilder {
  accounts: (a: Record<string, PublicKey>) => {
    rpc: (o?: { commitment: string }) => Promise<string>;
    instruction: () => Promise<import('@solana/web3.js').TransactionInstruction>;
  };
}

// ── Legacy binary decoder (rounds 1-6) ────────────────────────────────────────
function decodeLegacyRound(data: Buffer, pda: string): RoundState | null {
  try {
    let off = 8;
    const rb = (n: number) => { const s = data.slice(off, off + n); off += n; return s; };
    const u64 = () => { const b = rb(8); return Number(new DataView(b.buffer, b.byteOffset, 8).getBigUint64(0, true)); };
    const i64 = () => { const b = rb(8); return Number(new DataView(b.buffer, b.byteOffset, 8).getBigInt64(0, true)); };
    const u128 = () => { const b = rb(16); const dv = new DataView(b.buffer, b.byteOffset, 16); return (dv.getBigUint64(0, true) + (dv.getBigUint64(8, true) << BigInt(64))).toString(); };
    const pk = () => new PublicKey(rb(32)).toBase58();
    const u8 = () => rb(1)[0];
    const bool = () => rb(1)[0] === 1;
    const u64s = () => { const b = rb(8); return new DataView(b.buffer, b.byteOffset, 8).getBigUint64(0, true).toString(); };

    return {
      roundNumber: u64(), startTs: i64(), endTs: i64(), settledAt: 0,
      mintA: pk(), mintB: pk(), escrowA: pk(), escrowB: pk(),
      totalA: u128(), totalB: u128(),
      highestBidA: pk(), highestBidAAmount: u128(),
      highestBidB: pk(), highestBidBAmount: u128(),
      settled: bool(), winnerTeam: u8(),
      randomRewardAmount: u64s(), randomRewardFilled: bool(),
      randomWinner: PublicKey.default.toBase58(), claimedRandom: true,
      highestBidderRewardAmount: '0', claimedHighest: true,
      proportionalRewardAmount: '0', proportionalRewardFilled: true,
      proportionalWinningTotal: '0', proportionalExcludedAmount: '0',
      operator: pk(), bump: u8(),
      pda, isLegacy: true,
    };
  } catch (e) {
    console.warn('[decodeLegacyRound] failed', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export function useGame() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [program, setProgram] = useState<GameProgram | null>(null);
  const [readonlyProgram, setReadonlyProgram] = useState<GameProgram | null>(null);
  const [currentRound, setCurrentRound] = useState<RoundState | null>(null);
  const [rounds, setRounds] = useState<RoundState[]>([]);
  const [userBids, setUserBids] = useState<UserBids>({ messi: null, ronaldo: null });
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({ messi: 0, ronaldo: 0 });
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTickRunning = useRef(false);
  const tickCounter = useRef(0);
  const subscriptionRefreshQueued = useRef(false);
  const currentRoundRef = useRef<RoundState | null>(null);
  const [networkTime, setNetworkTime] = useState<number>(() => Math.floor(Date.now() / 1000));
  const [currentTime, setCurrentTime] = useState<number>(networkTime);
  const timeOffsetRef = useRef<number>(0);
  const mintsReady = MINT_A !== null && MINT_B !== null;

  useEffect(() => {
    const t = setInterval(
      () => setCurrentTime(Math.floor(Date.now() / 1000) + timeOffsetRef.current),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  const fetchNetworkTime = useCallback(async () => {
    if (!connection) return;
    try {
      const slot = await withBackoff(() => connection.getSlot());
      await sleep(200);
      const blockTime = await withBackoff(() => connection.getBlockTime(slot));
      if (blockTime) {
        setNetworkTime(blockTime);
        timeOffsetRef.current = blockTime - Math.floor(Date.now() / 1000);
      }
    } catch (error) { return error; }
  }, [connection]);

  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);

  // ── Providers ──────────────────────────────────────────────────────────────
  const readonlyProvider = useMemo(() => {
    if (!connection) return null;
    const dummyWallet = {
      publicKey: PublicKey.default,
      signTransaction: async (tx: unknown) => tx,
      signAllTransactions: async (txs: unknown[]) => txs,
    };
    return new AnchorProvider(connection, dummyWallet as unknown as Wallet, { commitment: 'confirmed' });
  }, [connection]);

  useEffect(() => {
    if (!readonlyProvider || !PROGRAM_ID) return;
    try {
      const prog = new Program(IDL as unknown as Idl, readonlyProvider) as unknown as GameProgram;
      setReadonlyProgram(prog);
    } catch (e) { console.error('[useGame] Readonly program init failed', e); }
  }, [readonlyProvider]);

  useEffect(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !connection || !PROGRAM_ID) return;
    try {
      const provider = new AnchorProvider(connection, wallet as unknown as Wallet, { commitment: 'confirmed' });
      const prog = new Program(IDL as unknown as Idl, provider) as unknown as GameProgram;
      void Promise.resolve().then(() => setProgram(prog));
    } catch (e) { console.error('[useGame] Program init failed', e); }
  }, [wallet.publicKey, connection, wallet]);

  // ── fetchRounds ────────────────────────────────────────────────────────────
  const fetchRounds = useCallback(async () => {
    const p = program || readonlyProgram;
    if (!connection || !p || !mintsReady) return;

    const fetched: RoundState[] = [];
    let roundNumber = 1;
    const BATCH_SIZE = 10;

    while (true) {
      const pdas = Array.from({ length: BATCH_SIZE }, (_, i) => getRoundPDA(roundNumber + i));
      const accounts = await withBackoff(() => connection.getMultipleAccountsInfo(pdas, 'confirmed'));
      let anyFound = false;

      for (let i = 0; i < accounts.length; i++) {
        const info = accounts[i];
        if (!info) continue;
        anyFound = true;
        const thisRound = roundNumber + i;
        const data = Buffer.from(info.data);

        // Always try the new Anchor decoder first.
        // Only fall back to legacy binary decoder if the new one fails —
        // this means a fresh deployment starting at round 1 works correctly
        // regardless of what VITE_NEW_LAYOUT_FROM_ROUND is set to.
        let decoded = false;
        try {
          const d = p.coder.accounts.decode('round', data) as Record<string, unknown>;
          const s = (k: string) => (d[k] as { toString(): string })?.toString() ?? '0';
          fetched.push({
            roundNumber: Number(d.roundNumber),
            startTs: Number(d.startTs),
            endTs: Number(d.endTs),
            settledAt: Number(d.settledAt ?? 0),
            mintA: s('mintA'), mintB: s('mintB'),
            escrowA: s('escrowA'), escrowB: s('escrowB'),
            totalA: s('totalA'), totalB: s('totalB'),
            highestBidA: s('highestBidA'),
            highestBidAAmount: s('highestBidAAmount'),
            highestBidB: s('highestBidB'),
            highestBidBAmount: s('highestBidBAmount'),
            settled: d.settled as boolean,
            winnerTeam: d.winnerTeam as number,
            randomRewardAmount: s('randomRewardAmount'),
            randomRewardFilled: d.randomRewardFilled as boolean,
            randomWinner: s('randomWinner'),
            claimedRandom: (d.claimedRandom as boolean) ?? false,
            highestBidderRewardAmount: s('highestBidderRewardAmount'),
            claimedHighest: (d.claimedHighest as boolean) ?? false,
            proportionalRewardAmount: s('proportionalRewardAmount'),
            proportionalRewardFilled: (d.proportionalRewardFilled as boolean) ?? false,
            proportionalWinningTotal: s('proportionalWinningTotal'),
            proportionalExcludedAmount: s('proportionalExcludedAmount'),
            operator: s('operator'),
            bump: d.bump as number,
            pda: pdas[i].toString(),
            isLegacy: false,
          });
          decoded = true;
        } catch { /* fall through to legacy */ }

        // Legacy fallback — only for old program rounds that predate new struct
        if (!decoded && thisRound < NEW_LAYOUT_FROM_ROUND) {
          const leg = decodeLegacyRound(data, pdas[i].toString());
          if (leg) fetched.push(leg);
          else console.warn(`[fetchRounds] round ${thisRound} → both decoders failed`);
        } else if (!decoded) {
          console.warn(`[fetchRounds] round ${thisRound} → new decoder failed, skipping (not a legacy round)`);
        }
      }

      if (!anyFound) break;
      roundNumber += BATCH_SIZE;
    }

    fetched.sort((a, b) => a.roundNumber - b.roundNumber);
    setRounds(fetched);
    setCurrentRound(fetched[fetched.length - 1] || null);
  }, [connection, program, readonlyProgram, mintsReady]);

  // ── fetchUserBids ──────────────────────────────────────────────────────────
  const fetchUserBids = useCallback(async (round: RoundState | null) => {
    if (!program || !wallet.publicKey || !round || !mintsReady) return;
    try {
      const pdaA = getBidPDA(round.roundNumber, wallet.publicKey!, MINT_A!);
      const pdaB = getBidPDA(round.roundNumber, wallet.publicKey!, MINT_B!);
      const [bA, bB] = await Promise.allSettled([
        withBackoff(() => program.account.bid.fetch(pdaA)),
        withBackoff(() => program.account.bid.fetch(pdaB)),
      ]);
      setUserBids({
        messi: bA.status === 'fulfilled' ? { amount: bA.value.amount.toString(), claimedReturn: bA.value.claimedReturn, claimedPrize: bA.value.claimedPrize, pda: pdaA.toString() } : null,
        ronaldo: bB.status === 'fulfilled' ? { amount: bB.value.amount.toString(), claimedReturn: bB.value.claimedReturn, claimedPrize: bB.value.claimedPrize, pda: pdaB.toString() } : null,
      });
    } catch (err) { console.error('[useGame] fetchUserBids error:', err); }
  }, [program, wallet.publicKey, mintsReady]);

  // ── fetchBalances ──────────────────────────────────────────────────────────
  const fetchBalances = useCallback(async () => {
    if (!connection || !wallet.publicKey || !mintsReady) return;
    try {
      const owner = wallet.publicKey as PublicKey;
      const ataA = getAssociatedTokenAddress(owner, MINT_A!);
      const ataB = getAssociatedTokenAddress(owner, MINT_B!);
      const [sol, infos] = await Promise.all([
        withBackoff(() => connection.getBalance(owner)),
        withBackoff(() => connection.getMultipleAccountsInfo([ataA, ataB], 'confirmed')),
      ]);
      setSolBalance(sol / LAMPORTS_PER_SOL);
      let messi = 0, ronaldo = 0;
      if (infos[0]) { try { messi = Number((await withBackoff(() => connection.getTokenAccountBalance(ataA))).value.uiAmount ?? 0); } catch { /* no ata */ } }
      if (infos[1]) { try { ronaldo = Number((await withBackoff(() => connection.getTokenAccountBalance(ataB))).value.uiAmount ?? 0); } catch { /* no ata */ } }
      setTokenBalances({ messi, ronaldo });
    } catch (e) { console.warn('[useGame] fetchBalances error', e); }
  }, [connection, mintsReady, wallet.publicKey]);

  // ── Polling loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const tick = async () => {
      if (isTickRunning.current) return;
      isTickRunning.current = true;
      const counter = tickCounter.current++;
      try {
        await fetchRounds();
        if (counter % 2 === 0) { await sleep(300); await fetchBalances(); }
        if (wallet.publicKey && currentRoundRef.current) { await sleep(300); await fetchUserBids(currentRoundRef.current); }
        if (counter % 4 === 0) { await sleep(300); await fetchNetworkTime(); }
      } catch (err) { console.error('[useGame] tick error:', err); }
      finally { isTickRunning.current = false; }
    };

    const warmUp = async () => {
      try {
        await fetchRounds(); await sleep(400); await fetchBalances(); await sleep(400); await fetchNetworkTime();
      } catch (e) { console.error('[useGame] warmup failed', e); }
    };

    void warmUp();
    intervalRef.current = setInterval(() => void tick(), POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchRounds, fetchBalances, fetchUserBids, fetchNetworkTime, wallet.publicKey]);

  const prevRoundRef = useRef<number | null>(null);
  useEffect(() => {
    if (!currentRound || !wallet.publicKey) return;
    if (prevRoundRef.current === currentRound.roundNumber) return;
    prevRoundRef.current = currentRound.roundNumber;
    void fetchUserBids(currentRound);
  }, [currentRound, wallet.publicKey, fetchUserBids]);

  useEffect(() => {
    if (!connection || !currentRound) return;
    let subId: number | null = null;
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const onChange = () => {
      if (debounce) clearTimeout(debounce);
      if (subscriptionRefreshQueued.current) return;
      subscriptionRefreshQueued.current = true;
      debounce = setTimeout(async () => {
        try {
          await fetchRounds(); await sleep(300);
          if (wallet.publicKey && currentRoundRef.current) await fetchUserBids(currentRoundRef.current);
        } catch { /* ignore */ }
        finally { subscriptionRefreshQueued.current = false; }
      }, 800);
    };
    try {
      const pda = new PublicKey(currentRound.pda);
      (async () => {
        try { subId = await connection.onAccountChange(pda, onChange, 'confirmed'); } catch (e) { console.error(e); }
      })();
    } catch (err) { console.error(err); }
    return () => {
      if (debounce) clearTimeout(debounce);
      if (subId !== null) { try { connection.removeAccountChangeListener(subId); } catch { /* ignore */ } }
    };
  }, [connection, currentRound, fetchRounds, fetchUserBids, wallet.publicKey]);

  // ── validateBid ────────────────────────────────────────────────────────────
  const validateBid = useCallback((team: TeamName, amountUi: number): string | null => {
    if (!wallet.publicKey) return 'Connect your wallet first.';
    if (!currentRound) return 'No active round found.';
    if (currentRound.settled) return 'This round has already settled.';
    if (!amountUi || isNaN(amountUi) || amountUi <= 0) return 'Enter a valid amount.';
    const bal = team === 'MESSI' ? tokenBalances.messi : tokenBalances.ronaldo;
    if (amountUi > bal) return `Insufficient balance. You have ${bal.toFixed(2)} ${team} tokens.`;
    if (solBalance < 0.01) return `Need >=0.01 SOL for fees (have ${solBalance.toFixed(4)}).`;
    if (toRawAmount(amountUi, team) < 1) return 'Amount too small after decimal conversion.';
    return null;
  }, [wallet.publicKey, currentRound, tokenBalances, solBalance]);

  // ── depositBid ─────────────────────────────────────────────────────────────
  const depositBid = useCallback(async (team: TeamName, amountUi: number) => {
    if (!program || !wallet.publicKey || !currentRound || !mintsReady) return;
    const err = validateBid(team, amountUi);
    if (err) { setTxStatus({ type: 'error', msg: err }); return; }

    const mint = team === 'MESSI' ? MINT_A! : MINT_B!;
    const escrow = new PublicKey(team === 'MESSI' ? currentRound.escrowA : currentRound.escrowB);
    const bidderAta = getAssociatedTokenAddress(wallet.publicKey as PublicKey, mint);
    const bidPda = getBidPDA(currentRound.roundNumber, wallet.publicKey as PublicKey, mint);
    const roundPda = new PublicKey(currentRound.pda);
    const TOKEN_2022 = new PublicKey(TOKEN_PROGRAM_ID_STR);

    setTxStatus({ type: 'pending', msg: 'Waiting for wallet approval...' });
    try {
      const tx = await program.methods
        .depositBid(new BN(toRawAmount(amountUi, team)))
        .accounts({
          round: roundPda,
          bidder: wallet.publicKey as PublicKey,
          bidderAta,
          mint,
          escrow,
          bid: bidPda,
          tokenProgram: TOKEN_2022,
          systemProgram: SystemProgram.programId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc({ commitment: 'confirmed' });
      setTxStatus({ type: 'success', msg: `Bid placed! TX: ${tx.slice(0, 8)}...` });
      await fetchRounds(); await sleep(300); await fetchUserBids(currentRoundRef.current); await sleep(300); await fetchBalances();
    } catch (err) {
      console.error('Full error:', err);
      if (err && typeof err === 'object' && 'getLogs' in err) {
        const logs = await (err as { getLogs: () => Promise<string[]> }).getLogs();
        console.error('Transaction logs:', logs);
      }
      const raw = err instanceof Error ? err.message : String(err);
      let msg = 'Transaction failed.';
      if (raw.includes('0x1')) msg = 'Insufficient token balance on-chain.';
      else if (raw.includes('already in use')) msg = 'Bid updated successfully.';
      else if (raw.includes('User rejected')) msg = 'Transaction cancelled.';
      else if (raw.toLowerCase().includes('blockhash')) msg = 'Transaction expired — please try again.';
      else msg = raw.length < 120 ? raw : 'Transaction failed. Check console.';
      setTxStatus({ type: 'error', msg });
    }
  }, [program, wallet.publicKey, currentRound, mintsReady, validateBid, fetchRounds, fetchUserBids, fetchBalances]);
  // ── claimReturn (single) ───────────────────────────────────────────────────
  const claimReturn = useCallback(async (roundNumber: number, team: TeamName) => {
    if (!program || !wallet.publicKey || !mintsReady) return;
    const round = rounds.find((r) => r.roundNumber === roundNumber);
    if (!round?.settled) { setTxStatus({ type: 'error', msg: 'Round not settled yet.' }); return; }

    const secsLeft = claimUnlockSecondsLeft(round, currentTime);
    if (secsLeft > 0) { setTxStatus({ type: 'error', msg: `Claims unlock in ~${Math.ceil(secsLeft / 60)} min.` }); return; }
    if (solBalance < 0.005) { setTxStatus({ type: 'error', msg: `Need ~0.005 SOL (have ${solBalance.toFixed(4)}).` }); return; }

    const mint = team === 'MESSI' ? MINT_A! : MINT_B!;
    const escrow = new PublicKey(team === 'MESSI' ? round.escrowA : round.escrowB);
    const bidderAta = getAssociatedTokenAddress(wallet.publicKey as PublicKey, mint);
    const bidPda = getBidPDA(roundNumber, wallet.publicKey as PublicKey, mint);

    setTxStatus({ type: 'pending', msg: 'Claiming...' });
    try {
      const tx = await program.methods.claimReturn()
        .accounts({
          round: getRoundPDA(roundNumber), escrow, bidder: wallet.publicKey as PublicKey, bidderAta, mint, bid: bidPda,
          tokenProgram: new PublicKey(TOKEN_PROGRAM_ID_STR),
        })
        .rpc({ commitment: 'confirmed' });
      setTxStatus({ type: 'success', msg: `Claimed! TX: ${tx.slice(0, 8)}...` });
      await fetchRounds(); await sleep(300); await fetchUserBids(currentRoundRef.current); await sleep(300); await fetchBalances();
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      let msg = 'Claim failed.';
      if (raw.includes('AlreadyClaimed') || raw.includes('0x1770')) msg = 'Already claimed.';
      else if (raw.includes('ClaimTooEarly')) msg = 'Claims not yet open.';
      else if (raw.includes('NotWinningMint')) msg = round.isLegacy
        ? 'Only winners can claim on legacy rounds.'
        : 'Not on the winning side for this round.';
      else if (raw.includes('User rejected')) msg = 'Cancelled.';
      else msg = raw.length < 120 ? raw : 'Claim failed. Check console.';
      setTxStatus({ type: 'error', msg });
    }
  }, [program, wallet.publicKey, mintsReady, rounds, solBalance, currentTime, fetchRounds, fetchUserBids, fetchBalances]);

  // ── _buildRoundInstructions ────────────────────────────────────────────────
  // Shared helper: builds all claimable instructions for one round.
  const _buildRoundInstructions = useCallback(async (
    round: RoundState,
  ): Promise<import('@solana/web3.js').TransactionInstruction[]> => {
    if (!program || !wallet.publicKey) return [];

    const instructions: import('@solana/web3.js').TransactionInstruction[] = [];
    const TOKEN_PROGRAM = new PublicKey(TOKEN_PROGRAM_ID_STR);
    const roundPda = getRoundPDA(round.roundNumber);
    const winnerMint = new PublicKey(round.winnerTeam === 1 ? round.mintA : round.mintB);
    const loserMint = new PublicKey(round.winnerTeam === 1 ? round.mintB : round.mintA);
    const escrowA = new PublicKey(round.escrowA);
    const escrowB = new PublicKey(round.escrowB);
    const myKey = wallet.publicKey!.toBase58();

    // ── 1. claimReturn for both MESSI and RONALDO bids ─────────────────────
    for (const mintPk of [new PublicKey(round.mintA), new PublicKey(round.mintB)]) {
      const bidPda = getBidPDA(round.roundNumber, wallet.publicKey!, mintPk);
      let bid: BidAccountData | null = null;
      try { bid = await program.account.bid.fetch(bidPda); } catch { continue; }
      if (!bid || bid.amount.toString() === '0') continue;

      const isWinner = mintPk.toBase58() === winnerMint.toBase58();
      const escrow = new PublicKey(isWinner
        ? (round.winnerTeam === 1 ? round.escrowA : round.escrowB)
        : (round.winnerTeam === 1 ? round.escrowB : round.escrowA));
      const bidderAta = getAssociatedTokenAddress(wallet.publicKey!, mintPk);

      // Legacy: winners only
      if (round.isLegacy) {
        if (!isWinner || bid.claimedReturn) continue;
        try {
          instructions.push(await program.methods.claimReturn()
            .accounts({
              round: roundPda, escrow, bidder: wallet.publicKey!, bidderAta, mint: mintPk, bid: bidPda,
              tokenProgram: TOKEN_PROGRAM
            })
            .instruction());
        } catch (e) { console.warn(`claimReturn (legacy) failed round ${round.roundNumber}`, e); }
        continue;
      }

      // New: everyone gets claimReturn
      if (!bid.claimedReturn) {
        try {
          instructions.push(await program.methods.claimReturn()
            .accounts({
              round: roundPda, escrow, bidder: wallet.publicKey!, bidderAta, mint: mintPk, bid: bidPda,
              tokenProgram: TOKEN_PROGRAM
            })
            .instruction());
        } catch (e) { console.warn(`claimReturn failed round ${round.roundNumber}`, e); }
      }

      // claimProportional — winning side, not highest/random
      if (isWinner && !bid.claimedPrize && round.proportionalRewardAmount !== '0') {
        // Prop exclusion: exclude winning-side highest bidder and random winner only.
        // (Losing-side highest bidder won't reach here since isWinner is false for them.)
        const winHighest = round.winnerTeam === 1 ? round.highestBidA : round.highestBidB;
        const isHighest = myKey === winHighest;
        const isRandom = myKey === round.randomWinner;
        if (!isHighest && !isRandom) {
          const loserAta = getAssociatedTokenAddress(wallet.publicKey!, loserMint);
          try {
            instructions.push(await program.methods.claimProportional()
              .accounts({
                round: roundPda, escrowA, escrowB, bidder: wallet.publicKey!, bidderAta: loserAta,
                mint: mintPk, bid: bidPda,
                mintA: new PublicKey(round.mintA),
                mintB: new PublicKey(round.mintB),
                tokenProgram: TOKEN_PROGRAM
              })
              .instruction());
          } catch (e) { console.warn(`claimProportional failed round ${round.roundNumber}`, e); }
        }
      }
    }

    if (round.isLegacy) return instructions; // legacy has no highest/random claims

    // ── 2. claimHighestBidder ───────────────────────────────────────────────
    // Only the WINNING side's highest bidder is eligible — not the losing side's.
    const winningHighestBidder = round.winnerTeam === 1 ? round.highestBidA : round.highestBidB;
    const isHighestBidder = myKey === winningHighestBidder;
    if (isHighestBidder && !round.claimedHighest && round.highestBidderRewardAmount !== '0') {
      const loserAta = getAssociatedTokenAddress(wallet.publicKey!, loserMint);
      try {
        instructions.push(await program.methods.claimHighestBidder()
          .accounts({
            round: roundPda, escrowA, escrowB, bidder: wallet.publicKey!, bidderAta: loserAta,
            mintA: new PublicKey(round.mintA),
            mintB: new PublicKey(round.mintB),
            tokenProgram: TOKEN_PROGRAM
          })
          .instruction());
      } catch (e) { console.warn(`claimHighestBidder failed round ${round.roundNumber}`, e); }
    }

    // ── 3. claimRandomWinner ────────────────────────────────────────────────
    const isRandomWinner = myKey === round.randomWinner;
    if (isRandomWinner && !round.claimedRandom && round.randomRewardFilled && round.randomRewardAmount !== '0') {
      const loserAta = getAssociatedTokenAddress(wallet.publicKey!, loserMint);
      try {
        instructions.push(await program.methods.claimRandomWinner()
          .accounts({
            round: roundPda, escrowA, escrowB, bidder: wallet.publicKey!, bidderAta: loserAta,
            mintA: new PublicKey(round.mintA),
            mintB: new PublicKey(round.mintB),
            tokenProgram: TOKEN_PROGRAM
          })
          .instruction());
      } catch (e) { console.warn(`claimRandomWinner failed round ${round.roundNumber}`, e); }
    }

    return instructions;
  }, [program, wallet.publicKey]);

  // ── _sendInstructions ──────────────────────────────────────────────────────
  const _sendInstructions = useCallback(async (
    instructions: import('@solana/web3.js').TransactionInstruction[],
    successMsg: string,
  ) => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    const msg = new TransactionMessage({ payerKey: wallet.publicKey!, recentBlockhash: blockhash, instructions }).compileToV0Message();
    const vTx = new VersionedTransaction(msg);
    const signed = await wallet.signTransaction(vTx);
    const sig = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'confirmed');
    setTxStatus({ type: 'success', msg: `${successMsg} TX: ${sig.slice(0, 8)}...` });
    await fetchRounds(); await sleep(300); await fetchUserBids(currentRoundRef.current); await sleep(300); await fetchBalances();
  }, [wallet, connection, fetchRounds, fetchUserBids, fetchBalances]);

  // ── claimRound ─────────────────────────────────────────────────────────────
  // Batches ALL claimable rewards for a single round into one tx:
  //   • claimReturn           (bid return — winners 100%, losers 50%)
  //   • claimProportional     (if eligible)
  //   • claimHighestBidder    (if this wallet was the top bidder)
  //   • claimRandomWinner     (if this wallet was the random winner)
  const claimRound = useCallback(async (roundNumber: number) => {
    if (!program || !wallet.publicKey || !mintsReady || !wallet.signTransaction) return;

    const round = rounds.find((r) => r.roundNumber === roundNumber);
    if (!round?.settled) { setTxStatus({ type: 'error', msg: 'Round not settled.' }); return; }

    const secsLeft = claimUnlockSecondsLeft(round, currentTime);
    if (secsLeft > 0) {
      setTxStatus({ type: 'error', msg: `Claims unlock in ~${Math.ceil(secsLeft / 60)} min.` });
      return;
    }

    setTxStatus({ type: 'pending', msg: `Building claim for round #${roundNumber}...` });

    try {
      const instructions = await _buildRoundInstructions(round);
      if (!instructions.length) {
        setTxStatus({ type: 'error', msg: 'Nothing to claim for this round.' });
        return;
      }
      setTxStatus({ type: 'pending', msg: `Sending ${instructions.length} instruction${instructions.length !== 1 ? 's' : ''}...` });
      await _sendInstructions(instructions, `Round #${roundNumber} claimed!`);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      let msg = 'Claim failed.';
      if (raw.includes('ClaimTooEarly')) msg = 'Claims not yet open.';
      else if (raw.includes('User rejected') || raw.includes('cancelled')) msg = 'Transaction cancelled.';
      else if (raw.toLowerCase().includes('blockhash')) msg = 'Transaction expired — try again.';
      else msg = raw.length < 150 ? raw : 'Claim failed. Check console.';
      setTxStatus({ type: 'error', msg });
    }
  }, [program, wallet, mintsReady, rounds, currentTime, _buildRoundInstructions, _sendInstructions]);

  // ── claimAll ───────────────────────────────────────────────────────────────
  // Batches ALL claimable rewards across ALL unlocked settled rounds.
  const claimAll = useCallback(async () => {
    if (!program || !wallet.publicKey || !mintsReady || !wallet.signTransaction) return;

    const unlocked = rounds.filter((r) => r.settled && claimUnlockSecondsLeft(r, currentTime) === 0);
    if (!unlocked.length) { setTxStatus({ type: 'error', msg: 'No unlocked claims available.' }); return; }

    setTxStatus({ type: 'pending', msg: 'Scanning claimable rounds...' });

    try {
      const allInstructions: import('@solana/web3.js').TransactionInstruction[] = [];
      for (const round of unlocked) {
        const ixs = await _buildRoundInstructions(round);
        allInstructions.push(...ixs);
      }

      if (!allInstructions.length) {
        setTxStatus({ type: 'error', msg: 'Nothing to claim — all rewards already collected.' });
        return;
      }

      setTxStatus({ type: 'pending', msg: `Sending ${allInstructions.length} instruction${allInstructions.length !== 1 ? 's' : ''}...` });
      await _sendInstructions(allInstructions, 'All claimed!');
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      let msg = 'Batch claim failed.';
      if (raw.includes('ClaimTooEarly')) msg = 'Some claims not yet unlocked.';
      else if (raw.includes('User rejected') || raw.includes('cancelled')) msg = 'Transaction cancelled.';
      else if (raw.toLowerCase().includes('blockhash')) msg = 'Transaction expired — try again.';
      else msg = raw.length < 150 ? raw : 'Batch claim failed. Check console.';
      setTxStatus({ type: 'error', msg });
    }
  }, [program, wallet, mintsReady, rounds, currentTime, _buildRoundInstructions, _sendInstructions]);

  const dismissTxStatus = useCallback(() => setTxStatus(null), []);

  return {
    program, currentRound, rounds,
    userBids, solBalance, tokenBalances, txStatus,
    depositBid, claimReturn, claimRound, claimAll,
    dismissTxStatus, refresh: fetchRounds,
    networkTime, currentTime, validateBid,
  };
}