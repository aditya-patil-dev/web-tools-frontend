"use client";

import { useEffect, useState, useRef } from "react";

/* ─────────────────────────────────────────
   TOOL DEMO DEFINITIONS
   Each tool has its own visual "scene"
───────────────────────────────────────── */
type DemoScene =
    | { kind: "bg-remover" }
    | { kind: "pdf-to-word" }
    | { kind: "img-compressor" };

interface ToolDemo {
    tool: string;
    tagline: string;
    color: string;
    accent: string;
    scene: DemoScene;
    stats: { label: string; value: string }[];
}

const DEMOS: ToolDemo[] = [
    {
        tool: "AI Background Remover",
        tagline: "Subject detected · Background erased",
        color: "#7c3aed",
        accent: "#a78bfa",
        scene: { kind: "bg-remover" },
        stats: [
            { label: "Processed in", value: "1.2s" },
            { label: "AI Model", value: "✓ Local" },
            { label: "Cost", value: "Free" },
        ],
    },
    {
        tool: "PDF to Word Converter",
        tagline: "Layout preserved · Fully editable",
        color: "#0369a1",
        accent: "#38bdf8",
        scene: { kind: "pdf-to-word" },
        stats: [
            { label: "Converted in", value: "0.8s" },
            { label: "Formatting", value: "✓ Kept" },
            { label: "Cost", value: "Free" },
        ],
    },
    {
        tool: "Image Compressor",
        tagline: "68% smaller · Zero quality loss",
        color: "#065f46",
        accent: "#34d399",
        scene: { kind: "img-compressor" },
        stats: [
            { label: "Saved", value: "1.4 MB" },
            { label: "Quality", value: "✓ 94%" },
            { label: "Cost", value: "Free" },
        ],
    },
];

/* ─────────────────────────────────────────
   PHASE TIMING (ms)
───────────────────────────────────────── */
const PHASE_DURATIONS = {
    idle: 600,
    processing: 1800,
    result: 3000,
};

type Phase = "idle" | "processing" | "result";

/* ─────────────────────────────────────────
   SUB-COMPONENTS — one per tool scene
───────────────────────────────────────── */

/** AI Background Remover scene */
function BgRemoverScene({ phase }: { phase: Phase }) {
    return (
        <div className="hd-scene hd-scene-bgr">
            {/* Split: before / after */}
            <div className="hd-bgr-before">
                {/* Fake photo with busy background */}
                <div className="hd-bgr-photo">
                    <div className="hd-bgr-bg-noise" />
                    <div className="hd-bgr-subject" />
                    <div className="hd-bgr-label">Original</div>
                </div>
            </div>
            <div className={`hd-bgr-after ${phase === "result" ? "hd-bgr-after-show" : ""}`}>
                <div className="hd-bgr-photo hd-bgr-photo-clean">
                    {/* Transparent checkerboard */}
                    <div className="hd-bgr-checker" />
                    <div className="hd-bgr-subject hd-bgr-subject-clean" />
                    <div className="hd-bgr-label hd-bgr-label-after">Removed ✓</div>
                </div>
            </div>
            {/* Animated scan line during processing */}
            {phase === "processing" && <div className="hd-bgr-scan" />}
            {/* AI detection box */}
            {phase !== "idle" && (
                <div className={`hd-bgr-detect-box ${phase === "result" ? "hd-bgr-detect-done" : ""}`} />
            )}
        </div>
    );
}

