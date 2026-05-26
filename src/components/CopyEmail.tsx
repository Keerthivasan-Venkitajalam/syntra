"use client";

import { useState } from "react";

/** Single-button copy email with state feedback */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <button type="button" className="copy-btn" onClick={copy}>
      {copied ? "✓ Copied to clipboard" : "Copy email"}
    </button>
  );
}
