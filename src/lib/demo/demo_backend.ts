/**
 * DemoBackend — server-side demo layer.
 *
 * When SYNTRA_DEMO_MODE=true:
 *  - Fixture reports for stripe.com / figma.com / acme-batteries.in are seeded at startup.
 *  - The create-report route shortcuts directly to the pre-seeded fixture IDs.
 *  - linkupSearch and runGatewayJson are intercepted so no real API calls leave the process.
 */

import { Report } from "@/lib/types";
import { seedReport } from "@/lib/reports";
import stripeFixture from "@/lib/demo/fixtures/stripe.json";
import figmaFixture from "@/lib/demo/fixtures/figma.json";
import acmeBatteriesFixture from "@/lib/demo/fixtures/acme_batteries.json";

// ---------------------------------------------------------------------------
// Domain → fixture ID map
// ---------------------------------------------------------------------------

export const DEMO_DOMAIN_MAP: Record<string, string> = {
  "stripe.com": "demo-stripe",
  "figma.com": "demo-figma",
  "acme-batteries.in": "demo-acme-batteries",
};

export const ALL_DEMO_IDS = Object.values(DEMO_DOMAIN_MAP);

// ---------------------------------------------------------------------------
// Mode check
// ---------------------------------------------------------------------------

export function isDemoMode(): boolean {
  return process.env.SYNTRA_DEMO_MODE === "true";
}

/** Returns the fixture report ID for a domain, or null if not a demo domain. */
export function getDemoId(domain: string): string | null {
  return DEMO_DOMAIN_MAP[domain.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Fixture seeding (idempotent)
// ---------------------------------------------------------------------------

let seeded = false;

export function seedDemoReports(): void {
  if (seeded) return;
  seeded = true;
  seedReport(stripeFixture as unknown as Report);
  seedReport(figmaFixture as unknown as Report);
  seedReport(acmeBatteriesFixture as unknown as Report);
}

// ---------------------------------------------------------------------------
// Simulated network latency
// ---------------------------------------------------------------------------

export async function simulatedDelay(minMs = 200, maxMs = 600): Promise<void> {
  const ms = minMs + Math.floor(Math.random() * (maxMs - minMs));
  await new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Linkup intercept shim
// ---------------------------------------------------------------------------

export type DemoLinkupResult = {
  name: string;
  url: string;
  content: string;
  type: string;
};

export async function demoLinkupSearch(query: string): Promise<{
  results: DemoLinkupResult[];
}> {
  await simulatedDelay();
  return {
    results: [
      {
        name: `[DEMO] ${query}`,
        url: "https://example.com/demo-result",
        content: `Simulated search result for "${query}". In production, Linkup would return real-time web data here with full citation metadata.`,
        type: "web",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// AI gateway intercept shim
// ---------------------------------------------------------------------------

export async function demoAiSynthesis<T>(): Promise<T> {
  await simulatedDelay(100, 300);
  // Real data comes from fixtures — return an empty object so the engine
  // pipeline doesn't crash if somehow called in demo mode.
  return {} as T;
}
