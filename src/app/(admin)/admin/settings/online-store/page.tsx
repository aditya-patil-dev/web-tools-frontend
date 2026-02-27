"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";
import Link from 'next/link';


// ─────────────────────────────────────────────────────────────────
// ENV  (NEXT_PUBLIC_ = safe in browser bundle)
// ─────────────────────────────────────────────────────────────────
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
const PAGESPEED_KEY = process.env.NEXT_PUBLIC_PAGESPEED_API_KEY ?? "";

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────
type DeviceMode = "desktop" | "tablet" | "mobile";
type FetchState = "idle" | "loading" | "success" | "error";

/** Shape of  GET /seo/static/home  →  .data */
type SeoData = {
    id: string;
    page_key: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string[];
    canonical_url: string;
    og_image: string;
    noindex: boolean;
    nofollow: boolean;
    priority: string;
    changefreq: string;
    status: "active" | "inactive";
    updated_at: string;   // ISO date
};

/** Our parsed subset of PageSpeed Insights v5 */
type PerfData = {
    score: number;  // 0–100
    lcp: number;  // ms   Largest Contentful Paint
    fid: number;  // ms   Max Potential FID
    cls: number;  // CLS score
    ttfb: number;  // ms   Server Response Time (TTFB)
    fcp: number;  // ms   First Contentful Paint
};

// ─────────────────────────────────────────────────────────────────
// SEO SCORE  (calculated from the data you already have)
// Max 100pts — tweak weights as needed
// ─────────────────────────────────────────────────────────────────
function calcSeoScore(d: SeoData): number {
    let s = 0;
    if (d.meta_title) s += 10;   // title exists
    if (d.meta_title?.length >= 30) s += 10;   // title long enough
    if (d.meta_title?.length <= 60) s += 10;   // title not too long
    if (d.meta_description) s += 10;   // desc exists
    if (d.meta_description?.length >= 80) s += 10;   // desc long enough
    if (d.meta_description?.length <= 160) s += 5;   // desc not too long
    if (!d.noindex) s += 10;   // page is indexable
    if (!d.nofollow) s += 5;   // links are followed
    if (d.canonical_url) s += 10;   // canonical set
    if (d.status === "active") s += 5;   // page is active
    if (d.meta_keywords?.length >= 3) s += 10;   // has keywords
    if (d.meta_keywords?.length >= 6) s += 5;   // healthy keyword count
    return Math.min(s, 100);
}

// ─────────────────────────────────────────────────────────────────
// PAGESPEED PARSER  (PSI v5 → clean PerfData)
// Full field list: https://developers.google.com/speed/docs/insights/v5/reference
// ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePSI(raw: any): PerfData {
    const a = raw?.lighthouseResult?.audits ?? {};
    const c = raw?.lighthouseResult?.categories ?? {};
    return {
        score: Math.round((c?.performance?.score ?? 0) * 100),
        lcp: Math.round(a["largest-contentful-paint"]?.numericValue ?? 0),
        fid: Math.round(a["max-potential-fid"]?.numericValue ?? 0),
        cls: parseFloat((a["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(3)),
        ttfb: Math.round(a["server-response-time"]?.numericValue ?? 0),
        fcp: Math.round(a["first-contentful-paint"]?.numericValue ?? 0),
    };
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function scoreColor(n: number) {
    if (n >= 90) return "var(--color-success)";
    if (n >= 70) return "var(--color-warning)";
    return "var(--color-error)";
}
function scoreLabel(n: number) {
    if (n >= 90) return "Excellent";
    if (n >= 70) return "Good";
    return "Needs work";
}
function timeAgo(iso: string) {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
}
function lenColor(len: number, min: number, max: number) {
    if (len < min || len > max) return "var(--color-warning)";
    return "var(--color-success)";
}

// ─────────────────────────────────────────────────────────────────
// MICRO-COMPONENTS
// ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 14, w = "100%" }: { h?: number; w?: string | number }) {
    return (
        <div
            className={styles.skeleton}
            style={{ height: h, width: typeof w === "number" ? `${w}px` : w }}
        />
    );
}

function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
    return (
        <div className={styles.errorBanner}>
            <span>⚠ {msg}</span>
            <button className={styles.btnRetry} onClick={onRetry}>Retry</button>
        </div>
    );
}

function ScoreRing({ score, size = 110, stroke = 9, label }: {
    score: number; size?: number; stroke?: number; label: string;
}) {
    const [val, setVal] = useState(0);
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const off = circ - (val / 100) * circ;
    const col = scoreColor(score);

    useEffect(() => {
        setVal(0);
        let cur = 0;
        const step = score / 60;
        const t = setInterval(() => {
            cur = Math.min(cur + step, score);
            setVal(Math.round(cur));
            if (cur >= score) clearInterval(t);
        }, 16);
        return () => clearInterval(t);
    }, [score]);

    return (
        <div className={styles.ring} style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-primary)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.05s linear, stroke 0.3s" }} />
            </svg>
            <div className={styles.ringInner}>
                <span className={styles.ringScore} style={{ color: col }}>{val}</span>
                <span className={styles.ringLabel}>{label}</span>
            </div>
        </div>
    );
}

