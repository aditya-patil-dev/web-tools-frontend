"use client";

import Link from "next/link";
import AppLink from "@/components/common/AppLink";
import { useState, useEffect, useRef, useCallback } from "react";
import { TOP_NAV_ITEMS, TOOLS_NAV_ITEMS } from "./nav.config";
import type { NavbarData } from "@/features/online-store/sections/navbar";

interface NavbarProps {
  config?: Partial<NavbarData>;
}

/* ── Flat search index built from toolsNavItems ── */
interface SearchResult {
  label: string;
  href: string;
  badge?: string;
  parent?: string;
  icon?: string;
}

const TOOL_ICONS: Record<string, string> = {
  default: "🔧",
  pdf: "📄",
  image: "🖼️",
  video: "🎬",
  ai: "🤖",
  seo: "📈",
  dev: "💻",
  text: "✏️",
  link: "🔗",
};

function getIcon(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("pdf")) return TOOL_ICONS.pdf;
  if (
    l.includes("image") ||
    l.includes("photo") ||
    l.includes("crop") ||
    l.includes("background")
  )
    return TOOL_ICONS.image;
  if (l.includes("video")) return TOOL_ICONS.video;
  if (l.includes("ai") || l.includes("generat") || l.includes("summar"))
    return TOOL_ICONS.ai;
  if (l.includes("seo") || l.includes("analytic")) return TOOL_ICONS.seo;
  if (l.includes("code") || l.includes("developer") || l.includes("api"))
    return TOOL_ICONS.dev;
  if (l.includes("text") || l.includes("writ") || l.includes("word"))
    return TOOL_ICONS.text;
  if (l.includes("url") || l.includes("link")) return TOOL_ICONS.link;
  return TOOL_ICONS.default;
}

