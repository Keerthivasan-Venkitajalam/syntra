import { runGatewayJson } from "@/lib/aiGateway";
import {
  extractPdfUrls,
  linkupFetch,
  linkupResearch,
  linkupSearch,
} from "@/lib/linkup";
import { generateSafeContext } from "@/lib/sanitization";
import { PdfSource, Report } from "@/lib/types";

export async function runTeaser(domain: string) {
  const results = await linkupSearch({
    query: `Find a concise company overview and GTM signals for ${domain}. Look for pricing pages, signup flows, and engineering or hiring posts.`,
    depth: "standard",
  });

  const sources = results.results.map((item) => item.url);
  const { context } = generateSafeContext(
    results.results.map((item) => ({
      url: item.url,
      content: item.content,
    }))
  );

  const schemaHint =
    '{"summary":"string (3 sentences)","plgOrSlg":"PLG|SLG|Hybrid|Unknown","techSignals":["string (up to 5)"]}';

  const aiOutput = await runGatewayJson<{
    summary: string;
    plgOrSlg: string;
    techSignals: string[];
  }>({
    system:
      "You are a due diligence analyst at a top PE firm. Extract concise, evidence-based signals. Be specific with company names and data points.",
    prompt: `Using the sources below, create a 3-sentence summary of ${domain}, classify PLG vs SLG with evidence, and list up to 5 tech signals.\n\n${context}`,
    schemaHint,
  });

  return {
    summary:
      aiOutput?.summary ??
      `Initial overview for ${domain} based on public sources.`,
    plgOrSlg: aiOutput?.plgOrSlg ?? "Unknown",
    techSignals: aiOutput?.techSignals ?? [],
    sources,
  };
}

export async function runCommercial(domain: string) {
  const results = await linkupSearch({
    query: `Find ${domain} pricing page, signup flow, free trial, and sales/demo CTAs. Extract evidence of self-serve vs sales-led onboarding, pricing tiers, and conversion funnel.`,
    depth: "deep",
  });

  const sources = results.results.map((item) => item.url);
  const { context } = generateSafeContext(
    results.results.map((item) => ({
      url: item.url,
      content: item.content,
    }))
  );

  const schemaHint =
    '{"plgSignals":["string"],"slgSignals":["string"],"pricingVisibility":"Visible|Hidden|Partial|Unknown","signupFlow":"Self-serve|Sales-assisted|Unknown","freeTrial":"Yes|No|Unknown","pricingTiers":["string"],"notes":"string"}';

  const aiOutput = await runGatewayJson<{
    plgSignals: string[];
    slgSignals: string[];
    pricingVisibility: string;
    signupFlow: string;
    freeTrial: string;
    pricingTiers: string[];
    notes: string;
  }>({
    system:
      "You are a GTM analyst at a PE firm. Extract specific commercial signals with evidence. Name specific pricing tiers and amounts where visible.",
    prompt: `Analyze commercial and GTM signals for ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      plgSignals: aiOutput?.plgSignals ?? [],
      slgSignals: aiOutput?.slgSignals ?? [],
      pricingVisibility: aiOutput?.pricingVisibility ?? "Unknown",
      signupFlow: aiOutput?.signupFlow ?? "Unknown",
      freeTrial: aiOutput?.freeTrial ?? "Unknown",
      pricingTiers: aiOutput?.pricingTiers ?? [],
      notes: aiOutput?.notes ?? "No additional signals found.",
    },
    sources,
  };
}

export async function runTechnical(domain: string) {
  const results = await linkupSearch({
    query: `Find engineering blog posts, job listings, GitHub repos, and technical stack signals for ${domain}. Focus on languages, cloud infrastructure, databases, and vendor dependencies.`,
    depth: "standard",
  });

  const sources = results.results.map((item) => item.url);
  const { context } = generateSafeContext(
    results.results.map((item) => ({
      url: item.url,
      content: item.content,
    }))
  );

  const schemaHint =
    '{"languages":["string"],"cloud":["string"],"databases":["string"],"vendors":["string"],"openSource":"Yes|No|Partial|Unknown","techDebtSignals":["string"],"notes":"string"}';

  const aiOutput = await runGatewayJson<{
    languages: string[];
    cloud: string[];
    databases: string[];
    vendors: string[];
    openSource: string;
    techDebtSignals: string[];
    notes: string;
  }>({
    system:
      "You are a technical due diligence analyst. Extract concrete stack signals with evidence. Be specific about versions and technologies where possible.",
    prompt: `Extract technical stack signals for ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      languages: aiOutput?.languages ?? [],
      cloud: aiOutput?.cloud ?? [],
      databases: aiOutput?.databases ?? [],
      vendors: aiOutput?.vendors ?? [],
      openSource: aiOutput?.openSource ?? "Unknown",
      techDebtSignals: aiOutput?.techDebtSignals ?? [],
      notes: aiOutput?.notes ?? "No verified stack signals found.",
    },
    sources,
  };
}

