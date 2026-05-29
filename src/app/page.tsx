"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CopyEmail } from "@/components/CopyEmail";
import { CurtainReveal } from "@/components/CurtainReveal";
import { DemoBanner } from "@/components/DemoBanner";
import { DomainForm } from "@/components/DomainForm";
import { EasterEggDetector } from "@/components/EasterEggDetector";
import { LiveClock } from "@/components/LiveClock";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { Shell } from "@/components/Shell";
import { getDemoOrchestrator } from "@/lib/demo/demo_orchestrator";

/* ───────────────────────── Content data ───────────────────────── */

const engines = [
  { n: "01", tag: "Linkup /search",   title: "Commercial Footprint",    body: "Pricing models, PLG vs SLG signals, onboarding friction, conversion funnel signals." },
  { n: "02", tag: "Linkup /search",   title: "Technical Stack",         body: "Languages, cloud infra, databases, vendor deps, open-source posture, tech-debt signals." },
  { n: "03", tag: "/fetch PDF",       title: "ESG Posture",             body: "Scope 1/2/3 emissions, DEI initiatives, sustainability reports, supplier risk profile." },
  { n: "04", tag: "Linkup /search",   title: "EU AI Act Risk",          body: "AI feature inventory, risk tiering, governance signals, missing disclosures." },
  { n: "05", tag: "Linkup /search",   title: "Competitive Map",         body: "Direct + indirect competitors, moat strength, market position, differentiators." },
  { n: "06", tag: "Linkup /research", title: "Red Flags & Risk",        body: "Lawsuits, breaches, regulatory actions, layoffs, fraud cross-references." },
  { n: "07", tag: "/fetch PDF",       title: "Financial Deep Dive",     body: "Funding rounds, valuation trajectory, revenue estimates, profitability signals." },
  { n: "08", tag: "Linkup /search",   title: "Leadership & Culture",    body: "Key executives, Glassdoor, hiring velocity, founder-led status, key-person risk." },
  { n: "09", tag: "Linkup /search",   title: "Market Sizing",           body: "TAM/SAM/SOM, CAGR, tailwinds, headwinds, industry positioning." },
  { n: "10", tag: "/fetch PDF",       title: "Annual Report",           body: "10-K filings extracted via PDF /fetch — revenue, audit opinion, risk factors verbatim." },
];

const featuredTwins = [
  {
    idx: "TWN—001",
    name: "Stripe.com",
    verdict: "Buy",
    href: "/dashboard/demo-stripe",
    summary: "Generational platform with profitability achieved, $16.5B gross revenue, and the strongest developer moat in fintech.",
  },
  {
    idx: "TWN—002",
    name: "Figma.com",
    verdict: "Buy",
    href: "/dashboard/demo-figma",
    summary: "Post-Adobe-block IPO path with $749M ARR, 4M+ active users, and AI-native design tooling as new wedge.",
  },
  {
    idx: "TWN—003",
    name: "Acme-batteries.in",
    verdict: "Pass",
    href: "/dashboard/demo-acme-batteries",
    summary: "Udyam registration mismatch, MCA filings contradict employee claims, revenue figures unverifiable — flagged fraudulent.",
  },
];

const accolades = [
  {
    tag: "Built in 96 hours",
    title: "Linkup Async Hackathon — May 2026",
    body: "Ten parallel intelligence engines, source-cited synthesis, PDF /fetch + /research deep dive, live diff alerts.",
  },
  {
    tag: "Production-grade",
    title: "Source-cited, Diffable, Queryable",
    body: "Every claim links to its source URL. Twins are structured JSON — diffable across snapshots, queryable via API.",
  },
  {
    tag: "Open architecture",
    title: "AI Gateway + Linkup + Next.js 15",
    body: "Linkup /search, /research, /fetch (PDF-capable) wired through Vercel AI Gateway. Edge-deployable, fully typed.",
  },
];

const stack = [
  {
    h: "Intelligence",
    items: ["Linkup /search", "Linkup /research", "Linkup /fetch (PDF)", "Vercel AI Gateway", "Anthropic Sonnet 4.5"],
  },
  {
    h: "Frontend",
    items: ["Next.js 15 (App Router)", "React 19 + RSC", "Tailwind v4", "Instrument Serif + Geist"],
  },
  {
    h: "Infrastructure",
    items: ["Vercel Edge", "Turbopack dev", "GitHub Actions CI", "TypeScript 5.4", "Zod validation"],
  },
  {
    h: "Quality",
    items: ["Schema-typed JSON", "Source-cited claims", "Diffable snapshots", "Risk-scored radar", "PDF document extraction"],
  },
];

