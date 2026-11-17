"use client";

import { useEffect, useState } from "react";

/**
 * Keeps a conditionally rendered overlay mounted for the length of its exit
 * transition, and flips `visible` a frame after mount so the entrance has an
 * initial state to animate from. All state changes happen inside frame/timer
 * callbacks rather than synchronously in the effect body. Under reduced motion
 * the exit is immediate so a closed overlay never lingers on screen.
 */
export function usePresence(isOpen: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let secondFrame = 0;
      const firstFrame = requestAnimationFrame(() => {
        setMounted(true);
        secondFrame = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(firstFrame);
        cancelAnimationFrame(secondFrame);
      };
    }

    const frame = requestAnimationFrame(() => setVisible(false));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setMounted(false), reduce ? 0 : exitMs);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [isOpen, exitMs]);

  return { mounted, visible };
}
