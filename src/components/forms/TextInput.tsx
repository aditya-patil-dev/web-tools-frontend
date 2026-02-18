"use client";

import React, { forwardRef, useState, useId } from "react";
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

type InputType = "text" | "email" | "password" | "tel" | "url" | "search" | "number";
type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "filled" | "flushed";

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    helperText?: string;
    error?: string;
    success?: string;
    type?: InputType;
    size?: InputSize;
    variant?: InputVariant;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    leftAddon?: string;
    rightAddon?: string;
    required?: boolean;
    isLoading?: boolean;
    showCharCount?: boolean;
    maxLength?: number;
}

const sizeMap = {
    sm: { input: "py-2 px-3 text-sm", label: "text-xs", icon: "14px" },
    md: { input: "py-2-5 px-4 text-base", label: "text-sm", icon: "16px" },
    lg: { input: "py-3 px-5 text-lg", label: "text-base", icon: "18px" },
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            label,
            helperText,
            error,
            success,
            type = "text",
            size = "md",
            variant = "default",
            leftIcon,
            rightIcon,
            leftAddon,
            rightAddon,
            required,
            isLoading,
            showCharCount,
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
        const [showPassword, setShowPassword] = useState(false);
        const [charCount, setCharCount] = useState(
            typeof value === "string" ? value.length : 0
        );

        const isPassword = type === "password";
        const actualType = isPassword && showPassword ? "text" : type;
        const hasError = !!error;
        const hasSuccess = !!success && !hasError;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setCharCount(e.target.value.length);
            onChange?.(e);
        };

        const getBorderColor = () => {
            if (hasError) return "var(--color-error)";
            if (hasSuccess) return "var(--color-success)";
            return "var(--border-secondary)";
        };

        const getFocusBorderColor = () => {
            if (hasError) return "var(--color-error)";
            if (hasSuccess) return "var(--color-success)";
            return "var(--color-primary)";
        };

        return (
            <div className="form-field" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {label && (
                    <label
                        htmlFor={inputId}
                        style={{
                            fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "1rem" : "0.875rem",
                            fontWeight: 600,
                            color: hasError ? "var(--color-error)" : "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            letterSpacing: "0.01em",
                        }}
                    >
                        {label}
                        {required && (
                            <span style={{ color: "var(--color-error)", marginLeft: "2px" }}>*</span>
                        )}
                    </label>
                )}

                <div style={{ display: "flex", alignItems: "stretch", position: "relative" }}>
                    {leftAddon && (
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                background: "var(--bg-tertiary)",
                                border: `1.5px solid ${getBorderColor()}`,
                                borderRight: "none",
                                borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
                                fontSize: "0.875rem",
                                color: "var(--text-secondary)",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {leftAddon}
                        </span>
                    )}

                    <div style={{ position: "relative", flex: 1 }}>
                        {leftIcon && (
                            <span
                                style={{
                                    position: "absolute",
                                    left: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: hasError ? "var(--color-error)" : "var(--text-tertiary)",
                                    display: "flex",
                                    alignItems: "center",
                                    pointerEvents: "none",
                                    zIndex: 1,
                                }}
                            >
                                {leftIcon}
                            </span>
                        )}

                        <input
                            ref={ref}
                            id={inputId}
                            type={actualType}
                            value={value}
                            onChange={handleChange}
                            disabled={disabled || isLoading}
                            maxLength={maxLength}
                            className={`form-control custom-input ${className}`}
                            style={{
                                width: "100%",
                                padding:
                                    size === "sm"
                                        ? "8px 12px"
                                        : size === "lg"
                                            ? "14px 20px"
                                            : "11px 16px",
                                paddingLeft: leftIcon ? "40px" : undefined,
                                paddingRight:
                                    isPassword || rightIcon || hasError || hasSuccess
                                        ? "42px"
                                        : undefined,
                                border:
                                    variant === "flushed"
                                        ? "none"
                                        : `1.5px solid ${getBorderColor()}`,
                                borderBottom:
                                    variant === "flushed"
                                        ? `2px solid ${getBorderColor()}`
                                        : undefined,
                                borderRadius:
                                    variant === "flushed"
                                        ? 0
                                        : leftAddon && rightAddon
                                            ? 0
                                            : leftAddon
                                                ? "0 var(--radius-md) var(--radius-md) 0"
                                                : rightAddon
                                                    ? "var(--radius-md) 0 0 var(--radius-md)"
                                                    : "var(--radius-md)",
                                background:
                                    variant === "filled"
                                        ? "var(--bg-tertiary)"
                                        : variant === "flushed"
                                            ? "transparent"
                                            : disabled
                                                ? "var(--bg-tertiary)"
                                                : "var(--bg-primary)",
                                color: "var(--text-primary)",
                                fontSize:
                                    size === "sm"
                                        ? "0.8125rem"
                                        : size === "lg"
                                            ? "1.0625rem"
                                            : "0.9375rem",
                                outline: "none",
                                transition: "all var(--transition-base)",
                                boxShadow: variant !== "flushed" ? "var(--shadow-xs)" : "none",
                                opacity: disabled ? 0.6 : 1,
                                cursor: disabled ? "not-allowed" : "text",
                            }}
                            onFocus={(e) => {
                                if (variant !== "flushed") {
                                    e.target.style.borderColor = getFocusBorderColor();
                                    e.target.style.boxShadow = `0 0 0 3px ${hasError
                                            ? "rgba(239,68,68,0.15)"
                                            : "rgba(255,107,53,0.15)"
                                        }`;
                                } else {
                                    e.target.style.borderBottomColor = getFocusBorderColor();
                                }
                            }}
                            onBlur={(e) => {
                                if (variant !== "flushed") {
                                    e.target.style.borderColor = getBorderColor();
                                    e.target.style.boxShadow = "var(--shadow-xs)";
                                } else {
                                    e.target.style.borderBottomColor = getBorderColor();
                                }
                            }}
                            {...rest}
                        />

                        {/* Right Icon Area */}
                        <span
                            style={{
                                position: "absolute",
                                right: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: hasError
                                    ? "var(--color-error)"
                                    : hasSuccess
                                        ? "var(--color-success)"
                                        : "var(--text-tertiary)",
                            }}
                        >
                            {isLoading && (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    style={{ width: "14px", height: "14px", color: "var(--color-primary)" }}
                                />
                            )}
                            {!isLoading && hasError && <FiAlertCircle size={16} />}
                            {!isLoading && hasSuccess && <FiCheckCircle size={16} />}
                            {!isLoading && !hasError && !hasSuccess && rightIcon}
                            {isPassword && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        color: "var(--text-tertiary)",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            )}
                        </span>
                    </div>

                    {rightAddon && (
                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "0 14px",
                                background: "var(--bg-tertiary)",
                                border: `1.5px solid ${getBorderColor()}`,
                                borderLeft: "none",
                                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                                fontSize: "0.875rem",
                                color: "var(--text-secondary)",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {rightAddon}
                        </span>
                    )}
                </div>

                {/* Footer Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        {(error || success || helperText) && (
                            <p
                                style={{
                                    fontSize: "0.8rem",
                                    margin: 0,
                                    color: hasError
                                        ? "var(--color-error)"
                                        : hasSuccess
                                            ? "var(--color-success)"
                                            : "var(--text-tertiary)",
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
                        <span
                            style={{
                                fontSize: "0.75rem",
                                color:
                                    charCount > maxLength * 0.9
                                        ? "var(--color-warning)"
                                        : "var(--text-tertiary)",
                            }}
                        >
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        );
    }
);

TextInput.displayName = "TextInput";
export default TextInput;