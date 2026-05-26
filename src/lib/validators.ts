const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export function normalizeDomain(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0];
  const withoutWww = withoutPath.replace(/^www\./, "");

  return withoutWww;
}

export function validateDomain(input: string) {
  const normalized = normalizeDomain(input);
  if (!normalized || !DOMAIN_REGEX.test(normalized)) {
    return { ok: false, error: "Enter a valid company domain." } as const;
  }

  return { ok: true, domain: normalized } as const;
}
