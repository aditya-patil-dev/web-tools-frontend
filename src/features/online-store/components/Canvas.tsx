"use client";

import { useEffect, useRef } from "react";
import { PageComponent } from "../registry/types";

interface CanvasProps {
    components: PageComponent[];
    pending: Map<number, Record<string, unknown>>;
    pageKey: string;
    activeDevice: string;
}

export default function Canvas({ components, pending, pageKey, activeDevice }: CanvasProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ?mode=editor tells the preview page to wait for postMessage data
    // instead of fetching from the API
    const baseUrl = `/preview/${pageKey}?mode=editor`;

    const pushToIframe = () => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;

        // Merge pending (unsaved) edits into each component's data
        const payload = components.map((comp) => {
            const override = pending.get(comp.id);
            return {
                id: comp.id,
                type: comp.component_type,
                data: override
                    ? { ...comp.component_data, ...override }
                    : comp.component_data,
                order: comp.component_order,
                active: comp.is_active,
            };
        });

        iframe.contentWindow.postMessage(
            { type: "PREVIEW_INIT", components: payload },
            window.location.origin
        );
    };

    // Re-push whenever components list or pending edits change
    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        if (iframe.contentDocument?.readyState === "complete") {
            pushToIframe();
        } else {
            iframe.addEventListener("load", pushToIframe, { once: true });
            return () => iframe.removeEventListener("load", pushToIframe);
        }
    }, [components, pending]); // eslint-disable-line react-hooks/exhaustive-deps

    const deviceWidth: Record<string, string> = {
        "Desktop": "100%",
        "Tablet": "768px",
        "Mobile portrait": "375px",
    };
    const width = deviceWidth[activeDevice] ?? "100%";
    const isNarrow = activeDevice !== "Desktop";

    return (
        <main style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            overflow: "hidden",
            background: "#dde3ec",
        }}>
            <div style={{
                padding: "5px 16px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                flexShrink: 0,
            }}>
                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    ✦ Live preview using your real components — edits appear instantly
                </span>
                {isNarrow && (
                    <span style={{ fontSize: 11.5, color: "#ff6b35", fontWeight: 700 }}>
                        ● {activeDevice}
                    </span>
                )}
            </div>

            <div style={{
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                padding: isNarrow ? "16px" : "0",
            }}>
                <div style={{
                    width,
                    minWidth: isNarrow ? width : undefined,
                    maxWidth: width,
                    height: "100%",
                    minHeight: isNarrow ? "600px" : "100%",
                    background: "#fff",
                    boxShadow: isNarrow ? "0 8px 40px rgba(0,0,0,.15)" : "none",
                    borderRadius: isNarrow ? 12 : 0,
                    overflow: "hidden",
                    transition: "width .35s ease",
                }}>
                    <iframe
                        ref={iframeRef}
                        src={baseUrl}
                        style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            display: "block",
                        }}
                        title="Page preview"
                    />
                </div>
            </div>
        </main>
    );
}