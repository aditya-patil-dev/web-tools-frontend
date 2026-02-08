import type {
    ColumnDef,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table";

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

    /** Row id resolver (strongly recommended for stable selection) */
    getRowId?: (row: T, index: number) => string;

    /** client or server */
    mode?: DataTableMode;

    /** server mode only */
    totalRows?: number;
    query?: Partial<DataTableQueryState>;
    onQueryChange?: (next: DataTableQueryState) => void;

    /** UI */
    title?: string;
    subtitle?: string;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;

    /** features */
    enableRowSelection?: boolean;

    /** actions (optional): shown in toolbar right */
    rightActions?: React.ReactNode;

    /** called when selection changes */
    onSelectionChange?: (selectedRows: T[]) => void;

    /** initial */
    initialPageSize?: number;
};

export type PersistedTablePrefs = {
    columnVisibility?: VisibilityState;
    pageSize?: number;
};
