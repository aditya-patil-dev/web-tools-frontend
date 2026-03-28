"use client";

import AppLink from "@/components/common/AppLink";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "./hero.config";
import DynamicIcon from "@/components/ui/DynamicIcon";
import HeroAnimatedDemo from "./HeroAnimatedDemo";

/* ─────────────────────────────────────────
   FALLBACK CHIPS (used when API doesn't send toolChips)
───────────────────────────────────────── */
const FALLBACK_CHIPS = [
    { label: "Image Compressor", href: "/tools/image-compressor" },
    { label: "Meta Tag Generator", href: "/tools/meta-tag-generator" },
    { label: "JSON Formatter", href: "/tools/json-formatter" },
    { label: "Color Converter", href: "/tools/color-converter" },
    { label: "Slug Generator", href: "/tools/slug-generator" },
    { label: "Word Counter", href: "/tools/word-counter" },
];

/* ─────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────── */
const badgeVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.8 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const }
    },
};

const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] as const, delay: 0.1 }
    },
};

const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.7, ease: "easeOut" as const, delay: 0.3 }
    },
};

const ctaContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, delay: 0.5, staggerChildren: 0.1 }
    },
};

const ctaVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

const chipsVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, delay: 0.7, staggerChildren: 0.06 }
    },
};

const chipVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const trustVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.8, delay: 0.9, staggerChildren: 0.08 }
    },
};

const trustItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

// Demo slides in from right on desktop, fades up on mobile
const demoDesktopVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
        opacity: 1, x: 0,
        transition: { duration: 0.9, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }
    },
};

const demoMobileVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: 0.6, ease: "easeOut" as const }
    },
};

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
    const chips = config?.toolChips?.length ? config.toolChips : FALLBACK_CHIPS;

    return (
        <section className="hero-wrapper">
            {/* Decorative blobs — hidden on small mobile for perf */}
            <motion.div
                className="hero-blob hero-blob-a"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <motion.div
                className="hero-blob hero-blob-b"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />

            {/* ── Two-column inner layout ── */}
            <div className="hero-inner">

                {/* ── LEFT / TOP: text content ── */}
                <div className="hero-content">

                    {/* Badge */}
                    <motion.span
                        className="hero-badge"
                        initial="hidden"
                        animate="visible"
                        variants={badgeVariants}
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    >
                        {config.badge}
                    </motion.span>

                    {/* H1 */}
                    <motion.h1
                        className="hero-title"
                        initial="hidden"
                        animate="visible"
                        variants={titleVariants}
                        dangerouslySetInnerHTML={{ __html: config.title }}
                    />

                    {/* Subtitle */}
                    <motion.p
                        className="hero-subtitle"
                        initial="hidden"
                        animate="visible"
                        variants={subtitleVariants}
                    >
                        {config.subtitle}
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        className="hero-actions"
                        initial="hidden"
                        animate="visible"
                        variants={ctaContainerVariants}
                    >
                        <motion.div variants={ctaVariants} style={{ width: "100%" }}>
                            <AppLink
                                href={config.primaryCta.href}
                                className="hero-cta-primary"
                            >
                                {config.primaryCta.text}
                            </AppLink>
                        </motion.div>
                    </motion.div>

                    {/* Tool chips */}
                    <motion.div
                        className="hero-chips-section"
                        initial="hidden"
                        animate="visible"
                        variants={chipsVariants}
                    >
                        <p className="hero-chips-label">Jump to a tool</p>
                        <div className="hero-chips">
                            {chips.map((chip) => (
                                <motion.div key={chip.href} variants={chipVariants}>
                                    <AppLink href={chip.href} className="hero-chip">
                                        {chip.label}
                                    </AppLink>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        className="hero-trust"
                        initial="hidden"
                        animate="visible"
                        variants={trustVariants}
                    >
                        {config.trustBadges.map((badge, index) => (
                            <motion.span
                                key={index}
                                variants={trustItemVariants}
                                style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                            >
                                <DynamicIcon name={badge.icon} size={15} fallback={null} />
                                {badge.text}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>

                {/* ── RIGHT / BOTTOM: animated demo ── */}
                <motion.div
                    className="hero-demo-col"
                    initial="hidden"
                    animate="visible"
                    variants={isMobile ? demoMobileVariants : demoDesktopVariants}
                >
                    <HeroAnimatedDemo />
                </motion.div>

            </div>
        </section>
    );
}