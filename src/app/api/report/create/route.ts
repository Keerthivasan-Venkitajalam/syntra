import { NextResponse } from "next/server";

import {
  getDemoId,
  isDemoMode,
  seedDemoReports as seedDemoReportsV2,
} from "@/lib/demo/demo_backend";
import { checkRateLimit } from "@/lib/rateLimit";
import { createReport } from "@/lib/reports";
import { runReport } from "@/lib/runReport";
import { validateDomain } from "@/lib/validators";

// Seed all three demo fixtures at startup (idempotent)
seedDemoReportsV2();

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.domain) {
    return NextResponse.json(
      { error: "Domain is required." },
      { status: 400 }
    );
  }

  const validation = validateDomain(body.domain);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Demo mode: shortcut to pre-seeded fixture — no engine calls, no latency.
  if (isDemoMode()) {
    const fixtureId = getDemoId(validation.domain);
    if (fixtureId) {
      return NextResponse.json({
        id: fixtureId,
        domain: validation.domain,
        status: "completed",
      });
    }
    // Non-fixture domain in demo mode — Linkup/AI calls are all intercepted,
    // so running a real report would silently return dummy data. Block it.
    return NextResponse.json(
      {
        error:
          "SYNTRA_DEMO_MODE is active. Only stripe.com, figma.com, and acme-batteries.in are available in demo mode. " +
          "Set SYNTRA_DEMO_MODE=false (or use `npm run dev`) to run live intelligence on any domain.",
      },
      { status: 422 }
    );
  }

  const report = createReport(validation.domain);

  void runReport(report.id, report.domain);

  return NextResponse.json({
    id: report.id,
    domain: report.domain,
    status: report.status,
  });
}
