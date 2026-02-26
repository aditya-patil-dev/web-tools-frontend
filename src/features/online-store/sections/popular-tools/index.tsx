"use client";
// src/features/online-store/sections/popular-tools/index.tsx

import React from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput,
} from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

export interface ToolItem {
    title: string;
    description: string;
    icon: string;
    href: string;
    badge: "popular" | "new" | null;
}

export interface PopularToolsData {
    header: { title: string; subtitle: string };
    tools: ToolItem[];
    footer: { text: string; href: string };
}

function PopularToolsEditor({ data, onChange }: EditorProps<PopularToolsData>) {
    function updateTool(i: number, patch: Partial<ToolItem>) {
        const next = [...data.tools];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, tools: next });
    }

    return (
        <React.Fragment>
            <FInput label="Title (HTML allowed)" value={data.header.title} onChange={(v) => onChange({ ...data, header: { ...data.header, title: v } })} />
            <FInput label="Subtitle" value={data.header.subtitle} onChange={(v) => onChange({ ...data, header: { ...data.header, subtitle: v } })} />

            <FieldDivider label={`Tools (${data.tools.length})`} />
            {data.tools.map((t, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            <span style={{ fontSize: 16 }}>{t.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {t.title || "Untitled"}
                            </span>
                            <RemoveButton onClick={() => onChange({ ...data, tools: data.tools.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={t.icon} onChange={(v) => updateTool(i, { icon: v })} placeholder="Icon (emoji)" />
                    <InlineInput value={t.title} onChange={(v) => updateTool(i, { title: v })} placeholder="Title" />
                    <InlineInput value={t.description} onChange={(v) => updateTool(i, { description: v })} placeholder="Description" />
                    <InlineInput value={t.href} onChange={(v) => updateTool(i, { href: v })} placeholder="/tools/slug" />
                    <select
                        value={t.badge ?? ""}
                        onChange={(e) => updateTool(i, { badge: (e.target.value || null) as ToolItem["badge"] })}
                        style={{ width: "100%", padding: "7px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fff" }}
                    >
                        <option value="">No badge</option>
                        <option value="popular">popular</option>
                        <option value="new">new</option>
                    </select>
                </ItemCard>
            ))}
            <AddButton label="Add Tool" onClick={() => onChange({ ...data, tools: [...data.tools, { title: "New Tool", description: "Description", icon: "🛠️", href: "/tools/new", badge: null }] })} />

            <FieldDivider label="Footer Link" />
            <FInput label="Link Text" value={data.footer.text} onChange={(v) => onChange({ ...data, footer: { ...data.footer, text: v } })} />
            <FInput label="Link URL" value={data.footer.href} onChange={(v) => onChange({ ...data, footer: { ...data.footer, href: v } })} />
        </React.Fragment>
    );
}

const popularToolsSection: SectionDefinition<PopularToolsData> = {
    type: "popular-tools",
    label: "Popular Tools",
    icon: "🛠️",
    Editor: PopularToolsEditor,
    defaultData: {
        header: { title: "Popular <span>Tools</span>", subtitle: "Try our most used tools trusted by developers and marketers." },
        tools: [
            { title: "Image Converter", description: "Convert JPG, PNG, WebP instantly", icon: "🖼️", href: "/tools/image-converter", badge: "popular" },
            { title: "Keyword Research", description: "Find low-competition keywords", icon: "🔍", href: "/tools/keyword-research", badge: null },
            { title: "Image Compressor", description: "Reduce file size without quality loss", icon: "⚡", href: "/tools/image-compressor", badge: "new" },
        ],
        footer: { text: "View All Tools →", href: "/tools" },
    },
};

export default popularToolsSection;