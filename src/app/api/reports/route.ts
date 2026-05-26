import { NextResponse } from "next/server";

import { seedDemoReports } from "@/lib/demo/demo_backend";
import { listReports } from "@/lib/reports";

seedDemoReports();

export async function GET() {
  const reports = listReports().map((r) => ({
    id: r.id,
    domain: r.domain,
    status: r.status,
    createdAt: r.createdAt,
    riskScores: r.riskScores,
    verdict: r.executiveSummary?.data?.verdict ?? null,
    engineCount: Object.values(r.engines).filter((e) => e.status === "completed").length,
    sourceCount: Object.values(r.engines).reduce((n, e) => n + e.sources.length, r.teaser.sources.length),
  }));

  return NextResponse.json(reports);
}
