"use client";

import React, { useId } from "react";

interface ToggleProps {
    label?: string;
    description?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    color?: string;
    labelPosition?: "left" | "right";
    error?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
    label,
    description,
    checked = false,
    onChange,
    disabled,
    size = "md",
    color = "var(--color-primary)",
    labelPosition = "right",
    error,
}) => {
    const id = useId();

    const dims = {
        sm: { track: [36, 20], thumb: 14, translate: 16, font: "0.8125rem", desc: "0.75rem" },
        md: { track: [46, 26], thumb: 18, translate: 20, font: "0.9375rem", desc: "0.8125rem" },
        lg: { track: [56, 32], thumb: 24, translate: 24, font: "1.0625rem", desc: "0.875rem" },
    };
    const d = dims[size];

    const trackStyle: React.CSSProperties = {
        width: d.track[0],
        height: d.track[1],
        minWidth: d.track[0],
        borderRadius: d.track[1] / 2,
        background: checked ? color : "var(--color-slate-300)",
        position: "relative",
        transition: "background var(--transition-base)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: checked ? `0 2px 8px ${color}55` : "none",
    };

    const thumbStyle: React.CSSProperties = {
        position: "absolute",
        top: (d.track[1] - d.thumb) / 2,
        left: checked ? d.translate : (d.track[1] - d.thumb) / 2,
        width: d.thumb,
        height: d.thumb,
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        transition: "left var(--transition-bounce)",
    };

    const handleClick = () => {
        if (!disabled) onChange?.(!checked);
    };

    const textContent = (label || description) && (
        <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {label && (
                <span style={{ fontSize: d.font, fontWeight: 500, color: disabled ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                    {label}
                </span>
            )}
            {description && (
                <span style={{ fontSize: d.desc, color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                    {description}
                </span>
            )}
        </span>
    );

    return (
        <div>
            <div
                style={{ display: "flex", alignItems: "center", gap: "12px", cursor: disabled ? "not-allowed" : "pointer" }}
                onClick={handleClick}
            >
                {labelPosition === "left" && textContent}
                <input type="checkbox" id={id} checked={checked} onChange={() => { }} style={{ display: "none" }} />
                <div style={trackStyle}>
                    <div style={thumbStyle} />
                </div>
                {labelPosition === "right" && textContent}
            </div>
            {error && (
                <p style={{ fontSize: "0.8rem", color: "var(--color-error)", margin: "4px 0 0 0" }}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default Toggle;