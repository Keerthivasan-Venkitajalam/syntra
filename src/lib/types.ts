export type ReportStatus = "queued" | "running" | "completed" | "failed";
export type EngineStatus = "pending" | "running" | "completed" | "failed";

export type PdfSource = {
  url: string;
  title?: string;
  /** true when fetched via Linkup /fetch with PDF support */
  fetched: boolean;
};

export type EngineResult<T> = {
  status: EngineStatus;
  data: T | null;
  sources: string[];
  /** PDF documents analyzed by this engine via Linkup /fetch */
  pdfSources?: PdfSource[];
  /** true when this engine used Linkup /research (deep mode) */
  deepResearch?: boolean;
  error?: string;
};

export type RiskScores = {
  overall: number;
  commercial: number;
  technical: number;
  esg: number;
  regulatory: number;
  competitive: number;
  financial: number;
  leadership: number;
};

export type Report = {
  id: string;
  domain: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  riskScores: RiskScores | null;
  teaser: EngineResult<{
    summary: string;
    plgOrSlg: string;
    techSignals: string[];
  }>;
  engines: {
    commercial: EngineResult<Record<string, unknown>>;
    technical: EngineResult<Record<string, unknown>>;
    esg: EngineResult<Record<string, unknown>>;
    aiAct: EngineResult<Record<string, unknown>>;
    competitors: EngineResult<Record<string, unknown>>;
    redFlags: EngineResult<Record<string, unknown>>;
    financial: EngineResult<Record<string, unknown>>;
    leadership: EngineResult<Record<string, unknown>>;
    marketSizing: EngineResult<Record<string, unknown>>;
    /** New — powered by Linkup /fetch PDF + /research */
    annualReport: EngineResult<{
      documentTitle: string | null;
      documentUrl: string | null;
      revenue: string | null;
      netIncome: string | null;
      totalAssets: string | null;
      keyRisks: string[];
      keyOpportunities: string[];
      auditOpinion: string | null;
      fiscalYear: string | null;
      highlights: string[];
    } | null>;
  };
  executiveSummary: EngineResult<{
    verdict: string;
    investmentThesis: string;
    keyStrengths: string[];
    keyRisks: string[];
    recommendation: string;
  }>;
};