export async function runEsg(domain: string) {
  // ── Parallel: web search + search for ESG/sustainability PDF reports ──
  const [results, pdfSearch] = await Promise.all([
    linkupSearch({
      query: `Find sustainability reports, ESG disclosures, carbon emissions data, DEI initiatives, and CSR statements for ${domain}. Look for Scope 1/2/3 emissions and supplier sustainability.`,
      depth: "standard",
    }),
    linkupSearch({
      query: `${domain} sustainability report ESG report CSR PDF filetype:pdf`,
      depth: "fast",
    }),
  ]);

  const sources = results.results.map((item) => item.url);
  const pdfSources: PdfSource[] = [];

  // ── Fetch sustainability report PDF via Linkup /fetch (PDF-capable) ──
  const pdfUrls = extractPdfUrls(pdfSearch.results);
  let pdfContext = "";
  for (const pdfUrl of pdfUrls.slice(0, 1)) {
    try {
      const fetched = await linkupFetch(pdfUrl);
      if (fetched.content) {
        pdfContext = `\n\nSUSTAINABILITY REPORT (PDF via Linkup /fetch):\nSource: ${pdfUrl}\n${fetched.content.slice(0, 2500)}`;
        pdfSources.push({ url: pdfUrl, title: fetched.title ?? "Sustainability Report", fetched: true });
        sources.push(pdfUrl);
      }
    } catch {
      // PDF fetch failed — continue with search results
    }
  }

  const { context } = generateSafeContext(
    results.results.map((item) => ({
      url: item.url,
      content: item.content,
    }))
  );

  const schemaHint =
    '{"sustainabilityReport":"string|null","emissions":{"scope1":"string|null","scope2":"string|null","scope3":"string|null"},"deiInitiatives":["string"],"supplierRisks":["string"],"esgRating":"string|null","notes":"string"}';

  const aiOutput = await runGatewayJson<{
    sustainabilityReport: string | null;
    emissions: {
      scope1: string | null;
      scope2: string | null;
      scope3: string | null;
    };
    deiInitiatives: string[];
    supplierRisks: string[];
    esgRating: string | null;
    notes: string;
  }>({
    system:
      "You are an ESG analyst. Extract explicit disclosures and note critical gaps. PDF sustainability reports take priority. Be specific about what's missing.",
    prompt: `Analyze ESG posture for ${domain}.\n\n${context}${pdfContext}`,
    schemaHint,
  });

  return {
    data: {
      sustainabilityReport: aiOutput?.sustainabilityReport ?? null,
      emissions: aiOutput?.emissions ?? {
        scope1: null,
        scope2: null,
        scope3: null,
      },
      deiInitiatives: aiOutput?.deiInitiatives ?? [],
      supplierRisks: aiOutput?.supplierRisks ?? [],
      esgRating: aiOutput?.esgRating ?? null,
      notes: aiOutput?.notes ?? "No ESG disclosures found.",
    },
    sources,
    pdfSources: pdfSources.length > 0 ? pdfSources : undefined,
  };
}

