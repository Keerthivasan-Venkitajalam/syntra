import Link from "next/link";

import { DemoBanner } from "@/components/DemoBanner";
import { ShareDemoLayer } from "@/components/ShareDemoLayer";
import { seedDemoReports } from "@/lib/demo/demo_backend";
import { getReport } from "@/lib/reports";
import { Report } from "@/lib/types";

seedDemoReports();

const sectionLabels: Array<{
  label: string;
  key: keyof Report["engines"];
  icon: string;
}> = [
  { label: "Commercial Footprint",  key: "commercial",   icon: "💰" },
  { label: "Technical Stack",       key: "technical",    icon: "⚙️" },
  { label: "ESG Posture",           key: "esg",          icon: "🌱" },
  { label: "EU AI Act Risk",        key: "aiAct",        icon: "🤖" },
  { label: "Competitive Landscape", key: "competitors",  icon: "🏆" },
  { label: "Red Flags & Risks",     key: "redFlags",     icon: "🚩" },
  { label: "Financial Deep Dive",   key: "financial",    icon: "💵" },
  { label: "Leadership & Culture",  key: "leadership",   icon: "👥" },
  { label: "Market Sizing",         key: "marketSizing", icon: "📊" },
  { label: "Annual Report",         key: "annualReport", icon: "📄" },
];

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles: Record<string, React.CSSProperties> = {
    Buy:  { background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(74,222,128,0.3)" },
    Pass: { background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.3)" },
    Hold: { background: "var(--amber-dim)", color: "var(--amber)", border: "1px solid rgba(251,191,36,0.3)" },
  };
  return (
    <span style={{
      padding: "5px 18px", borderRadius: 7,
      fontFamily: "var(--t-mono)", fontSize: 12, fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      ...(styles[verdict] ?? styles.Hold),
    }}>
      {verdict}
    </span>
  );
}

