"use client";

import { useEffect, useState } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [mobileOpen, setMobileOpen] = useState(false);

    /*
      Close mobile sidebar on route change
      */

    useEffect(() => {
        setMobileOpen(false);
    }, [children]);

    return (
        <div className="adminRoot">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            {mobileOpen && (
                <div className="adminOverlay" onClick={() => setMobileOpen(false)} />
            )}

            <div className={`adminMain ${sidebarCollapsed ? "collapsed" : ""}`}>
                <AdminHeader
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed((s) => !s)}
                    onOpenMobile={() => setMobileOpen(true)}
                />

                <main className="adminContent">{children}</main>
            </div>
        </div>
    );
}
