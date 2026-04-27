"use client";

import Link from "next/link";
import AppLink from '@/components/common/AppLink';
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
    const isArray = Array.isArray(config.footnote);

    return (
        <section className="cta-wrapper">
            <div className="cta-container">
                <h2 dangerouslySetInnerHTML={{ __html: config.title }} />

                <p>
                    {config.subtitle}
                </p>

                <div className="cta-actions">
                    <div>
                        <AppLink href={config.primaryCta.href} className="cta-primary">
                            {config.primaryCta.text}
                        </AppLink>
                    </div>
                </div>

                {/* ── Footnote — supports both string and array format ── */}
                <div
                    className="cta-footnote"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap", marginTop: 20 }}
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
                </div>
            </div>
        </section>
    );
}