"use client";

import React, { useState, useId } from "react";

interface RangeSliderProps {
    label?: string;
    helperText?: string;
    error?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (value: number) => void;
    disabled?: boolean;
    showValue?: boolean;
    showMinMax?: boolean;
    formatValue?: (val: number) => string;
    color?: string;
    size?: "sm" | "md" | "lg";
    marks?: { value: number; label: string }[];
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
    label,
    helperText,
    error,
    min = 0,
    max = 100,
    step = 1,
    value = 50,
    onChange,
    disabled,
    showValue = true,
    showMinMax,
    formatValue = (v) => String(v),
    color = "var(--color-primary)",
    size = "md",
    marks,
}) => {
    const id = useId();
    const hasError = !!error;
    const percent = ((value - min) / (max - min)) * 100;

    const trackH = size === "sm" ? 4 : size === "lg" ? 8 : 6;
    const thumbSize = size === "sm" ? 16 : size === "lg" ? 24 : 20;
    const fontSize = size === "sm" ? "0.8125rem" : size === "lg" ? "1.0625rem" : "0.9375rem";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(label || showValue) && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {label && (
                        <label
                            htmlFor={id}
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
                    {showValue && (
                        <span
                            style={{
                                fontSize: "0.875rem",
                                fontWeight: 700,
                                color: color,
                                background: `${color}18`,
                                padding: "2px 10px",
                                borderRadius: "var(--radius-full)",
                                border: `1px solid ${color}33`,
                            }}
                        >
                            {formatValue(value)}
                        </span>
                    )}
                </div>
            )}

            <div style={{ position: "relative", paddingBottom: marks ? "24px" : 0 }}>
                {/* Track background */}
                <div
                    style={{
                        position: "relative",
                        height: trackH,
                        background: "var(--color-slate-200)",
                        borderRadius: trackH / 2,
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                >
                    {/* Fill */}
                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            height: "100%",
                            width: `${percent}%`,
                            background: hasError ? "var(--color-error)" : color,
                            borderRadius: trackH / 2,
                            transition: "width 0.1s",
                            boxShadow: `0 0 8px ${color}55`,
                        }}
                    />
                </div>

                {/* Hidden native range for interaction */}
                <input
                    id={id}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange?.(Number(e.target.value))}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: trackH,
                        opacity: 0,
                        cursor: disabled ? "not-allowed" : "pointer",
                        margin: 0,
                        padding: 0,
                        zIndex: 2,
                    }}
                />

                {/* Custom Thumb */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: `calc(${percent}% - ${thumbSize / 2}px)`,
                        width: thumbSize,
                        height: thumbSize,
                        borderRadius: "50%",
                        background: "#fff",
                        border: `2px solid ${hasError ? "var(--color-error)" : color}`,
                        boxShadow: `0 2px 8px rgba(0,0,0,0.15), 0 0 0 3px ${color}22`,
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        transition: "left 0.1s",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            width: thumbSize * 0.35,
                            height: thumbSize * 0.35,
                            borderRadius: "50%",
                            background: color,
                        }}
                    />
                </div>

                {/* Marks */}
                {marks && (
                    <div
                        style={{
                            position: "absolute",
                            top: trackH + 10,
                            left: 0,
                            right: 0,
                            display: "flex",
                            justifyContent: "space-between",
                            pointerEvents: "none",
                        }}
                    >
                        {marks.map((mark) => {
                            const markPercent = ((mark.value - min) / (max - min)) * 100;
                            return (
                                <div
                                    key={mark.value}
                                    style={{
                                        position: "absolute",
                                        left: `${markPercent}%`,
                                        transform: "translateX(-50%)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 2,
                                            height: 6,
                                            background: mark.value === value ? color : "var(--color-slate-300)",
                                            borderRadius: 1,
                                        }}
                                    />
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                                        {mark.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showMinMax && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{formatValue(min)}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>{formatValue(max)}</span>
                </div>
            )}

            {(error || helperText) && (
                <p style={{ fontSize: "0.8rem", margin: 0, color: hasError ? "var(--color-error)" : "var(--text-tertiary)" }}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default RangeSlider;