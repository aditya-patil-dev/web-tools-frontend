"use client";
// src/features/online-store/sections/final-cta/index.tsx

import React from "react";
import {
    FInput, FTextarea, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput,
} from "../../components/FieldEditors";
import DynamicIcon from "@/components/ui/DynamicIcon";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface FootnoteItem {
    icon: string;
    text: string;
}

export interface FinalCtaData {
    title: string;
    subtitle: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
    // Changed from string to array — each item has its own icon + text
    footnote: FootnoteItem[];
}

function FinalCtaEditor({ data, onChange }: EditorProps<FinalCtaData>) {
    // Safely normalise footnote — handles old string format from DB
    const footnote: FootnoteItem[] = Array.isArray(data.footnote)
        ? data.footnote
        : [{ icon: "BiSolidBolt", text: String(data.footnote ?? "") }];

    function updateFootnote(i: number, patch: Partial<FootnoteItem>) {
        const next = [...footnote];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, footnote: next });
    }

    return (
        <React.Fragment>
            <FTextarea label="Title (HTML allowed)" value={data.title} onChange={(v) => onChange({ ...data, title: v })} rows={2} />
            <FTextarea label="Subtitle" value={data.subtitle} onChange={(v) => onChange({ ...data, subtitle: v })} />

            <FieldDivider label="Primary Button" />
            <FInput label="Button Text" value={data.primaryCta.text} onChange={(v) => onChange({ ...data, primaryCta: { ...data.primaryCta, text: v } })} />
            <FInput label="Button URL" value={data.primaryCta.href} onChange={(v) => onChange({ ...data, primaryCta: { ...data.primaryCta, href: v } })} />

            <FieldDivider label="Secondary Button" />
            <FInput label="Button Text" value={data.secondaryCta.text} onChange={(v) => onChange({ ...data, secondaryCta: { ...data.secondaryCta, text: v } })} />
            <FInput label="Button URL" value={data.secondaryCta.href} onChange={(v) => onChange({ ...data, secondaryCta: { ...data.secondaryCta, href: v } })} />

            <FieldDivider label={`Footnote Badges (${footnote.length})`} />

            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                💡 Icon accepts emoji <strong>(⚡)</strong> or any React Icons name <strong>(BiSolidBolt)</strong>.{" "}
                <a href="https://react-icons.github.io/react-icons" target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>Browse icons →</a>
            </p>

            {footnote.map((item, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            {/* Live icon preview */}
                            <span style={{
                                width: 26, height: 26, borderRadius: 6, background: "#f1f5f9",
                                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <DynamicIcon name={item.icon || "BiSolidBolt"} size={13} color="#6366f1" fallback={<span style={{ fontSize: 12 }}>⚡</span>} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 6 }}>
                                {item.text || "Badge text"}
                            </span>
                            <RemoveButton onClick={() => onChange({ ...data, footnote: footnote.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <div style={{ display: "flex", gap: 6 }}>
                        <InlineInput
                            value={item.icon}
                            onChange={(v) => updateFootnote(i, { icon: v })}
                            placeholder="e.g. BiSolidBolt or ⚡"
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                        <InlineInput
                            value={item.text}
                            onChange={(v) => updateFootnote(i, { text: v })}
                            placeholder="Label"
                            style={{ flex: 1, marginBottom: 0 }}
                        />
                    </div>
                </ItemCard>
            ))}

            <AddButton
                label="Add Badge"
                onClick={() => onChange({ ...data, footnote: [...footnote, { icon: "BiSolidBolt", text: "New badge" }] })}
            />
        </React.Fragment>
    );
}

const finalCtaSection: SectionDefinition<FinalCtaData> = {
    type: "final-cta",
    label: "Final CTA",
    icon: "final-cta",
    Editor: FinalCtaEditor,
    defaultData: {
        title: "Start Using <span>Powerful Web Tools</span> Today",
        subtitle: "No sign-up. No hidden limits. Just fast, reliable tools built to help you get things done.",
        primaryCta: { text: "Try Tools Now", href: "/tools" },
        secondaryCta: { text: "View Pricing", href: "/pricing" },
        footnote: [
            { icon: "BiSolidBolt", text: "Instant results" },
            { icon: "BiLock", text: "Privacy-friendly" },
            { icon: "BiRocket", text: "Built for productivity" },
        ],
    },
};

export default finalCtaSection;