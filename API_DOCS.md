# API Documentation & Extension Guide — Syntra

---

## REST API Endpoints

### POST `/api/report/create`
Starts a new diligence report. In demo mode (`SYNTRA_DEMO_MODE=true`) returns the fixture instantly for the 3 demo domains.

**Request:**
```json
{ "domain": "stripe.com" }
```

**Response:**
```json
{
  "id": "demo-stripe",
  "domain": "stripe.com",
  "status": "completed"
}
```

Status transitions: `queued → running → completed | failed`  
Navigate to `/dashboard/{id}` to monitor live progress.

---

### GET `/api/report/{id}`
Returns the full report object with all engine results, sources, and scores.

**Response shape:**
```typescript
{
  id: string;
  domain: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  riskScores: {
    overall: number;       // 0–100 composite
    commercial: number;
    technical: number;
    esg: number;
    regulatory: number;    // AI Act risk inverted
    competitive: number;
    financial: number;
    leadership: number;
  } | null;
  teaser: EngineResult<{ summary, plgOrSlg, techSignals }>;
  engines: {
    commercial:  EngineResult<CommercialData>;
    technical:   EngineResult<TechnicalData>;
    esg:         EngineResult<EsgData>;
    aiAct:       EngineResult<AiActData>;
    competitors: EngineResult<CompetitorsData>;
    redFlags:    EngineResult<RedFlagsData>;
    financial:   EngineResult<FinancialData>;
    leadership:  EngineResult<LeadershipData>;
    marketSizing: EngineResult<MarketSizingData>;
  };
  executiveSummary: EngineResult<{
    verdict: "Buy" | "Hold" | "Pass" | "Needs More Data";
    investmentThesis: string;
    keyStrengths: string[];
    keyRisks: string[];
    recommendation: string;
  }>;
}

type EngineResult<T> = {
  status: "pending" | "running" | "completed" | "failed";
  data: T | null;
  sources: string[];
  error?: string;
};
```

---

### GET `/api/reports`
Lists all reports in the current session, sorted newest-first.

**Response:** Array of summary objects (id, domain, status, riskScores, verdict, engineCount, sourceCount).

---

## Engine Reference

All engines follow the same contract: `(domain: string) => Promise<{ data, sources }>`.  
Each runs a Linkup search, sanitizes results through the prompt-injection detector, then calls the AI gateway for structured synthesis.

| Engine | Linkup depth | Searches | Key outputs |
|---|---|---|---|
| **Teaser** | standard | 1 | summary, plgOrSlg, techSignals |
| **Commercial** | deep | 1 | pricingVisibility, signupFlow, freeTrial, plgSignals, slgSignals |
| **Technical** | standard | 1 | languages, cloud, databases, vendors, openSource, techDebtSignals |
| **ESG** | standard | 1 | sustainabilityReport, emissions (scope 1/2/3), deiInitiatives, supplierRisks |
| **EU AI Act** | deep | 1 | aiFeatures, governanceSignals, riskTier, missingDisclosures |
| **Competitors** | deep | 1 | directCompetitors, indirectCompetitors, marketPosition, moatStrength |
| **Red Flags** | deep | 1 | dealBreakers, warnings, lawsuits, dataBreaches, layoffs, overallSeverity |
| **Financial** | deep | 2 (funding + revenue) | fundingRounds, totalFunding, latestValuation, revenueEstimate, profitability |
| **Leadership** | deep | 2 (execs + culture) | keyExecutives, founderLed, glassdoorRating, hiringVelocity, keyPersonRisk |
| **Market Sizing** | deep | 1 | industry, tam, sam, som, cagr, marketTrends, tailwinds, headwinds |

**India-only (conditional):**  
When domain TLD is `.in`, `.co.in`, or `.org.in`: fire the **Udyam Verifier** engine which cross-references government MSME registration data against web claims. Mismatches feed into Red Flags as `dealBreakers`.

---

## Extension Guide: Adding a New Engine

### 1. Add the data type to `src/lib/types.ts`

```typescript
export type SupplyChainData = {
  keySuppliers: string[];
  concentrationRisk: "High" | "Medium" | "Low" | "Unknown";
  geoRisks: string[];
  notes: string;
};

// Add to Report.engines:
supplyChain: EngineResult<SupplyChainData>;
```

### 2. Implement the engine in `src/lib/engines/index.ts`

