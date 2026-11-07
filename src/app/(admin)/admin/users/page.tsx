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
            {
                header: "Name",
                accessorKey: "name",
                cell: ({ row }) => (
                    <div className="dtCellText">
                        <div className="dtCellTitle">{row.original.name}</div>
                    </div>
                ),
            },
            {
                header: "Email",
                accessorKey: "email",
                cell: ({ row }) => <span className="dtMuted">{row.original.email}</span>,
            },
            {
                header: "Role",
                accessorKey: "role",
                cell: ({ row }) => <span className="dtBadge neutral">{row.original.role}</span>,
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                enableHiding: false,
                cell: ({ row }) => (
                    <div className="tableRowActions">
                        <button
                            type="button"
                            className="tableActionBtn"
                            onClick={() => toast.info(`Edit ${row.original.name}`)}
                            title="Edit user"
                        >
                            <i className="bi bi-pencil" />
                        </button>
                        <button
                            type="button"
                            className="tableActionBtn danger"
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
                            title="Delete user"
                        >
                            <i className="bi bi-trash" />
                        </button>
                    </div>
                ),
            },
        ];
    }, []);

    return (
        <div className="adminPage">
            <PageHeader
                title="Users & Roles"
                subtitle="Manage administrative accounts, team access, and permission levels"
                actions={[
                    {
                        label: "Add User",
                        icon: "bi-person-plus",
                        href: "/admin/users/new",
                        variant: "primary",
                    },
                ]}
                variant="flat"
            />

            <DataTable<UserRow>
                tableId="users-table"
                data={rows}
                columns={columns}
                getRowId={(r) => r.id}
                enableRowSelection
            />
        </div>
    );
}
