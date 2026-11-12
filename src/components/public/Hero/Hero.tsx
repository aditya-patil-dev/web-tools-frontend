"use client";

import AppLink from "@/components/common/AppLink";
import { useEffect, useState } from "react";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "./hero.config";
import DynamicIcon from "@/components/ui/DynamicIcon";
import HeroOmniSearch from "./HeroOmniSearch";
import HeroInteractiveSandbox from "./HeroInteractiveSandbox";

function useIsMobile(breakpoint = 900): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    if (mq.matches !== isMobile) {
      setIsMobile(mq.matches);
    }
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

interface HeroProps {
  config?: HeroConfig;
}

export default function Hero({ config = DEFAULT_HERO_CONFIG }: HeroProps) {
  const isMobile = useIsMobile(900);

  return (
    <section className="hero-wrapper">
      <div className="hero-inner">
        {/* ── LEFT: Text content + Universal OmniSearch ── */}
        <div className="hero-content">
          {/* Highlighted Badge */}
          <div className="hero-badge-highlight-wrap">
            <span className="hero-badge highlight-badge">
              <span className="badge-pulse-indicator" />
              {config.badge}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="hero-title"
            dangerouslySetInnerHTML={{ __html: config.title }}
          />

          {/* Subtitle */}
          <p className="hero-subtitle">
            {config.subtitle}
          </p>

          {/* Universal Action Search Bar */}
          <HeroOmniSearch />

          {/* Trust badges */}
          <div className="hero-trust" style={{ marginTop: "16px" }}>
            {config.trustBadges.map((badge, index) => (
              <span
                key={index}
                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                <DynamicIcon name={badge.icon} size={15} fallback={null} />
                {badge.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Multi-Tool Interactive Sandbox ── */}
        <div className="hero-demo-col">
          <HeroInteractiveSandbox />
        </div>
      </div>
    </section>
  );
}
