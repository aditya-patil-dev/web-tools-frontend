"use client";

import React, { forwardRef, useId } from "react";
import { FiCheck, FiMinus } from "react-icons/fi";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    description?: string;
    error?: string;
    size?: "sm" | "md" | "lg";
    indeterminate?: boolean;
    variant?: "default" | "card";
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            description,
            error,
            size = "md",
            indeterminate,
            variant = "default",
            className = "",
            id,
            disabled,
            checked,
            onChange,
            ...rest
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const hasError = !!error;

        const sizeMap = {
            sm: { box: 16, font: "0.8125rem", desc: "0.75rem" },
            md: { box: 20, font: "0.9375rem", desc: "0.8125rem" },
            lg: { box: 24, font: "1.0625rem", desc: "0.875rem" },
        };
        const s = sizeMap[size];

        const boxStyle: React.CSSProperties = {
            width: s.box,
            height: s.box,
            minWidth: s.box,
            borderRadius: size === "lg" ? "6px" : "4px",
            border: `2px solid ${hasError
                    ? "var(--color-error)"
                    : checked || indeterminate
                        ? "var(--color-primary)"
                        : "var(--border-secondary)"
                }`,
            background:
                checked || indeterminate
                    ? "var(--color-primary)"
                    : "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-base)",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            flexShrink: 0,
            boxShadow: checked || indeterminate ? "0 2px 6px rgba(255,107,53,0.35)" : "none",
        };

        const content = (
            <label
                htmlFor={inputId}
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    userSelect: "none",
                    padding: variant === "card" ? "12px 16px" : 0,
                    border: variant === "card" ? `1.5px solid ${hasError ? "var(--color-error)" : checked ? "var(--color-primary)" : "var(--border-secondary)"}` : "none",
                    borderRadius: variant === "card" ? "var(--radius-md)" : 0,
                    background: variant === "card" ? checked ? "rgba(255,107,53,0.04)" : "var(--bg-primary)" : "transparent",
                    transition: "all var(--transition-base)",
                    width: "100%",
                }}
            >
                <input
                    ref={ref}
                    type="checkbox"
                    id={inputId}
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    style={{ display: "none" }}
                    {...rest}
                />
                <span style={boxStyle}>
                    {indeterminate ? (
                        <FiMinus size={s.box * 0.6} color="white" strokeWidth={3} />
                    ) : checked ? (
                        <FiCheck size={s.box * 0.6} color="white" strokeWidth={3} />
                    ) : null}
                </span>
                {(label || description) && (
                    <span style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "1px" }}>
                        {label && (
                            <span
                                style={{
                                    fontSize: s.font,
                                    fontWeight: 500,
                                    color: disabled ? "var(--text-tertiary)" : "var(--text-primary)",
                                    lineHeight: 1.4,
                                }}
                            >
                                {label}
                            </span>
                        )}
                        {description && (
                            <span style={{ fontSize: s.desc, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                                {description}
                            </span>
                        )}
                    </span>
                )}
            </label>
        );

        return (
            <div className={className}>
                {content}
                {hasError && (
                    <p style={{ fontSize: "0.8rem", color: "var(--color-error)", margin: "4px 0 0 0" }}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;