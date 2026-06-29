// src/App.tsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useGame } from './hooks/useGame';
import { getPhase } from './utils/program';
import { TEAM } from './utils/constants';
import Header from './components/Header';
import CountdownTimer from './components/CountdownTimer';
import TeamCard from './components/TeamCard';
import RoundHistory from './components/RoundHistory';
import ClaimsPanel, { type AnchorProgram } from './components/ClaimsPanel';
import UserStatsBar from './components/UserStatsBar';
import TxToast from './components/TxToast';
import styles from './App.module.css';
import UserBidHistory from './components/UserBidHistory';
import { LandingPage } from './pages/LandingPage';
import messiImg from "./images/Messi.png";
import ronaldoImg from "./images/CR701.png";

// ── Extract the dapp into its own component so hooks only run on /arena ──
function ArenaApp() {
  const {
    program, currentRound, rounds,
    userBids, solBalance, tokenBalances,
    txStatus, depositBid, claimRound, claimAll,
    dismissTxStatus, networkTime, currentTime, validateBid,
  } = useGame();

  const PLACEHOLDER_MINT = import.meta.env.VITE_TOKEN_PROGRAM_ID;
  const mintsConfigured =
    import.meta.env.VITE_MESSI_MINT &&
    import.meta.env.VITE_RONALDO_MINT &&
    import.meta.env.VITE_MESSI_MINT !== PLACEHOLDER_MINT;

  const [activeTab, setActiveTab] = useState('history');
  const phase = currentRound ? getPhase(currentRound, networkTime) : { phase: 'waiting', timeLeft: 0 };
  const isActive = phase.phase === 'active';

  if (!mintsConfigured) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'white', background: '#0f0f0f', minHeight: '100vh' }}>
        <h2>⚙️ Setup Required</h2>
        <p>Add your token mint addresses to <code>.env</code>:</p>
        <pre style={{ background: '#1a1a1a', padding: 16, borderRadius: 8, display: 'inline-block', textAlign: 'left' }}>
          {`VITE_MESSI_MINT=your_messi_token_mint\nVITE_RONALDO_MINT=your_ronaldo_token_mint`}
        </pre>
        <p>Then restart the server.</p>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.stadiumBg}>
        <div className={styles.splitLeft} />
        <div className={styles.splitRight} />
        <div className={styles.centerLine} />
      </div>

      <Header solBalance={solBalance} />

      <main className={styles.main}>
        <section id="arena" className={styles.arenaSection}>
          <div className={styles.arenaHeader}>
            <div className={styles.arenaArt} aria-hidden="true">
              <img className={`${styles.arenaImg} ${styles.arenaImgLeft}`} src={messiImg} alt="" />
              <img className={`${styles.arenaImg} ${styles.arenaImgRight}`} src={ronaldoImg} alt="" />
              <div className={styles.arenaVsOrb}>VS</div>
            </div>

            <div className={styles.roundBadge}>
              {currentRound ? `ROUND #${currentRound.roundNumber}` : 'NO ACTIVE ROUND'}
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroMessi}>MESSI</span>
              <span className={styles.heroVs}>vs</span>
              <span className={styles.heroRonaldo}>RONALDO</span>
            </h1>
            <p className={styles.heroSub}>
              Back your GOAT — winner's side gets their tokens back, loser's pool redistributed
            </p>
          </div>

          <CountdownTimer round={currentRound} currentTime={currentTime} />

          <UserStatsBar
            solBalance={solBalance}
            tokenBalances={tokenBalances}
            userBids={{ messi: userBids.messi ?? undefined, ronaldo: userBids.ronaldo ?? undefined }}
            currentRound={currentRound ?? undefined}
          />

          {/* How it works */}
          <div className={styles.mechPanel}>
            <div className={styles.mechItem}>
              <span className={styles.mechIcon}>↩</span>
              <div>
                <div className={styles.mechTitle}>50% LOSER REFUND</div>
                <div className={styles.mechDesc}>Losing side gets 50% of their bid back</div>
              </div>
            </div>
            <div className={styles.mechDivider} />
            <div className={styles.mechItem}>
              <span className={styles.mechIcon}>👑</span>
              <div>
                <div className={styles.mechTitle}>20% TOP BIDDER</div>
                <div className={styles.mechDesc}>Highest winning bidder takes 20% of losing pool</div>
              </div>
            </div>
            <div className={styles.mechDivider} />
            <div className={styles.mechItem}>
              <span className={styles.mechIcon}>📊</span>
              <div>
                <div className={styles.mechTitle}>50% PROPORTIONAL</div>
                <div className={styles.mechDesc}>Rest of winning team shares 50% proportionally</div>
              </div>
            </div>
            <div className={styles.mechDivider} />
            <div className={styles.mechItem}>
              <span className={styles.mechIcon}>🎲</span>
              <div>
                <div className={styles.mechTitle}>10% RANDOM</div>
                <div className={styles.mechDesc}>One lucky winner from the winning side</div>
              </div>
            </div>
            <div className={styles.mechDivider} />
            <div className={styles.mechItem}>
              <span className={styles.mechIcon}>🔥</span>
              <div>
                <div className={styles.mechTitle}>10% BURNED</div>
                <div className={styles.mechDesc}>Permanently removed from supply</div>
              </div>
            </div>
          </div>

          {/* Team Cards */}
          <div className={styles.teamsGrid}>
            <TeamCard
              team={TEAM.MESSI}
              round={currentRound!}
              userBid={userBids.messi ?? undefined}
              tokenBalance={tokenBalances.messi}
              solBalance={solBalance}
              onBid={depositBid as (teamName: string, amount: number) => void}
              isActive={isActive}
              validateBid={validateBid as (team: 'MESSI' | 'RONALDO', amount: number) => string | null}
            />

            <div className={styles.vsColumn}>
              <div className={styles.vsCircle}>VS</div>
              {currentRound?.settled && (
                <div className={styles.resultBanner}>
                  <div className={styles.resultLabel}>WINNER</div>
                  <div
                    className={styles.resultTeam}
                    style={{ color: currentRound.winnerTeam === 1 ? 'var(--messi-blue)' : 'var(--ronaldo-red)' }}
                  >
                    {currentRound.winnerTeam === 1 ? '🇦🇷 MESSI' : '🇵🇹 RONALDO'}
                  </div>
                </div>
              )}
            </div>

            <TeamCard
              team={TEAM.RONALDO}
              round={currentRound!}
              userBid={userBids.ronaldo ?? undefined}
              tokenBalance={tokenBalances.ronaldo}
              solBalance={solBalance}
              onBid={depositBid as (teamName: string, amount: number) => void}
              isActive={isActive}
              validateBid={validateBid as (team: 'MESSI' | 'RONALDO', amount: number) => string | null}
            />
          </div>
        </section>

        {/* Bottom sections */}
        <section className={styles.bottomSection}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📊 ROUND HISTORY
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'mybids' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('mybids')}
            >
              👤 MY BIDS
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'claims' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              💰 MY CLAIMS
            </button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'history' && <RoundHistory rounds={rounds} />}
            {activeTab === 'mybids' && <UserBidHistory rounds={rounds} />}
            {activeTab === 'claims' && (
              <ClaimsPanel
                rounds={rounds}
                program={program as unknown as AnchorProgram | null}
                onClaimRound={claimRound}
                onClaimAll={claimAll}
                txStatus={txStatus}
              />
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerBrand}>GOAT WARS</span>
          <span className={styles.footerNet}>Solana {import.meta.env.VITE_SERVER}</span>
          <span className={styles.footerAddr}>Program: {import.meta.env.VITE_PROGRAM_ID}</span>
        </div>
      </footer>

      <TxToast status={txStatus} onDismiss={dismissTxStatus} />
    </div>
  );
}

// ── Root — just the router, wallet providers already live in main.tsx ──
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/arena" element={<ArenaApp />} />
        {/* Catch-all: redirect unknown paths back to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}