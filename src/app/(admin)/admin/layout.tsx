"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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