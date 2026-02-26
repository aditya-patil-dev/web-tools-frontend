"use client";
// src/features/online-store/sections/final-cta/index.tsx

import React from "react";
import { FInput, FTextarea, FieldDivider } from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface FinalCtaData {
    title: string;
    subtitle: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
    footnote: string;
}

function FinalCtaEditor({ data, onChange }: EditorProps<FinalCtaData>) {
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

            <FieldDivider label="Footnote" />
            <FInput label="Footnote Text" value={data.footnote} onChange={(v) => onChange({ ...data, footnote: v })} />
        </React.Fragment>
    );
}

const finalCtaSection: SectionDefinition<FinalCtaData> = {
    type: "final-cta",
    label: "Final CTA",
    icon: "🎯",
    Editor: FinalCtaEditor,
    defaultData: {
        title: "Start Using <span>Powerful Web Tools</span> Today",
        subtitle: "No sign-up. No hidden limits. Just fast, reliable tools built to help you get things done.",
        primaryCta: { text: "Try Tools Now", href: "/tools" },
        secondaryCta: { text: "View Pricing", href: "/pricing" },
        footnote: "⚡ Instant results · 🔒 Privacy-friendly · 🚀 Built for productivity",
    },
};

export default finalCtaSection;