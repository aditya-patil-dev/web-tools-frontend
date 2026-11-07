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
     * openUser: user-controlled accordion toggle when sidebar is expanded
     */
    const [openUser, setOpenUser] = useState(false);

    /**
     * flyoutOpen: hover state for floating popover when sidebar is collapsed
     */
    const [flyoutOpen, setFlyoutOpen] = useState(false);

    const openFinal = useMemo(() => {
        if (collapsed) return false;
        return openUser || isActive;
    }, [collapsed, openUser, isActive]);

    // ── 1. LEAF NAV ITEM (NO CHILDREN) ──
    if (!hasChildren) {
        return (
            <Link
                href={item.href || "#"}
                className={`navItem ${isActive ? "active" : ""}`}
                onClick={onNavigate}
                data-label={item.label}
                title={collapsed ? item.label : undefined}
            >
                <div className="navGroupLeft">
                    {item.icon && <i className={`bi ${item.icon} navIcon`} />}
                    {!collapsed && <span className="navLabel">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                    <span className={`navBadgePill ${item.badgeVariant ?? "primary"}`}>
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    }

    // ── 2. PARENT NAV ITEM WITH SUBMENU ──
    return (
        <div
            className={`navGroup ${isActive ? "activeGroup" : ""}`}
            style={{ position: "relative" }}
            onMouseEnter={() => collapsed && setFlyoutOpen(true)}
            onMouseLeave={() => collapsed && setFlyoutOpen(false)}
        >
            <button
                type="button"
                className={`navItem navGroupBtn ${isActive ? "active" : ""}`}
                onClick={() => {
                    if (collapsed) {
                        setFlyoutOpen((v) => !v);
                    } else {
                        setOpenUser((v) => !v);
                    }
                }}
                aria-expanded={collapsed ? flyoutOpen : openFinal}
                data-label={item.label}
                title={collapsed ? item.label : undefined}
            >
                <div className="navGroupLeft">
                    {item.icon && <i className={`bi ${item.icon} navIcon`} />}
                    {!collapsed && <span className="navLabel">{item.label}</span>}
                </div>

                {!collapsed && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.badge && (
                            <span className={`navBadgePill ${item.badgeVariant ?? "primary"}`}>
                                {item.badge}
                            </span>
                        )}
                        <i
                            className={`bi bi-chevron-down navChevron ${openFinal ? "rotated" : ""}`}
                        />
                    </div>
                )}
            </button>

            {/* A. Collapsed Mode: Floating Flyout Popover on Hover */}
            {collapsed && flyoutOpen && (
                <div
                    className="navFlyoutMenu"
                    onMouseEnter={() => setFlyoutOpen(true)}
                    onMouseLeave={() => setFlyoutOpen(false)}
                >
                    <div className="navFlyoutHeader">
                        <span>{item.label}</span>
                        {item.icon && <i className={`bi ${item.icon}`} style={{ color: "var(--admin-accent)" }} />}
                    </div>
                    <div className="navFlyoutBody">
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
                                    className={`navFlyoutItem ${childActive ? "active" : ""}`}
                                    onClick={() => {
                                        setFlyoutOpen(false);
                                        onNavigate?.();
                                    }}
                                >
                                    {child.icon && (
                                        <i className={`bi ${child.icon}`} style={{ fontSize: "13px" }} />
                                    )}
                                    <span style={{ flex: 1 }}>{child.label}</span>
                                    {child.badge && (
                                        <span className={`navBadgePill ${child.badgeVariant ?? "primary"}`}>
                                            {child.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* B. Expanded Mode: Tree Submenu with Vertical Guide */}
            {!collapsed && openFinal && (
                <div className="navSubTree">
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
                                className={`navSubLink ${childActive ? "active" : ""}`}
                                onClick={onNavigate}
                            >
                                {child.icon && (
                                    <i className={`bi ${child.icon} navSubIcon`} />
                                )}
                                <span style={{ flex: 1 }}>{child.label}</span>
                                {child.badge && (
                                    <span className={`navBadgePill ${child.badgeVariant ?? "primary"}`}>
                                        {child.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
