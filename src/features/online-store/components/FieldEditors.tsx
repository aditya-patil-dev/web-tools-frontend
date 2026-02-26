"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

/* ─────────────────────────────────────────────
   Base styles
───────────────────────────────────────────── */
const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "8px 11px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
    transition: "border-color .15s, box-shadow .15s",
};

const focusOn = { borderColor: "#ff6b35", boxShadow: "0 0 0 3px rgba(255,107,53,.12)" };
const focusOff = { borderColor: "#e2e8f0", boxShadow: "none" };

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
export function FInput({
    label, value, onChange, placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <div style={{ marginBottom: 11 }}>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>
                {label}
            </label>
            <input
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusOn)}
                onBlur={e => Object.assign(e.target.style, focusOff)}
                style={inputBase}
            />
        </div>
    );
}

export function FTextarea({
    label, value, onChange, rows = 3, placeholder,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <div style={{ marginBottom: 11 }}>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>
                {label}
            </label>
            <textarea
                value={value}
                rows={rows}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusOn)}
                onBlur={e => Object.assign(e.target.style, focusOff)}
                style={{ ...inputBase, resize: "vertical", lineHeight: 1.55 }}
            />
        </div>
    );
}

export function FSelect({
    label, value, onChange, options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div style={{ marginBottom: 11 }}>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>
                {label}
            </label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                onFocus={e => Object.assign(e.target.style, focusOn)}
                onBlur={e => Object.assign(e.target.style, focusOff)}
                style={inputBase}
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

/* ─────────────────────────────────────────────
   LAYOUT HELPERS
───────────────────────────────────────────── */
export function FieldDivider({ label }: { label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 10px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>
                {label}
            </span>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
        </div>
    );
}

export function ItemCard({
    header, children,
}: {
    header: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 11px", marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                {header}
            </div>
            {children}
        </div>
    );
}

export function RemoveButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{ padding: "3px 8px", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 6, color: "#e11d48", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}
        >
            <X size={10} /> Remove
        </button>
    );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{ width: "100%", padding: "8px", background: "#f8fafc", border: "1.5px dashed #cbd5e1", borderRadius: 8, fontSize: 13, color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 3 }}
        >
            <Plus size={12} /> {label}
        </button>
    );
}

/* ─────────────────────────────────────────────
   INLINE PLAIN INPUT (no label, for use inside ItemCard rows)
───────────────────────────────────────────── */
export function InlineInput({
    value, onChange, placeholder, style,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}) {
    return (
        <input
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            onFocus={e => Object.assign(e.target.style, focusOn)}
            onBlur={e => Object.assign(e.target.style, focusOff)}
            style={{ ...inputBase, marginBottom: 5, ...style }}
        />
    );
}

export function InlineTextarea({
    value, onChange, rows = 2, placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    placeholder?: string;
}) {
    return (
        <textarea
            value={value}
            rows={rows}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            onFocus={e => Object.assign(e.target.style, focusOn)}
            onBlur={e => Object.assign(e.target.style, focusOff)}
            style={{ ...inputBase, resize: "vertical", lineHeight: 1.55 }}
        />
    );
}