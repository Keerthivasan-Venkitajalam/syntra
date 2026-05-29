"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { EasterEggDetector } from "@/components/EasterEggDetector";
import { getDemoOrchestrator } from "@/lib/demo/demo_orchestrator";

export function DomainForm() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!domain.trim()) {
      setError("Enter a company domain.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/report/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload.error ?? "Failed to create report.");
        return;
      }

      const payload = await response.json();
      router.push(`/dashboard/${payload.id}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /** Easter egg #2: long-press submit → udyamRedFlagFire (acme-batteries.in) */
  function handleUdyamEgg() {
    getDemoOrchestrator().udyamRedFlagFire();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="domain"
          placeholder="example.com"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          style={{
            flex: 1, padding: "11px 16px", borderRadius: 10,
            border: `1px solid ${error ? "var(--red)" : "var(--rule-strong)"}`,
            background: "var(--paper)", color: "var(--ink)",
            fontFamily: "var(--t-mono)", fontSize: 14, outline: "none",
            transition: "border-color .2s",
          }}
        />
        {/* Easter egg: long-press submit → Udyam red flag scenario */}
        <EasterEggDetector longPress onActivate={handleUdyamEgg}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 24px", borderRadius: 10,
              background: loading ? "var(--paper-3)" : "var(--accent)",
              color: loading ? "var(--muted)" : "var(--paper)",
              border: "none", fontFamily: "var(--t-mono)", fontSize: 13,
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.04em", whiteSpace: "nowrap",
              transition: "background .2s, opacity .2s",
            }}
          >
            {loading ? "Running…" : "Run Diligence →"}
          </button>
        </EasterEggDetector>
      </div>
      {error ? (
        <p style={{ fontFamily: "var(--t-mono)", fontSize: 12, color: "var(--red)" }}>{error}</p>
      ) : null}
    </form>
  );
}