const marqueeItems = [
  "Stripe", "Figma", "Linear", "Notion", "Vercel", "OpenAI", "Anthropic",
  "Cursor", "Perplexity", "Mistral", "Acme Batteries", "Mercury", "Ramp",
];

/* ──────────────────────────── Page ──────────────────────────── */

export default function Home() {
  const router = useRouter();

  const onSeedDemos = () => {
    getDemoOrchestrator().seedDemoTwins();
    router.push("/dashboard/demo-stripe");
  };
  const onResetAll = () => getDemoOrchestrator().resetAll();

  return (
    <>
      <CurtainReveal />

      <Shell>
        <DemoBanner />

        {/* ──────────── Top bar ──────────── */}
        <header className="topbar">
          <div className="wrap topbar-inner">
            <div className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-nav.png" alt="Syntra" height={26} style={{ objectFit: "contain", display: "block" }} />
              <span>syntra</span>
              <span className="status">
                <span className="pulse-dot" />
                {process.env.NEXT_PUBLIC_SYNTRA_DEMO_MODE === "true" ? "Live · Demo Mode" : "Live"}
              </span>
            </div>

            <nav className="nav" aria-label="Primary">
              <a href="#index"    data-section="index"><span className="idx">00</span><span>Index</span></a>
              <a href="#engines"  data-section="engines"><span className="idx">01</span><span>Engines</span></a>
              <a href="#twins"    data-section="twins"><span className="idx">02</span><span>Twins</span></a>
              <a href="#why"      data-section="why"><span className="idx">03</span><span>Why</span></a>
              <a href="#stack"    data-section="stack"><span className="idx">04</span><span>Stack</span></a>
              <a href="#contact"  data-section="contact"><span className="idx">05</span><span>Contact</span></a>
            </nav>

            <div className="bar-right">
              <LiveClock />
              <Link href="/dashboard/demo-stripe" className="pill">
                Try a Twin <span className="arrow">↗</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ──────────── Hero ──────────── */}
        <section className="hero" id="index">
          <div className="wrap">
            <div className="hero-grid">
              {/* LEFT */}
              <div>
                <div className="eyebrow">
                  Linkup Async Hackathon · 96h build · Coimbatore, IN · May 2026
                </div>

                <EasterEggDetector taps={4} onActivate={onSeedDemos}>
                  <h1>
                    Know any company,
                    <br />
                    <span className="squiggle">deeply</span>
                    <span style={{ color: "var(--accent)" }}>.</span>
                  </h1>
                </EasterEggDetector>

                <div className="hero-sub">
                  <p className="lede">
                    Drop a domain. Syntra fires <strong>10 intelligence engines</strong> in parallel
                    and builds a living <strong>Twin</strong> — a structured, source-cited, diffable
                    company object. PDF filings extracted. Deep research synthesised. Risks
                    surfaced. Verdict delivered in under five minutes.
                  </p>
                  <div className="hero-meta">
                    <div className="hero-meta-row"><span>Engines</span><span>10 parallel</span></div>
                    <div className="hero-meta-row"><span>Latency</span><span>{"<"} 5 min</span></div>
                    <div className="hero-meta-row"><span>Citation</span><span>100% source-linked</span></div>
                    <div className="hero-meta-row"><span>PDF</span><span>up to 20 MB · /fetch</span></div>
                    <div className="hero-meta-row"><span>Build</span><span>96h · production-grade</span></div>
                  </div>
                </div>

                <div className="hero-cta">
                  <Link href="/dashboard/demo-stripe" className="btn btn-primary">
                    See a live Twin <span className="arrow">→</span>
                  </Link>
                  <Link href="/compare?a=demo-stripe&b=demo-figma" className="btn btn-ghost">
                    Diff two companies <span className="arrow">↗</span>
                  </Link>
                  <Link href="/reports" className="btn btn-ghost">
                    All reports <span className="arrow">↗</span>
                  </Link>
                </div>

                <div className="stats">
                  {[
                    { v: "10",     l: "parallel engines" },
                    { v: "< 5 min", l: "full report" },
                    { v: "100%",   l: "source-cited" },
                    { v: "20 MB",  l: "PDF /fetch" },
                  ].map(({ v, l }) => (
                    <div key={l}>
                      <div className="stat-v">{v}</div>
                      <div className="stat-l">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — form card */}
              <Reveal delay={120}>
                <div className="hero-card">
                  <p style={{ fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>
                    Analyse a company
                  </p>
                  <DomainForm />

                  <div style={{ margin: "26px 0 18px", height: 1, background: "var(--rule)" }} />

                  <p style={{ fontFamily: "var(--t-mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>
                    What you get
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                    {[
                      "Investment verdict · Buy / Hold / Pass",
                      "Risk radar across 7 dimensions",
                      "Annual-report PDF extraction",
                      "Red-flag screening · deep research",
                      "Competitor + moat analysis",
                      "Every claim linked to its source",
                    ].map((item, i) => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>
                        <span style={{ fontFamily: "var(--t-mono)", color: "var(--accent)", flexShrink: 0, fontSize: 11, marginTop: 1, opacity: 0.8 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link href="/dashboard/demo-stripe" className="draw-link" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginTop: 24, padding: "12px 16px",
                    border: "1px solid var(--rule)", borderRadius: 10,
                    fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--ink-2)",
                  }}>
                    <span>Skip to Stripe demo</span>
                    <span style={{ color: "var(--accent)" }}>→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ──────────── Marquee ──────────── */}
        <Marquee items={marqueeItems} />

        {/* ──────────── Engines (§ 01) ──────────── */}
        <section id="engines" style={{ padding: "clamp(80px, 9vw, 128px) 0" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div>
                  <div className="section-label"><span className="sn">§ 01</span> Intelligence Engines</div>
                  <h2 className="section-title">Ten parallel searches.<br />One living Twin.</h2>
                </div>
                <p className="section-note">
                  Each engine runs independently with its own Linkup search strategy, then
                  synthesises findings into structured, diffable JSON. Six engines use
                  <strong style={{ color: "var(--ink-2)" }}>/search</strong>, two use
                  <strong style={{ color: "var(--ink-2)" }}>/research</strong>, and three pull from
                  <strong style={{ color: "var(--ink-2)" }}>/fetch PDF</strong>.
                </p>
              </div>
            </Reveal>

            <EasterEggDetector taps={3} onActivate={() => getDemoOrchestrator().engineDegradationGraceful()}>
              <div className="engines">
                {engines.map((e, i) => (
                  <Reveal key={e.n} delay={i * 40}>
                    <article className="engine">
                      <div className="engine-head">
                        <span className="engine-num">{e.n}</span>
                        <span className="engine-tag">{e.tag}</span>
                      </div>
                      <h3 className="engine-title">{e.title}</h3>
                      <p className="engine-body">{e.body}</p>
                      <Link href="/dashboard/demo-stripe" className="engine-link draw-link">
                        See output <span>→</span>
                      </Link>
                    </article>
                  </Reveal>
                ))}
              </div>
            </EasterEggDetector>
          </div>
        </section>

        {/* ──────────── Selected Twins (§ 02) ──────────── */}
        <section id="twins" style={{ padding: "clamp(60px, 7vw, 96px) 0" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div>
                  <div className="section-label"><span className="sn">§ 02</span> Selected Twins</div>
                  <h2 className="section-title">Three companies. Three verdicts.</h2>
                </div>
                <p className="section-note">
                  Every Twin is a structured object — risk scores, competitor map, financial
                  highlights, red flags, executive memo. Cited end-to-end.
                </p>
              </div>
            </Reveal>

            <div className="twins">
              {featuredTwins.map((t, i) => (
                <Reveal key={t.idx} delay={i * 80}>
                  <Link href={t.href} className="twin">
                    <div className="twin-idx">{t.idx}</div>
                    <h3 className="twin-name">
                      {t.name}
                      <span className="domain">{t.name.toLowerCase()}</span>
                    </h3>
                    <p className="twin-summary">{t.summary}</p>
                    <span className={`twin-verdict ${t.verdict.toLowerCase()}`}>{t.verdict}</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── Why this matters (§ 03) ──────────── */}
        <section id="why" style={{ padding: "clamp(80px, 9vw, 128px) 0", borderTop: "1px solid var(--rule)" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div>
                  <div className="section-label"><span className="sn">§ 03</span> Why this matters</div>
                  <h2 className="section-title">Due diligence used to take weeks.<br />Now it&apos;s a URL.</h2>
                </div>
              </div>
            </Reveal>

            <div className="acc">
              {accolades.map((a, i) => (
                <Reveal key={a.title} delay={i * 80}>
                  <article className="acc-item">
                    <span className="acc-tag">{a.tag}</span>
                    <h3 className="acc-title">{a.title}</h3>
                    <p className="acc-body">{a.body}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── How it works ──────────── */}
        <section style={{ padding: "clamp(60px, 7vw, 96px) 0", borderTop: "1px solid var(--rule)" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-label" style={{ marginBottom: 48 }}>
                <span className="sn">§ 03.1</span> How it works
              </div>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
              {[
                { n: "I",   title: "Drop a domain",
                  body: "Just the domain — stripe.com, figma.com, any company. No form, no account required." },
                { n: "II",  title: "10 engines fire in parallel",
                  body: "Linkup /search retrieves live signals; /research investigates risks deeply; /fetch pulls PDF filings end-to-end." },
                { n: "III", title: "Living Twin delivered",
                  body: "Structured JSON — risk scores, competitor map, annual report extract, Buy/Hold/Pass. Every claim cited." },
              ].map((step, i) => (
                <Reveal key={step.n} delay={i * 120}>
                  <div style={{
                    padding: i === 0 ? "0 40px 0 0" : i === 2 ? "0 0 0 40px" : "0 40px",
                    borderRight: i < 2 ? "1px solid var(--rule)" : "none",
                  }}>
                    <div style={{
                      fontFamily: "var(--t-display)", fontStyle: "italic",
                      fontSize: 72, color: "var(--accent)", opacity: 0.55,
                      lineHeight: 1, marginBottom: 20, letterSpacing: "-0.02em",
                    }}>{step.n}</div>
                    <h3 style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── Stack (§ 04) ──────────── */}
        <section id="stack" style={{ padding: "clamp(80px, 9vw, 128px) 0", borderTop: "1px solid var(--rule)" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div>
                  <div className="section-label"><span className="sn">§ 04</span> Stack</div>
                  <h2 className="section-title">What runs under the hood.</h2>
                </div>
                <p className="section-note">
                  Production-grade, typed end-to-end, edge-deployable. No magic glue —
                  everything is callable via API.
                </p>
              </div>
            </Reveal>

            <div className="stack-groups">
              {stack.map((g, i) => (
                <Reveal key={g.h} delay={i * 60}>
                  <div className="stack-group">
                    <h4>{g.h}</h4>
                    <ul>
                      {g.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────── Contact (§ 05) ──────────── */}
        <section id="contact" className="contact" style={{ padding: "clamp(80px, 9vw, 128px) 0" }}>
          <div className="wrap">
            <Reveal>
              <div className="section-head">
                <div className="section-label"><span className="sn">§ 05</span> Contact</div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <p className="contact-line">
                <span className="it">If</span> Syntra<br />
                fits a problem you have,
                <a href="mailto:keerthivasansv2006@outlook.com">keerthivasansv2006@outlook.com</a>
              </p>
            </Reveal>

            <CopyEmail email="keerthivasansv2006@outlook.com" />

            <div className="contact-meta">
              <div className="col">
                <h4>Reach me</h4>
                <a href="https://github.com/Keerthivasan-Venkitajalam" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                <a href="https://www.linkedin.com/in/keerthivasansv/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
                <a href="https://x.com/keerthivasansv" target="_blank" rel="noopener noreferrer">X (Twitter) ↗</a>
              </div>
              <div className="col">
                <h4>Try it</h4>
                <Link href="/dashboard/demo-stripe">Stripe Twin →</Link>
                <Link href="/dashboard/demo-figma">Figma Twin →</Link>
                <Link href="/dashboard/demo-acme-batteries">Acme Twin (Pass) →</Link>
                <Link href="/compare?a=demo-stripe&b=demo-figma">Diff Stripe vs Figma →</Link>
              </div>
              <div className="col">
                <h4>Best for</h4>
                <span>PE / VC due diligence</span>
                <span>Investment screening</span>
                <span>M&amp;A target research</span>
                <span>Competitor monitoring</span>
              </div>
              <div className="col">
                <h4>Status</h4>
                <span>Built · May 2026</span>
                <span>Open to feedback</span>
                <span>Built for Linkup Async</span>
                <span style={{ color: "var(--green)" }}>● Live demo available</span>
              </div>
            </div>
          </div>
        </section>

        {/* ──────────── Footer ──────────── */}
        <footer className="foot">
          <div className="wrap foot-inner">
            <div className="foot-left">
              <span>© 2026 Syntra · Intelligence Twins</span>
              <span style={{ color: "var(--muted-2)" }}>·</span>
              <span>Powered by Linkup + Vercel AI Gateway</span>
            </div>

            <EasterEggDetector longPress onActivate={onResetAll}>
              <span style={{ cursor: "default", userSelect: "none" }}>
                Linkup Async Hackathon · May 2026
              </span>
            </EasterEggDetector>

            <span className="foot-version">v1.0 · 2026.05.22</span>
          </div>
        </footer>
      </Shell>
    </>
  );
}
