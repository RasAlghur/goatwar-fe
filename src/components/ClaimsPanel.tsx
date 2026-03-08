// src/components/ClaimsPanel.tsx
import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { MINT_A, MINT_B, type TeamName } from '../utils/constants';
import styles from './ClaimsPanel.module.css';
import { getBidPDA, formatAmount, formatAddress } from '../utils/program';
import { CLAIM_DELAY_SECS, claimUnlockSecondsLeft } from '../hooks/useGame';
import type { RoundState } from '../hooks/useGame';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AnchorProgram {
  account: {
    bid: {
      fetch: (pda: PublicKey) => Promise<{
        claimedReturn: boolean;
        claimedPrize: boolean;
        amount: { toString: () => string };
      }>;
    };
  };
}

type ClaimType = 'return' | 'proportional' | 'highest_bidder' | 'random_winner';

interface ClaimItem {
  roundNumber: number;
  team: TeamName | null;
  claimableAmount: string;
  bidAmount: string;
  side: 'winner' | 'loser';
  claimType: ClaimType;
  secsLeft: number;
  round: RoundState;
  claimed: boolean; // true = history entry, false = pending
}

interface RoundClaimGroup {
  round: RoundState;
  items: ClaimItem[];
  secsLeft: number;
  allClaimed: boolean;
}

interface TxStatus {
  type: 'pending' | 'success' | 'error';
  message?: string;
}