function SourceLink({ url }: { url: string }) {
  try {
    const host = new URL(url).hostname.replace("www.", "");
    const isPdf = /\.pdf(\?|$)/i.test(url);
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{
        fontFamily: "var(--t-mono)", fontSize: 11,
        color: isPdf ? "var(--green)" : "var(--accent)",
        textDecoration: "underline", textUnderlineOffset: 3,
        textDecorationColor: "transparent",
        maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        display: "inline-block",
      }}>
        {host}
      </a>
    );
  } catch {
    return <span style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)" }}>{url}</span>;
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReport(id);

  if (!report) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", display: "flex", flexDirection: "column" }}>
        <header style={{ borderBottom: "1px solid var(--rule)", padding: "0 var(--pad)", height: 60, display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nav.png" alt="Syntra" height={28} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--t-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "var(--ink)" }}>syntra</span>
          </Link>
        </header>
        <main style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 var(--pad)", flex: 1 }}>
          <p style={{ fontFamily: "var(--t-display)", fontStyle: "italic", fontSize: 52, color: "var(--muted)", margin: "0 0 12px" }}>404</p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", margin: "0 0 8px" }}>Report not found</h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24, lineHeight: 1.6 }}>
            This report has expired or no longer exists.
          </p>
          <Link href="/" style={{ fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>
            Create your own report →
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <ShareDemoLayer />
      <DemoBanner />

      {/* Nav */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        borderBottom: "1px solid var(--rule)",
        backdropFilter: "blur(16px)",
        background: "color-mix(in srgb, var(--paper) 80%, transparent)",
      }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 var(--pad)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nav.png" alt="Syntra" height={28} style={{ objectFit: "contain", display: "block" }} />
            <span style={{ fontFamily: "var(--t-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "var(--ink)" }}>syntra</span>
          </Link>
          <span style={{
            fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.08em",
            color: "var(--muted)", padding: "4px 12px",
            border: "1px solid var(--rule)", borderRadius: 99,
          }}>
            Public Report
          </span>
        </div>
      </header>

      <main style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "40px var(--pad) 80px", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Report header */}
        <div style={{ paddingBottom: 32, borderBottom: "1px solid var(--rule)" }}>
          <div style={{ fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 12 }}>
            Intelligence Twin
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div>
              <h1 style={{
                fontFamily: "var(--t-display)", fontStyle: "italic",
                fontSize: "clamp(32px, 4vw, 56px)", letterSpacing: "-0.03em",
                color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.05,
              }}>
                {report.domain}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)" }}>
                  Generated {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {report.riskScores && (
                  <>
                    <span style={{ color: "var(--rule-strong)" }}>·</span>
                    <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)" }}>
                      Score: <span style={{ color: "var(--accent)" }}>{report.riskScores.overall}/100</span>
                    </span>
                  </>
                )}
              </div>
            </div>
            {report.executiveSummary?.data?.verdict && (
              <VerdictBadge verdict={report.executiveSummary.data.verdict} />
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {report.executiveSummary?.data && (
          <section>
            <div style={{ fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
              Investment Memo
            </div>
            <div style={{ padding: "28px 32px", borderRadius: 14, border: "1px solid var(--rule-strong)", background: "var(--paper-2)" }}>
              <p style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.75, marginBottom: 24 }}>
                {report.executiveSummary.data.investmentThesis}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, paddingTop: 20, borderTop: "1px solid var(--rule)" }}>
                <div>
                  <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>Strengths</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {(report.executiveSummary.data.keyStrengths ?? []).map((s, i) => (
                      <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--red)", marginBottom: 10 }}>Risks</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                    {(report.executiveSummary.data.keyRisks ?? []).map((r, i) => (
                      <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--red)", flexShrink: 0 }}>—</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--rule)", fontSize: 13, color: "var(--ink-2)", fontStyle: "italic", lineHeight: 1.6 }}>
                {report.executiveSummary.data.recommendation}
              </p>
            </div>
          </section>
        )}

        {/* Teaser */}
        {report.teaser.data && (
          <section>
            <div style={{ fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
              Quick Brief
            </div>
            <div style={{ padding: "24px 28px", borderRadius: 14, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 20 }}>
                {report.teaser.data.summary}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid var(--rule)", background: "var(--paper)" }}>
                  <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>GTM model</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>{report.teaser.data.plgOrSlg}</p>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid var(--rule)", background: "var(--paper)" }}>
                  <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>Tech signals</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {report.teaser.data.techSignals.slice(0, 3).map((s, i) => (
                      <span key={i} style={{ fontSize: 12, color: "var(--ink-2)", fontFamily: "var(--t-mono)" }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Engine results grid */}
        <section>
          <div style={{ fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
            Engine Results
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {sectionLabels.map(({ label, key, icon }) => {
              const engine = report.engines[key];
              if (!engine || engine.status !== "completed" || !engine.data) return null;
              return (
                <div key={key} style={{ padding: "22px 24px", borderRadius: 14, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{icon}</span>{label}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(engine.data).map(([k, value]) => {
                      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) return null;
                      const fieldLabel = k.replace(/([A-Z])/g, " $1").trim();
                      if (typeof value === "string") {
                        return (
                          <div key={k}>
                            <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 3 }}>{fieldLabel}</p>
                            <p style={{ fontSize: 13, color: "var(--ink-2)" }}>{value}</p>
                          </div>
                        );
                      }
                      if (Array.isArray(value) && value.length > 0) {
                        if (typeof value[0] === "object") {
                          return (
                            <div key={k}>
                              <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{fieldLabel}</p>
                              {(value as Record<string, unknown>[]).slice(0, 3).map((item, i) => (
                                <div key={i} style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 4 }}>
                                  {Object.entries(item).map(([sk, sv]) => `${sk}: ${sv}`).join(" · ")}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <div key={k}>
                            <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{fieldLabel}</p>
                            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                              {(value as unknown[]).slice(0, 4).map((item, i) => (
                                <li key={i} style={{ fontSize: 13, color: "var(--ink-2)", display: "flex", gap: 6 }}>
                                  <span style={{ color: "var(--accent)" }}>—</span>{String(item)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                      return null;
                    })}
                    {engine.sources.length > 0 && (
                      <div style={{ paddingTop: 10, borderTop: "1px solid var(--rule)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {engine.sources.filter(u => !/\.pdf/i.test(u)).slice(0, 3).map((url, i) => (
                          <SourceLink key={i} url={url} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <div style={{ paddingTop: 32, borderTop: "1px solid var(--rule)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            Want your own AI-powered due diligence report?
          </p>
          <Link href="/" style={{
            display: "inline-block",
            padding: "12px 28px", borderRadius: 10,
            background: "var(--accent)", color: "var(--paper)",
            fontFamily: "var(--t-mono)", fontSize: 13, fontWeight: 700,
            letterSpacing: "0.04em", textDecoration: "none",
          }}>
            Create your free Twin →
          </Link>
          <p style={{ marginTop: 20, fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted-2)" }}>
            Powered by Syntra + Linkup · All claims include source citations
          </p>
        </div>
      </main>
    </div>
  );
}
