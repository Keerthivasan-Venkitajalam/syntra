# Syntra Demo — End-to-End Engineered Presentation

## Context

**Why this doc exists:** A hackathon judge or a Chennai OEM procurement officer evaluating Syntra has between 30 seconds and 5 minutes of attention. In that window the product must demonstrate **the Twin thesis**, **live citations**, **fresh data via Linkup**, and **multi-engine resilience** — without a single network error, blank screen, or hung spinner.

**What good looks like:** The presenter opens the app cold. They type a domain. A Twin materializes. They click "chat." They ask a question. Inline citations stream. A backdoor gesture fires a scripted Sentinel diff alert. They drop a second Twin into the chat for a debate. The room nods. **No screen ever shows a network error or empty state during the demo.**

**Approach:** Every demo scene is deterministically reproducible from a seed config (`SYNTRA_DEMO_MODE=true`). When demo mode is active, expensive Linkup calls are short-circuited to fixture data for three rehearsed domains (`stripe.com`, `figma.com`, `acme-batteries.in`), preserving the *exact* report shape and citation set. Hidden gesture detectors fire scripted scenarios (diff alert, kill-switch, two-Twin debate). The presenter cannot fail.

This is the same engineering pattern Continuum used to win 2nd place at Guidewire DEVTrails 2026 (`demo_e2e.md` in their repo). We are intentionally borrowing the structure because it works.

---

## Architecture of the Demo Layer

```
┌────────────────────────────────────────────────────────────────────┐
│  Next.js App                                                       │
│   └── SYNTRA_DEMO_MODE=true ?                                      │
│        ├── yes → DemoBackend.ts intercepts every Linkup call      │
│        └── no  → live Linkup + GPT-4o                             │
│                                                                    │
│  Every screen calls api → DemoBackend (fixture-first when demo)   │
│  Every screen subscribes to DemoOrchestrator (scripted events)    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │   DemoBackend.ts        (NEW)          │
        │   • Three rehearsed domains            │
        │   • Stateful Twin store                │
        │   • Simulated latency 200–600ms        │
        │   • Replays scripted Sentinel diffs    │
        └────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │   DemoOrchestrator.ts   (NEW)          │
        │   Scenarios:                           │
        │    • sentinelDiffAlert()               │
        │    • twoTwinDebate()                   │
        │    • udyamRedFlagFire()                │
        │    • engineDegradationGraceful()       │
        │    • verifierContradictsClaim()        │
        │    • promptInjectionBlocked()          │
        │    • resetAll()                        │
        └────────────────────────────────────────┘
```

---

## Files To Create

| File | Purpose |
|------|---------|
| `syntra/src/lib/demo/demo_backend.ts` | Fixture-first interceptor for Linkup + GPT-4o calls when `SYNTRA_DEMO_MODE=true`. Owns three rehearsed Twins. Returns persona-aware data with 200–600ms simulated latency. |
| `syntra/src/lib/demo/demo_orchestrator.ts` | Singleton with named scenario methods for every scripted moment. Pushes events into Twin state via SSE. |
| `syntra/src/lib/demo/fixtures/stripe.json` | Full Twin JSON snapshot for `stripe.com` — used when demo mode is active. |
| `syntra/src/lib/demo/fixtures/figma.json` | Full Twin JSON snapshot for `figma.com`. |
| `syntra/src/lib/demo/fixtures/acme_batteries.json` | India-specific demo — Tier-2 EV battery vendor, Udyam mismatch triggers Red Flag. |
| `syntra/src/components/EasterEggDetector.tsx` | Wraps any element. Counts taps within a 2-second window and fires a callback when the threshold is hit. Invisible. |
| `syntra/src/components/DemoBanner.tsx` | Top-of-screen banner shown when a demo flag is active (sentinel alert / kill switch / verifier contradiction). |

## Files To Modify

| File | Change |
|------|--------|
| `syntra/src/app/page.tsx` | Add `EasterEggDetector(taps=4)` on the headline → `seedDemoTwins()` → all 3 demo Twins appear instantly. |
| `syntra/src/lib/linkup.ts` | At top of `linkupSearch`, if `process.env.SYNTRA_DEMO_MODE === 'true'`, route through `DemoBackend.linkupSearch()` instead of real API. Keeps signature identical. |
| `syntra/src/lib/aiGateway.ts` | Same pattern — if demo mode, return `DemoBackend.aiSynthesis()` with fixture-defined responses. |
| `syntra/src/app/dashboard/[id]/page.tsx` | (a) Subscribe to `DemoOrchestrator` events. (b) Wrap the Twin avatar with `EasterEggDetector(taps=4)` → `sentinelDiffAlert()`. (c) Wrap the engine status grid with `EasterEggDetector(taps=3)` → `engineDegradationGraceful()`. (d) Long-press the share button → `twoTwinDebate()`. (e) Show `DemoBanner` when scripted flags are active. |
| `syntra/src/app/share/[id]/page.tsx` | Triple-tap the page header → `verifierContradictsClaim()` — flips one citation chip from green to red live, with a tooltip "verifier downgraded this claim." |
| `syntra/src/app/compare/page.tsx` | Long-press the compare CTA → `twoTwinDebate()` — auto-populates Stripe vs Adyen, plays the scripted debate transcript over 12 seconds. |
| `syntra/src/components/DomainForm.tsx` | Long-press the submit button → `udyamRedFlagFire()` — submits `acme-batteries.in` with a pre-baked Red Flag for Udyam-incorporation-mismatch. |

