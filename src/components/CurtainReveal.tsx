"use client";

import { useEffect, useState } from "react";

/**
 * Opening curtain animation. Lifts up to reveal content on first paint.
 * Shows: 000 · syntra · v1.0
 */
export function CurtainReveal() {
  const [lifted, setLifted] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const liftTimer = setTimeout(() => setLifted(true), 1150);
    const unmountTimer = setTimeout(() => setUnmounted(true), 2500);
    return () => {
      clearTimeout(liftTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (unmounted) return null;
  return (
    <div className={`curtain ${lifted ? "lift" : ""}`} aria-hidden>
      <div className="curtain-label">
        <span className="num">000</span>
        <span>syntra · intelligence&nbsp;twins</span>
        <span className="num">v1.0</span>
      </div>
      <div className="curtain-bar" />
    </div>
  );
}
