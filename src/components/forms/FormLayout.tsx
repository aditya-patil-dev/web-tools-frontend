"use client";

import React from "react";

// ==============================
// FormGroup - wraps a row of fields
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
    return (
        <div
            className={className}
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap,
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
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        transition: "all var(--transition-base)",
        ...(variant === "default"
            ? {
                background: "var(--bg-primary)",
                border: "1.5px solid var(--border-primary)",
                boxShadow: "var(--shadow-sm)",
            }
            : variant === "bordered"
                ? {
                    background: "transparent",
                    border: "1.5px solid var(--border-secondary)",
                }
                : {
                    background: "var(--bg-secondary)",
                    border: "none",
                }),
    };

    return (
        <div className={className} style={containerStyle}>
            {(title || description) && (
                <div
                    style={{
                        padding: "20px 24px",
                        borderBottom: open ? "1px solid var(--border-primary)" : "none",
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
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
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
                                        padding: "2px 10px",
                                        background: "rgba(255,107,53,0.1)",
                                        color: "var(--color-primary)",
                                        borderRadius: "var(--radius-full)",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        border: "1px solid rgba(255,107,53,0.25)",
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
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
                                    color: "var(--text-tertiary)",
                                    transition: "transform var(--transition-base)",
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
                borderTop: divider ? "1px solid var(--border-primary)" : "none",
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

export default { Form, FormGroup, FormSection, FormActions };