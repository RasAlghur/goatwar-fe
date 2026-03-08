// src/utils/program.ts
import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID, MINT_A_DECIMALS, MINT_B_DECIMALS } from './constants';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

// ── Decimal helpers ───────────────────────────────────────────────────────────
// Parse env decimals safely, falling back to 9 (standard SPL default)
export const DECIMALS_A: number = Number(MINT_A_DECIMALS ?? 9);
export const DECIMALS_B: number = Number(MINT_B_DECIMALS ?? 9);

/** Return the correct decimal count for a given team side */
export function getDecimals(side: 'A' | 'B' | 'MESSI' | 'RONALDO'): number {
  return side === 'A' || side === 'MESSI' ? DECIMALS_A : DECIMALS_B;
}

/** Convert a UI amount to raw integer units for a given side */
export function toRawAmount(amountUi: number, side: 'A' | 'B' | 'MESSI' | 'RONALDO'): number {
  return Math.floor(amountUi * Math.pow(10, getDecimals(side)));
}

/** Convert raw integer units back to a UI amount for a given side */
export function toUiAmount(rawAmount: number | string | bigint, side: 'A' | 'B' | 'MESSI' | 'RONALDO'): number {
  return Number(rawAmount) / Math.pow(10, getDecimals(side));
}

// ── PDA helpers ───────────────────────────────────────────────────────────────
export function getRoundPDA(roundNumber: string | number | bigint | boolean) {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('round'),
      Buffer.from(new BigUint64Array([BigInt(roundNumber)]).buffer),
    ],
    PROGRAM_ID
  );
  return pda;
}

export function getBidPDA(
  roundNumber: string | number | bigint | boolean,
  bidder: PublicKey | null,
  mint: { toBuffer: () => Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike> },
) {
  if (!bidder) throw new Error('Bidder cannot be null');
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('bid'),
      Buffer.from(new BigUint64Array([BigInt(roundNumber)]).buffer),
      bidder.toBuffer(),
      mint.toBuffer(),
    ],
    PROGRAM_ID
  );
  return pda;
}

export function getAssociatedTokenAddress(
  owner: { toBuffer: () => Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike> },
  mint:  { toBuffer: () => Buffer<ArrayBufferLike> | Uint8Array<ArrayBufferLike> },
) {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), mint.toBuffer()],  // <-- changed
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}

// ── Formatting ────────────────────────────────────────────────────────────────
/**
 * Format a raw on-chain amount for display.
 * Pass `side` to use the correct per-mint decimals automatically.
 * Fallback: pass explicit `decimals` (legacy behaviour).
 */
export function formatAmount(
  rawAmount: string | number | bigint | null | undefined,
  decimalsOrSide: number | 'A' | 'B' | 'MESSI' | 'RONALDO' = DECIMALS_A,
): string {
  if (!rawAmount) return '0';
  const decimals =
    typeof decimalsOrSide === 'number' ? decimalsOrSide : getDecimals(decimalsOrSide);
  const n = Number(rawAmount) / Math.pow(10, decimals);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(2);
}

export function formatAddress(address: string) {
  if (!address) return '';
  const s = address.toString();
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}

export function getPhase(round: { startTs: number; endTs: number } | null, now: number) {
  if (!round) return { phase: 'break', timeLeft: 0 };
  if (now >= round.startTs && now < round.endTs) {
    return { phase: 'active', timeLeft: round.endTs - now };
  }
  if (now >= round.endTs) {
    return { phase: 'ended', timeLeft: 0 };
  }
  return { phase: 'waiting', timeLeft: round.startTs - now };
}

export function formatCountdown(seconds: number) {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

export function getWinningTeam(round: { settled: boolean | null | undefined; winnerTeam: number }) {
  if (!round || !round.settled) return null;
  return round.winnerTeam === 1 ? 'MESSI' : 'RONALDO';
}

export function calcPoolPercentage(
  totalA: string | number | null | undefined,
  totalB: string | number | null | undefined,
  side: string,
) {
  const a = Number(totalA || 0);
  const b = Number(totalB || 0);
  const total = a + b;
  if (total === 0) return 50;
  return side === 'A' ? Math.round((a / total) * 100) : Math.round((b / total) * 100);
}