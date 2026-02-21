"use client";

import type { ColumnDef } from "@tanstack/react-table";

export function selectionColumn<T>(): ColumnDef<T> {
    return {
        id: "_select",
        header: ({ table }) => (
            <input
                type="checkbox"
                className="dtCheckbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
                aria-label="Select all rows"
            />
        ),
        cell: ({ row }) => (
            <input
                type="checkbox"
                className="dtCheckbox"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 44,
    };
}