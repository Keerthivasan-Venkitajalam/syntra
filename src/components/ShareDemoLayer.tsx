"use client";

/**
 * ShareDemoLayer — client-side interactive layer for the share page.
 *
 * Renders invisibly on top of the share page header to catch the
 * Easter egg #5 gesture: triple-tap header → verifierContradictsClaim()
 *
 * Also mounts the DemoBanner so demo scenario banners work on the share page.
 */

import { DemoBanner } from "@/components/DemoBanner";
import { EasterEggDetector } from "@/components/EasterEggDetector";
import { getDemoOrchestrator } from "@/lib/demo/demo_orchestrator";

export function ShareDemoLayer() {
  return (
    <>
      <DemoBanner />
      {/* Invisible tap target over the page header area */}
      <EasterEggDetector
        taps={3}
        onActivate={() => getDemoOrchestrator().verifierContradictsClaim(2)}
        className="fixed top-0 left-0 right-0 h-16 z-40 pointer-events-auto"
      >
        {/* Invisible tap zone over the share page header */}
        <div />
      </EasterEggDetector>
    </>
  );
}
