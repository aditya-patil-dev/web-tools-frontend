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
    stickyActions = false,
    variant = "card",
    className,
}: PageHeaderProps) {
    return (
        <div
            className={[
                "pageHeader",
                variant === "card" ? "pageHeaderCard" : "pageHeaderFlat",
                stickyActions ? "pageHeaderSticky" : "",
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
                        {actions.map((action, idx) => {
                            // If it's a link
                            if (action.href) {
                                return (
                                    <Link
                                        key={idx}
                                        href={action.href}
                                        className={`phBtn ${action.variant ?? "secondary"}`}
                                    >
                                        {action.icon && <i className={`bi ${action.icon}`} />}
                                        {action.leftIcon && action.leftIcon}
                                        <span>{action.label}</span>
                                    </Link>
                                );
                            }

                            // If it's a button
                            return (
                                <button
                                    key={idx}
                                    type={action.type ?? "button"}
                                    className={`phBtn ${action.variant ?? "secondary"} ${action.isLoading ? "loading" : ""
                                        }`}
                                    onClick={action.onClick}
                                    disabled={action.disabled || action.isLoading}
                                >
                                    {action.isLoading ? (
                                        <>
                                            <span className="phBtnSpinner" />
                                            <span>{action.loadingText || action.label}</span>
                                        </>
                                    ) : (
                                        <>
                                            {action.icon && <i className={`bi ${action.icon}`} />}
                                            {action.leftIcon && action.leftIcon}
                                            <span>{action.label}</span>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="pageBreadcrumbs" aria-label="Breadcrumb">
                    {breadcrumbs.map((b, idx) => (
                        <span key={idx} className="breadcrumbItem">
                            {b.href ? (
                                <Link href={b.href}>{b.label}</Link>
                            ) : (
                                <span>{b.label}</span>
                            )}
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