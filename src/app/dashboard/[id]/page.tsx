"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { DemoBanner } from "@/components/DemoBanner";
import { EasterEggDetector } from "@/components/EasterEggDetector";
import { Shell } from "@/components/Shell";
import { OverallScoreBadge, RiskRadar } from "@/components/RiskRadar";
import { ShareExportButtons } from "@/components/ShareExportButtons";
import { getDemoOrchestrator } from "@/lib/demo/demo_orchestrator";
import { Report } from "@/lib/types";

const engineSections: Array<{
  label: string;
  key: keyof Report["engines"];
  tag: string;
}> = [
  { label: "Financial Intelligence",   key: "financial",    tag: "07" },
  { label: "Commercial Footprint",     key: "commercial",   tag: "01" },
  { label: "Technical Stack",          key: "technical",    tag: "02" },
  { label: "Team & Leadership",        key: "leadership",   tag: "08" },
  { label: "Market Sizing",            key: "marketSizing", tag: "09" },
  { label: "Competitive Landscape",    key: "competitors",  tag: "05" },
  { label: "ESG Posture",              key: "esg",          tag: "03" },
  { label: "EU AI Act Risk",           key: "aiAct",        tag: "04" },
  { label: "Red Flags & Risks",        key: "redFlags",     tag: "06" },
  { label: "Annual Report",            key: "annualReport", tag: "10" },
];

/* ── Helpers ─────────────────────────────────────────────────── */

function StatusPill({ status }: { status: string }) {
  const cls: Record<string, string> = {
    pending:   "status-pending",
    running:   "status-running",
    completed: "status-completed",
    failed:    "status-failed",
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999,
      fontFamily: "var(--t-mono)", fontSize: 11, letterSpacing: "0.06em",
    }} className={cls[status] ?? cls.pending}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function VerdictPill({ verdict }: { verdict: string }) {
  const cls: Record<string, string> = {
    Buy:  "verdict-buy",
    Hold: "verdict-hold",
    Pass: "verdict-pass",
  };
  return (
    <span style={{
      padding: "6px 20px", borderRadius: 8,
      fontFamily: "var(--t-mono)", fontSize: 13, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
    }} className={cls[verdict] ?? "verdict-hold"}>
      {verdict}
    </span>
  );
}

function SourceLink({ url }: { url: string }) {
  const isPdf = /\.pdf(\?|$)/i.test(url);
  try {
    const host = new URL(url).hostname.replace("www.", "");
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontFamily: "var(--t-mono)", fontSize: 11,
          color: isPdf ? "var(--green)" : "var(--accent)",
          textDecoration: "underline",
          textDecorationColor: isPdf ? "rgba(74,222,128,0.3)" : "rgba(232,148,74,0.3)",
          textUnderlineOffset: 3, maxWidth: 200, overflow: "hidden",
          textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
        {isPdf && (
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 15, height: 15, borderRadius: 3,
            background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)",
            fontSize: 8, flexShrink: 0, color: "var(--green)", fontWeight: 700,
          }}>PDF</span>
        )}
        {host}
      </a>
    );
  } catch {
    return <span style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)" }}>{url}</span>;
  }
}

/** Badge shown on engines using Linkup /research */
function DeepResearchBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 4,
      background: "rgba(99,102,241,0.10)", border: "1px solid rgba(99,102,241,0.22)",
      fontFamily: "var(--t-mono)", fontSize: 10, color: "#a5b4fc",
      letterSpacing: "0.05em", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
      /research
    </span>
  );
}

/** Badge shown on engines that fetched a PDF via Linkup /fetch */
function PdfFetchedBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 4,
      background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
      fontFamily: "var(--t-mono)", fontSize: 10, color: "var(--green)",
      letterSpacing: "0.05em", whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 9, fontWeight: 700 }}>PDF</span>
      /fetch
    </span>
  );
}

