"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSearch, FiCheckCircle, FiAlertCircle, FiXCircle,
    FiRefreshCw, FiGlobe, FiImage, FiExternalLink,
    FiCopy, FiCode, FiClock, FiCheck, FiChevronRight,
    FiShield, FiZap,
} from "react-icons/fi";
import { api } from "@/lib/api/api";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface OGTag {
    property: string;
    content: string;
    status: "found" | "missing" | "warning";
}

interface ValidationResult {
    title: OGTag | null;
    description: OGTag | null;
    image: OGTag | null;
    url: OGTag | null;
    type: OGTag | null;
    siteName: OGTag | null;
    locale: OGTag | null;
    twitterCard: OGTag | null;
    twitterTitle: OGTag | null;
    twitterDescription: OGTag | null;
    twitterImage: OGTag | null;
    twitterSite: OGTag | null;
}

interface CheckResult {
    url: string;
    status: "success" | "error" | "loading";
    validationResult: ValidationResult | null;
    metaTitle: string;
    metaDescription: string;
    faviconUrl: string;
    errorMessage?: string;
    issues: string[];
    warnings: string[];
    suggestions: string[];
    score: number;
}

type TabId = "overview" | "details" | "preview";

/* ─────────────────────────────────────────
   Animated Score Counter
───────────────────────────────────────── */
const AnimatedScore = ({ target }: { target: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 1200;
        const step = 16;
        const increment = target / (duration / step);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) { setDisplay(target); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, step);
        return () => clearInterval(timer);
    }, [target]);
    return <>{display}</>;
};

/* ─────────────────────────────────────────
   Score ring colour
───────────────────────────────────────── */
const scoreColor = (s: number) =>
    s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";

const scoreLabel = (s: number) =>
    s >= 80 ? "Excellent" : s >= 60 ? "Needs Work" : "Poor";

/* ─────────────────────────────────────────
   Tag Coverage Grid item
───────────────────────────────────────── */
const TagPill = ({ label, status }: { label: string; status: "found" | "missing" | "warning" }) => (
    <div className={`ogc-tag-pill ogc-tag-pill--${status}`}>
        {status === "found" ? <FiCheck /> : status === "warning" ? <FiAlertCircle /> : <FiXCircle />}
        <span>{label}</span>
    </div>
);

