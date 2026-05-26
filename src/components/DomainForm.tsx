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
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
        />
        {/* Easter egg: long-press submit → Udyam red flag scenario */}
        <EasterEggDetector longPress onActivate={handleUdyamEgg}>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Running..." : "Run Diligence"}
          </button>
        </EasterEggDetector>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
