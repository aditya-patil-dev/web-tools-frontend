"use client";

import React from "react";

// ==============================
// FormGroup - wraps a responsive row of fields
// ==============================
interface FormGroupProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    gap?: number;
    className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
    children,
    columns = 2,
    gap = 20,
    className = "",
}) => {
    const gridStyle =
        columns === 1
            ? "1fr"
            : columns === 2
                ? "repeat(auto-fit, minmax(280px, 1fr))"
                : columns === 3
                    ? "repeat(auto-fit, minmax(220px, 1fr))"
                    : "repeat(auto-fit, minmax(180px, 1fr))";

    return (
        <div
            className={className}
            style={{
                display: "grid",
                gridTemplateColumns: gridStyle,
                gap,
                width: "100%",
            }}
        >
            {children}
        </div>
    );
};

// ==============================
// FormSection - card-style section
// ==============================
interface FormSectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "bordered" | "ghost";
    collapsible?: boolean;
    defaultOpen?: boolean;
    badge?: string;
    action?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    description,
    children,
    className = "",
    variant = "default",
    collapsible,
    defaultOpen = true,
    badge,
    action,
}) => {
    const [open, setOpen] = React.useState(defaultOpen);

    const containerStyle: React.CSSProperties = {
        borderRadius: "var(--radius-xl, 14px)",
        overflow: "hidden",
        transition: "all var(--transition-base, 0.2s ease)",
        ...(variant === "default"
            ? {
                background: "var(--bg-primary, #ffffff)",
                border: "1px solid var(--border-primary, #e2e8f0)",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }
            : variant === "bordered"
                ? {
                    background: "transparent",
                    border: "1.5px solid var(--border-secondary, #cbd5e1)",
                }
                : {
                    background: "var(--bg-secondary, #f8fafc)",
                    border: "none",
                }),
    };

    return (
        <div className={className} style={containerStyle}>
            {(title || description) && (
                <div
                    style={{
                        padding: "18px 24px",
                        borderBottom: open ? "1px solid var(--border-primary, #e2e8f0)" : "none",
                        background: "var(--bg-secondary, #f8fafc)",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                        cursor: collapsible ? "pointer" : "default",
                    }}
                    onClick={() => collapsible && setOpen(!open)}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {title && (
                                <h3
                                    style={{
                                        fontSize: "0.9375rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary, #0f172a)",
                                        margin: 0,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {title}
                                </h3>
                            )}
                            {badge && (
                                <span
                                    style={{
                                        display: "inline-flex",
                                        padding: "2px 9px",
                                        background: "rgba(255, 107, 53, 0.12)",
                                        color: "var(--color-primary, #ff6b35)",
                                        borderRadius: "9999px",
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        border: "1px solid rgba(255, 107, 53, 0.25)",
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--text-tertiary, #64748b)", lineHeight: 1.5 }}>
                                {description}
                            </p>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        {action}
                        {collapsible && (
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    color: "var(--text-tertiary, #64748b)",
                                    transition: "transform 0.2s ease",
                                    transform: `rotate(${open ? 180 : 0}deg)`,
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 9l-7 7-7-7" />
                                </svg>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {(!collapsible || open) && (
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {children}
                </div>
            )}
        </div>
    );
};

// ==============================
// FormActions - submit/cancel row
// ==============================
interface FormActionsProps {
    children: React.ReactNode;
    align?: "left" | "right" | "center" | "between";
    divider?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
    children,
    align = "right",
    divider = true,
}) => {
    const justifyMap = {
        left: "flex-start",
        right: "flex-end",
        center: "center",
        between: "space-between",
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: justifyMap[align],
                alignItems: "center",
                gap: "12px",
                paddingTop: divider ? "20px" : 0,
                borderTop: divider ? "1px solid var(--border-primary, #e2e8f0)" : "none",
                flexWrap: "wrap",
            }}
        >
            {children}
        </div>
    );
};

// ==============================
// Form - root wrapper
// ==============================
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode;
    gap?: number;
}

export const Form: React.FC<FormProps> = ({ children, gap = 24, style, ...rest }) => {
    return (
        <form
            style={{ display: "flex", flexDirection: "column", gap, ...style }}
            {...rest}
        >
            {children}
        </form>
    );
};

const FormLayout = { Form, FormGroup, FormSection, FormActions };
export default FormLayout;
