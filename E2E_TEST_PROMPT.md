# Syntra — End-to-End Test Prompt

**App:** http://localhost:3000  
**Mode:** Live (SYNTRA_DEMO_MODE not set)  
**Date written:** 2026-05-27

---

## How to use this document

Work through each section top-to-bottom. For each test step:
- ✅ mark it passing
- ❌ mark it failing with a one-line note
- ⚠️ mark it partially working / needs polish

Identified issues from code review are pre-filled at the end in **§ Issues Log**.

---

## § 1 — Pre-flight

| # | Check | Expected |
|---|-------|----------|
| 1.1 | `curl -s http://localhost:3000 \| grep -i syntra` | Returns HTML with "Syntra" |
| 1.2 | `curl -s http://localhost:3000/api/reports` | Returns JSON array (at least 3 demo fixtures) |
| 1.3 | `curl -s http://localhost:3000/api/report/demo-stripe` | Returns completed report JSON |
| 1.4 | `curl -s http://localhost:3000/api/report/demo-figma` | Returns completed report JSON |
| 1.5 | `curl -s http://localhost:3000/api/report/demo-acme-batteries` | Returns completed report JSON |
| 1.6 | Open browser DevTools → Console — no red errors on page load | Zero console errors |
| 1.7 | Check browser tab — favicon shows orange/silver S mark | Logo visible, not blurry |

---

## § 2 — Landing Page (`/`)

### 2.1 Visual / layout

| # | Check | Expected |
|---|-------|----------|
| 2.1.1 | Nav logo (top-left) | Syntra S mark visible, not pixelated |
| 2.1.2 | Nav brand text reads "syntra" | ✓ |
| 2.1.3 | Nav status badge | Currently reads "Live · Demo Mode" — **should reflect actual mode** |
| 2.1.4 | Nav links (Index / Engines / Twins / Why / Stack / Contact) | All 6 present and anchor-scroll on click |
| 2.1.5 | "Try a Twin ↗" pill button | Links to `/dashboard/demo-stripe` |
| 2.1.6 | LiveClock in nav | Shows ticking time |
| 2.1.7 | CurtainReveal animation on first load | Curtain wipes up revealing page |
| 2.1.8 | Marquee ticker at bottom of hero | Scrolls company names continuously |
| 2.1.9 | Hero `h1` text renders with squiggle underline on "deeply" | Animated wavy underline |
| 2.1.10 | Stats row: 10 / < 5 min / 100% / 20 MB | All four visible |
| 2.1.11 | Engines section — all 10 cards visible | Card count = 10 |
| 2.1.12 | "Selected Twins" section — 3 cards | Stripe (Buy), Figma (Buy), Acme (Pass) |
| 2.1.13 | Footer shows version "v1.0 · 2026.05.22" | ✓ |

### 2.2 Domain Form (hero card, right column)

| # | Check | Expected |
|---|-------|----------|
| 2.2.1 | Input placeholder text = "example.com" | ✓ |
| 2.2.2 | Submit empty form | Error: "Enter a company domain." |
| 2.2.3 | Submit invalid domain (e.g. `not a domain`) | Error from validator |
| 2.2.4 | Submit `stripe.com` | Navigates to `/dashboard/demo-stripe` immediately (demo fixture short-circuit) |
| 2.2.5 | Submit `figma.com` | Navigates to `/dashboard/demo-figma` immediately |
| 2.2.6 | Submit `acme-batteries.in` | Navigates to `/dashboard/demo-acme-batteries` immediately |
| 2.2.7 | Submit a live domain (e.g. `notion.so`) | Navigates to `/dashboard/<new-id>` and shows "Running" status with progress bar |
| 2.2.8 | While running, progress bar increments | Each engine that completes advances the bar |
| 2.2.9 | Button shows "Running..." while in-flight | ✓ |
| 2.2.10 | **Input styling**: input field should match surrounding card aesthetics | ⚠️ Input uses dark Tailwind classes (`bg-black/30 border-white/10`) inside a CSS-var-based card — may look mismatched |

---

## § 3 — Dashboard Page (`/dashboard/[id]`)

### 3.1 Demo fixture: `stripe.com` — `/dashboard/demo-stripe`

