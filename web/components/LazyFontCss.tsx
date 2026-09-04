"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Injects a preview stylesheet only once the wrapped content nears the
 * viewport. Keeps the 100-card grid from firing 100 CSS requests on load.
 */
export default function LazyFontCss({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
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
      { rootMargin: "500px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {active && <link rel="stylesheet" href={href} />}
      {children}
    </div>
  );
}
