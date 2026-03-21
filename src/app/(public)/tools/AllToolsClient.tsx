"use client";

import Link from "next/link";
import AppLink from '@/components/common/AppLink';
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    AiOutlineEye,
    AiOutlineUser,
    AiOutlineStar,
    AiOutlineArrowRight,
    AiOutlineSearch,
    AiOutlineAppstore,
} from "react-icons/ai";

import { fetchAllTools } from "@/lib/api-calls/tools.api";
import { ToolItem } from "@/app/(public)/tools/tools.config";

// ─────────────────────────────────────────────────────────────
// STAR RATING
// ─────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    const safeRating = Number(rating) || 0;
    if (!safeRating) return null;
    const fullStars = Math.floor(safeRating);

    return (
        <div className="stars">
            {[...Array(5)].map((_, i) => (
                <span key={i} className={i < fullStars ? "filled" : ""}>
                    <AiOutlineStar />
                </span>
            ))}
            <span className="rating-text">{safeRating.toFixed(1)}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// TOOL CARD
// ─────────────────────────────────────────────────────────────
function ToolCard({ tool, index }: { tool: ToolItem; index: number }) {
    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
        >
            {tool.badge && (
                <span className={`tool-badge ${tool.badge}`}>
                    {tool.badge.toUpperCase()}
                </span>
            )}

            <h3>{tool.title}</h3>

            {tool.short_description && (
                <p className="tool-desc">{tool.short_description}</p>
            )}

            {tool.tags && tool.tags.length > 0 && (
                <div className="tool-tags">
                    {tool.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            )}

            {(tool.views > 0 || tool.users_count > 0) && (
                <div className="tool-meta">
                    {tool.views > 0 && (
                        <span>
                            <AiOutlineEye /> {tool.views.toLocaleString()}
                        </span>
                    )}
                    {tool.users_count > 0 && (
                        <span>
                            <AiOutlineUser /> {tool.users_count.toLocaleString()}
                        </span>
                    )}
                </div>
            )}

            <StarRating rating={tool.rating} />

            <AppLink href={tool.tool_url} className="tool-cta-wrapper">
                <div className="tool-cta">
                    Try Free <AiOutlineArrowRight />
                </div>
            </AppLink>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE CLIENT
// ─────────────────────────────────────────────────────────────
export default function AllToolsClient() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");

    const { data, isLoading, isError } = useQuery({
        queryKey: ["all-tools"],
        queryFn: fetchAllTools,
        staleTime: 1000 * 60 * 5, // 5 minutes — matches category page cache
    });

    const tools: ToolItem[] = data?.tools ?? [];
    const categories = data?.categories ?? [];

    // ── Derived stats ────────────────────────────────────────
    const totalUsers = tools.reduce(
        (sum, t) => sum + Number(t.users_count || 0),
        0,
    );

    // ── Filtered tools (search + category) ──────────────────
    const filtered = useMemo(() => {
        let result = tools;

        if (activeCategory !== "all") {
            result = result.filter((t) => t.category_slug === activeCategory);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.short_description?.toLowerCase().includes(q) ||
                    t.tags?.some((tag) => tag.toLowerCase().includes(q)),
            );
        }

        return result;
        // eslint-disable-next-line react-hooks/preserve-manual-memoization
    }, [tools, activeCategory, search]);

    // ─────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="tools-page-wrapper">
                <div className="tools-page-container">
                    <div className="tools-page-grid">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="tool-card tool-card--skeleton" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────
    if (isError) {
        return (
            <div className="tools-error">
                <p>Failed to load tools. Please try again.</p>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────
    return (
        <section className="tools-page-wrapper">
            <div className="tools-page-container">

                {/* ── Header ──────────────────────────────────── */}
                <div className="tools-page-header">
                    <h1>Explore All Free Web Tools – Image, PDF, SEO & Developer Utilities</h1>
                    <p>Browse our complete directory of free online web tools. From PDF converters to developer utilities and SEO generators, find exactly what you need to work faster.</p>
                </div>

                {/* ── Stats bar ───────────────────────────────── */}
                {(tools.length > 0 || totalUsers > 0) && (
                    <div className="stats-bar">
                        {tools.length > 0 && (
                            <div className="stat-item">
                                <span className="stat-number">{tools.length}</span>
                                <span className="stat-label">Tools Available</span>
                            </div>
                        )}
                        {categories.length > 0 && (
                            <div className="stat-item">
                                <span className="stat-number">{categories.length}</span>
                                <span className="stat-label">Categories</span>
                            </div>
                        )}
                        {totalUsers > 0 && (
                            <div className="stat-item">
                                <span className="stat-number">
                                    {totalUsers.toLocaleString()}
                                </span>
                                <span className="stat-label">Active Users</span>
                            </div>
                        )}
                        <div className="stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Free to Use</span>
                        </div>
                    </div>
                )}

                {/* ── Search ──────────────────────────────────── */}
                <div className="all-tools-search-wrapper">
                    <AiOutlineSearch className="all-tools-search-icon" />
                    <input
                        className="all-tools-search"
                        type="text"
                        placeholder="Search tools by name, tag, or description…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            className="all-tools-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* ── Category filter tabs ─────────────────────── */}
                {categories.length > 0 && (
                    <div className="all-tools-category-tabs">
                        <button
                            className={`all-tools-tab ${activeCategory === "all" ? "active" : ""}`}
                            onClick={() => setActiveCategory("all")}
                        >
                            <AiOutlineAppstore /> All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                className={`all-tools-tab ${activeCategory === cat.slug ? "active" : ""}`}
                                onClick={() => setActiveCategory(cat.slug)}
                            >
                                {cat.category_name || cat.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Result count ────────────────────────────── */}
                {(search || activeCategory !== "all") && (
                    <p className="all-tools-result-count">
                        {filtered.length} tool{filtered.length !== 1 ? "s" : ""} found
                        {search && <> for &ldquo;<strong>{search}</strong>&rdquo;</>}
                    </p>
                )}

                {/* ── Tools grid ──────────────────────────────── */}
                <AnimatePresence mode="wait">
                    <div className="tools-page-grid">
                        {filtered.map((tool, i) => (
                            <ToolCard key={tool.id} tool={tool} index={i} />
                        ))}
                    </div>
                </AnimatePresence>

                {/* ── Empty state ─────────────────────────────── */}
                {filtered.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon">
                            <AiOutlineSearch />
                        </span>
                        <h3>No tools found</h3>
                        <p>
                            {search
                                ? `No results for "${search}". Try a different keyword.`
                                : "This category has no tools yet."}
                        </p>
                        {(search || activeCategory !== "all") && (
                            <button
                                className="tool-cta"
                                style={{ marginTop: "24px", width: "auto", padding: "12px 28px" }}
                                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

            </div>
        </section>
    );
}