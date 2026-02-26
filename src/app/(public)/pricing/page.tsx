"use client";

import { useState } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type BillingCycle = "monthly" | "annual";

type PlanFeature = {
    text: string;
    included: boolean;
    highlight?: boolean;
};

type Plan = {
    id: string;
    name: string;
    badge?: string;
    description: string;
    price: { monthly: number; annual: number };
    cta: string;
    ctaHref: string;
    featured: boolean;
    color: string;
    features: PlanFeature[];
};

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const PLANS: Plan[] = [
    {
        id: "free",
        name: "Starter",
        description: "Perfect for exploring and side projects",
        price: { monthly: 0, annual: 0 },
        cta: "Get Started Free",
        ctaHref: "/register",
        featured: false,
        color: "#64748b",
        features: [
            { text: "50 AI tool uses / month", included: true },
            { text: "Access to 100+ free tools", included: true },
            { text: "Basic SEO analysis", included: true },
            { text: "Community support", included: true },
            { text: "Advanced analytics", included: false },
            { text: "Priority processing", included: false },
            { text: "API access", included: false },
            { text: "Team collaboration", included: false },
        ],
    },
    {
        id: "pro",
        name: "Pro",
        badge: "Most Popular",
        description: "For creators and growing businesses",
        price: { monthly: 29, annual: 19 },
        cta: "Start Pro Trial",
        ctaHref: "/register?plan=pro",
        featured: true,
        color: "#ff6b35",
        features: [
            { text: "Unlimited AI tool uses", included: true, highlight: true },
            { text: "Access to all 500+ tools", included: true, highlight: true },
            { text: "Advanced SEO analytics", included: true },
            { text: "Priority email support", included: true },
            { text: "Advanced analytics", included: true },
            { text: "Priority processing", included: true },
            { text: "API access (10K req/mo)", included: true },
            { text: "Team collaboration", included: false },
        ],
    },
    {
        id: "premium",
        name: "Premium",
        badge: "Best Value",
        description: "For teams and power users at scale",
        price: { monthly: 79, annual: 59 },
        cta: "Go Premium",
        ctaHref: "/register?plan=premium",
        featured: false,
        color: "#8b5cf6",
        features: [
            { text: "Unlimited AI tool uses", included: true, highlight: true },
            { text: "Access to all 500+ tools", included: true },
            { text: "White-label reports", included: true, highlight: true },
            { text: "Dedicated account manager", included: true },
            { text: "Advanced analytics", included: true },
            { text: "Priority processing", included: true },
            { text: "API access (unlimited)", included: true, highlight: true },
            { text: "Team collaboration (10 seats)", included: true, highlight: true },
        ],
    },
];

