// src/utils/constants.ts
import { PublicKey, clusterApiUrl } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROGRAM_ID);
export const NETWORK = import.meta.env.VITE_SERVER;
export const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT || clusterApiUrl('devnet');
export const MINT_A_DECIMALS = import.meta.env.VITE_MESSI_MINT_DECIMALS;
export const MINT_B_DECIMALS = import.meta.env.VITE_RONALDO_MINT_DECIMALS;

function parseMint(val: string | undefined): PublicKey | null {
  try {
    if (!val || val.length < 32) return null;
    return new PublicKey(val);
  } catch { return null; }
}

export const MINT_A: PublicKey | null = parseMint(import.meta.env.VITE_MESSI_MINT);
export const MINT_B: PublicKey | null = parseMint(import.meta.env.VITE_RONALDO_MINT);

// Keep initMints as a no-op for backward compat — mints are now eager
export function initMints(): boolean {
  return MINT_A !== null && MINT_B !== null;
}

export const TEAM = {
  MESSI:   { id: 1, name: 'MESSI',   color: '#3B82F6', colorDark: '#1D4ED8', accent: '#60A5FA', glow: 'rgba(59,130,246,0.4)', flag: '🇦🇷' },
  RONALDO: { id: 2, name: 'RONALDO', color: '#EF4444', colorDark: '#B91C1C', accent: '#F87171', glow: 'rgba(239,68,68,0.4)', flag: '🇵🇹' },
};

export type TeamName = 'MESSI' | 'RONALDO';
