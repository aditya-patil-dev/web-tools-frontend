"use client";

/**
 * ToolSections.tsx
 * ─────────────────────────────────────────────────────────────
 * Three independently usable discovery section components.
 *
 * EXPORTS:
 *   <RelatedTools   toolSlug="..."  toolId={...} limit={6} />
 *   <PopularTools   currentToolId={...}          limit={8} />
 *   <PeopleAlsoUsed toolSlug="..."  toolId={...} limit={5} />
 *
 * Each component is fully self-contained — fetch, loading,
 * error, and empty states are all handled internally.
 *
 * ICON STRATEGY:
 *   No icon column in DB → renders a letter-avatar using the
 *   first letter of the tool name with a colour derived from
 *   the name (deterministic, consistent per tool).
 */

import { useEffect, useRef, useState } from "react";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/api";
import { trackRecommendationClick } from "@/lib/api-calls/tracking";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type Tool = {
  id: string | number;
  name?: string;
  title?: string;        // fallback if API returns title instead of name
  slug: string;
  description?: string;
  short_description?: string;
  category?: string;
  category_slug?: string;
  usageCount?: number;
  usage_count?: number;
  users_count?: number;
  badge?: string;
  icon?: string;         // kept for future compatibility
};

type ApiRes<T> = { success: boolean; data: T };

/* ═══════════════════════════════════════════════════════════
   NORMALISE — handle both field name conventions
═══════════════════════════════════════════════════════════ */
function normaliseTool(t: Tool) {
  return {
    ...t,
    name: t.name || t.title || "Untitled",
    description: t.description || t.short_description || "",
    category: t.category || t.category_slug || "",
    usageCount: t.usageCount ?? t.usage_count ?? t.users_count ?? 0,
  };
}

/* ═══════════════════════════════════════════════════════════
   LETTER AVATAR — deterministic colour from tool name
═══════════════════════════════════════════════════════════ */
const AVATAR_COLORS = [
  ["#fff5f2", "#ff6b35"],   // orange (primary)
  ["#eff6ff", "#3b82f6"],   // blue
  ["#f0fdf4", "#16a34a"],   // green
  ["#fdf4ff", "#9333ea"],   // purple
  ["#fff7ed", "#ea580c"],   // amber
  ["#f0fdfa", "#0d9488"],   // teal
  ["#fff1f2", "#e11d48"],   // red
  ["#f8fafc", "#475569"],   // slate
] as const;

function getAvatarColor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] as [string, string];
}