| # | Check | Expected |
|---|-------|----------|
| 3.1.1 | Page title h1 = "stripe.com" in italic serif | ✓ |
| 3.1.2 | Status pill = "Completed" (green) | ✓ |
| 3.1.3 | Date shows report creation date | ✓ |
| 3.1.4 | Source count displayed | Number > 0 |
| 3.1.5 | Overall score badge (top-right) | Number 0–100 in circle |
| 3.1.6 | Verdict pill = "BUY" (green) | ✓ |
| 3.1.7 | Investment memo section present | Has thesis text, Strengths, Risks, Recommendation |
| 3.1.8 | `keyStrengths` list renders without crash | Verify no "Cannot read properties of undefined" error |
| 3.1.9 | `keyRisks` list renders without crash | Same |
| 3.1.10 | Annual Report card present | Shows PDF icon, document title, fiscal year |
| 3.1.11 | Annual Report: "View PDF →" link | Opens PDF URL in new tab |
| 3.1.12 | Quick brief (teaser) section present | Has summary, GTM model, tech signals |
| 3.1.13 | Engine results grid — 10 cards | All 10 engines shown, status = "Completed" |
| 3.1.14 | Engine cards: no `font-weight` CSS console warning | Open DevTools → Console → no style property errors |
| 3.1.15 | Severity strings colored correctly (e.g. "Critical" = red, "Strong" = green) | Check Financial Intelligence card |
| 3.1.16 | Source links in engine cards are clickable | Opens new tab |
| 3.1.17 | PDF badge (green) shown on engines that fetched PDFs | Present on ESG, Financial, Annual Report engines |
| 3.1.18 | `/research` badge (indigo) on red flags engine | Present |
| 3.1.19 | Risk radar (right sidebar) — hexagonal chart | Renders with 7 dimensions |
| 3.1.20 | Sidebar is sticky — stays in view while scrolling left column | ✓ |
| 3.1.21 | Nav logo (S mark + "syntra") in sticky header | ✓ |
| 3.1.22 | "All reports" link in nav header | Goes to `/reports` |
| 3.1.23 | "← syntra" breadcrumb (top-left) | Goes to `/` |
| 3.1.24 | Share / PDF / JSON buttons visible (top-right) | All 3 present |
| 3.1.25 | Click "Share" | Copies `/share/demo-stripe` URL, button flips to "Copied!" for 2s |
| 3.1.26 | Click "JSON" | Downloads `stripe.com-syntra-report.json` file |
| 3.1.27 | Click "PDF" | Opens print dialog with report content |
| 3.1.28 | PDF print view branding | **⚠️ Shows old "AX" badge** — should show Syntra logo |
| 3.1.29 | Report footer (bottom) shows Report ID + timestamp | ✓ |

### 3.2 Demo fixture: `acme-batteries.in` — `/dashboard/demo-acme-batteries`

| # | Check | Expected |
|---|-------|----------|
| 3.2.1 | Verdict pill = "PASS" (red) | ✓ |
| 3.2.2 | Red Flags engine has "Critical" or "High" severity items | Colored red |
| 3.2.3 | Overall score badge shows low score (≤ 40) | ✓ |

### 3.3 Invalid/missing report — `/dashboard/nonexistent-id`

| # | Check | Expected |
|---|-------|----------|
| 3.3.1 | Shows 404 state: "Report not found" | ✓ |
| 3.3.2 | "← Back to home" link | Goes to `/` |

### 3.4 Live report (submit a real domain)

| # | Check | Expected |
|---|-------|----------|
| 3.4.1 | Progress bar shows during `running` status | Appears, increments |
| 3.4.2 | Engines show "LoadingPulse" dots while waiting | Dots bounce |
| 3.4.3 | **Bounce animation in AnnualReport loading state** | ⚠️ `LoadingPulseInner` may not animate — `@keyframes bounce` not defined in that component |
| 3.4.4 | Polling every 2.5s until complete | Network tab shows repeated GET `/api/report/<id>` |
| 3.4.5 | After completion: progress bar disappears, all engines populated | ✓ |

---

## § 4 — Compare Page (`/compare`)

### 4.1 With URL params (`/compare?a=demo-stripe&b=demo-figma`)

