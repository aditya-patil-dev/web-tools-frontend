"use client";
// src/features/online-store/sections/how-it-works/index.tsx

import React from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput, InlineTextarea,
} from "../../components/FieldEditors";
import DynamicIcon from "@/components/ui/DynamicIcon";
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

            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                💡 Icon accepts emoji <strong>(🎯)</strong> or any React Icons name <strong>(TbClick, BiUpload)</strong>.{" "}
                <a href="https://react-icons.github.io/react-icons" target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>Browse icons →</a>
            </p>

            {data.steps.map((st, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            {/* Step number bubble */}
                            <div style={{
                                background: "#ff6b35", color: "#fff", width: 20, height: 20,
                                borderRadius: "50%", fontSize: 11, fontWeight: 700, flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                {st.step}
                            </div>
                            {/* Live icon preview — replaces raw emoji span */}
                            <span style={{
                                width: 24, height: 24, borderRadius: 6, background: "#f1f5f9",
                                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <DynamicIcon name={st.icon || "TbClick"} size={13} color="#6366f1" fallback={<span style={{ fontSize: 12 }}>🔷</span>} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 4 }}>
                                {st.title || "Untitled"}
                            </span>
                            <RemoveButton onClick={() => onChange({ ...data, steps: data.steps.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={st.icon} onChange={(v) => updateStep(i, { icon: v })} placeholder="e.g. TbClick or 🎯" />
                    <InlineInput value={st.title} onChange={(v) => updateStep(i, { title: v })} placeholder="Step title" />
                    <InlineTextarea value={st.description} onChange={(v) => updateStep(i, { description: v })} placeholder="Description…" />
                </ItemCard>
            ))}

            <AddButton
                label="Add Step"
                onClick={() => {
                    const num = data.steps.length + 1;
                    onChange({ ...data, steps: [...data.steps, { step: `${num}`, icon: "TbClick", title: `Step ${num}`, description: "Step description." }] });
                }}
            />
        </React.Fragment>
    );
}

const howItWorksSection: SectionDefinition<HowItWorksData> = {
    type: "how-it-works",
    label: "How It Works",
    icon: "how-it-works",
    Editor: HowItWorksEditor,
    defaultData: {
        header: { title: "How It <span>Works</span>", subtitle: "Start using our tools in seconds. No learning curve, no setup." },
        steps: [
            { step: "1", icon: "TbClick", title: "Choose Your Tool", description: "Browse our collection and pick the tool you need." },
            { step: "2", icon: "BiUpload", title: "Upload or Input", description: "Add your file, text, or URL depending on the tool." },
            { step: "3", icon: "BiSolidBolt", title: "Process Instantly", description: "Our tools work in real-time, right in your browser." },
            { step: "4", icon: "BiDownload", title: "Download Results", description: "Get your processed file or result immediately." },
        ],
    },
};

export default howItWorksSection;