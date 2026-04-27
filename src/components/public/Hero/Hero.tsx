"use client";

import AppLink from "@/components/common/AppLink";
import { useEffect, useState } from "react";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "./hero.config";
import DynamicIcon from "@/components/ui/DynamicIcon";
import HeroDragDropDemo from "./HeroDragDropDemo";
/* ─────────────────────────────────────────
   HOOK — SSR-safe mobile detection
   Returns true once JS confirms mobile viewport.
   Avoids hydration mismatch.
───────────────────────────────────────── */
function useIsMobile(breakpoint = 900): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
        // Update state only if the initial media query result differs from default
        if (mq.matches !== isMobile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMobile(mq.matches);
        }
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [breakpoint]);

    return isMobile;
}

/* ─────────────────────────────────────────
   PROPS
───────────────────────────────────────── */
interface HeroProps {
    config?: HeroConfig;
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function Hero({ config = DEFAULT_HERO_CONFIG }: HeroProps) {
    const isMobile = useIsMobile(900);

    return (
        <section className="hero-wrapper">

            {/* ── Two-column inner layout ── */}
            <div className="hero-inner">

                {/* ── LEFT / TOP: text content ── */}
                <div className="hero-content">

                    {/* Badge */}
                    <span className="hero-badge" style={{ width: "fit-content", alignSelf: "flex-start" }}>
                        {config.badge}
                    </span>

                    {/* H1 */}
                    <h1
                        className="hero-title"
                        dangerouslySetInnerHTML={{ __html: config.title }}
                    />

                    {/* Subtitle */}
                    <p className="hero-subtitle">
                        {config.subtitle}
                    </p>

                    {/* CTA */}
                    <div className="hero-actions">
                        <AppLink
                            href={config.primaryCta.href}
                            className="hero-cta-primary"
                        >
                            {config.primaryCta.text}
                        </AppLink>
                        <AppLink
                            href={config.secondaryCta.href}
                            className="hero-cta-secondary"
                        >
                            {config.secondaryCta.text}
                        </AppLink>
                    </div>

                    {/* Trust badges */}
                    <div className="hero-trust">
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

                {/* ── RIGHT / BOTTOM: animated demo ── */}
                <div className="hero-demo-col">
                    <HeroDragDropDemo />
                </div>

            </div>
        </section>
    );
}