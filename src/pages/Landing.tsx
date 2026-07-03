import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Menu,
  X,
  Shield,
  Trophy,
  TrendingDown,
  Flame,
  Sparkles,
  Swords,
  Timer,
  Coins,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import messiImg from "../images/Messi.png";
import ronaldoImg from "../images/CR701.png";
import matchupImg from "../images/RonaldoMessi Transaprent.png";

import "../styles/landingpage.css";

export function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const goPlay = () => navigate("/arena");

  const navLinks = useMemo(
    () => [
      { label: "Tokens", href: "#tokens" },
      { label: "How it works", href: "#mechanism" },
      { label: "Rewards", href: "#rewards" },
      { label: "Risk", href: "#risk" },
    ],
    [],
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

  const rewardRows = [
    {
      pct: "25%",
      color: "#00c850",
      title: "Shared among all winners",
      desc: "Proportional to your bid size",
      fill: "50%",
      dash: 146.2,
      offset: -2,
    },
    {
      pct: "10%",
      color: "#f5c518",
      title: "Highest individual bidder",
      desc: "Biggest single bid takes the crown",
      fill: "20%",
      dash: 56.7,
      offset: -151.2,
    },
    {
      pct: "5%",
      color: "#a78bfa",
      title: "Random lucky winner",
      desc: "Anyone on the winning side can win",
      fill: "10%",
      dash: 26.8,
      offset: -209.9,
    },
    {
      pct: "5%",
      color: "#e8001d",
      title: "Burned forever",
      desc: "Deflationary pressure every round",
      fill: "10%",
      dash: 26.8,
      offset: -238.7,
    },
    {
      pct: "5%",
      color: "#8892a4",
      title: "War Chest (treasury)",
      desc: "Ecosystem and liquidity support",
      fill: "10%",
      dash: 26.8,
      offset: -267.5,
    },
  ];

  return (
    <div className="relative font-(--lp-fb) bg-(--lp-bg) text-(--lp-text) min-h-screen overflow-x-hidden antialiased [text-rendering:optimizeLegibility] bg-[radial-gradient(ellipse_70%_50%_at_15%_10%,rgba(232,0,29,0.09)_0%,transparent_55%),radial-gradient(ellipse_70%_50%_at_85%_90%,rgba(0,87,184,0.09)_0%,transparent_55%)]">
      {/* ATMOSPHERE */}
      <div className="lp-bg-orb lp-bg-orb-left" />
      <div className="lp-bg-orb lp-bg-orb-right" />
      <div className="lp-grid-overlay" />
      <div className="lp-noise" />

      {/* NAV */}
      <header
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 md:px-10 transition-all duration-300 ${
          scrolled
            ? "h-16 bg-(--lp-bg)/80 backdrop-blur-xl border-b border-(--lp-border)"
            : "h-20 bg-transparent border-b border-transparent"
        }`}
      >
        <button
          className="flex items-center gap-3 group"
          onClick={() => navigate("/")}
          aria-label="Go home"
        >
          <img className="h-8 w-8 object-contain" src={matchupImg} alt="" />
          <span className="font-(--lp-fm) text-sm tracking-[0.1em] text-(--lp-text)">
            M VS R
          </span>
          <span className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-(--lp-border2)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--lp-green) animate-pulse" />
            <span className="font-(--lp-fm) text-[10px] tracking-[0.2em] text-(--lp-dim)">
              LIVE
            </span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative font-[var(--lp-fb)] text-sm text-[var(--lp-dim)] hover:text-[var(--lp-text)] transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-[var(--lp-gold)] after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="lp-jersey-btn hidden md:inline-flex items-center gap-1.5 bg-[var(--lp-gold)] text-[#100c01] font-[var(--lp-fd)] text-base tracking-wide pl-5 pr-4 py-2.5 hover:bg-[var(--lp-gold-dim)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]"
            onClick={goPlay}
          >
            Enter Arena <ChevronRight size={16} />
          </button>
          <button
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-full border border-[var(--lp-border2)] text-[var(--lp-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-gold)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-label="Close menu overlay"
          onClick={closeMenu}
        />
        <div
          className={`absolute top-0 right-0 h-full w-[82%] max-w-sm bg-[var(--lp-s1)] border-l border-[var(--lp-border2)] px-6 pt-24 pb-8 flex flex-col transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-10">
            <span className="font-[var(--lp-fm)] text-xs tracking-[0.3em] text-[var(--lp-dim)]">
              NAVIGATE
            </span>
            <button
              className="flex items-center justify-center h-9 w-9 rounded-full border border-[var(--lp-border2)]"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center justify-between py-4 border-b border-[var(--lp-border)] font-[var(--lp-fd)] text-2xl tracking-wide text-[var(--lp-text)]"
                onClick={closeMenu}
              >
                {link.label}
                <ArrowUpRight size={18} className="text-[var(--lp-dim)]" />
              </a>
            ))}
          </div>

          <button
            className="lp-jersey-btn mt-auto inline-flex items-center justify-center gap-1.5 bg-[var(--lp-gold)] text-[#100c01] font-[var(--lp-fd)] text-lg tracking-wide py-3.5"
            onClick={goPlay}
          >
            Enter Arena <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 md:px-8 lg:px-12 py-20 md:py-0"
      >
        <div className="animate-[fadeInUp_0.6s_ease-out] mb-2 md:mb-3 lg:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--lp-border2)] bg-[var(--lp-s1)]/80 backdrop-blur-sm font-[var(--lp-fm)] text-[11px] tracking-[0.12em] text-[var(--lp-dim)]">
            <Sparkles
              size={13}
              className="text-[var(--lp-gold)] animate-pulse"
            />
            ON-CHAIN · HOURLY BATTLES · NO PASSIVE YIELD
          </div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto mb-6 md:mb-8 animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
          <div className="relative aspect-[16/10] md:aspect-[2.4/1] max-h-[64vh]">
            <img
              className="absolute inset-0 w-full h-full object-contain opacity-[0.32] md:opacity-[0.6]"
              src={matchupImg}
              alt=""
              aria-hidden="true"
            />

            <div className="absolute inset-0 bg-linear-to-b from-(--lp-bg) via-transparent to-(--lp-bg) opacity-90" />
            <div className="absolute inset-0 grid grid-cols-[1fr_auto_1fr] items-end px-8 md:px-16 lg:px-20">
              <div className="flex justify-start">
                <img
                  className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] object-contain object-bottom filter drop-shadow-[0_30px_60px_rgba(0,87,184,0.5)] animate-[slideInLeft_1s_cubic-bezier(0.22,1,0.36,1)_0.4s_both] hover:scale-105 transition-transform duration-300"
                  src={messiImg}
                  alt="Messi"
                  style={{
                    transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -6}px)`,
                  }}
                />
              </div>

              <div className="relative z-20 flex items-end justify-center pb-4 md:pb-8 px-2 md:px-3 animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_0.6s_both]">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[var(--lp-gold)]/20 blur-xl animate-pulse" />
                  <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full bg-[var(--lp-bg)]/90 backdrop-blur-md border-2 border-[var(--lp-gold)]/30 flex items-center justify-center font-[var(--lp-fd)] text-xl md:text-2xl tracking-wider text-[var(--lp-gold)] shadow-[0_0_40px_rgba(245,197,24,0.2)]">
                    VS
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <img
                  className="w-full max-w-[220px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[420px] object-contain object-bottom filter drop-shadow-[0_30px_60px_rgba(232,0,29,0.5)] animate-[slideInRight_1s_cubic-bezier(0.22,1,0.36,1)_0.4s_both] hover:scale-105 transition-transform duration-300"
                  src={ronaldoImg}
                  alt="Ronaldo"
                  style={{
                    transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -6}px)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="animate-[fadeInUp_0.6s_ease-out_1s_both] text-center max-w-3xl mx-auto">
          <p className="font-[var(--lp-fb)] text-lg md:text-xl text-[var(--lp-text)] mb-1.5">
            Two tokens. Two tribes. One battlefield.
          </p>
          <p className="font-[var(--lp-fb)] text-xl md:text-2xl mb-4 uppercase font-bold">
            Pick your GOAT. Back your side. Battle every hour.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4 justify-center">
            <button
              className="lp-jersey-btn w-full sm:w-56 inline-flex items-center justify-center gap-2 bg-[var(--lp-blue)] text-white font-[var(--lp-fd)] text-lg tracking-wide pl-7 pr-6 py-3.5 hover:brightness-110 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]"
              onClick={goPlay}
            >
              Back Messi
            </button>
            <button
              className="lp-jersey-btn w-full sm:w-56 inline-flex items-center justify-center gap-2 bg-[var(--lp-red)] text-white font-[var(--lp-fd)] text-lg tracking-wide pl-7 pr-6 py-3.5 hover:brightness-110 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--lp-bg)]"
              onClick={goPlay}
            >
              Back Ronaldo
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 py-4 rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-s1)]/60 backdrop-blur-sm">
            {[
              { icon: Trophy, label: "16 battles/day" },
              { icon: Flame, label: "5% burn each round" },
              { icon: Shield, label: "Max loss capped at 50%" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-(--lp-dim)"
              >
                <Icon size={15} className="text-(--lp-gold)" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOKENS */}
      <section
        id="tokens"
        className="relative z-10 max-w-5xl mx-auto px-5 py-20 md:py-28"
      >
        <div data-aos="fade-up">
          <SectionHeading
            icon={Coins}
            label="The tokens"
            title="Two Tribes"
            divider
          />
        </div>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-(--lp-fb) text-(--lp-dim) text-base md:text-lg max-w-xl mb-12"
        >
          Each token represents a global fanbase. Choose a side and help push
          your tribe to victory.
        </p>

        <div className="grid sm:grid-cols-2 gap-5">
          <div data-aos="fade-right" data-aos-delay="150">
            <TokenCard
              ticker="$MESSI"
              accent="var(--lp-blue)"
              description={
                <>
                  Eight Ballon d'Ors. A World Cup champion. The quiet genius who
                  makes football look effortless. Hold{" "}
                  <strong className="font-bold text-[var(--lp-blue)]">
                    $MESSI
                  </strong>{" "}
                  and represent his tribe.
                </>
              }
            />
          </div>
          <div data-aos="fade-left" data-aos-delay="200">
            <TokenCard
              ticker="$RONALDO"
              accent="var(--lp-red)"
              description={
                <>
                  Five Champions League titles. The relentless pursuit of
                  perfection. The machine who never stops chasing more. Hold{" "}
                  <strong className="font-bold text-[var(--lp-red)]">
                    $RONALDO
                  </strong>{" "}
                  and represent his tribe.
                </>
              }
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="mechanism"
        className="relative z-10 max-w-5xl mx-auto px-5 py-20 md:py-28"
      >
        <div data-aos="fade-up">
          <SectionHeading
            icon={Timer}
            label="The mechanism"
            title="How the war works"
            divider
          />
        </div>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-[var(--lp-fb)] text-[var(--lp-dim)] max-w-xl mb-12"
        >
          Each cycle is a battle phase followed by a cooldown. Approximately 16
          battles occur every single day.
        </p>

        <div className="grid sm:grid-cols-[1fr_auto_1fr] items-stretch gap-4 sm:gap-0 mb-8">
          {/* BATTLE — live, loud, saturated */}
          <div
            data-aos="fade-right"
            data-aos-delay="150"
            className="relative rounded-2xl sm:rounded-r-none border border-[var(--lp-green)]/30 bg-gradient-to-br from-[var(--lp-green)]/[0.08] to-[var(--lp-s1)] p-7 overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[var(--lp-green)]/20 blur-3xl" />

            <div className="relative flex items-center justify-between mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lp-green)]/15 border border-[var(--lp-green)]/30">
                <Timer size={16} className="text-[var(--lp-green)]" />
              </div>
              <span className="flex items-center gap-1.5 font-[var(--lp-fm)] text-[10px] tracking-[0.15em] text-[var(--lp-green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--lp-green)] animate-pulse" />
                LIVE NOW
              </span>
            </div>

            <div className="relative font-[var(--lp-fd)] text-6xl text-[var(--lp-green)] leading-none lp-mono-glow">
              60
            </div>
            <div className="relative font-[var(--lp-fm)] text-[11px] tracking-[0.2em] text-[var(--lp-muted)] mt-1 mb-3">
              MINUTES
            </div>
            <p className="relative font-[var(--lp-fb)] text-sm text-[var(--lp-dim)]">
              Battle — bidding is live
            </p>

            {/* mini intensity meter, reuses the same pressure-shift keyframe
          the rest of the app uses for its live tug-of-war fill */}
            <div className="relative mt-5 h-1 w-full rounded-full bg-[var(--lp-s3)] overflow-hidden">
              <div className="lp-pressure-fill h-full rounded-full bg-[var(--lp-green)]" />
            </div>
          </div>

          {/* CONNECTOR — pulsing flow instead of a static one-way arrow,
        so it reads as "repeats forever" rather than "step 1 → step 2" */}
          <div
            data-aos="zoom-in"
            data-aos-delay="300"
            className="hidden sm:flex flex-col items-center justify-center w-16 bg-[var(--lp-s1)] border-y border-[var(--lp-border2)] gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lp-green)] animate-pulse" />
            <ArrowRight size={16} className="text-[var(--lp-muted)]" />
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--lp-dim)] animate-pulse"
              style={{ animationDelay: "0.4s" }}
            />
          </div>

          {/* COOLDOWN — deliberately quiet, sells contrast against battle card */}
          <div
            data-aos="fade-left"
            data-aos-delay="150"
            className="rounded-2xl sm:rounded-l-none border border-[var(--lp-border2)] bg-[var(--lp-s1)] p-7 opacity-80"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--lp-s2)] border border-[var(--lp-border2)]">
                <Timer size={16} className="text-[var(--lp-dim)]" />
              </div>
              <span className="font-[var(--lp-fm)] text-[10px] tracking-[0.15em] text-[var(--lp-muted)]">
                SETTLING
              </span>
            </div>

            <div className="font-[var(--lp-fd)] text-6xl text-[var(--lp-dim)] leading-none">
              30
            </div>
            <div className="font-[var(--lp-fm)] text-[11px] tracking-[0.2em] text-[var(--lp-muted)] mt-1 mb-3">
              MINUTES
            </div>
            <p className="font-[var(--lp-fb)] text-sm text-[var(--lp-dim)]">
              Cooldown — results settle
            </p>
          </div>
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="flex items-center gap-3 rounded-xl border border-[var(--lp-border)] bg-[var(--lp-s1)]/60 px-5 py-3.5 font-[var(--lp-fm)] text-sm"
        >
          <span className="text-[var(--lp-gold)]">~16 battles/day</span>
          <span className="text-[var(--lp-muted)]">—</span>
          <span className="text-[var(--lp-dim)]">
            every round, one tribe wins, one tribe loses
          </span>
        </div>
      </section>

      {/* WIN / LOSE */}
      <section
        id="rewards"
        className="relative z-10 max-w-5xl mx-auto px-5 py-20 md:py-28"
      >
        <div data-aos="fade-up">
          <SectionHeading
            icon={Swords}
            label="The stakes"
            title="Win or lose"
            divider
          />
        </div>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-[var(--lp-fb)] text-[var(--lp-dim)] max-w-xl mb-12"
        >
          The side with the larger total bid wins the round. No grey area.
        </p>

        <div className="relative grid sm:grid-cols-2 gap-5">
          {/* WIN */}
          <div
            data-aos="fade-right"
            data-aos-delay="150"
            className="group relative rounded-2xl border border-[var(--lp-green)]/25 bg-gradient-to-b from-[var(--lp-green)]/[0.06] to-transparent p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--lp-green)]/50 hover:shadow-[0_20px_60px_-15px_rgba(0,200,80,0.35)]"
          >
            <div className="absolute -top-8 -right-4 h-40 w-40 rounded-full bg-[var(--lp-green)]/15 blur-3xl transition-opacity duration-500 group-hover:opacity-150" />

            {/* Ghost watermark — the number someone skims and remembers */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-2 -bottom-6 font-[var(--lp-fd)] text-[7rem] leading-none text-[var(--lp-green)]/[0.08] select-none"
            >
              100%
            </div>

            <div className="relative flex items-center justify-between mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lp-green)]/15 border border-[var(--lp-green)]/30">
                <Trophy size={18} className="text-[var(--lp-green)]" />
              </div>
              <span className="font-[var(--lp-fm)] text-[10px] tracking-[0.15em] text-[var(--lp-green)]">
                NO LOSS
              </span>
            </div>

            <div className="relative font-[var(--lp-fd)] text-2xl tracking-wide text-[var(--lp-green)] mb-5">
              IF YOU WIN
            </div>

            <ul className="relative flex flex-col gap-3">
              {[
                "100% of your original bid returned",
                "Your share of the losing pool rewards",
                "Keep all your tokens — nothing burned",
              ].map((t, i) => (
                <li
                  key={t}
                  data-aos="fade-up"
                  data-aos-delay={200 + i * 80}
                  className="flex items-start gap-2.5 text-sm text-[var(--lp-dim)]"
                >
                  <CheckCircle2
                    size={16}
                    className="text-[var(--lp-green)] mt-0.5 shrink-0"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* CENTER DIVIDER — desktop only, echoes the mechanism section's
        connector so the two "vs" moments in the page feel related */}
          <div
            data-aos="zoom-in"
            data-aos-delay="300"
            className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-14 w-14 items-center justify-center rounded-full bg-[var(--lp-bg)] border-2 border-[var(--lp-gold)]/30 shadow-[0_0_30px_rgba(245,197,24,0.15)]"
          >
            <span className="font-[var(--lp-fd)] text-sm tracking-wide text-[var(--lp-gold)]">
              VS
            </span>
          </div>

          {/* LOSE */}
          <div
            data-aos="fade-left"
            data-aos-delay="150"
            className="group relative rounded-2xl border border-[var(--lp-red)]/25 bg-gradient-to-b from-[var(--lp-red)]/[0.06] to-transparent p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--lp-red)]/50 hover:shadow-[0_20px_60px_-15px_rgba(232,0,29,0.35)]"
          >
            <div className="absolute -top-8 -left-4 h-40 w-40 rounded-full bg-[var(--lp-red)]/15 blur-3xl transition-opacity duration-500 group-hover:opacity-150" />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-2 -bottom-6 font-[var(--lp-fd)] text-[7rem] leading-none text-[var(--lp-red)]/[0.08] select-none"
            >
              −50%
            </div>

            <div className="relative flex items-center justify-between mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lp-red)]/15 border border-[var(--lp-red)]/30">
                <TrendingDown size={18} className="text-[var(--lp-red)]" />
              </div>
              <span className="font-[var(--lp-fm)] text-[10px] tracking-[0.15em] text-[var(--lp-red)]">
                CAPPED LOSS
              </span>
            </div>

            <div className="relative font-[var(--lp-fd)] text-2xl tracking-wide text-[var(--lp-red)] mb-5">
              IF YOU LOSE
            </div>

            <ul className="relative flex flex-col gap-3">
              {[
                "50% of your bid is returned to you",
                "50% enters the reward pool",
                "Maximum loss is 50% of your bid",
              ].map((t, i) => (
                <li
                  key={t}
                  data-aos="fade-up"
                  data-aos-delay={200 + i * 80}
                  className="flex items-start gap-2.5 text-sm text-[var(--lp-dim)]"
                >
                  <XCircle
                    size={16}
                    className="text-[var(--lp-red)] mt-0.5 shrink-0"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* REWARDS BREAKDOWN */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 py-20 md:py-28">
        <div data-aos="fade-up">
          <SectionHeading
            icon={PieChart}
            label="The spoils"
            title="Reward distribution"
          />
        </div>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-[var(--lp-fb)] text-[var(--lp-dim)] max-w-xl mb-12"
        >
          From the losing side's 50%, rewards flow to winners, the lucky, and
          the ecosystem.
        </p>

        <div className="grid md:grid-cols-[1fr_auto] gap-12 items-center">
          <div className="flex flex-col gap-5">
            {rewardRows.map((r, i) => (
              <div
                key={r.title}
                data-aos="fade-right"
                data-aos-delay={i * 80}
                className="flex items-center gap-5"
              >
                <div
                  className="font-[var(--lp-fm)] text-lg w-14 shrink-0 lp-mono-glow"
                  style={{ color: r.color }}
                >
                  {r.pct}
                </div>
                <div className="flex-1">
                  <div className="font-[var(--lp-fb)] font-semibold text-[var(--lp-text)] text-sm">
                    {r.title}
                  </div>
                  <div className="font-[var(--lp-fb)] text-[var(--lp-dim)] text-xs mb-2">
                    {r.desc}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--lp-s3)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: r.fill, background: r.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div data-aos="donut-draw" data-aos-delay="200">
            <svg
              viewBox="0 0 260 260"
              className="w-56 mx-auto md:w-64"
              aria-label="Reward split donut chart"
              role="img"
            >
              <defs>
                <filter id="lp-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx="130"
                cy="130"
                r="95"
                fill="none"
                stroke="var(--lp-s3)"
                strokeWidth="30"
              />
              {rewardRows.map((r, i) => (
                <circle
                  key={r.title}
                  className="lp-donut-seg"
                  cx="130"
                  cy="130"
                  r="95"
                  fill="none"
                  stroke={r.color}
                  strokeWidth="30"
                  strokeLinecap="round"
                  strokeDasharray={`${r.dash} ${596.9 - r.dash}`}
                  transform="rotate(-90 130 130)"
                  filter={i === 0 ? "url(#lp-glow)" : undefined}
                  style={
                    {
                      "--seg-dash": r.dash,
                      "--seg-offset": r.offset,
                      "--seg-delay": `${i * 120}ms`,
                    } as React.CSSProperties
                  }
                />
              ))}
              <text
                x="130"
                y="123"
                textAnchor="middle"
                fontFamily="'Bebas Neue',sans-serif"
                fontSize="32"
                fill="var(--lp-text)"
              >
                50%
              </text>
              <text
                x="130"
                y="141"
                textAnchor="middle"
                fontFamily="'DM Sans',sans-serif"
                fontSize="11"
                fill="var(--lp-dim)"
              >
                losing pool
              </text>
              <text
                x="130"
                y="156"
                textAnchor="middle"
                fontFamily="'DM Sans',sans-serif"
                fontSize="10"
                fill="var(--lp-muted)"
              >
                distributed
              </text>
            </svg>
          </div>
        </div>
      </section>

      {/* RISK WARNING */}
      <section
        id="risk"
        data-aos="fade-up"
        className="relative z-10 max-w-5xl mx-auto px-5 py-10"
      >
        <div className="relative flex gap-4 rounded-2xl border border-[var(--lp-gold)]/25 bg-[var(--lp-s1)] py-6 pl-7 pr-6 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-[var(--lp-gold)]" />
          <AlertTriangle
            size={22}
            className="text-[var(--lp-gold)] shrink-0 mt-0.5"
          />
          <div>
            <div className="font-[var(--lp-fd)] text-lg tracking-wide text-[var(--lp-gold)] mb-1.5">
              RISK WARNING
            </div>
            <p className="font-[var(--lp-fb)] text-sm leading-relaxed text-[var(--lp-dim)]">
              This is a competitive crypto game. Participants can lose up to 50%
              of their bid in a single round. Rewards are not guaranteed. Only
              participate with funds you are fully prepared to risk. This is not
              financial advice.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 py-24 md:py-32">
        <h2
          data-aos="zoom-in"
          className="font-[var(--lp-fd)] text-5xl md:text-7xl tracking-wide mb-4"
        >
          <span className="text-[var(--lp-blue)]">MESSI</span>
          <span className="text-[var(--lp-muted)] mx-2 font-[var(--lp-fb)] text-2xl md:text-3xl align-middle">
            or
          </span>
          <span className="text-[var(--lp-red)]">RONALDO</span>
        </h2>
        <p
          data-aos="fade-up"
          data-aos-delay="100"
          className="font-[var(--lp-fb)] text-[var(--lp-dim)] mb-10"
        >
          Choose your side. Join the arena. One tribe wins every hour.
        </p>
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <button
            className="lp-jersey-btn inline-flex items-center justify-center gap-2 bg-[var(--lp-blue)] text-white font-[var(--lp-fd)] text-xl tracking-wide pl-9 pr-8 py-4 hover:brightness-110 transition-[filter]"
            onClick={goPlay}
          >
            Team Messi <ChevronRight size={18} />
          </button>
          <button
            className="lp-jersey-btn inline-flex items-center justify-center gap-2 bg-[var(--lp-red)] text-white font-[var(--lp-fd)] text-xl tracking-wide pl-9 pr-8 py-4 hover:brightness-110 transition-[filter]"
            onClick={goPlay}
          >
            Team Ronaldo <ChevronRight size={18} />
          </button>
        </div>
        <p className="font-[var(--lp-fm)] text-xs tracking-[0.15em] text-[var(--lp-muted)]">
          BUILT ON SOLANA · POWERED BY ANCHOR · FULLY ON-CHAIN
        </p>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[var(--lp-border)] px-5 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img className="h-6 w-6 object-contain" src={matchupImg} alt="" />
            <span className="font-[var(--lp-fb)] text-sm text-[var(--lp-dim)]">
              MESSI VS RONALDO — The Ultimate On-Chain Rivalry
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm text-[var(--lp-dim)] hover:text-[var(--lp-text)] transition-colors"
            >
              <ExternalLink size={14} /> X
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm text-[var(--lp-dim)] hover:text-[var(--lp-text)] transition-colors"
            >
              <Send size={14} /> Telegram
            </a>
            <button
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--lp-text)] hover:text-[var(--lp-gold)] transition-colors"
              onClick={goPlay}
            >
              Enter App <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---- Local presentational helpers ---- */

function SectionHeading({
  icon: Icon,
  label,
  title,
  divider = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  title: string;
  divider?: boolean;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-[var(--lp-gold)]" />
        <span className="font-[var(--lp-fm)] text-[11px] tracking-[0.2em] text-[var(--lp-dim)] uppercase">
          {label}
        </span>
        {divider && (
          <span
            aria-hidden="true"
            className="hidden md:block flex-1 h-px self-center bg-(--lp-gold)"
            style={{
              maskImage: "linear-gradient(to right, black, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black, transparent)",
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-5">
        <h2 className="font-[var(--lp-fd)] text-4xl font-bold uppercase md:text-5xl tracking-wide text-[var(--lp-text)]">
          {title}
        </h2>
      </div>
    </div>
  );
}

function TokenCard({
  ticker,
  accent,
  description,
}: {
  ticker: string;
  accent: string;
  description: React.ReactNode;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-[var(--lp-border2)] bg-[var(--lp-s1)] p-7 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{ boxShadow: `0 0 0 1px transparent` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-70 transition-all duration-500 group-hover:h-1"
        style={{ background: accent }}
      />
      <div className="mb-8">
        <div
          className="font-bold text-2xl lg:text-3xl tracking-wide transition-all duration-300 group-hover:scale-105"
          style={{ color: accent }}
        >
          {ticker}
        </div>
      </div>
      <p className="font-[var(--lp-fb)] text-sm leading-relaxed text-[var(--lp-dim)] lg:text-base">
        {description}
      </p>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-white/[0.02] transition-all duration-500 pointer-events-none" />
    </div>
  );
}