| # | Check | Expected |
|---|-------|----------|
| 4.1.1 | Input row is hidden (params present) | No input fields shown |
| 4.1.2 | Table header shows "stripe.com" and "figma.com" | ✓ |
| 4.1.3 | 8 dimension rows (Overall, Commercial, Technical, Financial, Leadership, Competitive, ESG, Regulatory) | All present |
| 4.1.4 | Higher score is bold green, lower score is red | Color logic correct |
| 4.1.5 | Equal scores are `var(--ink-2)` (no color) | ✓ |
| 4.1.6 | Verdict row shows "Buy" chips for both | Both green |
| 4.1.7 | "View full stripe.com Twin →" and "View full figma.com Twin →" links | Navigate to respective dashboards |
| 4.1.8 | Nav logo present | ✓ |

### 4.2 Fresh compare (no URL params — `/compare`)

| # | Check | Expected |
|---|-------|----------|
| 4.2.1 | Two input cards shown (Company A, Company B) | ✓ |
| 4.2.2 | Empty "Analyse" click | Silently returns (no validation feedback) — ⚠️ **no error message shown** |
| 4.2.3 | Type `stripe.com` → click Analyse | Shows "Running…" → then "stripe.com — completed · <score>" |
| 4.2.4 | Type `figma.com` in B → click Analyse | Same |
| 4.2.5 | Once both loaded, comparison table appears | ✓ |
| 4.2.6 | Rate limit hit (rapid submits) | **⚠️ No 429 error surfaced in UI** — silently stops |

---

## § 5 — Reports Index (`/reports`)

| # | Check | Expected |
|---|-------|----------|
| 5.1 | Page loads | Shows list of reports |
| 5.2 | **Header branding** | **❌ Shows old "AX" indigo badge** instead of Syntra S logo |
| 5.3 | **Page background** | **❌ Uses `bg-[#0b0f1a]` dark-blue** — doesn't match the rest of the app's design system |
| 5.4 | **Subtitle** reads "AI-Powered Due Diligence" | **❌ Old copy** — should match new Syntra branding |
| 5.5 | Demo fixture reports listed (stripe, figma, acme) | All 3 present |
| 5.6 | Score column: colour-coded by score | Emerald ≥ 75, amber ≥ 50, red below |
| 5.7 | Verdict badge shown | Buy/Pass/Hold |
| 5.8 | Clicking a row navigates to `/dashboard/<id>` | ✓ |
| 5.9 | "No reports yet" empty state if list is empty | Shows with link to create |
| 5.10 | "+ New Report" button | Goes to `/` |
| 5.11 | After generating a live report, it appears in the list | ✓ (same server process) |

---

## § 6 — Share Page (`/share/[id]`)

### 6.1 Valid share link — `/share/demo-stripe`

| # | Check | Expected |
|---|-------|----------|
| 6.1.1 | Page renders | Shows stripe.com report |
| 6.1.2 | **Header branding** | **❌ Shows old "AX" indigo badge** — should be Syntra S logo |
| 6.1.3 | **Page background** | **❌ Uses `bg-[#0b0f1a]` dark-blue** — mismatches app design |
| 6.1.4 | Investment memo section shown | Has verdict chip, thesis, recommendation |
| 6.1.5 | Teaser section shown | Summary, GTM, tech signals |
| 6.1.6 | Engine result cards (2-column grid) | All completed engines shown |
| 6.1.7 | **`annualReport` engine missing** | **❌ Not in `sectionLabels` array** — annual report section never renders on share page |
| 6.1.8 | "Create your report for free →" CTA at bottom | Goes to `/` |
| 6.1.9 | "Public Report" badge in top-right | ✓ |

### 6.2 Invalid share link — `/share/nonexistent`

| # | Check | Expected |
|---|-------|----------|
| 6.2.1 | Shows "Report not found / has expired" state | ✓ |
| 6.2.2 | "Create your own report →" link | Goes to `/` |

### 6.3 Share link for a live report

| # | Check | Expected |
|---|-------|----------|
| 6.3.1 | Generate a live report → click "Share" → open that URL | Works in same browser session (in-memory store) |
| 6.3.2 | Open shared URL in incognito / different browser | **⚠️ Will return 404** — share page is server-rendered against in-memory store; cross-device sharing is broken by design |

---

## § 7 — API Endpoints

