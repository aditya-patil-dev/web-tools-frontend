"use client";

import { useState, useMemo, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import DataTable from "@/components/table/DataTable";
import PageHeader from "@/components/page-header/PageHeader";
import type { DataTableQueryState } from "@/components/table/table.types";
import { toast } from "@/components/toast/toast";
import { toolsApi } from "@/services/tools.service";
import type { ToolFeedbackItem } from "@/types/tool-feedback.types";
import styles from "./feedback.module.css";

export default function ToolFeedbackAdminPage() {
    // ── Filters & Table state ──
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [viewingItem, setViewingItem] = useState<ToolFeedbackItem | null>(null);

    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ── Fetch feedback statistics ──
    const {
        data: statsData,
        refetch: refetchStats,
    } = useQuery({
        queryKey: ["admin-tool-feedback-stats"],
        queryFn: async () => {
            const res = await toolsApi.getFeedbackStats();
            return res.data;
        },
    });

    // ── Fetch feedback list ──
    const apiParams = useMemo(() => ({
        page: query.pageIndex + 1,
        limit: query.pageSize,
        search: query.globalFilter,
        rating: ratingFilter !== "all" ? ratingFilter : undefined,
    }), [query, ratingFilter]);

    const {
        data: listData,
        isLoading,
        error,
        refetch: refetchList,
    } = useQuery({
        queryKey: ["admin-tool-feedback-list", apiParams],
        queryFn: async () => {
            const res = await toolsApi.getFeedbackList(apiParams);
            return res;
        },
    });

    const feedbackItems: ToolFeedbackItem[] = listData?.data ?? [];
    const totalCount = listData?.meta?.total ?? 0;

    // ── Delete action ──
    const handleDelete = useCallback(async (id: number) => {
        if (!confirm("Are you sure you want to delete this feedback record?")) return;
        try {
            await toolsApi.deleteFeedback(id);
            toast.success("Feedback deleted successfully");
            refetchList();
            refetchStats();
            if (viewingItem?.id === id) setViewingItem(null);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Failed to delete feedback";
            toast.error(msg);
        }
    }, [refetchList, refetchStats, viewingItem]);

    // ── Table Columns ──
    const columns = useMemo<ColumnDef<ToolFeedbackItem>[]>(() => [
        {
            id: "tool_slug",
            accessorKey: "tool_slug",
            header: "Tool",
            cell: ({ row }) => (
                <div className="dtCellText">
                    <div className="dtCellTitle" style={{ fontWeight: 600 }}>
                        {row.original.tool_title || row.original.tool_slug}
                    </div>
                    <code className="dtCode" style={{ fontSize: "0.75rem", opacity: 0.75 }}>
                        /{row.original.tool_slug}
                    </code>
                </div>
            ),
        },
        {
            id: "rating",
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => {
                const isLike = row.original.rating === "like";
                return (
                    <span className={`${styles.ratingBadge} ${isLike ? styles.badgeLike : styles.badgeDislike}`}>
                        <i className={`bi ${isLike ? "bi-hand-thumbs-up-fill" : "bi-hand-thumbs-down-fill"}`} style={{ marginRight: 4 }} />
                        {isLike ? "Helpful" : "Issue Reported"}
                    </span>
                );
            },
        },
        {
            id: "reason",
            accessorKey: "reason",
            header: "User Comment / Reason",
            cell: ({ row }) => {
                const comment = row.original.reason;
                if (!comment) {
                    return <span className="dtMuted">—</span>;
                }
                const isLong = comment.length > 70;
                return (
                    <div
                        className={styles.commentCell}
                        onClick={() => setViewingItem(row.original)}
                        title="Click to view full feedback"
                    >
                        <span>{isLong ? `${comment.slice(0, 70)}...` : comment}</span>
                        {isLong && <span className={styles.readMoreTag}>View</span>}
                    </div>
                );
            },
        },
        {
            id: "ip_address",
            accessorKey: "ip_address",
            header: "Origin",
            cell: ({ row }) => (
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #888)" }}>
                    <div>{row.original.ip_address || "Anonymous"}</div>
                </div>
            ),
        },
        {
            id: "created_at",
            accessorKey: "created_at",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return (
                    <span style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {row.original.reason && (
                        <button
                            type="button"
                            className="dtBtn secondary"
                            onClick={() => setViewingItem(row.original)}
                            title="View full feedback"
                            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        >
                            <i className="bi bi-eye" />
                        </button>
                    )}
                    <button
                        type="button"
                        className="dtBtn danger"
                        onClick={() => handleDelete(row.original.id)}
                        title="Delete feedback"
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                    >
                        <i className="bi bi-trash" />
                    </button>
                </div>
            ),
        },
    ], [handleDelete]);

    return (
        <div className="adminPage">
            <PageHeader
                title="User Tool Feedback"
                subtitle="Real-time ratings, comments, and satisfaction metrics after tool usage"
                variant="flat"
            />

            {/* ── KPI Metric Cards ── */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
                        <i className="bi bi-chat-square-heart" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Total Responses</div>
                        <div className={styles.statValue}>{statsData?.total ?? 0}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                        <i className="bi bi-star-fill" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Satisfaction Rate</div>
                        <div className={styles.statValue}>
                            {statsData?.satisfaction_rate ?? 100}%
                        </div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#16a34a" }}>
                        <i className="bi bi-hand-thumbs-up" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Helpful (Likes)</div>
                        <div className={styles.statValue}>{statsData?.likes ?? 0}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                        <i className="bi bi-hand-thumbs-down" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Issues (Dislikes)</div>
                        <div className={styles.statValue}>{statsData?.dislikes ?? 0}</div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIconWrapper} style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                        <i className="bi bi-chat-left-text" />
                    </div>
                    <div>
                        <div className={styles.statLabel}>Written Comments</div>
                        <div className={styles.statValue}>{statsData?.with_comments ?? 0}</div>
                    </div>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className={styles.filterBar}>
                <div className={styles.filterPills}>
                    <button
                        type="button"
                        className={`${styles.filterPill} ${ratingFilter === "all" ? styles.activePill : ""}`}
                        onClick={() => setRatingFilter("all")}
                    >
                        All Feedback ({statsData?.total ?? 0})
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterPill} ${ratingFilter === "like" ? styles.activePill : ""}`}
                        onClick={() => setRatingFilter("like")}
                    >
                        <i className="bi bi-hand-thumbs-up-fill" style={{ marginRight: 6 }} />
                        Likes Only ({statsData?.likes ?? 0})
                    </button>
                    <button
                        type="button"
                        className={`${styles.filterPill} ${ratingFilter === "dislike" ? styles.activePill : ""}`}
                        onClick={() => setRatingFilter("dislike")}
                    >
                        <i className="bi bi-hand-thumbs-down-fill" style={{ marginRight: 6 }} />
                        Dislikes Only ({statsData?.dislikes ?? 0})
                    </button>
                </div>
            </div>

            {/* ── Data Table ── */}
            <DataTable
                tableId="admin-tool-feedback"
                columns={columns}
                data={feedbackItems}
                getRowId={(row) => String(row.id)}
                mode="server"
                totalRows={totalCount}
                query={query}
                onQueryChange={setQuery}
                loading={isLoading}
                error={error ? (error as Error).message : null}
                onRetry={() => {
                    refetchList();
                    refetchStats();
                }}
            />

            {/* ── View Detail Modal ── */}
            {viewingItem && (
                <div className={styles.modalOverlay} onClick={() => setViewingItem(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderTitle}>
                                <h3>User Feedback Details</h3>
                                <p>Tool: <strong>{viewingItem.tool_title || viewingItem.tool_slug}</strong> ({viewingItem.tool_slug})</p>
                            </div>
                            <button
                                type="button"
                                className={styles.modalCloseBtn}
                                onClick={() => setViewingItem(null)}
                            >
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.modalField}>
                                <label>Rating</label>
                                <div style={{ marginTop: "4px" }}>
                                    <span className={`${styles.ratingBadge} ${viewingItem.rating === "like" ? styles.badgeLike : styles.badgeDislike}`}>
                                        <i className={`bi ${viewingItem.rating === "like" ? "bi-hand-thumbs-up-fill" : "bi-hand-thumbs-down-fill"}`} style={{ marginRight: 4 }} />
                                        {viewingItem.rating === "like" ? "Helpful" : "Issue Reported"}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.modalField}>
                                <label>Feedback / Reason Given</label>
                                <div className={styles.modalCommentBox}>
                                    {viewingItem.reason || "No comment was provided by the user."}
                                </div>
                            </div>

                            <div className={styles.modalMetaGrid}>
                                <div>
                                    <label>Submitted At</label>
                                    <p>{new Date(viewingItem.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label>IP Address</label>
                                    <p>{viewingItem.ip_address || "Unknown"}</p>
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label>Browser / User Agent</label>
                                    <p style={{ wordBreak: "break-all", fontSize: "0.78rem" }}>
                                        {viewingItem.user_agent || "Not captured"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className="dtBtn danger"
                                onClick={() => handleDelete(viewingItem.id)}
                            >
                                <i className="bi bi-trash" /> Delete Record
                            </button>
                            <button
                                type="button"
                                className="dtBtn secondary"
                                onClick={() => setViewingItem(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
