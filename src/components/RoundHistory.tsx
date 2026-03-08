// src/components/RoundHistory.tsx
import { formatAmount, formatAddress } from '../utils/program';
import styles from './RoundHistory.module.css';

interface RoundState {
  roundNumber: number;
  startTs: number;
  endTs: number;
  settledAt: number;
  settled: boolean;
  winnerTeam: number;
  totalA: string;
  totalB: string;
  highestBidA: string;
  highestBidAAmount: string;
  highestBidB: string;
  highestBidBAmount: string;
  highestBidderRewardAmount: string;
  claimedHighest: boolean;
  proportionalRewardAmount: string;
  randomRewardAmount: string;
  randomRewardFilled: boolean;
  randomWinner: string;
  claimedRandom: boolean;
  isLegacy: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTs(ts: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  });
}

function StatusBadge({ round, now }: { round: RoundState; now: number }) {
  if (round.settled)
    return <span className={`${styles.badge} ${styles.settled}`}>✓ Settled</span>;
  if (now >= round.startTs && now < round.endTs)
    return <span className={`${styles.badge} ${styles.live}`}><span className={styles.dot} />Live</span>;
  if (now >= round.endTs)
    return <span className={`${styles.badge} ${styles.pending}`}>⏳ Pending</span>;
  return <span className={`${styles.badge} ${styles.upcoming}`}>Upcoming</span>;
}

// Derive top-bidder reward if not stored (legacy rounds)
function getHighestReward(round: RoundState): string {
  if (round.highestBidderRewardAmount && round.highestBidderRewardAmount !== '0')
    return round.highestBidderRewardAmount;
  // Estimate from losing pool for display
  const totalA = BigInt(round.totalA || '0');
  const totalB = BigInt(round.totalB || '0');
  const losing = round.winnerTeam === 1 ? totalB : totalA;
  if (!losing) return '0';
  return (losing / BigInt(2) * BigInt(20) / BigInt(100)).toString();
}

function getPropReward(round: RoundState): string {
  if (round.proportionalRewardAmount && round.proportionalRewardAmount !== '0')
    return round.proportionalRewardAmount;
  const totalA = BigInt(round.totalA || '0');
  const totalB = BigInt(round.totalB || '0');
  const losing = round.winnerTeam === 1 ? totalB : totalA;
  if (!losing) return '0';
  return (losing / BigInt(2) * BigInt(50) / BigInt(100)).toString();
}

function PoolCell({ totalA, totalB }: { totalA: string; totalB: string }) {
  const a   = BigInt(totalA || '0');
  const b   = BigInt(totalB || '0');
  const tot = a + b;
  const pct = tot > 0 ? Number((a * BigInt(100)) / tot) : 50;

  return (
    <div className={styles.poolCell}>
      <div className={styles.poolAmounts}>
        <span className={styles.amtA}> {formatAmount(totalA)} </span>
        <span className={styles.poolSep}> / </span>
        <span className={styles.amtB}>{formatAmount(totalB)}</span>
      </div>
      <div className={styles.poolBar}>
        <div className={styles.poolA} style={{ width: `${pct}%` }} />
        <div className={styles.poolB} style={{ width: `${100 - pct}%` }} />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RoundHistory({ rounds }: { rounds: RoundState[] }) {
  // eslint-disable-next-line react-hooks/purity
  const now = Math.floor(Date.now() / 1000);

  if (!rounds || rounds.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📋</span>
        <p>No rounds found on-chain yet.</p>
      </div>
    );
  }

  const sorted = [...rounds].sort((a, b) => b.roundNumber - a.roundNumber);
  const SYS    = '11111111111111111111111111111111';

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Round</th>
              <th>Date</th>
              <th>MESSI / RONALDO Pool</th>
              <th>Winner</th>
              <th className={styles.rewardCol}>👑 Top Bidder <span className={styles.pct}>20%</span></th>
              <th className={styles.rewardCol}>📊 Prop. Share <span className={styles.pct}>50%</span></th>
              <th className={styles.rewardCol}>🎲 Random <span className={styles.pct}>10%</span></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const winnerColor = r.winnerTeam === 1 ? 'var(--messi-blue)' : 'var(--ronaldo-red)';
              const winnerLabel = r.winnerTeam === 1 ? '🇦🇷 MESSI' : '🇵🇹 RONALDO';
              const loserTeam   = r.winnerTeam === 1 ? 'RONALDO' : 'MESSI';
              const topBidder   = r.winnerTeam === 1 ? r.highestBidA : r.highestBidB;

              return (
                <tr key={r.roundNumber} className={styles.row}>

                  {/* Round # + status */}
                  <td>
                    <div className={styles.roundCell}>
                      <span className={styles.roundNum}>#{r.roundNumber}</span>
                      <StatusBadge round={r} now={now} />
                    </div>
                  </td>

                  {/* Date */}
                  <td className={styles.dateCell}>{formatTs(r.startTs)}</td>

                  {/* Pool split */}
                  <td><PoolCell totalA={r.totalA} totalB={r.totalB} /></td>

                  {/* Winner */}
                  <td>
                    {r.settled
                      ? <span className={styles.winner} style={{ color: winnerColor }}>🏆 {winnerLabel}</span>
                      : <span className={styles.dash}>—</span>}
                  </td>

                  {/* Top bidder reward (20%) */}
                  <td>
                    {r.settled ? (
                      <div className={styles.rewardCell}>
                        <span className={`${styles.rewardAmt} ${r.claimedHighest ? styles.claimed : ''}`}>
                          {formatAmount(getHighestReward(r))} {loserTeam}
                        </span>
                        {topBidder && topBidder !== SYS && (
                          <span className={styles.rewardAddr}>{formatAddress(topBidder)}</span>
                        )}
                        {r.claimedHighest && <span className={styles.claimedTag}>claimed</span>}
                      </div>
                    ) : <span className={styles.dash}>—</span>}
                  </td>

                  {/* Proportional pot (50%) */}
                  <td>
                    {r.settled ? (
                      <span className={styles.rewardAmt}>
                        {formatAmount(getPropReward(r))} {loserTeam}
                      </span>
                    ) : <span className={styles.dash}>—</span>}
                  </td>

                  {/* Random winner (10%) */}
                  <td>
                    {r.settled ? (
                      <div className={styles.rewardCell}>
                        <span className={`${styles.rewardAmt} ${r.claimedRandom ? styles.claimed : ''}`}>
                          {formatAmount(r.randomRewardAmount)} {loserTeam}
                        </span>
                        {r.randomRewardFilled && r.randomWinner && r.randomWinner !== SYS && (
                          <span className={styles.rewardAddr}>{formatAddress(r.randomWinner)}</span>
                        )}
                        {!r.randomRewardFilled && <span className={styles.pendingTag}>selecting...</span>}
                        {r.claimedRandom && <span className={styles.claimedTag}>claimed</span>}
                      </div>
                    ) : <span className={styles.dash}>—</span>}
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