# Deployment & Submission Checklist — Syntra

---

## Pre-Demo (30 min before)

### Demo Layer
- [ ] `SYNTRA_DEMO_MODE=true` in `.env.local`
- [ ] `npm run demo:check` — all 3 fixtures green
- [ ] Hard-refresh browser tab (clears stale SSE)
- [ ] Open DevTools Network tab → confirm 0 requests to `api.linkup.so` during test run
- [ ] Run Easter eggs 1–8 in sequence (see `demo_e2e.md`)
- [ ] Browser zoom: 100%. Dark mode: on.

### Environment
- [ ] Stable wifi confirmed
- [ ] Screen resolution 1920×1080

---

## Pre-Deployment (code)

### Build & Types
- [ ] `npm run build` — passes with 0 errors
- [ ] `npx tsc --noEmit` — 0 type errors
- [ ] `npm run lint` — 0 warnings

### Environment Variables
- [ ] `.env.local` created from `.env.example`
- [ ] `LINKUP_API_KEY` — tested (real search returns results)
- [ ] `OPENAI_API_KEY` or `VERCEL_AI_GATEWAY_API_KEY` — tested
- [ ] `NEXT_PUBLIC_BASE_URL` — set to production URL for share links

### Manual Smoke Test (live mode)
- [ ] Submit `stripe.com` — teaser appears in < 60s
- [ ] All 9 engines complete within 5 min
- [ ] Risk radar renders correctly
- [ ] Executive summary (Buy/Hold/Pass) appears
- [ ] Share link opens without auth
- [ ] PDF print dialog opens and renders
- [ ] JSON export downloads correctly
- [ ] Compare page loads for two report IDs

---

## Vercel Deployment

```bash
# Install Vercel CLI (once)
npm i -g vercel

# Deploy
cd syntra
vercel deploy
```

### Environment Variables in Vercel Dashboard
```
LINKUP_API_KEY              = your-key
OPENAI_API_KEY              = your-key  (or use VERCEL_AI_GATEWAY_API_KEY)
VERCEL_AI_GATEWAY_API_KEY   = your-key
AI_MODEL                    = gpt-4o-mini
NEXT_PUBLIC_BASE_URL        = https://your-project.vercel.app
```

### Post-Deploy Verification
- [ ] Production URL loads
- [ ] Create a live report (`stripe.com`)
- [ ] All 9 engines complete
- [ ] Share link accessible from different browser/device
- [ ] No errors in Vercel logs

---

## Submission Package

### Sample Reports (seed before submission)
- [ ] `stripe.com` — Buy verdict, score 80+
- [ ] `figma.com` — Buy verdict, score 75+
- [ ] One `.in` domain — triggers Udyam Verifier engine

### Deliverables
- [ ] Production URL (deployed and working)
- [ ] GitHub link (source code public)
- [ ] 3 sample report JSON exports
- [ ] Demo video link (`demo_e2e.md` script — 90 seconds)
- [ ] README.md links to all docs

---

## Day-of Submission

### 24 Hours Before
- [ ] Production deployment still working
- [ ] API keys have sufficient credit
- [ ] Created fresh demo reports
- [ ] Demo video recorded

### 1 Hour Before
- [ ] One final `stripe.com` report — all 9 engines pass
- [ ] Share link works from incognito browser
- [ ] Vercel logs: 0 errors

### Submission
- [ ] Production URL
- [ ] GitHub link
- [ ] Demo video
- [ ] Submission description text (see below)

---

## Submission Description Texts

### One-liner (50 words)
> Syntra turns a single company domain into a living **Twin** — a persistent, queryable entity that runs 9 Linkup-powered analysis engines in parallel, diffs its own world weekly, and alerts you when something changes. Not a report. A noun.

### How Linkup is used (100 words)
> Every engine is a Linkup retrieval. Teaser: 3 parallel `standard` searches. Full report: 9 parallel `deep` searches — Commercial (pricing pages), Technical (job posts + engineering blogs), ESG (sustainability reports), EU AI Act (governance policies), Competitors (market landscape), Red Flags (lawsuits + breaches), Financial (Crunchbase + press), Leadership (LinkedIn + Glassdoor), Market Sizing (analyst reports). India engine cross-references Udyam government API against web claims. Every Linkup result is sanitised through a prompt-injection detector before LLM synthesis. Every synthesised claim is linked to a source URL.

### Unique value (50 words)
> Structured JSON per engine (not markdown) enables field-level diffs — "self-serve trial CTA disappeared from pricing page." Every claim has a verifier-graded confidence chip. Udyam integration catches vendor fraud the open web never would. And the whole thing runs in < 5 minutes per company.

---

## Emergency Troubleshooting

### Build fails
```bash
rm -rf .next node_modules && npm install && npm run build
```

### Engines timing out on Vercel
- Vercel Hobby has 10s function timeout. Upgrade to Pro (60s) or use Inngest for background jobs.
- Short-term fix: reduce `maxResults` in engine queries.

### Share links 404
- Check `NEXT_PUBLIC_BASE_URL` is set to production URL (no trailing slash).
- The in-memory store resets on cold-starts — links to old reports break. Create fresh reports.

### Demo fixtures not loading
```bash
npm run demo:check
# If fails: verify JSON files in src/lib/demo/fixtures/ are valid
node -e "require('./src/lib/demo/fixtures/stripe.json')"
```
