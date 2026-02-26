"use client";
// src/features/online-store/sections/why-choose-us/index.tsx

import React from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput, InlineTextarea,
} from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

export interface WhyChooseUsData {
    header: { title: string; subtitle: string };
    features: FeatureItem[];
}

function WhyChooseUsEditor({ data, onChange }: EditorProps<WhyChooseUsData>) {
    function updateFeature(i: number, patch: Partial<FeatureItem>) {
        const next = [...data.features];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, features: next });
    }

    return (
        <React.Fragment>
            <FInput label="Title (HTML allowed)" value={data.header.title} onChange={(v) => onChange({ ...data, header: { ...data.header, title: v } })} />
            <FInput label="Subtitle" value={data.header.subtitle} onChange={(v) => onChange({ ...data, header: { ...data.header, subtitle: v } })} />

            <FieldDivider label={`Features (${data.features.length})`} />
            {data.features.map((f, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            <span style={{ fontSize: 16 }}>{f.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 6 }}>{f.title || "Untitled"}</span>
                            <RemoveButton onClick={() => onChange({ ...data, features: data.features.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={f.icon} onChange={(v) => updateFeature(i, { icon: v })} placeholder="Icon (emoji)" />
                    <InlineInput value={f.title} onChange={(v) => updateFeature(i, { title: v })} placeholder="Title" />
                    <InlineTextarea value={f.description} onChange={(v) => updateFeature(i, { description: v })} placeholder="Description…" />
                </ItemCard>
            ))}
            <AddButton label="Add Feature" onClick={() => onChange({ ...data, features: [...data.features, { icon: "✨", title: "New Feature", description: "Feature description." }] })} />
        </React.Fragment>
    );
}

const whyChooseUsSection: SectionDefinition<WhyChooseUsData> = {
    type: "why-choose-us",
    label: "Why Choose Us",
    icon: "⭐",
    Editor: WhyChooseUsEditor,
    defaultData: {
        header: { title: "Why Choose <span>Us</span>", subtitle: "Built to help you work faster, smarter, and more efficiently." },
        features: [
            { icon: "⚡", title: "Lightning Fast", description: "All tools run instantly in your browser. No waiting, no delays." },
            { icon: "🔒", title: "Privacy First", description: "Your files never leave your device. Complete privacy guaranteed." },
            { icon: "🆓", title: "Always Free", description: "Core features are free forever. No hidden costs or surprises." },
            { icon: "🎯", title: "Simple to Use", description: "Clean interface, no learning curve. Just tools that work." },
        ],
    },
};

export default whyChooseUsSection;