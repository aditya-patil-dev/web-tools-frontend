"use client";

import { useState } from "react";
import {
    ChevronDown, Eye, EyeOff, Copy, Trash2,
    Loader2, Save, ArrowUp, ArrowDown,
} from "lucide-react";
import { PageComponent } from "../registry/types";
import { getSectionIcon, getSectionDef } from "../registry";
import { PageEditorState } from "../hooks/usePageEditor";

interface SectionRowProps {
    comp: PageComponent;
    idx: number;
    total: number;
    editor: PageEditorState;
    /** Whether this row's field panel is open */
    expanded: boolean;
    onToggle: () => void;
    /** Request deletion (parent shows confirm modal) */
    onDeleteRequest: (id: number, name: string) => void;
}

export default function SectionRow({
    comp, idx, total, editor, expanded, onToggle, onDeleteRequest,
}: SectionRowProps) {
    const liveData = editor.getLiveData(comp.id);
    const isDirty = editor.pending.has(comp.id);
    const isSaving = editor.savingId === comp.id;
    const isDeleting = editor.deletingId === comp.id;
    const isDuping = editor.duplicatingId === comp.id;

    const def = getSectionDef(comp.component_type);

    return (
        <div style={{
            marginBottom: 4,
            border: `1.5px solid ${expanded ? "rgba(255,107,53,.35)" : "#f1f5f9"}`,
            borderRadius: 11,
            background: expanded ? "#fff9f7" : "#fff",
            overflow: "hidden",
            opacity: comp.is_active ? 1 : 0.55,
            transition: "all .15s",
        }}>
            {/* ── Row header ── */}
            <div
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 7px 9px 5px", cursor: "pointer" }}
                onClick={onToggle}
            >
                {/* Move up / down */}
                <div style={{ display: "flex", flexDirection: "column", gap: 0, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => editor.moveSection(comp.id, "up")}
                        disabled={idx === 0}
                        style={{ padding: "1px 3px", background: "none", border: "none", cursor: idx === 0 ? "not-allowed" : "pointer", color: idx === 0 ? "#e2e8f0" : "#94a3b8", lineHeight: 1, display: "flex" }}
                    >
                        <ArrowUp size={10} />
                    </button>
                    <button
                        onClick={() => editor.moveSection(comp.id, "down")}
                        disabled={idx === total - 1}
                        style={{ padding: "1px 3px", background: "none", border: "none", cursor: idx === total - 1 ? "not-allowed" : "pointer", color: idx === total - 1 ? "#e2e8f0" : "#94a3b8", lineHeight: 1, display: "flex" }}
                    >
                        <ArrowDown size={10} />
                    </button>
                </div>

                <span style={{ fontSize: 17, flexShrink: 0 }}>{getSectionIcon(comp.component_type)}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: expanded ? "#ff6b35" : "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {comp.component_name}
                        </span>
                        {isDirty && (
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b35", flexShrink: 0 }} title="Unsaved changes" />
                        )}
                    </div>
                    <span style={{ fontSize: 10.5, color: "#94a3b8" }}>{comp.component_type}</span>
                </div>

                {/* Quick actions */}
                <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => editor.toggleVisibility(comp.id)}
                        title={comp.is_active ? "Hide section" : "Show section"}
                        style={{ padding: "5px", background: "none", border: "none", cursor: "pointer", color: comp.is_active ? "#10b981" : "#94a3b8", display: "flex" }}
                    >
                        {comp.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                        onClick={() => editor.duplicate(comp.id)}
                        disabled={isDuping}
                        title="Duplicate"
                        style={{ padding: "5px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
                    >
                        {isDuping ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Copy size={12} />}
                    </button>
                    <button
                        onClick={() => onDeleteRequest(comp.id, comp.component_name)}
                        disabled={isDeleting}
                        title="Delete"
                        style={{ padding: "5px", background: "none", border: "none", cursor: "pointer", color: "#f87171", display: "flex" }}
                    >
                        {isDeleting ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={12} />}
                    </button>
                </div>

                <ChevronDown
                    size={12} color="#94a3b8"
                    style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", flexShrink: 0 }}
                />
            </div>

            {/* ── Expanded field editor ── */}
            {expanded && def && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "13px 11px 10px" }}>
                    <def.Editor
                        data={liveData}
                        onChange={data => editor.onFieldChange(comp.id, data)}
                    />

                    {isDirty && (
                        <>
                            <button
                                onClick={() => editor.saveOne(comp.id)}
                                disabled={isSaving}
                                style={{
                                    width: "100%", marginTop: 12, padding: "10px 0",
                                    background: "linear-gradient(135deg,#ff6b35,#ff5722)",
                                    border: "none", borderRadius: 9, color: "#fff",
                                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    boxShadow: "0 4px 12px rgba(255,107,53,.28)",
                                }}
                            >
                                {isSaving
                                    ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
                                    : <><Save size={12} /> Save Section</>}
                            </button>
                            <button
                                onClick={() => editor.discardChanges(comp.id)}
                                style={{
                                    width: "100%", marginTop: 5, padding: "8px 0",
                                    background: "none", border: "1px solid #e2e8f0",
                                    borderRadius: 9, color: "#64748b", fontWeight: 600,
                                    fontSize: 12.5, cursor: "pointer",
                                }}
                            >
                                Discard Changes
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Unknown section type warning */}
            {expanded && !def && (
                <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px", fontSize: 12, color: "#94a3b8" }}>
                    No editor registered for type &quot;{comp.component_type}&quot;
                </div>
            )}
        </div>
    );
}