```typescript
export async function runSupplyChain(domain: string) {
  const results = await linkupSearch({
    query: `Find supply chain, key suppliers, and vendor concentration risks for ${domain}.`,
    depth: "deep",
  });

  const { context } = generateSafeContext(
    results.results.map((r) => ({ url: r.url, content: r.content }))
  );

  const schemaHint =
    '{"keySuppliers":["string"],"concentrationRisk":"High|Medium|Low|Unknown","geoRisks":["string"],"notes":"string"}';

  const aiOutput = await runGatewayJson<SupplyChainData>({
    system: "You are a supply chain risk analyst. Be specific with company and country names.",
    prompt: `Analyze supply chain risks for ${domain}.\n\n${context}`,
    schemaHint,
  });

  return {
    data: {
      keySuppliers: aiOutput?.keySuppliers ?? [],
      concentrationRisk: aiOutput?.concentrationRisk ?? "Unknown",
      geoRisks: aiOutput?.geoRisks ?? [],
      notes: aiOutput?.notes ?? "No supply chain data found.",
    },
    sources: results.results.map((r) => r.url),
  };
}
```

### 3. Register it in `src/lib/runReport.ts`

```typescript
const engines = [
  // ... existing ...
  { key: "supplyChain" as const, fn: runSupplyChain },
];
```

### 4. Add it to the dashboard sections in `src/app/dashboard/[id]/page.tsx`

```typescript
{ label: "Supply Chain Risk", key: "supplyChain", icon: "🔗", color: "from-teal-500/20 to-teal-500/5" },
```

That's the entire extension surface. The dashboard renderer, risk score calculator, and export functions are all data-driven.

---

## Demo Mode

When `SYNTRA_DEMO_MODE=true`:

1. `api/report/create` shortcuts to fixture IDs for `stripe.com`, `figma.com`, `acme-batteries.in` — no `runReport` call.
2. `linkupSearch` returns synthetic results (200–600ms simulated latency).
3. `runGatewayJson` returns empty objects (fixture data is used directly).
4. All 3 fixtures are seeded at server startup via `seedDemoReports()`.

**Fixture files:** `src/lib/demo/fixtures/stripe.json`, `figma.json`, `acme_batteries.json`  
**Verify:** `npm run demo:check`  
**Run:** `npm run demo:dev`

---

## Environment Variables

```env
# Required
LINKUP_API_KEY=                         # https://app.linkup.so

# LLM — one of:
OPENAI_API_KEY=                         # direct OpenAI
VERCEL_AI_GATEWAY_API_KEY=              # Vercel AI Gateway (recommended)
VERCEL_AI_GATEWAY_URL=                  # defaults to ai-gateway.vercel.sh

# Model (default: gpt-4o-mini)
AI_MODEL=gpt-4o-mini

# Share links
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Demo mode
SYNTRA_DEMO_MODE=false
```

---

## Security Architecture

**Prompt-injection detection** (`src/lib/sanitization.ts`):
- 11 regex patterns covering `ignore previous instructions`, hex encoding, template injection, HTML/JS comments
- Score threshold: 0.5 → content quarantined, minimal safe stub returned
- Applied to every Linkup result before it reaches the LLM

**Rate limiting** (`src/lib/rateLimit.ts`):
- 5 requests per IP per 60-second window (in-memory sliding window)
- Returns `429` with `Retry-After` header

**Domain validation** (`src/lib/validators.ts`):
- Strips protocol, path, `www.` prefix
- Rejects IPs, bare keywords, malformed TLDs

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Engines stuck on "running" | Missing API keys | Check `.env.local` — restart after changes |
| `LINKUP_API_KEY is not set` | Env not loaded | `cp .env.example .env.local` + fill keys |
| `Invalid domain` error | Format wrong | Use `stripe.com` not `https://stripe.com` |
| Linkup 429 | Rate limit | Auto-retries with backoff; wait 60s if persistent |
| Share link → "Report not found" | Cold start cleared store | Create a fresh report; add Postgres for persistence |
| Demo fixtures not loading | `SYNTRA_DEMO_MODE` not set | Check `.env.local`; run `npm run demo:check` |

### Build / cold-start reset
```bash
rm -rf .next node_modules && npm install && npm run build
```

---

## Unit Economics

| Item | Cost |
|---|---|
| Linkup `standard` search | €0.005 |
| Linkup `deep` search | €0.05 |
| GPT-4o-mini per report | ~€0.008 |
| **Full 9-engine report** | **€0.04–0.50** |
| Per-credit revenue (Analyst tier) | $1.20 |
| **Gross margin** | **75–90%** |
