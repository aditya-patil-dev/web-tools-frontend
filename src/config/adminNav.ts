export type AdminNavItem = {
    id: string;
    label: string;
    href?: string;
    icon?: string;
    match?: "exact" | "prefix";
    children?: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavItem[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: "bi-speedometer2",
        match: "exact",
    },
    {
        id: "users",
        label: "Users",
        icon: "bi-people",
        match: "prefix",
        children: [
            { id: "users-all", label: "All Users", href: "/admin/users", match: "prefix" },
            { id: "users-roles", label: "Roles", href: "/admin/users/roles", match: "prefix" },
        ],
    },
    {
        id: "settings",
        label: "Settings",
        icon: "bi-gear",
        match: "prefix",
        children: [
            { id: "settings-general", label: "General", href: "/admin/settings", match: "prefix" },
            { id: "settings-security", label: "Security", href: "/admin/settings/security", match: "prefix" },
        ],
    },
];