export async function runAiAct(domain: string) {
  const results = await linkupSearch({
    query: `Find public AI features, AI governance policies, data privacy practices, bias testing, and EU AI Act compliance statements for ${domain}. Look for automated decision-making disclosures.`,
    depth: "deep",
  });

  const sources = results.results.map((item) => item.url);
  const { context } = generateSafeContext(
    results.results.map((item) => ({
      url: item.url,
      content: item.content,
    }))
  );

  const schemaHint =
    '{"aiFeatures":["string"],"governanceSignals":["string"],"riskTier":"Low|Medium|High|Unknown","missingDisclosures":["string"],"notes":"string"}';

  const aiOutput = await runGatewayJson<{
    aiFeatures: string[];
    governanceSignals: string[];
    riskTier: string;
    missingDisclosures: string[];
    notes: string;
  }>({
    system:
      "You are an AI compliance analyst specializing in EU AI Act. Extract clear compliance signals, identify gaps, and assess risk tier.",
    prompt: `Assess EU AI Act risk signals for ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      aiFeatures: aiOutput?.aiFeatures ?? [],
      governanceSignals: aiOutput?.governanceSignals ?? [],
      riskTier: aiOutput?.riskTier ?? "Unknown",
      missingDisclosures: aiOutput?.missingDisclosures ?? [],
      notes: aiOutput?.notes ?? "No AI compliance disclosures found.",
    },
    sources,
  };
}

export async function runCompetitors(domain: string) {
  const results = await linkupSearch({
    query: `Who are the main competitors of ${domain}? Find competitive landscape, market positioning, market share data, and how ${domain} differentiates. Include direct and indirect competitors.`,
    depth: "deep",
  });

  const sources = results.results.map((item) => item.url);
  const { context } = generateSafeContext(
    results.results.map((item) => ({
      url: item.url,
      content: item.content,
    }))
  );

  const schemaHint =
    '{"directCompetitors":[{"name":"string","description":"string","threat":"Low|Medium|High"}],"indirectCompetitors":["string"],"marketPosition":"Leader|Challenger|Niche|Unknown","differentiators":["string"],"moatStrength":"Strong|Moderate|Weak|Unknown","notes":"string"}';

  const aiOutput = await runGatewayJson<{
    directCompetitors: Array<{
      name: string;
      description: string;
      threat: string;
    }>;
    indirectCompetitors: string[];
    marketPosition: string;
    differentiators: string[];
    moatStrength: string;
    notes: string;
  }>({
    system:
      "You are a competitive intelligence analyst. Identify specific competitors by name, assess threat levels, and evaluate competitive moat. Be concrete.",
    prompt: `Analyze the competitive landscape for ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      directCompetitors: aiOutput?.directCompetitors ?? [],
      indirectCompetitors: aiOutput?.indirectCompetitors ?? [],
      marketPosition: aiOutput?.marketPosition ?? "Unknown",
      differentiators: aiOutput?.differentiators ?? [],
      moatStrength: aiOutput?.moatStrength ?? "Unknown",
      notes: aiOutput?.notes ?? "No competitive data found.",
    },
    sources,
  };
}

export async function runRedFlags(domain: string) {
  // ── Powered by Linkup /research "investigate" — deeper risk surfacing ──
  const research = await linkupResearch({
    query: `Investigate every risk, controversy, lawsuit, regulatory action, data breach, layoff, negative press, customer complaint, and security incident involving ${domain}. Surface every red flag an investor must know.`,
    mode: "investigate",
    depth: "S",
  });

  const sources = research.sources.map((s) => s.url);

  const schemaHint =
    '{"dealBreakers":["string"],"warnings":["string"],"lawsuits":["string"],"dataBreaches":["string"],"layoffs":"string|null","regulatoryActions":["string"],"overallSeverity":"Critical|High|Medium|Low|None","notes":"string"}';

  const aiOutput = await runGatewayJson<{
    dealBreakers: string[];
    warnings: string[];
    lawsuits: string[];
    dataBreaches: string[];
    layoffs: string | null;
    regulatoryActions: string[];
    overallSeverity: string;
    notes: string;
  }>({
    system:
      "You are a risk analyst performing due diligence. Surface every potential red flag an investor should know about. Distinguish between deal-breakers and warnings. Be specific with dates and details.",
    prompt: `Surface all red flags and deal-breaker risks for ${domain}.\n\nDeep research synthesis:\n${research.answer}`,
    schemaHint,
  });

  return {
    data: {
      dealBreakers: aiOutput?.dealBreakers ?? [],
      warnings: aiOutput?.warnings ?? [],
      lawsuits: aiOutput?.lawsuits ?? [],
      dataBreaches: aiOutput?.dataBreaches ?? [],
      layoffs: aiOutput?.layoffs ?? null,
      regulatoryActions: aiOutput?.regulatoryActions ?? [],
      overallSeverity: aiOutput?.overallSeverity ?? "Unknown",
      notes: aiOutput?.notes ?? "No red flags surfaced.",
    },
    sources,
    deepResearch: true,
  };
}

