"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    AiOutlineEye,
    AiOutlineUser,
    AiOutlineStar,
    AiOutlineArrowRight,
    AiOutlineSearch,
} from "react-icons/ai";

import {
    fetchToolsByCategory,
    ToolItem,
    CategoryPage,
} from "../tools.config";

/* -----------------------------
   Star Rating Component
------------------------------ */
function StarRating({ rating }: { rating: number }) {
    const safeRating = Number(rating) || 0;
    const fullStars = Math.floor(safeRating);

    return (
        <div className="stars">
            {[...Array(5)].map((_, i) => (
                <motion.span
                    key={i}
                    className={i < fullStars ? "filled" : ""}
                >
                    <AiOutlineStar />
                </motion.span>
            ))}
            <span className="rating-text">{safeRating.toFixed(1)}</span>
        </div>
    );
}

export default function ToolsListing() {
    const params = useParams();
    const category = params.category as string;

    /* -----------------------------
       Fetch tools + category page
       - cached per category for 5 minutes
       - user visits /tools/seo then /tools/image then back to /tools/seo
         → only 2 API calls total, not 3
    ------------------------------ */
    const { data, isLoading, isError } = useQuery({
        queryKey: ["tools-by-category", category],
        queryFn: () => fetchToolsByCategory(category),
        staleTime: 1000 * 60 * 5,  // 5 minutes
        enabled: !!category,
    });

    const tools: ToolItem[] = data?.tools ?? [];
    const categoryPage: CategoryPage | null = data?.category ?? null;

    /* -----------------------------
       Derived Stats
    ------------------------------ */
    const totalActiveUsers = tools.reduce(
        (sum, tool) => sum + Number(tool.users_count || 0),
        0,
    );

    if (isLoading) {
        return (
            <div className="tools-page-wrapper">
                <div className="tools-page-container">
                    <div className="tools-page-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="tool-card tool-card--skeleton" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="tools-error">
                <p>Failed to load tools. Please try again.</p>
            </div>
        );
    }

    return (
        <section className="tools-page-wrapper">
            <div className="tools-page-container">

                {/* Header */}
                <div className="tools-page-header">
                    <h1>
                        {categoryPage?.page_title ||
                            category.replace(/-/g, " ")}
                    </h1>

                    <p>
                        {categoryPage?.page_description ||
                            "Browse all available tools and start using them instantly."}
                    </p>

                    {categoryPage?.page_intro && (
                        <div className="category-intro">
                            {categoryPage.page_intro}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-number">{tools.length}</span>
                        <span className="stat-label">Tools Available</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-number">
                            {totalActiveUsers.toLocaleString()}
                        </span>
                        <span className="stat-label">Active Users</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-number">100%</span>
                        <span className="stat-label">Free to Use</span>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="tools-page-grid">
                    {tools.map((tool) => (
                        <div key={tool.id} className="tool-card">
                            {tool.badge && (
                                <span className={`tool-badge ${tool.badge}`}>
                                    {tool.badge.toUpperCase()}
                                </span>
                            )}

                            <h3>{tool.title}</h3>
                            <p className="tool-desc">{tool.short_description}</p>

                            <div className="tool-tags">
                                {tool.tags.map((tag) => (
                                    <span key={tag}>{tag}</span>
                                ))}
                            </div>

                            <div className="tool-meta">
                                <span>
                                    <AiOutlineEye /> {tool.views.toLocaleString()}
                                </span>
                                <span>
                                    <AiOutlineUser /> {tool.users_count.toLocaleString()}
                                </span>
                            </div>

                            <StarRating rating={tool.rating} />

                            <Link
                                href={tool.tool_url}
                                className="tool-cta-wrapper"
                            >
                                <div className="tool-cta">
                                    Try Free <AiOutlineArrowRight />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {tools.length === 0 && (
                    <div className="empty-state">
                        <AiOutlineSearch />
                        <h3>No tools found</h3>
                        <p>This category has no tools yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}