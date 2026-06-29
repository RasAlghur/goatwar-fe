import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Menu,
  X,
  Shield,
  Trophy,
  Flame,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import messiImg from "../images/Messi.png";
import ronaldoImg from "../images/CR701.png";
import matchupImg from "../images/RonaldoMessi Transaprent.png";

import "../styles/landing.css";

export function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const next = new Set(prev);

          entries.forEach((entry) => {
            const id = entry.target.getAttribute("data-reveal");
            if (!id) return;

            if (entry.isIntersecting) next.add(id);
          });

          return next;
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goPlay = () => navigate("/arena");

  const navLinks = useMemo(
    () => [
      { label: "Tokens", href: "#tokens" },
      { label: "How it works", href: "#mechanism" },
      { label: "Rewards", href: "#rewards" },
      { label: "Risk", href: "#risk" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lp-root">
      {/* BACKDROP FX */}
      <div className="lp-bg-orb lp-bg-orb-left" />
      <div className="lp-bg-orb lp-bg-orb-right" />
      <div className="lp-grid-overlay" />

      {/* NAV */}
      <header className={`lp-nav ${scrolled ? "lp-nav-scrolled" : ""}`}>
        <button className="lp-brand" onClick={() => navigate("/")} aria-label="Go home">
          <img className="lp-brand-img" src={matchupImg} alt="M V S R logo" />
          <span>M V S R</span>
        </button>

        <nav className="lp-nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="lp-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="lp-nav-actions">
          <button className="lp-btn-gold lp-hide-mobile" onClick={goPlay}>
            Enter Arena <ChevronRight size={16} />
          </button>
          <button
            className="lp-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>


      {/* MOBILE MENU */}
      <div className={`lp-mobile-menu ${menuOpen ? "is-open" : ""}`}>
        <div className="lp-mobile-panel">
          <div className="lp-mobile-top">
            <div className="lp-mobile-title">Navigate</div>
            <button className="lp-mobile-close" onClick={closeMenu} aria-label="Close menu">
              <X size={20} />
            </button>
          </div>

          <div className="lp-mobile-links">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="lp-mobile-link" onClick={closeMenu}>
                {link.label}
                <ArrowUpRight size={16} />
              </a>
            ))}
          </div>

          <button className="lp-btn-gold lp-mobile-cta" onClick={goPlay}>
            Enter Arena <ChevronRight size={16} />
          </button>
        </div>
        <button className="lp-mobile-backdrop" aria-label="Close menu overlay" onClick={closeMenu} />
      </div>

      {/* HERO */}
      <section className="lp-hero lp-fade-up">
        <div className="lp-hero-badge">
          <Sparkles size={14} />
          On-Chain · Every Hour · No Passive Yield
        </div>

        {/* <h1 className="lp-title">
          <span className="lp-title-red">MESSI</span>
          <span className="lp-title-vs">VS</span>
          <span className="lp-title-blue">RONALDO</span>
        </h1> */}

        <div className="lp-hero-art">
          <img className="lp-hero-matchup" src={matchupImg} alt="Messi and Ronaldo face off" />
          <img className="lp-hero-player lp-hero-player-left" src={messiImg} alt="Messi" />
          <img className="lp-hero-player lp-hero-player-right" src={ronaldoImg} alt="Ronaldo" />
          <div className="lp-hero-vs-chip">VS</div>
        </div>

        <p className="lp-subtitle">Two tokens. Two tribes. One battlefield.</p>
        <p className="lp-tagline">Pick your GOAT. Back your side. Battle every hour.</p>

        <div className="lp-cta-row">
          <button className="lp-cta-blue" onClick={goPlay}>
            🇦🇷 Back Messi
          </button>
          <button className="lp-cta-red" onClick={goPlay}>
            🇵🇹 Back Ronaldo
          </button>
        </div>

        <div className="lp-hero-card">
          <div className="lp-hero-stat">
            <Trophy size={16} />
            <span>16 battles/day</span>
          </div>
          <div className="lp-hero-stat">
            <Flame size={16} />
            <span>5% burn each round</span>
          </div>
          <div className="lp-hero-stat">
            <Shield size={16} />
            <span>Max loss capped at 50%</span>
          </div>
        </div>
      </section>

      {/* TOKENS */}
      <section
        id="tokens"
        data-reveal="tokens"
        className={`lp-section lp-reveal ${visibleSections.has("tokens") ? "is-visible" : ""}`}
      >
        <div className="lp-sec-label">The tokens</div>
        <h2 className="lp-sec-title">Two Tribes</h2>
        <p className="lp-sec-sub">
          Each token represents a global fanbase. Choose a side and help push your tribe to victory.
        </p>

        <div className="lp-tokens-grid">
          <div className="lp-token-card lp-token-messi">
            <div className="lp-token-top">
              <span className="lp-token-flag">🇦🇷</span>
              <div className="lp-token-ticker lp-token-ticker-blue">$MESSI</div>
            </div>
            <p className="lp-token-desc">
              The greatest of all time. Eight Ballon d'Ors. World Cup champion. The quiet genius who
              makes football look effortless. Hold $MESSI and represent Argentina's finest.
            </p>
          </div>

          <div className="lp-token-card lp-token-ronaldo">
            <div className="lp-token-top">
              <span className="lp-token-flag">🇵🇹</span>
              <div className="lp-token-ticker lp-token-ticker-red">$RONALDO</div>
            </div>
            <p className="lp-token-desc">
              The machine. Five Champions League titles. The relentless pursuit of perfection. Hold
              $RONALDO and stand with one of sport's most decorated athletes ever.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="mechanism"
        data-reveal="mechanism"
        className={`lp-section lp-reveal ${visibleSections.has("mechanism") ? "is-visible" : ""}`}
      >
        <div className="lp-sec-label">The mechanism</div>
        <h2 className="lp-sec-title">How the war works</h2>
        <p className="lp-sec-sub">
          Each cycle is a battle phase followed by a cooldown. Approximately 16 battles occur every
          single day.
        </p>

        <div className="lp-cycle-row">
          <div className="lp-cycle-block lp-cycle-battle">
            <div className="lp-cycle-num">60</div>
            <div className="lp-cycle-unit">MINUTES</div>
            <div className="lp-cycle-desc">Battle — Bidding is live</div>
          </div>
          <div className="lp-cycle-arrow">→</div>
          <div className="lp-cycle-block lp-cycle-cool">
            <div className="lp-cycle-num">30</div>
            <div className="lp-cycle-unit">MINUTES</div>
            <div className="lp-cycle-desc">Cooldown — Results settle</div>
          </div>
        </div>

        <div className="lp-daily-banner">
          ~16 battles per day <span>— every round, one tribe wins, one tribe loses</span>
        </div>
      </section>

      {/* WIN / LOSE */}
      <section
        id="rewards"
        data-reveal="rewards"
        className={`lp-section lp-reveal ${visibleSections.has("rewards") ? "is-visible" : ""}`}
      >
        <div className="lp-sec-label">The stakes</div>
        <h2 className="lp-sec-title">Win or lose</h2>
        <p className="lp-sec-sub">The side with the larger total bid wins the round. No grey area.</p>

        <div className="lp-outcomes-grid">
          <div className="lp-outcome-win">
            <div className="lp-outcome-icon">🏆</div>
            <div className="lp-outcome-title lp-green">IF YOU WIN</div>
            {[
              "100% of your original bid returned",
              "Your share of the losing pool rewards",
              "Keep all your tokens — nothing burned",
            ].map((t) => (
              <div className="lp-outcome-item lp-outcome-item-win" key={t}>
                {t}
              </div>
            ))}
          </div>

          <div className="lp-outcome-loss">
            <div className="lp-outcome-icon">💔</div>
            <div className="lp-outcome-title lp-red">IF YOU LOSE</div>
            {[
              "50% of your bid is returned to you",
              "50% enters the reward pool",
              "Maximum loss is 50% of your bid",
            ].map((t) => (
              <div className="lp-outcome-item lp-outcome-item-loss" key={t}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REWARDS BREAKDOWN */}
      <section className="lp-section lp-fade-up">
        <div className="lp-sec-label">The spoils</div>
        <h2 className="lp-sec-title">Reward distribution</h2>
        <p className="lp-sec-sub">
          From the losing side's 50%, rewards flow to winners, the lucky, and the ecosystem.
        </p>

        <div className="lp-rewards-grid">
          <div className="lp-rewards-list">
            {[
              { pct: "25%", color: "#00c850", title: "Shared among all winners", desc: "Proportional to your bid size", fill: "50%" },
              { pct: "10%", color: "#f5c518", title: "Highest individual bidder", desc: "Biggest single bid takes the crown", fill: "20%" },
              { pct: "5%", color: "#a78bfa", title: "Random lucky winner", desc: "Anyone on the winning side can win", fill: "10%" },
              { pct: "5%", color: "#e8001d", title: "Burned forever", desc: "Deflationary pressure every round", fill: "10%" },
              { pct: "5%", color: "#8892a4", title: "War Chest (treasury)", desc: "Ecosystem and liquidity support", fill: "10%" },
            ].map((r) => (
              <div className="lp-reward-item" key={r.title}>
                <div className="lp-reward-pct" style={{ color: r.color }}>
                  {r.pct}
                </div>
                <div className="lp-reward-info">
                  <div className="lp-reward-title">{r.title}</div>
                  <div className="lp-reward-desc">{r.desc}</div>
                  <div className="lp-reward-bar">
                    <div className="lp-reward-bar-fill" style={{ width: r.fill, background: r.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <svg viewBox="0 0 260 260" className="lp-donut" aria-label="Reward split donut chart" role="img">
            <defs>
              <filter id="lp-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="130" cy="130" r="95" fill="none" stroke="var(--lp-s3)" strokeWidth="36" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="#00c850" strokeWidth="36" strokeDasharray="149.2 447.6" strokeDashoffset="0" transform="rotate(-90 130 130)" filter="url(#lp-glow)" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="#f5c518" strokeWidth="36" strokeDasharray="59.7 537.1" strokeDashoffset="-149.2" transform="rotate(-90 130 130)" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="#a78bfa" strokeWidth="36" strokeDasharray="29.8 566.9" strokeDashoffset="-208.9" transform="rotate(-90 130 130)" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="#e8001d" strokeWidth="36" strokeDasharray="29.8 566.9" strokeDashoffset="-238.7" transform="rotate(-90 130 130)" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="#8892a4" strokeWidth="36" strokeDasharray="29.8 566.9" strokeDashoffset="-268.5" transform="rotate(-90 130 130)" />
            <circle cx="130" cy="130" r="95" fill="none" stroke="var(--lp-s2)" strokeWidth="36" strokeDasharray="298.5 298.5" strokeDashoffset="-298.3" transform="rotate(-90 130 130)" />
            <text x="130" y="123" textAnchor="middle" fontFamily="'Bebas Neue',sans-serif" fontSize="32" fill="var(--lp-text)">
              50%
            </text>
            <text x="130" y="141" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="11" fill="var(--lp-dim)">
              losing pool
            </text>
            <text x="130" y="156" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="10" fill="var(--lp-muted)">
              distributed
            </text>
          </svg>
        </div>
      </section>

      {/* RISK WARNING */}
      <section
        id="risk"
        data-reveal="risk"
        className={`lp-section lp-reveal ${visibleSections.has("risk") ? "is-visible" : ""}`}
      >
        <div className="lp-risk">
          <span style={{ fontSize: 28 }}>⚠️</span>
          <div>
            <div className="lp-risk-title">RISK WARNING</div>
            <p className="lp-risk-body">
              This is a competitive crypto game. Participants can lose up to 50% of their bid in a
              single round. Rewards are not guaranteed. Only participate with funds you are fully
              prepared to risk. This is not financial advice.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div
        data-reveal="final"
        className={`lp-final lp-reveal ${visibleSections.has("final") ? "is-visible" : ""}`}
      >
        <h2 className="lp-final-title">
          <span className="lp-title-blue">MESSI</span>
          <span className="lp-final-or"> or </span>
          <span className="lp-title-red">RONALDO</span>
        </h2>
        <p className="lp-final-sub">Choose your side. Join the arena. One tribe wins every hour.</p>
        <div className="lp-final-btns">
          <button className="lp-cta-blue lp-cta-lg" onClick={goPlay}>
            🇦🇷 Team Messi
          </button>
          <button className="lp-cta-red lp-cta-lg" onClick={goPlay}>
            🇵🇹 Team Ronaldo
          </button>
        </div>
        <p className="lp-final-note">Built on Solana · Powered by Anchor · Fully on-chain</p>
      </div>

      {/* FOOTER */}
      <footer className="lp-footer">
        <span>
          <img className="lp-brand-img" src={matchupImg} alt="M V S R logo" />
          <span>MESSI VS RONALDO — The Ultimate On-Chain Rivalry</span>
        </span>
        <div className="lp-footer-links">
          <a href="#" className="lp-footer-link">
            X/Twitter
          </a>
          <a href="#" className="lp-footer-link">
            Telegram
          </a>
          <button className="lp-footer-cta" onClick={goPlay}>
            Enter App <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </div >
  );
}