export async function runFinancial(domain: string) {
  // ── Step 1: standard search for funding + revenue ──
  const [fundingResults, revenueResults, pdfSearchResults] = await Promise.all([
    linkupSearch({
      query: `Find funding rounds, investors, valuation, and capital raised by ${domain}. Look for Series A/B/C, IPO status, and notable investors.`,
      depth: "deep",
    }),
    linkupSearch({
      query: `Find revenue estimates, ARR, growth rate, profitability, and financial metrics for ${domain}. Look for public filings, press releases, and analyst reports.`,
      depth: "standard",
    }),
    // ── Step 2: search specifically for PDF annual reports / 10-K filings ──
    linkupSearch({
      query: `${domain} annual report 10-K SEC filing PDF investor relations filetype:pdf`,
      depth: "fast",
    }),
  ]);

  const allResults = [...fundingResults.results, ...revenueResults.results];
  const sources = allResults.map((item) => item.url);
  const pdfSources: PdfSource[] = [];

  // ── Step 3: Fetch the first PDF found via Linkup /fetch (PDF-capable) ──
  const pdfUrls = extractPdfUrls(pdfSearchResults.results);
  let pdfContext = "";
  for (const pdfUrl of pdfUrls.slice(0, 1)) {
    try {
      const fetched = await linkupFetch(pdfUrl);
      if (fetched.content) {
        pdfContext = `\n\nANNUAL REPORT / FILING (PDF via Linkup /fetch):\nSource: ${pdfUrl}\n${fetched.content.slice(0, 3000)}`;
        pdfSources.push({ url: pdfUrl, title: fetched.title ?? "Annual Report", fetched: true });
        sources.push(pdfUrl);
      }
    } catch {
      // PDF fetch failed — continue with search results
    }
  }

  const { context } = generateSafeContext(
    allResults.map((item) => ({ url: item.url, content: item.content }))
  );

  const schemaHint =
    '{"fundingRounds":[{"round":"string","amount":"string","date":"string","investors":["string"]}],"totalFunding":"string|null","latestValuation":"string|null","revenueEstimate":"string|null","growthRate":"string|null","profitability":"Profitable|Not Profitable|Unknown","ipoStatus":"Public|Private|Pre-IPO|Unknown","burnRate":"string|null","notes":"string"}';

  const aiOutput = await runGatewayJson<{
    fundingRounds: Array<{ round: string; amount: string; date: string; investors: string[] }>;
    totalFunding: string | null;
    latestValuation: string | null;
    revenueEstimate: string | null;
    growthRate: string | null;
    profitability: string;
    ipoStatus: string;
    burnRate: string | null;
    notes: string;
  }>({
    system:
      "You are a financial analyst at a top investment bank. Extract concrete financial data with specific numbers and dates. Distinguish between confirmed data and estimates. PDF filings take priority over estimates.",
    prompt: `Extract financial intelligence for ${domain}.\n\n${context}${pdfContext}`,
    schemaHint,
  });

  return {
    data: {
      fundingRounds: aiOutput?.fundingRounds ?? [],
      totalFunding: aiOutput?.totalFunding ?? null,
      latestValuation: aiOutput?.latestValuation ?? null,
      revenueEstimate: aiOutput?.revenueEstimate ?? null,
      growthRate: aiOutput?.growthRate ?? null,
      profitability: aiOutput?.profitability ?? "Unknown",
      ipoStatus: aiOutput?.ipoStatus ?? "Unknown",
      burnRate: aiOutput?.burnRate ?? null,
      notes: aiOutput?.notes ?? "No financial data found.",
    },
    sources,
    pdfSources: pdfSources.length > 0 ? pdfSources : undefined,
  };
}

