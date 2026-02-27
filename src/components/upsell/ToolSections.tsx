"use client";

/**
 * ToolSections.tsx
 * ─────────────────────────────────────────────────────────────
 * Scalable, future-proof discovery sections for every tool page.
 *
 * BEHAVIOUR:
 *   - Loading  → shows skeleton cards
 *   - Error    → hides section completely (no error UI shown to user)
 *   - Empty    → hides section completely (no empty state shown)
 *   - Has data → renders cards normally
 *
 * USAGE:
 *   <ToolPageSections toolSlug="image-compressor" toolId={42} />
 *
 * ADDING A NEW SECTION IN FUTURE:
 *   1. Create a new export function like RelatedTools/PopularTools
 *   2. Add it inside ToolPageSections wrapper
 *   Done — no other files need changing
 */

import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import Link from "next/link";
import { api } from "@/lib/api/api";
import { trackRecommendationClick } from "@/lib/api-calls/tracking";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
export type Tool = {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    // API may return category as slug, name, or object — handled safely below
    category: string;
    category_slug?: string;
    usageCount?: number;
    usage_count?: number; // some APIs use snake_case
    badge?: string;
    badgeColor?: string;
    badge_color?: string;
};

type ApiRes<T> = { success: boolean; data: T };

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════

/** Safely get usage count regardless of field name casing */
function getUsageCount(tool: Tool): number {
    return tool.usageCount ?? tool.usage_count ?? 0;
}

/** Safely get category slug for building URLs */
function getCategorySlug(tool: Tool): string {
    return tool.category_slug ?? tool.category ?? "";
}

/** Safely get badge color regardless of field name casing */
function getBadgeColor(tool: Tool): string | undefined {
    return tool.badgeColor ?? tool.badge_color;
}

function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

// ═══════════════════════════════════════════════════════════
// DATA HOOK
// Returns null for error (so we can hide the section)
// ═══════════════════════════════════════════════════════════
function useTools(endpoint: string) {
    const [tools, setTools] = useState<Tool[] | null>(null); // null = loading
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const run = useCallback(async () => {
        setLoading(true);
        setHasError(false);
        try {
            const res = await api.get<ApiRes<Tool[]>>(endpoint);
            const data = res.data ?? [];
            setTools(data);
        } catch {
            // On any error — treat as no data, hide the section
            setTools([]);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    }, [endpoint]);

    useEffect(() => { run(); }, [run]);

    return { tools: tools ?? [], loading, hasError };
}

// ═══════════════════════════════════════════════════════════
// INTERSECTION OBSERVER — section fade-in on scroll
// ═══════════════════════════════════════════════════════════
function useInView() {
    const ref = useRef<HTMLElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, inView };
}