interface ClaimsPanelProps {
  rounds: RoundState[];
  program: AnchorProgram | null;
  onClaimRound: (roundNumber: number) => void;
  onClaimAll: () => void;
  txStatus: TxStatus | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function decodeBidAccount(data: Buffer): {
  amount: string; claimedReturn: boolean; claimedPrize: boolean;
} | null {
  try {
    let off = 8;
    off += 32; // bidder
    const amountBytes = data.slice(off, off + 16); off += 16;
    const dv = new DataView(amountBytes.buffer, amountBytes.byteOffset, 16);
    const amount = (dv.getBigUint64(0, true) + (dv.getBigUint64(8, true) << BigInt(64))).toString();
    off += 32; // mint
    const claimedReturn = data[off++] === 1;
    const claimedPrize = data[off++] === 1;
    return { amount, claimedReturn, claimedPrize };
  } catch { return null; }
}

function calcPropShare(
  bidAmount: string,
  propRewardAmount: string,
  propWinningTotal: string,
  propExcludedAmount: string,
): string {
  try {
    const bid = BigInt(bidAmount);
    const reward = BigInt(propRewardAmount);
    const denom = BigInt(propWinningTotal) - BigInt(propExcludedAmount);
    if (denom <= BigInt(0) || bid <= BigInt(0)) return '0';
    return ((bid * reward) / denom).toString();
  } catch { return '0'; }
}

function Countdown({ secsLeft }: { secsLeft: number }) {
  const h = Math.floor(secsLeft / 3600);
  const m = Math.floor((secsLeft % 3600) / 60);
  const s = secsLeft % 60;
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  return <span className={styles.lockBadge}>🔒 {label}</span>;
}

const CLAIM_TYPE_LABEL: Record<ClaimType, string> = {
  return: '',
  proportional: '📊 Prop. share',
  highest_bidder: '👑 Top bidder reward',
  random_winner: '🎲 Random winner reward',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function ClaimsPanel({
  rounds,
  onClaimRound,
  onClaimAll,
  txStatus,
}: ClaimsPanelProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [claimable, setClaimable] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const scanClaims = useCallback(async () => {
    if (!publicKey || !connection || !rounds.length) return;
    setLoading(true);
    const found: ClaimItem[] = [];
    const nowSecs = Math.floor(Date.now() / 1000);
    const myKey = publicKey.toBase58();

    const settled = rounds.filter((r) => r.settled);
    if (!settled.length) { setClaimable([]); setLoading(false); return; }

    // ── Bid-level claims ───────────────────────────────────────────────────
    type PdaMeta = { round: RoundState; mint: PublicKey; team: TeamName; pda: PublicKey };
    const metas: PdaMeta[] = [];
    for (const round of settled) {
      for (const { mint, team } of [
        { mint: MINT_A!, team: 'MESSI' as TeamName },
        { mint: MINT_B!, team: 'RONALDO' as TeamName },
      ]) {
        metas.push({ round, mint, team, pda: getBidPDA(round.roundNumber, publicKey, mint) });
      }
    }

    let infos: (import('@solana/web3.js').AccountInfo<Buffer> | null)[];
    try {
      infos = await connection.getMultipleAccountsInfo(
        metas.map((m) => m.pda), 'confirmed',
      ) as (import('@solana/web3.js').AccountInfo<Buffer> | null)[];
    } catch (e) {
      console.warn('[ClaimsPanel] getMultipleAccountsInfo failed', e);
      setLoading(false);
      return;
    }

    for (let i = 0; i < metas.length; i++) {
      const info = infos[i];
      if (!info) continue;
      const { round, mint, team } = metas[i];
      const bid = decodeBidAccount(Buffer.from(info.data));
      if (!bid || bid.amount === '0') continue;

      const winnerMint = new PublicKey(round.winnerTeam === 1 ? round.mintA : round.mintB);
      const isWinner = mint.toBase58() === winnerMint.toBase58();
      const side: 'winner' | 'loser' = isWinner ? 'winner' : 'loser';
      const secsLeft = claimUnlockSecondsLeft(round, nowSecs);

      // ── claimReturn (pending OR history) ──────────────────────────────────
      const hasReturn = round.isLegacy ? isWinner : true;
      if (hasReturn) {
        const claimableAmount = (round.isLegacy || isWinner || round.winnerTeam === 0)
          ? bid.amount
          : (BigInt(bid.amount) / BigInt(2)).toString();

        found.push({
          roundNumber: round.roundNumber,
          team,
          claimableAmount,
          bidAmount: bid.amount,
          side,
          claimType: 'return',
          secsLeft,
          round,
          claimed: bid.claimedReturn,
        });
      }

      if (round.isLegacy) continue;

      // ── claimProportional (pending OR history) ────────────────────────────
      // Only exclude the WINNING side's highest bidder (not the losing side's)
      const winHighest = round.winnerTeam === 1 ? round.highestBidA : round.highestBidB;
      const isHighest = myKey === winHighest;
      const isRandom = myKey === round.randomWinner;

      if (isWinner && round.proportionalRewardAmount !== '0' && !isHighest && !isRandom) {
        const propShare = calcPropShare(
          bid.amount,
          round.proportionalRewardAmount,
          round.proportionalWinningTotal,
          round.proportionalExcludedAmount,
        );
        if (propShare !== '0') {
          found.push({
            roundNumber: round.roundNumber,
            team,
            claimableAmount: propShare,
            bidAmount: bid.amount,
            side: 'winner',
            claimType: 'proportional',
            secsLeft,
            round,
            claimed: bid.claimedPrize,
          });
        }
      }
    }

    // ── Round-level claims (highest bidder + random winner) ────────────────
    for (const round of settled) {
      if (round.isLegacy) continue;
      const secsLeft = claimUnlockSecondsLeft(round, nowSecs);

      // claimHighestBidder
      const winningHighestBidder = round.winnerTeam === 1 ? round.highestBidA : round.highestBidB;
      const isHighestBidder = myKey === winningHighestBidder;
      if (isHighestBidder && round.highestBidderRewardAmount !== '0') {
        found.push({
          roundNumber: round.roundNumber,
          team: null,
          claimableAmount: round.highestBidderRewardAmount,
          bidAmount: round.winnerTeam === 1 ? round.highestBidAAmount : round.highestBidBAmount,
          side: 'winner',
          claimType: 'highest_bidder',
          secsLeft,
          round,
          claimed: round.claimedHighest,
        });
      }

      // claimRandomWinner
      const isRandomWinner = myKey === round.randomWinner;
      if (isRandomWinner && round.randomRewardFilled && round.randomRewardAmount !== '0') {
        found.push({
          roundNumber: round.roundNumber,
          team: null,
          claimableAmount: round.randomRewardAmount,
          bidAmount: '0',
          side: 'winner',
          claimType: 'random_winner',
          secsLeft,
          round,
          claimed: round.claimedRandom,
        });
      }
    }

    setClaimable(found);
    setLoading(false);
  }, [publicKey, connection, rounds]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => { if (!cancelled) await scanClaims(); };
    run();
    return () => { cancelled = true; };
  }, [scanClaims]);

  useEffect(() => {
    const t = setInterval(() => void scanClaims(), 30_000);
    return () => clearInterval(t);
  }, [scanClaims]);

  // ── Split pending vs history ───────────────────────────────────────────────
  const pendingItems = claimable.filter((c) => !c.claimed);
  const historyItems = claimable.filter((c) => c.claimed);

  // Group helper
  function groupByRound(items: ClaimItem[]): RoundClaimGroup[] {
    const map = new Map<number, ClaimItem[]>();
    for (const item of items) {
      if (!map.has(item.roundNumber)) map.set(item.roundNumber, []);
      map.get(item.roundNumber)!.push(item);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([, grpItems]) => ({
        round: grpItems[0].round,
        items: grpItems,
        secsLeft: grpItems[0].secsLeft,
        allClaimed: grpItems.every((it) => it.claimed),
      }));
  }

  const pendingGroups = groupByRound(pendingItems);
  const historyGroups = groupByRound(historyItems);

  // ── Render helpers ─────────────────────────────────────────────────────────
  if (!publicKey) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔒</div>
        <p>Connect your wallet to see claimable rewards</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Scanning rounds for claimable tokens...</span>
      </div>
    );
  }

  const anyUnlocked = pendingItems.some((c) => c.secsLeft === 0);
  const pendingTx = txStatus?.type === 'pending';

  function renderRewardRow(item: ClaimItem, loserTeam: string, idx: number) {
    const isPaidInLoserToken =
      item.claimType === 'proportional' ||
      item.claimType === 'highest_bidder' ||
      item.claimType === 'random_winner';

    const displayTeam = isPaidInLoserToken ? loserTeam : (item.team ?? loserTeam);
    const teamColor = displayTeam === 'MESSI' ? 'var(--messi-blue)' : 'var(--ronaldo-red)';
    const teamFlag = displayTeam === 'MESSI' ? '🇦🇷' : '🇵🇹';
    const teamLabel = displayTeam;

    const typeLabel = item.claimType === 'return'
      ? item.side === 'winner'
        ? '↩ 100% return'
        : `↩ 50% refund (bid: ${formatAmount(item.bidAmount, teamLabel as TeamName)})`
      : CLAIM_TYPE_LABEL[item.claimType];

    return (
      <div
        key={idx}
        className={`${styles.rewardRow} ${item.claimed ? styles.rewardRowClaimed : ''}`}
      >
        <span className={styles.rewardTeam} style={{ color: item.claimed ? undefined : teamColor }}>
          {teamFlag} {teamLabel}
        </span>
        <span className={styles.rewardType}>{typeLabel}</span>
        <span className={styles.rewardAmount}>
          +{formatAmount(item.claimableAmount, teamLabel as TeamName)}
        </span>
      </div>
    );
  }

  function renderRoundCard(
    { round, items, secsLeft, allClaimed }: RoundClaimGroup,
    isHistory: boolean,
  ) {
    const locked = secsLeft > 0;
    const winnerColor = round.winnerTeam === 1 ? 'var(--messi-blue)' : 'var(--ronaldo-red)';
    const winnerLabel = round.winnerTeam === 1 ? '🇦🇷 MESSI' : '🇵🇹 RONALDO';
    const loserTeam = round.winnerTeam === 1 ? 'RONALDO' : 'MESSI';

    return (
      <div
        key={round.roundNumber}
        className={`${styles.roundCard} ${isHistory ? styles.historyClaimed : locked ? styles.locked : styles.unlocked}`}
      >
        {/* Card header */}
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderLeft}>
            <span className={styles.roundLabel}>Round #{round.roundNumber}</span>
            <span className={styles.winnerTag} style={{ color: winnerColor }}>🏆 {winnerLabel}</span>
          </div>
          <div className={styles.cardHeaderRight}>
            {isHistory || allClaimed ? (
              <span className={styles.allClaimedBadge}>✓ All Claimed</span>
            ) : locked ? (
              <Countdown secsLeft={secsLeft} />
            ) : (
              <button
                className={styles.claimRoundBtn}
                onClick={() => onClaimRound(round.roundNumber)}
                disabled={pendingTx}
              >
                {pendingTx ? <span className={styles.btnSpinner} /> : 'Claim Round'}
              </button>
            )}
          </div>
        </div>

        {/* Reward rows */}
        <div className={styles.rewardRows}>
          {items.map((item, idx) => renderRewardRow(item, loserTeam, idx))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>

      {/* ── Pending claims section ── */}
      {pendingItems.length > 0 ? (
        <>
          <div className={styles.topBar}>
            <span className={styles.topBarLabel}>
              {pendingItems.length} pending claim{pendingItems.length !== 1 ? 's' : ''} · {pendingGroups.length} round{pendingGroups.length !== 1 ? 's' : ''}
            </span>
            {anyUnlocked && (
              <button className={styles.claimAllBtn} onClick={onClaimAll} disabled={pendingTx}>
                {pendingTx ? <span className={styles.spinner} /> : '⚡ Claim All'}
              </button>
            )}
          </div>
          <div className={styles.roundList}>
            {pendingGroups.map((g) => renderRoundCard(g, false))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✅</div>
          <p>No pending claims for {formatAddress(publicKey.toString())}</p>
          <span className={styles.emptyHint}>
            Claims open {CLAIM_DELAY_SECS / 60} minutes after settlement
          </span>
        </div>
      )}

      {/* ── Claim history section ── */}
      {historyGroups.length > 0 && (
        <div className={styles.historySection}>
          <button
            className={styles.historyToggle}
            onClick={() => setShowHistory((v) => !v)}
          >
            <span>📜 Claim History</span>
            <span className={styles.historyCount}>{historyItems.length} claim{historyItems.length !== 1 ? 's' : ''}</span>
            <span className={styles.historyChevron}>{showHistory ? '▲' : '▼'}</span>
          </button>

          {showHistory && (
            <div className={styles.roundList}>
              {historyGroups.map((g) => renderRoundCard(g, true))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}