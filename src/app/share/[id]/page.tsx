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
  { label: "Commercial Footprint", key: "commercial", icon: "💰" },
  { label: "Technical Stack", key: "technical", icon: "⚙️" },
  { label: "ESG Posture", key: "esg", icon: "🌱" },
  { label: "EU AI Act Risk", key: "aiAct", icon: "🤖" },
  { label: "Competitive Landscape", key: "competitors", icon: "🏆" },
  { label: "Red Flags & Risks", key: "redFlags", icon: "🚩" },
  { label: "Financial Deep Dive", key: "financial", icon: "💵" },
  { label: "Leadership & Culture", key: "leadership", icon: "👥" },
  { label: "Market Sizing", key: "marketSizing", icon: "📊" },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-zinc-800/50 text-zinc-400",
    running: "bg-blue-900/30 text-blue-300 animate-pulse",
    completed: "bg-emerald-900/30 text-emerald-300",
    failed: "bg-red-900/30 text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${colors[status] || colors.pending}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SourceLink({ url }: { url: string }) {
  try {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-blue-400/80 hover:text-blue-300 underline truncate max-w-sm"
        title={url}
      >
        {new URL(url).hostname}
      </a>
    );
  } catch {
    return <span className="text-[11px] text-zinc-500">{url}</span>;
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
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b0f1a] text-zinc-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(61,126,255,0.12),_transparent_55%)]" />
        <header className="relative z-10 border-b border-white/5">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-bold text-indigo-300 border border-indigo-500/30">
                AX
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide">Syntra</p>
                <p className="text-[11px] text-zinc-500">AI-Powered Due Diligence</p>
              </div>
            </div>
          </div>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">
              Report not found
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              This report has expired or no longer exists.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm text-indigo-300 hover:bg-indigo-500/30 transition"
            >
              Create your own report →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b0f1a] text-zinc-100">
      {/* Easter egg #5: triple-tap header → verifierContradictsClaim */}
      <ShareDemoLayer />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(61,126,255,0.12),_transparent_55%)]" />

      <header className="relative z-10 border-b border-white/5">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-bold text-indigo-300 border border-indigo-500/30">
              AX
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Syntra</p>
              <p className="text-[11px] text-zinc-500">AI-Powered Due Diligence</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-400">
            Public Report
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 pb-24 pt-8">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
            {report.domain}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-zinc-500">
            <StatusBadge status={report.status} />
            <span className="text-zinc-700">•</span>
            <span>
              Generated{" "}
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {report.riskScores && (
              <>
                <span className="text-zinc-700">•</span>
                <span className="font-semibold text-indigo-300">
                  Score: {report.riskScores.overall}/100
                </span>
              </>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {report.executiveSummary?.data && (
          <section className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                📋 Investment Memo
              </h2>
              <span
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${
                  report.executiveSummary.data.verdict === "Buy"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : report.executiveSummary.data.verdict === "Pass"
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {report.executiveSummary.data.verdict}
              </span>
            </div>
            <p className="text-base text-zinc-200 leading-relaxed mb-4">
              {report.executiveSummary.data.investmentThesis}
            </p>
            <p className="text-sm text-zinc-400 italic">
              {report.executiveSummary.data.recommendation}
            </p>
          </section>
        )}

        {/* Teaser */}
        {report.teaser.data && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
            <h2 className="text-lg font-semibold text-white mb-4">
              ⚡ Teaser Report
            </h2>
            <p className="text-base text-zinc-200 leading-relaxed">
              {report.teaser.data.summary}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  GTM Model
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-300">
                  {report.teaser.data.plgOrSlg}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                  Tech Signals
                </p>
                <div className="mt-1 space-y-1 text-sm text-zinc-300">
                  {report.teaser.data.techSignals.slice(0, 3).map((s, i) => (
                    <div key={i}>› {s}</div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Engine Results */}
        <div className="grid gap-4 sm:grid-cols-2">
          {sectionLabels.map(({ label, key, icon }) => {
            const engine = report.engines[key];
            if (engine.status !== "completed" || !engine.data) return null;
            return (
              <div
                key={key}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h3 className="text-base font-semibold text-white mb-3">
                  {icon} {label}
                </h3>
                <div className="space-y-3">
                  {Object.entries(engine.data).map(([k, value]) => {
                    if (
                      value === null ||
                      value === undefined ||
                      (Array.isArray(value) && value.length === 0)
                    )
                      return null;
                    if (typeof value === "string") {
                      return (
                        <div key={k} className="text-sm">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                            {k.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-zinc-300">{value}</p>
                        </div>
                      );
                    }
                    if (Array.isArray(value) && value.length > 0) {
                      if (typeof value[0] === "object") {
                        return (
                          <div key={k} className="text-sm">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 mb-1">
                              {k.replace(/([A-Z])/g, " $1").trim()}
                            </p>
                            {value.slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                className="text-zinc-300 mb-1 text-xs"
                              >
                                {Object.entries(
                                  item as Record<string, unknown>
                                )
                                  .map(([sk, sv]) => `${sk}: ${sv}`)
                                  .join(" • ")}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <div key={k} className="text-sm">
                          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600 mb-0.5">
                            {k.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <ul className="space-y-0.5">
                            {value.slice(0, 4).map((item, i) => (
                              <li key={i} className="text-zinc-300">
                                › {String(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {engine.sources.length > 0 && (
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex flex-wrap gap-2">
                        {engine.sources.slice(0, 3).map((url, i) => (
                          <SourceLink key={i} url={url} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-4 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-zinc-500 mb-4">
            Want your own AI-powered due diligence report?
          </p>
          <Link
            href="/"
            className="inline-flex rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-6 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/30 transition"
          >
            Create your report for free →
          </Link>
          <p className="mt-6 text-[11px] text-zinc-700">
            Powered by Syntra + Linkup • All claims include source citations
          </p>
        </div>
      </main>
    </div>
  );
}
