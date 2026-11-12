"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type NotificationItem = {
    id: string;
    title: string;
    description?: string;
    time: string;
    href?: string;
    read?: boolean;
};

type Props = {
    collapsed: boolean;
    onToggleCollapse: () => void;
    onOpenMobile: () => void;
};

// Route registry for header titles and breadcrumb metadata
const ROUTE_MAP: Record<string, { title: string; subtitle: string; section?: string }> = {
    "/admin": {
        title: "Dashboard",
        subtitle: "Real-time metrics, system health, and website overview",
    },
    "/admin/analytics": {
        title: "Executive Analytics Overview",
        subtitle: "Traffic volume, tool execution trends, and global conversion rate",
        section: "Analytics",
    },
    "/admin/analytics/tools": {
        title: "Tool Performance Diagnostics",
        subtitle: "Side-by-side usage metrics, health tier triage, and quick actions",
        section: "Analytics",
    },
    "/admin/analytics/events": {
        title: "Live Visitor Activity Feed",
        subtitle: "Real-time feed of visitor actions, tool executions, and user journeys",
        section: "Analytics",
    },
    "/admin/tools/categories": {
        title: "Tool Categories",
        subtitle: "Organize taxonomy, landing pages, and category SEO",
        section: "Tools",
    },
    "/admin/tools/categories/new": {
        title: "New Category",
        subtitle: "Create a new tool category landing page",
        section: "Tools",
    },
    "/admin/tools/tools-card": {
        title: "Tools Catalog",
        subtitle: "Manage directory tools, access levels, and badges",
        section: "Tools",
    },
    "/admin/tools/tools-card/new": {
        title: "New Tool",
        subtitle: "Add and configure a new web tool in the catalog",
        section: "Tools",
    },
    "/admin/tools/tool-pages": {
        title: "Tool Landing Pages",
        subtitle: "Content, feature highlights, FAQs, and SEO meta tags",
        section: "Tools",
    },
    "/admin/tools/feedback": {
        title: "User Feedback",
        subtitle: "Real-time ratings, comments, and satisfaction metrics",
        section: "Tools",
    },
    "/admin/import-export": {
        title: "Import / Export",
        subtitle: "Bulk CSV data management with JSON feature support",
        section: "Operations",
    },
    "/admin/online-store": {
        title: "Visual Page Builder",
        subtitle: "Configure homepage sections, hero, and visual layouts",
        section: "Storefront",
    },
    "/admin/settings/general": {
        title: "General Settings",
        subtitle: "Site identity, social links, SEO defaults, and email config",
        section: "Settings",
    },
    "/admin/settings/legal": {
        title: "Legal Pages",
        subtitle: "Manage terms of service, privacy policy, and disclaimers",
        section: "Settings",
    },
    "/admin/settings/legal/new": {
        title: "New Legal Page",
        subtitle: "Create a new policy or compliance document",
        section: "Settings",
    },
    "/admin/settings/online-store": {
        title: "Storefront SEO & Performance",
        subtitle: "Core Web Vitals, PageSpeed Insights, and SEO health",
        section: "Settings",
    },
    "/admin/users": {
        title: "User Management",
        subtitle: "Platform users, team roles, and administrative permissions",
        section: "Users",
    },
};