export async function runLeadership(domain: string) {
  const [leaderResults, cultureResults] = await Promise.all([
    linkupSearch({
      query: `Find CEO, CTO, CFO, founders, and key executives at ${domain}. Look for leadership team bios, LinkedIn profiles, and previous roles.`,
      depth: "deep",
    }),
    linkupSearch({
      query: `Find employee reviews, company culture, Glassdoor ratings, engineering culture, and work environment for ${domain}.`,
      depth: "standard",
    }),
  ]);

  const allResults = [...leaderResults.results, ...cultureResults.results];
  const sources = allResults.map((item) => item.url);
  const { context } = generateSafeContext(
    allResults.map((item) => ({ url: item.url, content: item.content }))
  );

  const schemaHint =
    '{"keyExecutives":[{"name":"string","title":"string","background":"string"}],"founderLed":"Yes|No|Unknown","teamSize":"string|null","glassdoorRating":"string|null","cultureSignals":["string"],"hiringVelocity":"Growing|Stable|Shrinking|Unknown","keyPersonRisk":"Low|Medium|High|Unknown","notes":"string"}';

  const aiOutput = await runGatewayJson<{
    keyExecutives: Array<{ name: string; title: string; background: string }>;
    founderLed: string;
    teamSize: string | null;
    glassdoorRating: string | null;
    cultureSignals: string[];
    hiringVelocity: string;
    keyPersonRisk: string;
    notes: string;
  }>({
    system:
      "You are an executive recruiter and organizational analyst. Identify key leaders, assess team quality, and flag key-person risks. Be specific with names and backgrounds.",
    prompt: `Analyze the leadership team and organizational health of ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      keyExecutives: aiOutput?.keyExecutives ?? [],
      founderLed: aiOutput?.founderLed ?? "Unknown",
      teamSize: aiOutput?.teamSize ?? null,
      glassdoorRating: aiOutput?.glassdoorRating ?? null,
      cultureSignals: aiOutput?.cultureSignals ?? [],
      hiringVelocity: aiOutput?.hiringVelocity ?? "Unknown",
      keyPersonRisk: aiOutput?.keyPersonRisk ?? "Unknown",
      notes: aiOutput?.notes ?? "No leadership data found.",
    },
    sources,
  };
}

export async function runMarketSizing(domain: string) {
  const results = await linkupSearch({
    query: `Find total addressable market (TAM), serviceable addressable market (SAM), market size estimates, industry growth rate, and market trends for the industry that ${domain} operates in. Include analyst reports and market research.`,
    depth: "deep",
  });

  const sources = results.results.map((item) => item.url);
  const { context } = generateSafeContext(
    results.results.map((item) => ({ url: item.url, content: item.content }))
  );

  const schemaHint =
    '{"industry":"string","tam":"string|null","sam":"string|null","som":"string|null","cagr":"string|null","marketTrends":["string"],"tailwinds":["string"],"headwinds":["string"],"notes":"string"}';

  const aiOutput = await runGatewayJson<{
    industry: string;
    tam: string | null;
    sam: string | null;
    som: string | null;
    cagr: string | null;
    marketTrends: string[];
    tailwinds: string[];
    headwinds: string[];
    notes: string;
  }>({
    system:
      "You are a market research analyst at McKinsey. Provide specific market size figures with sources. Distinguish between estimates and confirmed data. Use dollar figures where available.",
    prompt: `Estimate the market size and trends for the industry of ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      industry: aiOutput?.industry ?? "Unknown",
      tam: aiOutput?.tam ?? null,
      sam: aiOutput?.sam ?? null,
      som: aiOutput?.som ?? null,
      cagr: aiOutput?.cagr ?? null,
      marketTrends: aiOutput?.marketTrends ?? [],
      tailwinds: aiOutput?.tailwinds ?? [],
      headwinds: aiOutput?.headwinds ?? [],
      notes: aiOutput?.notes ?? "No market data found.",
    },
    sources,
  };
}

