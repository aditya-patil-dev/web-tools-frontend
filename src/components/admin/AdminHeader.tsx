"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

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

export default function AdminHeader({ collapsed, onToggleCollapse, onOpenMobile }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Demo notifications (replace with API later)
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: "n1",
            title: "New user registered",
            description: "A new user created an account.",
            time: "2m ago",
            href: "/admin/users",
            read: false,
        },
        {
            id: "n2",
            title: "Password reset request",
            description: "User requested password reset.",
            time: "1h ago",
            href: "/admin/users",
            read: true,
        },
        {
            id: "n3",
            title: "System update",
            description: "Deployment completed successfully.",
            time: "Yesterday",
            href: "/admin/settings",
            read: true,
        },
    ]);

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read).length,
        [notifications]
    );

    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Close dropdowns when clicking outside
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

    function handleLogout() {
        // TODO: call logout API, clear cookies/token, etc.
        closeAll();
        router.push("/login");
    }

    const title = useMemo(() => {
        if (pathname === "/admin") return "Dashboard";
        if (pathname.startsWith("/admin/users")) return "Users";
        if (pathname.startsWith("/admin/settings")) return "Settings";
        return "Admin";
    }, [pathname]);

    return (
        <header className="adminHeader">
            <div className="headerLeft">
                {/* Mobile hamburger */}
                <button
                    type="button"
                    className="iconBtn mobileOnly"
                    onClick={onOpenMobile}
                    aria-label="Open sidebar"
                >
                    <i className="bi bi-list" />
                </button>

                {/* Desktop collapse toggle */}
                <button
                    type="button"
                    className="iconBtn desktopOnly"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <i className={`bi bi-${collapsed ? 'chevron-right' : 'chevron-left'}`} />
                </button>

                <div className="headerTitle">
                    <div className="titleTop">{title}</div>
                    <div className="titleSub">Manage your platform</div>
                </div>
            </div>

            <div className="headerRight">
                {/* Search */}
                <div className="searchWrap desktopOnly">
                    <i className="bi bi-search searchIcon" />
                    <input className="searchInput" placeholder="Search..." />
                </div>

                {/* Notifications */}
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

                                <button className="dropdownActionBtn" type="button" onClick={markAllRead}>
                                    Mark all read
                                </button>
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
                                <Link href="/admin/notifications" onClick={closeAll} className="dropdownFooterLink">
                                    View all
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile dropdown */}
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
                        <div className="profileAvatar">A</div>
                        <div className="profileInfo desktopOnly">
                            <div className="profileName">Admin</div>
                            <div className="profileRole">Super Admin</div>
                        </div>
                        <i className="bi bi-chevron-down" />
                    </button>

                    {profileOpen && (
                        <div className="dropdownMenu dropdownMenuRight">
                            <div className="profileMenuHeader">
                                <div className="profileAvatarLg">A</div>
                                <div>
                                    <div className="profileMenuName">Admin</div>
                                    <div className="profileMenuEmail">admin@company.com</div>
                                </div>
                            </div>

                            <div className="dropdownList">
                                <Link href="/admin/profile" className="menuItem" onClick={closeAll}>
                                    <i className="bi bi-person" />
                                    <span>Profile</span>
                                </Link>

                                <Link href="/admin/settings" className="menuItem" onClick={closeAll}>
                                    <i className="bi bi-gear" />
                                    <span>Settings</span>
                                </Link>

                                <button type="button" className="menuItem danger" onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}