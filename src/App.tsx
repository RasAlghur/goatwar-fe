// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useGame } from "./hooks/useGame";
import { getPhase } from "./utils/program";
import { TEAM } from "./utils/constants";
import Header from "./components/Header";
import CountdownTimer from "./components/CountdownTimer";
import TeamCard from "./components/TeamCard";
import RoundHistory from "./components/RoundHistory";
import ClaimsPanel, { type AnchorProgram } from "./components/ClaimsPanel";
import UserStatsBar from "./components/UserStatsBar";
import TxToast from "./components/TxToast";
import "./styles/arena.css";
import UserBidHistory from "./components/UserBidHistory";
import messiImg from "./images/Messi.png";
import ronaldoImg from "./images/CR701.png";
import { LandingPage } from "./pages/LandingPage";
import { Landing } from "./pages/Landing";
import AOS from "aos";
import "aos/dist/aos.css";
import { Undo2, Crown, BarChart3, Dices, Flame } from "lucide-react";

// ── Extract the dapp into its own component so hooks only run on /arena ──
function ArenaApp() {
  const {
    program,
    currentRound,
    rounds,
    userBids,
    solBalance,
    tokenBalances,
    txStatus,
    depositBid,
    claimRound,
    claimAll,
    dismissTxStatus,
    networkTime,
    currentTime,
    validateBid,
  } = useGame();

  const PLACEHOLDER_MINT = import.meta.env.VITE_TOKEN_PROGRAM_ID;
  const mintsConfigured =
    import.meta.env.VITE_MESSI_MINT &&
    import.meta.env.VITE_RONALDO_MINT &&
    import.meta.env.VITE_MESSI_MINT !== PLACEHOLDER_MINT;

  const [activeTab, setActiveTab] = useState("history");
  const phase = currentRound
    ? getPhase(currentRound, networkTime)
    : { phase: "waiting", timeLeft: 0 };
  const isActive = phase.phase === "active";

  if (!mintsConfigured) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "white",
          background: "#0f0f0f",
          minHeight: "100vh",
        }}
      >
        <h2>⚙️ Setup Required</h2>
        <p>
          Add your token mint addresses to <code>.env</code>:
        </p>
        <pre
          style={{
            background: "#1a1a1a",
            padding: 16,
            borderRadius: 8,
            display: "inline-block",
            textAlign: "left",
          }}
        >
          {`VITE_MESSI_MINT=your_messi_token_mint\nVITE_RONALDO_MINT=your_ronaldo_token_mint`}
        </pre>
        <p>Then restart the server.</p>
      </div>
    );
  }

  return (
    <div className="relative bg-(--lp-bg) text-(--lp-text) font-(--lp-fb)">
      <div className="arena-stadium-bg" />

      <Header solBalance={solBalance} />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pb-16">
        <section id="arena" className="flex flex-col gap-7 pb-10">
          <div className="text-center animate-[fadeIn_0.6s_ease]">
            <div className="arena-crest" aria-hidden="true">
              <div className="arena-crest-img">
                <img
                  className="left-0 drop-shadow-[0_20px_40px_rgba(0,87,184,0.4)] animate-[slideInLeft_0.8s_cubic-bezier(0.22,1,0.36,1)_both]"
                  src={messiImg}
                  alt=""
                />
                <span className="font-(--lp-fd) text-[clamp(20px,4vw,40px)] text-(--lp-blue) drop-shadow-[0_0_40px_rgba(0,87,184,0.45)] font-bold">
                  MESSI
                </span>
              </div>
              <div className="arena-crest-img right-0">
                <img
                  className="drop-shadow-[0_20px_40px_rgba(232,0,29,0.4)] animate-[slideInRight_0.8s_cubic-bezier(0.22,1,0.36,1)_both]"
                  src={ronaldoImg}
                  alt=""
                />
                <span className="font-(--lp-fd) text-[clamp(20px,4vw,40px)] text-(--lp-red) drop-shadow-[0_0_40px_rgba(232,0,29,0.45)] font-bold">
                  RONALDO
                </span>
              </div>
              <div className="arena-vs-orb animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_0.3s_both]">
                VS
              </div>
            </div>

            <div className="inline-block mb-4 px-4.5 py-1.5 rounded-full bg-(--lp-gold)/10 border border-(--lp-gold)/25 font-(--lp-fm) text-xs font-bold tracking-[0.15em] uppercase text-(--lp-gold)">
              {currentRound
                ? `ROUND #${currentRound.roundNumber}`
                : "NO ACTIVE ROUND"}
            </div>

            {/* <h1 className="font-(--lp-fd) text-[clamp(52px,8vw,96px)] tracking-[0.04em] leading-none flex items-center justify-center gap-5 mb-3.5 flex-col sm:flex-row">
              <span className="text-(--lp-blue) drop-shadow-[0_0_40px_rgba(0,87,184,0.45)] font-bold">
                MESSI
              </span>
              <span className="text-(--lp-muted) text-[0.4em] tracking-[0.1em]">
                vs
              </span>
              <span className="text-(--lp-red) drop-shadow-[0_0_40px_rgba(232,0,29,0.45)] font-bold">
                RONALDO
              </span>
            </h1> */}
            <p className="font-(--lp-fb) text-[clamp(20px,1.3vw,15px)] text-(--lp-dim) max-w-120 mx-auto leading-relaxed mt-10">
              Back your GOAT — winner's side gets their tokens back, loser's
              pool redistributed
            </p>
          </div>

          <CountdownTimer round={currentRound} currentTime={currentTime} />

          <UserStatsBar
            solBalance={solBalance}
            tokenBalances={tokenBalances}
            userBids={{
              messi: userBids.messi ?? undefined,
              ronaldo: userBids.ronaldo ?? undefined,
            }}
            currentRound={currentRound ?? undefined}
          />

          {/* Mechanics panel — five-way split, matches the landing page's
            card + border language instead of the old flat panel */}
          <div className="flex flex-col sm:flex-row items-stretch bg-(--lp-s1) border border-(--lp-border) rounded-2xl overflow-hidden animate-[fadeIn_0.5s_ease]">
            {[
              {
                icon: Undo2,
                color: "var(--lp-green)",
                title: "50% LOSER REFUND",
                desc: "Losing side gets 50% of their bid back",
              },
              {
                icon: Crown,
                color: "var(--lp-gold)",
                title: "20% TOP BIDDER",
                desc: "Highest winning bidder takes 20% of losing pool",
              },
              {
                icon: BarChart3,
                color: "var(--lp-blue)",
                title: "50% PROPORTIONAL",
                desc: "Rest of winning team shares 50% proportionally",
              },
              {
                icon: Dices,
                color: "#a78bfa",
                title: "10% RANDOM",
                desc: "One lucky winner from the winning side",
              },
              {
                icon: Flame,
                color: "var(--lp-red)",
                title: "10% BURNED",
                desc: "Permanently removed from supply",
              },
            ].map((m, i, arr) => (
              <div key={m.title} className="contents">
                <div className="flex-1 flex items-center gap-3.5 px-6 py-4.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full shrink-0"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${m.color} 15%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${m.color} 30%, transparent)`,
                    }}
                  >
                    <m.icon size={16} style={{ color: m.color }} />
                  </div>
                  <div>
                    <div className="font-(--lp-fm) text-xs font-bold tracking-[0.1em] uppercase text-(--lp-text) mb-0.5">
                      {m.title}
                    </div>
                    <div className="font-(--lp-fb) text-xs text-(--lp-dim) leading-snug">
                      {m.desc}
                    </div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:block w-px bg-(--lp-border) self-stretch" />
                )}
              </div>
            ))}
          </div>

          {/* Team cards */}
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-5 items-start animate-[fadeIn_0.6s_ease_0.1s_both]">
            <TeamCard
              team={TEAM.MESSI}
              round={currentRound!}
              userBid={userBids.messi ?? undefined}
              tokenBalance={tokenBalances.messi}
              solBalance={solBalance}
              onBid={depositBid as (teamName: string, amount: number) => void}
              isActive={isActive}
              validateBid={
                validateBid as (
                  team: "MESSI" | "RONALDO",
                  amount: number,
                ) => string | null
              }
            />

            <div className="flex md:flex-col items-center justify-center gap-4 md:pt-10">
              <div className="arena-vs-circle">VS</div>
              {currentRound?.settled && (
                <div className="text-center bg-(--lp-gold)/10 border border-(--lp-gold)/20 rounded-xl px-3.5 py-2.5">
                  <div className="font-(--lp-fm) text-[10px] font-bold tracking-[0.15em] uppercase text-(--lp-gold) mb-1">
                    WINNER
                  </div>
                  <div
                    className="font-(--lp-fd) text-lg tracking-wide"
                    style={{
                      color:
                        currentRound.winnerTeam === 1
                          ? "var(--lp-blue)"
                          : "var(--lp-red)",
                    }}
                  >
                    {currentRound.winnerTeam === 1 ? "🇦🇷 MESSI" : "🇵🇹 RONALDO"}
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
              validateBid={
                validateBid as (
                  team: "MESSI" | "RONALDO",
                  amount: number,
                ) => string | null
              }
            />
          </div>
        </section>

        {/* Bottom tabs */}
        <section className="mt-4 bg-(--lp-s1) border border-(--lp-border) rounded-2xl overflow-hidden animate-[fadeIn_0.5s_ease_0.2s_both]">
          <div className="flex border-b border-(--lp-border)">
            {[
              { key: "history", label: "📊 ROUND HISTORY" },
              { key: "mybids", label: "👤 MY BIDS" },
              { key: "claims", label: "💰 MY CLAIMS" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 max-w-[240px] px-6 py-4 -mb-px font-(--lp-fm) text-[13px] font-bold tracking-[0.1em] uppercase transition-all duration-200 border-b-2 ${
                  activeTab === t.key
                    ? "text-(--lp-text) border-(--lp-gold) bg-(--lp-gold)/[0.04]"
                    : "text-(--lp-dim) border-transparent hover:text-(--lp-text) hover:bg-white/[0.02]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === "history" && <RoundHistory rounds={rounds} />}
            {activeTab === "mybids" && <UserBidHistory rounds={rounds} />}
            {activeTab === "claims" && (
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

      <footer className="relative z-10 border-t border-(--lp-border) px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <span className="font-(--lp-fd) text-lg tracking-[0.08em] bg-linear-to-r from-(--lp-blue) to-(--lp-red) bg-clip-text text-transparent">
            GOAT WARS
          </span>
          <span className="font-(--lp-fm) text-[11px] font-semibold tracking-[0.1em] uppercase text-(--lp-dim)">
            Solana {import.meta.env.VITE_SERVER}
          </span>
          <span className="font-(--lp-fm) text-[11px] font-semibold tracking-[0.1em] uppercase text-(--lp-dim)">
            Program: {import.meta.env.VITE_PROGRAM_ID}
          </span>
        </div>
      </footer>

      <TxToast status={txStatus} onDismiss={dismissTxStatus} />
    </div>
  );
}

function AOSRouteRefresh() {
  const location = useLocation();
  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);
  return null;
}

// ── Root — just the router, wallet providers already live in main.tsx ──
export default function App() {
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: false, // replay every time it enters the viewport
      mirror: true, // also animate on the way back up, not just scrolling down
      offset: 80,
    });
  }, []);
  return (
    <BrowserRouter>
      <AOSRouteRefresh />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/arena" element={<ArenaApp />} />
        {/* Catch-all: redirect unknown paths back to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