export async function runExecutiveSummary(report: Report) {
  const allSources = [
    ...report.teaser.sources,
    ...Object.values(report.engines).flatMap((e) => e.sources),
  ];

  const engineData = {
    teaser: report.teaser.data,
    commercial: report.engines.commercial.data,
    technical: report.engines.technical.data,
    esg: report.engines.esg.data,
    aiAct: report.engines.aiAct.data,
    competitors: report.engines.competitors.data,
    redFlags: report.engines.redFlags.data,
    financial: report.engines.financial.data,
    leadership: report.engines.leadership.data,
    marketSizing: report.engines.marketSizing.data,
  };

  const schemaHint =
    '{"verdict":"Buy|Hold|Pass|Needs More Data","investmentThesis":"string (2-3 sentences)","keyStrengths":["string (up to 5)"],"keyRisks":["string (up to 5)"],"recommendation":"string (1-2 sentences)"}';

  const aiOutput = await runGatewayJson<{
    verdict: string;
    investmentThesis: string;
    keyStrengths: string[];
    keyRisks: string[];
    recommendation: string;
  }>({
    system:
      "You are a senior Managing Director at a PE firm writing an investment memo. Synthesize all due diligence findings into a clear, actionable recommendation. Be decisive and specific.",
    prompt: `Write an executive summary for ${report.domain} based on the following due diligence findings:\n\n${JSON.stringify(engineData, null, 2)}`,
    schemaHint,
  });

  return {
    data: aiOutput
      ? {
          verdict: aiOutput.verdict,
          investmentThesis: aiOutput.investmentThesis,
          keyStrengths: aiOutput.keyStrengths,
          keyRisks: aiOutput.keyRisks,
          recommendation: aiOutput.recommendation,
        }
      : null,
    sources: [...new Set(allSources)].slice(0, 20),
  };
}

