"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/table/DataTable";
import PageHeader from "@/components/page-header/PageHeader";
import { selectionColumn } from "@/components/table/selectionColumn";
import type { DataTableQueryState } from "@/components/table/table.types";
import { useToolCategories } from "@/hooks/useToolCategories";
import type { ToolCategory } from "@/types/tool-category.types";

export default function ToolCategoriesPage() {
    const router = useRouter();

    // ── Table query state ──
    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ── Fetch ──
    const { data, isLoading, error, refetch } = useToolCategories({
        page: query.pageIndex + 1,
        limit: query.pageSize,
        search: query.globalFilter,
        sort_by: query.sorting[0]?.id || "created_at",
        sort_order: query.sorting[0]?.desc ? "desc" : "asc",
    });


    // ── Actions ──
    const handleEdit = useCallback(
        (slug: string) => router.push(`/admin/tools/categories/${slug}`),
        [router]
    );

    // ── Columns ──
    const columns = useMemo<ColumnDef<ToolCategory>[]>(
        () => [
            selectionColumn<ToolCategory>(),

            {
                id: "category_slug",
                accessorKey: "category_slug",
                header: "Slug",
                cell: ({ row }) => (
                    <code className="dtCode">{row.original.category_slug}</code>
                ),
                enableSorting: true,
            },

            {
                id: "page_title",
                accessorKey: "page_title",
                header: "Title",
                cell: ({ row }) => (
                    <div className="dtCellText">
                        <div className="dtCellTitle">{row.original.page_title}</div>
                        {row.original.page_description && (
                            <div className="dtCellSub">
                                {row.original.page_description.slice(0, 80)}
                                {row.original.page_description.length > 80 ? "…" : ""}
                            </div>
                        )}
                    </div>
                ),
                enableSorting: true,
            },

            {
                id: "tool_count",
                accessorKey: "tool_count",
                header: "Tools",
                cell: ({ row }) => (
                    <span className="dtBadge neutral">
                        {row.original.tool_count ?? 0} tools
                    </span>
                ),
                enableSorting: false,
            },

            {
                id: "status",
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    const variant =
                        status === "published" ? "success"
                            : status === "draft" ? "warning"
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
                            onClick={(e) => { e.stopPropagation(); handleEdit(row.original.category_slug); }}
                            title="Edit category"
                        >
                            <i className="bi bi-pencil" />
                        </button>
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
                size: 100,
            },
        ],
        [handleEdit]
    );

    return (
        <div className="adminPage">
            <PageHeader
                title="Tool Categories"
                subtitle="Manage tool category pages and SEO content"
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Tools", href: "/admin/tools" },
                    { label: "Categories" },
                ]}
                actions={[
                    {
                        label: "New Category",
                        icon: "bi-plus-lg",
                        variant: "primary",
                        onClick: () => router.push("/admin/tools/categories/new"),
                    },
                ]}
                variant="flat"
            />

            <DataTable
                tableId="admin-tool-categories"
                columns={columns}
                data={data?.categories ?? []}
                getRowId={(row) => row.category_slug}
                mode="server"
                totalRows={data?.meta?.total ?? 0}
                query={query}
                onQueryChange={setQuery}
                loading={isLoading}
                error={error?.message ?? null}
                onRetry={refetch}
                enableRowSelection
            />
        </div>
    );
}