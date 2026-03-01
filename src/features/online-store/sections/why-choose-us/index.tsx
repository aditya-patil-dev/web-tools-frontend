"use client";
// src/features/online-store/sections/why-choose-us/index.tsx

import React from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput, InlineTextarea,
} from "../../components/FieldEditors";
import DynamicIcon from "@/components/ui/DynamicIcon";
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

            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                💡 Icon accepts emoji <strong>(⚡)</strong> or any React Icons name <strong>(BiSolidBolt, HiOutlineSparkles)</strong>.{" "}
                <a href="https://react-icons.github.io/react-icons" target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>Browse icons →</a>
            </p>

            {data.features.map((f, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            {/* Live icon preview — replaces raw emoji span */}
                            <span style={{
                                width: 28, height: 28, borderRadius: 6, background: "#f1f5f9",
                                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <DynamicIcon name={f.icon || "HiOutlineSparkles"} size={15} color="#6366f1" fallback={<span style={{ fontSize: 14 }}>✨</span>} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 6 }}>
                                {f.title || "Untitled"}
                            </span>
                            <RemoveButton onClick={() => onChange({ ...data, features: data.features.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={f.icon} onChange={(v) => updateFeature(i, { icon: v })} placeholder="e.g. BiSolidBolt or ⚡" />
                    <InlineInput value={f.title} onChange={(v) => updateFeature(i, { title: v })} placeholder="Title" />
                    <InlineTextarea value={f.description} onChange={(v) => updateFeature(i, { description: v })} placeholder="Description…" />
                </ItemCard>
            ))}

            <AddButton
                label="Add Feature"
                onClick={() => onChange({ ...data, features: [...data.features, { icon: "HiOutlineSparkles", title: "New Feature", description: "Feature description." }] })}
            />
        </React.Fragment>
    );
}

const whyChooseUsSection: SectionDefinition<WhyChooseUsData> = {
    type: "why-choose-us",
    label: "Why Choose Us",
    icon: "why-choose-us",
    Editor: WhyChooseUsEditor,
    defaultData: {
        header: { title: "Why Choose <span>Us</span>", subtitle: "Built to help you work faster, smarter, and more efficiently." },
        features: [
            { icon: "BiSolidBolt", title: "Lightning Fast", description: "All tools run instantly in your browser. No waiting, no delays." },
            { icon: "BiLock", title: "Privacy First", description: "Your files never leave your device. Complete privacy guaranteed." },
            { icon: "MdOutlineAutoAwesome", title: "Always Free", description: "Core features are free forever. No hidden costs or surprises." },
            { icon: "TbTarget", title: "Simple to Use", description: "Clean interface, no learning curve. Just tools that work." },
        ],
    },
};

export default whyChooseUsSection;