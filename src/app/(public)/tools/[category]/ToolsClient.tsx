"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import DynamicIcon from "@/components/ui/DynamicIcon";
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
                    {tools.map((tool, index) => {
                        const iconName = tool.category_slug?.includes('image') ? 'LuImage' :
                                       tool.category_slug?.includes('pdf') ? 'LuFileText' :
                                       tool.category_slug?.includes('seo') ? 'LuTags' :
                                       tool.category_slug?.includes('dev') ? 'LuCode' :
                                       tool.category_slug?.includes('convert') ? 'LuRefreshCw' : 'LuTool';

                        return (
                            <motion.div 
                                key={tool.id} 
                                className="tool-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.02 }}
                            >
                                <AppLink href={tool.tool_url} className="tool-card-link">
                                    <div className="tool-glow"></div>
                                    {tool.badge && <span className="tool-card-badge">{tool.badge}</span>}
                                    <div className="tool-icon">
                                        <DynamicIcon name={iconName} size={32} fallback={<span>🔧</span>} />
                                    </div>
                                    <div className="tool-content">
                                        <h3>{tool.title}</h3>
                                        <p>{tool.short_description}</p>
                                    </div>
                                    <div className="tool-card-footer">
                                        <span className="tool-usage-tag">
                                            {tool.category_slug?.replace(/-/g, ' ').toUpperCase() || 'TOOL'}
                                        </span>
                                        <div className="tool-action-icon">
                                            <DynamicIcon name="LuArrowRight" size={16} />
                                        </div>
                                    </div>
                                </AppLink>
                            </motion.div>
                        );
                    })}
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
