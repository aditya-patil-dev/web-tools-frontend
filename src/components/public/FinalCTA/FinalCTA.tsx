"use client";

import Link from "next/link";
import AppLink from '@/components/common/AppLink';
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import DynamicIcon from "@/components/ui/DynamicIcon";

// ── Updated config — footnote is now an array of { icon, text } ──────────────
// This allows each item to use a proper React Icon instead of inline emojis.
// BACKWARD COMPATIBLE: if you still pass a plain string as footnote,
// it renders as-is so nothing breaks.

interface FootnoteItem {
    icon: string;   // emoji "⚡" OR react-icons name "BiSolidBolt"
    text: string;
}

interface FinalCTAConfig {
    title: string;
    subtitle: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
    // Supports both old string format and new array format
    footnote: string | FootnoteItem[];
}

interface FinalCTAProps {
    config?: FinalCTAConfig;
}

const DEFAULT_CONFIG: FinalCTAConfig = {
    title: "Start Using <span>Powerful Web Tools</span> Today",
    subtitle: "No sign-up. No hidden limits. Just fast, reliable tools built to help you get things done.",
    primaryCta: { text: "Try Tools Now", href: "/tools" },
    secondaryCta: { text: "View Pricing", href: "/pricing" },
    // New array format — each item has icon + text
    footnote: [
        { icon: "BiSolidBolt", text: "Instant results" },
        { icon: "BiLock", text: "Privacy-friendly" },
        { icon: "BiRocket", text: "Built for productivity" },
    ],
};

export default function FinalCTA({ config = DEFAULT_CONFIG }: FinalCTAProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

    const isArray = Array.isArray(config.footnote);

    return (
        <section className="cta-wrapper" ref={ref}>
            <motion.div className="cta-container" style={{ y, opacity }}>
                <motion.h2
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                    dangerouslySetInnerHTML={{ __html: config.title }}
                />

                <motion.p
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                    {config.subtitle}
                </motion.p>

                <motion.div
                    className="cta-actions"
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                >
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                        <AppLink href={config.primaryCta.href} className="cta-primary">
                            {config.primaryCta.text}
                        </AppLink>
                    </motion.div>
                    {/* <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                        <AppLink href={config.secondaryCta.href} className="cta-secondary">
                            {config.secondaryCta.text}
                        </AppLink>
                    </motion.div> */}
                </motion.div>

                {/* ── Footnote — supports both string and array format ── */}
                <motion.div
                    className="cta-footnote"
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}
                >
                    {isArray
                        ? (config.footnote as FootnoteItem[]).map((item, i) => (
                            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <DynamicIcon name={item.icon} size={15} fallback={null} />
                                {item.text}
                            </span>
                        ))
                        : config.footnote as string
                    }
                </motion.div>
            </motion.div>
        </section>
    );
}