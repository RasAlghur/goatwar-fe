// src/components/UserStatsBar.tsx
import { useWallet } from '@solana/wallet-adapter-react';
import { formatAmount, formatAddress } from '../utils/program';
import styles from './UserStatsBar.module.css';


interface UserStatsBarProps {
  solBalance: number;
  tokenBalances: { messi: number; ronaldo: number };
  userBids?: { messi?: { amount: string | number }; ronaldo?: { amount: string | number } };
  currentRound?: { roundNumber: number } | null;  // accept RoundState shape, not number
}

export default function UserStatsBar({ solBalance, tokenBalances, userBids }: UserStatsBarProps) {
  const { publicKey } = useWallet();
  if (!publicKey) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.item}>
        <span className={styles.label}>WALLET</span>
        <span className={styles.value}>{formatAddress(publicKey.toString())}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <span className={styles.label}>SOL BALANCE</span>
        <span className={styles.valueGold}>{solBalance.toFixed(3)} SOL</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <span className={styles.label}>🇦🇷 MESSI TOKENS</span>
        <span className={styles.valueBlue}>{tokenBalances.messi.toFixed(2)}</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.item}>
        <span className={styles.label}>🇵🇹 RONALDO TOKENS</span>
        <span className={styles.valueRed}>{tokenBalances.ronaldo.toFixed(2)}</span>
      </div>
      {userBids?.messi && (
        <>
          <div className={styles.divider} />
          <div className={styles.item}>
            <span className={styles.label}>YOUR BID (MESSI)</span>
            <span className={styles.valueBlue}>{formatAmount(userBids.messi.amount)}</span>
          </div>
        </>
      )}
      {userBids?.ronaldo && (
        <>
          <div className={styles.divider} />
          <div className={styles.item}>
            <span className={styles.label}>YOUR BID (RONALDO)</span>
            <span className={styles.valueRed}>{formatAmount(userBids.ronaldo.amount)}</span>
          </div>
        </>
      )}
    </div>
  );
}