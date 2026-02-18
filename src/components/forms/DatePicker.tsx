"use client";

import React, { forwardRef, useId } from "react";
import { FiCalendar, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    type?: "date" | "time" | "datetime-local" | "month" | "week";
    required?: boolean;
    size?: "sm" | "md" | "lg";
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    (
        {
            label,
            helperText,
            error,
            success,
            type = "date",
            required,
            size = "md",
            className = "",
            id,
            disabled,
            ...rest
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const hasError = !!error;
        const hasSuccess = !!success && !hasError;

        const getBorderColor = () => {
            if (hasError) return "var(--color-error)";
            if (hasSuccess) return "var(--color-success)";
            return "var(--border-secondary)";
        };

        const padMap = { sm: "8px 36px 8px 12px", md: "11px 40px 11px 16px", lg: "14px 44px 14px 20px" };
        const fontMap = { sm: "0.8125rem", md: "0.9375rem", lg: "1.0625rem" };

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {label && (
                    <label
                        htmlFor={inputId}
                        style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: hasError ? "var(--color-error)" : "var(--text-primary)",
                            letterSpacing: "0.01em",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        {label}
                        {required && <span style={{ color: "var(--color-error)" }}>*</span>}
                    </label>
                )}

                <div style={{ position: "relative" }}>
                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        className={`form-control ${className}`}
                        style={{
                            width: "100%",
                            padding: padMap[size],
                            border: `1.5px solid ${getBorderColor()}`,
                            borderRadius: "var(--radius-md)",
                            background: disabled ? "var(--bg-tertiary)" : "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontSize: fontMap[size],
                            outline: "none",
                            transition: "all var(--transition-base)",
                            boxShadow: "var(--shadow-xs)",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.6 : 1,
                            colorScheme: "light",
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
                    <span
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            color: hasError ? "var(--color-error)" : hasSuccess ? "var(--color-success)" : "var(--text-tertiary)",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {hasError ? (
                            <FiAlertCircle size={16} />
                        ) : hasSuccess ? (
                            <FiCheckCircle size={16} />
                        ) : (
                            <FiCalendar size={16} />
                        )}
                    </span>
                </div>

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
                        {error || success || helperText}
                    </p>
                )}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";
export default DatePicker;