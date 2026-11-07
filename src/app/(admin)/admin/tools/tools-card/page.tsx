"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/table/DataTable";
import PageHeader from "@/components/page-header/PageHeader";
import { selectionColumn } from "@/components/table/selectionColumn";
import type { DataTableQueryState } from "@/components/table/table.types";
import { toast } from "@/components/toast/toast";
import { useToolsList, useBulkOperations } from "@/hooks/useTools";
import { useToolCategories } from "@/hooks/useToolCategories";
import { toolsApi } from "@/services/tools.service";
import type { Tool } from "@/types/tool.types";

export default function ToolsPage() {
    const router = useRouter();

    // ── Filter states ──
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "featured">("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // ── Fetch categories for filter dropdown ──
    const { data: categoriesData } = useToolCategories({ limit: 100 });
    const categoryOptions = categoriesData?.categories ?? [];

    // ── Table query state ──
    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ── Build API params ──
    const apiParams = useMemo(() => ({
        page: query.pageIndex + 1,
        limit: query.pageSize,
        search: query.globalFilter,
        status: statusFilter === "active" || statusFilter === "draft" ? statusFilter : undefined,
        is_featured: statusFilter === "featured" ? true : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        sort_by: (query.sorting[0]?.id as any) || "created_at",
        sort_order: (query.sorting[0]?.desc ? "desc" : "asc") as "asc" | "desc",
    }), [query, statusFilter, categoryFilter]);

    const { tools, isLoading, error, pagination, refetch } = useToolsList(apiParams);

    // ── Bulk operations hook ──
    const { bulkDelete, bulkUpdate, isProcessing } = useBulkOperations();

    // ── Selected tools for bulk actions ──
    const [selectedTools, setSelectedTools] = useState<Tool[]>([]);

    // ── Actions ──
    const handleEdit = useCallback(
        (id: number) => router.push(`/admin/tools/tools-card/${id}`),
        [router]
    );

    const handleEditPage = useCallback(
        (slug: string) => router.push(`/admin/tools/tool-pages/${slug}`),
        [router]
    );

    const handleOpenLive = useCallback(
        (categorySlug: string, slug: string) => {
            window.open(`/tools/${categorySlug}/${slug}`, "_blank");
        },
        []
    );

    const handleToggleFeatured = useCallback(
        async (tool: Tool) => {
            try {
                await toolsApi.updateTool(tool.id, {
                    tool: {
                        ...tool,
                        is_featured: !tool.is_featured,
                    } as any,
                });
                toast.success(`Tool marked as ${!tool.is_featured ? "Featured" : "Standard"}`);
                refetch();
            } catch (err: any) {
                const msg = err?.response?.data?.message || err?.message || "Failed to update featured status";
                toast.error(msg);
            }
        },
        [refetch]
    );

    const handleDelete = useCallback(
        async (id: number, title: string) => {
            if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

            try {
                await toolsApi.deleteTool(id);
                toast.success("Tool deleted successfully");
                refetch();
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || err?.message || "Failed to delete tool";
                toast.error(errorMessage);
            }
        },
        [refetch]
    );

    const handleBulkDelete = useCallback(async () => {
        if (selectedTools.length === 0) return;

        if (
            !confirm(
                `Are you sure you want to delete ${selectedTools.length} tool${selectedTools.length === 1 ? "" : "s"}?`
            )
        ) {
            return;
        }

        const success = await bulkDelete({
            ids: selectedTools.map((t) => t.id),
            permanent: false,
        });

        if (success) {
            setSelectedTools([]);
            refetch();
        }
    }, [selectedTools, bulkDelete, refetch]);

    const handleBulkStatusChange = useCallback(
        async (newStatus: "active" | "draft") => {
            if (selectedTools.length === 0) return;

            const success = await bulkUpdate({
                ids: selectedTools.map((t) => t.id),
                updates: { status: newStatus },
            });

            if (success) {
                toast.success(`Updated ${selectedTools.length} tools to ${newStatus}`);
                setSelectedTools([]);
                refetch();
            }
        },
        [selectedTools, bulkUpdate, refetch]
    );

    // ── Columns ──
    const columns = useMemo<ColumnDef<Tool>[]>(
        () => [
            selectionColumn<Tool>(),

            {
                id: "title",
                accessorKey: "title",
                header: "Tool Name",
                cell: ({ row }) => (
                    <div className="dtCellText">
                        <div className="dtCellTitle">{row.original.title}</div>
                        {row.original.short_description && (
                            <div className="dtCellSub">
                                {row.original.short_description.slice(0, 75)}
                                {row.original.short_description.length > 75 ? "…" : ""}
                            </div>
                        )}
                    </div>
                ),
                enableSorting: true,
            },

            {
                id: "slug",
                accessorKey: "slug",
                header: "Slug",
                cell: ({ row }) => <code className="dtCode">/{row.original.slug}</code>,
                enableSorting: true,
            },

            {
                id: "category_slug",
                accessorKey: "category_slug",
                header: "Category",
                cell: ({ row }) => (
                    <span className="dtBadge neutral">{row.original.category_slug}</span>
                ),
                enableSorting: true,
            },

            {
                id: "badge",
                accessorKey: "badge",
                header: "Badge",
                cell: ({ row }) => {
                    const badge = row.original.badge;
                    if (!badge) return <span className="dtMuted">—</span>;

                    const variant =
                        badge === "new"
                            ? "new"
                            : badge === "popular"
                                ? "popular"
                                : "primary";
                    return (
                        <span className={`dtBadge ${variant}`}>
                            {badge.charAt(0).toUpperCase() + badge.slice(1)}
                        </span>
                    );
                },
                enableSorting: false,
            },

            {
                id: "access_level",
                accessorKey: "access_level",
                header: "Tier",
                cell: ({ row }) => {
                    const level = row.original.access_level;
                    return (
                        <span className="dtBadge neutral">
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                    );
                },
                enableSorting: true,
            },

            {
                id: "status",
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    const variant =
                        status === "active"
                            ? "success"
                            : status === "draft"
                                ? "warning"
                                : "danger";
                    return (
                        <span className={`dtBadge ${variant}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    );
                },
                enableSorting: true,
            },

            {
                id: "is_featured",
                accessorKey: "is_featured",
                header: "Featured",
                cell: ({ row }) => {
                    const isFeat = row.original.is_featured;
                    return (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFeatured(row.original);
                            }}
                            className="tableActionBtn"
                            title={isFeat ? "Click to unfeature" : "Click to feature on homepage"}
                            style={{
                                color: isFeat ? "#f59e0b" : "#cbd5e1",
                                borderColor: isFeat ? "#fde68a" : "#e2e8f0",
                                background: isFeat ? "#fffbeb" : "#ffffff",
                            }}
                        >
                            <i className={isFeat ? "bi bi-star-fill" : "bi bi-star"} />
                        </button>
                    );
                },
                enableSorting: true,
            },

            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="tableRowActions">
                        {/* Edit metadata */}
                        <button
                            type="button"
                            className="tableActionBtn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row.original.id);
                            }}
                            title="Edit tool configuration"
                        >
                            <i className="bi bi-pencil" />
                        </button>

                        {/* Edit Tool Landing Page & SEO */}
                        <button
                            type="button"
                            className="tableActionBtn primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditPage(row.original.slug);
                            }}
                            title="Edit landing page copy, FAQs & SEO"
                        >
                            <i className="bi bi-file-earmark-text" />
                        </button>

                        {/* Open live tool */}
                        <button
                            type="button"
                            className="tableActionBtn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLive(row.original.category_slug, row.original.slug);
                            }}
                            title="View live tool in new tab ↗"
                        >
                            <i className="bi bi-box-arrow-up-right" />
                        </button>

                        {/* Delete tool */}
                        <button
                            type="button"
                            className="tableActionBtn danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(row.original.id, row.original.title);
                            }}
                            title="Delete tool"
                        >
                            <i className="bi bi-trash" />
                        </button>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 140,
            },
        ],
        [handleEdit, handleEditPage, handleOpenLive, handleToggleFeatured, handleDelete]
    );

    return (
        <div className="adminPage">
            <PageHeader
                title="Tools Catalog"
                subtitle="Manage web tools, access tiers, badges, and homepage visibility"
                actions={[
                    {
                        label: "New Tool",
                        icon: "bi-plus-lg",
                        variant: "primary",
                        onClick: () => router.push("/admin/tools/tools-card/new"),
                    },
                ]}
                variant="flat"
            />

            {/* Quick Filter Bar */}
            <div className="tableFilterBar">
                <div className="tableFilterPills">
                    <button
                        type="button"
                        className={`tableFilterPill ${statusFilter === "all" ? "active" : ""}`}
                        onClick={() => setStatusFilter("all")}
                    >
                        <span>All Tools</span>
                        <span className="pillCount">{pagination?.total ?? tools.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`tableFilterPill ${statusFilter === "active" ? "active" : ""}`}
                        onClick={() => setStatusFilter("active")}
                    >
                        <span>Published</span>
                    </button>

                    <button
                        type="button"
                        className={`tableFilterPill ${statusFilter === "draft" ? "active" : ""}`}
                        onClick={() => setStatusFilter("draft")}
                    >
                        <span>Drafts</span>
                    </button>

                    <button
                        type="button"
                        className={`tableFilterPill ${statusFilter === "featured" ? "active" : ""}`}
                        onClick={() => setStatusFilter("featured")}
                    >
                        <i className="bi bi-star-fill" style={{ fontSize: "11px", color: statusFilter === "featured" ? "#fbbf24" : "inherit" }} />
                        <span>Featured</span>
                    </button>
                </div>

                {/* Category Dropdown Filter */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>Category:</span>
                    <select
                        className="tableCategorySelect"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Categories ({categoryOptions.length})</option>
                        {categoryOptions.map((cat) => (
                            <option key={cat.category_slug} value={cat.category_slug}>
                                {cat.page_title}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                tableId="admin-tools"
                columns={columns}
                data={tools ?? []}
                getRowId={(row) => String(row.id)}
                mode="server"
                totalRows={pagination?.total ?? 0}
                query={query}
                onQueryChange={setQuery}
                loading={isLoading}
                error={error?.message ?? null}
                onRetry={refetch}
                enableRowSelection
                onSelectionChange={setSelectedTools}
                rightActions={
                    selectedTools.length > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                                type="button"
                                className="dtBtn success sm"
                                onClick={() => handleBulkStatusChange("active")}
                                disabled={isProcessing}
                                title="Mark selected as active"
                            >
                                <i className="bi bi-check-circle" />
                                <span>Publish ({selectedTools.length})</span>
                            </button>

                            <button
                                type="button"
                                className="dtBtn secondary sm"
                                onClick={() => handleBulkStatusChange("draft")}
                                disabled={isProcessing}
                                title="Mark selected as draft"
                            >
                                <i className="bi bi-file-earmark-lock" />
                                <span>Draft ({selectedTools.length})</span>
                            </button>

                            <button
                                type="button"
                                className="dtBtn danger sm"
                                onClick={handleBulkDelete}
                                disabled={isProcessing}
                                title="Delete selected tools"
                            >
                                <i className="bi bi-trash" />
                                <span>Delete ({selectedTools.length})</span>
                            </button>
                        </div>
                    ) : null
                }
            />
        </div>
    );
}
