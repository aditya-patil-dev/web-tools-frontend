"use client";
// src/features/online-store/sections/popular-tools/index.tsx

import React from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput,
} from "../../components/FieldEditors";
import DynamicIcon from "@/components/ui/DynamicIcon";
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

            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                💡 Icon accepts emoji <strong>(🖼️)</strong> or any React Icons name <strong>(TbPhoto, MdImage)</strong>.{" "}
                <a href="https://react-icons.github.io/react-icons" target="_blank" rel="noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>Browse icons →</a>
            </p>

            {data.tools.map((t, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            {/* Live icon preview — replaces raw emoji span */}
                            <span style={{
                                width: 28, height: 28, borderRadius: 6, background: "#f1f5f9",
                                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                <DynamicIcon name={t.icon || "TbTool"} size={15} color="#6366f1" fallback={<span style={{ fontSize: 14 }}>🛠️</span>} />
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, marginLeft: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {t.title || "Untitled"}
                            </span>
                            <RemoveButton onClick={() => onChange({ ...data, tools: data.tools.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <InlineInput value={t.icon} onChange={(v) => updateTool(i, { icon: v })} placeholder="e.g. TbPhoto or 🖼️" />
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

            <AddButton
                label="Add Tool"
                onClick={() => onChange({ ...data, tools: [...data.tools, { title: "New Tool", description: "Description", icon: "TbTool", href: "/tools/new", badge: null }] })}
            />

            <FieldDivider label="Footer Link" />
            <FInput label="Link Text" value={data.footer.text} onChange={(v) => onChange({ ...data, footer: { ...data.footer, text: v } })} />
            <FInput label="Link URL" value={data.footer.href} onChange={(v) => onChange({ ...data, footer: { ...data.footer, href: v } })} />
        </React.Fragment>
    );
}

const popularToolsSection: SectionDefinition<PopularToolsData> = {
    type: "popular-tools",
    label: "Popular Tools",
    icon: "popular-tools",
    Editor: PopularToolsEditor,
    defaultData: {
        header: { title: "Popular <span>Tools</span>", subtitle: "Try our most used tools trusted by developers and marketers." },
        tools: [
            { title: "Image Converter", description: "Convert JPG, PNG, WebP instantly", icon: "TbPhoto", href: "/tools/image-converter", badge: "popular" },
            { title: "Keyword Research", description: "Find low-competition keywords", icon: "TbSearch", href: "/tools/keyword-research", badge: null },
            { title: "Image Compressor", description: "Reduce file size without quality loss", icon: "TbFileZip", href: "/tools/image-compressor", badge: "new" },
        ],
        footer: { text: "View All Tools →", href: "/tools" },
    },
};

export default popularToolsSection;