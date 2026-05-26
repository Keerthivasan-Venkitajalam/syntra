"use client";

/**
 * EasterEggDetector
 *
 * Invisible wrapper that detects hidden gestures and fires a callback.
 *
 * Modes:
 *   - Multi-tap: fires when the element is tapped `taps` times within 2 seconds.
 *   - Long-press: fires when the pointer is held down for ≥600ms.
 *
 * Layout is completely unchanged — no visual affordance.
 */

import { useCallback, useRef } from "react";

interface EasterEggDetectorProps {
  children: React.ReactNode;
  /** Number of taps required (default: 4). Only relevant when longPress=false. */
  taps?: number;
  /** If true, activate on long-press instead of multi-tap. */
  longPress?: boolean;
  /** Callback fired when the gesture is detected. */
  onActivate: () => void;
  /** Optional className passed to the wrapper div. */
  className?: string;
}

export function EasterEggDetector({
  children,
  taps = 4,
  longPress = false,
  onActivate,
  className,
}: EasterEggDetectorProps) {
  const tapCount = useRef(0);
  const tapResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Multi-tap ---

  const handleClick = useCallback(() => {
    if (longPress) return;

    tapCount.current += 1;

    if (tapResetTimer.current) clearTimeout(tapResetTimer.current);

    if (tapCount.current >= taps) {
      tapCount.current = 0;
      onActivate();
      return;
    }

    // Reset the count if no further tap arrives within 2 seconds
    tapResetTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);
  }, [taps, longPress, onActivate]);

  // --- Long-press ---

  const startLongPress = useCallback(() => {
    if (!longPress) return;
    longPressTimer.current = setTimeout(() => {
      onActivate();
    }, 600);
  }, [longPress, onActivate]);

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <div
      className={className}
      onClick={handleClick}
      onMouseDown={startLongPress}
      onMouseUp={cancelLongPress}
      onMouseLeave={cancelLongPress}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchCancel={cancelLongPress}
      // Prevent long-press context menus on mobile
      onContextMenu={(e) => {
        if (longPress) e.preventDefault();
      }}
    >
      {children}
    </div>
  );
}
