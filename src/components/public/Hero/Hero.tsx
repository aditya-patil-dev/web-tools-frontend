"use client";

import AppLink from "@/components/common/AppLink";
import { useEffect, useState } from "react";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "./hero.config";
import DynamicIcon from "@/components/ui/DynamicIcon";
import HeroOmniSearch, { SearchScope } from "./HeroOmniSearch";
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
  const [activeScope, setActiveScope] = useState<SearchScope>("all");

  return (
    <section className="hero-wrapper">
      <div className="hero-inner">
        {/* ── LEFT: Text content + Universal OmniSearch ── */}
        <div className="hero-content">
          {/* Headline */}
          <h1
            className="hero-title"
            dangerouslySetInnerHTML={{ __html: config.title }}
          />

          {/* Subtitle */}
          <p className="hero-subtitle">
            {config.subtitle}
          </p>

          {/* Universal Action Search Bar (Synchronized Scope) */}
          <HeroOmniSearch
            activeScope={activeScope}
            onScopeChange={setActiveScope}
          />

          {/* Trust badges */}
          <div className="hero-trust" style={{ marginTop: "18px" }}>
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

        {/* ── RIGHT: Multi-Tool Interactive Sandbox (Synchronized with Scope) ── */}
        <div className="hero-demo-col">
          <HeroInteractiveSandbox
            activeScope={activeScope}
            onScopeChange={setActiveScope}
          />
        </div>
      </div>
    </section>
  );
}
