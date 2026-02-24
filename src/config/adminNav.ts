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
        id: "tools",
        label: "Tools",
        icon: "bi-tools",
        match: "prefix",
        children: [
            { id: "categories", label: "Categories", href: "/admin/tools/categories", match: "prefix" },
            { id: "tools-list", label: "Tools", href: "/admin/tools/tools-card", match: "prefix" },
            { id: "tools-pages", label: "Tool Pages", href: "/admin/tools/tool-pages", match: "prefix" },

        ],
    },
    {
        id: "settings",
        label: "Settings",
        icon: "bi-gear",
        match: "prefix",
        children: [
            { id: "settings-general", label: "General", href: "/admin/settings", match: "prefix" },
            { id: "settings-online-store", label: "Online Store", href: "/admin/settings/online-store", match: "prefix" },
        ],
    },
];
