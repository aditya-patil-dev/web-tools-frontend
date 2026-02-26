"use client";

// src/app/(preview)/preview/[page_key]/PreviewClient.tsx

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ─── Component map ────────────────────────────────────────────────────────────
// Add every public component here. Using dynamic() avoids SSR issues inside
// the iframe and keeps the initial HTML shell tiny.
const COMPONENT_MAP: Record<string, React.ComponentType<{ config?: any }>> = {
    "hero": dynamic(() => import("@/components/public/Hero/Hero")),
    "popular-tools": dynamic(() => import("@/components/public/PopularTools/PopularTools")),
    "why-choose-us": dynamic(() => import("@/components/public/whychooseus/WhyChooseUs")),
    "how-it-works": dynamic(() => import("@/components/public/HowItWorks/HowItWorks")),
    "final-cta": dynamic(() => import("@/components/public/FinalCTA/FinalCTA")),
    "seo-content": dynamic(() => import("@/components/public/SEOContent/SEOContent")),
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface SerializedComponent {
    id: number;
    type: string;
    data: Record<string, unknown>;
    order: number;
    active: boolean;
}

interface PreviewClientProps {
    /** Server-fetched components (used in public/draft mode) */
    components: SerializedComponent[];
    /** Draft overrides decoded from ?draft= query param */
    initialDraft: Record<number, Record<string, unknown>>;
    /** When true, wait for PREVIEW_INIT postMessage from Canvas instead of
     *  using the server-fetched components list */
    editorMode?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PreviewClient({
    components: serverComponents,
    initialDraft,
    editorMode = false,
}: PreviewClientProps) {
    const [components, setComponents] = useState<SerializedComponent[]>(
        editorMode ? [] : serverComponents
    );
    const [draft, setDraft] = useState<Record<number, Record<string, unknown>>>(initialDraft);
    const [ready, setReady] = useState(!editorMode); // in editor mode, wait for postMessage

    useEffect(() => {
        function handleMessage(event: MessageEvent) {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === "PREVIEW_INIT") {
                // Canvas is sending the full component list (with pending merges already applied)
                setComponents(event.data.components ?? []);
                setDraft({}); // Canvas already merged pending, so no extra draft needed
                setReady(true);
            }
        }

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // Loading state while waiting for the first postMessage
    if (!ready) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, sans-serif",
                color: "#94a3b8",
                gap: 10,
            }}>
                <span style={{
                    width: 18, height: 18,
                    border: "2px solid #e2e8f0",
                    borderTopColor: "#6366f1",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                }} />
                <span style={{ fontSize: 14 }}>Loading preview…</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Sort and filter active components
    const active = [...components]
        .filter((c) => c.active)
        .sort((a, b) => a.order - b.order);

    if (active.length === 0) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "system-ui, sans-serif",
                color: "#94a3b8",
                flexDirection: "column",
                gap: 12,
            }}>
                <span style={{ fontSize: 40 }}>🗂️</span>
                <p style={{ margin: 0, fontSize: 15 }}>No active components for this page yet.</p>
                <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1" }}>
                    Toggle the eye icon on sections in the sidebar to show them here.
                </p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#fff" }}>
            {active.map((comp) => {
                const Component = COMPONENT_MAP[comp.type];

                if (!Component) {
                    return (
                        <div key={comp.id} style={{
                            padding: "20px 40px",
                            color: "#ef4444",
                            fontFamily: "monospace",
                            background: "#fff5f5",
                            borderLeft: "4px solid #ef4444",
                            margin: "8px 0",
                        }}>
                            ⚠️ Unknown component type: <strong>{comp.type}</strong>
                        </div>
                    );
                }

                // In public mode, apply draft overrides if any
                const config = draft[comp.id]
                    ? { ...comp.data, ...draft[comp.id] }
                    : comp.data;

                return <Component key={comp.id} config={config} />;
            })}
        </div>
    );
}