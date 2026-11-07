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
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

    // ── Table query state ──
    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ── Fetch ──
    const apiParams = useMemo(() => ({
        page: query.pageIndex + 1,
        limit: query.pageSize,
        search: query.globalFilter,
        sort_by: query.sorting[0]?.id || "created_at",
        sort_order: (query.sorting[0]?.desc ? "desc" : "asc") as "desc" | "asc",
    }), [query]);

    const { toolPages, isLoading, error, pagination, refetch } = useToolPagesList(apiParams);

    const filteredPages = useMemo(() => {
        const list = toolPages ?? [];
        if (statusFilter === "all") return list;
        return list.filter((p) => p.status === statusFilter);
    }, [toolPages, statusFilter]);

    // ── Selected pages for bulk actions ──
    const [selectedPages, setSelectedPages] = useState<ToolPageWithTool[]>([]);

    // ── Actions ──
    const handleEdit = useCallback(
        (slug: string) => router.push(`/admin/tools/tool-pages/${slug}`),
        [router]
    );

    const handleOpenLive = useCallback((toolPage: ToolPageWithTool) => {
        const cat = toolPage.tool?.category_slug || "tools";
        window.open(`/tools/${cat}/${toolPage.tool_slug}`, "_blank");
    }, []);

    const handleBulkDelete = useCallback(async () => {
        if (selectedPages.length === 0) return;

        if (
            !confirm(
                `Are you sure you want to delete ${selectedPages.length} tool page${selectedPages.length === 1 ? "" : "s"}?`
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
                            <div className="dtCellSub">
                                Tool: <strong>{row.original.tool.title}</strong>
                            </div>
                        )}
                    </div>
                ),
                enableSorting: true,
            },

            {
                id: "tool_slug",
                accessorKey: "tool_slug",
                header: "Tool Slug",
                cell: ({ row }) => <code className="dtCode">/{row.original.tool_slug}</code>,
                enableSorting: true,
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
                header: "Indexing",
                cell: ({ row }) =>
                    row.original.noindex ? (
                        <span className="dtBadge danger">Noindex</span>
                    ) : (
                        <span className="dtBadge success">Indexed</span>
                    ),
                enableSorting: false,
            },

            {
                id: "updated_at",
                accessorKey: "updated_at",
                header: "Last Updated",
                cell: ({ row }) => (
                    <span className="dtMuted">
                        {new Date(row.original.updated_at).toLocaleDateString("en-US", {
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
                    <div className="tableRowActions">
                        <button
                            type="button"
                            className="tableActionBtn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row.original.tool_slug);
                            }}
                            title="Edit page content & SEO"
                        >
                            <i className="bi bi-pencil" />
                        </button>

                        <button
                            type="button"
                            className="tableActionBtn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLive(row.original);
                            }}
                            title="View live landing page in new tab ↗"
                        >
                            <i className="bi bi-box-arrow-up-right" />
                        </button>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 100,
            },
        ],
        [handleEdit, handleOpenLive]
    );

    return (
        <div className="adminPage">
            <PageHeader
                title="Tool Landing Pages"
                subtitle="Manage tool landing page content, SEO metadata, FAQs, and feature bullets"
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

            {/* Quick Filter Bar */}
            <div className="tableFilterBar">
                <div className="tableFilterPills">
                    <button
                        type="button"
                        className={`tableFilterPill ${statusFilter === "all" ? "active" : ""}`}
                        onClick={() => setStatusFilter("all")}
                    >
                        <span>All Pages</span>
                        <span className="pillCount">{pagination?.total ?? toolPages?.length ?? 0}</span>
                    </button>

                    <button
                        type="button"
                        className={`tableFilterPill ${statusFilter === "published" ? "active" : ""}`}
                        onClick={() => setStatusFilter("published")}
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
                </div>
            </div>

            <DataTable
                tableId="admin-tool-pages"
                columns={columns}
                data={filteredPages}
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
                        <button
                            type="button"
                            className="dtBtn danger sm"
                            onClick={handleBulkDelete}
                            title="Delete selected pages"
                        >
                            <i className="bi bi-trash" />
                            <span>Delete ({selectedPages.length})</span>
                        </button>
                    ) : null
                }
            />
        </div>
    );
}
