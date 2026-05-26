import {
  calculateRiskScores,
  runAiAct,
  runAnnualReport,
  runCommercial,
  runCompetitors,
  runEsg,
  runExecutiveSummary,
  runFinancial,
  runLeadership,
  runMarketSizing,
  runRedFlags,
  runTeaser,
  runTechnical,
} from "@/lib/engines";
import {
  getReport,
  setReportStatus,
  updateEngine,
  updateExecutiveSummary,
  updateRiskScores,
  updateTeaser,
} from "@/lib/reports";

type EngineEntry = {
  key: keyof import("@/lib/types").Report["engines"];
  fn: (domain: string) => Promise<{ data: Record<string, unknown> | null; sources: string[]; pdfSources?: import("@/lib/types").PdfSource[]; deepResearch?: boolean }>;
};

const engines: EngineEntry[] = [
  { key: "commercial",   fn: runCommercial },
  { key: "technical",    fn: runTechnical },
  { key: "esg",          fn: runEsg },
  { key: "aiAct",        fn: runAiAct },
  { key: "competitors",  fn: runCompetitors },
  { key: "redFlags",     fn: runRedFlags },
  { key: "financial",    fn: runFinancial },
  { key: "leadership",   fn: runLeadership },
  { key: "marketSizing", fn: runMarketSizing },
  { key: "annualReport", fn: runAnnualReport },  // ← new: PDF + /research
];

export async function runReport(id: string, domain: string) {
  setReportStatus(id, "running");

  updateTeaser(id, { status: "running", data: null, sources: [] });

  await runTeaser(domain)
    .then((result) => {
      updateTeaser(id, {
        status: "completed",
        data: {
          summary: result.summary,
          plgOrSlg: result.plgOrSlg,
          techSignals: result.techSignals,
        },
        sources: result.sources,
      });
    })
    .catch((error: Error) => {
      updateTeaser(id, {
        status: "failed",
        data: null,
        sources: [],
        error: error.message,
      });
    });

  for (const { key } of engines) {
    updateEngine(id, key, { status: "running", data: null, sources: [] });
  }

  await Promise.all(
    engines.map(({ key, fn }) =>
      fn(domain)
        .then((result) => {
          updateEngine(id, key, {
            status: "completed",
            data: result.data ?? null,
            sources: result.sources,
            pdfSources: result.pdfSources,
            deepResearch: result.deepResearch,
          });
        })
        .catch((error: Error) => {
          updateEngine(id, key, {
            status: "failed",
            data: null,
            sources: [],
            error: error.message,
          });
        })
    )
  );

  const report = getReport(id);
  if (report) {
    const scores = calculateRiskScores(report);
    updateRiskScores(id, scores);

    updateExecutiveSummary(id, { status: "running", data: null, sources: [] });

    await runExecutiveSummary(report)
      .then((result) => {
        if (result.data) {
          updateExecutiveSummary(id, {
            status: "completed",
            data: result.data,
            sources: result.sources,
          });
        } else {
          updateExecutiveSummary(id, {
            status: "failed",
            data: null,
            sources: [],
            error: "AI synthesis unavailable",
          });
        }
      })
      .catch((error: Error) => {
        updateExecutiveSummary(id, {
          status: "failed",
          data: null,
          sources: [],
          error: error.message,
        });
      });
  }

  setReportStatus(id, "completed");
}
