"use client";

import React, { useState } from "react";
import {
    FInput, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput,
    FSelect,
} from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

/* ─── Types ─────────────────────────────────────────────────────────── */
export interface NavChild {
    label: string;
    href: string;
    badge?: "new" | "beta" | "";
}

export interface NavToolItem {
    label: string;
    href: string;
    children: NavChild[];
}

export interface NavTopItem {
    label: string;
    href: string;
}

export interface NavbarData {
    logoText: string;
    logoHighlight: string;
    topNavItems: NavTopItem[];
    toolsNavItems: NavToolItem[];
    loginHref: string;
    ctaText: string;
    ctaHref: string;
}

/* ─── Editor ─────────────────────────────────────────────────────────── */
function NavbarEditor({ data, onChange }: EditorProps<NavbarData>) {
    const [expandedTool, setExpandedTool] = useState<number | null>(null);

    /* helpers */
    function updateTool(i: number, patch: Partial<NavToolItem>) {
        const next = [...data.toolsNavItems];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, toolsNavItems: next });
    }

    function updateChild(toolIdx: number, childIdx: number, patch: Partial<NavChild>) {
        const tools = [...data.toolsNavItems];
        const children = [...tools[toolIdx].children];
        children[childIdx] = { ...children[childIdx], ...patch };
        tools[toolIdx] = { ...tools[toolIdx], children };
        onChange({ ...data, toolsNavItems: tools });
    }

    function removeChild(toolIdx: number, childIdx: number) {
        const tools = [...data.toolsNavItems];
        tools[toolIdx] = {
            ...tools[toolIdx],
            children: tools[toolIdx].children.filter((_, j) => j !== childIdx),
        };
        onChange({ ...data, toolsNavItems: tools });
    }

    function addChild(toolIdx: number) {
        const tools = [...data.toolsNavItems];
        tools[toolIdx] = {
            ...tools[toolIdx],
            children: [...tools[toolIdx].children, { label: "New Link", href: "/", badge: "" }],
        };
        onChange({ ...data, toolsNavItems: tools });
    }

    function updateTopItem(i: number, patch: Partial<NavTopItem>) {
        const next = [...data.topNavItems];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, topNavItems: next });
    }

    return (
        <React.Fragment>
            {/* ── Brand ── */}
            <FieldDivider label="Brand / Logo" />
            <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1 }}>
                    <FInput
                        label="Logo Text"
                        value={data.logoText}
                        onChange={(v) => onChange({ ...data, logoText: v })}
                        placeholder="Web"
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <FInput
                        label="Highlight (colored)"
                        value={data.logoHighlight}
                        onChange={(v) => onChange({ ...data, logoHighlight: v })}
                        placeholder="Tools"
                    />
                </div>
            </div>

            {/* ── CTA ── */}
            <FieldDivider label="CTA Button" />
            <FInput label="Button Text" value={data.ctaText} onChange={(v) => onChange({ ...data, ctaText: v })} />
            <FInput label="Button URL" value={data.ctaHref} onChange={(v) => onChange({ ...data, ctaHref: v })} />
            <FInput label="Login URL" value={data.loginHref} onChange={(v) => onChange({ ...data, loginHref: v })} />

            {/* ── Top Nav ── */}
            <FieldDivider label={`Top Nav Links (${data.topNavItems.length})`} />
            {data.topNavItems.map((item, i) => (
                <ItemCard
                    key={i}
                    header={
                        <React.Fragment>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{item.label || "Link"}</span>
                            <RemoveButton onClick={() => onChange({ ...data, topNavItems: data.topNavItems.filter((_, j) => j !== i) })} />
                        </React.Fragment>
                    }
                >
                    <div style={{ display: "flex", gap: 6 }}>
                        <InlineInput value={item.label} onChange={(v) => updateTopItem(i, { label: v })} placeholder="Label" style={{ flex: 1, marginBottom: 0 }} />
                        <InlineInput value={item.href} onChange={(v) => updateTopItem(i, { href: v })} placeholder="/page" style={{ flex: 2, marginBottom: 0 }} />
                    </div>
                </ItemCard>
            ))}
            <AddButton
                label="Add Top Nav Link"
                onClick={() => onChange({ ...data, topNavItems: [...data.topNavItems, { label: "New Page", href: "/" }] })}
            />

            {/* ── Tools Nav ── */}
            <FieldDivider label={`Tools Nav Groups (${data.toolsNavItems.length})`} />
            {data.toolsNavItems.map((tool, ti) => (
                <div key={ti} style={{ marginBottom: 6, border: "1.5px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                    {/* Group header */}
                    <div
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", background: "#f8fafc", cursor: "pointer" }}
                        onClick={() => setExpandedTool(expandedTool === ti ? null : ti)}
                    >
                        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#334155" }}>{tool.label || "Group"}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{tool.children.length} links</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange({ ...data, toolsNavItems: data.toolsNavItems.filter((_, j) => j !== ti) }); }}
                            style={{ padding: "2px 7px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 5, color: "#e11d48", cursor: "pointer", fontSize: 10, fontWeight: 600 }}
                        >
                            ✕
                        </button>
                        <span style={{ fontSize: 10, color: "#94a3b8", transform: expandedTool === ti ? "rotate(180deg)" : "rotate(0)", transition: "transform .15s" }}>▼</span>
                    </div>

                    {expandedTool === ti && (
                        <div style={{ padding: "10px" }}>
                            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                                <InlineInput value={tool.label} onChange={(v) => updateTool(ti, { label: v })} placeholder="Group Label" style={{ flex: 1, marginBottom: 0 }} />
                                <InlineInput value={tool.href} onChange={(v) => updateTool(ti, { href: v })} placeholder="/tools/category" style={{ flex: 2, marginBottom: 0 }} />
                            </div>

                            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>
                                Dropdown Links
                            </div>
                            {tool.children.map((child, ci) => (
                                <div key={ci} style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}>
                                    <InlineInput value={child.label} onChange={(v) => updateChild(ti, ci, { label: v })} placeholder="Link Label" style={{ flex: 2, marginBottom: 0 }} />
                                    <InlineInput value={child.href} onChange={(v) => updateChild(ti, ci, { href: v })} placeholder="/path" style={{ flex: 3, marginBottom: 0 }} />
                                    <select
                                        value={child.badge ?? ""}
                                        onChange={(e) => updateChild(ti, ci, { badge: e.target.value as NavChild["badge"] })}
                                        style={{ padding: "6px 4px", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 11, color: "#64748b", background: "#fff", cursor: "pointer" }}
                                    >
                                        <option value="">—</option>
                                        <option value="new">new</option>
                                        <option value="beta">beta</option>
                                    </select>
                                    <button
                                        onClick={() => removeChild(ti, ci)}
                                        style={{ padding: "5px 7px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 6, color: "#e11d48", cursor: "pointer", fontSize: 11, flexShrink: 0 }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <AddButton label="Add Dropdown Link" onClick={() => addChild(ti)} />
                        </div>
                    )}
                </div>
            ))}
            <AddButton
                label="Add Tools Group"
                onClick={() => onChange({
                    ...data,
                    toolsNavItems: [
                        ...data.toolsNavItems,
                        { label: "New Group", href: "/tools/new-group", children: [] },
                    ],
                })}
            />
        </React.Fragment>
    );
}

/* ─── Definition ─────────────────────────────────────────────────────── */
const navbarSection: SectionDefinition<NavbarData> = {
    type: "navbar",
    label: "Navbar / Header",
    icon: "🧭",
    Editor: NavbarEditor,
    defaultData: {
        logoText: "Web",
        logoHighlight: "Tools",
        topNavItems: [
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
        ],
        toolsNavItems: [
            {
                label: "IMG Tools",
                href: "/tools/image-tools",
                children: [
                    { label: "Image Compressor", href: "/tools/image-tools/image-compressor", badge: "" },
                    { label: "Image Resizer", href: "/tools/image-tools/image-resizer", badge: "" },
                    { label: "Image to Base64", href: "/tools/image-tools/image-to-base64", badge: "" },
                    { label: "JPG to PNG", href: "/tools/image-tools/jpg-to-png", badge: "" },
                    { label: "PNG to JPG", href: "/tools/image-tools/png-to-jpg", badge: "" },
                    { label: "WebP Converter", href: "/tools/image-tools/webp-converter", badge: "" },
                ],
            },
            {
                label: "Text Tools",
                href: "/tools/text-tools",
                children: [
                    { label: "Case Converter", href: "/tools/text-tools/case-converter", badge: "" },
                    { label: "Word Counter", href: "/tools/text-tools/word-counter", badge: "new" },
                    { label: "Text Formatter", href: "/tools/text-tools/text-formatter", badge: "" },
                ],
            },
            {
                label: "Dev Tools",
                href: "/tools/developer-tools",
                children: [
                    { label: "JSON Formatter", href: "/tools/developer-tools/json-formatter", badge: "" },
                    { label: "Code Beautifier", href: "/tools/developer-tools/code-beautifier", badge: "new" },
                ],
            },
            {
                label: "SEO Tools",
                href: "/tools/seo-tools",
                children: [
                    { label: "Meta Tag Generator", href: "/tools/seo-tools/meta-tag-generator", badge: "" },
                    { label: "Robots.txt Generator", href: "/tools/seo-tools/robots-txt-generator", badge: "" },
                ],
            },
            {
                label: "PDF Tools",
                href: "/tools/pdf-tools",
                children: [
                    { label: "PDF Merger", href: "/tools/pdf-tools/pdf-merger", badge: "" },
                    { label: "PDF Compressor", href: "/tools/pdf-tools/pdf-compressor", badge: "" },
                ],
            },
        ],
        loginHref: "/login",
        ctaText: "Try Tools",
        ctaHref: "/tools",
    },
};

export default navbarSection;