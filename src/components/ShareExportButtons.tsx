"use client";

import { useState } from "react";
import { Report } from "@/lib/types";

export function ShareExportButtons({
  reportId,
  report,
}: {
  reportId: string;
  report: Report;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${reportId}`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.domain}-syntra-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sections = [
      { label: "Commercial Footprint", key: "commercial" as const },
      { label: "Technical Stack", key: "technical" as const },
      { label: "ESG Posture", key: "esg" as const },
      { label: "EU AI Act Risk", key: "aiAct" as const },
      { label: "Competitive Landscape", key: "competitors" as const },
      { label: "Red Flags & Risks", key: "redFlags" as const },
    ];

    const renderValue = (val: unknown): string => {
      if (val === null || val === undefined) return "Not disclosed";
      if (typeof val === "string" || typeof val === "boolean") return String(val);
      if (Array.isArray(val)) {
        if (val.length === 0) return "None found";
        if (typeof val[0] === "object") {
          return val
            .slice(0, 5)
            .map((item) =>
              Object.entries(item as Record<string, unknown>)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" | ")
            )
            .join("<br/>");
        }
        return val.map((v) => `• ${String(v)}`).join("<br/>");
      }
      if (typeof val === "object") {
        return Object.entries(val)
          .map(([k, v]) => `<strong>${k}:</strong> ${v ? String(v) : "Not disclosed"}`)
          .join("<br/>");
      }
      return String(val);
    };

    const verdictColor =
      report.executiveSummary?.data?.verdict === "Buy"
        ? "#10b981"
        : report.executiveSummary?.data?.verdict === "Pass"
          ? "#ef4444"
          : "#f59e0b";

    const execSummaryHtml = report.executiveSummary?.data
      ? `<div style="border:2px solid ${verdictColor};border-radius:12px;padding:20px;margin-bottom:24px;background:#fafafa">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h2 style="margin:0;font-size:20px">Investment Memo</h2>
            <span style="background:${verdictColor};color:white;padding:6px 16px;border-radius:8px;font-weight:bold;font-size:16px">${report.executiveSummary.data.verdict}</span>
          </div>
          <p style="font-size:14px;line-height:1.6">${report.executiveSummary.data.investmentThesis}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
            <div><h4 style="color:#10b981;margin:0 0 8px 0;font-size:13px">KEY STRENGTHS</h4>${report.executiveSummary.data.keyStrengths.map((s) => `<p style="margin:4px 0;font-size:13px">✓ ${s}</p>`).join("")}</div>
            <div><h4 style="color:#ef4444;margin:0 0 8px 0;font-size:13px">KEY RISKS</h4>${report.executiveSummary.data.keyRisks.map((r) => `<p style="margin:4px 0;font-size:13px">⚠ ${r}</p>`).join("")}</div>
          </div>
          <p style="margin-top:12px;font-style:italic;color:#666;font-size:13px">${report.executiveSummary.data.recommendation}</p>
        </div>`
      : "";

    const riskHtml = report.riskScores
      ? `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:24px">
          <h3 style="margin:0 0 12px 0">Risk Scores (Overall: ${report.riskScores.overall}/100)</h3>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center">
            ${(["commercial", "technical", "esg", "regulatory", "competitive"] as const)
              .map((k) => `<div><div style="font-size:24px;font-weight:bold;color:${report.riskScores![k] >= 75 ? "#10b981" : report.riskScores![k] >= 50 ? "#f59e0b" : "#ef4444"}">${report.riskScores![k]}</div><div style="font-size:11px;color:#888">${k}</div></div>`)
              .join("")}
          </div>
        </div>`
      : "";

    const teaserHtml = report.teaser.data
      ? `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:24px">
          <h3 style="margin:0 0 8px 0">Teaser Report</h3>
          <p style="font-size:14px;line-height:1.6">${report.teaser.data.summary}</p>
          <p style="margin-top:8px"><strong>GTM:</strong> ${report.teaser.data.plgOrSlg}</p>
          ${report.teaser.data.techSignals.length > 0 ? `<p style="margin-top:4px"><strong>Tech:</strong> ${report.teaser.data.techSignals.join(", ")}</p>` : ""}
        </div>`
      : "";

    const engineHtml = sections
      .map(({ label, key }) => {
        const engine = report.engines[key];
        if (!engine.data) return "";
        const dataHtml = Object.entries(engine.data)
          .filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
          .map(
            ([k, v]) =>
              `<div style="margin-bottom:10px"><div style="font-size:11px;text-transform:uppercase;color:#888;margin-bottom:2px">${k.replace(/([A-Z])/g, " $1").trim()}</div><div style="font-size:13px">${renderValue(v)}</div></div>`
          )
          .join("");
        return `<div style="break-inside:avoid;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px"><h3 style="margin:0 0 12px 0;font-size:16px">${label}</h3>${dataHtml}</div>`;
      })
      .join("");

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Syntra: ${report.domain}</title><style>
      body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:800px;margin:0 auto;padding:40px 24px;color:#1a1a1a;font-size:14px;line-height:1.6}
      @media print{body{padding:20px}}</style></head><body>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="width:36px;height:36px;background:#4f46e5;color:white;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;font-weight:bold">AX</div>
        <div><strong style="font-size:18px">Syntra</strong> <span style="color:#888">Due Diligence Report</span></div>
      </div>
      <h1 style="font-size:28px;margin:16px 0 4px 0">${report.domain}</h1>
      <p style="color:#888;font-size:13px;margin:0 0 20px 0">Generated ${new Date(report.createdAt).toLocaleDateString()} • ${Object.values(report.engines).reduce((n, e) => n + e.sources.length, report.teaser.sources.length)} sources analyzed</p>
      ${execSummaryHtml}${riskHtml}${teaserHtml}
      <h2 style="border-bottom:2px solid #e5e7eb;padding-bottom:8px">Detailed Analysis</h2>
      ${engineHtml}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#888;text-align:center">
        <p>Powered by Syntra + Linkup • Every claim includes source citations • Report ID: ${reportId}</p>
      </div>
    </body></html>`);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <button
        onClick={handleCopyShare}
        className="text-[11px] font-medium rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-zinc-300 hover:bg-white/[0.06] transition"
      >
        {copied ? "Copied!" : "Share"}
      </button>
      <button
        onClick={handleExportPDF}
        className="text-[11px] font-medium rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-zinc-300 hover:bg-white/[0.06] transition"
      >
        PDF
      </button>
      <button
        onClick={handleExportJSON}
        className="text-[11px] font-medium rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-zinc-300 hover:bg-white/[0.06] transition"
      >
        JSON
      </button>
    </div>
  );
}
