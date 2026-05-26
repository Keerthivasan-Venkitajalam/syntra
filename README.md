<div align="center">

# Syntra

### Synthetic Diligence Twins for Modern M&A

**Drop a domain. Get a living, source-cited, diffable intelligence Twin in minutes.**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?style=for-the-badge)](https://github.com/Keerthivasan-Venkitajalam/syntra)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-149ECA?style=for-the-badge&logo=react)](https://react.dev)
[![Linkup-Powered](https://img.shields.io/badge/Search-Linkup-E8944A?style=for-the-badge)](https://linkup.so)
[![Vercel AI Gateway](https://img.shields.io/badge/Synthesis-Vercel_AI_Gateway-000000?style=for-the-badge&logo=vercel)](https://vercel.com/ai)

[About](#about-the-project) • [How We Used Linkup](#how-we-used-linkup-in-syntra) • [Architecture](#system-architecture) • [Tech Stack](#tech-stack) • [Engines](#the-ten-intelligence-engines) • [Getting Started](#getting-started) • [Demo Mode](#demo-mode--easter-eggs)

<br/>

### Built for the Linkup Async Hackathon — May 2026

</div>

---

## About the Project

**Syntra** is an autonomous **M&A due diligence platform** that compresses what normally takes a deal team three weeks into a **five-minute Twin**. Unlike chat-based "research assistants" that hallucinate citations and lose state between turns, Syntra produces a structured, source-cited, **diffable artifact** — what we call a **Twin** — a living JSON object that captures every dimension of a target company.

You drop a domain. Syntra fans out **ten parallel intelligence engines** through Linkup's `/search`, `/research`, and `/fetch` (PDF) endpoints, sanitizes every scraped span against prompt-injection patterns, synthesizes structured outputs through the **Vercel AI Gateway**, and renders the result as a Bloomberg-terminal-style dashboard you can share, export, or pit head-to-head against another Twin in a comparison view.

### Three Transformations

- **Fragmented to Twinned** — No more 47 open tabs. Every commercial, technical, ESG, regulatory, financial, and leadership signal lives in **one structured object** keyed to its source URL.
- **Hallucinated to Cited** — Every claim in a Twin links back to a Linkup-retrieved source. There are no "trust me bro" sentences. If a span doesn't cite, it doesn't ship.
- **Static to Diffable** — A Twin is JSON. You can diff today's Stripe Twin against yesterday's, alert on PLG signal regressions, and queue them through an API for downstream actuarial models.

---

## How We Used Linkup in Syntra

Syntra is a **Linkup-native** application. We treat Linkup not as a single search box but as a **three-endpoint research stack** that mirrors how an analyst actually works: scan, dig, and read.

### 1. As the Discovery Layer (`/search`)

Standard- and deep-depth searches drive the **fast scan**:

- **`linkupSearch({ depth: "standard" })`** — sub-second sweeps that produce the **Teaser** (3-sentence overview, PLG-vs-SLG classification, tech-stack signals). Used by 6 of the 10 engines for breadth-first signal capture.
- **`linkupSearch({ depth: "deep" })`** — multi-step crawls reserved for engines that need page-level depth: **Commercial** (pricing funnel), **EU AI Act** (governance disclosures), **Competitors** (moat analysis).

### 2. As the Autonomous Research Agent (`/research`)

For engines where the answer is buried across many sources, we hand off to Linkup's autonomous agent:

- **`linkupResearch({ mode: "investigate", depth: "S" })`** — used by the **Red Flags & Risk** engine to cross-reference lawsuits, breaches, layoffs, and regulatory actions in a single sourced answer instead of stitching 12 search results manually.
- Depth tiers `S → XL` map to `$0.25 / $0.75 / $1.50 / $2.50` per call. We default to `S` for hackathon economics; production deals can dial up to `XL` for board-grade rigor.

### 3. As the Primary-Source Reader (`/fetch` with PDF support)

Linkup's `/fetch` accepts PDFs up to 20 MB and returns clean LLM-ready markdown. This unlocks **primary-source extraction** without a separate PDF pipeline:

- **`linkupFetch(url)`** is called automatically when search results surface a `.pdf` (10-K filings, ESG impact reports, climate disclosures).
- The **Annual Report** engine uses this to extract revenue, audit opinion, fiscal year, and key risks **verbatim from the SEC filing** rather than from a journalist's summary.
- The **Financial** and **ESG** engines render a green "PDF" chip in the UI when a citation came from a fetched document — a verifiability signal an analyst can lean on.

### 4. As the Demo Substrate (Zero-Cost Determinism)

When `SYNTRA_DEMO_MODE=true`, every Linkup call is intercepted and routed to **pre-built fixtures** for `stripe.com`, `figma.com`, and `acme-batteries.in`. This means:

- **Zero outbound API calls** during a demo or judging run.
- **Deterministic output** — the same Twin, every time, frame-perfect.
- **Eight scripted Easter-egg scenarios** (sentinel diff alerts, engine degradation, two-Twin debates, Udyam red-flag fires, verifier contradictions, prompt-injection blocks) that all share the same data plane.

---

## System Architecture

Syntra follows a **fan-out / fan-in** pipeline. A single domain submission expands into ten parallel engine runs, each fully isolated, each citing its own sources, and all converge into one risk-scored Twin.

```mermaid
graph TB
    User[👤 Analyst] -->|Domain| Form[📝 DomainForm]
    Form -->|POST /api/report/create| API[🔌 Next.js Route]
    API -->|Orchestrate| Run[🧠 runReport.ts]

    subgraph "📡 Linkup Endpoints"
        Search[/search<br/>standard + deep/]
        Research[/research<br/>investigate · S–XL/]
        Fetch[/fetch<br/>HTML + PDF ≤ 20MB/]
    end

    subgraph "🛠️ Ten Parallel Engines"
        Run --> T[Teaser]
        Run --> C[Commercial]
        Run --> Te[Technical]
        Run --> E[ESG]
        Run --> A[EU AI Act]
        Run --> Cm[Competitors]
        Run --> R[Red Flags]
        Run --> F[Financial]
        Run --> L[Leadership]
        Run --> M[Market Sizing]
        Run --> Ar[Annual Report]
    end

    T & C & Te & E & A & Cm & F & L & M -->|query| Search
    R -->|investigate| Research
    E & F & Ar -->|fetch PDF| Fetch

    Search & Research & Fetch -->|raw spans| San[🛡️ Sanitizer<br/>prompt-injection filter]
    San -->|safe context| AIG[🤖 Vercel AI Gateway<br/>Anthropic Sonnet 4.5]
    AIG -->|structured JSON| Store[(💾 Report Store)]

    Store --> Score[📊 Risk Scoring]
    Score --> Exec[✨ Executive Summary<br/>Buy · Hold · Pass]
    Exec --> Twin[🌐 Living Twin]

    Twin --> Dash[/dashboard/[id]/]
    Twin --> Share[/share/[id]/]
    Twin --> Compare[/compare?a=...&b=.../]

    classDef linkup fill:#E8944A,stroke:#B86F2E,stroke-width:2px,color:#fff;
    classDef engine fill:#1f6feb,stroke:#1158c7,stroke-width:2px,color:#fff;
    classDef sink fill:#22c55e,stroke:#15803d,stroke-width:2px,color:#fff;

    class Search,Research,Fetch linkup;
    class T,C,Te,E,A,Cm,R,F,L,M,Ar engine;
    class Twin,Dash,Share,Compare sink;
```

### The Engine Contract

Every engine is a pure function with an identical, replaceable shape:

```typescript
type EngineFn = (domain: string) => Promise<{
  data: Record<string, unknown> | null;
  sources: string[];
  pdfSources?: PdfSource[];     // present when /fetch was used
  deepResearch?: boolean;       // true when /research was used
}>;
```

This makes engines **independently testable**, **independently failable** (graceful degradation — three failed engines still ship a Twin), and **independently swappable** (any engine can be replaced without touching the orchestrator).

---

## Tech Stack

### Intelligence Layer

| Component | Role |
| :--- | :--- |
| **Linkup `/search`** | Standard + deep web sweeps · 92 % F-score on SimpleQA · powers 9 of 10 engines |
| **Linkup `/research`** | Autonomous multi-step investigation · used by Red Flags engine |
| **Linkup `/fetch` (PDF)** | Primary-source extraction · turns 10-Ks and ESG PDFs into LLM-ready markdown |
| **Vercel AI Gateway** | Provider-agnostic LLM routing with observability + caching |
| **Anthropic Sonnet 4.5** | Default synthesis model for structured JSON output |

### Application Layer

| Component | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | 16.2.5 | App Router · server actions · edge-deployable |
| **React** | 19.2.4 | Concurrent rendering for live engine status |
| **TypeScript** | 5.x | End-to-end type safety from API to Twin |
| **Tailwind CSS** | v4 | Bloomberg-terminal aesthetic · dark-first |
| **Custom CSS** | — | Curtain reveals, marquee tickers, live clock |

### Runtime & Safety

- **Prompt-injection sanitizer** — scores every scraped span on regex + entropy heuristics before it touches the LLM
- **Rate limiter** — in-memory token bucket gating per-IP report creation
- **HTTP client with retries** — `fetchWithRetry` wraps every Linkup call with exponential backoff
- **In-memory report store** — swappable for Postgres / Redis in production
- **Demo intercept layer** — full `SYNTRA_DEMO_MODE` bypass for zero-cost judging runs

---

## The Ten Intelligence Engines

Each engine is an isolated worker that queries Linkup, sanitizes the result, calls the AI Gateway with a structured-output schema hint, and returns typed JSON.

| # | Engine | Linkup Mode | Outputs |
| :---: | :--- | :--- | :--- |
| 01 | **Commercial Footprint** | `/search` deep | PLG/SLG signals · pricing visibility · signup flow · tiers |
| 02 | **Technical Stack** | `/search` standard | Languages · cloud · databases · vendors · tech-debt signals |
| 03 | **ESG Posture** | `/search` + `/fetch` PDF | Scope 1/2/3 emissions · DEI initiatives · supplier risk |
| 04 | **EU AI Act Risk** | `/search` deep | AI feature inventory · risk tier · missing disclosures |
| 05 | **Competitive Map** | `/search` deep | Direct + indirect competitors · moat strength · market position |
| 06 | **Red Flags & Risk** | `/research` investigate | Lawsuits · breaches · layoffs · regulatory actions |
| 07 | **Financial Deep Dive** | `/search` + `/fetch` PDF | Funding rounds · valuation · revenue · profitability |
| 08 | **Leadership & Culture** | `/search` standard | Key execs · Glassdoor · hiring velocity · key-person risk |
| 09 | **Market Sizing** | `/search` standard | TAM/SAM/SOM · CAGR · tailwinds · headwinds |
| 10 | **Annual Report** | `/fetch` PDF + `/research` | Revenue · audit opinion · key risks · fiscal-year highlights |

The eleventh "engine," the **Executive Summary**, runs *after* the ten finish — it ingests their aggregate output, computes a composite risk score across seven dimensions, and produces a **Buy / Hold / Pass** verdict with thesis, strengths, and risks.

---

## Demo Mode & Easter Eggs

Syntra ships with a fully self-contained presentation layer. Run `SYNTRA_DEMO_MODE=true` and three pre-built Twins seed instantly with zero outbound traffic.

### Featured Twins

| Twin | Verdict | Story |
| :--- | :---: | :--- |
| **Stripe.com** | Buy | Generational platform · $16.5B gross revenue · profitable · strongest dev moat in fintech |
| **Figma.com** | Buy | Post-Adobe-block IPO path · $749M ARR · AI-native design wedge |
| **Acme-batteries.in** | Pass | Udyam registration mismatch · MCA filings contradict claims · flagged fraudulent |

### Eight Scripted Scenarios

Triggered through the client-side `DemoOrchestrator` (or via the hidden landing-page Easter-egg detector):

| # | Scenario | What It Demonstrates |
| :---: | :--- | :--- |
| 1 | `seedDemoTwins()` | All three Twins materialize on the landing page instantly |
| 2 | `udyamRedFlagFire()` | Navigates to the fraudulent Acme Twin · red-flag UI lights up |
| 3 | `sentinelDiffAlert()` | Banner: Stripe pricing page changed · PLG signal weakened |
| 4 | `engineDegradationGraceful()` | ESG engine flips to "rate-limited" · rest of Twin still ships |
| 5 | `verifierContradictsClaim()` | Citation chip flips red · the Verifier caught a hallucination |
| 6 | `twoTwinDebate()` | Side-by-side Stripe-vs-Figma comparison page |
| 7 | `promptInjectionBlocked()` | Toast: quarantined payload detected · sanitizer in action |
| 8 | `resetAll()` | Clears every scripted overlay back to a clean slate |

Each scenario is **deterministic, replayable, and offline-safe** — exactly what a hackathon judging panel or a sales demo demands.

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** (or pnpm / yarn / bun)
- API Keys for:
  - **`LINKUP_API_KEY`** — €5 free credits at [app.linkup.so](https://app.linkup.so)
  - **LLM access** — either `OPENAI_API_KEY` or `VERCEL_AI_GATEWAY_API_KEY`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Keerthivasan-Venkitajalam/syntra.git
   cd syntra
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Copy the template and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   # Required
   LINKUP_API_KEY=lk_live_...
   OPENAI_API_KEY=sk-...                       # or use VERCEL_AI_GATEWAY_API_KEY
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Optional
   VERCEL_AI_GATEWAY_API_KEY=...
   AI_MODEL=gpt-4o-mini
   SYNTRA_DEMO_MODE=false                       # set true for fixture-only mode
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) and submit a domain.

5. **Or run in demo mode (no API keys needed)**

   ```bash
   npm run demo:check     # verify all three fixtures load
   npm run demo:dev       # boot with SYNTRA_DEMO_MODE=true
   ```

---

## Project Structure

```text
syntra/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page — Bloomberg-terminal hero
│   │   ├── layout.tsx                # Root layout + theme
│   │   ├── globals.css               # Curtain reveals, marquee, dark theme
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Workspace — all Twins
│   │   │   └── [id]/page.tsx         # Per-Twin dashboard with live engine status
│   │   ├── compare/page.tsx          # Two-Twin debate view
│   │   ├── share/[id]/page.tsx       # Public, auth-less Twin share page
│   │   ├── reports/page.tsx          # Reports index
│   │   └── api/
│   │       ├── report/create/        # POST — start a new Twin
│   │       ├── report/[id]/          # GET   — fetch a Twin
│   │       └── reports/              # GET   — list all Twins
│   ├── components/
│   │   ├── Shell.tsx                 # Page chrome with persistent nav
│   │   ├── DomainForm.tsx            # Domain submission with validation
│   │   ├── RiskRadar.tsx             # Seven-axis SVG radar chart
│   │   ├── ShareExportButtons.tsx    # Copy link · PDF print · JSON export
│   │   ├── ShareDemoLayer.tsx        # Verifier-contradiction overlay
│   │   ├── DemoBanner.tsx            # Sentinel-diff banner
│   │   ├── EasterEggDetector.tsx     # Hidden keyboard / scroll triggers
│   │   ├── Reveal.tsx                # IntersectionObserver scroll reveal
│   │   ├── CurtainReveal.tsx         # First-load curtain animation
│   │   ├── Marquee.tsx               # Engine-name ticker
│   │   ├── LiveClock.tsx             # Local + UTC display in nav
│   │   └── CopyEmail.tsx             # Click-to-copy contact chip
│   └── lib/
│       ├── types.ts                  # Report · EngineResult · RiskScores
│       ├── validators.ts             # Domain + UUID validation
│       ├── sanitization.ts           # Prompt-injection detection + scoring
│       ├── http.ts                   # fetchWithRetry · exponential backoff
│       ├── rateLimit.ts              # In-memory token bucket
│       ├── linkup.ts                 # /search · /research · /fetch clients
│       ├── aiGateway.ts              # Vercel AI Gateway + structured-output
│       ├── reports.ts                # In-memory Twin store + mutators
│       ├── runReport.ts              # Fan-out orchestrator
│       ├── engines/
│       │   └── index.ts              # 10 engines + executive summary + scoring
│       └── demo/
│           ├── demo_backend.ts       # SYNTRA_DEMO_MODE intercept layer
│           ├── demo_orchestrator.ts  # Client-side scenario engine
│           └── fixtures/             # stripe · figma · acme_batteries JSON
├── .env.example                      # Template — committed
├── API_DOCS.md                       # Full REST + engine reference
├── DEPLOYMENT_CHECKLIST.md           # Pre-demo & Vercel rollout steps
├── README_HACKATHON.md               # Original submission brief
└── package.json
```

---

## REST API

Three endpoints, fully typed. See [`API_DOCS.md`](./API_DOCS.md) for the complete schema.

| Method | Path | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/report/create` | Submit a domain · returns `{ id, domain, status }` |
| `GET` | `/api/report/[id]` | Fetch a Twin · includes live engine status |
| `GET` | `/api/reports` | List all Twins · sorted newest-first |

```bash
# Kick off a Twin
curl -X POST http://localhost:3000/api/report/create \
  -H "Content-Type: application/json" \
  -d '{"domain": "stripe.com"}'

# Poll for completion
curl http://localhost:3000/api/report/<id>
```

---

## Configuration

| Env Var | Default | Description |
| :--- | :--- | :--- |
| `LINKUP_API_KEY` | — | Required for live mode |
| `OPENAI_API_KEY` | — | Required if not using AI Gateway |
| `VERCEL_AI_GATEWAY_API_KEY` | — | Preferred — adds caching + observability |
| `AI_MODEL` | `gpt-4o-mini` | Synthesis model · upgrade to `gpt-4.1` for board-grade |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Public origin for share links |
| `SYNTRA_DEMO_MODE` | `false` | When `true` · routes all Linkup + AI calls to fixtures |

---

## Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **"LINKUP_API_KEY is not set"** | Copy `.env.example` to `.env.local` and add your key — or run `npm run demo:dev` to skip live mode. |
| **Engine stuck on `running`** | Engines time out individually; refresh the dashboard after 5 min — the orchestrator marks them `failed` with the original error. |
| **Share link 404** | Reports live in-memory only; restart the dev server and the Twin is gone. Hook up Postgres for persistence. |
| **PDF chips never appear** | The target domain's search results returned no `.pdf` URLs in the top results. Try a public company with SEC filings (e.g. `microsoft.com`). |
| **Demo mode shows "real" delay** | That's the `simulatedDelay` shim mimicking 200–600ms network latency. Toggle it off in `src/lib/demo/demo_backend.ts`. |

---

## Advanced Use Cases

### 1. Diffing a Twin Across Snapshots

**Scenario:** *"Did Stripe's pricing posture shift this quarter?"*

Because a Twin is JSON, you can snapshot it on a cron, then `diff` last quarter's `engines.commercial.data.plgSignals[]` against this quarter's. The **Sentinel** demo scenario (Easter egg #3) shows exactly this — a banner fires when a PLG signal regresses.

### 2. Two-Twin Debate (Side-by-Side)

**Scenario:** *"Is Stripe or Figma the better platform bet?"*

Navigate to `/compare?a=demo-stripe&b=demo-figma`. The compare view renders both Twins' executive summaries, risk radars, and engine outputs in adjacent columns — useful for portfolio construction and competitive positioning calls.

### 3. Primary-Source PDF Citations

**Scenario:** *"Show me Stripe's audit opinion verbatim."*

The Annual Report engine resolves the most recent 10-K PDF via Linkup `/search`, then pipes it through `/fetch` (which accepts PDFs up to 20 MB). The resulting markdown is parsed for revenue, audit opinion, and key risk factors — and the citation in the dashboard renders with a green **PDF** chip so an analyst can click straight into the source filing.

### 4. Adversarial Red-Flag Triage

**Scenario:** *"Is this company real?"*

For `acme-batteries.in`, the **Red Flags** engine (via Linkup `/research` investigate mode) cross-references Udyam registration data, MCA filings, news mentions, and employee claims. When facts contradict, the Twin's verdict drops to **Pass** and the offending citations render in red — Syntra's **Verifier** in action.

### 5. Headless Pipeline Integration

**Scenario:** *"Run a Twin on every company in our deal-flow queue."*

The `/api/report/create` endpoint is idempotent and stateless. Pipe a CSV of domains, kick off Twins in parallel, poll `/api/report/[id]` for status, and ingest the completed JSON into your CRM or actuarial model. The in-memory store is intentionally swappable — replace `reports.ts` with a Postgres adapter and you have a production data plane.

---

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

Set the four required env vars in the Vercel dashboard:

```
LINKUP_API_KEY              = lk_live_...
VERCEL_AI_GATEWAY_API_KEY   = ...
NEXT_PUBLIC_BASE_URL        = https://your-project.vercel.app
AI_MODEL                    = gpt-4o-mini
```

See [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) for the full pre-flight (build, types, lint, smoke tests, post-deploy verification).

### Self-Hosted

```bash
npm run build
npm start
```

The production server respects `PORT` (default `3000`) and works behind any reverse proxy.

---

## Contributing

This is a hackathon submission, but contributions are welcome — especially around:

- **New engines** — any analyst dimension that can be expressed as a `(domain) => { data, sources }` function fits the contract
- **Verifier improvements** — the prompt-injection sanitizer and citation-contradiction detector both have room for ML upgrades
- **Persistence adapters** — Postgres, Redis, S3-snapshot exports
- **Diff & alert tooling** — Sentinel is currently a demo banner; a real cron + webhook would be production-grade

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/your-engine`)
3. **Commit** with conventional-commit style (`git commit -m "feat(engines): add patent-portfolio engine"`)
4. **Push** to your fork (`git push origin feat/your-engine`)
5. **Open** a Pull Request

---

<div align="center">

## Author

**Keerthivasan S V** — [@Keerthivasan-Venkitajalam](https://github.com/Keerthivasan-Venkitajalam)

**Syntra** is an experimental due-diligence platform built for the **Linkup Async Hackathon — May 2026**.

[Report Bug](https://github.com/Keerthivasan-Venkitajalam/syntra/issues) • [Request Feature](https://github.com/Keerthivasan-Venkitajalam/syntra/issues)

Built with [Linkup](https://linkup.so), [Next.js](https://nextjs.org), and the [Vercel AI Gateway](https://vercel.com/ai).

</div>