function renderValue(k: string, value: unknown): React.ReactNode {
  if (value === null || value === undefined) return null;
  const label = k.replace(/([A-Z])/g, " $1").trim();

  const sev: Record<string, string> = {
    Critical: "color:var(--red);font-weight:600",
    High: "color:var(--red)",
    Medium: "color:var(--amber)",
    Low: "color:var(--green)",
    Strong: "color:var(--green);font-weight:600",
    Moderate: "color:var(--amber)",
    Weak: "color:#fb923c",
    Leader: "color:var(--green);font-weight:600",
    Visible: "color:var(--green)",
    Hidden: "color:var(--red)",
    Partial: "color:var(--amber)",
  };

  if (typeof value === "string") {
    const colorStyle = sev[value] ?? "";
    return (
      <div key={k} style={{ gridColumn: "span 1" }}>
        <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", ...Object.fromEntries((colorStyle || "").split(";").filter(Boolean).map(s => s.split(":"))) }}>
          {value}
        </p>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div key={k} style={{ gridColumn: "span 1" }}>
        <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 13, color: value ? "var(--green)" : "var(--red)" }}>{value ? "Yes" : "No"}</p>
      </div>
    );
  }

  if (Array.isArray(value) && value.length > 0) {
    if (typeof value[0] === "object" && value[0] !== null) {
      return (
        <div key={k} style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{label}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(value as Record<string, unknown>[]).slice(0, 4).map((item, i) => (
              <div key={i} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--rule)", background: "var(--paper)", fontSize: 13, color: "var(--ink-2)" }}>
                {Object.entries(item).map(([sk, sv]) => (
                  <span key={sk} style={{ marginRight: 16 }}>
                    <span style={{ color: "var(--muted)", fontSize: 11 }}>{sk}: </span>
                    {String(sv)}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={k} style={{ gridColumn: "1 / -1" }}>
        <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{label}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {(value as unknown[]).slice(0, 6).map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--ink-2)" }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>—</span>
              {String(item)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      <div key={k} style={{ gridColumn: "1 / -1" }}>
        <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{label}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {Object.entries(value as Record<string, unknown>).map(([sk, sv]) => (
            <p key={sk} style={{ fontSize: 13, color: "var(--ink-2)", margin: 0 }}>
              <span style={{ color: "var(--muted)" }}>{sk}: </span>
              {sv ? String(sv) : "Not disclosed"}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/** Dedicated card for the Annual Report engine (Linkup /fetch PDF + /research) */
function AnnualReportCard({ engine }: { engine: Report["engines"]["annualReport"] | undefined }) {
  if (!engine) return null;
  if (engine.status === "pending" || (engine.status === "running" && !engine.data)) {
    return (
      <section>
        <div className="section-label" style={{ marginBottom: 20 }}>Annual Report</div>
        <LoadingPulseInner label="Fetching annual report PDF…" />
      </section>
    );
  }
  if (engine.status === "failed" || !engine.data) return null;

  const d = engine.data;
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div className="section-label">Annual Report</div>
        <div style={{ display: "flex", gap: 6 }}>
          {engine.pdfSources && engine.pdfSources.length > 0 && <PdfFetchedBadge />}
          {engine.deepResearch && <DeepResearchBadge />}
        </div>
      </div>

      <div style={{ borderRadius: 14, border: "1px solid var(--rule)", overflow: "hidden" }}>
        {/* Document header */}
        <div style={{ padding: "20px 24px", background: "var(--paper-2)", borderBottom: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 40, height: 48, borderRadius: 6,
              background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, flexShrink: 0,
            }}>
              <span style={{ fontFamily: "var(--t-mono)", fontSize: 8, color: "var(--green)", fontWeight: 700, letterSpacing: "0.05em" }}>PDF</span>
              <div style={{ width: 16, height: 1, background: "rgba(74,222,128,0.4)" }} />
              <div style={{ width: 12, height: 1, background: "rgba(74,222,128,0.25)" }} />
              <div style={{ width: 14, height: 1, background: "rgba(74,222,128,0.25)" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>
                Fetched via Linkup /fetch · PDF document
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                {d.documentTitle ?? "Annual Report"}
              </p>
              {d.fiscalYear && <p style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)", margin: "4px 0 0" }}>{d.fiscalYear}</p>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {d.auditOpinion && (
              <span style={{
                padding: "4px 12px", borderRadius: 6,
                background: d.auditOpinion === "Unqualified" ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.1)",
                border: `1px solid ${d.auditOpinion === "Unqualified" ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.25)"}`,
                fontFamily: "var(--t-mono)", fontSize: 11, fontWeight: 600,
                color: d.auditOpinion === "Unqualified" ? "var(--green)" : "var(--amber)",
              }}>
                {d.auditOpinion} audit
              </span>
            )}
            {d.documentUrl && (
              <a href={d.documentUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8,
                border: "1px solid var(--rule-strong)", background: "var(--paper)",
                fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--ink-2)",
                textDecoration: "none",
              }}>
                View PDF →
              </a>
            )}
          </div>
        </div>

        {/* Key metrics */}
        {(d.revenue || d.netIncome || d.totalAssets) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid var(--rule)" }}>
            {[
              { label: "Revenue", value: d.revenue },
              { label: "Net Income", value: d.netIncome },
              { label: "Total Assets", value: d.totalAssets },
            ].map(({ label, value }, i) => value && (
              <div key={i} style={{ padding: "18px 24px", borderRight: i < 2 ? "1px solid var(--rule)" : "none" }}>
                <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: 0, fontFamily: "var(--t-mono)" }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {d.highlights.length > 0 && (
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--rule)" }}>
            <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Highlights</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {d.highlights.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--green)", flexShrink: 0, marginTop: 2 }}>✓</span>
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks + Opportunities */}
        {(d.keyRisks.length > 0 || d.keyOpportunities.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {d.keyRisks.length > 0 && (
              <div style={{ padding: "20px 24px", borderRight: "1px solid var(--rule)" }}>
                <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--red)", marginBottom: 12 }}>Risk Factors</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.keyRisks.slice(0, 4).map((r, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--red)", flexShrink: 0 }}>—</span>{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {d.keyOpportunities.length > 0 && (
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12 }}>Opportunities</p>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {d.keyOpportunities.slice(0, 4).map((o, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>{o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Forward-declare LoadingPulse helper for AnnualReportCard
function LoadingPulseInner({ label }: { label: string }) {
  return (
    <div style={{ padding: "32px", borderRadius: 14, border: "1px solid var(--rule)", background: "var(--paper-2)", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 14 }}>{label}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: "50%",
            background: "var(--green)", opacity: 0.6,
            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function LoadingPulse({ label }: { label: string }) {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <p style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em", marginBottom: 14 }}>{label}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: "50%",
            background: "var(--accent)", opacity: 0.6,
            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [degradedEngine, setDegradedEngine] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    const res = await fetch(`/api/report/${id}`);
    if (res.status === 404) { setNotFound(true); return; }
    if (res.ok) setReport(await res.json());
  }, [id]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  useEffect(() => {
    if (!report || report.status === "completed" || report.status === "failed") return;
    const t = setInterval(fetchReport, 2500);
    return () => clearInterval(t);
  }, [report, fetchReport]);

  useEffect(() => {
    const orch = getDemoOrchestrator();
    return orch.on((event) => {
      if (event.type === "engine_degradation") {
        setDegradedEngine(event.payload.engine);
        setTimeout(() => setDegradedEngine(null), 8000);
      }
      if (event.type === "reset_all") setDegradedEngine(null);
    });
  }, []);

  // ── Not found ──
  if (notFound) {
    return (
      <PageShell>
        <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 var(--pad)" }}>
          <p style={{ fontFamily: "var(--t-display)", fontStyle: "italic", fontSize: 48, color: "var(--muted)" }}>404</p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", margin: "12px 0 8px" }}>Report not found</h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24 }}>This report doesn't exist or has expired.</p>
          <Link href="/" style={{ fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--accent)" }}>← Back to home</Link>
        </div>
      </PageShell>
    );
  }

  // ── Loading ──
  if (!report) {
    return (
      <PageShell>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16, padding: "80px 0" }}>
          <div style={{ width: 32, height: 32, border: "2px solid var(--rule-strong)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.08em" }}>Loading report…</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </PageShell>
    );
  }

  const allEngines = Object.values(report.engines);
  const completedCount =
    allEngines.filter(e => e.status === "completed").length +
    (report.teaser.status === "completed" ? 1 : 0) +
    (report.executiveSummary?.status === "completed" ? 1 : 0);
  const totalCount = allEngines.length + 2;
  const progressPct = (completedCount / totalCount) * 100;

  return (
    <PageShell>
      <DemoBanner />

      <main style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "32px var(--pad) 80px", display: "flex", flexDirection: "column", gap: 0 }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 6 }}>
            ← syntra
          </Link>
          <EasterEggDetector longPress onActivate={() => getDemoOrchestrator().twoTwinDebate()}>
            <ShareExportButtons reportId={id} report={report} />
          </EasterEggDetector>
        </div>

        {/* ── Report header ── */}
        <div style={{ paddingBottom: 40, marginBottom: 40, borderBottom: "1px solid var(--rule)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div className="section-label" style={{ marginBottom: 16 }}>
                Intelligence Twin
              </div>

              <EasterEggDetector taps={4} onActivate={() => getDemoOrchestrator().sentinelDiffAlert()}>
                <h1 style={{
                  fontFamily: "var(--t-display)", fontStyle: "italic",
                  fontSize: "clamp(36px, 4vw, 60px)", letterSpacing: "-0.03em",
                  color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.05, cursor: "default",
                }}>
                  {report.domain}
                </h1>
              </EasterEggDetector>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <EasterEggDetector taps={4} onActivate={() => getDemoOrchestrator().promptInjectionBlocked()}>
                  <StatusPill status={report.status} />
                </EasterEggDetector>
                <span style={{ color: "var(--rule-strong)" }}>·</span>
                <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)" }}>
                  {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {report.riskScores && (
                  <>
                    <span style={{ color: "var(--rule-strong)" }}>·</span>
                    <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)" }}>
                      {Object.values(report.engines).reduce((n, e) => n + e.sources.length, report.teaser.sources.length)} sources
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Score + Verdict */}
            {report.riskScores && report.executiveSummary?.data && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
                <EasterEggDetector taps={4} onActivate={() => getDemoOrchestrator().sentinelDiffAlert()}>
                  <OverallScoreBadge score={report.riskScores.overall} />
                </EasterEggDetector>
                <VerdictPill verdict={report.executiveSummary.data.verdict} />
              </div>
            )}
          </div>

          {/* Progress bar */}
          {report.status === "running" && (
            <div style={{ marginTop: 24, padding: "16px 20px", borderRadius: 10, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 1.4s ease-out infinite" }} />
                  {completedCount} of {totalCount} engines complete
                </span>
                <span style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--accent)" }}>{Math.round(progressPct)}%</span>
              </div>
              <div style={{ height: 2, background: "var(--rule)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--accent)", borderRadius: 1, transition: "width 0.6s ease" }} />
              </div>
              <style>{`@keyframes pulse{0%{box-shadow:0 0 0 0 var(--accent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}`}</style>
            </div>
          )}
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Executive Summary */}
            {report.executiveSummary?.data && (
              <section>
                <div className="section-label" style={{ marginBottom: 20 }}>Investment memo</div>
                <div style={{ padding: "28px 32px", borderRadius: 14, border: "1px solid var(--rule-strong)", background: "var(--paper-2)" }}>
                  <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.75, marginBottom: 28 }}>
                    {report.executiveSummary.data.investmentThesis}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, paddingTop: 20, borderTop: "1px solid var(--rule)" }}>
                    <div>
                      <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--green)", marginBottom: 12 }}>
                        Strengths
                      </p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        {report.executiveSummary.data.keyStrengths.map((s, i) => (
                          <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                            <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--red)", marginBottom: 12 }}>
                        Risks
                      </p>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                        {report.executiveSummary.data.keyRisks.map((r, i) => (
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

            {/* Annual Report — Linkup /fetch PDF + /research */}
            <AnnualReportCard engine={report.engines.annualReport} />

            {/* Teaser */}
            {report.teaser.data && (
              <section>
                <div className="section-label" style={{ marginBottom: 20 }}>Quick brief</div>
                <div style={{ padding: "24px 28px", borderRadius: 14, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
                  <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.75, marginBottom: 20 }}>
                    {report.teaser.data.summary}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                  {report.teaser.sources.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--rule)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {report.teaser.sources.slice(0, 5).map((url, i) => <SourceLink key={i} url={url} />)}
                    </div>
                  )}
                </div>
              </section>
            )}
            {!report.teaser.data && <section><div className="section-label" style={{ marginBottom: 20 }}>Quick brief</div><LoadingPulse label="Generating teaser…" /></section>}

            {/* Engine grid */}
            <section>
              <div className="section-label" style={{ marginBottom: 20 }}>Engine results</div>
              <EasterEggDetector taps={3} onActivate={() => getDemoOrchestrator().engineDegradationGraceful()}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, border: "1px solid var(--rule)", borderRadius: 14, overflow: "hidden" }}>
                  {engineSections.map(({ label, key, tag }, i) => {
                    const engine = report.engines[key];
                    const isDegraded = degradedEngine === key;
                    const isLast = i === engineSections.length - 1;
                    if (!engine) return null;
                    return (
                      <div
                        key={key}
                        style={{
                          padding: "24px",
                          background: isDegraded ? "rgba(251,191,36,0.04)" : "var(--paper-2)",
                          borderRight: (i + 1) % 2 !== 0 ? "1px solid var(--rule)" : "none",
                          borderBottom: !isLast && i < engineSections.length - 1 ? "1px solid var(--rule)" : "none",
                          gridColumn: isLast && engineSections.length % 2 !== 0 ? "1 / -1" : "auto",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <span style={{ fontFamily: "var(--t-mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>
                                {tag}
                              </span>
                              {engine.deepResearch && <DeepResearchBadge />}
                              {engine.pdfSources && engine.pdfSources.length > 0 && <PdfFetchedBadge />}
                            </div>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", margin: 0, letterSpacing: "-0.01em" }}>{label}</h3>
                          </div>
                          {isDegraded
                            ? <span style={{ fontFamily: "var(--t-mono)", fontSize: 10, color: "var(--amber)", padding: "2px 8px", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 4 }}>retrying</span>
                            : <StatusPill status={engine.status} />
                          }
                        </div>

                        {isDegraded ? (
                          <p style={{ fontSize: 12, color: "var(--amber)", opacity: 0.7 }}>Rate-limited — retrying in 30s. Other engines usable now.</p>
                        ) : engine.data ? (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            {Object.entries(engine.data).map(([k, v]) => renderValue(k, v))}
                            {/* PDF sources get their own styled row */}
                            {engine.pdfSources && engine.pdfSources.length > 0 && (
                              <div style={{ gridColumn: "1 / -1", paddingTop: 10, marginTop: 4, borderTop: "1px solid var(--rule)" }}>
                                <p style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 8 }}>PDF Documents Analyzed</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {engine.pdfSources.map((ps, pi) => (
                                    <div key={pi} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 7, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}>
                                      <span style={{ fontFamily: "var(--t-mono)", fontSize: 9, fontWeight: 700, color: "var(--green)", background: "rgba(74,222,128,0.12)", padding: "2px 5px", borderRadius: 3, flexShrink: 0 }}>PDF</span>
                                      <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ps.title ?? "Document"}</span>
                                      <SourceLink url={ps.url} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {engine.sources.length > 0 && (
                              <div style={{ gridColumn: "1 / -1", paddingTop: 12, marginTop: 4, borderTop: "1px solid var(--rule)", display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {engine.sources.filter(u => !/\.pdf/i.test(u)).slice(0, 3).map((url, i) => <SourceLink key={i} url={url} />)}
                                {engine.sources.length > 3 && <span style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)" }}>+{engine.sources.length - 3} more</span>}
                              </div>
                            )}
                          </div>
                        ) : engine.status === "failed" ? (
                          <p style={{ fontSize: 12, color: "var(--red)", opacity: 0.7 }}>Analysis failed{engine.error ? ` — ${engine.error}` : ""}</p>
                        ) : (
                          <LoadingPulse label="Analyzing…" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </EasterEggDetector>
            </section>

            {/* Footer */}
            <div style={{ paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
              <p style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.04em" }}>
                Report ID: {id} · {new Date(report.updatedAt).toLocaleString()} · All sources via Linkup
              </p>
            </div>
          </div>

          {/* ── Right sidebar — Radar ── */}
          <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 24 }}>
            {report.riskScores ? (
              <div style={{ padding: "24px", borderRadius: 14, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
                <div className="section-label" style={{ marginBottom: 20 }}>Risk radar</div>
                <RiskRadar scores={report.riskScores} />
              </div>
            ) : (
              <div style={{ padding: "24px", borderRadius: 14, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
                <LoadingPulse label="Computing scores…" />
              </div>
            )}
          </div>
        </div>
      </main>
    </PageShell>
  );
}

/* ── Page shell (nav + grain + cursor) ──────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
        {/* Nav */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          borderBottom: "1px solid var(--rule)",
          backdropFilter: "blur(16px)",
          background: "color-mix(in srgb, var(--paper) 80%, transparent)",
        }}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 var(--pad)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, border: "1px solid var(--rule-strong)", borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--t-display)", fontStyle: "italic", fontSize: 14, color: "var(--accent)",
                background: "var(--accent-glow)",
              }}>S</div>
              <span style={{ fontFamily: "var(--t-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>syntra</span>
            </Link>
            <Link href="/reports" style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em" }}>
              All reports
            </Link>
          </div>
        </header>

        {children}
      </div>
    </Shell>
  );
}
