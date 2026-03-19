"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText, FiPlus, FiTrash2, FiDownload, FiCheckCircle,
    FiAlertCircle, FiCopy, FiRefreshCw, FiSettings, FiGlobe,
    FiCalendar, FiTrendingUp, FiChevronDown, FiChevronUp,
    FiCheck, FiX, FiCode, FiZap, FiArrowUp, FiArrowDown,
    FiInfo,
} from "react-icons/fi";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
type Priority = "0.0" | "0.1" | "0.2" | "0.3" | "0.4" | "0.5" | "0.6" | "0.7" | "0.8" | "0.9" | "1.0";

interface SitemapUrl {
    id: string;
    loc: string;
    lastmod: string;
    changefreq: ChangeFrequency;
    priority: Priority;
    expanded: boolean;
}

interface Toast {
    id: string;
    type: "success" | "error" | "warn";
    message: string;
}

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const URL_SOFT_LIMIT = 500;
const URL_HARD_LIMIT = 50000;
const TODAY = new Date().toISOString().split("T")[0];

const PRIORITY_COLOR: Record<string, string> = {
    "1.0": "#10b981", "0.9": "#34d399", "0.8": "#6ee7b7",
    "0.7": "#a3e6cb", "0.6": "#d1fae5", "0.5": "#94a3b8",
    "0.4": "#cbd5e1", "0.3": "#e2e8f0", "0.2": "#f1f5f9",
    "0.1": "#f8fafc", "0.0": "#f8fafc",
};

const makeUrl = (overrides: Partial<SitemapUrl> = {}): SitemapUrl => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    loc: "",
    lastmod: TODAY,
    changefreq: "weekly",
    priority: "0.5",
    expanded: false,
    ...overrides,
});

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const isValidUrl = (s: string): boolean => {
    try { new URL(s); return true; } catch { return false; }
};

const escapeXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

/** Priority dot indicator */
const PriorityDot = ({ value }: { value: string }) => (
    <span
        className="sg-priority-dot"
        style={{ background: PRIORITY_COLOR[value] ?? "#94a3b8" }}
        title={`Priority: ${value}`}
    />
);

