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
import { useEffect, useMemo, useRef, useState } from "react";
import { loadPrefs, savePrefs, type DataTableProps, type DataTableQueryState } from "./table.types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

function Skeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="dt-skeleton">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="dt-skeleton-row">
                    {Array.from({ length: cols }).map((_, c) => (
                        <div key={c} className="dt-skeleton-cell" style={{ animationDelay: `${(r * cols + c) * 60}ms` }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// Empty / Error States
// ─────────────────────────────────────────────

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
    return (
        <div className="dt-state">
            <div className="dt-state-icon">
                <i className={`bi ${hasFilter ? "bi-funnel" : "bi-inbox"}`} />
            </div>
            <div className="dt-state-title">{hasFilter ? "No matching results" : "No data yet"}</div>
            <div className="dt-state-sub">
                {hasFilter
                    ? "Try adjusting your search or clearing filters."
                    : "Data will appear here once available."}
            </div>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="dt-state">
            <div className="dt-state-icon error">
                <i className="bi bi-exclamation-triangle" />
            </div>
            <div className="dt-state-title">Something went wrong</div>
            <div className="dt-state-sub">{message}</div>
            {onRetry && (
                <button className="dt-btn dt-btn-primary" onClick={onRetry}>
                    <i className="bi bi-arrow-repeat" />
                    Retry
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

const PAGE_SIZES = [10, 20, 30, 50, 100];

function Pagination({
    pageIndex,
    pageSize,
    totalRows,
    onPageIndexChange,
    onPageSizeChange,
}: {
    pageIndex: number;
    pageSize: number;
    totalRows: number;
    onPageIndexChange: (n: number) => void;
    onPageSizeChange: (n: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    const canPrev = pageIndex > 0;
    const canNext = pageIndex < totalPages - 1;
    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min(totalRows, (pageIndex + 1) * pageSize);

    return (
        <div className="dt-pagination">
            <span className="dt-pagination-info">
                {totalRows === 0 ? "No records" : (
                    <>Showing <strong>{from}–{to}</strong> of <strong>{totalRows}</strong></>
                )}
            </span>

            <div className="dt-pagination-controls">
                <div className="dt-page-size">
                    <label className="dt-page-size-label">Rows</label>
                    <select
                        className="dt-select"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {PAGE_SIZES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="dt-page-nav">
                    <button className="dt-nav-btn" title="First page" onClick={() => onPageIndexChange(0)} disabled={!canPrev}>
                        <i className="bi bi-chevron-double-left" />
                    </button>
                    <button className="dt-nav-btn" title="Previous page" onClick={() => onPageIndexChange(pageIndex - 1)} disabled={!canPrev}>
                        <i className="bi bi-chevron-left" />
                    </button>

                    <span className="dt-page-pill">
                        <span className="dt-page-current">{pageIndex + 1}</span>
                        <span className="dt-page-sep">/</span>
                        <span className="dt-page-total">{totalPages}</span>
                    </span>

                    <button className="dt-nav-btn" title="Next page" onClick={() => onPageIndexChange(pageIndex + 1)} disabled={!canNext}>
                        <i className="bi bi-chevron-right" />
                    </button>
                    <button className="dt-nav-btn" title="Last page" onClick={() => onPageIndexChange(totalPages - 1)} disabled={!canNext}>
                        <i className="bi bi-chevron-double-right" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Column Toggle Dropdown
// ─────────────────────────────────────────────

type ColToggleItem = { id: string; label: string; visible: boolean; toggle: () => void };

function ColumnToggle({ columns }: { columns: ColToggleItem[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const visibleCount = columns.filter((c) => c.visible).length;

    return (
        <div className="dt-col-toggle" ref={ref}>
            <button
                className={`dt-btn ${open ? "dt-btn-active" : ""}`}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
            >
                <i className="bi bi-columns-gap" />
                Columns
                {visibleCount < columns.length && (
                    <span className="dt-badge">{visibleCount}/{columns.length}</span>
                )}
            </button>

            {open && (
                <div className="dt-col-menu" role="menu">
                    <div className="dt-col-menu-header">
                        <span>Show / Hide Columns</span>
                        <button
                            className="dt-col-reset"
                            onClick={() => columns.forEach((c) => !c.visible && c.toggle())}
                        >
                            Show all
                        </button>
                    </div>
                    <div className="dt-col-menu-body">
                        {columns.map((c) => (
                            <label key={c.id} className="dt-col-item" role="menuitem">
                                <span className={`dt-col-checkbox ${c.visible ? "checked" : ""}`}>
                                    {c.visible && <i className="bi bi-check" />}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={c.visible}
                                    onChange={c.toggle}
                                    style={{ display: "none" }}
                                />
                                <span className="dt-col-label">{c.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────

function Toolbar({
    title,
    subtitle,
    globalFilter,
    onGlobalFilterChange,
    columnsForToggle,
    rightActions,
    selectedCount,
    onClearSelection,
}: {
    title?: string;
    subtitle?: string;
    globalFilter: string;
    onGlobalFilterChange: (v: string) => void;
    columnsForToggle: ColToggleItem[];
    rightActions?: React.ReactNode;
    selectedCount: number;
    onClearSelection: () => void;
}) {
    return (
        <div className="dt-toolbar">
            <div className="dt-toolbar-left">
                {(title || subtitle) && (
                    <div className="dt-title-block">
                        {title && <h3 className="dt-title">{title}</h3>}
                        {subtitle && <p className="dt-subtitle">{subtitle}</p>}
                    </div>
                )}

                <div className="dt-search">
                    <i className="bi bi-search dt-search-icon" />
                    <input
                        className="dt-search-input"
                        value={globalFilter}
                        onChange={(e) => onGlobalFilterChange(e.target.value)}
                        placeholder="Search all columns..."
                        aria-label="Search table"
                    />
                    {globalFilter && (
                        <button className="dt-search-clear" onClick={() => onGlobalFilterChange("")} aria-label="Clear search">
                            <i className="bi bi-x" />
                        </button>
                    )}
                </div>
            </div>

            <div className="dt-toolbar-right">
                {selectedCount > 0 && (
                    <div className="dt-selection-badge">
                        <span>{selectedCount} selected</span>
                        <button onClick={onClearSelection} aria-label="Clear selection">
                            <i className="bi bi-x" />
                        </button>
                    </div>
                )}

                {rightActions}

                <ColumnToggle columns={columnsForToggle} />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// DataTable (main)
// ─────────────────────────────────────────────

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

    // ── persisted prefs ──
    const prefs = useMemo(() => loadPrefs(tableId), [tableId]);

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(prefs?.columnVisibility ?? {});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [pageIndex, setPageIndex] = useState(query?.pageIndex ?? 0);
    const [pageSize, setPageSize] = useState(query?.pageSize ?? prefs?.pageSize ?? initialPageSize);
    const [sorting, setSorting] = useState<SortingState>(query?.sorting ?? []);
    const [globalFilter, setGlobalFilter] = useState(query?.globalFilter ?? "");

    // sync controlled query (server mode)
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
        onGlobalFilterChange: (v) => setGlobalFilter(v ?? ""),
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

    // notify server of query changes
    useEffect(() => {
        if (!onQueryChange) return;
        const next: DataTableQueryState = { pageIndex, pageSize, sorting, globalFilter };
        onQueryChange(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIndex, pageSize, sorting, globalFilter]);

    // selection callback
    useEffect(() => {
        if (!onSelectionChange) return;
        onSelectionChange(table.getSelectedRowModel().rows.map((r) => r.original as T));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rowSelection]);

    const columnsForToggle = useMemo(() =>
        table.getAllLeafColumns()
            .filter((c) => c.getCanHide())
            .map((c) => ({
                id: c.id,
                label: (typeof c.columnDef.header === "string" ? c.columnDef.header : c.id) as string,
                visible: c.getIsVisible(),
                toggle: () => c.toggleVisibility(),
            })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [table, columnVisibility]
    );

    const rows = table.getRowModel().rows;
    const selectedCount = Object.keys(rowSelection).length;
    const safePageIndex = clamp(pageIndex, 0, Math.max(0, Math.ceil(effectiveTotal / pageSize) - 1));

    return (
        <div className="dt-root">
            <div className="dt-card">

                {/* ── Toolbar ── */}
                <div className="dt-card-header">
                    <Toolbar
                        title={title}
                        subtitle={subtitle}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={(v) => { setPageIndex(0); setGlobalFilter(v); }}
                        columnsForToggle={columnsForToggle}
                        rightActions={rightActions}
                        selectedCount={selectedCount}
                        onClearSelection={() => setRowSelection({})}
                    />
                </div>

                {/* ── Body ── */}
                <div className="dt-card-body">
                    {error ? (
                        <ErrorState message={error} onRetry={onRetry} />
                    ) : loading ? (
                        <Skeleton rows={pageSize > 10 ? 8 : 6} cols={Math.max(4, table.getVisibleLeafColumns().length)} />
                    ) : rows.length === 0 ? (
                        <EmptyState hasFilter={!!globalFilter} />
                    ) : (
                        <div className="dt-table-wrap">
                            <table className="dt-table">
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
                                                        aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none"}
                                                        style={{ width: h.column.columnDef.size }}
                                                    >
                                                        <div className="dt-th-inner">
                                                            {flexRender(h.column.columnDef.header, h.getContext())}
                                                            {canSort && (
                                                                <span className={`dt-sort-icon ${sort ? "dt-sort-active" : ""}`}>
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
                                    {rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={row.getIsSelected() ? "dt-row-selected" : ""}
                                            onClick={() => enableRowSelection && row.toggleSelected()}
                                            style={{ cursor: enableRowSelection ? "pointer" : "default" }}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="dt-card-footer">
                    <Pagination
                        pageIndex={safePageIndex}
                        pageSize={pageSize}
                        totalRows={effectiveTotal}
                        onPageIndexChange={(n) => setPageIndex(n)}
                        onPageSizeChange={(n) => { setPageIndex(0); setPageSize(n); }}
                    />
                </div>

            </div>
        </div>
    );
}