| # | Endpoint | Method | Expected |
|---|----------|--------|----------|
| 7.1 | `/api/reports` | GET | 200, JSON array |
| 7.2 | `/api/report/demo-stripe` | GET | 200, completed report |
| 7.3 | `/api/report/nonexistent` | GET | 404 `{"error":"Report not found."}` |
| 7.4 | `/api/report/create` | POST `{}` | 400 `{"error":"Domain is required."}` |
| 7.5 | `/api/report/create` | POST `{"domain":"!!!"}` | 400 validation error |
| 7.6 | `/api/report/create` | POST `{"domain":"stripe.com"}` | 200, returns demo-stripe fixture ID |
| 7.7 | `/api/report/create` | POST `{"domain":"notion.so"}` | 200, new report ID, status "pending" |
| 7.8 | Rapid-fire 10 POSTs from same IP | 429 `{"error":"Too many requests..."}` with `Retry-After` header |

---

## § 8 — Easter Eggs

| # | Trigger | Expected |
|---|---------|----------|
| 8.1 | Landing page: tap hero h1 (`"Know any company"`) **4 times** | Seeds demo twins + navigates to `/dashboard/demo-stripe` |
| 8.2 | Landing page: tap engines section **3 times** | Engine degradation banner (blue, auto-dismisses 8s) |
| 8.3 | Landing page: long-press "Run Diligence" button | Udyam red flag banner (red, 5s) → redirects to Acme dashboard |
| 8.4 | Dashboard: tap domain h1 (`stripe.com`) **4 times** | Sentinel diff alert banner (amber, stays) |
| 8.5 | Dashboard: tap status pill **4 times** | Prompt injection blocked banner (purple, 10s) |
| 8.6 | Dashboard: long-press Share/PDF/JSON area | Two-twin debate scenario |
| 8.7 | Dashboard: tap engine results grid **3 times** | Engine degradation, one engine shows "retrying" |
| 8.8 | Compare page: long-press "Compare" text in nav | Two-twin debate scenario |
| 8.9 | Share page: triple-tap header | Verifier contradicts claim banner (red, 10s) |
| 8.10 | Footer: long-press "Linkup Async Hackathon · May 2026" | Reset all banners |
| 8.11 | All banners have ✕ dismiss button | Click closes banner |

---

## § 9 — Responsiveness & Cross-browser

| # | Check | Expected |
|---|-------|----------|
| 9.1 | Landing page at 375px width (mobile) | Hero grid stacks vertically |
| 9.2 | Dashboard at 375px | Right sidebar moves below main column (or stacks) |
| 9.3 | Compare page at 375px | Table doesn't overflow horizontally |
| 9.4 | Safari (latest) | No rendering regressions |
| 9.5 | Firefox (latest) | No rendering regressions |
| 9.6 | `color-mix(in srgb, ...)` CSS | Works in Chrome 111+, Safari 16.2+; degrades in Firefox < 113 |

---

## § 10 — Issues Log (Pre-identified from Code Review)

### 🔴 High Priority

| ID | File | Issue | Fix |
|----|------|-------|-----|
| I-01 | `src/app/reports/page.tsx` | Header uses old **"AX" indigo badge** and `bg-[#0b0f1a]` dark-blue background. Entire page uses old Tailwind-only design system, doesn't match the new Syntra aesthetic. | Rewrite header to use `logo-nav.png` + "syntra" text, match the design system from dashboard/compare pages (`var(--paper)`, `var(--rule)`, `var(--t-mono)` etc.) |
| I-02 | `src/app/share/[id]/page.tsx` | Same old **"AX" badge** in header and `bg-[#0b0f1a]` design. | Same fix as I-01 |
| I-03 | `src/app/share/[id]/page.tsx` | **`annualReport` engine omitted** from `sectionLabels` array — annual report never shown on the share page. | Add `{ label: "Annual Report", key: "annualReport", icon: "📄" }` to the `sectionLabels` array |
| I-04 | `src/components/ShareExportButtons.tsx` (line 134) | PDF export print view shows **old "AX" branding** (`<div style="...background:#4f46e5...">AX</div>`). | Replace with Syntra text/logo in the HTML template string |

### 🟡 Medium Priority

