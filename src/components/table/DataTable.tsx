"use client";

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type SortingState,
    type VisibilityState,
    type RowSelectionState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import DataTableToolbar from "./DataTableToolbar";
import DataTablePagination from "./DataTablePagination";
import DataTableSkeleton from "./DataTableSkeleton";
import type { DataTableProps, DataTableQueryState } from "./table.types";
import { loadPrefs, savePrefs } from "./table.storage";

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export default function DataTable<T>({
    tableId,
    columns,
    data,
    getRowId,

    mode = "client",

    totalRows,
    query,
    onQueryChange,

    title,
    subtitle,
    loading,
    error,
    onRetry,

    enableRowSelection = true,

    rightActions,
    onSelectionChange,

    initialPageSize = 10,
}: DataTableProps<T>) {
    // ---- persisted prefs (column visibility + page size) ----
    const prefs = useMemo(() => loadPrefs(tableId), [tableId]);

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        prefs?.columnVisibility ?? {}
    );

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // table query state (internal default, but can be controlled by server props)
    const [pageIndex, setPageIndex] = useState<number>(query?.pageIndex ?? 0);
    const [pageSize, setPageSize] = useState<number>(query?.pageSize ?? (prefs?.pageSize ?? initialPageSize));
    const [sorting, setSorting] = useState<SortingState>(query?.sorting ?? []);
    const [globalFilter, setGlobalFilter] = useState<string>(query?.globalFilter ?? "");

    // If server passes query updates, sync in (controlled-ish)
    useEffect(() => {
        if (typeof query?.pageIndex === "number") setPageIndex(query.pageIndex);
        if (typeof query?.pageSize === "number") setPageSize(query.pageSize);
        if (Array.isArray(query?.sorting)) setSorting(query.sorting);
        if (typeof query?.globalFilter === "string") setGlobalFilter(query.globalFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query?.pageIndex, query?.pageSize, query?.sorting, query?.globalFilter]);

    // persist prefs
    useEffect(() => {
        savePrefs(tableId, { columnVisibility, pageSize });
    }, [tableId, columnVisibility, pageSize]);

    const manual = mode === "server";
    const effectiveTotal = manual ? (totalRows ?? data.length) : data.length;

    const table = useReactTable({
        data,
        columns,
        state: { sorting, globalFilter, columnVisibility, rowSelection, pagination: { pageIndex, pageSize } },
        onSortingChange: setSorting,
        onGlobalFilterChange: (value: string | undefined) => setGlobalFilter(value ?? ""),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,

        getRowId: getRowId ? (row, i) => getRowId(row as T, i) : undefined,

        enableRowSelection,

        manualPagination: manual,
        manualSorting: manual,
        manualFiltering: manual,

        pageCount: manual ? Math.ceil(effectiveTotal / pageSize) : undefined,

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: manual ? undefined : getSortedRowModel(),
        getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
        getPaginationRowModel: manual ? undefined : getPaginationRowModel(),
    });

    // notify server when query state changes
    useEffect(() => {
        if (!onQueryChange) return;
        const next: DataTableQueryState = { pageIndex, pageSize, sorting, globalFilter };
        onQueryChange(next);
    }, [pageIndex, pageSize, sorting, globalFilter, onQueryChange]);

    // selection callback (returns actual data items)
    useEffect(() => {
        if (!onSelectionChange) return;
        const rows = table.getSelectedRowModel().rows.map((r) => r.original as T);
        onSelectionChange(rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection]);

    // columns available to hide/show (exclude selection + actions if you want)
    const columnsForToggle = useMemo(() => {
        return table
            .getAllLeafColumns()
            .filter((c) => c.getCanHide())
            .map((c) => ({
                id: c.id,
                label: (typeof c.columnDef.header === "string" ? c.columnDef.header : c.id) as string,
                visible: c.getIsVisible(),
                toggle: () => c.toggleVisibility(),
            }));
    }, [table]);

    // derive rows to render
    const rowModel = manual ? table.getRowModel() : table.getRowModel();
    const rows = rowModel.rows;

    const showEmpty = !loading && !error && rows.length === 0;

    return (
        <div className="dtRoot">
            <div className="dtCard">
                {/* Toolbar INSIDE card */}
                <div className="dtCardHeader">
                    <DataTableToolbar
                        title={title}
                        subtitle={subtitle}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={(v) => {
                            setPageIndex(0);
                            setGlobalFilter(v);
                        }}
                        canToggleColumns={true}
                        columnsForToggle={columnsForToggle}
                        rightActions={rightActions}
                    />
                </div>

                {/* Content */}
                <div className="dtCardBody">
                    {error ? (
                        <div className="dtState">
                            <div className="dtStateTitle">Something went wrong</div>
                            <div className="dtStateSub">{error}</div>
                            {onRetry && (
                                <button className="dtBtn primary" onClick={onRetry}>
                                    <i className="bi bi-arrow-repeat" />
                                    Retry
                                </button>
                            )}
                        </div>
                    ) : loading ? (
                        <DataTableSkeleton rows={6} cols={Math.max(4, table.getVisibleLeafColumns().length)} />
                    ) : showEmpty ? (
                        <div className="dtState">
                            <div className="dtStateTitle">No results</div>
                            <div className="dtStateSub">Try adjusting search or filters.</div>
                        </div>
                    ) : (
                        <div className="dtTableWrap">
                            <table className="dtTable">
                                <thead>
                                    {table.getHeaderGroups().map((hg) => (
                                        <tr key={hg.id}>
                                            {hg.headers.map((h) => {
                                                const canSort = h.column.getCanSort();
                                                const sort = h.column.getIsSorted();
                                                return (
                                                    <th
                                                        key={h.id}
                                                        className={canSort ? "sortable" : ""}
                                                        onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                                                        aria-sort={
                                                            sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none"
                                                        }
                                                    >
                                                        <div className="dtTh">
                                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                                            {canSort && (
                                                                <span className="dtSort">
                                                                    {sort === "asc" ? (
                                                                        <i className="bi bi-arrow-up" />
                                                                    ) : sort === "desc" ? (
                                                                        <i className="bi bi-arrow-down" />
                                                                    ) : (
                                                                        <i className="bi bi-arrow-down-up" />
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>

                                <tbody>
                                    {rows.map((r) => (
                                        <tr key={r.id} className={r.getIsSelected() ? "selected" : ""}>
                                            {r.getVisibleCells().map((c) => (
                                                <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination INSIDE card */}
                <div className="dtCardFooter">
                    <DataTablePagination
                        pageIndex={clamp(pageIndex, 0, Math.max(0, Math.ceil(effectiveTotal / pageSize) - 1))}
                        pageSize={pageSize}
                        totalRows={effectiveTotal}
                        onPageIndexChange={(next) => setPageIndex(next)}
                        onPageSizeChange={(next) => {
                            setPageIndex(0);
                            setPageSize(next);
                        }}
                    />
                </div>
            </div>
        </div>
    );

}
