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
          setToolsToShow(matched.slice(0, 10));
          setIsRecent(true);
          return;
        }
      }
    } catch {
      // LocalStorage unavailable or parse error
    }

    // Fallback: 10 top trending tools
    setToolsToShow(getTrendingTools(10));
    setIsRecent(false);
  }, []);

  if (toolsToShow.length === 0) return null;

  // Duplicate tools array for seamless infinite marquee loop
  const seamlessTrack = [...toolsToShow, ...toolsToShow];

  return (
    <section className="trending-strip-section fullscreen-top-slider" aria-label="Trending tools ticker">
      <div className="trending-slider-wrapper">
        {/* Pinned Left Header */}
        <div className="trending-slider-label">
          {isRecent ? (
            <>
              <LuHistory size={14} style={{ color: "#f59e0b" }} />
              <span>Recent:</span>
            </>
          ) : (
            <>
              <LuFlame size={15} style={{ color: "#f59e0b" }} />
              <span>Trending:</span>
            </>
          )}
        </div>

        {/* Sliding Viewport with Infinite Marquee */}
        <div className="trending-slider-viewport">
          <div className="trending-slider-track">
            {seamlessTrack.map((tool, idx) => {
              const badgeClass = tool.badge
                ? tool.badge.toLowerCase().includes("ai")
                  ? "trend-badge-ai"
                  : tool.badge.toLowerCase().includes("hot")
                    ? "trend-badge-hot"
                    : tool.badge.toLowerCase().includes("fast")
                      ? "trend-badge-fast"
                      : "trend-badge-popular"
                : "";

              return (
                <AppLink
                  key={`${tool.id}-${idx}`}
                  href={tool.href}
                  className="trending-pill-link"
                >
                  <DynamicIcon name={tool.icon} size={15} fallback={<LuSparkles size={14} />} />
                  <span>{tool.title}</span>
                  {tool.badge && (
                    <span className={`trending-pill-badge ${badgeClass}`}>
                      {tool.badge}
                    </span>
                  )}
                </AppLink>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
