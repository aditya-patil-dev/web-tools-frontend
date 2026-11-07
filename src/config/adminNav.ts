export type AdminNavItem = {
    id: string;
    label: string;
    href?: string;
    icon?: string;
    badge?: string;
    badgeVariant?: "primary" | "warning" | "success" | "neutral";
    match?: "exact" | "prefix";
    section?: string;
    children?: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavItem[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: "bi-grid-1x2-fill",
        match: "exact",
        section: "MAIN",
    },
    {
        id: "tools",
        label: "Tools Directory",
        icon: "bi-tools",
        match: "prefix",
        section: "TOOLS & CONTENT",
        children: [
            { id: "categories", label: "Categories", href: "/admin/tools/categories", icon: "bi-folder2", match: "prefix" },
            { id: "tools-list", label: "Tools Catalog", href: "/admin/tools/tools-card", icon: "bi-card-list", match: "prefix" },
            { id: "tools-pages", label: "Tool Landing Pages", href: "/admin/tools/tool-pages", icon: "bi-file-earmark-code", match: "prefix" },
            { id: "tools-feedback", label: "User Feedback", href: "/admin/tools/feedback", icon: "bi-chat-square-heart", badge: "Live", badgeVariant: "success", match: "prefix" },
        ],
    },
    {
        id: "users",
        label: "User Management",
        icon: "bi-people-fill",
        match: "prefix",
        section: "TOOLS & CONTENT",
        children: [
            { id: "users-all", label: "All Users", href: "/admin/users", icon: "bi-person-check", match: "prefix" },
            { id: "users-roles", label: "Roles & Permissions", href: "/admin/users/roles", icon: "bi-shield-check", match: "prefix" },
        ],
    },
    {
        id: "online-store",
        label: "Visual Storefront",
        href: "/admin/online-store",
        icon: "bi-layout-text-window-reverse",
        badge: "Builder",
        badgeVariant: "primary",
        match: "prefix",
        section: "STORE & DATA",
    },
    {
        id: "import-export",
        label: "Import / Export",
        href: "/admin/import-export",
        icon: "bi-cloud-arrow-down-fill",
        match: "prefix",
        section: "STORE & DATA",
    },
    {
        id: "settings",
        label: "Settings",
        icon: "bi-gear-wide-connected",
        match: "prefix",
        section: "SYSTEM",
        children: [
            { id: "settings-general", label: "General Settings", href: "/admin/settings/general", icon: "bi-sliders", match: "prefix" },
            { id: "settings-legal", label: "Legal & Policies", href: "/admin/settings/legal", icon: "bi-file-earmark-lock", match: "prefix" },
            { id: "settings-online-store", label: "Storefront SEO & PSI", href: "/admin/settings/online-store", icon: "bi-speedometer", match: "prefix" },
        ],
    },
];
