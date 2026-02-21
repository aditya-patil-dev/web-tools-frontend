import type { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type DataTableMode = "client" | "server";

export type DataTableQueryState = {
    pageIndex: number;
    pageSize: number;
    sorting: SortingState;
    globalFilter: string;
};

export type DataTableProps<T> = {
    tableId: string;
    columns: ColumnDef<T, unknown>[];
    data: T[];
    getRowId?: (row: T, index: number) => string;
    mode?: DataTableMode;
    totalRows?: number;
    query?: Partial<DataTableQueryState>;
    onQueryChange?: (next: DataTableQueryState) => void;
    title?: string;
    subtitle?: string;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    enableRowSelection?: boolean;
    rightActions?: ReactNode;
    onSelectionChange?: (rows: T[]) => void;
    initialPageSize?: number;
};

export type PersistedTablePrefs = {
    columnVisibility?: VisibilityState;
    pageSize?: number;
};

// ─────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────

const KEY_PREFIX = "dt_prefs:";

export function loadPrefs(tableId: string): PersistedTablePrefs | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(`${KEY_PREFIX}${tableId}`);
        return raw ? (JSON.parse(raw) as PersistedTablePrefs) : null;
    } catch {
        return null;
    }
}

export function savePrefs(tableId: string, prefs: PersistedTablePrefs) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(`${KEY_PREFIX}${tableId}`, JSON.stringify(prefs));
    } catch { /* quota errors — silently ignore */ }
}