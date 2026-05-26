"use client";

import { useEffect, useRef } from "react";

/** Wraps a page with the grain overlay and cursor dot/ring. */
export function Shell({ children }: { children: React.ReactNode }) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    // Both confirmed non-null from here on
    const dotEl = dot;
    const ringEl = ring;

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let raf = 0;

    function tick() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dotEl.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
      ringEl.style.transform = `translate(calc(${rx}px - 50%), calc(${ry}px - 50%))`;
      raf = requestAnimationFrame(tick);
    }

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
    }

    function onEnter(e: MouseEvent) {
      const el = e.target as HTMLElement;
      const hoverable = el.closest("a,button,[data-hover]");
      ringEl.classList.toggle("hovering", !!hoverable);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onEnter, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Paper grain */}
      <div className="grain" aria-hidden />

      {/* Custom cursor */}
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />

      {children}
    </>
  );
}