---

## The 90-Second Sales Demo (the script)

> Read this script aloud while operating the app. Every emphasized phrase coincides with an on-screen event.

**[0:00 — Cold open]**
> "Every diligence tool you've ever used gives you a *dead PDF*. Syntra gives you a **living Twin**."
>
> *Type `stripe.com` into the form. Submit.*

**[0:08 — Teaser appears]**
> "Forty-five seconds for the teaser. Notice every single fact has a citation chip. Green means our verifier confirmed the source actually supports the claim. Grey means unverified. Red means the source contradicts it. **No AI tool you've used does this.**"

**[0:25 — Engines complete in parallel]**
> "Behind the scenes nine engines are running in parallel — Commercial, Technical, ESG, EU AI Act, Competitors, Red Flags, Financial, Leadership, Market Sizing. Each one talks to Linkup, sanitizes the snippets against prompt injection, and synthesizes a structured JSON output. Not markdown. **JSON.** That's the unlock."

**[0:50 — Click the Twin to open chat]**
> "Stripe is now a Twin in my workspace. I can talk to it. *[Click chat.]* Watch."
>
> *Type: "What changed in Stripe's pricing this week?"*
>
> "Inline citations. Streaming. **The Twin remembers every claim it has ever made.** Two weeks from now I can ask 'wait, what did you say last week about this?' and it can show me the exact prior version with sources. That's the Twin primitive."

