export async function fetchWithRetry(
  input: RequestInfo,
  init: RequestInit & { retries?: number } = {}
) {
  const { retries = 2, ...rest } = init;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    try {
      const response = await fetch(input, rest);
      if (!response.ok && (response.status === 429 || response.status >= 500)) {
        const waitMs = 400 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        attempt += 1;
        continue;
      }
      return response;
    } catch (error) {
      lastError = error as Error;
      const waitMs = 400 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      attempt += 1;
    }
  }

  throw lastError ?? new Error("Request failed after retries.");
}
