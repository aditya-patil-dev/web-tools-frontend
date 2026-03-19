"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiZap, FiCheckCircle, FiAlertCircle, FiClock,
    FiActivity, FiImage, FiCode, FiServer, FiGlobe,
    FiTrendingUp, FiRefreshCw, FiCopy, FiCheck,
    FiArrowUp, FiArrowDown, FiLayout, FiCpu,
    FiPackage, FiShield,
} from "react-icons/fi";
import { toolsApi, SpeedTestResponse, SpeedRecommendation } from "@/lib/api-calls/tools.api";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type SpeedMetrics = SpeedTestResponse;

interface HistoryEntry {
    url: string;
    score: number;
    grade: string;
    timestamp: number;
}

/* ─────────────────────────────────────────
   Animated counter
───────────────────────────────────────── */
function useCountUp(target: number, duration = 1200, enabled = true) {
    const [value, setValue] = useState(0);

    if (!enabled && value !== 0) {
        setValue(0);
    }

    useEffect(() => {
        if (!enabled) return;
        let cur = 0;
        const inc = target / (duration / 16);
        const t = setInterval(() => {
            cur += inc;
            if (cur >= target) { setValue(target); clearInterval(t); }
            else setValue(Math.floor(cur));
        }, 16);
        return () => clearInterval(t);
    }, [target, duration, enabled]);
    return value;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const scoreColor = (s: number) =>
    s >= 90 ? "#10b981" : s >= 70 ? "#f59e0b" : "#ef4444";
const scoreLabel = (s: number) =>
    s >= 90 ? "Excellent" : s >= 70 ? "Needs Work" : "Poor";
const metricStatus = (v: number, good: number, bad: number): "good" | "warning" | "poor" =>
    v <= good ? "good" : v <= bad ? "warning" : "poor";
const lwStatus = (score: number | null): "good" | "warning" | "poor" => {
    if (score === null) return "poor";
    if (score >= 0.9) return "good";
    if (score >= 0.5) return "warning";
    return "poor";
};
const fmtTime = (ms: number) => `${(ms / 1000).toFixed(2)}s`;
const fmtMs = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
const fmtSize = (kb: number) =>
    kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;

/* ─────────────────────────────────────────
   CWV thresholds
───────────────────────────────────────── */
const CWV_META = {
    lcp: { label: "Largest Contentful Paint", hint: "Good: < 2.5s · Poor: > 4s" },
    cls: { label: "Cumulative Layout Shift", hint: "Good: < 0.1 · Poor: > 0.25" },
    tbt: { label: "Total Blocking Time", hint: "Good: < 200ms · Poor: > 600ms" },
    fcp: { label: "First Contentful Paint", hint: "Good: < 1.8s · Poor: > 3s" },
    speedIndex: { label: "Speed Index", hint: "Good: < 3.4s · Poor: > 5.8s" },
} as const;

/* ─────────────────────────────────────────
   Loading steps
───────────────────────────────────────── */
const LOADING_STEPS = [
    "Connecting to URL",
    "Analyzing page structure",
    "Measuring Core Web Vitals",
    "Running performance audit",
    "Generating report",
];

const LoadingState = ({ elapsed }: { elapsed: number }) => {
    const activeStep = Math.min(Math.floor(elapsed / 2.5), LOADING_STEPS.length - 1);
    return (
        <motion.div className="wst-loading" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <div className="wst-loading-ring">
                <svg viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-slate-200)" strokeWidth="6" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-primary)" strokeWidth="6"
                        strokeLinecap="round" strokeDasharray="50 150" className="wst-loading-arc" transform="rotate(-90 40 40)" />
                </svg>
                <span className="wst-loading-timer">{elapsed.toFixed(0)}s</span>
            </div>
            <div className="wst-loading-steps">
                {LOADING_STEPS.map((step, i) => (
                    <div key={step} className={`wst-loading-step${i < activeStep ? " wst-loading-step--done" : i === activeStep ? " wst-loading-step--active" : ""}`}>
                        <span className="wst-loading-step-dot" /><span>{step}</span>
                    </div>
                ))}
            </div>
            <p className="wst-loading-hint">Google PageSpeed analysis typically takes 8–15 seconds</p>
        </motion.div>
    );
};

