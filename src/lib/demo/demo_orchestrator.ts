"use client";

/**
 * DemoOrchestrator — client-side scripted scenario engine.
 *
 * All methods are safe to call from any React component.
 * Subscribe with `useDemoOrchestrator(listener)` or via the singleton.
 *
 * Scenario catalogue:
 *   1. sentinelDiffAlert()          — Sentinel banner: stripe.com pricing change detected
 *   2. engineDegradationGraceful()  — ESG engine flips to rate-limited
 *   3. twoTwinDebate()              — Navigate to /compare?a=demo-stripe&b=demo-figma
 *   4. udyamRedFlagFire()           — Navigate to /dashboard/demo-acme-batteries
 *   5. verifierContradictsClaim()   — Flip a citation chip red in the share page
 *   6. promptInjectionBlocked()     — Toast: quarantined payload detected
 *   7. seedDemoTwins()              — All 3 demo Twins visible in workspace instantly
 *   8. resetAll()                   — Clear all scripted state
 */

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export type DemoScenarioEvent =
  | {
      type: "sentinel_diff_alert";
      payload: { domain: string; change: string };
    }
  | { type: "engine_degradation"; payload: { engine: string } }
  | { type: "two_twin_debate" }
  | { type: "udyam_red_flag" }
  | {
      type: "verifier_contradicts";
      payload: { claimIndex: number };
    }
  | { type: "prompt_injection_blocked" }
  | { type: "seed_demo_twins" }
  | { type: "reset_all" };

export type DemoEventListener = (event: DemoScenarioEvent) => void;

// ---------------------------------------------------------------------------
// Orchestrator class
// ---------------------------------------------------------------------------

class DemoOrchestrator {
  private readonly listeners = new Set<DemoEventListener>();

  /** Subscribe to orchestrator events. Returns an unsubscribe function. */
  on(listener: DemoEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: DemoScenarioEvent): void {
    this.listeners.forEach((l) => l(event));
  }

  // -------------------------------------------------------------------------
  // Scenario: #3 — Sentinel diff alert
  // -------------------------------------------------------------------------
  sentinelDiffAlert(): void {
    this.emit({
      type: "sentinel_diff_alert",
      payload: {
        domain: "stripe.com",
        change:
          "Pricing page CTA modified — 'no credit card required' removed. PLG signal weakened. Self-serve conversion may decline.",
      },
    });
  }

  // -------------------------------------------------------------------------
  // Scenario: #4 — Graceful engine degradation
  // -------------------------------------------------------------------------
  engineDegradationGraceful(): void {
    this.emit({ type: "engine_degradation", payload: { engine: "esg" } });
  }

  // -------------------------------------------------------------------------
  // Scenario: #6 — Two-Twin debate (navigates to compare page)
  // -------------------------------------------------------------------------
  twoTwinDebate(): void {
    this.emit({ type: "two_twin_debate" });
    if (typeof window !== "undefined") {
      window.location.href = "/compare?a=demo-stripe&b=demo-figma";
    }
  }

  // -------------------------------------------------------------------------
  // Scenario: #2 — Udyam Red Flag fire (navigates to acme-batteries Twin)
  // -------------------------------------------------------------------------
  udyamRedFlagFire(): void {
    this.emit({ type: "udyam_red_flag" });
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard/demo-acme-batteries";
    }
  }

  // -------------------------------------------------------------------------
  // Scenario: #5 — Verifier contradicts a claim
  // -------------------------------------------------------------------------
  verifierContradictsClaim(claimIndex = 2): void {
    this.emit({ type: "verifier_contradicts", payload: { claimIndex } });
  }

  // -------------------------------------------------------------------------
  // Scenario: #7 — Prompt injection blocked
  // -------------------------------------------------------------------------
  promptInjectionBlocked(): void {
    this.emit({ type: "prompt_injection_blocked" });
  }

  // -------------------------------------------------------------------------
  // Scenario: #1 — Seed all demo Twins instantly (Easter egg on landing page)
  // -------------------------------------------------------------------------
  seedDemoTwins(): void {
    this.emit({ type: "seed_demo_twins" });
  }

  // -------------------------------------------------------------------------
  // Scenario: #8 — Reset all
  // -------------------------------------------------------------------------
  resetAll(): void {
    this.emit({ type: "reset_all" });
  }
}

// ---------------------------------------------------------------------------
// Module-level singleton (client-only)
// ---------------------------------------------------------------------------

let _instance: DemoOrchestrator | null = null;

export function getDemoOrchestrator(): DemoOrchestrator {
  if (!_instance) {
    _instance = new DemoOrchestrator();
  }
  return _instance;
}
