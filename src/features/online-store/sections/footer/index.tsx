"use client";

import React from "react";
import {
    FInput, FTextarea, FieldDivider,
    ItemCard, RemoveButton, AddButton, InlineInput,
} from "../../components/FieldEditors";
import type { SectionDefinition, EditorProps } from "../../registry/types";

/* ─── Types ─────────────────────────────────────────────────────────── */
export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterData {
    logoText: string;
    logoHighlight: string;
    description: string;
    sections: FooterSection[];
    copyrightName: string;
}

/* ─── Editor ─────────────────────────────────────────────────────────── */
function FooterEditor({ data, onChange }: EditorProps<FooterData>) {
    function updateSection(i: number, patch: Partial<FooterSection>) {
        const next = [...data.sections];
        next[i] = { ...next[i], ...patch };
        onChange({ ...data, sections: next });
    }

    function updateLink(si: number, li: number, patch: Partial<FooterLink>) {
        const sections = [...data.sections];
        const links = [...sections[si].links];
        links[li] = { ...links[li], ...patch };
        sections[si] = { ...sections[si], links };
        onChange({ ...data, sections });
    }

    function removeLink(si: number, li: number) {
        const sections = [...data.sections];
        sections[si] = { ...sections[si], links: sections[si].links.filter((_, j) => j !== li) };
        onChange({ ...data, sections });
    }

    function addLink(si: number) {
        const sections = [...data.sections];
        sections[si] = { ...sections[si], links: [...sections[si].links, { label: "New Link", href: "/" }] };
        onChange({ ...data, sections });
    }

    return (
        <React.Fragment>
            {/* ── Brand ── */}
            <FieldDivider label="Brand" />
            <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1 }}>
                    <FInput label="Logo Text" value={data.logoText} onChange={(v) => onChange({ ...data, logoText: v })} placeholder="Web" />
                </div>
                <div style={{ flex: 1 }}>
                    <FInput label="Highlight (colored)" value={data.logoHighlight} onChange={(v) => onChange({ ...data, logoHighlight: v })} placeholder="Tools" />
                </div>
            </div>
            <FTextarea label="Tagline / Description" value={data.description} onChange={(v) => onChange({ ...data, description: v })} rows={2} />
            <FInput label="Copyright Name" value={data.copyrightName} onChange={(v) => onChange({ ...data, copyrightName: v })} placeholder="WebTools" />

            {/* ── Link Sections ── */}
            <FieldDivider label={`Link Columns (${data.sections.length})`} />
            {data.sections.map((section, si) => (
                <ItemCard
                    key={si}
                    header={
                        <React.Fragment>
                            <InlineInput
                                value={section.title}
                                onChange={(v) => updateSection(si, { title: v })}
                                placeholder="Column Title"
                                style={{ width: 120, marginBottom: 0, fontSize: 12, fontWeight: 700 }}
                            />
                            <RemoveButton onClick={() => onChange({ ...data, sections: data.sections.filter((_, j) => j !== si) })} />
                        </React.Fragment>
                    }
                >
                    {section.links.map((link, li) => (
                        <div key={li} style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 5 }}>
                            <InlineInput
                                value={link.label}
                                onChange={(v) => updateLink(si, li, { label: v })}
                                placeholder="Label"
                                style={{ flex: 2, marginBottom: 0 }}
                            />
                            <InlineInput
                                value={link.href}
                                onChange={(v) => updateLink(si, li, { href: v })}
                                placeholder="/path"
                                style={{ flex: 3, marginBottom: 0 }}
                            />
                            <button
                                onClick={() => removeLink(si, li)}
                                style={{ padding: "5px 7px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 6, color: "#e11d48", cursor: "pointer", fontSize: 11, flexShrink: 0 }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <AddButton label="Add Link" onClick={() => addLink(si)} />
                </ItemCard>
            ))}
            <AddButton
                label="Add Column"
                onClick={() => onChange({
                    ...data,
                    sections: [...data.sections, { title: "New Column", links: [{ label: "Link", href: "/" }] }],
                })}
            />
        </React.Fragment>
    );
}

/* ─── Definition ─────────────────────────────────────────────────────── */
const footerSection: SectionDefinition<FooterData> = {
    type: "footer",
    label: "Footer",
    icon: "🦶",
    Editor: FooterEditor,
    defaultData: {
        logoText: "Web",
        logoHighlight: "Tools",
        description: "Simple, fast and free web tools for developers, marketers and creators.",
        copyrightName: "WebTools",
        sections: [
            {
                title: "Product",
                links: [
                    { label: "All Tools", href: "/tools" },
                    { label: "Image Tools", href: "/tools/image-tools" },
                    { label: "SEO Tools", href: "/tools/seo-tools" },
                    { label: "AI Tools", href: "/tools/ai-tools" },
                    { label: "Pricing", href: "/pricing" },
                ],
            },
            {
                title: "Company",
                links: [
                    { label: "About", href: "/about" },
                    { label: "Blog", href: "/blog" },
                    { label: "Contact", href: "/contact" },
                ],
            },
            {
                title: "Resources",
                links: [
                    { label: "Docs", href: "/docs" },
                    { label: "Support", href: "/support" },
                    { label: "API Status", href: "/status" },
                ],
            },
            {
                title: "Legal",
                links: [
                    { label: "Privacy Policy", href: "/privacy-policy" },
                    { label: "Terms & Conditions", href: "/terms" },
                ],
            },
        ],
    },
};

export default footerSection;