export default function AdminHeader({ collapsed, onToggleCollapse, onOpenMobile }: Props) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: "n1",
            title: "New feedback submitted",
            description: "A user rated Image Compressor as Helpful.",
            time: "5m ago",
            href: "/admin/tools/feedback",
            read: false,
        },
        {
            id: "n2",
            title: "System check completed",
            description: "All web tool endpoints responding with 200 OK.",
            time: "1h ago",
            href: "/admin",
            read: true,
        },
        {
            id: "n3",
            title: "SEO Health verified",
            description: "Robots.txt and sitemap synced successfully.",
            time: "Yesterday",
            href: "/admin/settings/general",
            read: true,
        },
    ]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }

        if (notifOpen || profileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [notifOpen, profileOpen]);

    function closeAll() {
        setNotifOpen(false);
        setProfileOpen(false);
    }

    function markAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    async function handleLogout() {
        closeAll();
        setIsLoggingOut(true);
        await logout();
    }

    // Resolve current title, subtitle & breadcrumbs dynamically
    const routeInfo = useMemo(() => {
        if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];

        // Dynamic patterns: e.g. /admin/tools/tools-card/12
        if (pathname.startsWith("/admin/tools/tools-card/")) {
            return {
                title: "Edit Tool",
                subtitle: "Update configuration, SEO metadata, and category assignment",
                section: "Tools",
            };
        }
        if (pathname.startsWith("/admin/tools/categories/")) {
            return {
                title: "Edit Category",
                subtitle: "Update category details and SEO landing configuration",
                section: "Tools",
            };
        }
        if (pathname.startsWith("/admin/tools/tool-pages/")) {
            return {
                title: "Edit Tool Page",
                subtitle: "Update content, feature lists, FAQs, and search tags",
                section: "Tools",
            };
        }
        if (pathname.startsWith("/admin/settings/legal/")) {
            return {
                title: "Edit Legal Page",
                subtitle: "Update legal policy text and version information",
                section: "Settings",
            };
        }

        return {
            title: "Admin Console",
            subtitle: "Manage FusionTools platform and data",
        };
    }, [pathname]);

    const avatarLetter = user?.full_name?.charAt(0).toUpperCase() ?? "A";
    const userName = user?.full_name ?? "Administrator";
    const userRole = user?.workspace?.member_role ?? "Super Admin";
    const userEmail = user?.email ?? "admin@fusiontools.com";

    return (
        <header className="adminHeader">
            <div className="headerLeft">
                <button
                    type="button"
                    className="iconBtn mobileOnly"
                    onClick={onOpenMobile}
                    aria-label="Open sidebar"
                >
                    <i className="bi bi-list" />
                </button>

                <button
                    type="button"
                    className="iconBtn desktopOnly"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <i className={`bi bi-${collapsed ? "chevron-right" : "chevron-left"}`} />
                </button>

                <div className="headerTitle">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="titleTop">{routeInfo.title}</div>
                        {routeInfo.section && (
                            <span
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "2px 7px",
                                    borderRadius: "4px",
                                    background: "rgba(255, 107, 53, 0.15)",
                                    color: "var(--admin-accent)",
                                    letterSpacing: "0.04em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {routeInfo.section}
                            </span>
                        )}
                    </div>
                    <div className="titleSub">{routeInfo.subtitle}</div>
                </div>
            </div>

            <div className="headerRight">
                {/* Search Bar with Quick Filter hint */}
                <div className="searchWrap desktopOnly">
                    <i className="bi bi-search searchIcon" />
                    <input
                        className="searchInput"
                        placeholder="Quick search..."
                        aria-label="Quick search tools, pages, settings"
                    />
                    <span className="searchKbdHint">Ctrl K</span>
                </div>

                {/* System Status Pill */}
                <div className="headerStatusPill desktopOnly" title="System services operational">
                    <span className="headerStatusDot" />
                    <span>System Online</span>
                </div>

                {/* Live Website Button */}
                <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="headerLiveBtn desktopOnly"
                    title="Open live website in new tab"
                >
                    <i className="bi bi-box-arrow-up-right" style={{ fontSize: "11px" }} />
                    <span>View Live Site</span>
                </Link>

                <div className="headerDivider desktopOnly" />

                {/* Notifications Dropdown */}
                <div className="dropdownWrap" ref={notifRef}>
                    <button
                        type="button"
                        className="iconBtn"
                        onClick={() => {
                            setProfileOpen(false);
                            setNotifOpen((v) => !v);
                        }}
                        aria-label="Notifications"
                        aria-expanded={notifOpen}
                        title="Notifications"
                    >
                        <i className="bi bi-bell" />
                        {unreadCount > 0 && (
                            <span className="notifBadge" aria-label={`${unreadCount} unread notifications`}>
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="dropdownMenu dropdownMenuRight">
                            <div className="dropdownHeaderRow">
                                <div>
                                    <div className="dropdownTitle">Notifications</div>
                                    <div className="dropdownSub">
                                        {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                                    </div>
                                </div>
                                {unreadCount > 0 && (
                                    <button className="dropdownActionBtn" type="button" onClick={markAllRead}>
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="dropdownList">
                                {notifications.length === 0 ? (
                                    <div className="dropdownEmpty">No notifications</div>
                                ) : (
                                    notifications.map((n) => (
                                        <Link
                                            key={n.id}
                                            href={n.href || "#"}
                                            className={`notifItem ${n.read ? "" : "unread"}`}
                                            onClick={closeAll}
                                        >
                                            <div className="notifDot" />
                                            <div className="notifText">
                                                <div className="notifTitle">{n.title}</div>
                                                {n.description && <div className="notifDesc">{n.description}</div>}
                                                <div className="notifTime">{n.time}</div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            <div className="dropdownFooter">
                                <Link href="/admin/tools/feedback" onClick={closeAll} className="dropdownFooterLink">
                                    View user feedback ↗
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown */}
                <div className="dropdownWrap" ref={profileRef}>
                    <button
                        type="button"
                        className="profileChip"
                        onClick={() => {
                            setNotifOpen(false);
                            setProfileOpen((v) => !v);
                        }}
                        aria-expanded={profileOpen}
                        aria-label="Profile menu"
                    >
                        <div className="profileAvatarWrap">
                            <div className="profileAvatar">{avatarLetter}</div>
                            <span className="profileOnline" />
                        </div>
                        <div className="profileInfo desktopOnly">
                            <div className="profileName">{userName}</div>
                            <div className="profileRole">{userRole}</div>
                        </div>
                        <i className="bi bi-chevron-down profileChevron" />
                    </button>

                    {profileOpen && (
                        <div className="dropdownMenu dropdownMenuRight">
                            <div className="profileMenuHeader">
                                <div className="profileAvatarLg">{avatarLetter}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="profileMenuName">{userName}</div>
                                    <div className="profileMenuEmail" style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                                        {userEmail}
                                    </div>
                                </div>
                            </div>

                            <div className="dropdownList">
                                <Link href="/admin/settings/general" className="menuItem" onClick={closeAll}>
                                    <i className="bi bi-gear" />
                                    <span>System Settings</span>
                                </Link>

                                <Link href="/admin/import-export" className="menuItem" onClick={closeAll}>
                                    <i className="bi bi-cloud-arrow-down" />
                                    <span>Import / Export Data</span>
                                </Link>

                                <Link href="/" target="_blank" className="menuItem" onClick={closeAll}>
                                    <i className="bi bi-box-arrow-up-right" />
                                    <span>Visit Live Website</span>
                                </Link>

                                <button
                                    type="button"
                                    className="menuItem danger"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    <i className="bi bi-box-arrow-right" />
                                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
