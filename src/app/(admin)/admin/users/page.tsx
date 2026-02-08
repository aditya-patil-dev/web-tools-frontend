"use client";

import DataTable from "@/components/table/DataTable";
import { selectionColumn } from "@/components/table/selectionColumn";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "@/components/toast/toast";
import { confirmDelete } from "@/components/dialog/confirm";
import { loading } from "@/components/loading/loading";
import PageHeader from "@/components/page-header/PageHeader";

type UserRow = {
    id: string;
    name: string;
    email: string;
    role: string;
};

export default function UsersPage() {

    const [rows, setRows] = useState<UserRow[]>([
        { id: "1", name: "Admin", email: "admin@company.com", role: "Super Admin" },
        { id: "2", name: "John", email: "john@company.com", role: "Manager" },
    ]);

    const columns = useMemo<ColumnDef<UserRow>[]>(() => {
        return [
            selectionColumn<UserRow>(),
            { header: "Name", accessorKey: "name" },
            { header: "Email", accessorKey: "email" },
            { header: "Role", accessorKey: "role" },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => (
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="dtBtn" onClick={() => toast.info(`Edit ${row.original.name}`)}>
                            <i className="bi bi-pencil" /> Edit
                        </button>
                        <button
                            className="dtBtn danger"
                            onClick={async () => {
                                const ok = await confirmDelete("this user");
                                if (!ok) return;

                                loading.show({ message: "Deleting user..." });
                                try {
                                    await new Promise((r) => setTimeout(r, 600));
                                    setRows((prev) => prev.filter((x) => x.id !== row.original.id));
                                    toast.success("User deleted");
                                } finally {
                                    loading.hide();
                                }
                            }}
                        >
                            <i className="bi bi-trash" /> Delete
                        </button>
                    </div>
                ),
            },
        ];
    }, []);

    return (
        <div className="container-fluid">

            <div>
                <PageHeader
                    title="Users"
                    subtitle="Manage platform users"
                    actions={[
                        {
                            label: "Add User",
                            icon: "bi-person-plus",
                            href: "/admin/users/new",
                            variant: "primary",
                        },
                        {
                            label: "Logs",
                            icon: "bi-file-earmark-text",
                            href: "/admin/users/logs",
                            variant: "primary",
                        },
                    ]}
                />

            </div>

            <DataTable<UserRow>
                tableId="users-table"
                title="Users"
                subtitle="Manage platform users"
                data={rows}
                columns={columns}
                getRowId={(r) => r.id}
                enableRowSelection
                onSelectionChange={(selected) => {
                    // optional: update bulk actions
                    // console.log(selected)
                }}
            />

        </div>
    );
}
