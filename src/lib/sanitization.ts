/**
 * Sanitization and prompt injection detection utilities
 */

// Patterns that commonly appear in prompt injection attempts
const injectionPatterns = [
  /ignore\s+previous|disregard\s+previous/gi,
  /forget\s+everything|clear\s+context|reset\s+system/gi,
  /instructions?[\s:=]+forget|instructions?[\s:=]+ignore/gi,
  /system\s+prompt|user\s+prompt|direct\s+override/gi,
  /jailbreak|escape\s+the\s+box|bypass|circumvent/gi,
  /exec\s*\(|eval\s*\(|interpret\s+as\s+code/gi,
  /you\s+are\s+now|pretend\s+you\s+are|act\s+as\s+if/gi,
];

// Domain-specific injection patterns for diligence context
const diligenceSuspiciousPatterns = [
  /\[INJECTION\]|\{INJECTION\}|#INJECTION/gi,
  /<!--.*-->|\/\*.*\*\//g, // HTML/JS comments
  /\${.*}|{{.*}}/g, // Template injection
  /\\x[0-9a-f]{2}/gi, // Hex encoding
];

/**
 * Detect potential prompt injection attempts
 * Returns { isInjection: boolean, score: number, flaggedPatterns: string[] }
 */
export function detectPromptInjection(content: string): {
  isInjection: boolean;
  score: number;
  flaggedPatterns: string[];
} {
  if (!content || typeof content !== "string") {
    return { isInjection: false, score: 0, flaggedPatterns: [] };
  }

  const flaggedPatterns: string[] = [];
  let injectionScore = 0;

  // Check all patterns
  const allPatterns = [...injectionPatterns, ...diligenceSuspiciousPatterns];

  for (const pattern of allPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      flaggedPatterns.push(...matches);
      injectionScore += matches.length * 0.2; // Each match increases score
    }
  }

  // High ratio of special characters in a small string can indicate encoding
  const specialCharRatio =
    (content.match(/[^a-zA-Z0-9\s.,;:'\"-()]/g) || []).length /
    (content.length || 1);
  if (specialCharRatio > 0.3) {
    injectionScore += 0.3;
    flaggedPatterns.push("high_special_char_ratio");
  }

  // Excessive line breaks or newlines
  const lineBreakRatio = (content.match(/\n/g) || []).length / (content.split(" ").length || 1);
  if (lineBreakRatio > 0.2) {
    injectionScore += 0.2;
    flaggedPatterns.push("excessive_line_breaks");
  }

  // Deduplicate flagged patterns
  const uniqueFlaggedPatterns = Array.from(new Set(flaggedPatterns));

  return {
    isInjection: injectionScore > 0.5, // Threshold for flagging
    score: Math.min(injectionScore, 1),
    flaggedPatterns: uniqueFlaggedPatterns,
  };
}

/**
 * Sanitize content for safe LLM consumption
 * Removes or escapes potentially dangerous patterns
 */
export function sanitizeForLLM(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let sanitized = content;

  // Remove HTML/JS comments
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, "");

  // Remove potentially dangerous markup
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, "");
  sanitized = sanitized.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

  // Replace multiple consecutive newlines with single newline
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n");

  // Limit content length to prevent token overflow
  const maxLength = 8000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "\n[Content truncated...]";
  }

  return sanitized;
}

/**
 * Safe wrapper for LLM context generation
 * Detects injection attempts and sanitizes content
 */
export function generateSafeContext(
  items: Array<{ url: string; content: string }>
): {
  context: string;
  warnings: Array<{ url: string; issue: string }>;
} {
  const warnings: Array<{ url: string; issue: string }> = [];

  const safeItems = items
    .map((item) => {
      const { isInjection, score, flaggedPatterns } = detectPromptInjection(
        item.content
      );

      if (isInjection) {
        warnings.push({
          url: item.url,
          issue: `Potential prompt injection detected (score: ${score.toFixed(2)}, patterns: ${flaggedPatterns.slice(0, 3).join(", ")})`,
        });
        // Return minimal safe content
        return `Source: ${item.url}\n[Content filtered due to security flags]`;
      }

      const sanitized = sanitizeForLLM(item.content);
      return `Source: ${item.url}\n${sanitized}`;
    })
    .join("\n\n---\n\n");

  return { context: safeItems, warnings };
}
