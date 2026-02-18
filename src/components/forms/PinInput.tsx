"use client";

import React, { useRef, useState, useId } from "react";

interface PinInputProps {
    label?: string;
    helperText?: string;
    error?: string;
    length?: number;
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    type?: "numeric" | "alphanumeric";
    masked?: boolean;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    autoFocus?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
    label,
    helperText,
    error,
    length = 6,
    value = "",
    onChange,
    onComplete,
    type = "numeric",
    masked,
    disabled,
    size = "md",
    autoFocus,
}) => {
    const id = useId();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const hasError = !!error;

    const digits = Array.from({ length }, (_, i) => value[i] || "");

    const dimMap = {
        sm: { box: 40, font: "1.1rem" },
        md: { box: 52, font: "1.4rem" },
        lg: { box: 64, font: "1.8rem" },
    };
    const d = dimMap[size];

    const handleInput = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const char = e.target.value.slice(-1);
        if (!char) return;
        const isValid =
            type === "numeric"
                ? /^\d$/.test(char)
                : /^[a-zA-Z0-9]$/.test(char);
        if (!isValid) return;

        const updated = [...digits];
        updated[idx] = char.toUpperCase();
        const newVal = updated.join("");
        onChange?.(newVal);
        if (newVal.length === length) onComplete?.(newVal);
        if (idx < length - 1) inputsRef.current[idx + 1]?.focus();
    };

    const handleKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[idx]) {
                const updated = [...digits];
                updated[idx] = "";
                onChange?.(updated.join(""));
            } else if (idx > 0) {
                inputsRef.current[idx - 1]?.focus();
                const updated = [...digits];
                updated[idx - 1] = "";
                onChange?.(updated.join(""));
            }
        }
        if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
        if (e.key === "ArrowRight" && idx < length - 1) inputsRef.current[idx + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").slice(0, length);
        const filtered = pasted
            .split("")
            .filter((c) =>
                type === "numeric" ? /\d/.test(c) : /[a-zA-Z0-9]/.test(c)
            )
            .join("")
            .toUpperCase();
        onChange?.(filtered.padEnd(value.length, "").slice(0, length) || filtered);
        if (filtered.length === length) onComplete?.(filtered);
        const focusIdx = Math.min(filtered.length, length - 1);
        inputsRef.current[focusIdx]?.focus();
    };

    const borderColor = (filled: boolean, focused: boolean) => {
        if (hasError) return "var(--color-error)";
        if (focused) return "var(--color-primary)";
        if (filled) return "var(--color-primary)";
        return "var(--border-secondary)";
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
            {label && (
                <label
                    htmlFor={`${id}-0`}
                    style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: hasError ? "var(--color-error)" : "var(--text-primary)",
                        letterSpacing: "0.01em",
                    }}
                >
                    {label}
                </label>
            )}

            <div style={{ display: "flex", gap: size === "sm" ? "8px" : "12px" }}>
                {digits.map((digit, idx) => (
                    <input
                        key={idx}
                        ref={(el) => { inputsRef.current[idx] = el; }}
                        id={idx === 0 ? `${id}-0` : undefined}
                        type={masked ? "password" : "text"}
                        inputMode={type === "numeric" ? "numeric" : "text"}
                        maxLength={2}
                        value={digit}
                        disabled={disabled}
                        autoFocus={autoFocus && idx === 0}
                        onChange={(e) => handleInput(idx, e)}
                        onKeyDown={(e) => handleKey(idx, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => {
                            e.target.style.borderColor = "var(--color-primary)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.18)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = hasError ? "var(--color-error)" : digit ? "var(--color-primary)" : "var(--border-secondary)";
                            e.target.style.boxShadow = digit ? "0 2px 8px rgba(255,107,53,0.2)" : "var(--shadow-xs)";
                        }}
                        style={{
                            width: d.box,
                            height: d.box,
                            textAlign: "center",
                            fontSize: d.font,
                            fontWeight: 700,
                            fontFamily: "monospace",
                            border: `2px solid ${hasError ? "var(--color-error)" : digit ? "var(--color-primary)" : "var(--border-secondary)"}`,
                            borderRadius: "var(--radius-md)",
                            background: digit ? "rgba(255,107,53,0.04)" : "var(--bg-primary)",
                            color: "var(--text-primary)",
                            outline: "none",
                            cursor: disabled ? "not-allowed" : "text",
                            opacity: disabled ? 0.5 : 1,
                            transition: "all var(--transition-base)",
                            boxShadow: digit ? "0 2px 8px rgba(255,107,53,0.2)" : "var(--shadow-xs)",
                            letterSpacing: "0.1em",
                        }}
                    />
                ))}
            </div>

            {(error || helperText) && (
                <p
                    style={{
                        fontSize: "0.8rem",
                        margin: 0,
                        color: hasError ? "var(--color-error)" : "var(--text-tertiary)",
                    }}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default PinInput;