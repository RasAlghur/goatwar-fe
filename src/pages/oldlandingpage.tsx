import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

export function LandingPage() {
    const navigate = useNavigate();

    const goPlay = () => navigate("/arena");

    return (
        <div className="lp-root">
            {/* NAV */}
            <nav className="lp-nav">
                <div className="lp-brand">⚽ M VS R</div>
                <div className="lp-nav-right">
                    <button className="lp-btn-gold" onClick={goPlay}>Enter Arena →</button>
                </div>
            </nav>

            {/* HERO */}
            <section className="lp-hero">
                <div className="lp-eyebrow">
                    <span className="lp-eyebrow-line" />
                    On-Chain · Every Hour · No Passive Yield
                    <span className="lp-eyebrow-line" />
                </div>

                <h1 className="lp-title">
                    <span className="lp-title-red">MESSI</span>
                    <span className="lp-title-vs">VS</span>
                    <span className="lp-title-blue">RONALDO</span>
                </h1>

                <p className="lp-subtitle">Two tokens. Two tribes. One battlefield.</p>
                <p className="lp-tagline">Pick your GOAT. Back your side. Battle every hour.</p>

                <div className="lp-cta-row">
                    <button className="lp-cta-red" onClick={goPlay}>🇦🇷 Back Messi</button>
                    <button className="lp-cta-blue" onClick={goPlay}>🇵🇹 Back Ronaldo</button>
                </div>

                {/* <div className="lp-ticker">
                    <span className="lp-pulse" />
                    <span className="lp-ticker-val">LIVE</span>
                    <span className="lp-ticker-sep">|</span>
                    <span>Round <strong>#{roundNum}</strong></span>
                    <span className="lp-ticker-sep">|</span>
                    <span>
                        {phase === "BATTLE" ? "Battle ends in" : "Next battle in"}&nbsp;
                        <strong>{fmt(timeLeft)}</strong>
                    </span>
                    <span className="lp-ticker-sep">|</span>
                    <span><strong>~16</strong> battles/day</span>
                </div> */}
            </section>

            {/* TOKENS */}
            <section className="lp-section">
                <div className="lp-sec-label">The tokens</div>
                <h2 className="lp-sec-title">Two Tribes</h2>
                <p className="lp-sec-sub">
                    Each token represents a global fanbase. Choose a side and help push your tribe to victory.
                </p>
                <div className="lp-tokens-grid">
                    <div className="lp-token-card lp-token-messi">
                        <span className="lp-token-flag">🇦🇷</span>
                        <div className="lp-token-ticker lp-token-ticker-red">$MESSI</div>
                        <p className="lp-token-desc">
                            The greatest of all time. Eight Ballon d'Ors. World Cup champion. The quiet genius who
                            makes football look effortless. Hold $MESSI and represent Argentina's finest.
                        </p>
                    </div>
                    <div className="lp-token-card lp-token-ronaldo">
                        <span className="lp-token-flag">🇵🇹</span>
                        <div className="lp-token-ticker lp-token-ticker-blue">$RONALDO</div>
                        <p className="lp-token-desc">
                            The machine. Five Champions League titles. The relentless pursuit of perfection. Hold
                            $RONALDO and stand with one of sport's most decorated athletes ever.
                        </p>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="lp-section">
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
            <section className="lp-section">
                <div className="lp-sec-label">The stakes</div>
                <h2 className="lp-sec-title">Win or lose</h2>
                <p className="lp-sec-sub">
                    The side with the larger total bid wins the round. No grey area.
                </p>
                <div className="lp-outcomes-grid">
                    <div className="lp-outcome-win">
                        <div className="lp-outcome-icon">🏆</div>
                        <div className="lp-outcome-title lp-green">IF YOU WIN</div>
                        {[
                            "100% of your original bid returned",
                            "Your share of the losing pool rewards",
                            "Keep all your tokens — nothing burned",
                        ].map((t) => (
                            <div className="lp-outcome-item lp-outcome-item-win" key={t}>{t}</div>
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
                            <div className="lp-outcome-item lp-outcome-item-loss" key={t}>{t}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* REWARDS */}
            <section className="lp-section">
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
                                <div className="lp-reward-pct" style={{ color: r.color }}>{r.pct}</div>
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

                    {/* Donut SVG */}
                    <svg viewBox="0 0 260 260" className="lp-donut">
                        <circle cx="130" cy="130" r="95" fill="none" stroke="var(--lp-s3)" strokeWidth="36" />
                        {/* 25% */}
                        <circle cx="130" cy="130" r="95" fill="none" stroke="#00c850" strokeWidth="36"
                            strokeDasharray="149.2 447.6" strokeDashoffset="0"
                            transform="rotate(-90 130 130)" />
                        {/* 10% */}
                        <circle cx="130" cy="130" r="95" fill="none" stroke="#f5c518" strokeWidth="36"
                            strokeDasharray="59.7 537.1" strokeDashoffset="-149.2"
                            transform="rotate(-90 130 130)" />
                        {/* 5% */}
                        <circle cx="130" cy="130" r="95" fill="none" stroke="#a78bfa" strokeWidth="36"
                            strokeDasharray="29.8 566.9" strokeDashoffset="-208.9"
                            transform="rotate(-90 130 130)" />
                        {/* 5% burn */}
                        <circle cx="130" cy="130" r="95" fill="none" stroke="#e8001d" strokeWidth="36"
                            strokeDasharray="29.8 566.9" strokeDashoffset="-238.7"
                            transform="rotate(-90 130 130)" />
                        {/* 5% chest */}
                        <circle cx="130" cy="130" r="95" fill="none" stroke="#8892a4" strokeWidth="36"
                            strokeDasharray="29.8 566.9" strokeDashoffset="-268.5"
                            transform="rotate(-90 130 130)" />
                        {/* remaining 50% returned */}
                        <circle cx="130" cy="130" r="95" fill="none" stroke="var(--lp-s2)" strokeWidth="36"
                            strokeDasharray="298.5 298.5" strokeDashoffset="-298.3"
                            transform="rotate(-90 130 130)" />
                        <text x="130" y="123" textAnchor="middle" fontFamily="'Bebas Neue',sans-serif"
                            fontSize="32" fill="var(--lp-text)">50%</text>
                        <text x="130" y="141" textAnchor="middle" fontFamily="'DM Sans',sans-serif"
                            fontSize="11" fill="var(--lp-dim)">losing pool</text>
                        <text x="130" y="156" textAnchor="middle" fontFamily="'DM Sans',sans-serif"
                            fontSize="10" fill="var(--lp-muted)">distributed</text>
                    </svg>
                </div>
            </section>

            {/* CLAIM TIMING */}
            <section className="lp-section">
                <div className="lp-sec-label">Reward timing</div>
                <h2 className="lp-sec-title">When you can claim</h2>
                <p className="lp-sec-sub">
                    Rewards are not instantly claimable — they unlock when the next round begins.
                </p>
                <div className="lp-timing-card">
                    <p className="lp-timing-note">
                        Rewards from Round 1 become claimable when Round 2 begins. During the 30-minute
                        cooldown, results are calculated and finalized on-chain.
                    </p>
                    <div className="lp-timing-flow">
                        {[
                            { label: "ROUND 1", sub: "60 min bidding", title: "BATTLE", active: false },
                            { label: "COOLDOWN", sub: "30 min finalize", title: "SETTLE", active: true },
                            { label: "ROUND 2", sub: "Round 1 rewards live", title: "CLAIM ✓", active: false },
                            { label: "ONGOING", sub: "Cycle repeats", title: "BATTLE", active: false },
                        ].map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center" }}>
                                <div className={`lp-timing-step ${s.active ? "lp-timing-active" : ""}`}>
                                    <div className="lp-ts-label">{s.label}</div>
                                    <div className="lp-ts-title">{s.title}</div>
                                    <div className="lp-ts-sub">{s.sub}</div>
                                </div>
                                {i < 3 && <div className="lp-timing-arrow">→</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY DIFFERENT */}
            <section className="lp-section">
                <div className="lp-sec-label">Why this is different</div>
                <h2 className="lp-sec-title">Not staking. Not yield.</h2>
                <p className="lp-sec-sub">
                    This is live competitive DeFi. Every round one tribe wins and one tribe loses. That's the whole point.
                </p>
                <div className="lp-why-grid">
                    {[
                        { icon: "⚔️", title: "LIVE COMPETITION", desc: "Every round is a real contest with real outcomes. Your tribe either wins or loses — no smoothing, no hedging." },
                        { icon: "⏱️", title: "HOURLY CYCLES", desc: "16 battles per day. Each one is a fresh start. Yesterday's loss can be reversed in the next round." },
                        { icon: "🔥", title: "DEFLATIONARY", desc: "5% of every losing pool is burned forever. Every battle reduces total supply — there's skin in the game." },
                        { icon: "🎲", title: "RANDOM WINNERS", desc: "A 5% random reward keeps every participant engaged — even small bidders can take the lucky pool." },
                        { icon: "🔗", title: "FULLY ON-CHAIN", desc: "Built on Solana. Every bid, every result, every payout — all verifiable on-chain with no middlemen." },
                        { icon: "🛡️", title: "CAPPED LOSS", desc: "Maximum downside is 50% of your bid per round. You always retain half — designed for repeat play." },
                    ].map((w) => (
                        <div className="lp-why-card" key={w.title}>
                            <div className="lp-why-icon">{w.icon}</div>
                            <div className="lp-why-title">{w.title}</div>
                            <p className="lp-why-desc">{w.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* WAR CHEST */}
            <section className="lp-section">
                <div className="lp-sec-label">The treasury</div>
                <h2 className="lp-sec-title">War Chest</h2>
                <p className="lp-sec-sub">
                    5% of every losing pool flows to the War Chest — the engine that sustains the ecosystem.
                </p>
                <div className="lp-chest-card">
                    <div>
                        <div className="lp-chest-pct">5%</div>
                        <div className="lp-chest-label">EVERY LOSING POOL</div>
                    </div>
                    <div>
                        <p className="lp-chest-body">
                            The War Chest grows with every battle. It exists to ensure the protocol can sustain
                            itself, support liquidity, and fund future battles and ecosystem growth.
                        </p>
                        <div className="lp-chest-uses">
                            {[
                                "Liquidity support for both tokens",
                                "Marketing and community growth",
                                "Special event battles and prizes",
                                "Protocol development and security",
                            ].map((u) => (
                                <div className="lp-chest-use" key={u}>▸ {u}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Risk */}
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
            <div className="lp-final">
                <h2 className="lp-final-title">
                    <span className="lp-title-red">MESSI</span>
                    <span className="lp-final-or"> or </span>
                    <span className="lp-title-blue">RONALDO</span>
                </h2>
                <p className="lp-final-sub">Choose your side. Join the arena. One tribe wins every hour.</p>
                <div className="lp-final-btns">
                    <button className="lp-cta-red lp-cta-lg" onClick={goPlay}>🇦🇷 Team Messi</button>
                    <button className="lp-cta-blue lp-cta-lg" onClick={goPlay}>🇵🇹 Team Ronaldo</button>
                </div>
                <p className="lp-final-note">Built on Solana · Powered by Anchor · Fully on-chain</p>
            </div>

            {/* FOOTER */}
            <footer className="lp-footer">
                <div>⚽ MESSI VS RONALDO — The Ultimate On-Chain Rivalry</div>
                <div className="lp-footer-links">
                    <a href="#" className="lp-footer-link">X/Twitter</a>
                    <a href="#" className="lp-footer-link">Telegram</a>
                    <button className="lp-footer-cta" onClick={goPlay}>Enter App →</button>
                </div>
            </footer>
        </div>
    );
}