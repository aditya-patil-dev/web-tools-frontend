"use client";

import React, { forwardRef, useState, useId } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    required?: boolean;
    showCharCount?: boolean;
    autoResize?: boolean;
    minRows?: number;
    maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            helperText,
            error,
            success,
            required,
            showCharCount,
            autoResize,
            minRows = 3,
            maxRows = 10,
            maxLength,
            className = "",
            id,
            value,
            onChange,
            disabled,
            ...rest
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const [charCount, setCharCount] = useState(
            typeof value === "string" ? value.length : 0
        );

        const hasError = !!error;
        const hasSuccess = !!success && !hasError;

        const getBorderColor = () => {
            if (hasError) return "var(--color-error)";
            if (hasSuccess) return "var(--color-success)";
            return "var(--border-secondary)";
        };

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            if (autoResize) {
                e.target.style.height = "auto";
                const lineHeight = 24;
                const minHeight = minRows * lineHeight + 22;
                const maxHeight = maxRows * lineHeight + 22;
                e.target.style.height = `${Math.min(Math.max(e.target.scrollHeight, minHeight), maxHeight)}px`;
            }
            onChange?.(e);
        };

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {label && (
                    <label
                        htmlFor={inputId}
                        style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: hasError ? "var(--color-error)" : "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            letterSpacing: "0.01em",
                        }}
                    >
                        {label}
                        {required && <span style={{ color: "var(--color-error)" }}>*</span>}
                    </label>
                )}

                <div style={{ position: "relative" }}>
                    <textarea
                        ref={ref}
                        id={inputId}
                        value={value}
                        onChange={handleChange}
                        disabled={disabled}
                        maxLength={maxLength}
                        rows={minRows}
                        className={`form-control ${className}`}
                        style={{
                            width: "100%",
                            padding: "11px 16px",
                            border: `1.5px solid ${getBorderColor()}`,
                            borderRadius: "var(--radius-md)",
                            background: disabled ? "var(--bg-tertiary)" : "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontSize: "0.9375rem",
                            lineHeight: 1.6,
                            outline: "none",
                            transition: "all var(--transition-base)",
                            resize: autoResize ? "none" : "vertical",
                            minHeight: `${minRows * 24 + 22}px`,
                            boxShadow: "var(--shadow-xs)",
                            opacity: disabled ? 0.6 : 1,
                            cursor: disabled ? "not-allowed" : "text",
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = hasError ? "var(--color-error)" : "var(--color-primary)";
                            e.target.style.boxShadow = `0 0 0 3px ${hasError ? "rgba(239,68,68,0.15)" : "rgba(255,107,53,0.15)"}`;
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = getBorderColor();
                            e.target.style.boxShadow = "var(--shadow-xs)";
                        }}
                        {...rest}
                    />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        {(error || success || helperText) && (
                            <p
                                style={{
                                    fontSize: "0.8rem",
                                    margin: 0,
                                    color: hasError ? "var(--color-error)" : hasSuccess ? "var(--color-success)" : "var(--text-tertiary)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >
                                {hasError && <FiAlertCircle size={13} />}
                                {hasSuccess && <FiCheckCircle size={13} />}
                                {!hasError && !hasSuccess && helperText && <FiInfo size={13} />}
                                {error || success || helperText}
                            </p>
                        )}
                    </div>
                    {showCharCount && maxLength && (
                        <span style={{ fontSize: "0.75rem", color: charCount > maxLength * 0.9 ? "var(--color-warning)" : "var(--text-tertiary)" }}>
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
export default Textarea;