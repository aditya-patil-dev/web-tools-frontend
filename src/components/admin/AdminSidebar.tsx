"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ADMIN_NAV } from "@/config/adminNav";
import AdminSidebarNavItem from "@/components/admin/AdminSidebarNavItem";
import { useAuth } from "@/hooks/useAuth";

type Props = {
    collapsed: boolean;
    mobileOpen: boolean;
    onCloseMobile: () => void;
};

export default function AdminSidebar({ collapsed, mobileOpen, onCloseMobile }: Props) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const handleNavigate = () => {
        // Close sidebar on mobile after navigation
        onCloseMobile();
    };

    const handleLogout = async () => {
        await logout();
    };

    const userInitial = user?.full_name?.charAt(0).toUpperCase() || "A";
    const displayName = user?.full_name || "Administrator";
    const displayRole = user?.workspace?.member_role || "Super Admin";

    // Group navigation items by section
    const groupedNav = useMemo(() => {
        const sections: { name: string; items: typeof ADMIN_NAV }[] = [];
        for (const item of ADMIN_NAV) {
            const secName = item.section || "MENU";
            let section = sections.find((s) => s.name === secName);
            if (!section) {
                section = { name: secName, items: [] };
                sections.push(section);
            }
            section.items.push(item);
        }
        return sections;
    }, []);

    return (
        <aside
            className={[
                "adminSidebar",
                collapsed ? "collapsed" : "",
                mobileOpen ? "mobileOpen" : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="sidebarTop">
                <Link href="/admin" className="sidebarBrandWrap" onClick={handleNavigate}>
                    <div className="sidebarBrandLogo">FT</div>
                    {!collapsed && (
                        <div className="sidebarBrandInfo">
                            <span className="sidebarBrandName">FusionTools</span>
                            <span className="sidebarBrandBadge">Admin Console</span>
                        </div>
                    )}
                </Link>

                <button
                    className="iconBtn sidebarCloseBtn"
                    onClick={onCloseMobile}
                    aria-label="Close sidebar"
                >
                    <i className="bi bi-x-lg" />
                </button>
            </div>

            {/* Quick Live Site Shortcut */}
            <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebarLiveLink"
                title="Open live website in a new tab"
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="bi bi-box-arrow-up-right" style={{ fontSize: "12px", color: "var(--admin-accent)" }} />
                    {!collapsed && <span>Live Website</span>}
                </div>
                {!collapsed && <span className="sidebarLiveBadge">View ↗</span>}
            </Link>

            <nav className="sidebarNav" aria-label="Admin navigation">
                {groupedNav.map((section, sIdx) => (
                    <div key={section.name} className="navSectionGroup">
                        {!collapsed && sIdx > 0 && <div className="navSectionDivider" />}
                        {!collapsed && <div className="navSectionHeader">{section.name}</div>}
                        {section.items.map((item) => (
                            <AdminSidebarNavItem
                                key={item.id}
                                item={item}
                                pathname={pathname}
                                collapsed={collapsed}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebarBottom">
                <div
                    className="userCard"
                    title={collapsed ? `${displayName} (${displayRole})` : undefined}
                >
                    <div className="avatarWrap">
                        <div className="avatar">{userInitial}</div>
                        <span className="avatarOnline" title="Active session" />
                    </div>
                    {!collapsed && (
                        <div className="userMeta">
                            <div className="userName" title={displayName}>{displayName}</div>
                            <div className="userRole" title={displayRole}>{displayRole}</div>
                        </div>
                    )}
                </div>

                <button
                    className="logoutBtn"
                    type="button"
                    onClick={handleLogout}
                    title={collapsed ? "Logout" : undefined}
                    aria-label="Logout"
                >
                    <i className="bi bi-box-arrow-right" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
