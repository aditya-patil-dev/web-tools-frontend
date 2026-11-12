"use client";

import React, { useRef, useState } from "react";
import AppLink from "@/components/common/AppLink";
import { POPULAR_TOOLS } from "./tools.config";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { LuArrowRight, LuChevronLeft, LuChevronRight, LuStar, LuFlame } from "react-icons/lu";

interface Tool {
  title: string;
  description: string;
  icon: string;
  href: string;
  badge?: string | null;
  category?: string;
}

interface PopularToolsConfig {
  header: { title: string; subtitle: string };
  tools: Tool[];
  footer: { text: string; href: string };
}

interface PopularToolsProps {
  config?: PopularToolsConfig;
}

const DEFAULT_CONFIG: PopularToolsConfig = {
  header: {
    title: "Most Popular <span>Web Utilities</span>",
    subtitle: "Everyday essentials trusted by thousands of creators, developers, and marketers.",
  },
  tools: POPULAR_TOOLS,
  footer: { text: "View All 25+ Tools →", href: "/tools" },
};

export default function PopularTools({ config = DEFAULT_CONFIG }: PopularToolsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(x - startX) > 5) {
      setHasMoved(true);
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
    }
  };

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="popular-tools-modern-section">
      <div className="popular-tools-inner">
        {/* Header with Navigation Controls */}
        <div className="popular-header-row">
          <div className="popular-header-text">
            <span className="popular-eyebrow">
              <LuFlame size={14} className="eyebrow-flame" />
              TOP PICKS · TRUSTED BY 100K+ USERS
            </span>
            <h2 dangerouslySetInnerHTML={{ __html: config.header.title }} />
            <p>{config.header.subtitle}</p>
          </div>

          <div className="popular-nav-arrows">
            <button
              type="button"
              className="scroll-arrow-btn"
              onClick={() => scrollBy(-360)}
              aria-label="Scroll left"
            >
              <LuChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="scroll-arrow-btn"
              onClick={() => scrollBy(360)}
              aria-label="Scroll right"
            >
              <LuChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel / Scroll Track */}
        <div
          className={`popular-scroll-track ${isDragging ? "dragging" : ""}`}
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {config.tools.map((tool, index) => {
            const badgeType = tool.badge?.toLowerCase() || "";
            let badgeClass = "highlight-card-badge";
            if (badgeType.includes("ai")) badgeClass += " badge-ai";
            else if (badgeType.includes("popular") || badgeType.includes("top")) badgeClass += " badge-popular";
            else if (badgeType.includes("fast") || badgeType.includes("free")) badgeClass += " badge-fast";
            else badgeClass += " badge-hot";

            return (
              <div key={index} className="popular-tool-card-wrap">
                <AppLink
                  href={tool.href}
                  className="popular-tool-card-modern"
                  onClick={handleLinkClick}
                >
                  <div className="card-top-bar">
                    <div className="tool-icon-box">
                      <DynamicIcon name={tool.icon} size={24} fallback={<span>🔧</span>} />
                    </div>
                    {tool.badge && (
                      <span className={badgeClass}>{tool.badge}</span>
                    )}
                  </div>

                  <div className="card-content-area">
                    {/* Rating commented out:
                    <div className="rating-pill">
                      <LuStar size={12} fill="currentColor" />
                      <span>4.95 Rating</span>
                    </div>
                    */}
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                  </div>

                  <div className="card-footer-bar">
                    {tool.category && (
                      <span className="category-pill-tag">{tool.category}</span>
                    )}
                    <div className="card-action-circle">
                      <LuArrowRight size={15} />
                    </div>
                  </div>
                </AppLink>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Link */}
        <div className="popular-bottom-row">
          <AppLink href={config.footer.href} className="popular-view-all-cta">
            {config.footer.text}
          </AppLink>
        </div>
      </div>
    </section>
  );
}
