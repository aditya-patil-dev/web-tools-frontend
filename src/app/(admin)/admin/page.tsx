"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toolsApi } from "@/services/tools.service";
import type { Tool } from "@/types/tool.types";

export default function AdminDashboardPage() {
    // 1. Fetch Tools list to compute catalog health
    const { data: toolsData, isLoading: toolsLoading } = useQuery({
        queryKey: ["admin-dashboard-tools"],
        queryFn: async () => {
            const res = await toolsApi.getTools({ limit: 100 });
            return res;
        },
    });

    // 2. Fetch Categories with stats
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ["admin-dashboard-categories"],
        queryFn: async () => {
            const res = await toolsApi.getCategories();
            return res.data ?? [];
        },
    });

    // 3. Fetch Feedback stats (ratings, satisfaction rate)
    const { data: feedbackStats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-dashboard-feedback-stats"],
        queryFn: async () => {
            const res = await toolsApi.getFeedbackStats();
            return res.data;
        },
    });

    // 4. Fetch Recent Feedback Stream
    const { data: recentFeedback } = useQuery({
        queryKey: ["admin-dashboard-recent-feedback"],
        queryFn: async () => {
            const res = await toolsApi.getFeedbackList({ limit: 5 });
            return res.data ?? [];
        },
    });

    // Computations
    const tools: Tool[] = toolsData?.data ?? [];
    const totalTools = toolsData?.meta?.total ?? tools.length;
    const activeTools = tools.filter((t) => t.status === "active").length;
    const draftTools = tools.filter((t) => t.status === "draft").length;
    const featuredTools = tools.filter((t) => t.is_featured).length;

    const categories = categoriesData ?? [];
    const totalCategories = categories.length;

    const satisfactionRate = feedbackStats?.satisfaction_rate ?? 100;
    const totalResponses = feedbackStats?.total ?? 0;
    const helpfulCount = feedbackStats?.likes ?? 0;
    const dislikeCount = feedbackStats?.dislikes ?? 0;
    const feedbackList = recentFeedback ?? [];

    const isLoading = toolsLoading || categoriesLoading || statsLoading;

    return (
        <div className="adminPage">
            {/* Top Quick Actions Bar */}
            <div className="quickActionsCard">
                <div className="quickActionsTitle">
                    <i className="bi bi-lightning-charge-fill" style={{ color: "var(--admin-accent)" }} />
                    <span>Quick Management Actions</span>
                </div>
                <div className="quickActionsGrid">
                    <Link href="/admin/tools/tools-card/new" className="quickActionBtn">
                        <div className="quickActionIcon">
                            <i className="bi bi-plus-circle" />
                        </div>
                        <div>
                            <div>New Tool</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Add tool to catalog</span>
                        </div>
                    </Link>

                    <Link href="/admin/tools/categories/new" className="quickActionBtn">
                        <div className="quickActionIcon">
                            <i className="bi bi-folder-plus" />
                        </div>
                        <div>
                            <div>New Category</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Create taxonomy</span>
                        </div>
                    </Link>

                    <Link href="/admin/tools/tool-pages" className="quickActionBtn">
                        <div className="quickActionIcon">
                            <i className="bi bi-file-earmark-code" />
                        </div>
                        <div>
                            <div>Tool Pages & SEO</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Landing copy & FAQs</span>
                        </div>
                    </Link>

                    <Link href="/admin/import-export" className="quickActionBtn">
                        <div className="quickActionIcon">
                            <i className="bi bi-cloud-arrow-down" />
                        </div>
                        <div>
                            <div>Import / Export</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Bulk CSV operations</span>
                        </div>
                    </Link>

                    <Link href="/admin/online-store" className="quickActionBtn">
                        <div className="quickActionIcon">
                            <i className="bi bi-layout-text-window-reverse" />
                        </div>
                        <div>
                            <div>Storefront Builder</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>Edit visual sections</span>
                        </div>
                    </Link>

                    <Link href="/admin/settings/general" className="quickActionBtn">
                        <div className="quickActionIcon">
                            <i className="bi bi-sliders" />
                        </div>
                        <div>
                            <div>Site Settings</div>
                            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>SEO, meta & analytics</span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Core KPI Metrics Grid */}
            <div className="kpiGrid">
                {/* 1. Total Tools */}
                <Link href="/admin/tools/tools-card" className="kpiCard">
                    <div className="kpiHeader">
                        <div className="kpiIconWrap" style={{ background: "rgba(255, 107, 53, 0.12)", color: "#ea580c" }}>
                            <i className="bi bi-tools" />
                        </div>
                        <span className="kpiBadge" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
                            {featuredTools} Featured
                        </span>
                    </div>
                    <div className="kpiBody">
                        <span className="kpiLabel">Total Directory Tools</span>
                        <span className="kpiValue">{isLoading ? "..." : totalTools}</span>
                    </div>
                    <div className="kpiFooter">
                        <span>{activeTools} Published Active</span>
                        <span style={{ color: "#d97706" }}>{draftTools} Drafts</span>
                    </div>
                </Link>

                {/* 2. Categories */}
                <Link href="/admin/tools/categories" className="kpiCard">
                    <div className="kpiHeader">
                        <div className="kpiIconWrap" style={{ background: "rgba(99, 102, 241, 0.12)", color: "#4f46e5" }}>
                            <i className="bi bi-grid-1x2" />
                        </div>
                        <span className="kpiBadge" style={{ background: "rgba(99, 102, 241, 0.1)", color: "#4338ca" }}>
                            Taxonomy
                        </span>
                    </div>
                    <div className="kpiBody">
                        <span className="kpiLabel">Tool Categories</span>
                        <span className="kpiValue">{isLoading ? "..." : totalCategories}</span>
                    </div>
                    <div className="kpiFooter">
                        <span>Active taxonomy clusters</span>
                        <span>Manage ↗</span>
                    </div>
                </Link>

                {/* 3. User Satisfaction */}
                <Link href="/admin/tools/feedback" className="kpiCard">
                    <div className="kpiHeader">
                        <div className="kpiIconWrap" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#059669" }}>
                            <i className="bi bi-hand-thumbs-up-fill" />
                        </div>
                        <span className="kpiBadge" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#047857" }}>
                            Live Rating
                        </span>
                    </div>
                    <div className="kpiBody">
                        <span className="kpiLabel">User Satisfaction Rate</span>
                        <span className="kpiValue">{isLoading ? "..." : `${satisfactionRate}%`}</span>
                    </div>
                    <div className="kpiFooter">
                        <span>{helpfulCount} Helpful reviews</span>
                        <span style={{ color: "#059669" }}>High Quality</span>
                    </div>
                </Link>

                {/* 4. Feedback & Issues */}
                <Link href="/admin/tools/feedback" className="kpiCard">
                    <div className="kpiHeader">
                        <div className="kpiIconWrap" style={{ background: dislikeCount > 0 ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)", color: dislikeCount > 0 ? "#dc2626" : "#2563eb" }}>
                            <i className={dislikeCount > 0 ? "bi bi-exclamation-triangle-fill" : "bi bi-chat-square-text"} />
                        </div>
                        <span className="kpiBadge" style={{ background: dislikeCount > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)", color: dislikeCount > 0 ? "#b91c1c" : "#1d4ed8" }}>
                            {dislikeCount > 0 ? `${dislikeCount} Issues` : "No Issues"}
                        </span>
                    </div>
                    <div className="kpiBody">
                        <span className="kpiLabel">Total User Feedback</span>
                        <span className="kpiValue">{isLoading ? "..." : totalResponses}</span>
                    </div>
                    <div className="kpiFooter">
                        <span>{feedbackStats?.with_comments ?? 0} Comments written</span>
                        <span>View All ↗</span>
                    </div>
                </Link>
            </div>

            {/* Split Row: Live Feedback Stream & Category Breakdown */}
            <div className="dashboardSplitRow">
                {/* Left: Recent User Feedback Feed */}
                <div className="dashboardPanel">
                    <div className="dashboardPanelHeader">
                        <div className="dashboardPanelTitle">
                            <i className="bi bi-chat-left-dots" style={{ color: "var(--admin-accent)" }} />
                            <span>Recent Tool Feedback Stream</span>
                        </div>
                        <Link href="/admin/tools/feedback" className="dtBtn sm ghost">
                            <span>View All</span>
                            <i className="bi bi-arrow-right" />
                        </Link>
                    </div>

                    <div className="activityFeedList">
                        {feedbackList.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                                <i className="bi bi-inbox" style={{ fontSize: "1.75rem", display: "block", marginBottom: "6px" }} />
                                No user feedback submitted yet. Ratings and comments will stream here live.
                            </div>
                        ) : (
                            feedbackList.map((item) => {
                                const isLike = item.rating === "like";
                                return (
                                    <div key={item.id} className="activityFeedItem">
                                        <div
                                            className="activityBadge"
                                            style={{
                                                background: isLike ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                                color: isLike ? "#059669" : "#dc2626",
                                            }}
                                        >
                                            <i className={isLike ? "bi bi-hand-thumbs-up" : "bi bi-hand-thumbs-down"} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                                                <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#0f172a" }}>
                                                    {item.tool_title || item.tool_slug}
                                                </span>
                                                <span style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap" }}>
                                                    {new Date(item.created_at).toLocaleDateString(undefined, {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: item.reason ? "#475569" : "#94a3b8", fontStyle: item.reason ? "normal" : "italic" }}>
                                                {item.reason || `Rated as ${isLike ? "Helpful" : "Problem encountered"} (no comment provided)`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Category Distribution */}
                <div className="dashboardPanel">
                    <div className="dashboardPanelHeader">
                        <div className="dashboardPanelTitle">
                            <i className="bi bi-pie-chart" style={{ color: "var(--admin-accent)" }} />
                            <span>Category Distribution</span>
                        </div>
                        <Link href="/admin/tools/categories" className="dtBtn sm ghost">
                            <span>Manage</span>
                            <i className="bi bi-arrow-right" />
                        </Link>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {categories.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                                No categories created yet.
                            </div>
                        ) : (
                            categories.slice(0, 6).map((cat) => {
                                const toolCount = cat.tool_count ?? 0;
                                const maxTools = Math.max(...categories.map((c) => c.tool_count ?? 1), 1);
                                const percentage = Math.round((toolCount / maxTools) * 100);

                                return (
                                    <div key={cat.category_slug}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                                            <span style={{ fontWeight: 600, color: "#1e293b" }}>{cat.page_title}</span>
                                            <span className="dtBadge neutral">{toolCount} tools</span>
                                        </div>
                                        <div className="categoryProgressBar">
                                            <div
                                                className="categoryProgressFill"
                                                style={{ width: `${Math.max(percentage, 8)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
