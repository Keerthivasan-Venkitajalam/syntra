import { demoAiSynthesis, isDemoMode } from "@/lib/demo/demo_backend";
import { fetchWithRetry } from "@/lib/http";

export async function runGatewayJson<T>(params: {
  system: string;
  prompt: string;
  schemaHint?: string;
}): Promise<T | null> {
  // Demo mode: return empty object — fixture data is used directly via the
  // pre-seeded report store, so the AI synthesis step is a no-op.
  if (isDemoMode()) {
    return demoAiSynthesis<T>();
  }

  const gatewayKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const apiKey = gatewayKey || openaiKey;
  if (!apiKey) return null;

  const url = gatewayKey
    ? (process.env.VERCEL_AI_GATEWAY_URL ??
      "https://ai-gateway.vercel.sh/v1/chat/completions")
    : "https://api.openai.com/v1/chat/completions";

  const model = process.env.AI_MODEL ?? "openai/gpt-4.1-nano";

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      stream: false,
      messages: [
        { role: "system", content: params.system },
        {
          role: "user",
          content: `${params.prompt}\n\nReturn ONLY valid JSON.${
            params.schemaHint ? ` Schema: ${params.schemaHint}` : ""
          }`,
        },
      ],
    }),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const cleaned = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
