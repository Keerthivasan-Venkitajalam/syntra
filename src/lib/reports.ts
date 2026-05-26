import { Report, RiskScores } from "@/lib/types";

const reports = new Map<string, Report>();

const pendingEngine = () =>
  ({ status: "pending" as const, data: null, sources: [] });

export function createReport(domain: string) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const report: Report = {
    id,
    domain,
    status: "queued",
    createdAt: now,
    updatedAt: now,
    riskScores: null,
    teaser: pendingEngine(),
    engines: {
      commercial: pendingEngine(),
      technical: pendingEngine(),
      esg: pendingEngine(),
      aiAct: pendingEngine(),
      competitors: pendingEngine(),
      redFlags: pendingEngine(),
      financial: pendingEngine(),
      leadership: pendingEngine(),
      marketSizing: pendingEngine(),
      annualReport: pendingEngine(),
    },
    executiveSummary: pendingEngine(),
  };

  reports.set(id, report);
  return report;
}

export function getReport(id: string) {
  return reports.get(id) ?? null;
}

export function listReports() {
  return Array.from(reports.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateReport(id: string, updater: (report: Report) => Report) {
  const current = reports.get(id);
  if (!current) return null;
  const updated = updater({ ...current, updatedAt: new Date().toISOString() });
  reports.set(id, updated);
  return updated;
}

export function setReportStatus(id: string, status: Report["status"]) {
  return updateReport(id, (report) => ({ ...report, status }));
}

export function updateTeaser(id: string, data: Report["teaser"]) {
  return updateReport(id, (report) => ({ ...report, teaser: data }));
}

export function updateEngine(
  id: string,
  key: keyof Report["engines"],
  data: Report["engines"][keyof Report["engines"]]
) {
  return updateReport(id, (report) => ({
    ...report,
    engines: { ...report.engines, [key]: data },
  }));
}

export function updateRiskScores(id: string, scores: RiskScores) {
  return updateReport(id, (report) => ({ ...report, riskScores: scores }));
}

export function updateExecutiveSummary(id: string, data: Report["executiveSummary"]) {
  return updateReport(id, (report) => ({ ...report, executiveSummary: data }));
}

export function seedReport(report: Report) {
  reports.set(report.id, report);
}
