// src/components/CountdownTimer.tsx
import styles from './CountdownTimer.module.css';
import { getPhase, formatCountdown } from '../utils/program';

interface RoundLike {
  startTs: number;
  endTs: number;
}

export default function CountdownTimer({ 
  round, 
  currentTime   // <-- new prop
}: { 
  round: RoundLike | null;
  currentTime: number;
}) {
  const { phase, timeLeft } = getPhase(round || { startTs: 0, endTs: 0 }, currentTime);
  const countdown = formatCountdown(timeLeft);
  const isActive = phase === 'active';

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.phaseBadge} ${isActive ? styles.active : styles.break}`}>
        <span className={styles.phaseDot} />
        <span>{isActive ? 'BIDDING LIVE' : phase === 'waiting' ? 'STARTING SOON' : 'ROUND ENDED'}</span>
      </div>

      <div className={styles.countdownRow}>
        {countdown.split(':').map((unit, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className={`${styles.digitGroup} ${isActive ? styles.digitActive : styles.digitBreak}`}>
              {unit.split('').map((d, j) => (
                <span key={j} className={styles.digit}>{d}</span>
              ))}
            </span>
            {i < 2 && <span className={styles.colon}>:</span>}
          </span>
        ))}
      </div>

      <div className={styles.labels}>
        <span>HOURS</span>
        <span>MINS</span>
        <span>SECS</span>
      </div>
    </div>
  );
}