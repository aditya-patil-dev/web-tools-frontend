"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/table/DataTable";
import PageHeader from "@/components/page-header/PageHeader";
import { selectionColumn } from "@/components/table/selectionColumn";
import type { DataTableQueryState } from "@/components/table/table.types";
import { useToolPagesList } from "@/hooks/useToolPages";
import { toolPagesApi } from "@/services/tool-pages.service";
import { toast } from "@/components/toast/toast";
import type { ToolPageWithTool } from "@/types/tool-page.types";

export default function ToolPagesPage() {
    const router = useRouter();

    // ── Table query state ──
    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ── Fetch ──
    const { toolPages, isLoading, error, pagination, refetch, setParams } = useToolPagesList({
        page: query.pageIndex + 1,
        limit: query.pageSize,
        search: query.globalFilter,
        sort_by: query.sorting[0]?.id || "created_at",
        sort_order: query.sorting[0]?.desc ? "desc" : "asc",
    });

    // ── Selected pages for bulk actions ──
    const [selectedPages, setSelectedPages] = useState<ToolPageWithTool[]>([]);

    // ── Actions ──
    const handleEdit = useCallback(
        (slug: string) => router.push(`/admin/tools/tool-pages/${slug}`),
        [router]
    );

    const handleBulkDelete = useCallback(async () => {
        if (selectedPages.length === 0) return;

        if (
            !confirm(
                `Are you sure you want to delete ${selectedPages.length} tool page${selectedPages.length === 1 ? "" : "s"
                }?`
            )
        ) {
            return;
        }

        try {
            await Promise.all(selectedPages.map((page) => toolPagesApi.delete(page.tool_slug)));
            toast.success(`${selectedPages.length} tool pages deleted successfully`);
            setSelectedPages([]);
            refetch();
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || err?.message || "Failed to delete tool pages";
            toast.error(errorMessage);
        }
    }, [selectedPages, refetch]);

    // ── Columns ──
    const columns = useMemo<ColumnDef<ToolPageWithTool>[]>(
        () => [
            selectionColumn<ToolPageWithTool>(),

            {
                id: "page_title",
                accessorKey: "page_title",
                header: "Page Title",
                cell: ({ row }) => (
                    <div className="dtCellText">
                        <div className="dtCellTitle">{row.original.page_title}</div>
                        {row.original.tool?.title && (
                            <div className="dtCellSub">Tool: {row.original.tool.title}</div>
                        )}
                    </div>
                ),
                enableSorting: true,
            },

            {
                id: "tool_slug",
                accessorKey: "tool_slug",
                header: "Tool Slug",
                cell: ({ row }) => <code className="dtCode">{row.original.tool_slug}</code>,
                enableSorting: true,
            },

            {
                id: "page_description",
                accessorKey: "page_description",
                header: "Description",
                cell: ({ row }) => {
                    const desc = row.original.page_description;
                    if (!desc) return <span className="dtMuted">—</span>;
                    return (
                        <span className="dtMuted">
                            {desc.slice(0, 60)}
                            {desc.length > 60 ? "…" : ""}
                        </span>
                    );
                },
                enableSorting: false,
            },

            {
                id: "status",
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    const variant =
                        status === "published"
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
                id: "noindex",
                accessorKey: "noindex",
                header: "SEO",
                cell: ({ row }) =>
                    row.original.noindex ? (
                        <span className="dtBadge danger">Noindex</span>
                    ) : (
                        <span className="dtBadge success">Indexed</span>
                    ),
                enableSorting: false,
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
                                handleEdit(row.original.tool_slug);
                            }}
                            title="Edit page"
                        >
                            <i className="bi bi-pencil" />
                        </button>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 120,
            },
        ],
        [handleEdit]
    );

    return (
        <div className="adminPage">
            <PageHeader
                title="Tool Pages"
                subtitle="Manage SEO content and details for each tool"
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Tools", href: "/admin/tools" },
                    { label: "Tool Pages" },
                ]}
                actions={[
                    {
                        label: "New Tool Page",
                        icon: "bi-plus-lg",
                        variant: "primary",
                        onClick: () => router.push("/admin/tools/tool-pages/new"),
                    },
                ]}
                variant="flat"
            />

            <DataTable
                tableId="admin-tool-pages"
                columns={columns}
                data={toolPages ?? []}
                getRowId={(row) => row.tool_slug}
                mode="server"
                totalRows={pagination?.total ?? 0}
                query={query}
                onQueryChange={setQuery}
                loading={isLoading}
                error={error?.message ?? null}
                onRetry={refetch}
                enableRowSelection
                onSelectionChange={setSelectedPages}
                rightActions={
                    selectedPages.length > 0 ? (
                        <button className="dtBtn danger" onClick={handleBulkDelete}>
                            <i className="bi bi-trash" />
                            Delete ({selectedPages.length})
                        </button>
                    ) : null
                }
            />
        </div>
    );
}