"use client";

import React, { useId } from "react";

interface RadioOption {
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface RadioGroupProps {
    label?: string;
    options: RadioOption[];
    value?: string | number;
    onChange?: (value: string | number) => void;
    error?: string;
    helperText?: string;
    required?: boolean;
    orientation?: "vertical" | "horizontal";
    variant?: "default" | "card" | "button";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    name?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    label,
    options,
    value,
    onChange,
    error,
    helperText,
    required,
    orientation = "vertical",
    variant = "default",
    size = "md",
    disabled,
    name,
}) => {
    const groupId = useId();
    const groupName = name || groupId;
    const hasError = !!error;

    const dotSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;
    const innerDot = size === "sm" ? 6 : size === "lg" ? 10 : 8;
    const fontSize = size === "sm" ? "0.8125rem" : size === "lg" ? "1.0625rem" : "0.9375rem";

    return (
        <div>
            {label && (
                <p
                    style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: hasError ? "var(--color-error)" : "var(--text-primary)",
                        marginBottom: "10px",
                        letterSpacing: "0.01em",
                    }}
                >
                    {label}
                    {required && <span style={{ color: "var(--color-error)", marginLeft: "3px" }}>*</span>}
                </p>
            )}

            <div
                style={{
                    display: "flex",
                    flexDirection: variant === "button" ? "row" : orientation === "horizontal" ? "row" : "column",
                    gap: variant === "button" ? "0" : variant === "card" ? "10px" : "10px",
                    flexWrap: "wrap",
                    border: variant === "button" ? `1.5px solid var(--border-secondary)` : "none",
                    borderRadius: variant === "button" ? "var(--radius-md)" : 0,
                    overflow: variant === "button" ? "hidden" : "visible",
                }}
            >
                {options.map((opt, idx) => {
                    const isSelected = value === opt.value;
                    const isDisabled = disabled || opt.disabled;
                    const optId = `${groupName}-${idx}`;

                    if (variant === "button") {
                        return (
                            <label
                                key={opt.value}
                                htmlFor={optId}
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    padding: size === "sm" ? "7px 14px" : size === "lg" ? "12px 22px" : "9px 18px",
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    fontSize,
                                    fontWeight: 500,
                                    background: isSelected ? "var(--color-primary)" : "var(--bg-primary)",
                                    color: isSelected ? "#fff" : "var(--text-secondary)",
                                    borderRight: idx < options.length - 1 ? `1px solid var(--border-secondary)` : "none",
                                    transition: "all var(--transition-base)",
                                    userSelect: "none",
                                    opacity: isDisabled ? 0.5 : 1,
                                }}
                            >
                                <input
                                    type="radio"
                                    id={optId}
                                    name={groupName}
                                    value={opt.value}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => onChange?.(opt.value)}
                                    style={{ display: "none" }}
                                />
                                {opt.label}
                            </label>
                        );
                    }

                    if (variant === "card") {
                        return (
                            <label
                                key={opt.value}
                                htmlFor={optId}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                    padding: "14px 16px",
                                    border: `1.5px solid ${isSelected ? "var(--color-primary)" : hasError ? "var(--color-error)" : "var(--border-secondary)"}`,
                                    borderRadius: "var(--radius-md)",
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    background: isSelected ? "rgba(255,107,53,0.04)" : "var(--bg-primary)",
                                    transition: "all var(--transition-base)",
                                    userSelect: "none",
                                    opacity: isDisabled ? 0.5 : 1,
                                    boxShadow: isSelected ? "0 0 0 3px rgba(255,107,53,0.12)" : "var(--shadow-xs)",
                                }}
                            >
                                <input
                                    type="radio"
                                    id={optId}
                                    name={groupName}
                                    value={opt.value}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => onChange?.(opt.value)}
                                    style={{ display: "none" }}
                                />
                                {/* Custom Radio */}
                                <span
                                    style={{
                                        width: dotSize,
                                        height: dotSize,
                                        minWidth: dotSize,
                                        borderRadius: "50%",
                                        border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--border-secondary)"}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--bg-primary)",
                                        transition: "all var(--transition-base)",
                                        marginTop: "2px",
                                    }}
                                >
                                    {isSelected && (
                                        <span
                                            style={{
                                                width: innerDot,
                                                height: innerDot,
                                                borderRadius: "50%",
                                                background: "var(--color-primary)",
                                            }}
                                        />
                                    )}
                                </span>
                                <span style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        {opt.icon && <span style={{ color: isSelected ? "var(--color-primary)" : "var(--text-tertiary)" }}>{opt.icon}</span>}
                                        <span style={{ fontSize, fontWeight: 600, color: "var(--text-primary)" }}>{opt.label}</span>
                                    </span>
                                    {opt.description && (
                                        <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                                            {opt.description}
                                        </span>
                                    )}
                                </span>
                            </label>
                        );
                    }

                    // Default
                    return (
                        <label
                            key={opt.value}
                            htmlFor={optId}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                userSelect: "none",
                                opacity: isDisabled ? 0.5 : 1,
                            }}
                        >
                            <input
                                type="radio"
                                id={optId}
                                name={groupName}
                                value={opt.value}
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => onChange?.(opt.value)}
                                style={{ display: "none" }}
                            />
                            <span
                                style={{
                                    width: dotSize,
                                    height: dotSize,
                                    minWidth: dotSize,
                                    borderRadius: "50%",
                                    border: `2px solid ${isSelected ? "var(--color-primary)" : hasError ? "var(--color-error)" : "var(--border-secondary)"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "var(--bg-primary)",
                                    transition: "all var(--transition-base)",
                                    marginTop: "2px",
                                    boxShadow: isSelected ? "0 2px 6px rgba(255,107,53,0.3)" : "none",
                                }}
                            >
                                {isSelected && (
                                    <span
                                        style={{
                                            width: innerDot,
                                            height: innerDot,
                                            borderRadius: "50%",
                                            background: "var(--color-primary)",
                                        }}
                                    />
                                )}
                            </span>
                            <span style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "1px" }}>
                                <span style={{ fontSize, fontWeight: 500, color: "var(--text-primary)" }}>{opt.label}</span>
                                {opt.description && (
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>{opt.description}</span>
                                )}
                            </span>
                        </label>
                    );
                })}
            </div>

            {(error || helperText) && (
                <p
                    style={{
                        fontSize: "0.8rem",
                        marginTop: "6px",
                        color: hasError ? "var(--color-error)" : "var(--text-tertiary)",
                    }}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default RadioGroup;