/** Validity badge on URL input */
const ValidityBadge = ({ loc }: { loc: string }) => {
    if (!loc.trim()) return null;
    return isValidUrl(loc)
        ? <span className="sg-validity sg-validity--ok"><FiCheck /></span>
        : <span className="sg-validity sg-validity--err"><FiX /></span>;
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const SitemapGeneratorTool = () => {
    const [urls, setUrls] = useState<SitemapUrl[]>([makeUrl({ expanded: true })]);
    const [baseUrl, setBaseUrl] = useState("");
    const [generatedXml, setGeneratedXml] = useState("");
    const [showXml, setShowXml] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showBulkAdd, setShowBulkAdd] = useState(false);
    const [bulkInput, setBulkInput] = useState("");
    const [bulkPreviewCount, setBulkPreviewCount] = useState(0);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [generateSuccess, setGenerateSuccess] = useState(false);
    const [settings, setSettings] = useState({
        includeLastmod: true,
        includeChangefreq: true,
        includePriority: true,
        prettyPrint: true,
    });

    /* ── Toast system ── */
    const addToast = useCallback((type: Toast["type"], message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    }, []);

    /* ── URL mutations ── */
    const addUrl = () => setUrls(p => [...p, makeUrl({ expanded: true })]);

    const removeUrl = (id: string) => {
        if (urls.length === 1) return;
        setUrls(p => p.filter(u => u.id !== id));
    };

    const updateUrl = (id: string, field: keyof SitemapUrl, value: string | boolean) =>
        setUrls(p => p.map(u => u.id === id ? { ...u, [field]: value } : u));

    const toggleExpand = (id: string) =>
        setUrls(p => p.map(u => u.id === id ? { ...u, expanded: !u.expanded } : u));

    const moveUrl = (id: string, dir: -1 | 1) => {
        setUrls(p => {
            const idx = p.findIndex(u => u.id === id);
            const next = idx + dir;
            if (next < 0 || next >= p.length) return p;
            const arr = [...p];
            [arr[idx], arr[next]] = [arr[next], arr[idx]];
            return arr;
        });
    };

    /* ── Bulk add ── */
    const handleBulkInputChange = (val: string) => {
        setBulkInput(val);
        const count = val.split("\n").map(l => l.trim()).filter(l => l.length > 0).length;
        setBulkPreviewCount(count);
    };

    const handleBulkAdd = () => {
        const lines = bulkInput.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        if (!lines.length) return;

        const newUrls = lines.map(line => {
            let fullUrl = line;
            if (!line.startsWith("http")) {
                fullUrl = baseUrl
                    ? `${baseUrl.replace(/\/$/, "")}/${line.replace(/^\//, "")}`
                    : line;
            }
            return makeUrl({ loc: fullUrl });
        });

        setUrls(p =>
            p.length === 1 && p[0].loc === "" ? newUrls : [...p, ...newUrls]
        );
        setBulkInput("");
        setBulkPreviewCount(0);
        setShowBulkAdd(false);
        addToast("success", `Added ${newUrls.length} URL${newUrls.length > 1 ? "s" : ""}`);
    };

    /* ── Stats ── */
    const filled = urls.filter(u => u.loc.trim() !== "");
    const valid = filled.filter(u => isValidUrl(u.loc));
    const invalid = filled.filter(u => !isValidUrl(u.loc));
    const duplicates = filled.filter((u, i) =>
        filled.findIndex(x => x.loc === u.loc) !== i
    );

    const stats = {
        total: filled.length,
        valid: valid.length,
        invalid: invalid.length,
        duplicates: duplicates.length,
    };

    /* ── Generate XML ── */
    const generateXml = () => {
        if (valid.length === 0) {
            addToast("error", "Add at least one valid URL before generating");
            return;
        }

        const ind = settings.prettyPrint ? "  " : "";
        const nl = settings.prettyPrint ? "\n" : "";

        let xml = `<?xml version="1.0" encoding="UTF-8"?>${nl}`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nl}`;

        valid.forEach(u => {
            xml += `${ind}<url>${nl}`;
            xml += `${ind}${ind}<loc>${escapeXml(u.loc)}</loc>${nl}`;
            if (settings.includeLastmod && u.lastmod)
                xml += `${ind}${ind}<lastmod>${u.lastmod}</lastmod>${nl}`;
            if (settings.includeChangefreq && u.changefreq)
                xml += `${ind}${ind}<changefreq>${u.changefreq}</changefreq>${nl}`;
            if (settings.includePriority && u.priority)
                xml += `${ind}${ind}<priority>${u.priority}</priority>${nl}`;
            xml += `${ind}</url>${nl}`;
        });

        xml += `</urlset>`;

        setGeneratedXml(xml);
        setShowXml(true);
        setGenerateSuccess(true);
        setTimeout(() => setGenerateSuccess(false), 2500);
        addToast("success", `Sitemap generated with ${valid.length} URL${valid.length > 1 ? "s" : ""}`);
    };

    /* ── Download ── */
    const downloadXml = () => {
        const xml = generatedXml || (() => { generateXml(); return generatedXml; })();
        if (!xml) return;
        const blob = new Blob([xml], { type: "application/xml" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "sitemap.xml";
        a.click();
        URL.revokeObjectURL(a.href);
        addToast("success", "sitemap.xml downloaded!");
    };

    /* ── Copy XML ── */
    const copyXml = () => {
        navigator.clipboard.writeText(generatedXml);
        addToast("success", "XML copied to clipboard!");
    };

    /* ── Copy robots.txt snippet ── */
    const copyRobots = () => {
        const sitemapUrl = baseUrl
            ? `${baseUrl.replace(/\/$/, "")}/sitemap.xml`
            : "https://yourdomain.com/sitemap.xml";
        navigator.clipboard.writeText(`Sitemap: ${sitemapUrl}`);
        addToast("success", "robots.txt snippet copied!");
    };

    /* ── Clear ── */
    const clearAll = () => {
        setUrls([makeUrl({ expanded: true })]);
        setGeneratedXml("");
        setShowXml(false);
        setBaseUrl("");
        setGenerateSuccess(false);
    };

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
            <div className="sg-root">
                {/* ── Toast Stack ── */}
                <div className="sg-toasts">
                    <AnimatePresence>
                        {toasts.map(t => (
                            <motion.div
                                key={t.id}
                                className={`sg-toast sg-toast--${t.type}`}
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 60 }}
                            >
                                {t.type === "success" && <FiCheckCircle />}
                                {t.type === "error" && <FiAlertCircle />}
                                {t.type === "warn" && <FiAlertCircle />}
                                <span>{t.message}</span>
                                <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}>
                                    <FiX />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* ── Header Controls ── */}
                <div className="sg-header">
                    <div className="sg-base-url-wrap">
                        <FiGlobe className="sg-base-icon" />
                        <input
                            type="text"
                            className="sg-base-input"
                            placeholder="Base URL (e.g., https://example.com)"
                            value={baseUrl}
                            onChange={e => setBaseUrl(e.target.value)}
                        />
                    </div>

                    <div className="sg-header-btns">
                        <button type="button" className="sg-btn-ghost" onClick={loadSampleData.bind(null, setUrls, setBaseUrl)}>
                            <FiZap /> Sample
                        </button>
                        <button type="button" className="sg-btn-ghost" onClick={() => setShowBulkAdd(v => !v)}>
                            <FiPlus /> Bulk Add
                        </button>
                        <button type="button" className={`sg-btn-ghost${showSettings ? " sg-btn-ghost--active" : ""}`} onClick={() => setShowSettings(v => !v)}>
                            <FiSettings />
                            Settings
                            {showSettings ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {(urls.length > 1 || urls[0].loc) && (
                            <button type="button" className="sg-btn-ghost sg-btn-ghost--danger" onClick={clearAll}>
                                <FiRefreshCw /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Bulk Add Panel ── */}
                <AnimatePresence>
                    {showBulkAdd && (
                        <motion.div
                            className="sg-bulk-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22 }}
                        >
                            <div className="sg-bulk-inner">
                                <div className="sg-bulk-top">
                                    <div>
                                        <p className="sg-bulk-title"><FiPlus /> Bulk Add URLs</p>
                                        <p className="sg-bulk-hint">
                                            One URL or path per line. Paths like <code>/about</code> will be prefixed with your Base URL.
                                        </p>
                                    </div>
                                    {bulkPreviewCount > 0 && (
                                        <span className="sg-bulk-count">{bulkPreviewCount} URL{bulkPreviewCount > 1 ? "s" : ""} to add</span>
                                    )}
                                </div>
                                <textarea
                                    className="sg-bulk-textarea"
                                    placeholder={`/about\n/services\n/blog\nhttps://example.com/contact`}
                                    value={bulkInput}
                                    onChange={e => handleBulkInputChange(e.target.value)}
                                    rows={7}
                                />
                                <div className="sg-bulk-actions">
                                    <button type="button" className="sg-btn-primary" onClick={handleBulkAdd} disabled={!bulkPreviewCount}>
                                        <FiCheckCircle /> Add {bulkPreviewCount > 0 ? bulkPreviewCount : ""} URL{bulkPreviewCount !== 1 ? "s" : ""}
                                    </button>
                                    <button type="button" className="sg-btn-ghost" onClick={() => { setShowBulkAdd(false); setBulkInput(""); setBulkPreviewCount(0); }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Settings Panel ── */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="sg-settings-panel"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22 }}
                        >
                            <div className="sg-settings-inner">
                                <p className="sg-settings-title"><FiSettings /> XML Output Settings</p>
                                <div className="sg-settings-grid">
                                    {[
                                        { key: "includeLastmod", label: "Include <lastmod>" },
                                        { key: "includeChangefreq", label: "Include <changefreq>" },
                                        { key: "includePriority", label: "Include <priority>" },
                                        { key: "prettyPrint", label: "Pretty-print XML" },
                                    ].map(({ key, label }) => (
                                        <label key={key} className="sg-checkbox-row">
                                            <input
                                                type="checkbox"
                                                checked={settings[key as keyof typeof settings]}
                                                onChange={e => setSettings(p => ({ ...p, [key]: e.target.checked }))}
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Stats Bar ── */}
                <div className="sg-stats">
                    <div className="sg-stat">
                        <span className="sg-stat-val">{stats.total}</span>
                        <span className="sg-stat-lbl">URLs</span>
                    </div>
                    <div className="sg-stat-div" />
                    <div className="sg-stat">
                        <span className="sg-stat-val sg-stat-val--ok">{stats.valid}</span>
                        <span className="sg-stat-lbl">Valid</span>
                    </div>
                    {stats.invalid > 0 && (
                        <>
                            <div className="sg-stat-div" />
                            <div className="sg-stat">
                                <span className="sg-stat-val sg-stat-val--err">{stats.invalid}</span>
                                <span className="sg-stat-lbl">Invalid</span>
                            </div>
                        </>
                    )}
                    {stats.duplicates > 0 && (
                        <>
                            <div className="sg-stat-div" />
                            <div className="sg-stat">
                                <span className="sg-stat-val sg-stat-val--warn">{stats.duplicates}</span>
                                <span className="sg-stat-lbl">Duplicate{stats.duplicates > 1 ? "s" : ""}</span>
                            </div>
                        </>
                    )}
                    {stats.total >= URL_SOFT_LIMIT && (
                        <div className="sg-stat-warn">
                            <FiAlertCircle />
                            {stats.total >= URL_HARD_LIMIT
                                ? `Exceeds ${URL_HARD_LIMIT.toLocaleString()} URL limit`
                                : `Approaching ${URL_SOFT_LIMIT} URL recommended limit`}
                        </div>
                    )}
                </div>

                {/* ── URL List ── */}
                <div className="sg-url-list">
                    <div className="sg-url-list-header">
                        <p className="sg-url-list-title"><FiGlobe /> URLs <span className="sg-url-list-count">{urls.length}</span></p>
                        <button type="button" className="sg-btn-add" onClick={addUrl}>
                            <FiPlus /> Add URL
                        </button>
                    </div>

                    {/* Column headers (desktop) */}
                    <div className="sg-col-headers">
                        <span style={{ width: 32 }} />
                        <span className="sg-col-header sg-col-url">URL</span>
                        <span className="sg-col-header sg-col-freq">Frequency</span>
                        <span className="sg-col-header sg-col-pri">Priority</span>
                        <span style={{ width: 80 }} />
                    </div>

                    <AnimatePresence initial={false}>
                        {urls.map((url, idx) => {
                            const isValid = !url.loc.trim() || isValidUrl(url.loc);
                            const isDup = !!url.loc.trim() && urls.filter(u => u.loc === url.loc).length > 1;

                            return (
                                <motion.div
                                    key={url.id}
                                    className={`sg-url-row${!isValid ? " sg-url-row--invalid" : ""}${isDup ? " sg-url-row--dup" : ""}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8, height: 0 }}
                                    transition={{ duration: 0.18 }}
                                    layout
                                >
                                    {/* ── Compact row ── */}
                                    <div className="sg-url-compact">
                                        {/* Index */}
                                        <span className="sg-url-idx">{idx + 1}</span>

                                        {/* URL input */}
                                        <div className="sg-url-input-wrap">
                                            <input
                                                type="text"
                                                className={`sg-url-input${!isValid ? " sg-url-input--invalid" : ""}${isDup ? " sg-url-input--dup" : ""}`}
                                                placeholder="https://example.com/page"
                                                value={url.loc}
                                                onChange={e => updateUrl(url.id, "loc", e.target.value)}
                                                spellCheck={false}
                                            />
                                            <ValidityBadge loc={url.loc} />
                                            {isDup && (
                                                <span className="sg-dup-badge" title="Duplicate URL">DUP</span>
                                            )}
                                        </div>

                                        {/* Frequency badge (compact) */}
                                        <span className="sg-compact-freq">{url.changefreq}</span>

                                        {/* Priority dot + value */}
                                        <div className="sg-compact-pri">
                                            <PriorityDot value={url.priority} />
                                            <span>{url.priority}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="sg-url-actions">
                                            <button type="button" className="sg-icon-btn" onClick={() => moveUrl(url.id, -1)} disabled={idx === 0} title="Move up">
                                                <FiArrowUp />
                                            </button>
                                            <button type="button" className="sg-icon-btn" onClick={() => moveUrl(url.id, 1)} disabled={idx === urls.length - 1} title="Move down">
                                                <FiArrowDown />
                                            </button>
                                            <button type="button" className="sg-icon-btn sg-icon-btn--expand" onClick={() => toggleExpand(url.id)} title={url.expanded ? "Collapse" : "Edit details"}>
                                                {url.expanded ? <FiChevronUp /> : <FiChevronDown />}
                                            </button>
                                            <button type="button" className="sg-icon-btn sg-icon-btn--del" onClick={() => removeUrl(url.id)} disabled={urls.length === 1} title="Remove">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Validation messages */}
                                    {!isValid && url.loc.trim() && (
                                        <p className="sg-url-error"><FiAlertCircle /> Invalid URL — must start with http:// or https://</p>
                                    )}
                                    {isDup && (
                                        <p className="sg-url-warn"><FiAlertCircle /> Duplicate URL detected</p>
                                    )}

                                    {/* ── Expanded details ── */}
                                    <AnimatePresence>
                                        {url.expanded && (
                                            <motion.div
                                                className="sg-url-expanded"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="sg-expanded-grid">
                                                    <div className="sg-field">
                                                        <label className="sg-field-label"><FiCalendar /> Last Modified</label>
                                                        <input
                                                            type="date"
                                                            className="sg-field-input"
                                                            value={url.lastmod}
                                                            onChange={e => updateUrl(url.id, "lastmod", e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="sg-field">
                                                        <label className="sg-field-label"><FiRefreshCw /> Change Frequency</label>
                                                        <select
                                                            className="sg-field-input"
                                                            value={url.changefreq}
                                                            onChange={e => updateUrl(url.id, "changefreq", e.target.value)}
                                                        >
                                                            {(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as ChangeFrequency[]).map(f => (
                                                                <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="sg-field">
                                                        <label className="sg-field-label"><FiTrendingUp /> Priority</label>
                                                        <div className="sg-priority-wrap">
                                                            <select
                                                                className="sg-field-input"
                                                                value={url.priority}
                                                                onChange={e => updateUrl(url.id, "priority", e.target.value)}
                                                            >
                                                                {(["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", "0.0"] as Priority[]).map(p => (
                                                                    <option key={p} value={p}>
                                                                        {p}{p === "1.0" ? " — Highest" : p === "0.5" ? " — Default" : p === "0.0" ? " — Lowest" : ""}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <PriorityDot value={url.priority} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add URL button (bottom) */}
                    <button type="button" className="sg-btn-add-inline" onClick={addUrl}>
                        <FiPlus /> Add another URL
                    </button>
                </div>

                {/* ── Action Buttons ── */}
                <div className="sg-actions">
                    <motion.button
                        type="button"
                        className={`sg-btn-generate${generateSuccess ? " sg-btn-generate--done" : ""}`}
                        onClick={generateXml}
                        disabled={stats.valid === 0}
                        whileHover={{ scale: stats.valid === 0 ? 1 : 1.02 }}
                        whileTap={{ scale: stats.valid === 0 ? 1 : 0.97 }}
                    >
                        {generateSuccess ? (
                            <><FiCheckCircle /> Generated!</>
                        ) : (
                            <><FiFileText /> Generate Sitemap</>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {generatedXml && (
                            <motion.div
                                className="sg-post-actions"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                            >
                                <motion.button
                                    type="button"
                                    className="sg-btn-download"
                                    onClick={downloadXml}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.05 }}
                                >
                                    <FiDownload /> Download sitemap.xml
                                </motion.button>

                                <motion.button
                                    type="button"
                                    className="sg-btn-copy"
                                    onClick={copyXml}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <FiCopy /> Copy XML
                                </motion.button>

                                <motion.button
                                    type="button"
                                    className="sg-btn-robots"
                                    onClick={copyRobots}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15 }}
                                    title="Copy robots.txt sitemap directive"
                                >
                                    <FiCode /> Copy robots.txt snippet
                                </motion.button>

                                <motion.button
                                    type="button"
                                    className="sg-btn-ghost"
                                    onClick={() => setShowXml(v => !v)}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {showXml ? <FiChevronUp /> : <FiChevronDown />}
                                    {showXml ? "Hide" : "Preview"} XML
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── XML Preview ── */}
                <AnimatePresence>
                    {showXml && generatedXml && (
                        <motion.div
                            className="sg-xml-preview"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                        >
                            <div className="sg-xml-header">
                                <div className="sg-xml-dots">
                                    <span className="sg-xml-dot sg-xml-dot--red" />
                                    <span className="sg-xml-dot sg-xml-dot--yellow" />
                                    <span className="sg-xml-dot sg-xml-dot--green" />
                                </div>
                                <span className="sg-xml-filename">sitemap.xml</span>
                                <button type="button" className="sg-xml-close" onClick={() => setShowXml(false)}>
                                    <FiX />
                                </button>
                            </div>
                            <pre className="sg-xml-code">
                                <XmlHighlight xml={generatedXml} />
                            </pre>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── SEO Tips ── */}
                <div className="sg-tips">
                    <p className="sg-tips-title"><FiInfo /> Sitemap Best Practices</p>
                    <div className="sg-tips-grid">
                        {[
                            { icon: <FiGlobe />, title: "Root Directory", body: "Place sitemap.xml at your site root for automatic discovery." },
                            { icon: <FiFileText />, title: "Submit to Search Engines", body: "Add your sitemap to Google Search Console and Bing Webmaster Tools." },
                            { icon: <FiRefreshCw />, title: "Keep It Fresh", body: "Update your sitemap whenever you add or significantly change pages." },
                            { icon: <FiTrendingUp />, title: "Priority Hierarchy", body: "Homepage = 1.0, key pages = 0.8–0.9, regular content = 0.5–0.7." },
                        ].map(tip => (
                            <div key={tip.title} className="sg-tip">
                                <div className="sg-tip-icon">{tip.icon}</div>
                                <div>
                                    <p className="sg-tip-title">{tip.title}</p>
                                    <p className="sg-tip-body">{tip.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>{/* sg-root */}
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   XML Syntax Highlighter
───────────────────────────────────────── */
const XmlHighlight = ({ xml }: { xml: string }) => {
    const parts: React.ReactNode[] = [];
    const tagRe = /(<\/?[\w:]+(?:\s[^>]*)?>|<!--[\s\S]*?-->)/g;
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = tagRe.exec(xml)) !== null) {
        if (m.index > last) parts.push(<span key={last}>{xml.slice(last, m.index)}</span>);

        const tag = m[0];
        if (tag.startsWith("<!--")) {
            parts.push(<span key={m.index} className="sg-xml-comment">{tag}</span>);
        } else if (tag.startsWith("</")) {
            parts.push(<span key={m.index} className="sg-xml-close-tag">{tag}</span>);
        } else if (tag.startsWith("<?")) {
            parts.push(<span key={m.index} className="sg-xml-decl">{tag}</span>);
        } else {
            parts.push(<span key={m.index} className="sg-xml-open-tag">{tag}</span>);
        }
        last = m.index + tag.length;
    }

    if (last < xml.length) parts.push(<span key={last}>{xml.slice(last)}</span>);
    return <>{parts}</>;
};

/* ─────────────────────────────────────────
   Load sample helper (outside component
   to avoid re-creation on every render)
───────────────────────────────────────── */
function loadSampleData(
    setUrls: React.Dispatch<React.SetStateAction<SitemapUrl[]>>,
    setBaseUrl: React.Dispatch<React.SetStateAction<string>>,
) {
    setBaseUrl("https://example.com");
    setUrls([
        { id: "s1", loc: "https://example.com/", lastmod: TODAY, changefreq: "daily", priority: "1.0", expanded: false },
        { id: "s2", loc: "https://example.com/about", lastmod: TODAY, changefreq: "monthly", priority: "0.8", expanded: false },
        { id: "s3", loc: "https://example.com/blog", lastmod: TODAY, changefreq: "weekly", priority: "0.9", expanded: false },
        { id: "s4", loc: "https://example.com/contact", lastmod: TODAY, changefreq: "yearly", priority: "0.7", expanded: false },
    ]);
}

export default SitemapGeneratorTool;