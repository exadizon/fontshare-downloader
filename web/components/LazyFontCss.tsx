"use client";

import { useEffect, useRef, useState } from "react";

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
    <span ref={ref} className="hidden" aria-hidden="true">
      {active ? <link rel="stylesheet" href={href} /> : null}
    </span>
  );
}
