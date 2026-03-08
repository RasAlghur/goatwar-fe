// src/components/TeamCard.tsx
import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatAmount, formatAddress, calcPoolPercentage } from '../utils/program';
import styles from './TeamCard.module.css';

interface Team {
  id: number;
  name: string;
  flag: string;
}

interface Round {
  totalA?: string | number;
  totalB?: string | number;
  highestBidA?: string;
  highestBidB?: string;
  highestBidAAmount?: string | number;
  highestBidBAmount?: string | number;
  settled?: boolean;
  winnerTeam?: number;
}

interface UserBid {
  amount: string | number;
}

export default function TeamCard({
  team,
  round,
  userBid,
  tokenBalance,
  solBalance,
  onBid,
  isActive,
  validateBid,
}: {
  team: Team;
  round: Round;
  userBid: UserBid | undefined;
  tokenBalance: number;
  /** SOL balance passed down so we can warn inline without a separate hook call */
  solBalance: number;
  onBid: (teamName: string, amount: number) => void;
  isActive: boolean;
  /** Pre-flight validator from useGame — returns error string or null */
  validateBid?: (team: 'MESSI' | 'RONALDO', amount: number) => string | null;
}) {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [hover, setHover] = useState(false);

  const isMessi = team.id === 1;
  const teamKey = isMessi ? 'MESSI' : 'RONALDO';

  const totalRaw = isMessi ? round?.totalA : round?.totalB;
  const topBidder = isMessi ? round?.highestBidA : round?.highestBidB;
  const topAmount = isMessi ? round?.highestBidAAmount : round?.highestBidBAmount;
  const pct = calcPoolPercentage(round?.totalA, round?.totalB, isMessi ? 'A' : 'B');

  const isWinner = round?.settled && round?.winnerTeam === team.id;
  const isLoser = round?.settled && round?.winnerTeam !== team.id;

  // ── Inline validation ───────────────────────────────────────────────────────
  // Runs on every keystroke so the user sees feedback before clicking.
  const amountNum = Number(amount);

  const validationError = useMemo<string | null>(() => {
    if (!amount) return null; // No input yet — stay silent

    if (isNaN(amountNum) || amountNum <= 0) return 'Enter a positive number.';

    // Token balance check (instant, no RPC)
    if (amountNum > tokenBalance) {
      return `Max ${tokenBalance.toFixed(2)} ${team.name} tokens.`;
    }

    // SOL fee check (instant, no RPC)
    const MIN_SOL = 0.01;
    if (solBalance < MIN_SOL) {
      return `Need ≥${MIN_SOL} SOL for fees (have ${solBalance.toFixed(4)}).`;
    }

    // Delegate to hook validator for any remaining checks (round state, etc.)
    if (validateBid) {
      return validateBid(teamKey, amountNum);
    }

    return null;
  }, [amount, amountNum, tokenBalance, solBalance, team.name, teamKey, validateBid]);

  const canSubmit =
    !!publicKey &&
    isActive &&
    !!amount &&
    !validationError &&
    amountNum > 0;

  const handleBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onBid(team.name, amountNum);
    setAmount('');
  };

  const handleMax = () => {
    if (tokenBalance > 0) setAmount(tokenBalance.toString());
  };

  return (
    <div
      className={`
        ${styles.card}
        ${isMessi ? styles.messiCard : styles.ronaldoCard}
        ${isWinner ? styles.winnerCard : ''}
        ${isLoser ? styles.loserCard : ''}
        ${hover ? styles.hovered : ''}
      `}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Glow orb */}
      <div className={`${styles.glow} ${isMessi ? styles.glowBlue : styles.glowRed}`} />

      {/* Winner/Loser Banner */}
      {isWinner && (
        <div className={styles.winnerBanner}>
          <span>🏆 WINNER</span>
        </div>
      )}
      {isLoser && (
        <div className={styles.loserBanner}>
          <span>DEFEATED</span>
        </div>
      )}

      {/* Team identity */}
      <div className={styles.teamHeader}>
        <div className={styles.flag}>{team.flag}</div>
        <div className={styles.teamInfo}>
          <h2 className={`${styles.teamName} ${isMessi ? styles.nameBlue : styles.nameRed}`}>
            {team.name}
          </h2>
          <div className={styles.teamSub}>THE GOAT</div>
        </div>
        <div className={styles.pctBadge} style={{ color: isMessi ? 'var(--messi-blue)' : 'var(--ronaldo-red)' }}>
          {pct}%
        </div>
      </div>

      {/* Pool bar */}
      <div className={styles.poolSection}>
        <div className={styles.poolLabel}>
          <span>POOL</span>
          <span className={styles.poolValue}>{formatAmount(totalRaw || 0, teamKey)} tokens</span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={`${styles.progressFill} ${isMessi ? styles.fillBlue : styles.fillRed}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Top bidder */}
      {topBidder && topBidder !== '11111111111111111111111111111111' && (
        <div className={styles.topBidder}>
          <span className={styles.topLabel}>👑 TOP BIDDER</span>
          <span className={styles.topAddr}>{formatAddress(topBidder)}</span>
          <span className={styles.topAmt}>{formatAmount(topAmount || 0, teamKey)}</span>
        </div>
      )}

      {/* Your bid */}
      {userBid && (
        <div className={`${styles.yourBid} ${isMessi ? styles.yourBidBlue : styles.yourBidRed}`}>
          <span>YOUR BID</span>
          <span>{formatAmount(userBid.amount, teamKey)}</span>
        </div>
      )}

      {/* Low SOL warning even when no amount typed */}
      {!round?.settled && publicKey && solBalance < 0.01 && solBalance > 0 && !amount && (
        <div className={styles.warnBanner}>
          ⚠️ Low SOL ({solBalance.toFixed(4)}) — fees may fail
        </div>
      )}
      {!round?.settled && publicKey && solBalance === 0 && !amount && (
        <div className={styles.warnBanner}>
          ⚠️ No SOL in wallet — you need SOL to pay transaction fees
        </div>
      )}

      {/* Bid form */}
      {!round?.settled && (
        <form className={styles.bidForm} onSubmit={handleBid}>
          <div className={styles.inputRow}>
            <input
              type="number"
              className={`${styles.bidInput} ${validationError ? styles.bidInputError : ''}`}
              placeholder="Amount..."
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={!isActive || !publicKey}
              min="0"
              step="any"
            />
            <div className={styles.balanceHint}>
              {tokenBalance > 0 && (
                <span onClick={handleMax} className={styles.maxBtn}>
                  MAX {tokenBalance.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Inline validation message */}
          {validationError && (
            <div className={styles.validationError}>
              ⚠️ {validationError}
            </div>
          )}

          {/* Balance summary row (shown when wallet connected + round active) */}
          {publicKey && isActive && !validationError && amount && (
            <div className={styles.balanceSummary}>
              <span>Balance: {tokenBalance.toFixed(2)} {team.name}</span>
              <span>SOL: {solBalance.toFixed(4)}</span>
            </div>
          )}

          <button
            type="submit"
            className={`${styles.bidBtn} ${isMessi ? styles.bidBtnBlue : styles.bidBtnRed}`}
            disabled={!canSubmit}
            title={validationError ?? undefined}
          >
            {!publicKey
              ? 'CONNECT WALLET'
              : !isActive
              ? 'ROUND CLOSED'
              : validationError
              ? 'CHECK AMOUNT'
              : `BID ON ${team.name}`}
          </button>
        </form>
      )}
    </div>
  );
}