/* ─────────────────────────────────────────
   Metric gauge
───────────────────────────────────────── */
const MetricGauge = ({ value, good, bad, max }: { value: number; good: number; bad: number; max: number }) => {
    const pct = Math.min((value / max) * 100, 100);
    const goodPct = (good / max) * 100;
    const badPct = (bad / max) * 100;
    const status = metricStatus(value, good, bad);
    return (
        <div className="wst-gauge">
            <div className="wst-gauge-track">
                <div className="wst-gauge-zone wst-gauge-zone--good" style={{ width: `${goodPct}%` }} />
                <div className="wst-gauge-zone wst-gauge-zone--warn" style={{ width: `${badPct - goodPct}%`, left: `${goodPct}%` }} />
                <div className="wst-gauge-zone wst-gauge-zone--poor" style={{ width: `${100 - badPct}%`, left: `${badPct}%` }} />
                <motion.div
                    className={`wst-gauge-marker wst-gauge-marker--${status}`}
                    initial={{ left: "0%" }} animate={{ left: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   Score ring
───────────────────────────────────────── */
const ScoreRing = ({ score, grade }: { score: number; grade: string }) => {
    const circ = 2 * Math.PI * 54;
    const displayScore = useCountUp(Math.round(score), 1200, true);
    return (
        <div className="wst-score-ring-wrap">
            <svg viewBox="0 0 120 120" className="wst-score-svg">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-slate-200)" strokeWidth="10" />
                <motion.circle
                    cx="60" cy="60" r="54" fill="none"
                    stroke={scoreColor(score)} strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * circ} ${circ}`}
                    transform="rotate(-90 60 60)"
                    initial={{ strokeDasharray: `0 ${circ}` }}
                    animate={{ strokeDasharray: `${(score / 100) * circ} ${circ}` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
            </svg>
            <div className="wst-score-center">
                <span className="wst-score-num" style={{ color: scoreColor(score) }}>{displayScore}</span>
                <span className="wst-score-grade">{grade}</span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   CWV chip
───────────────────────────────────────── */
const CwvChip = ({ status }: { status: "good" | "warning" | "poor" }) => (
    <span className={`wst-cwv-chip wst-cwv-chip--${status}`}>
        {status === "good" ? "Good" : status === "warning" ? "Needs Improvement" : "Poor"}
    </span>
);

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const WebsiteSpeedTestTool = () => {
    const [url, setUrl] = useState("");
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<SpeedMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (testing) {
            setElapsed(0);
            timerRef.current = setInterval(() => setElapsed(p => +(p + 0.1).toFixed(1)), 100);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [testing]);

    const handleTest = async () => {
        if (!url.trim()) { toast.error("Please enter a URL", "URL Required"); return; }
        const testUrl = url.startsWith("http") ? url : `https://${url}`;
        try { new URL(testUrl); } catch { toast.error("Please enter a valid URL", "Invalid URL"); return; }
        setTesting(true); setError(null); setResults(null);
        try {
            const metrics = await toolsApi.testWebsiteSpeed({ url: testUrl });
            setResults(metrics);
            setHistory(prev => [
                { url: testUrl, score: metrics.score, grade: metrics.grade, timestamp: Date.now() },
                ...prev.filter(h => h.url !== testUrl).slice(0, 4),
            ]);
            toast.success("Speed test completed!", "Done");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Failed to test website speed";
            setError(msg); toast.error(msg, "Error");
        } finally { setTesting(false); }
    };

    const copyReport = () => {
        if (!results) return;
        const c = results.coreWebVitals;
        const d = results.diagnostics;
        const lines = [
            `Website Speed Report — ${url}`,
            `Score: ${Math.round(results.score)} (${results.grade}) — ${scoreLabel(results.score)}`,
            `Passed audits: ${results.passedAuditsCount ?? "N/A"}`,
            ``,
            `CORE WEB VITALS`,
            `LCP:          ${c.lcp.display}`,
            `CLS:          ${c.cls.display}`,
            `TBT:          ${c.tbt.display}`,
            `FCP:          ${c.fcp.display}`,
            `Speed Index:  ${c.speedIndex.display}`,
            ``,
            `TIMING`,
            `Load Time:   ${fmtTime(results.loadTime)}`,
            `TTI:         ${fmtTime(results.timeToInteractive)}`,
            ``,
            `DIAGNOSTICS`,
            `TTFB:        ${d.ttfb.display}`,
            `DOM Size:    ${d.domSize.display}`,
            `JS Boot-up:  ${d.bootupTime.display}`,
            `Main Thread: ${d.mainThreadWork.display}`,
            ``,
            `RESOURCES`,
            `Total: ${fmtSize(results.totalSize)} · Requests: ${results.requests}`,
            `Images: ${fmtSize(results.imageSize)} · JS: ${fmtSize(results.scriptSize)} · CSS: ${fmtSize(results.styleSize)}`,
            ``,
            `RECOMMENDATIONS (${results.recommendations.length})`,
            ...results.recommendations.map(r =>
                `[${r.severity.toUpperCase()}] ${r.title}${r.savingsDisplay ? ` — save ${r.savingsDisplay}` : ""}`,
            ),
        ];
        navigator.clipboard.writeText(lines.join("\n"));
        setCopied(true); setTimeout(() => setCopied(false), 2500);
        toast.success("Report copied!", "Copied");
    };

    const prevEntry = history.find(h => h.url === (url.startsWith("http") ? url : `https://${url}`) && results && h.timestamp < Date.now() - 1000);
    const scoreDiff = prevEntry && results ? Math.round(results.score) - Math.round(prevEntry.score) : null;

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    return (
        <motion.div className="tool-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="wst-root">

                {/* ── Input ── */}
                <div className="wst-input-card">
                    <div className="wst-input-wrap">
                        <FiGlobe className="wst-input-icon" />
                        <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !testing && handleTest()}
                            placeholder="Enter website URL (e.g., example.com)" className="wst-input"
                            disabled={testing} autoComplete="off" spellCheck={false} />
                    </div>
                    <motion.button type="button" className="wst-btn-test" onClick={handleTest}
                        disabled={testing || !url.trim()} whileHover={{ scale: testing ? 1 : 1.02 }} whileTap={{ scale: testing ? 1 : 0.97 }}>
                        {testing ? <><span className="wst-spinner" /> Analyzing…</> : <><FiZap /> Test Speed</>}
                    </motion.button>
                </div>

                {/* ── Error ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div className="wst-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <FiAlertCircle /><span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Loading ── */}
                <AnimatePresence>{testing && <LoadingState elapsed={elapsed} />}</AnimatePresence>

                {/* ── Results ── */}
                <AnimatePresence>
                    {results && !testing && (
                        <motion.div className="wst-results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>

                            {/* Score Hero */}
                            <div className="wst-score-card">
                                <ScoreRing score={results.score} grade={results.grade} />
                                <div className="wst-score-detail">
                                    <div className="wst-score-badge" style={{ background: `${scoreColor(results.score)}18`, color: scoreColor(results.score), borderColor: `${scoreColor(results.score)}40` }}>
                                        {scoreLabel(results.score)}
                                    </div>
                                    <h3 className="wst-score-title">Performance Score</h3>
                                    <p className="wst-score-desc">Google PageSpeed Insights · Mobile simulation</p>
                                    {(results.passedAuditsCount ?? 0) > 0 && (
                                        <div className="wst-passed-pill">
                                            <FiCheckCircle /> {results.passedAuditsCount} audits passed
                                        </div>
                                    )}
                                    {scoreDiff !== null && scoreDiff !== 0 && (
                                        <div className={`wst-score-delta${scoreDiff > 0 ? " wst-score-delta--up" : " wst-score-delta--down"}`}>
                                            {scoreDiff > 0 ? <FiArrowUp /> : <FiArrowDown />}{Math.abs(scoreDiff)} pts vs last test
                                        </div>
                                    )}
                                    <div className="wst-score-actions">
                                        <button type="button" className="wst-btn-retest" onClick={handleTest}><FiRefreshCw /> Test Again</button>
                                        <button type="button" className={`wst-btn-copy${copied ? " wst-btn-copy--done" : ""}`} onClick={copyReport}>
                                            {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy Report</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Core Web Vitals */}
                            {results.coreWebVitals && (
                                <div className="wst-cwv-card">
                                    <div className="wst-card-header">
                                        <h3 className="wst-card-title"><FiShield /> Core Web Vitals</h3>
                                        <span className="wst-card-subtitle">Google&apos;s official ranking signals</span>
                                    </div>
                                    <div className="wst-cwv-grid">
                                        {(Object.keys(CWV_META) as (keyof typeof CWV_META)[]).map((key, i) => {
                                            const metric = results.coreWebVitals[key];
                                            const meta = CWV_META[key];
                                            const status = lwStatus(metric.score);
                                            return (
                                                <motion.div key={key} className={`wst-cwv-item wst-cwv-item--${status}`}
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                                                    <div className="wst-cwv-top">
                                                        <span className="wst-cwv-key">{key.toUpperCase()}</span>
                                                        <CwvChip status={status} />
                                                    </div>
                                                    <p className="wst-cwv-value">{metric.display}</p>
                                                    <p className="wst-cwv-label">{meta.label}</p>
                                                    <p className="wst-cwv-hint">{meta.hint}</p>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Timing Metrics */}
                            <div className="wst-metrics-grid">
                                {[
                                    { label: "Page Load Time", value: results.loadTime, fmt: fmtTime, good: 1500, bad: 3000, max: 6000, icon: <FiClock /> },
                                    { label: "First Contentful Paint", value: results.firstContentfulPaint, fmt: fmtTime, good: 1000, bad: 2000, max: 4000, icon: <FiActivity /> },
                                    { label: "Time to Interactive", value: results.timeToInteractive, fmt: fmtTime, good: 2500, bad: 4000, max: 8000, icon: <FiTrendingUp /> },
                                    { label: "Total Page Size", value: results.totalSize, fmt: fmtSize, good: 1000, bad: 2000, max: 5000, icon: <FiServer /> },
                                    { label: "HTTP Requests", value: results.requests, fmt: (v: number) => String(v), good: 30, bad: 50, max: 100, icon: <FiGlobe /> },
                                ].map((m, i) => {
                                    const status = metricStatus(m.value, m.good, m.bad);
                                    return (
                                        <motion.div key={m.label} className={`wst-metric-card wst-metric-card--${status}`}
                                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.25 }}>
                                            <div className="wst-metric-top">
                                                <div className={`wst-metric-icon wst-metric-icon--${status}`}>{m.icon}</div>
                                                <div className="wst-metric-body">
                                                    <p className="wst-metric-label">{m.label}</p>
                                                    <p className="wst-metric-value">{m.fmt(m.value)}</p>
                                                </div>
                                                <span className={`wst-metric-badge wst-metric-badge--${status}`}>
                                                    {status === "good" ? "Good" : status === "warning" ? "Fair" : "Poor"}
                                                </span>
                                            </div>
                                            <MetricGauge value={m.value} good={m.good} bad={m.bad} max={m.max} />
                                            <p className="wst-metric-hint">Target: {m.fmt(m.good)}</p>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Diagnostics */}
                            {results.diagnostics && (
                                <div className="wst-diag-card">
                                    <div className="wst-card-header">
                                        <h3 className="wst-card-title"><FiCpu /> Diagnostics</h3>
                                        <span className="wst-card-subtitle">Server & runtime breakdown</span>
                                    </div>
                                    <div className="wst-diag-grid">
                                        {[
                                            { key: "ttfb", label: "Time to First Byte", icon: <FiServer />, fmt: fmtMs, hint: "Target: < 600ms" },
                                            { key: "domSize", label: "DOM Elements", icon: <FiLayout />, fmt: (v: number) => v.toLocaleString(), hint: "Target: < 1,500 nodes" },
                                            { key: "bootupTime", label: "JS Boot-up Time", icon: <FiCode />, fmt: fmtMs, hint: "Target: < 2s" },
                                            { key: "mainThreadWork", label: "Main Thread Work", icon: <FiCpu />, fmt: fmtMs, hint: "Target: < 4s" },
                                            { key: "thirdPartyBytes", label: "Third-party Size", icon: <FiPackage />, fmt: fmtMs, hint: "Minimize external impact" },
                                        ].map((d, i) => {
                                            const diag = results.diagnostics[d.key as keyof typeof results.diagnostics];
                                            const status = lwStatus(diag.score);
                                            return (
                                                <motion.div key={d.key} className={`wst-diag-item wst-diag-item--${status}`}
                                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                                    <div className={`wst-diag-icon wst-diag-icon--${status}`}>{d.icon}</div>
                                                    <div className="wst-diag-body">
                                                        <p className="wst-diag-label">{d.label}</p>
                                                        <p className="wst-diag-value">{diag.display || d.fmt(diag.value)}</p>
                                                        <p className="wst-diag-hint">{d.hint}</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Resource Breakdown */}
                            <div className="wst-resources-card">
                                <h3 className="wst-card-title">Resource Breakdown</h3>
                                <div className="wst-stacked-bar">
                                    {[
                                        { label: "Images", size: results.imageSize, cls: "images" },
                                        { label: "JS", size: results.scriptSize, cls: "scripts" },
                                        { label: "CSS", size: results.styleSize, cls: "styles" },
                                        { label: "Other", size: Math.max(0, results.totalSize - results.imageSize - results.scriptSize - results.styleSize), cls: "other" },
                                    ].filter(r => r.size > 0).map((r, i) => {
                                        const pct = (r.size / results.totalSize) * 100;
                                        return (
                                            <motion.div key={r.label} className={`wst-stacked-segment wst-stacked-segment--${r.cls}`}
                                                title={`${r.label}: ${fmtSize(r.size)} (${pct.toFixed(1)}%)`}
                                                style={{ width: `${pct}%` }} initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }} />
                                        );
                                    })}
                                </div>
                                <div className="wst-resource-legend">
                                    {[
                                        { label: "Images", size: results.imageSize, cls: "images", icon: <FiImage /> },
                                        { label: "JavaScript", size: results.scriptSize, cls: "scripts", icon: <FiCode /> },
                                        { label: "CSS", size: results.styleSize, cls: "styles", icon: <FiCode /> },
                                        { label: "Other", size: Math.max(0, results.totalSize - results.imageSize - results.scriptSize - results.styleSize), cls: "other", icon: <FiServer /> },
                                    ].filter(r => r.size > 0).map(r => (
                                        <div key={r.label} className="wst-resource-row">
                                            <div className="wst-resource-row-left">
                                                <span className={`wst-resource-dot wst-resource-dot--${r.cls}`} />{r.icon}<span>{r.label}</span>
                                            </div>
                                            <div className="wst-resource-row-right">
                                                <span className="wst-resource-size">{fmtSize(r.size)}</span>
                                                <span className="wst-resource-pct">{((r.size / results.totalSize) * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="wst-resource-bar-wrap">
                                                <motion.div className={`wst-resource-bar-fill wst-resource-bar-fill--${r.cls}`}
                                                    initial={{ width: 0 }} animate={{ width: `${(r.size / results.totalSize) * 100}%` }}
                                                    transition={{ duration: 0.7, ease: "easeOut" }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {results.recommendations?.length > 0 && (
                                <div className="wst-recs-card">
                                    <div className="wst-card-header">
                                        <h3 className="wst-card-title">
                                            <FiZap /> Recommendations
                                            <span className="wst-recs-count">{results.recommendations.length}</span>
                                        </h3>
                                        {(results.passedAuditsCount ?? 0) > 0 && (
                                            <span className="wst-passed-inline"><FiCheckCircle /> {results.passedAuditsCount} checks passed</span>
                                        )}
                                    </div>
                                    <div className="wst-rec-summary">
                                        {(["critical", "warning", "info"] as const).map(sev => {
                                            const count = results.recommendations.filter(r => r.severity === sev).length;
                                            if (!count) return null;
                                            return <span key={sev} className={`wst-rec-summary-pill wst-rec-summary-pill--${sev}`}>{count} {sev}</span>;
                                        })}
                                    </div>
                                    <div className="wst-recs-list">
                                        {results.recommendations.map((rec, i) => (
                                            <motion.div key={i} className={`wst-rec wst-rec--${rec.severity}`}
                                                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.22 }}>
                                                <div className="wst-rec-icon">
                                                    {rec.severity === "info" ? <FiCheckCircle /> : <FiAlertCircle />}
                                                </div>
                                                <div className="wst-rec-body">
                                                    <div className="wst-rec-title-row">
                                                        <p className="wst-rec-title">{rec.title}</p>
                                                        {rec.savingsDisplay && (
                                                            <span className="wst-rec-savings">save {rec.savingsDisplay}</span>
                                                        )}
                                                    </div>
                                                    <p className="wst-rec-desc">{rec.description}</p>
                                                </div>
                                                <span className={`wst-rec-badge wst-rec-badge--${rec.severity}`}>{rec.severity}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Empty State ── */}
                {!results && !testing && !error && (
                    <motion.div className="wst-empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <p className="wst-empty-title">What we measure</p>
                        <div className="wst-metrics-info-grid">
                            {[
                                { icon: <FiShield />, label: "Core Web Vitals", range: "LCP · CLS · TBT · FCP", desc: "Google's official ranking signals — used to assess real-world user experience" },
                                { icon: <FiActivity />, label: "First Contentful Paint", range: "Good: < 1.8s · Poor: > 3s", desc: "Time until the first content appears on screen" },
                                { icon: <FiTrendingUp />, label: "Time to Interactive", range: "Good: < 3.8s · Poor: > 7.3s", desc: "When the page responds reliably to user input" },
                                { icon: <FiServer />, label: "Server & Diagnostics", range: "TTFB · DOM size · JS time", desc: "Server response time, DOM complexity, and JavaScript execution cost" },
                            ].map(m => (
                                <div key={m.label} className="wst-metric-info-card">
                                    <div className="wst-metric-info-icon">{m.icon}</div>
                                    <div>
                                        <p className="wst-metric-info-label">{m.label}</p>
                                        <p className="wst-metric-info-range">{m.range}</p>
                                        <p className="wst-metric-info-desc">{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

            </div>
        </motion.div>
    );
};

export default WebsiteSpeedTestTool;