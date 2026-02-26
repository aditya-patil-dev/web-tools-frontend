"use client";
// src/features/online-store/sections/how-it-works/index.tsx

import React from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput, InlineTextarea,
} from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface StepItem {
    step: string;
    icon: string;
    title: string;
    description: string;
}

export interface HowItWorksData {
    header: { title: string; subtitle: string };
    steps: StepItem[];
}

function HowItWorksEditor({ data, onChange }: EditorProps<HowItWorksData>) {
    function updateStep(i: number, patch: Partial<StepItem>) {
        const next = [...data.steps];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, steps: next });
    }

    return (
        <React.Fragment>
            <FInput label="Title (HTML allowed)" value={data.header.title} onChange={(v) => onChange({ ...data, header: { ...data.header, title: v } })} />
            <FInput label="Subtitle" value={data.header.subtitle} onChange={(v) => onChange({ ...data, header: { ...data.header, subtitle: v } })} />

            <FieldDivider label={`Steps (${data.steps.length})`} />
            {data.steps.map((st, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            <div style={{ background: "#ff6b35", color: "#fff", width: 20, height: 20, borderRadius: "50%", fontSize: 11, fontWeight: 700, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {st.step}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 7 }}>{st.title || "Untitled"}</span>
                            <RemoveButton onClick={() => onChange({ ...data, steps: data.steps.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={st.icon} onChange={(v) => updateStep(i, { icon: v })} placeholder="Icon (emoji)" />
                    <InlineInput value={st.title} onChange={(v) => updateStep(i, { title: v })} placeholder="Step title" />
                    <InlineTextarea value={st.description} onChange={(v) => updateStep(i, { description: v })} placeholder="Description…" />
                </ItemCard>
            ))}
            <AddButton
                label="Add Step"
                onClick={() => {
                    const num = data.steps.length + 1;
                    onChange({ ...data, steps: [...data.steps, { step: `${num}`, icon: "🔷", title: `Step ${num}`, description: "Step description." }] });
                }}
            />
        </React.Fragment>
    );
}

const howItWorksSection: SectionDefinition<HowItWorksData> = {
    type: "how-it-works",
    label: "How It Works",
    icon: "🔄",
    Editor: HowItWorksEditor,
    defaultData: {
        header: { title: "How It <span>Works</span>", subtitle: "Start using our tools in seconds. No learning curve, no setup." },
        steps: [
            { step: "1", icon: "🎯", title: "Choose Your Tool", description: "Browse our collection and pick the tool you need." },
            { step: "2", icon: "📁", title: "Upload or Input", description: "Add your file, text, or URL depending on the tool." },
            { step: "3", icon: "⚡", title: "Process Instantly", description: "Our tools work in real-time, right in your browser." },
            { step: "4", icon: "💾", title: "Download Results", description: "Get your processed file or result immediately." },
        ],
    },
};

export default howItWorksSection;