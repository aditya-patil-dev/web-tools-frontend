"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Sparkles,
    Zap,
    ShieldCheck,
    Coffee,
    ArrowRight,
    HelpCircle,
    ChevronDown,
    Infinity as InfinityIcon,
    HeartHandshake,
    Gift,
    FileCode2,
    ImageIcon,
    Search,
    LockOpen,
    Check,
} from "lucide-react";

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const UNLIMITED_PERKS = [
    {
        title: "100% Free Forever",
        description: "No subscription fees, no surprise trials, and no hidden credit card charges. Ever.",
        icon: Gift,
        color: "#ff6b35",
        bgLight: "#fff7ed",
        borderLight: "#ffedd5",
    },
    {
        title: "Zero Usage Limits",
        description: "Unlimited conversions, compressions, SEO audits, and code transformations all day long.",
        icon: InfinityIcon,
        color: "#059669",
        bgLight: "#ecfdf5",
        borderLight: "#a7f3d0",
    },
    {
        title: "No Sign-Up Roadblocks",
        description: "Jump straight in. Use every tool instantly without having to create an account or verify email.",
        icon: LockOpen,
        color: "#4f46e5",
        bgLight: "#eef2ff",
        borderLight: "#c7d2fe",
    },
    {
        title: "No Watermarks, High Quality",
        description: "Export high-resolution images, clean documents, and raw code with zero watermarks.",
        icon: Sparkles,
        color: "#d97706",
        bgLight: "#fffbeb",
        borderLight: "#fde68a",
    },
    {
        title: "Privacy-First Client Processing",
        description: "Most tools run locally in your browser with WebAssembly. Your files never touch remote servers.",
        icon: ShieldCheck,
        color: "#0891b2",
        bgLight: "#ecfeff",
        borderLight: "#a5f3fc",
    },
    {
        title: "Blazing Fast Performance",
        description: "Built on modern multi-threaded Web Workers for immediate results without waiting in queues.",
        icon: Zap,
        color: "#db2777",
        bgLight: "#fdf2f8",
        borderLight: "#fbcfe8",
    },
];

const TOOL_CATEGORIES = [
    {
        title: "Image & Media Tools",
        count: "25+ Tools",
        icon: ImageIcon,
        href: "/tools/image-tools",
        color: "#ff6b35",
        bgLight: "#fff7ed",
        examples: "Compressor, Resizer, SVG/PNG Converters, Watermark Adder, Mockups",
    },
    {
        title: "SEO & SERP Analytics",
        count: "30+ Tools",
        icon: Search,
        href: "/seo",
        color: "#059669",
        bgLight: "#ecfdf5",
        examples: "SERP Preview, Meta Tag Generator, Robots.txt, Keyword Volume, OG Inspector",
    },
    {
        title: "Developer & Code Utilities",
        count: "40+ Tools",
        icon: FileCode2,
        href: "/tools",
        color: "#4f46e5",
        bgLight: "#eef2ff",
        examples: "JSON Prettifier, Base64 Encoder, JWT Inspector, Hash Generators, Regex Tester",
    },
    {
        title: "Keyword & Content Suite",
        count: "15+ Tools",
        icon: Zap,
        href: "/keyword-research",
        color: "#d97706",
        bgLight: "#fffbeb",
        examples: "Keyword Explorer, Search Intent Analyzer, Long-Tail Extractor, LSI Tools",
    },
];

