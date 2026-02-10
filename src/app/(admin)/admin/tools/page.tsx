"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "@/components/table/DataTable";
import { selectionColumn } from "@/components/table/selectionColumn";
import PageHeader from "@/components/page-header/PageHeader";
import { toast } from "@/components/toast/toast";
import { confirmDelete } from "@/components/dialog/confirm";
import { loading } from "@/components/loading/loading";

import { useToolsList, useToolMutations, useBulkOperations } from "@/hooks/useTools";
import type { Tool, ToolStatus, AccessLevel, ToolBadge, ToolFilters } from "@/types/tool.types";

// ==================== Components ====================

function Pill({
    label,
    tone = "neutral",
}: {
    label: string;
    tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
    const bg =
        tone === "success"
            ? "var(--color-success)"
            : tone === "warning"
                ? "var(--color-warning)"
                : tone === "danger"
                    ? "var(--color-error)"
                    : tone === "info"
                        ? "var(--color-info)"
                        : "var(--color-slate-600)";

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: 12,
                fontWeight: 600,
                color: "white",
                background: bg,
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </span>
    );
}

function FilterBar({
    filters,
    onFilterChange,
    onReset,
}: {
    filters: ToolFilters;
    onFilterChange: (key: keyof ToolFilters, value: any) => void;
    onReset: () => void;
}) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "var(--space-3)",
                padding: "var(--space-4)",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-lg)",
                marginBottom: "var(--space-4)",
                border: "1px solid var(--border-primary)",
            }}
        >
            <input
                type="text"
                placeholder="Search tools..."
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-primary)",
                    fontSize: 14,
                    outline: "none",
                }}
            />

            <select
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-primary)",
                    fontSize: 14,
                    outline: "none",
                }}
            >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="disabled">Disabled</option>
                <option value="deprecated">Deprecated</option>
            </select>

            <select
                value={filters.access_level}
                onChange={(e) => onFilterChange("access_level", e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-primary)",
                    fontSize: 14,
                    outline: "none",
                }}
            >
                <option value="">All Access Levels</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
            </select>

            <select
                value={filters.badge ?? ""}
                onChange={(e) => onFilterChange("badge", e.target.value)}
                style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-primary)",
                    fontSize: 14,
                    outline: "none",
                }}
            >
                <option value="">All Badges</option>
                <option value="new">New</option>
                <option value="popular">Popular</option>
                <option value="pro">Pro</option>
            </select>

            <select
                value={filters.is_featured.toString()}
                onChange={(e) =>
                    onFilterChange(
                        "is_featured",
                        e.target.value === "" ? "" : e.target.value === "true"
                    )
                }
                style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-primary)",
                    fontSize: 14,
                    outline: "none",
                }}
            >
                <option value="">All Tools</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
            </select>

            <button
                onClick={onReset}
                className="dtBtn"
                style={{
                    padding: "8px 16px",
                    fontSize: 14,
                }}
            >
                <i className="bi bi-arrow-counterclockwise" /> Reset
            </button>
        </div>
    );
}

function BulkActionsBar({
    selectedCount,
    onBulkUpdate,
    onBulkDelete,
    onClearSelection,
}: {
    selectedCount: number;
    onBulkUpdate: (updates: Partial<Tool>) => void;
    onBulkDelete: (permanent: boolean) => void;
    onClearSelection: () => void;
}) {
    const [showActions, setShowActions] = useState(false);

    if (selectedCount === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--bg-elevated)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--border-primary)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
            }}
        >
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                }}
            >
                <i className="bi bi-check2-square" style={{ marginRight: 8 }} />
                {selectedCount} tool{selectedCount > 1 ? "s" : ""} selected
            </div>

            <div style={{ width: 1, height: 24, background: "var(--border-primary)" }} />

            <button
                className="dtBtn"
                onClick={() => setShowActions(!showActions)}
                style={{ fontSize: 14 }}
            >
                <i className="bi bi-pencil" /> Bulk Update
            </button>

            <button
                className="dtBtn danger"
                onClick={() => onBulkDelete(false)}
                style={{ fontSize: 14 }}
            >
                <i className="bi bi-trash" /> Delete
            </button>

            <button
                className="dtBtn"
                onClick={onClearSelection}
                style={{ fontSize: 14 }}
            >
                <i className="bi bi-x-lg" /> Clear
            </button>

            {showActions && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: 0,
                        background: "var(--bg-elevated)",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "var(--shadow-xl)",
                        border: "1px solid var(--border-primary)",
                        minWidth: 200,
                    }}
                >
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        Quick Updates
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <button
                            className="dtBtn"
                            onClick={() => {
                                onBulkUpdate({ status: "active" });
                                setShowActions(false);
                            }}
                            style={{ fontSize: 13, justifyContent: "flex-start" }}
                        >
                            Set Active
                        </button>
                        <button
                            className="dtBtn"
                            onClick={() => {
                                onBulkUpdate({ status: "draft" });
                                setShowActions(false);
                            }}
                            style={{ fontSize: 13, justifyContent: "flex-start" }}
                        >
                            Set Draft
                        </button>
                        <button
                            className="dtBtn"
                            onClick={() => {
                                onBulkUpdate({ is_featured: true });
                                setShowActions(false);
                            }}
                            style={{ fontSize: 13, justifyContent: "flex-start" }}
                        >
                            Mark Featured
                        </button>
                        <button
                            className="dtBtn"
                            onClick={() => {
                                onBulkUpdate({ is_featured: false });
                                setShowActions(false);
                            }}
                            style={{ fontSize: 13, justifyContent: "flex-start" }}
                        >
                            Unmark Featured
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== Main Component ====================

