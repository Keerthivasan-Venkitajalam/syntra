import { demoLinkupSearch } from "@/lib/demo/demo_backend";
import { isDemoMode } from "@/lib/demo/demo_backend";
import { fetchWithRetry } from "@/lib/http";

const BASE = "https://api.linkup.so/v1";

// ─────────────────────────────────────────────────────────────────
// /search  (existing)
// ─────────────────────────────────────────────────────────────────
export type LinkupSearchResult = {
  name: string;
  url: string;
  content: string;
  type?: string;
};

export type LinkupSearchResponse = {
  results: LinkupSearchResult[];
};

export async function linkupSearch(params: {
  query: string;
  depth: "fast" | "standard" | "deep";
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
}) {
  if (isDemoMode()) {
    return demoLinkupSearch(params.query);
  }

  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) throw new Error("LINKUP_API_KEY is not set.");

  const response = await fetchWithRetry(`${BASE}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: params.query,
      depth: params.depth,
      outputType: "searchResults",
      includeImages: false,
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Linkup /search error ${response.status}: ${msg}`);
  }

  return (await response.json()) as LinkupSearchResponse;
}

// ─────────────────────────────────────────────────────────────────
// /research  (new — deep autonomous research agent)
//
// mode:
//   "answer"      — precise, evidence-backed answer
//   "investigate" — focused report on one entity (best for company DD)
//   "research"    — multi-section report across many topics
//
// depth:  S ($0.25, ~2 min) | M ($0.75, ~5 min)
//         L ($1.50, ~10 min) | XL ($2.50, ~20 min)
// ─────────────────────────────────────────────────────────────────
export type LinkupResearchSource = {
  name: string;
  url: string;
  snippet?: string;
};

export type LinkupResearchResponse = {
  answer: string;
  sources: LinkupResearchSource[];
};

export async function linkupResearch(params: {
  query: string;
  mode: "answer" | "investigate" | "research";
  depth?: "S" | "M" | "L" | "XL";
}): Promise<LinkupResearchResponse> {
  // Demo mode — synthesise a plausible response from search fixtures
  if (isDemoMode()) {
    const fallback = await demoLinkupSearch(params.query);
    return {
      answer: fallback.results.map((r) => r.content).join("\n\n").slice(0, 4000),
      sources: fallback.results.map((r) => ({ name: r.name, url: r.url })),
    };
  }

  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) throw new Error("LINKUP_API_KEY is not set.");

  const response = await fetchWithRetry(`${BASE}/research`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: params.query,
      mode: params.mode,
      depth: params.depth ?? "S",
      outputType: "sourcedAnswer",
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Linkup /research error ${response.status}: ${msg}`);
  }

  return (await response.json()) as LinkupResearchResponse;
}

// ─────────────────────────────────────────────────────────────────
// /fetch  (updated — now accepts PDF documents up to 20 MB)
//
// Turns any public URL (HTML or PDF) into clean, LLM-ready markdown.
// Pricing: $0.001 per call regardless of format.
// ─────────────────────────────────────────────────────────────────
export type LinkupFetchResponse = {
  content: string;   // LLM-ready markdown
  title?: string;
  url: string;
  isPdf: boolean;
};

export async function linkupFetch(url: string): Promise<LinkupFetchResponse> {
  const isPdf = /\.pdf(\?|$)/i.test(url);

  if (isDemoMode()) {
    return { content: "", title: undefined, url, isPdf };
  }

  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) throw new Error("LINKUP_API_KEY is not set.");

  const response = await fetchWithRetry(`${BASE}/fetch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Linkup /fetch error ${response.status}: ${msg}`);
  }

  const data = await response.json() as { content?: string; markdown?: string; title?: string };
  return {
    content: data.content ?? data.markdown ?? "",
    title: data.title,
    url,
    isPdf,
  };
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Extract PDF URLs from search results (annual reports, SEC filings, etc.) */
export function extractPdfUrls(results: LinkupSearchResult[]): string[] {
  return results
    .map((r) => r.url)
    .filter((u) => /\.pdf(\?|$)/i.test(u))
    .slice(0, 3);
}
