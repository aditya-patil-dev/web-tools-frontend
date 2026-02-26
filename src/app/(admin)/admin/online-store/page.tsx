"use client";

/**
 * Online Store page — thin orchestrator.
 *
 * This file only wires the hook + UI components together.
 * All state/logic  → features/online-store/hooks/usePageEditor.ts
 * All API calls    → features/online-store/api/page-components.api.ts
 * All section defs → features/online-store/registry/index.ts
 * All UI pieces    → features/online-store/components/
 */

import { useEffect, useState } from "react";
import { usePageEditor } from "@/features/online-store/hooks/usePageEditor";
import TopBar from "@/features/online-store/components/TopBar";
import Sidebar from "@/features/online-store/components/Sidebar";
import Canvas from "@/features/online-store/components/Canvas";

const PAGE_KEY = "home";

export default function OnlineStorePage() {
    const editor = usePageEditor(PAGE_KEY);

    const [activeDevice, setActiveDevice] = useState("Desktop");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    /* Load sections on mount */
    useEffect(() => { editor.load(); }, []);

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: "#f1f5f9",
            fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
            overflow: "hidden",
        }}>
            <TopBar
                editor={editor}
                activeDevice={activeDevice}
                onDeviceChange={setActiveDevice}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(v => !v)}
            />

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {sidebarOpen && <Sidebar editor={editor} />}

                <Canvas
                    components={editor.components}
                    pending={editor.pending}
                    pageKey={PAGE_KEY}
                    activeDevice={activeDevice}
                />
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
        </div>
    );
}