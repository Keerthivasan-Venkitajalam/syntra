"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReportSummary = {
  id: string;
  domain: string;
  status: string;
  createdAt: string;
  riskScores: { overall: number } | null;
  verdict: string | null;
  engineCount: number;
  sourceCount: number;
};

function scoreColor(score: number): React.CSSProperties {
  if (score >= 75) return { color: "var(--green)", fontWeight: 700 };
  if (score >= 50) return { color: "var(--amber)", fontWeight: 700 };
  return { color: "var(--red)", fontWeight: 700 };
}

function verdictStyle(verdict: string): React.CSSProperties {
  if (verdict === "Buy")
    return { background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(74,222,128,0.3)" };
  if (verdict === "Pass")
    return { background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.3)" };
  return { background: "var(--amber-dim)", color: "var(--amber)", border: "1px solid rgba(251,191,36,0.3)" };
}

function statusDot(status: string): React.CSSProperties {
  if (status === "completed") return { background: "var(--green)" };
  if (status === "running") return { background: "var(--accent)", animation: "pulse 1.4s ease-out infinite" };
  if (status === "failed") return { background: "var(--red)" };
  return { background: "var(--muted)" };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%{box-shadow:0 0 0 0 var(--accent)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}
        .report-row:hover { background: var(--paper-3) !important; border-color: var(--rule-strong) !important; }
      `}</style>

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
          <Link href="/" style={{
            fontFamily: "var(--t-mono)", fontSize: 12, letterSpacing: "0.04em",
            color: "var(--muted)", textDecoration: "none",
            padding: "6px 16px", borderRadius: 8,
            border: "1px solid var(--rule-strong)", background: "var(--paper-2)",
          }}>
            + New Report
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "40px var(--pad) 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link href="/" style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em", textDecoration: "none" }}>← syntra</Link>
          <h1 style={{
            fontFamily: "var(--t-display)", fontStyle: "italic",
            fontSize: "clamp(28px, 3.5vw, 44px)", letterSpacing: "-0.03em",
            color: "var(--ink)", margin: "16px 0 8px", lineHeight: 1.1,
          }}>
            All Intelligence Twins
          </h1>
          <p style={{ fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--muted)" }}>
            Every due-diligence report generated in this session — source-cited, diffable.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 32, height: 32, border: "2px solid var(--rule-strong)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ borderRadius: 16, border: "1px solid var(--rule)", background: "var(--paper-2)", padding: "64px 32px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--t-display)", fontStyle: "italic", fontSize: 20, color: "var(--muted)", marginBottom: 16 }}>
              No reports yet.
            </p>
            <Link href="/" style={{
              fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--accent)", textDecoration: "none",
            }}>
              Create your first Twin →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Column header */}
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 110px 110px 120px 32px",
              padding: "8px 20px",
              fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--muted)",
            }}>
              <span>Score</span>
              <span>Company</span>
              <span>Verdict</span>
              <span>Engines</span>
              <span>Status</span>
              <span />
            </div>

            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/${r.id}`}
                className="report-row"
                style={{
                  display: "grid", gridTemplateColumns: "60px 1fr 110px 110px 120px 32px",
                  alignItems: "center", gap: 0,
                  padding: "16px 20px",
                  borderRadius: 10, border: "1px solid var(--rule)",
                  background: "var(--paper-2)", textDecoration: "none",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                {/* Score */}
                <div style={{ fontFamily: "var(--t-mono)", fontSize: 20, ...(r.riskScores ? scoreColor(r.riskScores.overall) : { color: "var(--muted)" }) }}>
                  {r.riskScores ? r.riskScores.overall : "—"}
                </div>

                {/* Domain + meta */}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: 3 }}>
                    {r.domain}
                  </div>
                  <div style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)" }}>
                    {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {" · "}{r.sourceCount} sources
                  </div>
                </div>

                {/* Verdict */}
                <div>
                  {r.verdict ? (
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px", borderRadius: 5,
                      fontFamily: "var(--t-mono)", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      ...verdictStyle(r.verdict),
                    }}>
                      {r.verdict}
                    </span>
                  ) : (
                    <span style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)" }}>—</span>
                  )}
                </div>

                {/* Engines */}
                <div style={{ fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--ink-2)" }}>
                  {r.engineCount} / 10
                </div>

                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, ...statusDot(r.status) }} />
                  <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--ink-2)" }}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                {/* Arrow */}
                <span style={{ color: "var(--muted)", fontFamily: "var(--t-mono)", fontSize: 14 }}>→</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
