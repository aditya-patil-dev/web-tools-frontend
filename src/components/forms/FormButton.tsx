"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    rounded?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
        background: "var(--gradient-primary)",
        color: "#fff",
        border: "1.5px solid transparent",
        boxShadow: "0 4px 14px rgba(255,107,53,0.35)",
    },
    secondary: {
        background: "var(--bg-tertiary)",
        color: "var(--text-primary)",
        border: "1.5px solid var(--border-secondary)",
        boxShadow: "var(--shadow-xs)",
    },
    ghost: {
        background: "transparent",
        color: "var(--text-secondary)",
        border: "1.5px solid transparent",
        boxShadow: "none",
    },
    danger: {
        background: "var(--color-error)",
        color: "#fff",
        border: "1.5px solid transparent",
        boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
    },
    success: {
        background: "var(--color-success)",
        color: "#fff",
        border: "1.5px solid transparent",
        boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
    },
    outline: {
        background: "transparent",
        color: "var(--color-primary)",
        border: "1.5px solid var(--color-primary)",
        boxShadow: "none",
    },
};

const hoverStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { filter: "brightness(1.08)", boxShadow: "0 6px 20px rgba(255,107,53,0.45)" },
    secondary: { background: "var(--bg-secondary)", borderColor: "var(--border-hover)" },
    ghost: { background: "var(--bg-tertiary)" },
    danger: { filter: "brightness(1.08)", boxShadow: "0 6px 20px rgba(239,68,68,0.4)" },
    success: { filter: "brightness(1.08)", boxShadow: "0 6px 20px rgba(16,185,129,0.4)" },
    outline: { background: "rgba(255,107,53,0.06)" },
};

const sizeMap: Record<ButtonSize, { padding: string; fontSize: string; iconSize: number; height: string }> = {
    xs: { padding: "5px 12px", fontSize: "0.75rem", iconSize: 12, height: "30px" },
    sm: { padding: "7px 16px", fontSize: "0.8125rem", iconSize: 14, height: "36px" },
    md: { padding: "10px 22px", fontSize: "0.9375rem", iconSize: 16, height: "44px" },
    lg: { padding: "13px 28px", fontSize: "1.0625rem", iconSize: 18, height: "52px" },
    xl: { padding: "16px 36px", fontSize: "1.125rem", iconSize: 20, height: "60px" },
};

export const FormButton: React.FC<FormButtonProps> = ({
    variant = "primary",
    size = "md",
    isLoading,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth,
    rounded,
    children,
    disabled,
    style,
    ...rest
}) => {
    const [hovered, setHovered] = React.useState(false);
    const s = sizeMap[size];
    const v = variantStyles[variant];
    const h = hoverStyles[variant];

    return (
        <button
            disabled={disabled || isLoading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: s.padding,
                height: s.height,
                fontSize: s.fontSize,
                fontWeight: 600,
                borderRadius: rounded ? "var(--radius-full)" : "var(--radius-md)",
                cursor: disabled || isLoading ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                width: fullWidth ? "100%" : undefined,
                transition: "all var(--transition-base)",
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                ...v,
                ...(hovered && !disabled && !isLoading ? h : {}),
                ...style,
            }}
            {...rest}
        >
            {isLoading ? (
                <>
                    <span
                        className="spinner-border"
                        style={{ width: s.iconSize, height: s.iconSize, borderWidth: "2px" }}
                    />
                    {loadingText || children}
                </>
            ) : (
                <>
                    {leftIcon && <span style={{ display: "flex", alignItems: "center" }}>{leftIcon}</span>}
                    {children}
                    {rightIcon && <span style={{ display: "flex", alignItems: "center" }}>{rightIcon}</span>}
                </>
            )}
        </button>
    );
};

export default FormButton;