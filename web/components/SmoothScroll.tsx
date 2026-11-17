"use client";

import { ReactLenis } from "lenis/react";

/**
 * Site-wide smooth scrolling. Lenis runs on the compositor-friendly rAF loop
 * (autoRaf) with a gentle lerp, leaves touch scrolling native, and honors
 * prefers-reduced-motion on its own. Nested scrollers opt out with
 * `data-lenis-prevent`.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
