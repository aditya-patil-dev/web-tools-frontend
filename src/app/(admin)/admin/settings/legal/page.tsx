"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";

import DataTable from "@/components/table/DataTable";
import PageHeader from "@/components/page-header/PageHeader";
import { selectionColumn } from "@/components/table/selectionColumn";
import type { DataTableQueryState } from "@/components/table/table.types";

import {
    legalPagesAdmin,
    type AdminLegalPageListItem,
} from "@/lib/api-calls/legalPagesApi";

export default function LegalPagesAdminListPage() {
    const router = useRouter();

    // ─────────────────────────────────────────────
    // Table query state
    // ─────────────────────────────────────────────
    const [query, setQuery] = useState<DataTableQueryState>({
        pageIndex: 0,
        pageSize: 20,
        sorting: [],
        globalFilter: "",
    });

    // ─────────────────────────────────────────────
    // Data state
    // ─────────────────────────────────────────────
    const [data, setData] = useState<AdminLegalPageListItem[]>([]);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ─────────────────────────────────────────────
    // Fetch data
    // ─────────────────────────────────────────────
    const fetchPages = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await legalPagesAdmin.fetchAll({
                page: query.pageIndex + 1,
                limit: query.pageSize,
                search: query.globalFilter,
            });

            // your API returns array directly
            const pages = Array.isArray(res) ? res : (res as any)?.pages ?? [];

            setData(pages);
            setTotal(pages.length);

        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load legal pages";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [query]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    // ─────────────────────────────────────────────
    // Actions
    // ─────────────────────────────────────────────
    const handleEdit = useCallback(
        (id: number) => router.push(`/admin/legal/${id}`),
        [router]
    );

    const handleCreate = useCallback(
        () => router.push("/admin/legal/new"),
        [router]
    );

    // ─────────────────────────────────────────────
    // Columns
    // ─────────────────────────────────────────────
    const columns = useMemo<ColumnDef<AdminLegalPageListItem>[]>(
        () => [
            selectionColumn<AdminLegalPageListItem>(),

            {
                id: "page_key",
                accessorKey: "page_key",
                header: "Page Key",
                cell: ({ row }) => (
                    <code className="dtCode">{row.original.page_key}</code>
                ),
            },

            {
                id: "slug",
                accessorKey: "slug",
                header: "Slug",
                cell: ({ row }) => (
                    <code className="dtCode">/{row.original.slug}</code>
                ),
            },

            {
                id: "title",
                accessorKey: "title",
                header: "Title",
                cell: ({ row }) => (
                    <div className="dtCellText">
                        <div className="dtCellTitle">
                            {row.original.title}
                        </div>
                    </div>
                ),
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
                            {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                        </span>
                    );
                },
            },

            {
                id: "updated_at",
                accessorKey: "updated_at",
                header: "Updated",
                cell: ({ row }) => (
                    <span className="dtMuted">
                        {new Date(
                            row.original.updated_at
                        ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                ),
            },

            {
                id: "actions",
                header: "Actions",
                size: 100,
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            className="dt-btn"
                            title="Edit page"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row.original.id);
                            }}
                        >
                            <i className="bi bi-pencil" />
                        </button>
                    </div>
                ),
            },
        ],
        [handleEdit]
    );

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────
    return (
        <div className="adminPage">

            <PageHeader
                title="Legal Pages"
                subtitle="Manage legal, privacy policy, terms and other legal pages"
                actions={[
                    {
                        label: "New Legal Page",
                        icon: "bi-plus-lg",
                        variant: "primary",
                        onClick: handleCreate,
                    },
                ]}
                variant="flat"
            />

            <DataTable
                tableId="admin-legal-pages"
                columns={columns}
                data={data}
                getRowId={(row) => String(row.id)}
                mode="server"
                totalRows={total}
                query={query}
                onQueryChange={setQuery}
                loading={loading}
                error={error}
                onRetry={fetchPages}
                enableRowSelection
            />

        </div>
    );
}