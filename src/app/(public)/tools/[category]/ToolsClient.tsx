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
import AppLink from '@/components/common/AppLink';

/* -----------------------------
   Star Rating Component
------------------------------ */
function StarRating({ rating }: { rating: number }) {
    const safeRating = Number(rating) || 0;

    // Don't render if rating is 0 or null
    if (!safeRating) return null;

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

    // Calculate available tools count (only tools with data)
    const validToolsCount = tools.filter(tool => tool.title).length;

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

                    {/* Only show description if it exists */}
                    {(categoryPage?.page_description || category) && (
                        <p>
                            {categoryPage?.page_description ||
                                "Browse all available tools and start using them instantly."}
                        </p>
                    )}

                    {/* Only show intro if it exists */}
                    {categoryPage?.page_intro && (
                        <div className="category-intro">
                            {categoryPage.page_intro}
                        </div>
                    )}
                </div>

                {/* Stats - Only show if we have data */}
                {(validToolsCount > 0 || totalActiveUsers > 0) && (
                    <div className="stats-bar">
                        {/* Only show Tools Available if count > 0 */}
                        {validToolsCount > 0 && (
                            <div className="stat-item">
                                <span className="stat-number">{validToolsCount}</span>
                                <span className="stat-label">Tools Available</span>
                            </div>
                        )}

                        {/* Only show Active Users if count > 0 */}
                        {totalActiveUsers > 0 && (
                            <div className="stat-item">
                                <span className="stat-number">
                                    {totalActiveUsers.toLocaleString()}
                                </span>
                                <span className="stat-label">Active Users</span>
                            </div>
                        )}

                        {/* Always show "Free to Use" as it's a constant */}
                        <div className="stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Free to Use</span>
                        </div>
                    </div>
                )}

                {/* Tools Grid */}
                <div className="tools-page-grid">
                    {tools.map((tool) => (
                        <div key={tool.id} className="tool-card">
                            {/* Only show badge if it exists */}
                            {tool.badge && (
                                <span className={`tool-badge ${tool.badge}`}>
                                    {tool.badge.toUpperCase()}
                                </span>
                            )}

                            {/* Title - always show (required field) */}
                            <h3>{tool.title}</h3>

                            {/* Only show description if it exists */}
                            {tool.short_description && (
                                <p className="tool-desc">{tool.short_description}</p>
                            )}

                            {/* Only show tags if array has items */}
                            {tool.tags && tool.tags.length > 0 && (
                                <div className="tool-tags">
                                    {tool.tags.map((tag) => (
                                        <span key={tag}>{tag}</span>
                                    ))}
                                </div>
                            )}

                            {/* Only show meta if either views or users_count exists */}
                            {(tool.views > 0 || tool.users_count > 0) && (
                                <div className="tool-meta">
                                    {/* Only show views if > 0 */}
                                    {tool.views > 0 && (
                                        <span>
                                            <AiOutlineEye /> {tool.views.toLocaleString()}
                                        </span>
                                    )}

                                    {/* Only show users_count if > 0 */}
                                    {tool.users_count > 0 && (
                                        <span>
                                            <AiOutlineUser /> {tool.users_count.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* StarRating component handles null internally */}
                            <StarRating rating={tool.rating} />

                            {/* CTA - always show (required for functionality) */}
                            <AppLink
                                href={tool.tool_url}
                                className="tool-cta-wrapper"
                            >
                                <div className="tool-cta">
                                    Try Free <AiOutlineArrowRight />
                                </div>
                            </AppLink>
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
