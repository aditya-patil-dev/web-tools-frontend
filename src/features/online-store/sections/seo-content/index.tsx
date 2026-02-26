"use client";
// src/features/online-store/sections/seo-content/index.tsx

import React from "react";
import {
    FTextarea, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput, InlineTextarea,
} from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface ContentBlock {
    heading: string;
    content: string;
}

export interface SeoContentData {
    title: string;
    intro: string;
    expandedContent: ContentBlock[];
}

function SeoContentEditor({ data, onChange }: EditorProps<SeoContentData>) {
    function updateBlock(i: number, patch: Partial<ContentBlock>) {
        const next = [...data.expandedContent];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, expandedContent: next });
    }

    return (
        <React.Fragment>
            <FTextarea label="Title (HTML allowed)" value={data.title} onChange={(v) => onChange({ ...data, title: v })} rows={2} />
            <FTextarea label="Intro Paragraph" value={data.intro} onChange={(v) => onChange({ ...data, intro: v })} rows={3} />

            <FieldDivider label={`Content Blocks (${data.expandedContent.length})`} />
            {data.expandedContent.map((e, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {e.heading || "Untitled block"}
                            </span>
                            <RemoveButton onClick={() => onChange({ ...data, expandedContent: data.expandedContent.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={e.heading} onChange={(v) => updateBlock(i, { heading: v })} placeholder="Heading" />
                    <InlineTextarea value={e.content} onChange={(v) => updateBlock(i, { content: v })} placeholder="Content…" rows={3} />
                </ItemCard>
            ))}
            <AddButton label="Add Content Block" onClick={() => onChange({ ...data, expandedContent: [...data.expandedContent, { heading: "New Section", content: "Content here…" }] })} />
        </React.Fragment>
    );
}

const seoContentSection: SectionDefinition<SeoContentData> = {
    type: "seo-content",
    label: "SEO Content",
    icon: "🔍",
    Editor: SeoContentEditor,
    defaultData: {
        title: "Free <span>Online Web Tools</span> for Everyday Productivity",
        intro: "Our platform provides a growing collection of free online tools designed to help developers, marketers, students, and content creators work faster.",
        expandedContent: [
            { heading: "Why use online web tools?", content: "Online web tools eliminate the need to install heavy software." },
            { heading: "SEO, image, and AI tools in one place", content: "Our platform brings together essential tools under one roof." },
            { heading: "Built for speed, privacy, and reliability", content: "Performance and privacy are core principles. Most tools process instantly." },
            { heading: "Constantly growing tool library", content: "We continuously add new tools based on real-world use cases." },
        ],
    },
};

export default seoContentSection;