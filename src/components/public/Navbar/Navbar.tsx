"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import AppLink from "@/components/common/AppLink";
import DynamicIcon from "@/components/ui/DynamicIcon";
import {
  MEGA_NAV_CATEGORIES,
  NavCategory,
  NavTool,
} from "./mega-nav.config";
import { MASTER_TOOLS, MasterTool } from "@/config/tools-registry";
import {
  LuChevronDown,
  LuSearch,
  LuSparkles,
  LuArrowRight,
  LuShieldCheck,
  LuMenu,
  LuX,
  LuTrendingUp,
  LuFileText,
  LuImage,
  LuCode,
  LuCheck,
  LuFlame,
  LuLayers,
} from "react-icons/lu";

interface NavbarProps {
  config?: {
    logoText?: string;
    logoHighlight?: string;
    ctaText?: string;
    ctaHref?: string;
    topNavItems?: { label: string; href: string }[];
  };
}

export default function Navbar({ config }: NavbarProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!isHomepage) {
      setIsScrolledPastHero(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolledPastHero(window.scrollY > 340);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  // Top announcement state
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Mega-menu state
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("image-tools");
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Command palette state (Ctrl + K)
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdCategory, setCmdCategory] = useState<string>("all");
  const [selectedCmdIndex, setSelectedCmdIndex] = useState(0);
  const cmdInputRef = useRef<HTMLInputElement>(null);

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<string>("all");
  const [mobileExpandedSubCat, setMobileExpandedSubCat] = useState<string | null>("img-compress-convert");

  // Config fallbacks
  const logoText = config?.logoText ?? "Fusion";
  const logoHighlight = config?.logoHighlight ?? "Tools";
  const ctaText = config?.ctaText ?? "Explore All Tools";
  const ctaHref = config?.ctaHref ?? "/tools";

  // Static top nav items (Pricing, About)
  const topNavItems = config?.topNavItems ?? [
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact-us" },
  ];

  // Active Category Data for Mega-Menu
  const activeCategory = useMemo(() => {
    return (
      MEGA_NAV_CATEGORIES.find((c) => c.slug === activeCategorySlug) ||
      MEGA_NAV_CATEGORIES[0]
    );
  }, [activeCategorySlug]);

  // Mega-Menu Hover Handlers with Intent Delay
  const handleTriggerEnter = (categorySlug?: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (categorySlug) {
      setActiveCategorySlug(categorySlug);
    }
    setMegaMenuOpen(true);
  };

  const handleMenuEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  // Keyboard shortcut listener for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setMegaMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus Command Palette input when opened
  useEffect(() => {
    if (cmdOpen) {
      setTimeout(() => {
        cmdInputRef.current?.focus();
      }, 50);
      setSelectedCmdIndex(0);
    } else {
      setCmdQuery("");
      setCmdCategory("all");
    }
  }, [cmdOpen]);

  // Lock body scroll when mobile drawer or command palette is open
  useEffect(() => {
    if (mobileOpen || cmdOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, cmdOpen]);

  // Filter tools for Command Palette
  const filteredCmdTools = useMemo(() => {
    let list = MASTER_TOOLS;
    if (cmdCategory !== "all") {
      list = list.filter((t) => t.category === cmdCategory);
    }
    if (cmdQuery.trim()) {
      const q = cmdQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 8);
  }, [cmdQuery, cmdCategory]);

  // Command palette keyboard navigation
  const handleCmdKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCmdTools.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedCmdIndex((prev) => (prev + 1) % filteredCmdTools.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedCmdIndex((prev) => (prev - 1 + filteredCmdTools.length) % filteredCmdTools.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredCmdTools[selectedCmdIndex];
      if (target) {
        setCmdOpen(false);
        window.location.href = target.href;
      }
    }
  };

  return (
    <>
      {/* ── 1. Top Announcement Bar ── */}
      {showAnnouncement && (
        <div className="announce-strip">
          <AppLink href="/seo/tools/keyword-research" className="announce-inner-link">
            <span className="announce-pill">New Flagship</span>
            <span>Free Keyword Research & Intent Tool is live — Explore search volumes & KD%</span>
            <span className="announce-arrow">→</span>
          </AppLink>
          <button
            className="announce-dismiss"
            onClick={(e) => {
              e.stopPropagation();
              setShowAnnouncement(false);
            }}
            aria-label="Dismiss announcement"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2. Streamlined Single-Row Modern Navigation Bar ── */}
      <header className="modern-nav-wrapper">
        <div className="modern-nav-container">
          {/* Brand Logo */}
          <AppLink href="/" className="modern-nav-logo" onClick={() => setMegaMenuOpen(false)}>
            <span className="modern-logo-dot" />
            <span>{logoText}</span>
            <span>{logoHighlight}</span>
          </AppLink>

          {/* Center Navigation Links (Desktop) */}
          <nav className="modern-nav-links desktop-nav-only">
            {/* Primary Mega-Menu Trigger: "All Tools" */}
            <div
              className="nav-trigger-wrap"
              onMouseEnter={() => handleTriggerEnter()}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`nav-mega-trigger-btn ${megaMenuOpen ? "active" : ""}`}
                onClick={() => setMegaMenuOpen((prev) => !prev)}
                aria-expanded={megaMenuOpen}
                aria-label="Open Tools Mega-Menu"
              >
                <span>All Tools</span>
                <LuChevronDown size={14} className="trigger-chevron" />
              </button>
            </div>

            {/* Direct Category Hover Triggers */}
            <div
              className="nav-trigger-wrap"
              onMouseEnter={() => handleTriggerEnter("image-tools")}
              onMouseLeave={handleMouseLeave}
            >
              <AppLink
                href="/tools/image-tools"
                className={`nav-mega-trigger-btn ${megaMenuOpen && activeCategorySlug === "image-tools" ? "active" : ""}`}
              >
                <LuImage size={15} />
                <span>Image</span>
              </AppLink>
            </div>

            <div
              className="nav-trigger-wrap"
              onMouseEnter={() => handleTriggerEnter("pdf-tools")}
              onMouseLeave={handleMouseLeave}
            >
              <AppLink
                href="/tools/pdf-tools"
                className={`nav-mega-trigger-btn ${megaMenuOpen && activeCategorySlug === "pdf-tools" ? "active" : ""}`}
              >
                <LuFileText size={15} />
                <span>PDF</span>
              </AppLink>
            </div>

            <div
              className="nav-trigger-wrap"
              onMouseEnter={() => handleTriggerEnter("seo-tools")}
              onMouseLeave={handleMouseLeave}
            >
              <AppLink
                href="/tools/seo-tools"
                className={`nav-mega-trigger-btn ${megaMenuOpen && activeCategorySlug === "seo-tools" ? "active" : ""}`}
              >
                <LuTrendingUp size={15} />
                <span>SEO</span>
                <span className="nav-pill-badge badge-hot">HOT</span>
              </AppLink>
            </div>

            <div
              className="nav-trigger-wrap"
              onMouseEnter={() => handleTriggerEnter("developer-tools")}
              onMouseLeave={handleMouseLeave}
            >
              <AppLink
                href="/tools/developer-tools"
                className={`nav-mega-trigger-btn ${megaMenuOpen && activeCategorySlug === "developer-tools" ? "active" : ""}`}
              >
                <LuCode size={15} />
                <span>Dev & Text</span>
              </AppLink>
            </div>

            {/* Dedicated Special Menu: Keyword Research */}
            <div className="nav-trigger-wrap">
              <AppLink
                href="/keyword-research"
                className="nav-mega-trigger-btn nav-flagship-btn"
                onClick={() => setMegaMenuOpen(false)}
              >
                <LuSparkles size={14} className="flagship-star-icon" />
                <span>Keyword Research</span>
                <span className="nav-pill-badge badge-flagship-vip">HOT</span>
              </AppLink>
            </div>

            {/* Static pages */}
            {topNavItems.map((item) => (
              <AppLink
                key={item.label}
                href={item.href}
                className="nav-mega-trigger-btn"
                onClick={() => setMegaMenuOpen(false)}
              >
                <span>{item.label}</span>
              </AppLink>
            ))}
          </nav>

          {/* Right-Side Command Search Pill & Actions */}
          <div className="modern-nav-right">
            {/* Quick Command Trigger Pill (Ctrl + K) - Contextual (hidden on homepage top to prevent search clash) */}
            <button
              type="button"
              className={`nav-cmd-trigger-btn ${isHomepage && !isScrolledPastHero ? "nav-cmd-hidden" : ""}`}
              onClick={() => setCmdOpen(true)}
              aria-label="Open search command palette"
            >
              <LuSearch size={15} className="cmd-icon" />
              <span>Search 25+ tools...</span>
              <kbd className="cmd-kbd-badge">⌘K</kbd>
            </button>

            {/* CTA Explore Button */}
            <AppLink href={ctaHref} className="nav-cta-btn desktop-nav-only">
              <span>{ctaText}</span>
              <LuArrowRight size={14} />
            </AppLink>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <LuMenu size={22} />
            </button>
          </div>
        </div>

        {/* ── 3. The Interactive Glassmorphic Mega-Menu Panel ── */}
        {megaMenuOpen && (
          <div
            className="mega-menu-overlay-panel"
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="mega-menu-inner-grid">
              {/* Column 1: Left Categories Rail */}
              <div className="mega-categories-rail">
                <span className="mega-rail-label">Categories</span>
                {MEGA_NAV_CATEGORIES.map((cat) => {
                  const isActive = cat.slug === activeCategorySlug;
                  const totalCount = cat.subCategories.reduce(
                    (acc, sub) => acc + sub.tools.length,
                    0
                  );
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                      onClick={() => setActiveCategorySlug(cat.slug)}
                      className={`mega-cat-tab-btn ${isActive ? "active" : ""}`}
                    >
                      <div className="mega-cat-tab-left">
                        <DynamicIcon name={cat.icon} size={16} fallback={<span>📁</span>} />
                        <span>{cat.label}</span>
                      </div>
                      <span className="mega-cat-count">{totalCount}</span>
                    </button>
                  );
                })}

                <AppLink
                  href="/tools"
                  className="mega-rail-all-tools-link"
                  onClick={() => setMegaMenuOpen(false)}
                >
                  <LuLayers size={15} />
                  <span>View All 25+ Directory →</span>
                </AppLink>
              </div>

              {/* Column 2: Center Sub-Categories & Tools Matrix */}
              <div className="mega-tools-matrix">
                <div className="mega-category-header">
                  <div className="mega-cat-title">
                    <DynamicIcon name={activeCategory.icon} size={20} fallback={<span>📁</span>} />
                    <span>{activeCategory.label}</span>
                  </div>
                  <AppLink
                    href={activeCategory.href}
                    className="mega-view-category-link"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <span>Browse {activeCategory.label} Hub</span>
                    <LuArrowRight size={13} />
                  </AppLink>
                </div>

                {/* Sub-Categories Grid */}
                <div className="mega-subcats-grid">
                  {activeCategory.subCategories.map((subcat) => (
                    <div key={subcat.id} className="mega-subcat-group">
                      <span className="mega-subcat-heading">{subcat.title}</span>
                      {subcat.tools.map((tool) => (
                        <AppLink
                          key={tool.id}
                          href={tool.href}
                          className="mega-tool-item-link"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          <div className="mega-tool-icon-wrap">
                            <DynamicIcon
                              name={tool.icon}
                              size={16}
                              fallback={<LuSparkles size={14} />}
                            />
                          </div>
                          <div className="mega-tool-text-content">
                            <div className="mega-tool-title-row">
                              <span className="mega-tool-title">{tool.title}</span>
                              {tool.badge && (
                                <span className="mega-tool-badge">{tool.badge}</span>
                              )}
                            </div>
                            <span className="mega-tool-desc">{tool.shortDescription}</span>
                          </div>
                        </AppLink>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Right Featured Spotlight Card */}
              <div className="mega-spotlight-col">
                <div className="mega-spotlight-card">
                  <div className="spotlight-eyebrow">
                    <span className="spotlight-pill">
                      {activeCategory.featured.badge}
                    </span>
                    <span className="spotlight-privacy-chip">
                      <LuShieldCheck size={13} />
                      <span>100% In-Browser</span>
                    </span>
                  </div>

                  <div className="spotlight-body">
                    <h4>{activeCategory.featured.title}</h4>
                    <div className="spotlight-tagline">
                      {activeCategory.featured.tagline}
                    </div>
                    <p className="spotlight-desc">
                      {activeCategory.featured.description}
                    </p>
                  </div>

                  <AppLink
                    href={activeCategory.featured.href}
                    className="spotlight-cta-btn"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <span>{activeCategory.featured.cta}</span>
                    <LuArrowRight size={14} />
                  </AppLink>
                </div>
              </div>
            </div>

            {/* Bottom Assurance Bar */}
            <div className="mega-bottom-assurance-bar">
              <div className="mega-assurance-inner">
                <div className="mega-assurance-chips">
                  <span className="mega-assurance-chip">
                    <LuShieldCheck size={14} color="#10b981" />
                    <span>Zero Server Uploads · Files Process in Browser Memory</span>
                  </span>
                  <span className="mega-assurance-chip">
                    <LuSparkles size={14} color="#ff6b35" />
                    <span>Instant WebAssembly Speed</span>
                  </span>
                </div>
                <AppLink
                  href="/tools"
                  style={{ color: "var(--color-primary)", fontWeight: 700, textDecoration: "none" }}
                  onClick={() => setMegaMenuOpen(false)}
                >
                  Explore Complete Directory (25+ Tools) →
                </AppLink>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── 4. Modern Command Palette Modal (Ctrl + K) ── */}
      {cmdOpen && (
        <div
          className="cmd-modal-backdrop"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="cmd-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleCmdKeyDown}
          >
            {/* Input Header */}
            <div className="cmd-input-header">
              <LuSearch size={18} color="var(--color-primary)" />
              <input
                ref={cmdInputRef}
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search tools by name, category, or task (e.g. compress, convert, serp)..."
                className="cmd-modal-input"
              />
              <button
                type="button"
                className="cmd-esc-btn"
                onClick={() => setCmdOpen(false)}
              >
                ESC
              </button>
            </div>

            {/* Filter Pills */}
            <div className="cmd-filter-tabs">
              {[
                { id: "all", label: "All Tools" },
                { id: "image-tools", label: "Image" },
                { id: "pdf-tools", label: "PDF" },
                { id: "seo-tools", label: "SEO" },
                { id: "developer-tools", label: "Dev & Code" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCmdCategory(pill.id)}
                  className={`cmd-filter-pill ${cmdCategory === pill.id ? "active" : ""}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="cmd-results-list">
              {filteredCmdTools.length > 0 ? (
                filteredCmdTools.map((tool, idx) => (
                  <AppLink
                    key={tool.id}
                    href={tool.href}
                    className={`cmd-result-row ${idx === selectedCmdIndex ? "selected" : ""}`}
                    onClick={() => setCmdOpen(false)}
                  >
                    <div className="cmd-row-left">
                      <div className="cmd-row-icon">
                        <DynamicIcon name={tool.icon} size={16} fallback={<LuSparkles size={14} />} />
                      </div>
                      <div className="cmd-row-info">
                        <span className="cmd-row-title">{tool.title}</span>
                        <span className="cmd-row-sub">{tool.shortDescription}</span>
                      </div>
                    </div>
                    {tool.badge && (
                      <span className="mega-tool-badge">{tool.badge}</span>
                    )}
                  </AppLink>
                ))
              ) : (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>
                  No tools found matching &quot;{cmdQuery}&quot;. Try &quot;image&quot;, &quot;compress&quot;, or &quot;pdf&quot;.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="cmd-footer-bar">
              <span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd> · Select with <kbd>↵</kbd></span>
              <span>25+ Free Web Tools</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Mobile & Tablet App Drawer ── */}
      {mobileOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`mobile-app-drawer ${mobileOpen ? "open" : ""}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <AppLink
            href="/"
            className="modern-nav-logo"
            onClick={() => setMobileOpen(false)}
          >
            <span className="modern-logo-dot" />
            <span>{logoText}</span>
            <span>{logoHighlight}</span>
          </AppLink>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close mobile menu"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Mobile Drawer VIP Flagship Card */}
        <div style={{ padding: "8px 16px 12px" }}>
          <AppLink
            href="/keyword-research"
            className="drawer-flagship-card"
            onClick={() => setMobileOpen(false)}
          >
            <div className="drawer-flagship-left">
              <span className="drawer-flagship-icon-box">
                <LuSparkles size={16} />
              </span>
              <div>
                <div className="drawer-flagship-title-row">
                  <strong>Keyword Research</strong>
                  <span className="nav-pill-badge badge-flagship-vip">HOT</span>
                </div>
                <p className="drawer-flagship-desc">Search volume, intent clusters & KD% difficulty</p>
              </div>
            </div>
            <LuArrowRight size={15} className="drawer-flagship-arrow" />
          </AppLink>
        </div>

        {/* Drawer Category Swipe Strip */}
        <div className="drawer-category-strip">
          <button
            type="button"
            onClick={() => setMobileCategory("all")}
            className={`drawer-cat-pill ${mobileCategory === "all" ? "active" : ""}`}
          >
            All Categories
          </button>
          {MEGA_NAV_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setMobileCategory(cat.slug);
                if (cat.subCategories[0]) {
                  setMobileExpandedSubCat(cat.subCategories[0].id);
                }
              }}
              className={`drawer-cat-pill ${mobileCategory === cat.slug ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drawer Body Scroll */}
        <div className="drawer-body-scroll">
          {MEGA_NAV_CATEGORIES.filter(
            (c) => mobileCategory === "all" || c.slug === mobileCategory
          ).map((cat) => (
            <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 4px 2px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {cat.label}
                </span>
                <AppLink
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ fontSize: "11.5px", color: "var(--text-tertiary)", textDecoration: "none" }}
                >
                  View All →
                </AppLink>
              </div>

              {cat.subCategories.map((subcat) => {
                const isExpanded = mobileExpandedSubCat === subcat.id;
                return (
                  <div key={subcat.id} className="drawer-subcat-card">
                    <button
                      type="button"
                      className="drawer-subcat-toggle"
                      onClick={() =>
                        setMobileExpandedSubCat(isExpanded ? null : subcat.id)
                      }
                    >
                      <span>{subcat.title} ({subcat.tools.length})</span>
                      <LuChevronDown
                        size={14}
                        style={{
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      />
                    </button>

                    {isExpanded && (
                      <div className="drawer-subcat-content">
                        {subcat.tools.map((tool) => (
                          <AppLink
                            key={tool.id}
                            href={tool.href}
                            className="drawer-tool-link"
                            onClick={() => setMobileOpen(false)}
                          >
                            <DynamicIcon name={tool.icon} size={15} fallback={<LuSparkles size={14} />} />
                            <span>{tool.title}</span>
                            {tool.badge && (
                              <span className="mega-tool-badge" style={{ marginLeft: "auto" }}>
                                {tool.badge}
                              </span>
                            )}
                          </AppLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Static Pages Links */}
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid var(--border-primary)", paddingTop: "14px" }}>
            {topNavItems.map((item) => (
              <AppLink
                key={item.label}
                href={item.href}
                className="drawer-tool-link"
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
              </AppLink>
            ))}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="drawer-bottom-actions">
          <AppLink
            href="/seo/tools/keyword-research"
            className="drawer-tool-link"
            style={{
              background: "rgba(255, 107, 53, 0.1)",
              border: "1px solid rgba(255, 107, 53, 0.25)",
              color: "var(--color-primary)",
              fontWeight: 700,
              justifyContent: "space-between",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <LuFlame size={15} />
              <span>Keyword Research Suite</span>
            </span>
            <span className="nav-pill-badge badge-hot">HOT</span>
          </AppLink>

          <AppLink
            href="/tools"
            className="drawer-cta-full"
            onClick={() => setMobileOpen(false)}
          >
            <span>Explore All 25+ Tools</span>
            <LuArrowRight size={15} />
          </AppLink>
        </div>
      </div>
    </>
  );
}