export function calculateRiskScores(report: Report) {
  const score = (engine: { status: string; data: Record<string, unknown> | null }) => {
    if (engine.status !== "completed" || !engine.data) return 50;
    return 50;
  };

  let commercial = score(report.engines.commercial);
  let technical = score(report.engines.technical);
  let esg = score(report.engines.esg);
  let regulatory = score(report.engines.aiAct);
  let competitive = score(report.engines.competitors);

  const cd = report.engines.commercial.data as Record<string, unknown> | null;
  if (cd) {
    if (cd.pricingVisibility === "Visible") commercial += 15;
    if (cd.signupFlow === "Self-serve") commercial += 10;
    if (cd.freeTrial === "Yes") commercial += 10;
    const plg = cd.plgSignals as string[] | undefined;
    if (plg && plg.length > 2) commercial += 10;
    commercial = Math.min(commercial, 95);
  }

  const td = report.engines.technical.data as Record<string, unknown> | null;
  if (td) {
    const langs = td.languages as string[] | undefined;
    if (langs && langs.length > 3) technical += 15;
    const cloud = td.cloud as string[] | undefined;
    if (cloud && cloud.length > 0) technical += 10;
    const db = td.databases as string[] | undefined;
    if (db && db.length > 0) technical += 10;
    const debt = td.techDebtSignals as string[] | undefined;
    if (debt && debt.length > 2) technical -= 15;
    technical = Math.max(20, Math.min(technical, 95));
  }

  const ed = report.engines.esg.data as Record<string, unknown> | null;
  if (ed) {
    if (ed.sustainabilityReport) esg += 20;
    if (ed.esgRating) esg += 10;
    const emissions = ed.emissions as Record<string, unknown> | undefined;
    if (emissions) {
      if (emissions.scope1) esg += 5;
      if (emissions.scope2) esg += 5;
      if (emissions.scope3) esg += 5;
    }
    esg = Math.min(esg, 95);
  }

  const ad = report.engines.aiAct.data as Record<string, unknown> | null;
  if (ad) {
    if (ad.riskTier === "Low") regulatory += 25;
    else if (ad.riskTier === "Medium") regulatory += 10;
    else if (ad.riskTier === "High") regulatory -= 10;
    const gov = ad.governanceSignals as string[] | undefined;
    if (gov && gov.length > 2) regulatory += 10;
    const missing = ad.missingDisclosures as string[] | undefined;
    if (missing && missing.length > 2) regulatory -= 15;
    regulatory = Math.max(15, Math.min(regulatory, 95));
  }

  const comp = report.engines.competitors.data as Record<string, unknown> | null;
  if (comp) {
    if (comp.moatStrength === "Strong") competitive += 25;
    else if (comp.moatStrength === "Moderate") competitive += 10;
    else if (comp.moatStrength === "Weak") competitive -= 10;
    if (comp.marketPosition === "Leader") competitive += 15;
    else if (comp.marketPosition === "Challenger") competitive += 5;
    const diff = comp.differentiators as string[] | undefined;
    if (diff && diff.length > 2) competitive += 10;
    competitive = Math.max(15, Math.min(competitive, 95));
  }

  const rf = report.engines.redFlags.data as Record<string, unknown> | null;
  if (rf) {
    if (rf.overallSeverity === "Critical") {
      commercial -= 20;
      regulatory -= 20;
    } else if (rf.overallSeverity === "High") {
      commercial -= 10;
      regulatory -= 10;
    }
    const db = rf.dealBreakers as string[] | undefined;
    if (db && db.length > 0) {
      commercial -= db.length * 5;
      regulatory -= db.length * 5;
    }
    commercial = Math.max(10, commercial);
    regulatory = Math.max(10, regulatory);
  }

  let financial = score(report.engines.financial);
  const fd = report.engines.financial.data as Record<string, unknown> | null;
  if (fd) {
    if (fd.totalFunding) financial += 10;
    if (fd.revenueEstimate) financial += 15;
    if (fd.profitability === "Profitable") financial += 20;
    else if (fd.profitability === "Not Profitable") financial -= 5;
    if (fd.ipoStatus === "Public") financial += 10;
    if (fd.growthRate) financial += 10;
    const rounds = fd.fundingRounds as unknown[] | undefined;
    if (rounds && rounds.length > 2) financial += 10;
    financial = Math.max(15, Math.min(financial, 95));
  }

  let leadership = score(report.engines.leadership);
  const ld = report.engines.leadership.data as Record<string, unknown> | null;
  if (ld) {
    if (ld.founderLed === "Yes") leadership += 10;
    if (ld.glassdoorRating) {
      const rating = parseFloat(String(ld.glassdoorRating));
      if (rating >= 4.0) leadership += 20;
      else if (rating >= 3.5) leadership += 10;
      else if (rating < 3.0) leadership -= 10;
    }
    if (ld.hiringVelocity === "Growing") leadership += 15;
    else if (ld.hiringVelocity === "Shrinking") leadership -= 15;
    if (ld.keyPersonRisk === "Low") leadership += 10;
    else if (ld.keyPersonRisk === "High") leadership -= 15;
    const execs = ld.keyExecutives as unknown[] | undefined;
    if (execs && execs.length >= 3) leadership += 10;
    leadership = Math.max(15, Math.min(leadership, 95));
  }

  const overall = Math.round(
    commercial * 0.15 +
      technical * 0.12 +
      esg * 0.08 +
      regulatory * 0.12 +
      competitive * 0.15 +
      financial * 0.2 +
      leadership * 0.18
  );

  return {
    overall: Math.max(10, Math.min(overall, 95)),
    commercial: Math.round(commercial),
    technical: Math.round(technical),
    esg: Math.round(esg),
    regulatory: Math.round(regulatory),
    competitive: Math.round(competitive),
    financial: Math.round(financial),
    leadership: Math.round(leadership),
  };
}

