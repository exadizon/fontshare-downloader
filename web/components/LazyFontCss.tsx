"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lazily injects a per-family Fontshare CSS stylesheet once the host row
 * scrolls near the viewport. The sentinel must keep real geometry: an
 * IntersectionObserver never fires for `display: none` elements, which is
 * why previews previously fell back to the body font.
 */
export default function LazyFontLink({ href }: { href: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      style={{
        display: "block",
        width: 1,
        height: 1,
        margin: "-1px 0",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      {active ? <link rel="stylesheet" href={href} /> : null}
    </span>
  );
}
