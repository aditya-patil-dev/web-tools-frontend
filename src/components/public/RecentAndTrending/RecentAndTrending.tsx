"use client";

import React, { useEffect, useState } from "react";
import AppLink from "@/components/common/AppLink";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { MASTER_TOOLS, MasterTool, getTrendingTools } from "@/config/tools-registry";
import { LuFlame, LuHistory, LuArrowRight, LuSparkles } from "react-icons/lu";

export default function RecentAndTrending() {
  const [toolsToShow, setToolsToShow] = useState<MasterTool[]>([]);
  const [isRecent, setIsRecent] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fusiontools_recent");
      if (stored) {
        const parsedSlugs: string[] = JSON.parse(stored);
        const matched = parsedSlugs
          .map((slug) => MASTER_TOOLS.find((t) => t.slug === slug || t.id === slug))
          .filter(Boolean) as MasterTool[];

        if (matched.length > 0) {
          setToolsToShow(matched.slice(0, 6));
          setIsRecent(true);
          return;
        }
      }
    } catch {
      // LocalStorage unavailable or parse error
    }

    // Fallback: Trending tools
    setToolsToShow(getTrendingTools(6));
    setIsRecent(false);
  }, []);

  if (toolsToShow.length === 0) return null;

  return (
    <section className="trending-strip-section">
      <div className="trending-strip-inner">
        {/* Header row (Title + Mobile View All) */}
        <div className="trending-strip-header-row">
          <div className="trending-strip-title">
            {isRecent ? (
              <>
                <LuHistory size={16} className="trending-strip-title-icon" />
                <span>Recently Used:</span>
              </>
            ) : (
              <>
                <LuFlame size={16} className="trending-strip-title-icon" />
                <span>Trending Tools:</span>
              </>
            )}
          </div>

          <div className="trending-strip-view-all mobile-only">
            <AppLink href="/tools" className="trending-view-all-link">
              <span>All 25+ Tools</span>
              <LuArrowRight size={13} />
            </AppLink>
          </div>
        </div>

        <div className="trending-strip-divider desktop-only" />

        {/* Scroll Track (takes full width on mobile) */}
        <div className="trending-tools-scroll">
          {toolsToShow.map((tool) => (
            <AppLink key={tool.id} href={tool.href} className="trending-pill-link">
              <DynamicIcon name={tool.icon} size={15} fallback={<LuSparkles size={14} />} />
              <span>{tool.title}</span>
              {tool.badge && <span className="trending-pill-badge">{tool.badge}</span>}
            </AppLink>
          ))}
        </div>

        {/* Desktop View All Link */}
        <div className="trending-strip-view-all desktop-only">
          <AppLink href="/tools" className="trending-view-all-link">
            <span>All 25+ Tools</span>
            <LuArrowRight size={13} />
          </AppLink>
        </div>
      </div>
    </section>
  );
}