// ─────────────────────────────────────────────────────────────────
// runAnnualReport — new engine powered by Linkup /fetch PDF + /research
//
// Finds the company's most recent annual report or 10-K filing as a PDF,
// fetches it with the Linkup /fetch endpoint (PDF-capable), and extracts
// key financial and strategic highlights directly from the document.
// Falls back to /research if no PDF is found.
// ─────────────────────────────────────────────────────────────────
export async function runAnnualReport(domain: string) {
  // Step 1 — find the PDF URL
  const pdfSearch = await linkupSearch({
    query: `${domain} annual report 2024 2023 10-K investor relations PDF filetype:pdf site:sec.gov OR site:ir.${domain} OR site:investors.${domain}`,
    depth: "fast",
  });

  const pdfUrls = [
    ...extractPdfUrls(pdfSearch.results),
    // also try non-.pdf links that mention annual report
    ...pdfSearch.results
      .filter((r) => /annual.report|10-k|investor.relations/i.test(r.name + r.content))
      .map((r) => r.url)
      .filter((u) => /\.pdf/i.test(u)),
  ].slice(0, 3);

  let documentTitle: string | null = null;
  let documentUrl: string | null = null;
  let pdfContent = "";
  const pdfSources: PdfSource[] = [];

  // Step 2 — fetch the PDF via Linkup /fetch
  for (const url of pdfUrls) {
    try {
      const fetched = await linkupFetch(url);
      if (fetched.content && fetched.content.length > 200) {
        documentTitle = fetched.title ?? "Annual Report";
        documentUrl = url;
        pdfContent = fetched.content.slice(0, 6000);
        pdfSources.push({ url, title: documentTitle, fetched: true });
        break;
      }
    } catch {
      continue;
    }
  }

  // Step 3 — if no PDF found, fall back to /research "investigate"
  let researchContext = pdfContent;
  const sources: string[] = pdfSources.map((p) => p.url);

  if (!researchContext) {
    const research = await linkupResearch({
      query: `What are the key financial highlights, revenue, profit, risk factors, and strategic opportunities from ${domain}'s most recent annual report or 10-K filing?`,
      mode: "answer",
      depth: "S",
    });
    researchContext = research.answer;
    research.sources.forEach((s) => sources.push(s.url));
  }

  const schemaHint =
    '{"documentTitle":"string|null","revenue":"string|null","netIncome":"string|null","totalAssets":"string|null","keyRisks":["string"],"keyOpportunities":["string"],"auditOpinion":"Unqualified|Qualified|Adverse|Disclaimer|Unknown|null","fiscalYear":"string|null","highlights":["string (up to 6)"]}';

  const aiOutput = await runGatewayJson<{
    documentTitle: string | null;
    revenue: string | null;
    netIncome: string | null;
    totalAssets: string | null;
    keyRisks: string[];
    keyOpportunities: string[];
    auditOpinion: string | null;
    fiscalYear: string | null;
    highlights: string[];
  }>({
    system:
      "You are a financial analyst extracting key data from annual reports and 10-K filings. Be precise with numbers, fiscal years, and audit opinions. Quote figures directly from the document where available.",
    prompt: `Extract annual report highlights for ${domain} from the following document content:\n\n${researchContext}`,
    schemaHint,
  });

  return {
    data: {
      documentTitle: aiOutput?.documentTitle ?? documentTitle,
      documentUrl,
      revenue: aiOutput?.revenue ?? null,
      netIncome: aiOutput?.netIncome ?? null,
      totalAssets: aiOutput?.totalAssets ?? null,
      keyRisks: aiOutput?.keyRisks ?? [],
      keyOpportunities: aiOutput?.keyOpportunities ?? [],
      auditOpinion: aiOutput?.auditOpinion ?? null,
      fiscalYear: aiOutput?.fiscalYear ?? null,
      highlights: aiOutput?.highlights ?? [],
    },
    sources,
    pdfSources: pdfSources.length > 0 ? pdfSources : undefined,
    deepResearch: !pdfContent, // true when fell back to /research
  };
}
