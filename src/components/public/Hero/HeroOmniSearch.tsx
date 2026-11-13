"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import AppLink from "@/components/common/AppLink";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { searchTools, MasterTool, MASTER_TOOLS } from "@/config/tools-registry";
import {
  LuSearch,
  LuSparkles,
  LuImage,
  LuEraser,
  LuFileText,
  LuCode,
  LuX,
  LuArrowRight,
  LuSlidersHorizontal,
} from "react-icons/lu";

export type SearchScope = "all" | "image" | "pdf" | "seo" | "dev";

export interface ScopeTab {
  id: SearchScope;
  label: string;
  icon?: React.ReactNode;
  placeholder: string;
}

export const SCOPE_TABS: ScopeTab[] = [
  {
    id: "all",
    label: "All (25+)",
    placeholder: "Search tools, actions, or file types (e.g. compress, pdf to word, serp)...",
  },
  {
    id: "image",
    label: "Image",
    icon: <LuImage size={13} />,
    placeholder: "Search image tools: compress, erase background, crop, resize, convert...",
  },
  {
    id: "pdf",
    label: "PDF",
    icon: <LuFileText size={13} />,
    placeholder: "Search PDF tools: pdf to word, merge pdf, compress, jpg to pdf...",
  },
  {
    id: "seo",
    label: "SEO",
    icon: <LuSearch size={13} />,
    placeholder: "Search SEO tools: keyword research, serp simulator, meta tags...",
  },
  {
    id: "dev",
    label: "Dev & Code",
    icon: <LuCode size={13} />,
    placeholder: "Search developer tools: format json, beautify code, qr generator...",
  },
];

interface HeroOmniSearchProps {
  activeScope?: SearchScope;
  onScopeChange?: (scope: SearchScope) => void;
}

export default function HeroOmniSearch({
  activeScope: controlledScope,
  onScopeChange,
}: HeroOmniSearchProps) {
  const [internalScope, setInternalScope] = useState<SearchScope>("all");
  const activeScope = controlledScope !== undefined ? controlledScope : internalScope;

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active placeholder based on scope
  const currentPlaceholder = useMemo(() => {
    const tab = SCOPE_TABS.find((t) => t.id === activeScope);
    return tab?.placeholder ?? SCOPE_TABS[0].placeholder;
  }, [activeScope]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter tools based on query and activeScope
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      if (activeScope === "all") return [];
      // If scope is selected but query is empty, show top 5 tools from that scope!
      return MASTER_TOOLS.filter((t) => {
        if (activeScope === "image") return t.category === "image-tools";
        if (activeScope === "pdf") return t.category === "pdf-tools";
        if (activeScope === "seo") return t.category === "seo-tools";
        if (activeScope === "dev") return t.category === "developer-tools";
        return true;
      }).slice(0, 5);
    }

    let matches = searchTools(query, 8);
    if (activeScope !== "all") {
      matches = matches.filter((t) => {
        if (activeScope === "image") return t.category === "image-tools";
        if (activeScope === "pdf") return t.category === "pdf-tools";
        if (activeScope === "seo") return t.category === "seo-tools";
        if (activeScope === "dev") return t.category === "developer-tools";
        return true;
      });
    }
    return matches.slice(0, 6);
  }, [query, activeScope]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Key navigation in dropdown
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter") {
      if (filteredResults[selectedIndex]) {
        e.preventDefault();
        window.location.href = filteredResults[selectedIndex].href;
      }
    }
  };

  const handleScopeClick = (scopeId: SearchScope) => {
    if (controlledScope === undefined) {
      setInternalScope(scopeId);
    }
    onScopeChange?.(scopeId);
    inputRef.current?.focus();
    setIsOpen(true);
  };

  return (
    <div className="omni-command-console" ref={containerRef}>
      {/* ── 1. Interactive Scope Category Selector Tabs ── */}
      <div className="omni-scope-bar">
        {SCOPE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleScopeClick(tab.id)}
            className={`omni-scope-tab ${activeScope === tab.id ? "active" : ""}`}
          >
            {tab.icon && <span className="scope-tab-icon">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── 2. Unified Search Console Bar ── */}
      <div className="omni-console-input-row">
        <div className="omni-console-search-icon">
          <LuSearch size={18} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={currentPlaceholder}
          className="omni-console-input"
          aria-label="Search tools"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="omni-clear-btn"
            aria-label="Clear search"
          >
            <LuX size={14} />
          </button>
        )}

        <div className="omni-shortcut-pill">
          <span>Ctrl</span>
          <span>K</span>
        </div>
      </div>

      {/* ── 3. Live Popover Dropdown Results ── */}
      {isOpen && (filteredResults.length > 0 || query.trim().length > 0) && (
        <div className="omni-dropdown-popover">
          {filteredResults.length > 0 ? (
            <div className="omni-results-group">
              <div className="omni-results-header">
                <span>
                  {query.trim()
                    ? `Results for "${query}"`
                    : `Popular in ${SCOPE_TABS.find((t) => t.id === activeScope)?.label}`}
                </span>
                <span className="omni-results-count">{filteredResults.length} found</span>
              </div>

              {filteredResults.map((tool, idx) => (
                <AppLink
                  key={tool.id}
                  href={tool.href}
                  className={`omni-result-item ${idx === selectedIndex ? "active" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="omni-result-left">
                    <div className="omni-tool-icon-frame">
                      <DynamicIcon name={tool.icon} size={17} fallback={<LuSparkles size={15} />} />
                    </div>
                    <div className="omni-result-info">
                      <span className="omni-result-title">{tool.title}</span>
                      <span className="omni-result-desc">{tool.shortDescription}</span>
                    </div>
                  </div>

                  <div className="omni-result-right">
                    {tool.badge && (
                      <span className="omni-tool-status-badge">{tool.badge}</span>
                    )}
                    <LuArrowRight size={14} className="omni-result-arrow" />
                  </div>
                </AppLink>
              ))}
            </div>
          ) : (
            <div className="omni-empty-box">
              <p>No tools found matching &quot;{query}&quot; in {activeScope.toUpperCase()}.</p>
              <button
                type="button"
                onClick={() => handleScopeClick("all")}
                className="omni-reset-scope-btn"
              >
                Search all 25+ tools instead
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