// ═══════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════
function Skeleton({ count, tall }: { count: number; tall?: boolean }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`ts-skeleton ${tall ? "ts-skeleton--tall" : ""}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                />
            ))}
        </>
    );
}

// ═══════════════════════════════════════════════════════════
// SECTION WRAPPER
// Handles: loading → skeleton, error/empty → null (hidden)
// ═══════════════════════════════════════════════════════════
function Section({
    title, subtitle, icon, loading, hasError, hasData,
    gridClass, skeletonCount, skeletonTall, children, action,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    loading: boolean;
    hasError: boolean;
    hasData: boolean;
    gridClass: string;
    skeletonCount: number;
    skeletonTall?: boolean;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    const { ref, inView } = useInView();

    // Hide completely when: error OR (not loading AND no data)
    if (!loading && (hasError || !hasData)) return null;

    return (
        <section ref={ref} className={`ts-section ${inView ? "ts-section--in" : ""}`}>

            {/* Header */}
            <div className="ts-section__head">
                <div className="ts-section__label">
                    <span className="ts-section__icon">{icon}</span>
                    <div>
                        <h3 className="ts-section__title">{title}</h3>
                        <p className="ts-section__sub">{subtitle}</p>
                    </div>
                </div>
                {action && <div className="ts-section__action">{action}</div>}
            </div>

            {/* Content */}
            <div className={gridClass}>
                {loading
                    ? <Skeleton count={skeletonCount} tall={skeletonTall} />
                    : children
                }
            </div>

        </section>
    );
}

// ═══════════════════════════════════════════════════════════
// TOOL CARD — used by Related + People Also Used
// ═══════════════════════════════════════════════════════════
function ToolCard({
    tool, index, compact, currentToolId, widget,
}: {
    tool: Tool;
    index: number;
    compact?: boolean;
    currentToolId: string | number;
    widget: "related" | "alsoUsed";
}) {
    const isEmoji = !tool.icon?.startsWith("http");
    const categorySlug = getCategorySlug(tool);
    const usageCount = getUsageCount(tool);
    const badgeColor = getBadgeColor(tool);
    const href = `/tools/${categorySlug}/${tool.slug}`;

    return (
        <a
            href={href}
            className={`tc ${compact ? "tc--compact" : ""}`}
            style={{ animationDelay: `${index * 70}ms` }}
            onClick={() => trackRecommendationClick(tool.id, currentToolId, widget, href)}
        >
            <span className="tc__glow" aria-hidden />
            <span className="tc__icon-wrap">
                {isEmoji
                    ? <span className="tc__emoji">{tool.icon}</span>
                    : <img src={tool.icon} alt={tool.name} className="tc__img" />
                }
                <span className="tc__ring" aria-hidden />
            </span>
            <span className="tc__body">
                <span className="tc__row">
                    <span className="tc__name">{tool.name}</span>
                    {tool.badge && (
                        <span className="tc__badge" style={badgeColor ? { background: badgeColor } : undefined}>
                            {tool.badge}
                        </span>
                    )}
                </span>
                {!compact && <span className="tc__desc">{tool.description}</span>}
                <span className="tc__foot">
                    <span className="tc__cat">{tool.category}</span>
                    {usageCount > 0 && (
                        <span className="tc__uses">
                            <ClockIcon /> {fmt(usageCount)} uses
                        </span>
                    )}
                </span>
            </span>
            <span className="tc__arrow" aria-hidden><ArrowIcon /></span>
        </a>
    );
}

// ═══════════════════════════════════════════════════════════
// POP CARD — used by Popular Tools
// ═══════════════════════════════════════════════════════════
function PopCard({
    tool, rank, index, currentToolId,
}: {
    tool: Tool;
    rank: number;
    index: number;
    currentToolId: string | number;
}) {
    const isEmoji = !tool.icon?.startsWith("http");
    const usageCount = getUsageCount(tool);
    const badgeColor = getBadgeColor(tool);
    const categorySlug = getCategorySlug(tool);
    const barWidth = `${Math.round(Math.min(usageCount / 1_000_000, 1) * 100)}%`;
    const href = `/tools/${categorySlug}/${tool.slug}`;

    return (
        <a
            href={href}
            className="pc"
            style={{ animationDelay: `${index * 55}ms` }}
            onClick={() => trackRecommendationClick(tool.id, currentToolId, "popular", href)}
        >
            <span className="pc__stripe" aria-hidden />
            <span className="pc__rank">
                {rank <= 3
                    ? <span className="pc__medal">{["🥇", "🥈", "🥉"][rank - 1]}</span>
                    : <span className="pc__num">{rank}</span>
                }
            </span>
            <span className="pc__icon">
                {isEmoji ? <span>{tool.icon}</span> : <img src={tool.icon} alt={tool.name} />}
            </span>
            <span className="pc__body">
                <span className="pc__name">{tool.name}</span>
                <span className="pc__bar-row">
                    <span className="pc__bar">
                        <span className="pc__bar-fill" style={{ width: barWidth, animationDelay: `${index * 55 + 300}ms` }} />
                    </span>
                    <span className="pc__count">{fmt(usageCount)}</span>
                </span>
            </span>
            {tool.badge && (
                <span className="pc__badge" style={badgeColor ? { background: badgeColor } : undefined}>
                    {tool.badge}
                </span>
            )}
        </a>
    );
}

// ═══════════════════════════════════════════════════════════
// PUBLIC SECTION EXPORTS
// ═══════════════════════════════════════════════════════════

export function RelatedTools({
    toolSlug, toolId, limit = 6,
}: {
    toolSlug: string; toolId: string | number; limit?: number;
}) {
    const { tools, loading, hasError } = useTools(`/tools/related/${toolSlug}?limit=${limit}`);
    return (
        <Section
            title="Related Tools"
            subtitle="More tools in the same category"
            icon={<GridIcon />}
            loading={loading}
            hasError={hasError}
            hasData={tools.length > 0}
            gridClass="ts-grid ts-grid--cards"
            skeletonCount={limit}
            skeletonTall
        >
            {tools.map((t, i) => (
                <ToolCard key={t.id} tool={t} index={i} currentToolId={toolId} widget="related" />
            ))}
        </Section>
    );
}

export function PopularTools({
    currentToolId, limit = 8,
}: {
    currentToolId: string | number; limit?: number;
}) {
    const { tools, loading, hasError } = useTools(`/tools/popular?limit=${limit}`);
    return (
        <Section
            title="Popular Tools"
            subtitle="Most used tools on the platform right now"
            icon={<StarIcon />}
            loading={loading}
            hasError={hasError}
            hasData={tools.length > 0}
            gridClass="ts-grid ts-grid--popular"
            skeletonCount={limit}
            action={
                <Link href="/tools" className="ts-viewall">
                    Browse all <ChevronIcon />
                </Link>
            }
        >
            {tools.map((t, i) => (
                <PopCard key={t.id} tool={t} rank={i + 1} index={i} currentToolId={currentToolId} />
            ))}
        </Section>
    );
}

export function PeopleAlsoUsed({
    toolSlug, toolId, limit = 5,
}: {
    toolSlug: string; toolId: string | number; limit?: number;
}) {
    const { tools, loading, hasError } = useTools(`/tools/also-used/${toolSlug}?limit=${limit}`);
    return (
        <Section
            title="People Also Used"
            subtitle="Tools frequently paired with this one"
            icon={<UsersIcon />}
            loading={loading}
            hasError={hasError}
            hasData={tools.length > 0}
            gridClass="ts-grid ts-grid--compact"
            skeletonCount={limit}
        >
            {tools.map((t, i) => (
                <ToolCard key={t.id} tool={t} index={i} compact currentToolId={toolId} widget="alsoUsed" />
            ))}
        </Section>
    );
}

// ── All-in-one wrapper ────────────────────────────────────────────────────────
export function ToolPageSections({
    toolSlug, toolId,
}: {
    toolSlug: string; toolId: string | number;
}) {
    return (
        <div className="ts-root">
            <RelatedTools toolSlug={toolSlug} toolId={toolId} limit={6} />
            <PopularTools currentToolId={toolId} limit={8} />
            <PeopleAlsoUsed toolSlug={toolSlug} toolId={toolId} limit={5} />
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════
function GridIcon() { return <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></svg>; }
function StarIcon() { return <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 1.5l2.06 4.18 4.6.67-3.33 3.24.79 4.58L9 11.94l-4.12 2.23.79-4.58L2.34 6.35l4.6-.67L9 1.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>; }
function UsersIcon() { return <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.6" /><path d="M1.5 15.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="14" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.6" /><path d="M16.5 15.5c0-2.2-1.1-4-2.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>; }
function ArrowIcon() { return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ChevronIcon() { return <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M4.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ClockIcon() { return <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" /><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>; }