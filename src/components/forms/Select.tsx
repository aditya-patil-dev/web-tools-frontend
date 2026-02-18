"use client";

import React, { forwardRef, useId } from "react";
import { FiChevronDown, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface SelectGroup {
    label: string;
    options: SelectOption[];
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    options?: SelectOption[];
    groups?: SelectGroup[];
    placeholder?: string;
    size?: "sm" | "md" | "lg";
    required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            helperText,
            error,
            success,
            options,
            groups,
            placeholder = "Select an option",
            size = "md",
            required,
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
                            fontSize: size === "lg" ? "1rem" : "0.875rem",
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
                    <select
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={`form-select ${className}`}
                        style={{
                            width: "100%",
                            padding: padMap[size],
                            border: `1.5px solid ${getBorderColor()}`,
                            borderRadius: "var(--radius-md)",
                            background: disabled ? "var(--bg-tertiary)" : "var(--bg-primary)",
                            color: "var(--text-primary)",
                            fontSize: fontMap[size],
                            outline: "none",
                            appearance: "none",
                            WebkitAppearance: "none",
                            transition: "all var(--transition-base)",
                            boxShadow: "var(--shadow-xs)",
                            cursor: disabled ? "not-allowed" : "pointer",
                            opacity: disabled ? 0.6 : 1,
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
                    >
                        <option value="" disabled>
                            {placeholder}
                        </option>

                        {options?.map((opt) => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                {opt.label}
                            </option>
                        ))}

                        {groups?.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                                {group.options.map((opt) => (
                                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                        {opt.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

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
                            gap: "6px",
                        }}
                    >
                        {hasError && <FiAlertCircle size={15} />}
                        {hasSuccess && <FiCheckCircle size={15} />}
                        {!hasError && !hasSuccess && <FiChevronDown size={15} />}
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
                        {!hasError && !hasSuccess && helperText && <FiInfo size={13} />}
                        {error || success || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";
export default Select;