| ID | File | Issue | Fix |
|----|------|-------|-----|
| I-05 | `src/app/page.tsx` (line 125) | Nav status badge hardcodes **"Live · Demo Mode"** regardless of actual `SYNTRA_DEMO_MODE` value. In production (non-demo) this is misleading. | Read env var client-side or pass as a prop; show "Live" when demo mode is off |
| I-06 | `src/components/DomainForm.tsx` | Input uses Tailwind **dark-only colours** (`border-white/10 bg-black/30`) inside the hero card which uses CSS-var-based styling. Looks mismatched if the card background is light. | Replace with CSS-var border/bg: `style={{ border: "1px solid var(--rule)", background: "var(--paper)" }}` |
| I-07 | `src/app/dashboard/[id]/page.tsx` (`LoadingPulseInner`) | **`@keyframes bounce` not defined** in `LoadingPulseInner`. The annual-report-loading dots animation silently does nothing. `LoadingPulse` defines it correctly; `LoadingPulseInner` does not. | Add `<style>{\`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}\`}</style>` inside `LoadingPulseInner` |
| I-08 | `src/app/compare/page.tsx` | **No visual feedback** when "Analyse" button is clicked with empty input (function returns early silently). | Add an error state: `setError("Enter a domain.")` and render it |
| I-09 | `src/app/compare/page.tsx` | **No 429 rate-limit error surfaced** — `createReport` checks `if (!res.ok) { setLoading(false); return; }` with no user-facing message on 429. | Extract error body: `const err = await res.json(); setError(err.error ?? "Request failed.")` |
| I-10 | `src/app/page.tsx` (Stack section, line 83) | Stack lists **"React 18 + RSC"** — app uses React **19**. Also lists **"Remotion (demo video)"** which is not in package.json. | Fix to "React 19 + RSC", remove "Remotion (demo video)" |

### 🟢 Low Priority / Polish

| ID | File | Issue | Fix |
|----|------|-------|-----|
| I-11 | `src/app/share/[id]/page.tsx` | Share page is **server-rendered against in-memory store** — cross-device share links for live reports return 404 after restart. | Document this limitation clearly, or persist reports to disk/DB |
| I-12 | `src/components/ShareExportButtons.tsx` | `EasterEggDetector` wraps all three share buttons — **long-press on any export button** fires `twoTwinDebate()` unexpectedly. | Move the `EasterEggDetector` to wrap only the domain h1 on dashboard, not the export buttons |
| I-13 | `src/app/dashboard/[id]/page.tsx` (line 553) | Dashboard two-column grid (`gridTemplateColumns: "1fr 340px"`) is **not responsive** — will overflow horizontally on screens < ~600px. | Add a media query or switch to `gridTemplateColumns: "1fr"` on mobile |
| I-14 | `src/app/reports/page.tsx` | `/reports` uses **emoji favicon** `AX` box, not the Syntra logo — inconsistent with rest of app. | Part of fix for I-01 |
| I-15 | `src/app/page.tsx` (engines section) | Engine cards each link to `/dashboard/demo-stripe` — in **live mode** they should probably link to the domain form or a generic "try it" CTA. | Conditional href or keep as demo link with a label |

---

## § 11 — Regression Checklist (fixes already in place)

These were bugs fixed in previous sessions — verify they stay fixed:

| # | What was fixed | How to verify |
|---|----------------|---------------|
| R-1 | `keyStrengths.map` crash when `data` exists but `keyStrengths` is null | Open `/dashboard/demo-stripe` — Investment memo renders without crash |
| R-2 | `font-weight` CSS console warning in engine grid | Open DevTools → Console on any dashboard — zero style property warnings |
| R-3 | Demo mode silently returning dummy data for non-fixture domains | POST `{"domain":"github.com"}` to `/api/report/create` — should return 422, not start a dummy report |
| R-4 | Favicon was blurry 993B image | Browser tab shows sharp S mark |
| R-5 | `src/lib/demo.ts` dead code | File should not exist: `ls src/lib/demo.ts` → "No such file" |

---

## § 12 — Quick API smoke test (curl commands)

```bash
BASE=http://localhost:3000

# Fixture short-circuit
curl -s -X POST $BASE/api/report/create \
  -H "Content-Type: application/json" \
  -d '{"domain":"stripe.com"}' | jq .

# Live report
curl -s -X POST $BASE/api/report/create \
  -H "Content-Type: application/json" \
  -d '{"domain":"notion.so"}' | jq .

# 400 — missing domain
curl -s -X POST $BASE/api/report/create \
  -H "Content-Type: application/json" \
  -d '{}' | jq .

# 400 — invalid domain
curl -s -X POST $BASE/api/report/create \
  -H "Content-Type: application/json" \
  -d '{"domain":"not a domain!"}' | jq .

# 404 — missing report
curl -s $BASE/api/report/nonexistent | jq .

# Reports list
curl -s $BASE/api/reports | jq 'map({id, domain, status})'
```

---

*End of test prompt. File all new findings as GitHub issues or inline fixes.*