function MetricBar({ label, value, unit, max, good }: {
    label: string; value: number; unit: "s" | "ms" | "score"; max: number; good: number;
}) {
    const pct = Math.min((value / max) * 100, 100);
    const isGood = value <= good;
    const col = isGood ? "var(--color-success)" : "var(--color-warning)";
    const disp = unit === "score" ? value.toFixed(3) : unit === "ms" ? `${value}ms` : `${value.toFixed(2)}s`;
    return (
        <div className={styles.metricBar}>
            <div className={styles.metricBarHead}>
                <span className={styles.metricBarLabel}>{label}</span>
                <span className={styles.metricBarVal} style={{ color: col }}>{disp}</span>
            </div>
            <div className={styles.metricBarTrack}>
                <div className={styles.metricBarFill} style={{ width: `${pct}%`, background: col }} />
            </div>
        </div>
    );
}

function DevicePreview({ mode }: { mode: DeviceMode }) {
    const d = { desktop: { w: 900, h: 540, r: 8 }, tablet: { w: 430, h: 580, r: 20 }, mobile: { w: 235, h: 510, r: 34 } }[mode];
    return (
        <div className={styles.previewOuter}>
            <div className={styles.previewGlow} />
            <div className={styles.deviceFrame}
                style={{
                    width: d.w, maxWidth: "100%", height: d.h, borderRadius: d.r,
                    transition: "all 0.45s cubic-bezier(0.34,1.56,0.64,1)"
                }}>

                {mode === "desktop" && (
                    <div className={styles.browserBar}>
                        <div className={styles.browserDots}>
                            <span style={{ background: "#ff5f57" }} />
                            <span style={{ background: "#febc2e" }} />
                            <span style={{ background: "#28c840" }} />
                        </div>
                        <div className={styles.browserUrl}>
                            <LockIcon />{FRONTEND_URL.replace(/^https?:\/\//, "")}
                        </div>
                        <div style={{ width: 52 }} />
                    </div>
                )}
                {mode === "tablet" && <div className={styles.tabletCamera} />}
                {mode === "mobile" && <div className={styles.mobileNotch} />}

                <div className={styles.iframeWrap}>
                    {/*
           * key={mode} forces a full remount when device switches,
           * giving a clean render for each viewport.
           *
           * src comes from NEXT_PUBLIC_FRONTEND_URL in your .env file.
           * For localhost dev this just loads your Next.js dev server.
           * In production it loads your live frontend domain.
           */}
                    <iframe
                        key={mode}
                        src={FRONTEND_URL}
                        className={styles.iframe}
                        title="Live store preview"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                </div>

                {mode === "mobile" && <div className={styles.homeIndicator} />}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function OnlineStorePage() {
    const [device, setDevice] = useState<DeviceMode>("desktop");

    // SEO
    const [seoState, setSeoState] = useState<FetchState>("idle");
    const [seoData, setSeoData] = useState<SeoData | null>(null);
    const [seoErr, setSeoErr] = useState("");

    // Performance
    const [perfState, setPerfState] = useState<FetchState>("idle");
    const [perfData, setPerfData] = useState<PerfData | null>(null);
    const [perfErr, setPerfErr] = useState("");

    // ── 1. Your SEO endpoint ───────────────────────────────────────
    const fetchSeo = useCallback(async () => {
        setSeoState("loading");
        setSeoErr("");
        try {
            /*
             * This calls YOUR backend: GET /seo/static/home
             * The path is relative — it uses the same origin as the admin.
             * If your API is on a different domain, use the full URL:
             *   fetch("https://api.yourdomain.com/seo/static/home", {
             *     headers: { Authorization: `Bearer ${token}` }
             *   })
             */
            const res = await fetch("/seo/static/home");
            if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message ?? "API returned success: false");
            setSeoData(json.data as SeoData);
            setSeoState("success");
        } catch (e: unknown) {
            setSeoErr((e as Error)?.message ?? "Failed to load SEO data");
            setSeoState("error");
        }
    }, []);

    // ── 2. Google PageSpeed Insights ──────────────────────────────
    const fetchPerf = useCallback(async () => {
        if (!PAGESPEED_KEY) {
            setPerfErr("Set NEXT_PUBLIC_PAGESPEED_API_KEY in your .env file");
            setPerfState("error");
            return;
        }
        setPerfState("loading");
        setPerfErr("");
        try {
            /*
             * PageSpeed Insights v5 — direct browser call (safe for admin panel).
             * The key is restricted to your domain in Google Cloud Console.
             *
             * If you'd rather keep the key server-side (recommended for production):
             *   1. Create  GET /api/pagespeed  in your Next.js app
             *   2. That route calls PSI with the server-side env var
             *   3. Cache the result for 6 hours (PSI rate limit: 25k reqs/day free)
             *   Then just change the fetch URL below to "/api/pagespeed"
             */
            const params = new URLSearchParams({
                url: FRONTEND_URL,
                strategy: "mobile",       // "mobile" recommended — more strict
                category: "performance",
                key: PAGESPEED_KEY,
            });
            const res = await fetch(
                `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
            );
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody?.error?.message ?? `HTTP ${res.status}`);
            }
            setPerfData(parsePSI(await res.json()));
            setPerfState("success");
        } catch (e: unknown) {
            setPerfErr((e as Error)?.message ?? "PageSpeed fetch failed");
            setPerfState("error");
        }
    }, []);

    useEffect(() => { fetchSeo(); fetchPerf(); }, [fetchSeo, fetchPerf]);

    // Derived
    const seoScore = seoData ? calcSeoScore(seoData) : 0;
    const storeUrl = FRONTEND_URL.replace(/^https?:\/\//, "");

    // ─────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>

            {/* ══ TOP BAR ════════════════════════════════════════════ */}
            <header className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <div className={styles.storeFavicon}>⚡</div>

                    <div>
                        {seoState === "loading" ? (
                            <><Skeleton h={15} w={180} /><div style={{ height: 4 }} /><Skeleton h={11} w={130} /></>
                        ) : seoData ? (
                            <>
                                {/* Brand name = everything before the separator in meta_title */}
                                <div className={styles.storeName}>
                                    {seoData.meta_title.split(/[|–—]/)[0].trim()}
                                </div>
                                <div className={styles.storeUrl}><GlobeIcon /> {storeUrl}</div>
                            </>
                        ) : (
                            <div className={styles.storeName}>FusionTools</div>
                        )}
                    </div>

                    {/* Status → derived from seo.status */}
                    {seoData && (
                        <span className={styles.statusPill} style={{
                            color: seoData.status === "active" ? "var(--color-success)" : "var(--color-warning)",
                            borderColor: seoData.status === "active" ? "var(--color-success)" : "var(--color-warning)",
                            background: seoData.status === "active" ? "rgba(16,185,129,.1)" : "rgba(245,158,11,.1)",
                        }}>
                            <span className={styles.statusDot} style={{
                                background: seoData.status === "active" ? "var(--color-success)" : "var(--color-warning)",
                            }} />
                            {seoData.status === "active" ? "Live" : "Inactive"}
                        </span>
                    )}

                    {seoData?.updated_at && (
                        <span className={styles.topBarMeta}>
                            SEO updated {timeAgo(seoData.updated_at)}
                        </span>
                    )}
                </div>

                <div className={styles.topBarRight}>
                    <Link href="/admin/online-store">
                        <button className={styles.btnGhost}>
                            <EditIcon /> Customize
                        </button>
                    </Link>
                    <a href={FRONTEND_URL} target="_blank" rel="noreferrer" className={styles.btnPrimary}>
                        <ExternalIcon /> Visit Store
                    </a>
                </div>
            </header>

            {/* ══ COMMAND CENTER ═════════════════════════════════════ */}
            <div className={styles.commandCenter}>

                {/* ── LEFT: Preview ─────────────────────────────────── */}
                <section className={styles.previewPanel}>
                    <div className={styles.deviceBar}>
                        <div className={styles.deviceTabs}>
                            {(["desktop", "tablet", "mobile"] as DeviceMode[]).map(m => (
                                <button key={m}
                                    className={`${styles.deviceTab} ${device === m ? styles.deviceTabActive : ""}`}
                                    onClick={() => setDevice(m)}>
                                    {m === "desktop" ? <DesktopIcon /> : m === "tablet" ? <TabletIcon /> : <MobileIcon />}
                                    <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                                </button>
                            ))}
                        </div>
                        <div className={styles.deviceBarRight}>
                            <span className={styles.liveDot} />
                            <span className={styles.liveLabel}>{storeUrl}</span>
                            <button className={styles.btnMini} onClick={() => {
                                const c = device;
                                setDevice(c === "desktop" ? "tablet" : "desktop");
                                setTimeout(() => setDevice(c), 60);
                            }}>
                                <RefreshIcon /> Refresh
                            </button>
                        </div>
                    </div>

                    <DevicePreview mode={device} />

                    <div className={styles.themeStrip}>
                        <div className={styles.themeStripLeft}>
                            <span className={styles.themeIcon}>🌐</span>
                            <div>
                                <span className={styles.themeName}>Previewing: {FRONTEND_URL}</span>
                                <span className={styles.themeVersion}>
                                    {seoData
                                        ? `Sitemap priority ${seoData.priority} · ${seoData.changefreq} crawl`
                                        : "Loading…"}
                                </span>
                            </div>
                        </div>
                        <a href={`${FRONTEND_URL}/sitemap.xml`} target="_blank" rel="noreferrer"
                            className={styles.btnOutline}>
                            View sitemap
                        </a>
                    </div>
                </section>

                {/* ── RIGHT: Intelligence Panel ──────────────────────── */}
                <aside className={styles.intelPanel}>

                    {/* ─── CARD: SEO Health ─── Source: /seo/static/home ── */}
                    <div className={styles.intelCard}>
                        <div className={styles.intelCardHead}>
                            <span className={styles.intelCardTitle}><SearchIcon /> SEO Health</span>
                            {seoState === "success" && (
                                <span className={styles.scoreChip} style={{
                                    color: scoreColor(seoScore), borderColor: scoreColor(seoScore),
                                    background: `${scoreColor(seoScore)}14`,
                                }}>
                                    {seoScore}/100
                                </span>
                            )}
                        </div>

                        {seoState === "loading" && (
                            <div className={styles.skeletonStack}>
                                <div style={{ display: "flex", gap: "var(--space-4)" }}>
                                    <Skeleton h={90} w={90} />
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                                        <Skeleton h={14} /><Skeleton h={14} /><Skeleton h={14} /><Skeleton h={14} />
                                    </div>
                                </div>
                                <Skeleton h={40} /><Skeleton h={40} /><Skeleton h={40} />
                            </div>
                        )}
                        {seoState === "error" && <ErrorBanner msg={seoErr} onRetry={fetchSeo} />}

                        {seoState === "success" && seoData && (
                            <>
                                {/* Score ring + boolean checks */}
                                <div className={styles.perfLayout} style={{ marginBottom: "var(--space-4)" }}>
                                    <ScoreRing score={seoScore} label="SEO" size={100} stroke={8} />
                                    <div className={styles.seoChecks}>
                                        {[
                                            { label: "Indexable", pass: !seoData.noindex },
                                            { label: "Follow links", pass: !seoData.nofollow },
                                            { label: "Canonical", pass: !!seoData.canonical_url },
                                            { label: "Active", pass: seoData.status === "active" },
                                        ].map(c => (
                                            <div key={c.label} className={styles.seoCheck}>
                                                <span className={c.pass ? styles.seoPass : styles.seoFail}>
                                                    {c.pass ? "✓" : "✗"}
                                                </span>
                                                <span>{c.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Meta fields — all straight from your API response */}
                                <div className={styles.seoMeta}>
                                    <div className={styles.seoMetaItem}>
                                        <span className={styles.seoMetaLabel}>
                                            Title&nbsp;
                                            <span style={{ color: lenColor(seoData.meta_title.length, 30, 60), fontWeight: 700 }}>
                                                ({seoData.meta_title.length}/60)
                                            </span>
                                        </span>
                                        <span className={styles.seoMetaVal}>{seoData.meta_title}</span>
                                    </div>

                                    <div className={styles.seoMetaItem}>
                                        <span className={styles.seoMetaLabel}>
                                            Description&nbsp;
                                            <span style={{ color: lenColor(seoData.meta_description.length, 80, 160), fontWeight: 700 }}>
                                                ({seoData.meta_description.length}/160)
                                            </span>
                                        </span>
                                        <span className={styles.seoMetaVal}>{seoData.meta_description}</span>
                                    </div>

                                    <div className={styles.seoMetaItem}>
                                        <span className={styles.seoMetaLabel}>
                                            Keywords ({seoData.meta_keywords.length})
                                        </span>
                                        <div className={styles.kwWrap}>
                                            {seoData.meta_keywords.map(kw => (
                                                <span key={kw} className={styles.kwChip}>{kw}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.seoMetaItem}>
                                        <span className={styles.seoMetaLabel}>Canonical URL</span>
                                        <span className={styles.seoMetaVal} style={{
                                            fontFamily: "monospace", fontSize: "11px", color: "var(--color-info)"
                                        }}>
                                            {seoData.canonical_url}
                                        </span>
                                    </div>
                                </div>

                                <a href="/admin/settings/seo" className={styles.btnOutline}
                                    style={{ marginTop: "var(--space-4)", width: "100%", justifyContent: "center" }}>
                                    Edit SEO settings →
                                </a>
                            </>
                        )}
                    </div>

                    {/* ─── CARD: Performance ─── Source: Google PageSpeed ── */}
                    <div className={styles.intelCard}>
                        <div className={styles.intelCardHead}>
                            <span className={styles.intelCardTitle}><SpeedIcon /> Performance</span>
                            {perfState === "success" && perfData && (
                                <span className={styles.scoreChip} style={{
                                    color: scoreColor(perfData.score), borderColor: scoreColor(perfData.score),
                                    background: `${scoreColor(perfData.score)}14`,
                                }}>
                                    {scoreLabel(perfData.score)}
                                </span>
                            )}
                            {perfState === "loading" && (
                                <span className={styles.scoreChip} style={{
                                    color: "var(--text-tertiary)", borderColor: "var(--border-primary)",
                                    background: "var(--bg-secondary)",
                                }}>
                                    Analyzing…
                                </span>
                            )}
                        </div>

                        {perfState === "loading" && (
                            <div className={styles.skeletonStack}>
                                <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
                                    <Skeleton h={110} w={110} />
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                                        <Skeleton h={14} /><Skeleton h={14} /><Skeleton h={14} /><Skeleton h={14} />
                                    </div>
                                </div>
                                {/* Honest UX note — PSI is genuinely slow */}
                                <div className={styles.psiNote}>
                                    <span>⏱</span>
                                    <span>
                                        Google is running Lighthouse on <strong>{storeUrl}</strong>.
                                        This takes 5–15 seconds — please wait…
                                    </span>
                                </div>
                            </div>
                        )}
                        {perfState === "error" && <ErrorBanner msg={perfErr} onRetry={fetchPerf} />}

                        {perfState === "success" && perfData && (
                            <>
                                <div className={styles.perfLayout}>
                                    <ScoreRing score={perfData.score} label="Score" size={110} stroke={9} />
                                    <div className={styles.cwvList}>
                                        {/* Good thresholds from web.dev/vitals */}
                                        <MetricBar label="LCP" value={perfData.lcp / 1000} unit="s" max={4} good={2.5} />
                                        <MetricBar label="FID" value={perfData.fid} unit="ms" max={300} good={100} />
                                        <MetricBar label="CLS" value={perfData.cls} unit="score" max={0.5} good={0.1} />
                                        <MetricBar label="TTFB" value={perfData.ttfb / 1000} unit="s" max={1.8} good={0.8} />
                                    </div>
                                </div>
                                {/* FCP extra row */}
                                <div className={styles.fcpRow}>
                                    <span className={styles.fcpLabel}>First Contentful Paint (FCP)</span>
                                    <span className={styles.fcpVal}
                                        style={{ color: perfData.fcp <= 1800 ? "var(--color-success)" : "var(--color-warning)" }}>
                                        {(perfData.fcp / 1000).toFixed(2)}s
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Footer */}
                        <div className={styles.psiFooter}>
                            <span>Powered by Google PageSpeed Insights · Mobile</span>
                            {perfState === "success" && (
                                <button className={styles.btnMini} onClick={fetchPerf}>
                                    <RefreshIcon /> Re-run
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ─── CARD: Traffic ─── Placeholder ─────────────────── */}
                    <div className={styles.intelCard}>
                        <div className={styles.intelCardHead}>
                            <span className={styles.intelCardTitle}><ActivityIcon /> Traffic</span>
                            <span className={styles.scoreChip} style={{
                                color: "var(--text-tertiary)", borderColor: "var(--border-primary)",
                                background: "var(--bg-secondary)",
                            }}>
                                Not connected
                            </span>
                        </div>
                        <div className={styles.trafficPlaceholder}>
                            <div className={styles.tpIcon}>📊</div>
                            <p className={styles.tpTitle}>Connect an analytics provider</p>
                            <p className={styles.tpDesc}>
                                Add <strong>Plausible</strong>, <strong>GA4</strong>, or <strong>Umami</strong> to
                                see live visitors, bounce rate, and session data here.
                            </p>
                            <div className={styles.tpOptions}>
                                {[
                                    { n: "Plausible", b: "$9/mo", i: "📈" },
                                    { n: "GA4", b: "Free", i: "📉" },
                                    { n: "Umami", b: "Self-host", i: "🦉" },
                                ].map(p => (
                                    <div key={p.n} className={styles.tpOption}>
                                        <span>{p.i}</span>
                                        <span className={styles.tpOptName}>{p.n}</span>
                                        <span className={styles.tpOptBadge}>{p.b}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────
const GlobeIcon = () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M8 1.5c0 0-3 2-3 6.5s3 6.5 3 6.5M8 1.5c0 0 3 2 3 6.5S8 14.5 8 14.5M1.5 8h13" stroke="currentColor" strokeWidth="1.4" /></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
const ExternalIcon = () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9M10 2h4v4M14 2L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const DesktopIcon = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="1" y="2" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M6 16h6M9 13v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const TabletIcon = () => <svg width="14" height="16" viewBox="0 0 14 18" fill="none"><rect x="1" y="1" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" /><circle cx="7" cy="15" r="0.8" fill="currentColor" /></svg>;
const MobileIcon = () => <svg width="11" height="16" viewBox="0 0 11 18" fill="none"><rect x="1" y="1" width="9" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" /><circle cx="5.5" cy="15" r="0.8" fill="currentColor" /></svg>;
const RefreshIcon = () => <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M12 7A5 5 0 112 7M12 7V3M12 7h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ActivityIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8h3l2-5 3 10 2-6 2 1h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const SpeedIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 4a5 5 0 100 8M8 8l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8" cy="8" r="1" fill="currentColor" /></svg>;
const SearchIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" /><path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const ZapIcon = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 1L2 9h5l-1 6 7-9H8l1-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>;
const LockIcon = () => <svg width="10" height="10" viewBox="0 0 12 14" fill="none"><rect x="1" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 6V4a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.2" /></svg>;
const ChevronRight = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;