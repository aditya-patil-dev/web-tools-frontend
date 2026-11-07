"use client";

import { useState } from "react";

interface SeoPreviewCardProps {
    title?: string;
    description?: string;
    slug?: string;
    baseUrl?: string;
    canonicalUrl?: string;
}

export default function SeoPreviewCard({
    title = "",
    description = "",
    slug = "",
    baseUrl = "https://fusiontools.com",
    canonicalUrl,
}: SeoPreviewCardProps) {
    const [previewMode, setPreviewMode] = useState<"desktop" | "mobile" | "social">("desktop");

    const displayTitle = title.trim() || "Page Title Preview — FusionTools";
    const displayDesc =
        description.trim() ||
        "Enter a meta description to see how your page will appear in search engine results and social media shares...";

    const fullUrl = canonicalUrl || `${baseUrl}/${slug.replace(/^\//, "")}`;

    // Character length validation
    const titleLen = title.length;
    const descLen = description.length;

    const titleStatus =
        titleLen === 0
            ? "neutral"
            : titleLen > 60
                ? "danger"
                : titleLen >= 30
                    ? "success"
                    : "warning";

    const descStatus =
        descLen === 0
            ? "neutral"
            : descLen > 160
                ? "danger"
                : descLen >= 70
                    ? "success"
                    : "warning";

    return (
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "16px 20px",
                marginTop: "16px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
        >
            {/* Header & Tabs */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #f1f5f9",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "10px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bi bi-google" style={{ color: "#4285f4", fontSize: "1rem" }} />
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                        Live Search Engine Snippet Preview
                    </span>
                </div>

                {/* Preview Mode Pills */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "#f1f5f9",
                        padding: "3px",
                        borderRadius: "8px",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewMode("desktop")}
                        style={{
                            border: "none",
                            background: previewMode === "desktop" ? "#ffffff" : "transparent",
                            color: previewMode === "desktop" ? "#0f172a" : "#64748b",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: previewMode === "desktop" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        }}
                    >
                        <i className="bi bi-laptop" style={{ marginRight: "4px" }} /> Desktop
                    </button>

                    <button
                        type="button"
                        onClick={() => setPreviewMode("mobile")}
                        style={{
                            border: "none",
                            background: previewMode === "mobile" ? "#ffffff" : "transparent",
                            color: previewMode === "mobile" ? "#0f172a" : "#64748b",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: previewMode === "mobile" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        }}
                    >
                        <i className="bi bi-phone" style={{ marginRight: "4px" }} /> Mobile
                    </button>

                    <button
                        type="button"
                        onClick={() => setPreviewMode("social")}
                        style={{
                            border: "none",
                            background: previewMode === "social" ? "#ffffff" : "transparent",
                            color: previewMode === "social" ? "#0f172a" : "#64748b",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: previewMode === "social" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                        }}
                    >
                        <i className="bi bi-share" style={{ marginRight: "4px" }} /> Social Card
                    </button>
                </div>
            </div>

            {/* Live Snippet Box */}
            <div
                style={{
                    padding: "16px",
                    background: previewMode === "social" ? "#f8fafc" : "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    maxWidth: previewMode === "mobile" ? "380px" : previewMode === "social" ? "520px" : "620px",
                    transition: "max-width 0.2s ease",
                }}
            >
                {previewMode === "social" ? (
                    // Social Media Card (OG Preview)
                    <div
                        style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            overflow: "hidden",
                            background: "#ffffff",
                        }}
                    >
                        <div
                            style={{
                                height: "140px",
                                background: "linear-gradient(135deg, #ff6b35 0%, #ff5722 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                fontWeight: 800,
                                fontSize: "1.25rem",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            FusionTools
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                                fusiontools.com
                            </div>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: "0.875rem",
                                    color: "#0f172a",
                                    margin: "4px 0",
                                    lineHeight: 1.3,
                                }}
                            >
                                {displayTitle}
                            </div>
                            <div
                                style={{
                                    fontSize: "0.78rem",
                                    color: "#64748b",
                                    lineHeight: 1.4,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {displayDesc}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Google SERP Snippet
                    <div style={{ fontFamily: "arial, sans-serif" }}>
                        {/* URL row with favicon */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <div
                                style={{
                                    width: "18px",
                                    height: "18px",
                                    borderRadius: "9999px",
                                    background: "#f1f5f9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                }}
                            >
                                ⚡
                            </div>
                            <div style={{ fontSize: "12px", color: "#202124", lineHeight: "1.2" }}>
                                <span style={{ fontWeight: 600 }}>FusionTools</span>
                                <div style={{ fontSize: "11px", color: "#4d5156" }}>{fullUrl}</div>
                            </div>
                        </div>

                        {/* Title Link */}
                        <div
                            style={{
                                color: "#1a0dab",
                                fontSize: previewMode === "mobile" ? "16px" : "18px",
                                fontWeight: 400,
                                lineHeight: "1.28",
                                cursor: "pointer",
                                wordBreak: "break-word",
                                textDecoration: "none",
                                marginTop: "2px",
                            }}
                        >
                            {titleLen > 65 ? `${displayTitle.slice(0, 62)}...` : displayTitle}
                        </div>

                        {/* Description */}
                        <div
                            style={{
                                color: "#4d5156",
                                fontSize: "13px",
                                lineHeight: "1.45",
                                marginTop: "4px",
                                wordBreak: "break-word",
                            }}
                        >
                            {descLen > 165 ? `${displayDesc.slice(0, 160)}...` : displayDesc}
                        </div>
                    </div>
                )}
            </div>

            {/* Validation Pill Bars */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "12px",
                    paddingTop: "10px",
                    borderTop: "1px solid #f1f5f9",
                    flexWrap: "wrap",
                    fontSize: "0.75rem",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Title Length:</span>
                    <span
                        className={`dtBadge ${titleStatus}`}
                        style={{ fontSize: "11px", padding: "1px 8px" }}
                    >
                        {titleLen} / 60 chars
                        {titleStatus === "danger" ? " (Truncated)" : titleStatus === "success" ? " (Optimal)" : ""}
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Description Length:</span>
                    <span
                        className={`dtBadge ${descStatus}`}
                        style={{ fontSize: "11px", padding: "1px 8px" }}
                    >
                        {descLen} / 160 chars
                        {descStatus === "danger" ? " (Truncated)" : descStatus === "success" ? " (Optimal)" : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}