/* ─────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────── */
const SkeletonLoader = () => (
    <div className="ogc-skeleton">
        <div className="ogc-skeleton-score">
            <div className="ogc-skel ogc-skel--circle" />
            <div className="ogc-skeleton-score-right">
                <div className="ogc-skel ogc-skel--line" style={{ width: "60%" }} />
                <div className="ogc-skel ogc-skel--line" style={{ width: "40%", marginTop: 8 }} />
                <div className="ogc-skel ogc-skel--pill" style={{ marginTop: 16 }} />
            </div>
        </div>
        <div className="ogc-skeleton-tabs">
            {[1, 2, 3].map(i => <div key={i} className="ogc-skel ogc-skel--tab" />)}
        </div>
        <div className="ogc-skeleton-rows">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="ogc-skel ogc-skel--row" style={{ width: `${85 - i * 5}%` }} />
            ))}
        </div>
    </div>
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const OpenGraphCheckerTool = () => {
    const [url, setUrl] = useState("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [copiedTag, setCopiedTag] = useState<string | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);
    const [recentUrls, setRecentUrls] = useState<string[]>([]);
    const [showRecent, setShowRecent] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    /* Load recent URLs from localStorage */
    useEffect(() => {
        try {
            const stored = localStorage.getItem("ogc_recent");
            if (stored) setRecentUrls(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    /* Keyboard shortcuts */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") { setUrl(""); inputRef.current?.focus(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    /* Save recent URL */
    const saveRecent = (u: string) => {
        const next = [u, ...recentUrls.filter(r => r !== u)].slice(0, 5);
        setRecentUrls(next);
        try { localStorage.setItem("ogc_recent", JSON.stringify(next)); } catch { /* ignore */ }
    };

    /* ── Check OG Tags ── */
    const checkOpenGraphTags = async () => {
        if (!url.trim()) return;
        try { new URL(url); } catch {
            setResult({
                url, status: "error", validationResult: null,
                metaTitle: "", metaDescription: "", faviconUrl: "",
                errorMessage: "Invalid URL — please enter a valid URL starting with https://",
                issues: [], warnings: [], suggestions: [], score: 0,
            });
            return;
        }

        setChecking(true);
        setResult({ url, status: "loading", validationResult: null, metaTitle: "", metaDescription: "", faviconUrl: "", issues: [], warnings: [], suggestions: [], score: 0 });
        setActiveTab("overview");

        try {
            const json = await api.post<{ success: boolean; message?: string; data: CheckResult }>(
                "/tools/og-check",
                { url },
            );

            if (!json.success) {
                setResult({
                    url, status: "error", validationResult: null,
                    metaTitle: "", metaDescription: "", faviconUrl: "",
                    errorMessage: json.message || "Failed to check OG tags",
                    issues: [], warnings: [], suggestions: [], score: 0,
                });
            } else {
                setResult({ ...json.data, status: "success" });
                saveRecent(url);
            }
        } catch (err: any) {
            // AxiosError — extract backend message if present
            const message =
                err?.response?.data?.message ||
                "Network error — could not reach the server";
            setResult({
                url, status: "error", validationResult: null,
                metaTitle: "", metaDescription: "", faviconUrl: "",
                errorMessage: message,
                issues: [], warnings: [], suggestions: [], score: 0,
            });
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); checkOpenGraphTags(); };
    const handleClear = () => { setUrl(""); setResult(null); };

    /* ── Copy helpers ── */
    const copyTag = (tag: OGTag) => {
        const html = `<meta property="${tag.property}" content="${tag.content}">`;
        navigator.clipboard.writeText(html);
        setCopiedTag(tag.property);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const copyAllTags = () => {
        if (!result?.validationResult) return;
        const tags = Object.values(result.validationResult)
            .filter((t): t is OGTag => !!t && t.status === "found")
            .map(t => `  <meta property="${t.property}" content="${t.content}">`)
            .join("\n");
        navigator.clipboard.writeText(`<!-- Open Graph Tags -->\n${tags}`);
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2500);
    };

    /* ── Tag coverage data ── */
    const tagCoverage = result?.validationResult ? [
        { label: "og:title", status: result.validationResult.title?.status ?? "missing" },
        { label: "og:description", status: result.validationResult.description?.status ?? "missing" },
        { label: "og:image", status: result.validationResult.image?.status ?? "missing" },
        { label: "og:url", status: result.validationResult.url?.status ?? "missing" },
        { label: "og:type", status: result.validationResult.type?.status ?? "missing" },
        { label: "og:site_name", status: result.validationResult.siteName?.status ?? "missing" },
        { label: "og:locale", status: result.validationResult.locale?.status ?? "missing" },
        { label: "twitter:card", status: result.validationResult.twitterCard?.status ?? "missing" },
        { label: "twitter:title", status: result.validationResult.twitterTitle?.status ?? "missing" },
        { label: "twitter:desc", status: result.validationResult.twitterDescription?.status ?? "missing" },
        { label: "twitter:image", status: result.validationResult.twitterImage?.status ?? "missing" },
        { label: "twitter:site", status: result.validationResult.twitterSite?.status ?? "missing" },
    ] as { label: string; status: "found" | "missing" | "warning" }[] : [];

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="ogc-root">

                {/* ── URL Input ── */}
                <div className="ogc-input-card">
                    <form onSubmit={handleSubmit} className="ogc-form">
                        <div className="ogc-input-row">
                            <div className="ogc-input-wrap">
                                <FiGlobe className="ogc-input-icon" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="ogc-input"
                                    placeholder="https://yourwebsite.com"
                                    value={url}
                                    onChange={e => { setUrl(e.target.value); setShowRecent(true); }}
                                    onFocus={() => setShowRecent(true)}
                                    onBlur={() => setTimeout(() => setShowRecent(false), 150)}
                                    disabled={checking}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                                {url && !checking && (
                                    <button type="button" className="ogc-input-clear" onClick={() => setUrl("")} title="Clear (Esc)">
                                        <FiXCircle />
                                    </button>
                                )}

                                {/* Recent URLs dropdown */}
                                <AnimatePresence>
                                    {showRecent && recentUrls.length > 0 && !checking && (
                                        <motion.div
                                            className="ogc-recent-dropdown"
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <p className="ogc-recent-label"><FiClock /> Recent</p>
                                            {recentUrls.map(u => (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    className="ogc-recent-item"
                                                    onMouseDown={() => { setUrl(u); setShowRecent(false); }}
                                                >
                                                    <FiChevronRight className="ogc-recent-arrow" />
                                                    <span>{u}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                type="submit"
                                className="ogc-btn-check"
                                disabled={!url.trim() || checking}
                            >
                                {checking ? (
                                    <><span className="ogc-spinner" /> Checking…</>
                                ) : (
                                    <><FiSearch /> Analyze</>
                                )}
                            </button>
                        </div>

                        <div className="ogc-form-footer">
                            <button type="button" className="ogc-btn-ghost" onClick={() => { setUrl("https://www.bbc.com"); }}>
                                <FiZap /> Try a sample
                            </button>
                            {result && !checking && (
                                <button type="button" className="ogc-btn-ghost ogc-btn-ghost--danger" onClick={handleClear}>
                                    <FiRefreshCw /> Clear results
                                </button>
                            )}
                            <span className="ogc-hint">Press <kbd>Enter</kbd> to check · <kbd>Esc</kbd> to clear</span>
                        </div>
                    </form>
                </div>

                {/* ── Results ── */}
                <AnimatePresence mode="wait">
                    {result && (
                        <motion.div
                            key="results"
                            className="ogc-results"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.35 }}
                        >
                            {/* Error */}
                            {result.status === "error" && (
                                <div className="ogc-error-card">
                                    <div className="ogc-error-icon-wrap">
                                        <FiXCircle />
                                    </div>
                                    <div>
                                        <h3>Couldn&apos;t fetch this URL</h3>
                                        <p>{result.errorMessage}</p>
                                    </div>
                                </div>
                            )}

                            {/* Skeleton loading */}
                            {result.status === "loading" && <SkeletonLoader />}

                            {/* Success */}
                            {result.status === "success" && result.validationResult && (
                                <>
                                    {/* ── Score Hero ── */}
                                    <div className="ogc-score-hero">
                                        {/* Ring */}
                                        <div className="ogc-ring-wrap">
                                            <svg viewBox="0 0 120 120" className="ogc-ring-svg">
                                                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                                <circle
                                                    cx="60" cy="60" r="50" fill="none"
                                                    stroke={scoreColor(result.score)}
                                                    strokeWidth="10"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(result.score / 100) * 314.159} 314.159`}
                                                    transform="rotate(-90 60 60)"
                                                    className="ogc-ring-progress"
                                                />
                                            </svg>
                                            <div className="ogc-ring-center">
                                                <span className="ogc-ring-num" style={{ color: scoreColor(result.score) }}>
                                                    <AnimatedScore target={result.score} />
                                                </span>
                                                <span className="ogc-ring-denom">/100</span>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="ogc-score-detail">
                                            <div className="ogc-score-badge" style={{ background: `${scoreColor(result.score)}22`, color: scoreColor(result.score), borderColor: `${scoreColor(result.score)}44` }}>
                                                <FiShield /> {scoreLabel(result.score)}
                                            </div>

                                            <h3 className="ogc-score-title">Open Graph Analysis</h3>

                                            <a
                                                href={result.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ogc-score-url"
                                            >
                                                {result.faviconUrl && (
                                                    <img src={result.faviconUrl} alt="" className="ogc-favicon" onError={e => (e.currentTarget.style.display = "none")} />
                                                )}
                                                <span>{result.url}</span>
                                                <FiExternalLink />
                                            </a>

                                            {result.metaTitle && (
                                                <p className="ogc-score-meta-title">&quot;{result.metaTitle}&quot;</p>
                                            )}

                                            {/* Summary pills */}
                                            <div className="ogc-summary-pills">
                                                {result.issues.length === 0 ? (
                                                    <span className="ogc-pill ogc-pill--success"><FiCheckCircle /> All required tags found</span>
                                                ) : (
                                                    <span className="ogc-pill ogc-pill--error"><FiXCircle /> {result.issues.length} critical issue{result.issues.length > 1 ? "s" : ""}</span>
                                                )}
                                                {result.warnings.length > 0 && (
                                                    <span className="ogc-pill ogc-pill--warn"><FiAlertCircle /> {result.warnings.length} warning{result.warnings.length > 1 ? "s" : ""}</span>
                                                )}
                                                {result.suggestions.length > 0 && (
                                                    <span className="ogc-pill ogc-pill--info"><FiCode /> {result.suggestions.length} suggestion{result.suggestions.length > 1 ? "s" : ""}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Tag Coverage Grid ── */}
                                    <div className="ogc-coverage">
                                        <p className="ogc-coverage-title">Tag Coverage</p>
                                        <div className="ogc-coverage-grid">
                                            {tagCoverage.map(t => (
                                                <TagPill key={t.label} label={t.label} status={t.status} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Tabs ── */}
                                    <div className="ogc-tabs">
                                        {(["overview", "details", "preview"] as TabId[]).map(tab => (
                                            <button
                                                key={tab}
                                                type="button"
                                                className={`ogc-tab${activeTab === tab ? " ogc-tab--active" : ""}`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab === "overview" && <FiCheckCircle />}
                                                {tab === "details" && <FiCode />}
                                                {tab === "preview" && <FiImage />}
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ── Tab Content ── */}
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.2 }}
                                            className="ogc-tab-body"
                                        >
                                            {/* ── OVERVIEW ── */}
                                            {activeTab === "overview" && (
                                                <div className="ogc-overview">
                                                    {result.issues.length === 0 && result.warnings.length === 0 && result.suggestions.length === 0 ? (
                                                        <div className="ogc-perfect">
                                                            <div className="ogc-perfect-icon"><FiCheckCircle /></div>
                                                            <h4>Perfect implementation!</h4>
                                                            <p>All Open Graph tags are properly configured. Your content will look great across every social platform.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {result.issues.length > 0 && (
                                                                <div className="ogc-section ogc-section--error">
                                                                    <h4 className="ogc-section-title">
                                                                        <FiXCircle /> Critical Issues
                                                                        <span className="ogc-section-count">{result.issues.length}</span>
                                                                    </h4>
                                                                    <ul className="ogc-list">
                                                                        {result.issues.map((issue, i) => (
                                                                            <li key={i} className="ogc-list-item ogc-list-item--error">{issue}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {result.warnings.length > 0 && (
                                                                <div className="ogc-section ogc-section--warn">
                                                                    <h4 className="ogc-section-title">
                                                                        <FiAlertCircle /> Warnings
                                                                        <span className="ogc-section-count">{result.warnings.length}</span>
                                                                    </h4>
                                                                    <ul className="ogc-list">
                                                                        {result.warnings.map((w, i) => (
                                                                            <li key={i} className="ogc-list-item ogc-list-item--warn">{w}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {result.suggestions.length > 0 && (
                                                                <div className="ogc-section ogc-section--info">
                                                                    <h4 className="ogc-section-title">
                                                                        <FiCode /> Suggestions
                                                                        <span className="ogc-section-count">{result.suggestions.length}</span>
                                                                    </h4>
                                                                    <ul className="ogc-list">
                                                                        {result.suggestions.map((s, i) => (
                                                                            <li key={i} className="ogc-list-item ogc-list-item--info">{s}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* ── DETAILS ── */}
                                            {activeTab === "details" && (
                                                <div className="ogc-details">
                                                    {/* Copy all button */}
                                                    <div className="ogc-details-header">
                                                        <p className="ogc-details-hint">
                                                            {Object.values(result.validationResult).filter(t => t?.status === "found").length} tags found
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className={`ogc-btn-copy-all${copiedAll ? " ogc-btn-copy-all--done" : ""}`}
                                                            onClick={copyAllTags}
                                                        >
                                                            {copiedAll ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy all tags</>}
                                                        </button>
                                                    </div>

                                                    {/* Basic meta */}
                                                    <div className="ogc-tag-group">
                                                        <p className="ogc-tag-group-title">Basic Meta</p>
                                                        <TagRow
                                                            icon="✦"
                                                            label="title"
                                                            property="title"
                                                            content={result.metaTitle}
                                                            status="found"
                                                            onCopy={() => navigator.clipboard.writeText(`<title>${result.metaTitle}</title>`)}
                                                            copied={copiedTag === "title"}
                                                        />
                                                        <TagRow
                                                            icon="✦"
                                                            label="description"
                                                            property="description"
                                                            content={result.metaDescription}
                                                            status={result.metaDescription ? "found" : "missing"}
                                                            onCopy={() => navigator.clipboard.writeText(`<meta name="description" content="${result.metaDescription}">`)}
                                                            copied={copiedTag === "description"}
                                                        />
                                                    </div>

                                                    {/* OG tags */}
                                                    <div className="ogc-tag-group">
                                                        <p className="ogc-tag-group-title ogc-tag-group-title--og">Open Graph</p>
                                                        {[
                                                            result.validationResult.title,
                                                            result.validationResult.description,
                                                            result.validationResult.image,
                                                            result.validationResult.url,
                                                            result.validationResult.type,
                                                            result.validationResult.siteName,
                                                            result.validationResult.locale,
                                                        ].filter(Boolean).map(tag => tag && (
                                                            <TagRow
                                                                key={tag.property}
                                                                icon="⬡"
                                                                label={tag.property}
                                                                property={tag.property}
                                                                content={tag.content}
                                                                status={tag.status}
                                                                onCopy={() => copyTag(tag)}
                                                                copied={copiedTag === tag.property}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Twitter tags */}
                                                    <div className="ogc-tag-group">
                                                        <p className="ogc-tag-group-title ogc-tag-group-title--tw">Twitter / X</p>
                                                        {[
                                                            result.validationResult.twitterCard,
                                                            result.validationResult.twitterTitle,
                                                            result.validationResult.twitterDescription,
                                                            result.validationResult.twitterImage,
                                                            result.validationResult.twitterSite,
                                                        ].filter(Boolean).map(tag => tag && (
                                                            <TagRow
                                                                key={tag.property}
                                                                icon="✕"
                                                                label={tag.property}
                                                                property={tag.property}
                                                                content={tag.content}
                                                                status={tag.status}
                                                                onCopy={() => copyTag(tag)}
                                                                copied={copiedTag === tag.property}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── PREVIEW ── */}
                                            {activeTab === "preview" && (
                                                <div className="ogc-previews">

                                                    {/* Facebook */}
                                                    <div className="ogc-preview-block">
                                                        <div className="ogc-preview-label ogc-preview-label--fb">
                                                            <span className="ogc-preview-platform-dot ogc-preview-platform-dot--fb" />
                                                            Facebook
                                                        </div>
                                                        <div className="ogc-fb-card">
                                                            <div className="ogc-fb-image">
                                                                {result.validationResult.image?.content ? (
                                                                    <img src={result.validationResult.image.content} alt="og:image preview" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement!.querySelector(".ogc-img-fallback") as HTMLElement).style.display = "flex"; }} />
                                                                ) : null}
                                                                <div className="ogc-img-fallback" style={{ display: result.validationResult.image?.content ? "none" : "flex" }}>
                                                                    <FiImage /><span>No og:image set</span>
                                                                </div>
                                                            </div>
                                                            <div className="ogc-fb-body">
                                                                <span className="ogc-fb-domain">{safeHostname(result.url)}</span>
                                                                <p className="ogc-fb-title">{result.validationResult.title?.content || result.metaTitle || "No title"}</p>
                                                                <p className="ogc-fb-desc">{result.validationResult.description?.content || result.metaDescription || ""}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Twitter / X */}
                                                    <div className="ogc-preview-block">
                                                        <div className="ogc-preview-label ogc-preview-label--tw">
                                                            <span className="ogc-preview-platform-dot ogc-preview-platform-dot--tw" />
                                                            Twitter / X
                                                        </div>
                                                        <div className="ogc-tw-card">
                                                            <div className="ogc-tw-image">
                                                                {(result.validationResult.twitterImage?.content || result.validationResult.image?.content) ? (
                                                                    <img
                                                                        src={result.validationResult.twitterImage?.content || result.validationResult.image?.content}
                                                                        alt="twitter:image preview"
                                                                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement!.querySelector(".ogc-img-fallback") as HTMLElement).style.display = "flex"; }}
                                                                    />
                                                                ) : null}
                                                                <div className="ogc-img-fallback" style={{ display: (result.validationResult.twitterImage?.content || result.validationResult.image?.content) ? "none" : "flex" }}>
                                                                    <FiImage /><span>No image</span>
                                                                </div>
                                                            </div>
                                                            <div className="ogc-tw-body">
                                                                <p className="ogc-tw-title">{result.validationResult.twitterTitle?.content || result.validationResult.title?.content || result.metaTitle || "No title"}</p>
                                                                <p className="ogc-tw-desc">{result.validationResult.twitterDescription?.content || result.validationResult.description?.content || ""}</p>
                                                                <span className="ogc-tw-domain"><FiGlobe />{safeHostname(result.url)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* LinkedIn */}
                                                    <div className="ogc-preview-block">
                                                        <div className="ogc-preview-label ogc-preview-label--li">
                                                            <span className="ogc-preview-platform-dot ogc-preview-platform-dot--li" />
                                                            LinkedIn
                                                        </div>
                                                        <div className="ogc-li-card">
                                                            <div className="ogc-li-image">
                                                                {result.validationResult.image?.content ? (
                                                                    <img src={result.validationResult.image.content} alt="LinkedIn preview" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.parentElement!.querySelector(".ogc-img-fallback") as HTMLElement).style.display = "flex"; }} />
                                                                ) : null}
                                                                <div className="ogc-img-fallback" style={{ display: result.validationResult.image?.content ? "none" : "flex" }}>
                                                                    <FiImage /><span>No image</span>
                                                                </div>
                                                            </div>
                                                            <div className="ogc-li-body">
                                                                <p className="ogc-li-title">{result.validationResult.title?.content || result.metaTitle || "No title"}</p>
                                                                <span className="ogc-li-domain">{safeHostname(result.url)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Copied toast ── */}
                <AnimatePresence>
                    {(copiedTag || copiedAll) && (
                        <motion.div
                            className="ogc-toast"
                            initial={{ opacity: 0, y: 16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        >
                            <FiCheck />
                            {copiedAll ? "All tags copied to clipboard!" : `Copied ${copiedTag}`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   TagRow sub-component
───────────────────────────────────────── */
const TagRow = ({
    icon, label, property, content, status, onCopy, copied,
}: {
    icon: string;
    label: string;
    property: string;
    content: string;
    status: "found" | "missing" | "warning";
    onCopy: () => void;
    copied: boolean;
}) => (
    <div className={`ogc-tag-row ogc-tag-row--${status}`}>
        <span className="ogc-tag-row-icon">{icon}</span>
        <div className="ogc-tag-row-body">
            <span className="ogc-tag-row-prop">{property}</span>
            {content ? (
                <span className="ogc-tag-row-val">{content}</span>
            ) : (
                <span className="ogc-tag-row-missing">— not found</span>
            )}
        </div>
        <div className="ogc-tag-row-status">
            {status === "found" && <FiCheck className="ogc-status-icon ogc-status-icon--found" />}
            {status === "missing" && <FiXCircle className="ogc-status-icon ogc-status-icon--missing" />}
            {status === "warning" && <FiAlertCircle className="ogc-status-icon ogc-status-icon--warn" />}
        </div>
        {status === "found" && (
            <button type="button" className="ogc-tag-copy-btn" onClick={onCopy} title="Copy tag">
                {copied ? <FiCheck /> : <FiCopy />}
            </button>
        )}
    </div>
);

/* ─────────────────────────────────────────
   Utility
───────────────────────────────────────── */
const safeHostname = (url: string) => {
    try { return new URL(url).hostname; } catch { return url; }
};

export default OpenGraphCheckerTool;