const FAQS = [
    {
        q: "Is FusionTools really 100% free?",
        a: "Yes! Every single tool across our image, SEO, PDF, and developer suites is 100% free with unlimited usage. There are no paid tiers, paywalls, or restricted 'pro-only' tools.",
    },
    {
        q: "Do I need to enter a credit card or create an account?",
        a: "No! You do not need to enter a credit card, start a trial, or even register an account. You can visit any tool and start using it immediately with zero friction.",
    },
    {
        q: "Are there any hidden daily quotas or file size limits?",
        a: "No artificial limits. You can convert, compress, and analyze as many files as you need. Processing is optimized for both speed and large batches.",
    },
    {
        q: "Why is FusionTools completely free?",
        a: "We got tired of web utility sites that allow you 2 uses and then block you behind expensive monthly paywalls. FusionTools is built to be the internet's best open utility suite. Many of our tools run client-side in your browser, drastically lowering server overhead.",
    },
    {
        q: "Will these tools become paid in the future?",
        a: "Our core promise is that all basic and standard tools will ALWAYS remain 100% free. If we ever release compute-heavy enterprise server features in the future, standard tools will remain free forever.",
    },
    {
        q: "How can I support FusionTools?",
        a: "If our tools save you time, the best way to support us is by sharing FusionTools with your colleagues, bookmarking us, leaving feedback, or buying us a coffee!",
    },
];

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(index === 0);

    return (
        <div
            onClick={() => setOpen(!open)}
            style={{
                padding: "20px 24px",
                borderRadius: "16px",
                border: open ? "1.5px solid #fed7aa" : "1px solid #e2e8f0",
                background: open ? "#fffbf7" : "#ffffff",
                cursor: "pointer",
                transition: "all 200ms ease",
                boxShadow: open
                    ? "0 8px 24px -6px rgba(255, 107, 53, 0.12)"
                    : "0 2px 6px rgba(15, 23, 42, 0.04)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                }}
            >
                <span
                    style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: open ? "#ea580c" : "#1e293b",
                        transition: "color 200ms ease",
                        lineHeight: 1.4,
                    }}
                >
                    {q}
                </span>
                <div
                    style={{
                        flexShrink: 0,
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        background: open ? "#ffedd5" : "#f1f5f9",
                        border: `1px solid ${open ? "#fed7aa" : "#e2e8f0"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: open ? "#ea580c" : "#64748b",
                        transition: "transform 250ms ease, background 200ms ease",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    <ChevronDown size={16} />
                </div>
            </div>
            {open && (
                <p
                    style={{
                        marginTop: "14px",
                        fontSize: "14.5px",
                        color: "#475569",
                        lineHeight: 1.7,
                        animation: "fadeIn 200ms ease",
                    }}
                >
                    {a}
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Page Component (Light Theme)
// ─────────────────────────────────────────────

export default function PricingPage() {
    return (
        <>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.06); }
        }
        .pricing-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #ea580c;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 20px;
          box-shadow: 0 2px 6px rgba(255, 107, 53, 0.08);
        }
        .pricing-gradient-text {
          background: linear-gradient(135deg, #0f172a 20%, #ea580c 80%, #ff5722 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .main-free-card {
          position: relative;
          border-radius: 28px;
          border: 1.5px solid #fed7aa;
          background: linear-gradient(145deg, #ffffff 0%, #fffbf8 50%, #fff7f2 100%);
          padding: 44px;
          box-shadow: 0 25px 60px -15px rgba(255, 107, 53, 0.12), 0 10px 30px -10px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255, 107, 53, 0.08);
          overflow: hidden;
        }
        .perks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .perk-card {
          padding: 26px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          transition: all 250ms ease;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }
        .perk-card:hover {
          transform: translateY(-4px);
          border-color: #fdba74;
          box-shadow: 0 16px 35px -8px rgba(255, 107, 53, 0.12), 0 6px 15px rgba(15, 23, 42, 0.04);
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }
        .category-card {
          padding: 24px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          text-decoration: none;
          color: inherit;
          transition: all 250ms ease;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }
        .category-card:hover {
          transform: translateY(-4px);
          border-color: #fdba74;
          box-shadow: 0 16px 35px -8px rgba(255, 107, 53, 0.14), 0 6px 15px rgba(15, 23, 42, 0.04);
        }
        .cta-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ff6b35 0%, #ea580c 100%);
          color: #ffffff !important;
          font-weight: 700;
          font-size: 16px;
          text-decoration: none;
          box-shadow: 0 10px 25px -4px rgba(255, 107, 53, 0.4);
          transition: all 250ms ease;
          border: none;
        }
        .cta-primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px -4px rgba(255, 107, 53, 0.55);
          background: linear-gradient(135deg, #ff5722 0%, #c2410c 100%);
        }
        .cta-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 32px;
          border-radius: 14px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          color: #1e293b;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
          transition: all 250ms ease;
        }
        .cta-secondary-btn:hover {
          background: #f8fafc;
          border-color: #ea580c;
          color: #ea580c;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(15, 23, 42, 0.08);
        }
        @media (max-width: 768px) {
          .main-free-card {
            padding: 28px 20px;
          }
          .cta-actions-row {
            flex-direction: column !important;
            width: 100%;
          }
          .cta-primary-btn, .cta-secondary-btn {
            width: 100%;
          }
        }
      `}</style>

            <div
                style={{
                    position: "relative",
                    minHeight: "100vh",
                    backgroundColor: "#f8fafc",
                    backgroundImage:
                        "radial-gradient(#e2e8f0 1px, transparent 1px), radial-gradient(#e2e8f0 1px, #f8fafc 1px)",
                    backgroundSize: "40px 40px",
                    backgroundPosition: "0 0, 20px 20px",
                    color: "#0f172a",
                    paddingTop: "60px",
                    paddingBottom: "100px",
                    overflow: "hidden",
                }}
            >
                {/* Soft light decorative background glows */}
                <div
                    style={{
                        position: "absolute",
                        top: "2%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "850px",
                        height: "450px",
                        background:
                            "radial-gradient(ellipse at center, rgba(255, 107, 53, 0.12) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 75%)",
                        filter: "blur(80px)",
                        pointerEvents: "none",
                        animation: "pulseGlow 8s ease-in-out infinite",
                    }}
                />

                <div
                    style={{
                        maxWidth: "1160px",
                        margin: "0 auto",
                        padding: "0 24px",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    {/* ── 1. Hero Section ── */}
                    <section style={{ textAlign: "center", marginBottom: "56px" }}>
                        <div className="pricing-hero-badge">
                            <Sparkles size={14} />
                            Open & Free Access • Zero Paywalls
                        </div>

                        <h1
                            style={{
                                fontSize: "clamp(34px, 5.5vw, 56px)",
                                fontWeight: 900,
                                letterSpacing: "-0.03em",
                                lineHeight: 1.15,
                                marginBottom: "20px",
                                color: "#0f172a",
                            }}
                        >
                            All Tools Are <span className="pricing-gradient-text">100% Free</span>
                            <br />
                            With Unlimited Usage
                        </h1>

                        <p
                            style={{
                                maxWidth: "680px",
                                margin: "0 auto 28px auto",
                                fontSize: "17.5px",
                                color: "#475569",
                                lineHeight: 1.65,
                            }}
                        >
                            No subscription traps, no paywalls, and no credit card required.
                            Every single SEO, image, developer, and media tool on FusionTools
                            is completely free for everyone to use without limits.
                        </p>

                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 20px",
                                borderRadius: "9999px",
                                background: "#ecfdf5",
                                border: "1px solid #a7f3d0",
                                color: "#047857",
                                fontSize: "13.5px",
                                fontWeight: 700,
                                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.08)",
                            }}
                        >
                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#10b981",
                                    boxShadow: "0 0 8px #10b981",
                                }}
                            />
                            System Live: 100+ Free Tools Online & Ready
                        </div>
                    </section>

                    {/* ── 2. The Main "100% Free Plan" Highlight Card ── */}
                    <section style={{ marginBottom: "80px" }}>
                        <div className="main-free-card">
                            {/* Top Vibrant Accent Bar */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: "0",
                                    left: "0",
                                    right: "0",
                                    height: "4px",
                                    background:
                                        "linear-gradient(90deg, #ff6b35, #f59e0b, #10b981, #6366f1)",
                                }}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "24px",
                                    borderBottom: "1px solid #f1f5f9",
                                    paddingBottom: "32px",
                                    marginBottom: "36px",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <h2
                                            style={{
                                                fontSize: "28px",
                                                fontWeight: 800,
                                                color: "#0f172a",
                                                letterSpacing: "-0.02em",
                                                margin: 0,
                                            }}
                                        >
                                            The Community Pass
                                        </h2>
                                        <span
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: "9999px",
                                                background: "#ecfdf5",
                                                border: "1px solid #a7f3d0",
                                                color: "#059669",
                                                fontSize: "12px",
                                                fontWeight: 800,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.04em",
                                            }}
                                        >
                                            Active Forever
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: "15px",
                                            color: "#64748b",
                                            margin: 0,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Complete and unrestricted access to every tool, converter,
                                        and analyzer on the platform.
                                    </p>
                                </div>

                                {/* Price Display */}
                                <div style={{ textAlign: "right" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "baseline",
                                            justifyContent: "flex-end",
                                            gap: "8px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "20px",
                                                color: "#94a3b8",
                                                textDecoration: "line-through",
                                                fontWeight: 600,
                                            }}
                                        >
                                            $29/mo
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "52px",
                                                fontWeight: 900,
                                                color: "#0f172a",
                                                letterSpacing: "-0.04em",
                                                lineHeight: 1,
                                            }}
                                        >
                                            $0
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "18px",
                                                color: "#059669",
                                                fontWeight: 800,
                                            }}
                                        >
                                            / Free
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: "13px",
                                            color: "#64748b",
                                            marginTop: "4px",
                                            display: "block",
                                            fontWeight: 500,
                                        }}
                                    >
                                        No credit card • No subscription • Instant access
                                    </span>
                                </div>
                            </div>

                            {/* What You Get Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                                    gap: "16px",
                                    marginBottom: "40px",
                                }}
                            >
                                {[
                                    "Unlimited daily tool executions",
                                    "Access to all 100+ public tools",
                                    "No registration or login required",
                                    "No watermarks on generated files",
                                    "Full-resolution image & PDF exports",
                                    "Client-side private processing",
                                    "Fast server conversions with zero queue",
                                    "Direct developer support & tool requests",
                                ].map((perk, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "14px 18px",
                                            borderRadius: "14px",
                                            background: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 2px 5px rgba(15, 23, 42, 0.02)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "22px",
                                                height: "22px",
                                                borderRadius: "50%",
                                                background: "#ecfdf5",
                                                border: "1px solid #a7f3d0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#059669",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span
                                            style={{
                                                fontSize: "14px",
                                                color: "#1e293b",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {perk}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons Row */}
                            <div
                                className="cta-actions-row"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <Link href="/tools" className="cta-primary-btn">
                                    Browse All Free Tools
                                    <ArrowRight size={18} />
                                </Link>

                                <Link href="/contact" className="cta-secondary-btn">
                                    <Coffee size={18} style={{ color: "#ea580c" }} />
                                    Request a Tool or Feature
                                </Link>

                                <span
                                    style={{
                                        fontSize: "13.5px",
                                        color: "#64748b",
                                        marginLeft: "auto",
                                        fontWeight: 500,
                                    }}
                                >
                                    ⚡ Start using tools in under 5 seconds
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ── 3. Why Unlimited & Free? ── */}
                    <section style={{ marginBottom: "80px" }}>
                        <div style={{ textAlign: "center", marginBottom: "40px" }}>
                            <h2
                                style={{
                                    fontSize: "30px",
                                    fontWeight: 800,
                                    letterSpacing: "-0.02em",
                                    marginBottom: "12px",
                                    color: "#0f172a",
                                }}
                            >
                                Everything You Need, Built Without Restrictions
                            </h2>
                            <p
                                style={{
                                    color: "#64748b",
                                    fontSize: "16px",
                                    maxWidth: "600px",
                                    margin: "0 auto",
                                }}
                            >
                                Here is why thousands of creators, engineers, and marketers rely on
                                FusionTools daily.
                            </p>
                        </div>

                        <div className="perks-grid">
                            {UNLIMITED_PERKS.map((perk, i) => {
                                const Icon = perk.icon;
                                return (
                                    <div key={i} className="perk-card">
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "14px",
                                                background: perk.bgLight,
                                                border: `1px solid ${perk.borderLight}`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: perk.color,
                                                marginBottom: "18px",
                                            }}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <h3
                                            style={{
                                                fontSize: "17.5px",
                                                fontWeight: 700,
                                                color: "#0f172a",
                                                marginBottom: "8px",
                                            }}
                                        >
                                            {perk.title}
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "14px",
                                                color: "#64748b",
                                                lineHeight: 1.6,
                                                margin: 0,
                                            }}
                                        >
                                            {perk.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* ── 4. Explore Free Tool Suites ── */}
                    <section style={{ marginBottom: "80px" }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "space-between",
                                gap: "20px",
                                marginBottom: "32px",
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        fontSize: "28px",
                                        fontWeight: 800,
                                        letterSpacing: "-0.02em",
                                        marginBottom: "8px",
                                        color: "#0f172a",
                                    }}
                                >
                                    Explore Our Complete Free Suites
                                </h2>
                                <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>
                                    Categorized utilities ready to boost your workflow immediately.
                                </p>
                            </div>

                            <Link
                                href="/tools"
                                style={{
                                    color: "#ea580c",
                                    fontSize: "14.5px",
                                    fontWeight: 700,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    textDecoration: "none",
                                }}
                            >
                                View all tool categories
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="categories-grid">
                            {TOOL_CATEGORIES.map((cat, i) => {
                                const Icon = cat.icon;
                                return (
                                    <Link key={i} href={cat.href} className="category-card">
                                        <div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    marginBottom: "16px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "44px",
                                                        height: "44px",
                                                        borderRadius: "12px",
                                                        background: cat.bgLight,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: cat.color,
                                                    }}
                                                >
                                                    <Icon size={22} />
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        fontWeight: 700,
                                                        padding: "4px 10px",
                                                        borderRadius: "9999px",
                                                        background: "#f1f5f9",
                                                        color: "#475569",
                                                    }}
                                                >
                                                    {cat.count}
                                                </span>
                                            </div>
                                            <h3
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: 700,
                                                    color: "#0f172a",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                {cat.title}
                                            </h3>
                                            <p
                                                style={{
                                                    fontSize: "13.5px",
                                                    color: "#64748b",
                                                    lineHeight: 1.55,
                                                    marginBottom: "18px",
                                                }}
                                            >
                                                {cat.examples}
                                            </p>
                                        </div>

                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                fontSize: "13.5px",
                                                fontWeight: 700,
                                                color: cat.color,
                                            }}
                                        >
                                            Open category <ArrowRight size={14} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* ── 5. Our Transparency & Philosophy ── */}
                    <section style={{ marginBottom: "80px" }}>
                        <div
                            style={{
                                borderRadius: "24px",
                                border: "1.5px solid #fed7aa",
                                background:
                                    "linear-gradient(135deg, #fff7ed 0%, #fffbf8 50%, #ffffff 100%)",
                                padding: "40px 44px",
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "28px",
                                boxShadow: "0 10px 30px -10px rgba(255, 107, 53, 0.08)",
                            }}
                        >
                            <div style={{ maxWidth: "660px" }}>
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        color: "#ea580c",
                                        fontSize: "13px",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <HeartHandshake size={16} />
                                    Our Open Promise
                                </div>
                                <h3
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: 800,
                                        color: "#0f172a",
                                        marginBottom: "12px",
                                    }}
                                >
                                    Why We Don't Charge for Core Tools
                                </h3>
                                <p
                                    style={{
                                        fontSize: "15px",
                                        color: "#475569",
                                        lineHeight: 1.7,
                                        margin: 0,
                                    }}
                                >
                                    Most tool websites charge hefty monthly subscriptions for basic
                                    tasks like resizing a picture, formatting a snippet of JSON, or
                                    previewing search meta tags. We built FusionTools to solve this.
                                    By running computations client-side in your browser wherever
                                    possible, we keep our infrastructure lightweight and pass 100% of
                                    those savings to you.
                                </p>
                            </div>

                            <div>
                                <Link
                                    href="/about"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "14px 26px",
                                        borderRadius: "12px",
                                        background: "#ffffff",
                                        border: "1.5px solid #cbd5e1",
                                        color: "#0f172a",
                                        fontWeight: 700,
                                        fontSize: "14.5px",
                                        textDecoration: "none",
                                        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.05)",
                                        transition: "all 200ms ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#ea580c";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "#ea580c";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#cbd5e1";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "#0f172a";
                                    }}
                                >
                                    Learn About Our Mission
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* ── 6. FAQ Section ── */}
                    <section style={{ marginBottom: "80px" }}>
                        <div style={{ textAlign: "center", marginBottom: "40px" }}>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "#ea580c",
                                    fontSize: "13px",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    marginBottom: "8px",
                                }}
                            >
                                <HelpCircle size={15} />
                                Frequently Asked Questions
                            </div>
                            <h2
                                style={{
                                    fontSize: "30px",
                                    fontWeight: 800,
                                    letterSpacing: "-0.02em",
                                    marginBottom: "10px",
                                    color: "#0f172a",
                                }}
                            >
                                Got Questions About Free Access?
                            </h2>
                            <p
                                style={{
                                    color: "#64748b",
                                    fontSize: "15px",
                                    maxWidth: "520px",
                                    margin: "0 auto",
                                }}
                            >
                                Everything you need to know about our pricing philosophy and platform.
                            </p>
                        </div>

                        <div
                            style={{
                                maxWidth: "780px",
                                margin: "0 auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: "14px",
                            }}
                        >
                            {FAQS.map((item, i) => (
                                <FaqItem key={i} q={item.q} a={item.a} index={i} />
                            ))}
                        </div>
                    </section>

                    {/* ── 7. Bottom Conversion Banner ── */}
                    <section>
                        <div
                            style={{
                                borderRadius: "28px",
                                background:
                                    "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #fff1eb 100%)",
                                border: "1.5px solid #fed7aa",
                                padding: "48px 32px",
                                textAlign: "center",
                                boxShadow:
                                    "0 20px 50px -15px rgba(255, 107, 53, 0.12), 0 10px 20px -10px rgba(15, 23, 42, 0.04)",
                            }}
                        >
                            <h2
                                style={{
                                    fontSize: "clamp(26px, 4vw, 36px)",
                                    fontWeight: 900,
                                    letterSpacing: "-0.02em",
                                    marginBottom: "14px",
                                    color: "#0f172a",
                                }}
                            >
                                Ready to Start Using 100+ Free Tools?
                            </h2>
                            <p
                                style={{
                                    color: "#475569",
                                    fontSize: "16px",
                                    maxWidth: "540px",
                                    margin: "0 auto 32px auto",
                                    lineHeight: 1.6,
                                }}
                            >
                                No credit cards. No passwords. No paywalls. Just open any tool
                                and get things done instantly.
                            </p>

                            <div
                                style={{
                                    display: "inline-flex",
                                    gap: "14px",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                }}
                            >
                                <Link href="/tools" className="cta-primary-btn">
                                    Explore Free Tools Now
                                    <ArrowRight size={18} />
                                </Link>
                                <Link href="/contact-us" className="cta-secondary-btn">
                                    Send Us Feedback
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
