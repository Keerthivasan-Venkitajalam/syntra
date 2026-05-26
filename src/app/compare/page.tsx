"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { DemoBanner } from "@/components/DemoBanner";
import { EasterEggDetector } from "@/components/EasterEggDetector";
import { getDemoOrchestrator } from "@/lib/demo/demo_orchestrator";
import { Report, RiskScores } from "@/lib/types";

const dimensions: Array<{ key: keyof RiskScores; label: string }> = [
  { key: "overall", label: "Overall" },
  { key: "commercial", label: "Commercial" },
  { key: "technical", label: "Technical" },
  { key: "financial", label: "Financial" },
  { key: "leadership", label: "Leadership" },
  { key: "competitive", label: "Competitive" },
  { key: "esg", label: "ESG" },
  { key: "regulatory", label: "Regulatory" },
];

function scoreColor(a: number, b: number, isA: boolean) {
  if (a === b) return "text-zinc-300";
  return (isA ? a > b : b > a) ? "text-emerald-400" : "text-red-400";
}

function CompareContent() {
  const params = useSearchParams();
  const idA = params.get("a");
  const idB = params.get("b");

  const [reportA, setReportA] = useState<Report | null>(null);
  const [reportB, setReportB] = useState<Report | null>(null);
  const [domainA, setDomainA] = useState("");
  const [domainB, setDomainB] = useState("");
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const fetchReport = useCallback(
    async (id: string, setter: (r: Report) => void) => {
      const res = await fetch(`/api/report/${id}`);
      if (res.ok) setter(await res.json());
    },
    []
  );

  useEffect(() => {
    if (idA) fetchReport(idA, setReportA);
    if (idB) fetchReport(idB, setReportB);
  }, [idA, idB, fetchReport]);

  const createReport = async (
    domain: string,
    setter: (r: Report) => void,
    setLoading: (b: boolean) => void
  ) => {
    if (!domain.trim()) return;
    setLoading(true);
    const res = await fetch("/api/report/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const { id } = await res.json();
    const poll = setInterval(async () => {
      const r = await fetch(`/api/report/${id}`);
      if (r.ok) {
        const data = await r.json();
        setter(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(poll);
          setLoading(false);
        }
      }
    }, 3000);
  };

  const bothLoaded = reportA?.riskScores && reportB?.riskScores;

  const scoreStyle = (a: number, b: number, isA: boolean): React.CSSProperties => {
    if (a === b) return { color: "var(--ink-2)" };
    return (isA ? a > b : b > a)
      ? { color: "var(--green)", fontWeight: 700 }
      : { color: "var(--red)" };
  };

  return (
    <main style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "32px var(--pad) 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <Link href="/" style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em" }}>← syntra</Link>
        <h1 style={{ fontFamily: "var(--t-display)", fontStyle: "italic", fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.03em", color: "var(--ink)", margin: "16px 0 8px", lineHeight: 1.05 }}>
          Twin comparison
        </h1>
        <p style={{ fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--muted)" }}>
          Field-level intelligence diff — any two companies
        </p>
      </div>

      {/* Input row */}
      {!idA && !idB && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Company A", val: domainA, set: setDomainA, run: () => createReport(domainA, setReportA, setLoadingA), loading: loadingA, rep: reportA, ph: "stripe.com" },
            { label: "Company B", val: domainB, set: setDomainB, run: () => createReport(domainB, setReportB, setLoadingB), loading: loadingB, rep: reportB, ph: "figma.com" },
          ].map(({ label, val, set, run, loading, rep, ph }) => (
            <div key={label} style={{ padding: "20px 24px", borderRadius: 12, border: "1px solid var(--rule)", background: "var(--paper-2)" }}>
              <p style={{ fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{label}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text" placeholder={ph} value={val}
                  onChange={e => set(e.target.value)}
                  style={{
                    flex: 1, padding: "9px 14px", borderRadius: 8,
                    border: "1px solid var(--rule-strong)", background: "var(--paper)",
                    color: "var(--ink)", fontFamily: "var(--t-mono)", fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={run} disabled={loading}
                  style={{
                    padding: "9px 20px", borderRadius: 8,
                    border: "1px solid var(--rule-strong)", background: loading ? "var(--paper-3)" : "var(--accent)",
                    color: loading ? "var(--muted)" : "var(--paper)",
                    fontFamily: "var(--t-mono)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >{loading ? "Running…" : "Analyse"}</button>
              </div>
              {rep && <p style={{ marginTop: 8, fontFamily: "var(--t-mono)", fontSize: 11, color: "var(--green)" }}>{rep.domain} — {rep.status}{rep.riskScores ? ` · ${rep.riskScores.overall}` : ""}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Comparison table */}
      {bothLoaded && (
        <div style={{ borderRadius: 14, border: "1px solid var(--rule)", overflow: "hidden", marginBottom: 16 }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", borderBottom: "1px solid var(--rule)", background: "var(--paper-3)", padding: "12px 20px" }}>
            <span style={{ fontFamily: "var(--t-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>Dimension</span>
            <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--ink)", textAlign: "center", fontWeight: 600 }}>{reportA!.domain}</span>
            <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--ink-2)", textAlign: "center", fontWeight: 600 }}>{reportB!.domain}</span>
          </div>

          {dimensions.map(({ key, label }, i) => {
            const a = reportA!.riskScores![key];
            const b = reportB!.riskScores![key];
            return (
              <div key={key} style={{
                display: "grid", gridTemplateColumns: "1fr 140px 140px",
                padding: "13px 20px",
                borderBottom: i < dimensions.length - 1 ? "1px solid var(--rule)" : "none",
                background: key === "overall" ? "var(--paper-2)" : "var(--paper)",
              }}>
                <span style={{ fontSize: 14, color: key === "overall" ? "var(--ink)" : "var(--ink-2)", fontWeight: key === "overall" ? 600 : 400 }}>{label}</span>
                <span style={{ textAlign: "center", fontFamily: "var(--t-mono)", fontSize: 14, ...scoreStyle(a, b, true) }}>{a}</span>
                <span style={{ textAlign: "center", fontFamily: "var(--t-mono)", fontSize: 14, ...scoreStyle(a, b, false) }}>{b}</span>
              </div>
            );
          })}

          {/* Verdict */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px", padding: "13px 20px", background: "var(--paper-2)", borderTop: "1px solid var(--rule)" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>Verdict</span>
            {[reportA, reportB].map((rep, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                {rep?.executiveSummary?.data?.verdict && (
                  <span style={{
                    padding: "3px 12px", borderRadius: 4,
                    fontFamily: "var(--t-mono)", fontSize: 11, fontWeight: 700,
                    ...(rep.executiveSummary.data.verdict === "Buy"
                      ? { background: "var(--green-dim)", color: "var(--green)", border: "1px solid rgba(74,222,128,0.3)" }
                      : { background: "var(--red-dim)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.3)" }),
                  }}>{rep.executiveSummary.data.verdict}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {bothLoaded && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[reportA, reportB].map((rep) => rep && (
            <Link key={rep.id} href={`/dashboard/${rep.id}`} style={{
              padding: "14px", borderRadius: 10, border: "1px solid var(--rule)",
              background: "var(--paper-2)", textAlign: "center",
              fontFamily: "var(--t-mono)", fontSize: 13, color: "var(--muted)",
            }}>
              View full {rep.domain} Twin →
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default function ComparePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <DemoBanner />
      {/* Nav */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        borderBottom: "1px solid var(--rule)",
        backdropFilter: "blur(16px)",
        background: "color-mix(in srgb, var(--paper) 80%, transparent)",
      }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 var(--pad)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-nav.png" alt="Syntra" height={28} style={{ objectFit: "contain", display: "block" }} />
            <span style={{ fontFamily: "var(--t-sans)", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>syntra</span>
          </Link>
          <EasterEggDetector longPress onActivate={() => getDemoOrchestrator().twoTwinDebate()}>
            <span style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--muted)", cursor: "default", userSelect: "none", letterSpacing: "0.04em" }}>
              Compare
            </span>
          </EasterEggDetector>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="relative z-10 flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </div>
  );
}