function LetterAvatar({
  name,
  size = 40,
  fontSize = 16,
}: {
  name: string;
  size?: number;
  fontSize?: number;
}) {
  const [bg, fg] = getAvatarColor(name);
  const letter = name.trim().charAt(0).toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "var(--radius-md)",
        background: bg,
        border: `1.5px solid ${fg}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: fontSize,
        fontWeight: 800,
        color: fg,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {letter}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED UTILS
═══════════════════════════════════════════════════════════ */
function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getCategorySlug(t: Tool): string {
  return t.category_slug ?? t.category ?? "";
}

/* ═══════════════════════════════════════════════════════════
   DATA HOOK
═══════════════════════════════════════════════════════════ */
function useTools(endpoint: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tool-sections", endpoint],
    queryFn: async () => {
      const res = await api.get<ApiRes<Tool[]>>(endpoint);
      return (res.data ?? []).map(normaliseTool);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
  return { tools: data ?? [], loading: isLoading, hasError: isError };
}

/* ═══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — section fade-in on scroll
═══════════════════════════════════════════════════════════ */
function useInView() {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */
function Skeleton({ count, tall }: { count: number; tall?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`ts-skeleton${tall ? " ts-skeleton--tall" : ""}`}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION WRAPPER
═══════════════════════════════════════════════════════════ */
function Section({
  title, subtitle, icon, loading, hasError, hasData,
  gridClass, skeletonCount, skeletonTall, children, action,
}: {
  title: string; subtitle: string; icon: React.ReactNode;
  loading: boolean; hasError: boolean; hasData: boolean;
  gridClass: string; skeletonCount: number; skeletonTall?: boolean;
  children: React.ReactNode; action?: React.ReactNode;
}) {
  const { ref, inView } = useInView();
  if (!loading && (hasError || !hasData)) return null;
  return (
    <section ref={ref} className={`ts-section${inView ? " ts-section--in" : ""}`}>
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
      <div className={gridClass}>
        {loading
          ? <Skeleton count={skeletonCount} tall={skeletonTall} />
          : children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOOL CARD — used by Related Tools (R4 tiles)
═══════════════════════════════════════════════════════════ */
function ToolCard({
  tool, index, isHero = false, currentToolId,
}: {
  tool: ReturnType<typeof normaliseTool>;
  index: number;
  isHero?: boolean;
  currentToolId: string | number;
}) {
  const categorySlug = getCategorySlug(tool);
  const href = `/tools/${categorySlug}/${tool.slug}`;

  return (
    <a
      href={href}
      className={`tc${isHero ? " tc--hero" : ""}`}
      style={{ animationDelay: `${index * 70}ms` }}
      onClick={() =>
        trackRecommendationClick({
          clickedToolId: String(tool.id),
          currentToolId,
          widget: "related",
          toPath: href,
        })
      }
    >
      {isHero && <span className="tc__hero-badge">Top Pick</span>}

      <LetterAvatar
        name={tool.name}
        size={isHero ? 60 : 40}
        fontSize={isHero ? 26 : 18}
      />

      <div className="tc__body">
        <div className="tc__row">
          <span className="tc__name">{tool.name}</span>
          {tool.badge && (
            <span className="tc__badge">{tool.badge}</span>
          )}
        </div>
        {isHero && tool.description && (
          <span className="tc__desc">{tool.description}</span>
        )}
        <span className="tc__foot">
          <span className="tc__cat">{tool.category}</span>
          {tool.usageCount > 0 && (
            <span className="tc__uses">
              <ClockIcon /> {fmt(tool.usageCount)} uses
            </span>
          )}
        </span>
      </div>

      <span className="tc__arrow"><ArrowIcon /></span>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   POPULAR CARD — P3 Stat Card
═══════════════════════════════════════════════════════════ */
function PopCard({
  tool, rank, index, currentToolId,
}: {
  tool: ReturnType<typeof normaliseTool>;
  rank: number;
  index: number;
  currentToolId: string | number;
}) {
  const categorySlug = getCategorySlug(tool);
  const href = `/tools/${categorySlug}/${tool.slug}`;

  return (
    <a
      href={href}
      className="pc"
      style={{ animationDelay: `${index * 55}ms` }}
      onClick={() =>
        trackRecommendationClick({
          clickedToolId: String(tool.id),
          currentToolId,
          widget: "popular",
          toPath: href,
        })
      }
    >
      {/* Rank badge */}
      <span className="pc__rank">
        {rank <= 3
          ? <span className="pc__medal">{["🥇", "🥈", "🥉"][rank - 1]}</span>
          : <span className="pc__num">{rank}</span>}
      </span>

      {/* Letter avatar */}
      <LetterAvatar name={tool.name} size={48} fontSize={20} />

      {/* Body */}
      <span className="pc__body">
        <span className="pc__name">{tool.name}</span>
        <span className="pc__bar-row">
          <span className="pc__count">{fmt(tool.usageCount)}</span>
          <span className="pc__bar">uses this week</span>
        </span>
      </span>

      {tool.badge && <span className="pc__badge">{tool.badge}</span>}
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   ALSO USED CARD — A3 Compact Chain
═══════════════════════════════════════════════════════════ */
function AlsoUsedCard({
  tool, index, currentToolId,
}: {
  tool: ReturnType<typeof normaliseTool>;
  index: number;
  currentToolId: string | number;
}) {
  const categorySlug = getCategorySlug(tool);
  const href = `/tools/${categorySlug}/${tool.slug}`;

  return (
    <a
      href={href}
      className="tc--compact"
      style={{ animationDelay: `${index * 65}ms` }}
      onClick={() =>
        trackRecommendationClick({
          clickedToolId: String(tool.id),
          currentToolId,
          widget: "alsoUsed",
          toPath: href,
        })
      }
    >
      <LetterAvatar name={tool.name} size={40} fontSize={17} />

      <div className="tc__body">
        <span className="tc__name">{tool.name}</span>
        <span className="tc__foot">
          <span className="tc__cat">{tool.category}</span>
          {tool.usageCount > 0 && (
            <span className="tc__uses">
              <ClockIcon /> {fmt(tool.usageCount)}
            </span>
          )}
        </span>
      </div>

      {tool.badge && <span className="tc__badge">{tool.badge}</span>}

      <span className="tc__arrow"><ArrowIcon /></span>
    </a>
  );
}

/* ═══════════════════════════════════════════════════════════
   ── EXPORT 1: RELATED TOOLS ──
   R4: Dark hero first card + 2-col light tiles
═══════════════════════════════════════════════════════════ */
export function RelatedTools({
  toolSlug,
  toolId,
  limit = 6,
}: {
  toolSlug: string;
  toolId: string | number;
  limit?: number;
}) {
  const { tools, loading, hasError } = useTools(
    `/tools/related/${toolSlug}?limit=${limit}`,
  );

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
        <ToolCard
          key={t.id}
          tool={t}
          index={i}
          isHero={i === 0}
          currentToolId={toolId}
        />
      ))}
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ── EXPORT 2: POPULAR TOOLS ──
   P3: 4-col stat cards with big usage number
═══════════════════════════════════════════════════════════ */
export function PopularTools({
  currentToolId,
  limit = 8,
}: {
  currentToolId: string | number;
  limit?: number;
}) {
  const { tools, loading, hasError } = useTools(
    `/tools/popular?limit=${limit}`,
  );

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
        <PopCard
          key={t.id}
          tool={t}
          rank={i + 1}
          index={i}
          currentToolId={currentToolId}
        />
      ))}
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ── EXPORT 3: PEOPLE ALSO USED ──
   A3: Compact chain list with left accent bar
═══════════════════════════════════════════════════════════ */
export function PeopleAlsoUsed({
  toolSlug,
  toolId,
  limit = 5,
}: {
  toolSlug: string;
  toolId: string | number;
  limit?: number;
}) {
  const { tools, loading, hasError } = useTools(
    `/tools/also-used/${toolSlug}?limit=${limit}`,
  );

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
        <AlsoUsedCard
          key={t.id}
          tool={t}
          index={i}
          currentToolId={toolId}
        />
      ))}
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ── EXPORT 4: ALL-IN-ONE WRAPPER (optional convenience) ──
═══════════════════════════════════════════════════════════ */
export function ToolPageSections({
  toolSlug,
  toolId,
}: {
  toolSlug: string;
  toolId: string | number;
}) {
  return (
    <div className="ts-root">
      <RelatedTools toolSlug={toolSlug} toolId={toolId} limit={6} />
      <PopularTools currentToolId={toolId} limit={8} />
      <PeopleAlsoUsed toolSlug={toolSlug} toolId={toolId} limit={5} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════ */
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5l2.06 4.18 4.6.67-3.33 3.24.79 4.58L9 11.94l-4.12 2.23.79-4.58L2.34 6.35l4.6-.67L9 1.5z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1.5 15.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16.5 15.5c0-2.2-1.1-4-2.5-4.5"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M4.5 3l3 3-3 3"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}