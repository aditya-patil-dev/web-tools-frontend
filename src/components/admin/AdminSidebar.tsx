"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/config/adminNav";
import AdminSidebarNavItem from "@/components/admin/AdminSidebarNavItem";

type Props = {
    collapsed: boolean;
    mobileOpen: boolean;
    onCloseMobile: () => void;
};

export default function AdminSidebar({ collapsed, mobileOpen, onCloseMobile }: Props) {
    const pathname = usePathname();

    const handleNavigate = () => {
        // Close sidebar on mobile after navigation
        onCloseMobile();
    };

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
                <div className="brandMini">
                    <span className="brandDot" />
                    <span className="brandText">{collapsed ? "AP" : "Admin Panel"}</span>
                </div>

                <button
                    className="iconBtn sidebarCloseBtn"
                    onClick={onCloseMobile}
                    aria-label="Close sidebar"
                >
                    <i className="bi bi-x-lg" />
                </button>
            </div>

            <nav className="sidebarNav" aria-label="Admin navigation">
                {ADMIN_NAV.map((item) => (
                    <AdminSidebarNavItem
                        key={item.id}
                        item={item}
                        pathname={pathname}
                        collapsed={collapsed}
                        onNavigate={handleNavigate}
                    />
                ))}
            </nav>

            <div className="sidebarBottom">
                <div className="userCard">
                    <div className="avatar">A</div>
                    {!collapsed && (
                        <div className="userMeta">
                            <div className="userName">Admin</div>
                            <div className="userRole">Super Admin</div>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <button className="logoutBtn" type="button">
                        <i className="bi bi-box-arrow-right" />
                        <span>Logout</span>
                    </button>
                )}
            </div>
        </aside>
    );
}