/** PDF to Word scene */
function PdfToWordScene({ phase }: { phase: Phase }) {
    return (
        <div className="hd-scene hd-scene-p2w">
            {/* PDF card */}
            <div className="hd-p2w-card hd-p2w-pdf">
                <div className="hd-p2w-icon hd-p2w-icon-pdf">PDF</div>
                <div className="hd-p2w-lines">
                    <div className="hd-p2w-line hd-w-full" />
                    <div className="hd-p2w-line hd-w-3q" />
                    <div className="hd-p2w-line hd-w-full" />
                    <div className="hd-p2w-line hd-w-half" />
                </div>
                <div className="hd-p2w-filename">report_2025.pdf</div>
            </div>

            {/* Arrow + spinner */}
            <div className="hd-p2w-arrow-col">
                <div className={`hd-p2w-arrow ${phase === "processing" ? "hd-p2w-arrow-pulse" : ""}`}>
                    {phase === "processing" ? (
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="13" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round">
                                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.9s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                    ) : phase === "result" ? (
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="13" fill="#0ea5e9" fillOpacity="0.15" />
                            <path d="M10 16l4 4 8-8" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                            <path d="M2 8h24M18 2l6 6-6 6" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                {phase === "processing" && <div className="hd-p2w-converting">Converting…</div>}
            </div>

            {/* Word card */}
            <div className={`hd-p2w-card hd-p2w-word ${phase === "result" ? "hd-p2w-word-show" : ""}`}>
                <div className="hd-p2w-icon hd-p2w-icon-word">W</div>
                <div className="hd-p2w-lines">
                    <div className="hd-p2w-line hd-w-full hd-p2w-line-blue" />
                    <div className="hd-p2w-line hd-w-3q hd-p2w-line-blue" />
                    <div className="hd-p2w-line hd-w-full hd-p2w-line-blue" />
                    <div className="hd-p2w-line hd-w-half hd-p2w-line-blue" />
                </div>
                <div className="hd-p2w-filename hd-p2w-filename-word">report_2025.docx</div>
            </div>
        </div>
    );
}

/** Image Compressor scene */
function ImgCompressorScene({ phase }: { phase: Phase }) {
    const [displaySize, setDisplaySize] = useState(2100);
    const [quality, setQuality] = useState(100);

    useEffect(() => {
        if (phase === "processing") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisplaySize(2100);
            setQuality(100);
            const start = Date.now();
            const duration = PHASE_DURATIONS.processing;
            const tick = () => {
                const t = Math.min((Date.now() - start) / duration, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                setDisplaySize(Math.round(2100 - ease * 1430)); // 2100 → 670
                setQuality(Math.round(100 - ease * 6));          // 100 → 94
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
        if (phase === "idle") {
            setDisplaySize(2100);
            setQuality(100);
        }
    }, [phase]);

    const pct = Math.round(((2100 - displaySize) / 2100) * 100);

    return (
        <div className="hd-scene hd-scene-ic">
            {/* Image preview */}
            <div className="hd-ic-preview">
                <div className="hd-ic-img-mock">
                    <div className="hd-ic-mountain" />
                    <div className="hd-ic-sky" />
                    <div className="hd-ic-sun" />
                    {phase === "processing" && <div className="hd-ic-sweep" />}
                </div>
            </div>

            {/* Stats panel */}
            <div className="hd-ic-stats">
                <div className="hd-ic-row">
                    <span className="hd-ic-lbl">Original</span>
                    <span className="hd-ic-val">2,100 KB</span>
                </div>
                <div className="hd-ic-row">
                    <span className="hd-ic-lbl">Compressed</span>
                    <span className={`hd-ic-val ${phase !== "idle" ? "hd-ic-val-green" : ""}`}>
                        {displaySize.toLocaleString()} KB
                    </span>
                </div>
                <div className="hd-ic-bar-track">
                    <div
                        className="hd-ic-bar-fill"
                        style={{
                            width: phase === "idle" ? "100%" : `${100 - pct}%`,
                            transition: "width 0.1s linear",
                        }}
                    />
                </div>
                <div className="hd-ic-row">
                    <span className="hd-ic-lbl">Saved</span>
                    <span className={`hd-ic-val ${phase !== "idle" ? "hd-ic-val-green" : ""}`}>
                        {phase === "idle" ? "—" : `${pct}%`}
                    </span>
                </div>
                <div className="hd-ic-row">
                    <span className="hd-ic-lbl">Quality</span>
                    <span className="hd-ic-val">{quality}%</span>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function HeroAnimatedDemo() {
    const [demoIndex, setDemoIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("idle");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const demo = DEMOS[demoIndex];

    const clearTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    useEffect(() => {
        clearTimer();
        if (phase === "idle") {
            timerRef.current = setTimeout(() => setPhase("processing"), PHASE_DURATIONS.idle);
        } else if (phase === "processing") {
            timerRef.current = setTimeout(() => setPhase("result"), PHASE_DURATIONS.processing);
        } else if (phase === "result") {
            timerRef.current = setTimeout(() => {
                setPhase("idle");
                setDemoIndex((p) => (p + 1) % DEMOS.length);
            }, PHASE_DURATIONS.result);
        }
        return clearTimer;
    }, [phase, demoIndex]);

    const switchTo = (i: number) => {
        clearTimer();
        setDemoIndex(i);
        setPhase("idle");
    };

    return (
        <div className="hd-root" style={{ "--hd-color": demo.color, "--hd-accent": demo.accent } as React.CSSProperties}>
            {/* Top chrome bar */}
            <div className="hd-chrome">
                <div className="hd-dots">
                    <span className="hd-dot hd-dot-r" />
                    <span className="hd-dot hd-dot-y" />
                    <span className="hd-dot hd-dot-g" />
                </div>
                <div className="hd-tool-name">{demo.tool}</div>
                <div className="hd-live-badge">
                    <span className="hd-live-dot" />
                    Live
                </div>
            </div>

            {/* Scene area */}
            <div className="hd-scene-wrap">
                {demo.scene.kind === "bg-remover" && <BgRemoverScene phase={phase} />}
                {demo.scene.kind === "pdf-to-word" && <PdfToWordScene phase={phase} />}
                {demo.scene.kind === "img-compressor" && <ImgCompressorScene phase={phase} />}
            </div>

            {/* Status bar */}
            <div className="hd-status-bar">
                <div className="hd-status-left">
                    <span className={`hd-status-pill hd-status-${phase}`}>
                        {phase === "idle" && "Ready"}
                        {phase === "processing" && "Processing…"}
                        {phase === "result" && "Done ✓"}
                    </span>
                    <span className="hd-tagline">{demo.tagline}</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="hd-progress-track">
                <div className={`hd-progress-fill hd-progress-${phase}`} />
            </div>

            {/* Stats row */}
            <div className={`hd-stats-row ${phase === "result" ? "hd-stats-show" : ""}`}>
                {demo.stats.map((s) => (
                    <div className="hd-stat" key={s.label}>
                        <span className="hd-stat-val">{s.value}</span>
                        <span className="hd-stat-lbl">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Switcher */}
            <div className="hd-switcher">
                {DEMOS.map((d, i) => (
                    <button
                        key={i}
                        className={`hd-sw-btn ${i === demoIndex ? "hd-sw-active" : ""}`}
                        onClick={() => switchTo(i)}
                        title={d.tool}
                    >
                        <span className="hd-sw-dot" />
                        <span className="hd-sw-label">{d.tool}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}