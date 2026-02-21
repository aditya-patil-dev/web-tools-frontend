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
import { toolsApi } from "@/services/tools.service";
import type { Tool } from "@/types/tool.types";

export default function ToolsPage() {
    const router = useRouter();

    // ── Table query state ──
    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ✅ FIXED: Use useToolsList hook (not useTools)
    const { tools, isLoading, error, pagination, refetch } = useToolsList({
        page: query.pageIndex + 1,
        limit: query.pageSize,
        search: query.globalFilter,
        sort_by: query.sorting[0]?.id || "created_at",
        sort_order: query.sorting[0]?.desc ? "desc" : "asc",
    });

    // ── Bulk operations hook ──
    const { bulkDelete, isProcessing } = useBulkOperations();

    // ── Selected tools for bulk actions ──
    const [selectedTools, setSelectedTools] = useState<Tool[]>([]);

    // ── Actions ──
    const handleEdit = useCallback(
        (id: number) => router.push(`/admin/tools/tools-card/${id}`),
        [router]
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
                `Are you sure you want to delete ${selectedTools.length} tool${selectedTools.length === 1 ? "" : "s"
                }?`
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

    // ── Columns ──
    const columns = useMemo<ColumnDef<Tool>[]>(
        () => [
            selectionColumn<Tool>(),

            {
                id: "title",
                accessorKey: "title",
                header: "Tool",
                cell: ({ row }) => (
                    <div className="dtCellText">
                        <div className="dtCellTitle">{row.original.title}</div>
                        {row.original.short_description && (
                            <div className="dtCellSub">
                                {row.original.short_description.slice(0, 80)}
                                {row.original.short_description.length > 80 ? "…" : ""}
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
                cell: ({ row }) => <code className="dtCode">{row.original.slug}</code>,
                enableSorting: true,
            },

            {
                id: "category_slug",
                accessorKey: "category_slug",
                header: "Category",
                cell: ({ row }) => <span className="dtMuted">{row.original.category_slug}</span>,
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
                            ? "success"
                            : badge === "popular"
                                ? "warning"
                                : "neutral";
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
                header: "Access",
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
                                : "neutral";
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
                cell: ({ row }) =>
                    row.original.is_featured ? (
                        <i className="bi bi-star-fill" style={{ color: "#f59e0b" }} />
                    ) : (
                        <span className="dtMuted">—</span>
                    ),
                enableSorting: true,
            },

            {
                id: "created_at",
                accessorKey: "created_at",
                header: "Created",
                cell: ({ row }) => (
                    <span className="dtMuted">
                        {new Date(row.original.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                ),
                enableSorting: true,
            },

            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            className="dt-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row.original.id);
                            }}
                            title="Edit tool"
                        >
                            <i className="bi bi-pencil" />
                        </button>
                        <button
                            className="dt-btn danger"
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
                size: 120,
            },
        ],
        [handleEdit, handleDelete]
    );

    return (
        <div className="adminPage">
            <PageHeader
                title="Tools"
                subtitle="Manage your tools directory"
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Tools", href: "/admin/tools" },
                    { label: "Tools Card" },
                ]}
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
                        <button
                            className="dtBtn danger"
                            onClick={handleBulkDelete}
                            disabled={isProcessing}
                        >
                            <i className="bi bi-trash" />
                            Delete ({selectedTools.length})
                        </button>
                    ) : null
                }
            />
        </div>
    );
}