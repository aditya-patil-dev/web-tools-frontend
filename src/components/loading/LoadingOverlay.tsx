"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  message?: string;
  finishing?: boolean;
};

export default function LoadingOverlay({ finishing = false }: Props) {
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (finishing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWidth(100);
      const fadeTimer = setTimeout(() => setOpacity(0), 150);
      return () => clearTimeout(fadeTimer);
    }

    const FAST_DURATION = 300;
    const FAST_TARGET = 72;
    const CRAWL_TARGET = 92;
    const CRAWL_RATE = 0.008;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;

      let w: number;
      if (elapsed < FAST_DURATION) {
        const t = elapsed / FAST_DURATION;
        const eased = 1 - Math.pow(1 - t, 3);
        w = eased * FAST_TARGET;
      } else {
        const extra = elapsed - FAST_DURATION;
        w = Math.min(FAST_TARGET + extra * CRAWL_RATE, CRAWL_TARGET);
      }

      setWidth(w);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [finishing]);

  return (
    <>
      <div
        className="nprogress-bar"
        style={{
          width: `${width}%`,
          opacity,
          transition: finishing
            ? "width 200ms ease-out, opacity 200ms ease-in 150ms"
            : "none",
        }}
      />
      <div
        className="nprogress-tip"
        style={{
          left: `${width}%`,
          opacity: finishing ? 0 : opacity,
          transition: finishing ? "opacity 100ms ease-in" : "none",
        }}
      />
    </>
  );
}
