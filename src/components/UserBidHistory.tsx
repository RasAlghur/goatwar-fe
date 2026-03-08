// src/components/UserBidHistory.tsx
import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { MINT_A, MINT_B } from '../utils/constants';
import { getBidPDA, formatAmount, formatAddress } from '../utils/program';
import type { RoundState } from '../hooks/useGame';
import styles from './UserBidHistory.module.css';

interface BidSummary {
  team: 'MESSI' | 'RONALDO';
  amount: string;
}

interface RoundBidEntry {
  round: RoundState;
  bids: BidSummary[];
}

function decodeBid(data: Buffer): { amount: string } | null {
  try {
    // Bid struct after 8-byte discriminator:
    //   bidder  Pubkey 32  →  skip
    //   amount  u128   16  →  read
    let off = 8;
    off += 32; // bidder
    const ab = data.slice(off, off + 16);
    const dv = new DataView(ab.buffer, ab.byteOffset, 16);
    const amount = (dv.getBigUint64(0, true) + (dv.getBigUint64(8, true) << BigInt(64))).toString();
    return { amount };
  } catch { return null; }
}

function formatTs(ts: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function UserBidHistory({ rounds }: { rounds: RoundState[] }) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [entries, setEntries] = useState<RoundBidEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const scan = useCallback(async () => {
    if (!publicKey || !connection || !rounds.length || !MINT_A || !MINT_B) return;
    setLoading(true);

    type Meta = { round: RoundState; mint: PublicKey; team: 'MESSI' | 'RONALDO'; pda: PublicKey };
    const metas: Meta[] = [];
    for (const round of rounds) {
      metas.push({ round, mint: MINT_A, team: 'MESSI',   pda: getBidPDA(round.roundNumber, publicKey, MINT_A) });
      metas.push({ round, mint: MINT_B, team: 'RONALDO', pda: getBidPDA(round.roundNumber, publicKey, MINT_B) });
    }

    let infos: (import('@solana/web3.js').AccountInfo<Buffer> | null)[];
    try {
      infos = await connection.getMultipleAccountsInfo(
        metas.map(m => m.pda), 'confirmed',
      ) as (import('@solana/web3.js').AccountInfo<Buffer> | null)[];
    } catch (e) {
      console.warn('[UserBidHistory] fetch failed', e);
      setLoading(false);
      return;
    }

    const roundMap = new Map<number, RoundBidEntry>();
    for (let i = 0; i < metas.length; i++) {
      const info = infos[i];
      if (!info) continue;
      const { round, team } = metas[i];
      const bid = decodeBid(Buffer.from(info.data));
      if (!bid || bid.amount === '0') continue;
      if (!roundMap.has(round.roundNumber)) roundMap.set(round.roundNumber, { round, bids: [] });
      roundMap.get(round.roundNumber)!.bids.push({ team, amount: bid.amount });
    }

    setEntries(
      Array.from(roundMap.values()).sort((a, b) => b.round.roundNumber - a.round.roundNumber)
    );
    setLoading(false);
  }, [publicKey, connection, rounds]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => { if (!cancelled) await scan(); };
    run();
    return () => { cancelled = true; };
  }, [scan]);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!publicKey) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>👤</div>
        <p>Connect your wallet to see your bid history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Loading bid history...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <p>No bids found for {formatAddress(publicKey.toString())}</p>
        <span className={styles.emptyHint}>Place a bid during an active round to see history here</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Round</th>
              <th>Date</th>
              <th>🇦🇷 MESSI Bid</th>
              <th>🇵🇹 RONALDO Bid</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ round, bids }) => {
              const messiBid   = bids.find(b => b.team === 'MESSI');
              const ronaldoBid = bids.find(b => b.team === 'RONALDO');
              const winnerLabel = !round.settled       ? '⏳ Live'
                : round.winnerTeam === 1               ? '🇦🇷 MESSI'
                : round.winnerTeam === 2               ? '🇵🇹 RONALDO'
                :                                        '—';
              const winnerColor = !round.settled       ? 'rgba(255,255,255,0.4)'
                : round.winnerTeam === 1               ? 'var(--messi-blue)'
                : round.winnerTeam === 2               ? 'var(--ronaldo-red)'
                :                                        'rgba(255,255,255,0.3)';

              return (
                <tr key={round.roundNumber} className={styles.row}>
                  <td><span className={styles.roundNum}>#{round.roundNumber}</span></td>
                  <td className={styles.dateCell}>{formatTs(round.startTs)}</td>
                  <td>
                    {messiBid
                      ? <span className={styles.amountBlue}>{formatAmount(messiBid.amount, 'MESSI')}</span>
                      : <span className={styles.dash}>—</span>}
                  </td>
                  <td>
                    {ronaldoBid
                      ? <span className={styles.amountRed}>{formatAmount(ronaldoBid.amount, 'RONALDO')}</span>
                      : <span className={styles.dash}>—</span>}
                  </td>
                  <td>
                    <span className={styles.winnerLabel} style={{ color: winnerColor }}>
                      {winnerLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}