export default function ToolsPage() {
    const [filters, setFilters] = useState<ToolFilters>({
        search: "",
        category: "",
        status: "",
        badge: "",
        access_level: "",
        is_featured: "",
        sort_by: "created_at",
        sort_order: "desc",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Build API params from filters
    const apiParams = useMemo(() => {
        const params: any = {
            page: currentPage,
            limit: 20,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
        };

        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;
        if (filters.badge) params.badge = filters.badge;
        if (filters.access_level) params.access_level = filters.access_level;
        if (filters.is_featured !== "") params.is_featured = filters.is_featured;

        return params;
    }, [filters, currentPage]);

    const { tools, isLoading, pagination, refetch } = useToolsList(apiParams);
    const { deleteTool } = useToolMutations();
    const { bulkUpdate, bulkDelete } = useBulkOperations();

    const handleFilterChange = useCallback((key: keyof ToolFilters, value: any) => {
        setCurrentPage(1);
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setCurrentPage(1);
        setFilters({
            search: "",
            category: "",
            status: "",
            badge: "",
            access_level: "",
            is_featured: "",
            sort_by: "created_at",
            sort_order: "desc",
        });
    }, []);

    const handleDelete = useCallback(
        async (id: number, title: string) => {
            const ok = await confirmDelete(`tool "${title}"`);
            if (!ok) return;

            const success = await deleteTool(id);
            if (success) {
                await refetch();
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        },
        [deleteTool, refetch]
    );

    const handleBulkUpdate = useCallback(
        async (updates: Partial<Tool>) => {
            if (selectedIds.size === 0) return;

            const success = await bulkUpdate({
                ids: Array.from(selectedIds),
                updates,
            });

            if (success) {
                await refetch();
                setSelectedIds(new Set());
            }
        },
        [selectedIds, bulkUpdate, refetch]
    );

    const handleBulkDelete = useCallback(
        async (permanent: boolean) => {
            if (selectedIds.size === 0) return;

            const ok = await confirmDelete(
                permanent
                    ? `${selectedIds.size} tool${selectedIds.size > 1 ? "s" : ""}\n\nThis action cannot be undone!`
                    : `${selectedIds.size} tool${selectedIds.size > 1 ? "s" : ""}`
            );

            if (!ok) return;

            const success = await bulkDelete({
                ids: Array.from(selectedIds),
                permanent,
            });

            if (success) {
                await refetch();
                setSelectedIds(new Set());
            }
        },
        [selectedIds, bulkDelete, refetch]
    );

    const columns = useMemo<ColumnDef<Tool>[]>(() => {
        return [
            selectionColumn<Tool>(),

            {
                header: "Tool",
                accessorKey: "title",
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <strong style={{ fontSize: 14 }}>{r.title}</strong>
                                {r.is_featured ? <Pill label="Featured" tone="info" /> : null}
                                {r.badge ? (
                                    <Pill
                                        label={r.badge.toUpperCase()}
                                        tone={
                                            r.badge === "new"
                                                ? "success"
                                                : r.badge === "popular"
                                                    ? "warning"
                                                    : "info"
                                        }
                                    />
                                ) : null}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                <span style={{ marginRight: 10 }}>
                                    <i className="bi bi-link-45deg" /> {r.slug}
                                </span>
                                <span>
                                    <i className="bi bi-folder2" /> {r.category_slug}
                                </span>
                            </div>
                        </div>
                    );
                },
            },

            {
                header: "Type",
                accessorKey: "tool_type",
                cell: ({ row }) => (
                    <span style={{ fontSize: 13 }}>{row.original.tool_type}</span>
                ),
            },

            {
                header: "Access",
                accessorKey: "access_level",
                cell: ({ row }) => {
                    const v = row.original.access_level;
                    return (
                        <Pill
                            label={v}
                            tone={
                                v === "free"
                                    ? "neutral"
                                    : v === "premium"
                                        ? "info"
                                        : v === "pro"
                                            ? "warning"
                                            : "danger"
                            }
                        />
                    );
                },
            },

            {
                header: "Status",
                accessorKey: "status",
                cell: ({ row }) => {
                    const s = row.original.status;
                    return (
                        <Pill
                            label={s}
                            tone={
                                s === "active"
                                    ? "success"
                                    : s === "draft"
                                        ? "warning"
                                        : s === "disabled"
                                            ? "danger"
                                            : "neutral"
                            }
                        />
                    );
                },
            },

            {
                header: "Rating",
                accessorKey: "rating",
                cell: ({ row }) => (
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                        ⭐ {row.original.rating.toFixed(1)}
                    </span>
                ),
            },

            {
                header: "Usage",
                id: "usage",
                cell: ({ row }) => {
                    const r = row.original;
                    return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: 12 }}>
                                <i className="bi bi-eye" /> {r.views.toLocaleString()} views
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                                <i className="bi bi-people" /> {r.users_count.toLocaleString()}{" "}
                                users
                            </span>
                        </div>
                    );
                },
            },

            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                            className="dtBtn"
                            onClick={() =>
                                window.open(`/admin/tools/${row.original.id}`, "_self")
                            }
                        >
                            <i className="bi bi-pencil" /> Edit
                        </button>

                        <button
                            className="dtBtn"
                            onClick={() => window.open(row.original.tool_url, "_blank")}
                        >
                            <i className="bi bi-box-arrow-up-right" /> Open
                        </button>

                        <button
                            className="dtBtn danger"
                            onClick={() => handleDelete(row.original.id, row.original.title)}
                        >
                            <i className="bi bi-trash" /> Delete
                        </button>
                    </div>
                ),
            },
        ];
    }, [handleDelete]);

    return (
        <div className="container-fluid">
            <PageHeader
                title="Tools"
                subtitle="Manage all website tools (listing + SEO pages)"
                actions={[
                    {
                        label: "Add Tool",
                        icon: "bi-plus-circle",
                        href: "/admin/tools/new",
                        variant: "primary",
                    },
                    {
                        label: "Categories",
                        icon: "bi-folder2-open",
                        href: "/admin/tools/categories",
                        variant: "primary",
                    },
                ]}
            />

            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            <DataTable<Tool>
                tableId="tools-table"
                title="Tools"
                subtitle={
                    pagination
                        ? `Showing ${(tools ?? []).length} of ${pagination.total} tools`
                        : "Create, update, feature, and manage tool status"
                }
                data={tools ?? []}
                columns={columns ?? []}
                getRowId={(r) => r.id.toString()}
                enableRowSelection
                loading={isLoading}
                onSelectionChange={(selection) => {
                    setSelectedIds(new Set((selection ?? []).map((tool) => tool.id)));
                }}
            />

            {pagination && pagination.total_pages > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginTop: "var(--space-6)",
                        padding: "var(--space-4)",
                    }}
                >
                    <button
                        className="dtBtn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                        <i className="bi bi-chevron-left" /> Previous
                    </button>

                    <span style={{ fontSize: 14 }}>
                        Page {currentPage} of {pagination.total_pages}
                    </span>

                    <button
                        className="dtBtn"
                        disabled={currentPage === pagination.total_pages}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))
                        }
                    >
                        Next <i className="bi bi-chevron-right" />
                    </button>
                </div>
            )}

            <BulkActionsBar
                selectedCount={selectedIds.size}
                onBulkUpdate={handleBulkUpdate}
                onBulkDelete={handleBulkDelete}
                onClearSelection={() => setSelectedIds(new Set())}
            />
        </div>
    );
}