export default function Navbar({ config }: NavbarProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<number | null>(null);

  /* Search */
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentTools, setRecentTools] = useState<SearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  /* Typewriter */
  const [typewriterText, setTypewriterText] = useState("");
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const twStateRef = useRef({ phraseIdx: 0, charIdx: 0, deleting: false });

  /* Announcement strip */
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  /* Dark mode */
  const [darkMode, setDarkMode] = useState(false);

  /* ── Merge config with static defaults ── */
  const logoText = config?.logoText ?? "Web";
  const logoHighlight = config?.logoHighlight ?? "Tools";
  const ctaText = config?.ctaText ?? "Try Tools";
  const ctaHref = config?.ctaHref ?? "/tools";
  const loginHref = config?.loginHref ?? "/login";
  const topNavItems = config?.topNavItems ?? TOP_NAV_ITEMS;
  const toolsNavItems = config?.toolsNavItems ?? TOOLS_NAV_ITEMS;

  /* ── Build flat search index ── */
  const searchIndex: SearchResult[] = toolsNavItems.flatMap((item) => {
    const children: SearchResult[] =
      item.children?.map((c) => ({
        label: c.label,
        href: c.href,
        badge: c.badge,
        parent: item.label,
        icon: getIcon(c.label),
      })) ?? [];
    return [
      { label: item.label, href: item.href ?? "#", icon: getIcon(item.label) },
      ...children,
    ];
  });

  /* ── Typewriter phrases ── */
  const TYPEWRITER_PHRASES = [
    "PDF Converter…",
    "Image Resizer…",
    "Background Remover…",
    "URL Shortener…",
    "AI Writer…",
    "Video Compressor…",
    "SEO Analyzer…",
    "QR Code Generator…",
  ];

  const runTypewriter = useCallback(() => {
    const state = twStateRef.current;
    const phrase = TYPEWRITER_PHRASES[state.phraseIdx];
    if (!state.deleting) {
      state.charIdx++;
      setTypewriterText(phrase.slice(0, state.charIdx));
      if (state.charIdx === phrase.length) {
        state.deleting = true;
        // eslint-disable-next-line react-hooks/immutability
        typewriterRef.current = setTimeout(runTypewriter, 1600);
      } else {
        typewriterRef.current = setTimeout(runTypewriter, 68);
      }
    } else {
      state.charIdx--;
      setTypewriterText(phrase.slice(0, state.charIdx));
      if (state.charIdx === 0) {
        state.deleting = false;
        state.phraseIdx = (state.phraseIdx + 1) % TYPEWRITER_PHRASES.length;
        typewriterRef.current = setTimeout(runTypewriter, 400);
      } else {
        typewriterRef.current = setTimeout(runTypewriter, 38);
      }
    }
  }, []);

  const startTypewriter = useCallback(() => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    typewriterRef.current = setTimeout(runTypewriter, 800);
  }, [runTypewriter]);

  const stopTypewriter = useCallback(() => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
  }, []);

  /* ── Start typewriter on mount ── */
  useEffect(() => {
    startTypewriter();
    return () => stopTypewriter();
  }, [startTypewriter, stopTypewriter]);

  /* ── Load recents from localStorage ── */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wt_recent_tools");
      if (stored) setRecentTools(JSON.parse(stored));
    } catch {}
  }, []);

  /* ── Filter search ── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = searchIndex
      .filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.parent?.toLowerCase().includes(q),
      )
      .slice(0, 6);
    setSearchResults(filtered);
  }, [searchQuery]);

  /* ── ⌘K / Ctrl+K global shortcut ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchExpanded(true);
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setSearchExpanded(false);
        setSearchQuery("");
        startTypewriter();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ── Click outside to close search ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setSearchExpanded(false);
        setSearchQuery("");
        startTypewriter();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Dark mode toggle ── */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* ── Track recently used tool ── */
  const trackTool = useCallback((tool: SearchResult) => {
    setRecentTools((prev) => {
      const updated = [tool, ...prev.filter((t) => t.href !== tool.href)].slice(
        0,
        3,
      );
      try {
        localStorage.setItem("wt_recent_tools", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSearchExpanded(false);
    setSearchQuery("");
  }, []);

  const showDropdown =
    searchExpanded &&
    (searchQuery
      ? searchResults.length > 0
      : recentTools.length > 0 || searchIndex.length > 0);

  const displayResults = searchQuery
    ? searchResults
    : recentTools.length > 0
      ? recentTools
      : searchIndex.slice(0, 5);

  const dropdownLabel = searchQuery
    ? "Results"
    : recentTools.length > 0
      ? "Recently used"
      : "Popular tools";

  return (
    <>
      {/* ── Announcement Strip ── */}
      {showAnnouncement && (
        <div className="announce-strip">
          <span className="announce-pill">New</span>
          AI-powered tools are here — Smarter, faster, better.
          <span className="announce-arrow">→</span>
          <button
            className="announce-dismiss"
            onClick={() => setShowAnnouncement(false)}
            aria-label="Dismiss announcement"
          >
            ✕
          </button>
        </div>
      )}

      <header className="nav-wrapper">
        {/* ── TOP ROW ── */}
        <div className="nav-top-row">
          <div className="nav-container">
            {/* Logo */}
            <AppLink href="/" className="nav-logo">
              {logoText}
              <span>{logoHighlight}</span>
            </AppLink>

            {/* ── Full-width Animated Search Bar ── */}
            <div
              className={`search-wrap ${searchExpanded ? "expanded" : ""}`}
              ref={searchWrapRef}
            >
              <div
                className={`search-bar ${searchExpanded ? "open" : ""} ${searchQuery ? "has-text" : ""}`}
                onClick={() => {
                  searchInputRef.current?.focus();
                  setSearchExpanded(true);
                  stopTypewriter();
                }}
              >
                {/* Search icon */}
                <svg
                  className="search-icon"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <path d="M15 15l-3-3" />
                </svg>

                {/* Input + typewriter placeholder stacked */}
                <div className="search-input-wrap">
                  <input
                    ref={searchInputRef}
                    className="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      setSearchExpanded(true);
                      stopTypewriter();
                    }}
                    aria-label="Search tools"
                    autoComplete="off"
                  />
                  {/* Typewriter placeholder — hidden when user is typing */}
                  {!searchQuery && (
                    <div
                      className={`search-placeholder ${searchExpanded ? "ph-hidden" : ""}`}
                      aria-hidden="true"
                    >
                      <span className="ph-typed">{typewriterText}</span>
                      <span className="ph-cursor" />
                    </div>
                  )}
                </div>

                
              </div>

              {/* Search Dropdown */}
              {showDropdown && (
                <div className="search-dropdown" role="listbox">
                  <div className="search-dropdown-label">{dropdownLabel}</div>
                  <div className="search-results-grid">
                    {displayResults.map((result) => (
                      <AppLink
                        key={result.href}
                        href={result.href}
                        className="search-result-item"
                        role="option"
                        onClick={() => trackTool(result)}
                      >
                        <span className="search-result-icon">
                          {result.icon}
                        </span>
                        <span className="search-result-text">
                          <span className="search-result-label">
                            {result.label}
                          </span>
                          {result.parent && (
                            <span className="search-result-sub">
                              {result.parent}
                            </span>
                          )}
                        </span>
                        {result.badge && (
                          <span className={`badge badge-${result.badge}`}>
                            {result.badge}
                          </span>
                        )}
                      </AppLink>
                    ))}
                  </div>
                  <div className="search-footer">
                    <kbd>↑</kbd>
                    <kbd>↓</kbd>&nbsp;navigate&nbsp;·&nbsp;<kbd>↵</kbd>
                    &nbsp;open&nbsp;·&nbsp;<kbd>Esc</kbd>&nbsp;close
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Top Navigation */}
            <div className="nav-top-links desktop-only">
              {topNavItems.map((item) => (
                <AppLink
                  key={item.label}
                  href={item.href}
                  className="nav-top-link"
                >
                  {item.label}
                </AppLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="nav-actions desktop-only">
              <div className="nav-sep" />

              {/* <AppLink href={loginHref} className="nav-link">Login</AppLink> */}
              <AppLink href={ctaHref} className="nav-cta">
                {ctaText}
                <span className="cta-arrow" aria-hidden="true">
                  →
                </span>
              </AppLink>
            </div>

            {/* Mobile Hamburger */}
            <button
              className="mobile-toggle mobile-only"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="nav-bottom-row desktop-only">
          <div className="nav-container">
            <nav className="nav-tools-menu">
              {toolsNavItems.map((item, index) => {
                const hasDropdown = item.children && item.children.length > 0;
                return (
                  <div
                    key={item.label}
                    className={`nav-item ${hasDropdown ? "nav-dropdown" : ""} ${openIndex === index ? "open" : ""}`}
                    onMouseEnter={() => hasDropdown && setOpenIndex(index)}
                    onMouseLeave={() => hasDropdown && setOpenIndex(null)}
                  >
                    {hasDropdown ? (
                      <div className="nav-item-wrapper">
                        <AppLink href={item.href!} className="nav-item-link">
                          {item.label}
                        </AppLink>
                        <button
                          className="dropdown-trigger-btn"
                          aria-label={`Open ${item.label} menu`}
                        >
                          <span className="caret" />
                        </button>
                      </div>
                    ) : (
                      <AppLink href={item.href!}>{item.label}</AppLink>
                    )}

                    {hasDropdown && (
                      <div className="dropdown-menu">
                        {item.children!.map((child) => (
                          <AppLink
                            key={child.href}
                            href={child.href}
                            onClick={() =>
                              trackTool({
                                label: child.label,
                                href: child.href,
                                badge: child.badge,
                                parent: item.label,
                                icon: getIcon(child.label),
                              })
                            }
                          >
                            {child.label}
                            {child.badge && (
                              <span className={`badge badge-${child.badge}`}>
                                {child.badge}
                              </span>
                            )}
                          </AppLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* ── Mobile Slide Panel ── */}
      <div className={`mobile-panel ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-header">
          <span className="nav-logo">
            <span className="logo-dot" aria-hidden="true" />
            {logoText}
            <span>{logoHighlight}</span>
          </span>
          <button
            className="close-btn"
            onClick={() => {
              setMobileOpen(false);
              setMobileSub(null);
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mobile-search">
          <svg
            className="search-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M15 15l-3-3" />
          </svg>
          <input
            type="text"
            placeholder="Search tools…"
            className="mobile-search-input"
            autoComplete="off"
          />
        </div>

        <ul className="mobile-menu">
          {topNavItems.map((item) => (
            <li key={item.label}>
              <AppLink
                href={item.href}
                className="mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </AppLink>
            </li>
          ))}
          <li className="mobile-divider">Tools</li>
          {toolsNavItems.map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = mobileSub === index;
            return (
              <li key={item.label}>
                {hasChildren ? (
                  <>
                    <div className="mobile-link-wrapper">
                      <AppLink
                        href={item.href!}
                        className="mobile-link"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </AppLink>
                      <button
                        className="mobile-dropdown-btn"
                        onClick={() => setMobileSub(isOpen ? null : index)}
                        aria-label={`Toggle ${item.label} submenu`}
                      >
                        <span className={`caret ${isOpen ? "rotate" : ""}`} />
                      </button>
                    </div>
                    <div className={`mobile-submenu ${isOpen ? "open" : ""}`}>
                      {item.children!.map((child) => (
                        <AppLink
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                          {child.badge && (
                            <span className={`badge badge-${child.badge}`}>
                              {child.badge}
                            </span>
                          )}
                        </AppLink>
                      ))}
                    </div>
                  </>
                ) : (
                  <AppLink
                    href={item.href!}
                    className="mobile-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </AppLink>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mobile-actions">
          {/* <AppLink href={loginHref} onClick={() => setMobileOpen(false)}>Login</AppLink> */}
          <AppLink
            href={ctaHref}
            className="nav-cta"
            onClick={() => setMobileOpen(false)}
          >
            {ctaText} →
          </AppLink>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => {
            setMobileOpen(false);
            setMobileSub(null);
          }}
        />
      )}
    </>
  );
}
