"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminNavItem } from "@/config/adminNav";
import { isRouteActive, itemHasActiveChild } from "@/lib/adminNav";

type Props = {
    item: AdminNavItem;
    pathname: string;
    collapsed: boolean;
    onNavigate?: () => void;
};

export default function AdminSidebarNavItem({
    item,
    pathname,
    collapsed,
    onNavigate,
}: Props) {
    const hasChildren = !!item.children?.length;

    const isActive = useMemo(() => {
        const self = isRouteActive(pathname, item.href, item.match ?? "prefix");
        const child = hasChildren ? itemHasActiveChild(pathname, item) : false;
        return self || child;
    }, [pathname, item, hasChildren]);

    /**
     * openUser: user-controlled state only (no effects)
     * openFinal: derived open state (auto-open when active)
     */
    const [openUser, setOpenUser] = useState(false);

    const openFinal = useMemo(() => {
        if (collapsed) return false; // when collapsed we hide submenu UI anyway
        return openUser || isActive; // auto-open if route is active
    }, [collapsed, openUser, isActive]);

    // Leaf item
    if (!hasChildren) {
        return (
            <Link
                href={item.href || "#"}
                className={`navItem ${isActive ? "active" : ""}`}
                onClick={onNavigate}
            >
                {item.icon && <i className={`bi ${item.icon} navIcon`} />}
                {!collapsed && <span className="navLabel">{item.label}</span>}
            </Link>
        );
    }

    // Parent with submenu
    return (
        <div className={`navGroup ${isActive ? "activeGroup" : ""}`}>
            <button
                type="button"
                className={`navItem navGroupBtn ${isActive ? "active" : ""}`}
                onClick={() => setOpenUser((v) => !v)}
                aria-expanded={openFinal}
            >
                <div className="navGroupLeft">
                    {item.icon && <i className={`bi ${item.icon} navIcon`} />}
                    {!collapsed && <span className="navLabel">{item.label}</span>}
                </div>

                {!collapsed && (
                    <i
                        className={`bi ${openFinal ? "bi-chevron-up" : "bi-chevron-down"
                            } navChevron`}
                    />
                )}
            </button>

            {/* Submenu */}
            {!collapsed && (
                <div className={`subNav ${openFinal ? "open" : ""}`}>
                    {item.children!.map((child) => {
                        const childActive = isRouteActive(
                            pathname,
                            child.href,
                            child.match ?? "prefix"
                        );

                        return (
                            <Link
                                key={child.id}
                                href={child.href || "#"}
                                className={`subNavItem ${childActive ? "active" : ""}`}
                                onClick={onNavigate}
                            >
                                <span className="subNavDot" />
                                <span className="subNavLabel">{child.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