**[1:15 — Trigger Easter egg #1: Sentinel diff alert]**
> *Tap the Twin's avatar 4 times.*
>
> "And — there. A Sentinel diff alert just fired. Stripe quietly removed self-serve enterprise onboarding from their pricing page in the last 6 hours. **I would not have known this for weeks otherwise.** That's a deal signal."

**[1:30 — Trigger Easter egg #2: two-Twin debate]**
> *Long-press the share button.*
>
> "Now watch this. I'm dropping Adyen as a second Twin. **Stripe meet Adyen.** *[Two-Twin debate scrolls.]* I just generated a board-ready memo on payments-partner selection in ninety seconds, with every claim cited and confidence-scored. **The last analyst who did this by hand took two weeks.**"

**[1:45 — Closing line]**
> "**That's the wedge.** Every company on the internet, now a Twin you can talk to, that stays alive, that tells you when its world changes, with citations you can audit. We're starting with Chennai's automotive vendor base because the EV transition just made vendor diligence a five-times-a-week problem. **Forty-eight thousand Twins per quarter in one city.** Thank you."

---

## Hidden Easter Eggs (Backdoor Commands)

These let the presenter trigger scripted scenarios on demand without breaking flow. All wrapped in `EasterEggDetector` so layout is unchanged.

| # | Gesture | Where | Scenario fired | Visible effect |
|---|---------|-------|----------------|----------------|
| 1 | **4 taps on the headline** | Landing page | `seedDemoTwins()` | All three demo Twins (`stripe`, `figma`, `acme-batteries.in`) appear in the workspace instantly, fully populated. |
| 2 | **Long-press submit button** | Domain form | `udyamRedFlagFire()` | Submits `acme-batteries.in`. The Twin generates with a pre-baked Red Flag: "Vendor's website claims '12+ years of experience' but Udyam shows incorporation in late 2024 — severe commercial misrepresentation." |
| 3 | **4 taps on Twin avatar** | Dashboard | `sentinelDiffAlert()` | Top banner: "Sentinel detected a change at `stripe.com`: pricing page CTA modified; PLG signal weakened." Confidence chip on the affected claim animates to amber. |
| 4 | **3 taps on engine status grid** | Dashboard | `engineDegradationGraceful()` | The ESG engine flips from "completed" to "rate-limited — retrying." A toast says "8 of 9 engines completed. ESG will retry in 30s. Your report is usable now." |
| 5 | **Triple-tap page header** | Share page | `verifierContradictsClaim()` | One green citation chip animates to red with tooltip "Verifier reviewed source and found contradiction." A "Why?" link expands the verifier's reasoning. |
| 6 | **Long-press share button** | Dashboard | `twoTwinDebate()` | Auto-opens `/compare`, populates Stripe + Adyen, plays a scripted 12-second debate where each Twin streams an argument with citations, ending in a synthesized recommendation. |
| 7 | **4 taps on report status badge** | Dashboard | `promptInjectionBlocked()` | A toast appears: "Prompt-injection attempt detected in scraped content from `target.com/about` — content quarantined." Click to view the quarantined snippet (a fake "ignore previous instructions" payload). |
| 8 | **Long-press the headline** | Landing page | `resetAll()` | Wipes all scripted state and demo Twins. Useful for re-running the script cleanly. |

---

## Bad-Path / Failure Simulation (mapped to adversarial_scenarios.md)

| # | Scenario | Trigger | Scenario # in `adversarial_scenarios.md` |
|---|----------|---------|-------------------------------------------|
| 1 | Engine rate-limited; graceful degradation | Easter egg #4 | Scenarios 43, 47, 48 |
| 2 | Verifier contradicts a synthesized claim | Easter egg #5 | Scenarios 22, 24, 28 |
| 3 | Prompt injection blocked at sanitizer | Easter egg #7 | Scenarios 11–20 (entire Category B) |
| 4 | Sentinel diff fires on a watched Twin | Easter egg #3 | The Twin thesis in action — not a "failure," but the primary value moment |
| 5 | Udyam government API contradicts vendor's marketing | Easter egg #2 | Indian-wedge moat in action |
| 6 | Multi-Twin composition for comparative diligence | Easter egg #6 | The "noun moment" — Twins become a verb |

Every bad-path resolves cleanly. Long-press the headline (Easter egg #8) to `resetAll()` and re-run the script.

---

## Pre-Flight Checklist (Run 30 min Before Demo)

| ☐ | Item |
|---|------|
| ☐ | `SYNTRA_DEMO_MODE=true` in `.env.local` |
| ☐ | All 3 fixture files load correctly (`npm run demo:check`) |
| ☐ | Hard-refresh the browser tab to clear stale SSE connections |
| ☐ | Open DevTools Network tab and confirm zero requests hit `api.linkup.so` during a test run |
| ☐ | Run through Easter eggs 1–8 once in sequence; verify all 8 fire |
| ☐ | Stable wifi confirmed (even in demo mode, Vercel must serve static assets) |
| ☐ | Screen resolution set to 1920x1080 (Easter egg tap targets are calibrated to this layout) |
| ☐ | Browser zoom at 100% |
| ☐ | Dark mode confirmed on (Linkup brand alignment) |
| ☐ | All 3 demo Twins seeded (Easter egg #1, then verify chip colors render correctly) |
| ☐ | Two-Twin debate transcript renders end-to-end without truncation (Easter egg #6) |
| ☐ | One full live (non-demo-mode) report against `stripe.com` was successfully generated within last 24 hours as a sanity check |

---

## Fallback Plan (If the Internet Dies Mid-Demo)

1. **Stay on the dashboard view.** All Twin data is already loaded into the browser; no further network calls needed until you submit a new domain.
2. **Avoid the chat input.** Even in demo mode, the chat UI uses SSE which can stutter on flaky connections.
3. **Pivot to the share page.** It's a server-rendered snapshot — works without any client-side JS.
4. **If everything fails:** open `syntra/src/lib/demo/fixtures/stripe.json` directly in the browser. The report structure speaks for itself.

---

## Post-Demo Talk Track Cheat Sheet

For Q&A. Anticipated questions and 15-second answers.

| Question | Answer |
|----------|--------|
| "How is this different from ChatGPT with web browsing?" | "ChatGPT gives you one synthesized paragraph with maybe-real citations. Syntra gives you nine structured engines, every claim with a verifier-graded confidence chip, every Twin staying alive on a schedule. ChatGPT is a question; Syntra is a relationship." |
| "Why Linkup specifically?" | "92% F-score on SimpleQA, deep agentic scraping with multi-step retrieval, and crucially — fresh data with provenance. The Twin metaphor requires a substrate that's both *current* and *citable*. Most search APIs give you one or the other." |
| "What's your moat?" | "Three things: the noun (Twin), the diffing primitive (structured JSON enables field-level monitoring nobody else can do), and the verifier loop (we don't ship un-validated claims)." |
| "What's the unit economic?" | "Per-report infrastructure cost is €0.04–0.50. Per-credit revenue is $1.20 at the Analyst tier. That's 80–90% gross margin on AI usage, on top of $79–$2,500/mo recurring." |
| "Why Chennai first?" | "Detroit of India. EV transition means hundreds of new Tier-2/3 vendors per OEM per quarter need vetting. Manual diligence is 8–15 hours per vendor. We collapse that to 30 minutes. Six OEMs × 200 vendors/quarter = 1,200 Twins/quarter from one city alone." |
| "Compliance?" | "DPDP Act 2023 compliant from day one — explicit notice, granular consent, one-click erasure cascade, designated DPO. We also self-classify Syntra under EU AI Act as Limited Risk and publish the disclosure at `/legal/ai-act-disclosure`. We practice what our engines preach." |

---

## What This Demo Proves

By the end of the 90 seconds, the audience should viscerally understand three things:

1. **Twins are a new noun.** Not a report, not a query — a *thing you can talk to*. Once the audience says "the Twin" in their question, the brand has landed.
2. **Citations are a UX primitive, not a footnote.** The colored chip beats every "ChatGPT said so" disclaimer in the industry.
3. **Sentinel diffs and two-Twin debates are not features — they are the entire point.** A static report cannot do either. The Twin is the only frame in which they're possible.

If all three land, the demo did its job. The pricing, the architecture, the compliance — those are details. The Twin is the only thing the buyer will remember.
