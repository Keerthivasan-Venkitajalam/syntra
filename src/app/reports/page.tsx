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

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function verdictStyle(verdict: string) {
  if (verdict === "Buy") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (verdict === "Pass") return "bg-red-500/20 text-red-300 border-red-500/30";
  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b0f1a] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(61,126,255,0.12),_transparent_55%)]" />

      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-bold text-indigo-300 border border-indigo-500/30">
              AX
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide group-hover:text-white transition">Syntra</p>
              <p className="text-[11px] text-zinc-500">AI-Powered Due Diligence</p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/30 transition"
          >
            + New Report
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-24 pt-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Report History</h1>
          <p className="mt-1 text-sm text-zinc-500">
            All due diligence reports generated in this session.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <p className="text-zinc-400">No reports yet.</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-500/30 transition"
            >
              Create your first report →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/${r.id}`}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] transition group"
              >
                {/* Score */}
                <div className="flex-shrink-0 w-14 text-center">
                  {r.riskScores ? (
                    <span className={`text-2xl font-bold ${scoreColor(r.riskScores.overall)}`}>
                      {r.riskScores.overall}
                    </span>
                  ) : (
                    <span className="text-2xl font-bold text-zinc-600">—</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition truncate">
                      {r.domain}
                    </h3>
                    {r.verdict && (
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${verdictStyle(r.verdict)}`}>
                        {r.verdict}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        r.status === "completed"
                          ? "bg-emerald-900/30 text-emerald-300"
                          : r.status === "running"
                            ? "bg-blue-900/30 text-blue-300 animate-pulse"
                            : r.status === "failed"
                              ? "bg-red-900/30 text-red-300"
                              : "bg-zinc-800/50 text-zinc-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-[11px] text-zinc-500">
                    <span>
                      {new Date(r.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>{r.engineCount} engines</span>
                    <span>{r.sourceCount} sources</span>
                  </div>
                </div>

                {/* Arrow */}
                <span className="text-zinc-600 group-hover:text-zinc-400 transition">→</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
