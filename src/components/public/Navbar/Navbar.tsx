"use client";
// src/components/public/Navbar/Navbar.tsx
// Accepts an optional `config` prop from the page editor.
// Falls back to the static nav.config.ts when no config is passed
// (i.e. in production before the DB record exists).

import Link from "next/link";
import { useState } from "react";
import { TOP_NAV_ITEMS, TOOLS_NAV_ITEMS } from "./nav.config";
import type { NavbarData } from "@/features/online-store/sections/navbar";

interface NavbarProps {
    config?: Partial<NavbarData>;
}

export default function Navbar({ config }: NavbarProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSub, setMobileSub] = useState<number | null>(null);

    /* ── Merge config with static defaults ── */
    const logoText = config?.logoText ?? "Web";
    const logoHighlight = config?.logoHighlight ?? "Tools";
    const ctaText = config?.ctaText ?? "Try Tools";
    const ctaHref = config?.ctaHref ?? "/tools";
    const loginHref = config?.loginHref ?? "/login";
    const topNavItems = config?.topNavItems ?? TOP_NAV_ITEMS;
    const toolsNavItems = config?.toolsNavItems ?? TOOLS_NAV_ITEMS;

    return (
        <>
            <header className="nav-wrapper">
                {/* TOP ROW */}
                <div className="nav-top-row">
                    <div className="nav-container">
                        {/* Logo */}
                        <Link href="/" className="nav-logo">
                            {logoText}<span>{logoHighlight}</span>
                        </Link>

                        {/* Desktop Top Navigation */}
                        <div className="nav-top-links desktop-only">
                            {topNavItems.map((item) => (
                                <Link key={item.label} href={item.href} className="nav-top-link">
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="nav-actions desktop-only">
                            <Link href={loginHref} className="nav-link">Login</Link>
                            <Link href={ctaHref} className="nav-cta">{ctaText}</Link>
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className="mobile-toggle mobile-only"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <span /><span /><span />
                        </button>
                    </div>
                </div>

                {/* BOTTOM ROW */}
                <div className="nav-bottom-row desktop-only">
                    <div className="nav-container">
                        <nav className="nav-tools-menu">
                            {toolsNavItems.map((item, index) => {
                                const hasDropdown = item.children && item.children.length > 0;
                                return (
                                    <div
                                        key={item.label}
                                        className={`nav-item ${hasDropdown ? "nav-dropdown" : ""} ${openIndex === index ? "open" : ""}`}
                                        onMouseEnter={() => hasDropdown && setOpenIndex(index)}
                                        onMouseLeave={() => hasDropdown && setOpenIndex(null)}
                                    >
                                        {hasDropdown ? (
                                            <div className="nav-item-wrapper">
                                                <Link href={item.href!} className="nav-item-link">{item.label}</Link>
                                                <button className="dropdown-trigger-btn" aria-label={`Open ${item.label} menu`}>
                                                    <span className="caret" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Link href={item.href!}>{item.label}</Link>
                                        )}

                                        {hasDropdown && (
                                            <div className="dropdown-menu">
                                                {item.children!.map((child) => (
                                                    <Link key={child.href} href={child.href}>
                                                        {child.label}
                                                        {child.badge && (
                                                            <span className={`badge badge-${child.badge}`}>{child.badge}</span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile Slide Panel */}
            <div className={`mobile-panel ${mobileOpen ? "open" : ""}`}>
                <div className="mobile-header">
                    <span className="nav-logo">{logoText}<span>{logoHighlight}</span></span>
                    <button className="close-btn" onClick={() => { setMobileOpen(false); setMobileSub(null); }}>✕</button>
                </div>

                <ul className="mobile-menu">
                    {topNavItems.map((item) => (
                        <li key={item.label}>
                            <Link href={item.href} className="mobile-link" onClick={() => setMobileOpen(false)}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li className="mobile-divider">Tools</li>
                    {toolsNavItems.map((item, index) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = mobileSub === index;
                        return (
                            <li key={item.label}>
                                {hasChildren ? (
                                    <>
                                        <div className="mobile-link-wrapper">
                                            <Link href={item.href!} className="mobile-link" onClick={() => setMobileOpen(false)}>
                                                {item.label}
                                            </Link>
                                            <button
                                                className="mobile-dropdown-btn"
                                                onClick={() => setMobileSub(isOpen ? null : index)}
                                                aria-label={`Toggle ${item.label} submenu`}
                                            >
                                                <span className={`caret ${isOpen ? "rotate" : ""}`} />
                                            </button>
                                        </div>
                                        <div className={`mobile-submenu ${isOpen ? "open" : ""}`}>
                                            {item.children!.map((child) => (
                                                <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}>
                                                    {child.label}
                                                    {child.badge && (
                                                        <span className={`badge badge-${child.badge}`}>{child.badge}</span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <Link href={item.href!} className="mobile-link" onClick={() => setMobileOpen(false)}>
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <div className="mobile-actions">
                    <Link href={loginHref} onClick={() => setMobileOpen(false)}>Login</Link>
                    <Link href={ctaHref} className="nav-cta" onClick={() => setMobileOpen(false)}>{ctaText}</Link>
                </div>
            </div>

            {mobileOpen && (
                <div className="mobile-overlay" onClick={() => { setMobileOpen(false); setMobileSub(null); }} />
            )}
        </>
    );
}