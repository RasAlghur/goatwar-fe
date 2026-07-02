import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import styles from "./Header.module.css";
import { Link } from "react-router-dom";

export default function Header({ solBalance }: { solBalance: number }) {
  const { publicKey } = useWallet();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={"/"} className={styles.brand}>
          <span className={styles.brandMessi}>GOAT</span>
          <span className={styles.brandSep}>⚡</span>
          <span className={styles.brandRonaldo}>WARS</span>
        </Link>

        <nav className={styles.nav}>
          <a href="#arena" className={styles.navLink}>
            Arena
          </a>
          <a href="#history" className={styles.navLink}>
            History
          </a>
          <a href="#claims" className={styles.navLink}>
            Claims
          </a>
        </nav>

        <div className={styles.walletArea}>
          {publicKey && (
            <div className={styles.balanceBadge}>
              <span className={styles.balanceLabel}>SOL</span>
              <span className={styles.balanceValue}>
                {solBalance.toFixed(3)}
              </span>
            </div>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
