"use client";

import { useRouter } from "next/navigation";
import { Monitor, Tablet, Smartphone, Save, Layout, RefreshCw, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { PageEditorState } from "../hooks/usePageEditor";

const DEVICES = [
    { gjs: "Desktop", label: "Desktop", Icon: Monitor },
    { gjs: "Tablet", label: "Tablet", Icon: Tablet },
    { gjs: "Mobile portrait", label: "Mobile", Icon: Smartphone },
];

interface TopBarProps {
    editor: PageEditorState;
    activeDevice: string;
    onDeviceChange: (device: string) => void;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
}

export default function TopBar({
    editor, activeDevice, onDeviceChange, sidebarOpen, onToggleSidebar,
}: TopBarProps) {
    const router = useRouter();

    return (
        <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 18px", height: 54, background: "#fff",
            borderBottom: "1px solid #e2e8f0", flexShrink: 0,
            boxShadow: "0 1px 4px rgba(0,0,0,.05)",
        }}>
            {/* ── Left ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                {/* Back button */}
                <button
                    onClick={() => router.push("/admin/settings/online-store")}
                    title="Back to Online Store settings"
                    style={{
                        padding: "6px 8px",
                        background: "transparent",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        transition: "all .15s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#f8fafc";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#cbd5e1";
                        (e.currentTarget as HTMLButtonElement).style.color = "#0f172a";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0";
                        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                    }}
                >
                    <ArrowLeft size={15} />
                </button>

                {/* Divider */}
                <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />

                {/* Sidebar toggle */}
                <button
                    onClick={onToggleSidebar}
                    title="Toggle sidebar"
                    style={{
                        padding: "6px 8px",
                        background: sidebarOpen ? "#fff7f4" : "transparent",
                        border: "1px solid", borderColor: sidebarOpen ? "rgba(255,107,53,.35)" : "#e2e8f0",
                        borderRadius: 8, cursor: "pointer",
                        color: sidebarOpen ? "#ff6b35" : "#64748b",
                        display: "flex", alignItems: "center",
                    }}
                >
                    <Layout size={15} />
                </button>

                {/* Breadcrumb */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 12.5, color: "#94a3b8" }}>Online Store</span>
                    <ChevronRight size={12} color="#cbd5e1" />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Home Page</span>
                </div>

                {/* Unsaved badge */}
                {editor.hasPending && (
                    <span style={{
                        background: "#fff7ed", color: "#ff6b35",
                        border: "1.5px solid rgba(255,107,53,.25)",
                        padding: "2px 10px", borderRadius: 9999,
                        fontSize: 11.5, fontWeight: 700,
                    }}>
                        {editor.pendingCount} unsaved
                    </span>
                )}
            </div>

            {/* ── Center — device switcher ── */}
            <div style={{ display: "flex", gap: 2, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
                {DEVICES.map(({ gjs, label, Icon }) => (
                    <button
                        key={gjs}
                        onClick={() => onDeviceChange(gjs)}
                        title={label}
                        style={{
                            padding: "6px 11px",
                            background: activeDevice === gjs ? "#fff" : "transparent",
                            border: "none", borderRadius: 7, cursor: "pointer",
                            color: activeDevice === gjs ? "#ff6b35" : "#64748b",
                            boxShadow: activeDevice === gjs ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                            display: "flex", alignItems: "center", transition: "all .15s",
                        }}
                    >
                        <Icon size={15} />
                    </button>
                ))}
            </div>

            {/* ── Right ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                    onClick={editor.load}
                    title="Reload from server (discards unsaved changes)"
                    style={{
                        padding: "7px 9px", background: "#f8fafc",
                        border: "1px solid #e2e8f0", borderRadius: 8,
                        cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center",
                    }}
                >
                    <RefreshCw size={13} />
                </button>

                <button
                    onClick={editor.saveAll}
                    disabled={editor.savingAll || !editor.hasPending}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 20px",
                        background: editor.hasPending
                            ? "linear-gradient(135deg,#ff6b35,#ff5722)"
                            : "#e2e8f0",
                        border: "none", borderRadius: 9,
                        cursor: editor.hasPending ? "pointer" : "not-allowed",
                        color: editor.hasPending ? "#fff" : "#94a3b8",
                        fontWeight: 700, fontSize: 13,
                        boxShadow: editor.hasPending ? "0 4px 14px rgba(255,107,53,.32)" : "none",
                        transition: "all .2s",
                    }}
                >
                    {editor.savingAll
                        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                        : <Save size={13} />}
                    {editor.savingAll ? "Saving…" : "Save All"}
                </button>
            </div>
        </header>
    );
}