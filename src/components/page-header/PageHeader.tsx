"use client";

import Link from "next/link";
import type { PageHeaderProps } from "./page-header.types";

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs,
    showBack,
    onBack,
    actions,
    variant = "card", // 👈 default card
    className,
}: PageHeaderProps) {
    return (
        <div
            className={[
                "pageHeader",
                variant === "card" ? "pageHeaderCard" : "pageHeaderFlat",
                className ?? "",
            ].join(" ")}
        >
            {/* Top row */}
            <div className="pageHeaderTop">
                <div className="pageHeaderLeft">
                    {showBack && (
                        <button
                            type="button"
                            className="iconBtn"
                            onClick={onBack}
                            aria-label="Go back"
                        >
                            <i className="bi bi-arrow-left" />
                        </button>
                    )}

                    <div>
                        <h1 className="pageTitle">{title}</h1>
                        {subtitle && <p className="pageSubtitle">{subtitle}</p>}
                    </div>
                </div>

                {actions && actions.length > 0 && (
                    <div className="pageHeaderActions">
                        {actions.map((a, idx) =>
                            a.href ? (
                                <Link
                                    key={idx}
                                    href={a.href}
                                    className={`phBtn ${a.variant ?? "secondary"}`}
                                >
                                    {a.icon && <i className={`bi ${a.icon}`} />}
                                    <span>{a.label}</span>
                                </Link>
                            ) : (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`phBtn ${a.variant ?? "secondary"}`}
                                    onClick={a.onClick}
                                >
                                    {a.icon && <i className={`bi ${a.icon}`} />}
                                    <span>{a.label}</span>
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="pageBreadcrumbs" aria-label="Breadcrumb">
                    {breadcrumbs.map((b, idx) => (
                        <span key={idx} className="breadcrumbItem">
                            {b.href ? <Link href={b.href}>{b.label}</Link> : <span>{b.label}</span>}
                            {idx < breadcrumbs.length - 1 && (
                                <i className="bi bi-chevron-right breadcrumbSep" />
                            )}
                        </span>
                    ))}
                </nav>
            )}
        </div>
    );
}