const FAQ_ITEMS = [
    {
        q: "Can I switch plans anytime?",
        a: "Yes, upgrade or downgrade at any time. Proration is handled automatically — you only pay the difference.",
    },
    {
        q: "Is there a free trial?",
        a: "Pro and Premium plans come with a 14-day free trial. No credit card required to start.",
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, UPI, net banking, and PayPal. Annual plans also support invoicing.",
    },
    {
        q: "What happens if I exceed my limits?",
        a: "Free plan users are rate-limited. Pro and Premium users are never blocked — we'll notify you before any overage charges.",
    },
];

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function CheckIcon({ color }: { color: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
            <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CrossIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="8" fill="#94a3b8" fillOpacity="0.1" />
            <path d="M10 6L6 10M6 6l4 4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function PricingCard({ plan, cycle }: { plan: Plan; cycle: BillingCycle }) {
    const price = plan.price[cycle];
    const savings = plan.price.monthly > 0
        ? Math.round(((plan.price.monthly - plan.price.annual) / plan.price.monthly) * 100)
        : 0;

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRadius: "24px",
                border: plan.featured
                    ? `2px solid ${plan.color}`
                    : "1.5px solid rgba(255,255,255,0.08)",
                background: plan.featured
                    ? `linear-gradient(160deg, rgba(255,107,53,0.08) 0%, rgba(15,23,42,0.95) 50%)`
                    : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                padding: "32px",
                boxShadow: plan.featured
                    ? `0 0 0 1px rgba(255,107,53,0.15), 0 32px 64px rgba(255,107,53,0.12), 0 8px 32px rgba(0,0,0,0.4)`
                    : "0 8px 32px rgba(0,0,0,0.2)",
                transform: plan.featured ? "translateY(-12px)" : "none",
                transition: "transform 300ms ease, box-shadow 300ms ease",
                animation: "cardIn 0.5s ease both",
            }}
            onMouseEnter={(e) => {
                if (!plan.featured) {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${plan.color}55`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.3)`;
                }
            }}
            onMouseLeave={(e) => {
                if (!plan.featured) {
                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
                }
            }}
        >
            {/* Featured glow */}
            {plan.featured && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "24px",
                    background: `radial-gradient(ellipse at 50% 0%, ${plan.color}20, transparent 70%)`,
                    pointerEvents: "none",
                }} />
            )}

            {/* Badge */}
            {plan.badge && (
                <div style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "4px 16px",
                    borderRadius: "9999px",
                    background: plan.color,
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    boxShadow: `0 4px 16px ${plan.color}55`,
                }}>
                    {plan.badge}
                </div>
            )}

            {/* Plan name */}
            <div style={{ marginBottom: "8px" }}>
                <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: plan.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                }}>
                    <span style={{
                        width: "8px", height: "8px",
                        borderRadius: "50%",
                        background: plan.color,
                        boxShadow: `0 0 8px ${plan.color}`,
                    }} />
                    {plan.name}
                </span>
            </div>

            {/* Description */}
            <p style={{
                fontSize: "14px",
                color: "rgba(148,163,184,0.8)",
                marginBottom: "28px",
                lineHeight: 1.5,
            }}>
                {plan.description}
            </p>

            {/* Price */}
            <div style={{ marginBottom: "28px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{
                        fontSize: "48px",
                        fontWeight: 900,
                        color: "#f1f5f9",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                    }}>
                        {price === 0 ? "Free" : `$${price}`}
                    </span>
                    {price > 0 && (
                        <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
                            / mo
                        </span>
                    )}
                </div>
                {cycle === "annual" && savings > 0 && (
                    <div style={{
                        marginTop: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        background: "rgba(16,185,129,0.12)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#10b981",
                    }}>
                        Save {savings}% annually
                    </div>
                )}
                {price === 0 && (
                    <p style={{ marginTop: "6px", fontSize: "12px", color: "#475569" }}>
                        No credit card required
                    </p>
                )}
            </div>

            {/* CTA */}
            <Link
                href={plan.ctaHref}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "13px 20px",
                    borderRadius: "14px",
                    marginBottom: "28px",
                    fontWeight: 700,
                    fontSize: "15px",
                    textDecoration: "none",
                    transition: "all 200ms ease",
                    ...(plan.featured
                        ? {
                            background: `linear-gradient(135deg, ${plan.color}, #ff5722)`,
                            color: "#fff",
                            boxShadow: `0 8px 24px ${plan.color}45`,
                        }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            color: "#e2e8f0",
                            border: "1px solid rgba(255,255,255,0.1)",
                        }),
                }}
                onMouseEnter={(e) => {
                    if (plan.featured) {
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 32px ${plan.color}60`;
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                    } else {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = `${plan.color}55`;
                    }
                }}
                onMouseLeave={(e) => {
                    if (plan.featured) {
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 24px ${plan.color}45`;
                        (e.currentTarget as HTMLAnchorElement).style.transform = "none";
                    } else {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                    }
                }}
            >
                {plan.cta}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Link>

            {/* Divider */}
            <div style={{
                height: "1px",
                background: "rgba(255,255,255,0.06)",
                marginBottom: "20px",
            }} />

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                {plan.features.map((feature, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            opacity: feature.included ? 1 : 0.4,
                        }}
                    >
                        {feature.included ? <CheckIcon color={plan.color} /> : <CrossIcon />}
                        <span style={{
                            fontSize: "13.5px",
                            color: feature.highlight ? "#f1f5f9" : "#94a3b8",
                            fontWeight: feature.highlight ? 600 : 400,
                        }}>
                            {feature.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            onClick={() => setOpen(!open)}
            style={{
                padding: "20px 24px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.07)",
                background: open ? "rgba(255,107,53,0.05)" : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                transition: "all 200ms ease",
                borderColor: open ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.07)",
                animationDelay: `${index * 80}ms`,
                animation: "cardIn 0.5s ease both",
            }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
            }}>
                <span style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: open ? "#ff6b35" : "#e2e8f0",
                    transition: "color 200ms ease",
                }}>
                    {q}
                </span>
                <span style={{
                    flexShrink: 0,
                    width: "24px",
                    height: "24px",
                    borderRadius: "9999px",
                    border: `1.5px solid ${open ? "#ff6b35" : "rgba(255,255,255,0.15)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: open ? "#ff6b35" : "#64748b",
                    fontSize: "16px",
                    fontWeight: 300,
                    transition: "all 200ms ease",
                    transform: open ? "rotate(45deg)" : "none",
                }}>
                    +
                </span>
            </div>
            {open && (
                <p style={{
                    marginTop: "12px",
                    fontSize: "14px",
                    color: "#94a3b8",
                    lineHeight: 1.7,
                }}>
                    {a}
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function PricingPage() {
    const [cycle, setCycle] = useState<BillingCycle>("monthly");

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');

                
            `}</style>

            <div className="pricing-page">
                <div className="pricing-bg" />

                <div className="pricing-content">

                    {/* ── Hero ── */}
                    <section className="pricing-hero">
                        <div className="pricing-eyebrow">
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff6b35", boxShadow: "0 0 6px #ff6b35" }} />
                            Simple Pricing
                        </div>

                        <h1 className="pricing-headline">
                            The right plan for<br />
                            <span>every ambition</span>
                        </h1>

                        <p className="pricing-sub">
                            Start free. Scale as you grow. No hidden fees,<br />
                            no surprises — just powerful AI tools at your fingertips.
                        </p>

                        {/* Billing toggle */}
                        <div className="billing-toggle">
                            <span
                                className={`toggle-label ${cycle === "monthly" ? "active" : ""}`}
                                onClick={() => setCycle("monthly")}
                            >
                                Monthly
                            </span>

                            <button
                                className={`toggle-pill ${cycle === "annual" ? "annual" : ""}`}
                                onClick={() => setCycle(cycle === "monthly" ? "annual" : "monthly")}
                                aria-label="Toggle billing cycle"
                            >
                                <span className="toggle-thumb" />
                            </button>

                            <span
                                className={`toggle-label ${cycle === "annual" ? "active" : ""}`}
                                onClick={() => setCycle("annual")}
                            >
                                Annual
                            </span>

                            {cycle === "annual" && (
                                <span className="save-pill">Save up to 35%</span>
                            )}
                        </div>
                    </section>

                    {/* ── Pricing cards ── */}
                    <section>
                        <div className="plans-grid">
                            {PLANS.map((plan, i) => (
                                <div key={plan.id} style={{ animationDelay: `${i * 120}ms` }}>
                                    <PricingCard plan={plan} cycle={cycle} />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Trust strip ── */}
                    <section className="trust-strip">
                        <p>Trusted by teams at</p>
                        <div className="trust-logos">
                            {["Acme Corp", "Bright Labs", "Nova Studio", "Apex Media", "Crest Inc"].map((name) => (
                                <span key={name} className="trust-logo">{name}</span>
                            ))}
                        </div>
                    </section>

                    {/* ── FAQ ── */}
                    <section className="faq-section">
                        <div className="section-label">
                            <h2>Got questions?</h2>
                            <p>Everything you need to know about our plans</p>
                        </div>
                        <div className="faq-list">
                            {FAQ_ITEMS.map((item, i) => (
                                <FaqItem key={i} q={item.q} a={item.a} index={i} />
                            ))}
                        </div>
                    </section>

                    {/* ── Bottom CTA ── */}
                    <section className="bottom-cta">
                        <div className="bottom-cta-card">
                            <h2>Still not sure?</h2>
                            <p>
                                Start with our free plan — no credit card needed.<br />
                                Upgrade whenever you're ready.
                            </p>
                            <Link href="/register" className="cta-btn-primary">
                                Start for free
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </Link>
                            <Link href="/contact" className="cta-btn-ghost">
                                Talk to sales
                            </Link>
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}