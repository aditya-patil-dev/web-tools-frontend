"use client";

import { memo } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiTrendingUp,
  FiLink,
  FiGrid,
  FiUsers,
} from "react-icons/fi";
import { LuArrowRight } from "react-icons/lu";
import DynamicIcon from "@/components/ui/DynamicIcon";
import AppLink from "@/components/common/AppLink";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolItem {
  id: number;
  name?: string;
  title?: string;
  description?: string;
  short_description?: string;
  slug: string;
  category?: string;
  category_slug?: string;
  tool_url?: string | null;
  badge?: string | null;
  rating?: number;
  views?: number;
  usageCount?: number;
  users_count?: number;
}

export interface Recommendations {
  related: ToolItem[];
  popular: ToolItem[];
  alsoUsed: ToolItem[];
}

export interface ToolSuggestionsProps {
  position: "above" | "below";
  recommendations: Recommendations | null | undefined;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatSlug = (slug: string) => {
  if (!slug) return "";
  const formatted = slug.replace(/-/g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const getName = (t: ToolItem) => {
  const raw = t.name ?? t.title ?? t.slug;
  if (!raw) return "Untitled Tool";
  return formatSlug(raw);
};
const getDesc = (t: ToolItem) => t.description ?? t.short_description ?? "";
const getHref = (t: ToolItem): string => {
  if (t.tool_url) return t.tool_url;
  const cat = t.category ?? t.category_slug ?? "tools";
  return `/tools/${cat}/${t.slug}`;
};
/**
 * Maps category slugs to reliable Lucide icons
 */
const getCategoryIcon = (categorySlug?: string) => {
  if (!categorySlug) return "LuWrench";
  const slug = categorySlug.toLowerCase();
  if (slug.includes("image")) return "LuImage";
  if (slug.includes("pdf")) return "LuFileText";
  if (slug.includes("seo")) return "LuSearch";
  if (slug.includes("text")) return "LuType";
  if (slug.includes("dev")) return "LuCode";
  if (slug.includes("hash")) return "LuHash";
  if (slug.includes("video")) return "LuVideo";
  if (slug.includes("audio")) return "LuMusic";
  return "LuWrench";
};

// ─── ToolCard ─────────────────────────────────────────────────────────────────
const ToolCard = memo(({ tool, index }: { tool: ToolItem; index: number }) => {
  const name = getName(tool);
  const desc = getDesc(tool);
  const href = tool.tool_url || `/tools/${tool.slug}`;
  const badge = tool.badge || null;

  // Resolve icon: priority to tool.icon, then category mapping, then LuWrench
  const iconName = (tool as any).icon || getCategoryIcon(tool.category_slug || tool.category);

  return (
    <div className="tool-card">
      <AppLink href={href} className="tool-card-link">
        <div className="tool-glow"></div>
        {badge && <span className="tool-card-badge">{badge}</span>}
        <div className="tool-icon">
          <DynamicIcon
            name={iconName}
            size={32}
            fallback={<LuArrowRight />} // Better than an empty box
          />
        </div>
        <div className="tool-content">
          <h3>{name}</h3>
          <p>{desc}</p>
        </div>
        <div className="tool-card-footer">
          {tool.category && (
            <span className="tool-usage-tag">
              {formatSlug(tool.category)}
            </span>
          )}
          <div className="tool-action-icon">
            <DynamicIcon name="LuArrowRight" size={16} />
          </div>
        </div>
      </AppLink>
    </div>
  );
});
ToolCard.displayName = "ToolCard";

// ─── Section ──────────────────────────────────────────────────────────────────

const Section = memo(
  ({
    title,
    icon,
    tools,
    maxItems,
  }: {
    title: string;
    icon: React.ReactNode;
    tools: ToolItem[];
    maxItems: number;
  }) => {
    const visible = tools.slice(0, maxItems);
    if (visible.length === 0) return null;
    return (
      <div className="ts-section">
        <div className="ts-section-header">
          <span className="ts-section-icon" aria-hidden="true">
            {icon}
          </span>
          <h3 className="ts-section-title">{title}</h3>
        </div>
        <div className="tools-grid horizontal-row">
          {visible.map((tool, i) => (
            <ToolCard
              key={`${tool.id ?? tool.slug}-${i}`}
              tool={tool}
              index={i}
            />
          ))}
        </div>
      </div>
    );
  },
);
Section.displayName = "Section";

const Footer = () => (
  <div className="ts-footer">
    <AppLink href="/tools" className="ts-browse-link">
      Browse all tools <FiArrowRight />
    </AppLink>
  </div>
);



// ─── Main Component ───────────────────────────────────────────────────────────

const ToolSuggestions = ({
  position,
  recommendations,
  className = "",
}: ToolSuggestionsProps) => {
  // ── ABOVE ─────────────────────────────────────────────────────────────────
  if (position === "above") {
    const related = recommendations?.related ?? [];

    return (
      <>

        {related.length > 0 && (
          <aside className={`ts-root ts-root--above ${className}`} aria-label="Related tools">
            <div className="ts-header ts-header--above">
              <FiGrid className="ts-header-icon" aria-hidden="true" />
              <span>Related Tools</span>
            </div>
            <Section
              title="In the same category"
              icon={<FiLink />}
              tools={related}
              maxItems={5}
            />
            <Footer />
          </aside>
        )}
      </>
    );
  }

  // ── BELOW ─────────────────────────────────────────────────────────────────
  const alsoUsed = recommendations?.alsoUsed ?? [];
  const popular = recommendations?.popular ?? [];

  if (alsoUsed.length === 0 && popular.length === 0) return null;

  const isSingle = alsoUsed.length === 0 || popular.length === 0;

  return (
    <aside className={`ts-root ts-root--below ${className}`} aria-label="More tools you might like">
      <div className="ts-header ts-header--below">
        <FiTrendingUp className="ts-header-icon" aria-hidden="true" />
        <span>More Tools You Might Like</span>
      </div>
      <div
        className={`ts-below-grid ${isSingle ? "ts-below-grid--single" : ""}`}
      >
        {alsoUsed.length > 0 && (
          <Section
            title="Often used together"
            icon={<FiUsers />}
            tools={alsoUsed}
            maxItems={5}
          />
        )}
        {popular.length > 0 && (
          <Section
            title="Trending right now"
            icon={<FiTrendingUp />}
            tools={popular}
            maxItems={5}
          />
        )}
      </div>
      <Footer />
    </aside>
  );
};

export default ToolSuggestions;
