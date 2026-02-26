"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { PageEditorState } from "../hooks/usePageEditor";
import SectionRow from "./SectionRow";

interface SidebarProps {
    editor: PageEditorState;
}

export default function Sidebar({ editor }: SidebarProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [confirmDel, setConfirmDel] = useState<{ id: number; name: string } | null>(null);

    const handleDeleteRequest = (id: number, name: string) => {
        setConfirmDel({ id, name });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDel) return;
        if (expandedId === confirmDel.id) setExpandedId(null);
        await editor.deleteSection(confirmDel.id);
        setConfirmDel(null);
    };

    return (
        <>
            {/* ── Delete confirm modal ── */}
            {confirmDel && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(15,23,42,.6)",
                    zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)",
                }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: "28px 30px", width: 350, boxShadow: "0 24px 60px rgba(0,0,0,.22)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 13 }}>
                            <AlertCircle size={21} color="#ef4444" />
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Delete section?</h3>
                        </div>
                        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#64748b", lineHeight: 1.6 }}>
                            <strong style={{ color: "#0f172a" }}>"{confirmDel.name}"</strong> will be permanently deleted and cannot be recovered.
                        </p>
                        <div style={{ display: "flex", gap: 9 }}>
                            <button
                                onClick={() => setConfirmDel(null)}
                                style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: "#64748b", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{ flex: 1, padding: "10px", background: "#ef4444", border: "none", borderRadius: 9, fontSize: 13.5, fontWeight: 700, color: "#fff", cursor: "pointer" }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sidebar shell ── */}
            <aside style={{
                width: 295, background: "#fff", borderRight: "1px solid #e2e8f0",
                display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden",
            }}>
                {/* Header */}
                <div style={{ padding: "12px 13px 10px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".06em" }}>
                            Page Sections
                        </h2>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>Click a section to edit</p>
                    </div>
                    <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 9999 }}>
                        {editor.components.length}
                    </span>
                </div>

                {/* Section list */}
                <div style={{ flex: 1, overflowY: "auto", padding: "7px" }}>
                    {editor.loading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 48, color: "#94a3b8" }}>
                            <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                            <span style={{ fontSize: 13 }}>Loading sections…</span>
                        </div>
                    ) : editor.components.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>
                            No sections found for this page
                        </div>
                    ) : (
                        editor.components.map((comp, idx) => (
                            <SectionRow
                                key={comp.id}
                                comp={comp}
                                idx={idx}
                                total={editor.components.length}
                                editor={editor}
                                expanded={expandedId === comp.id}
                                onToggle={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                                onDeleteRequest={handleDeleteRequest}
                            />
                        ))
                    )}
                </div>

                {/* Footer hint */}
                <div style={{ padding: "9px 13px", borderTop: "1px solid #f1f5f9", background: "#fafafa" }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
                        Edits preview instantly · Save to persist to DB
                    </p>
                </div>
            </aside>
        </>
    );
}