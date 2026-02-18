"use client";

import React, { useState, useRef, useId, useEffect } from "react";
import { FiX, FiChevronDown, FiCheck, FiAlertCircle, FiSearch } from "react-icons/fi";

interface MultiSelectOption {
    value: string | number;
    label: string;
    description?: string;
    color?: string;
}

interface MultiSelectProps {
    label?: string;
    options: MultiSelectOption[];
    value?: (string | number)[];
    onChange?: (value: (string | number)[]) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    searchable?: boolean;
    maxSelected?: number;
    creatable?: boolean;
    size?: "sm" | "md" | "lg";
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    value = [],
    onChange,
    placeholder = "Select options...",
    error,
    helperText,
    required,
    disabled,
    searchable = true,
    maxSelected,
    creatable,
    size = "md",
}) => {
    const id = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const hasError = !!error;

    const selectedOptions = value.map((v) => options.find((o) => o.value === v)).filter(Boolean) as MultiSelectOption[];

    const filtered = options.filter(
        (o) =>
            o.label.toLowerCase().includes(search.toLowerCase()) ||
            o.description?.toLowerCase().includes(search.toLowerCase())
    );

    const showCreate = creatable && search && !options.find((o) => o.label.toLowerCase() === search.toLowerCase());

    const toggle = (val: string | number) => {
        if (value.includes(val)) {
            onChange?.(value.filter((v) => v !== val));
        } else {
            if (maxSelected && value.length >= maxSelected) return;
            onChange?.([...value, val]);
        }
    };

    const remove = (e: React.MouseEvent, val: string | number) => {
        e.stopPropagation();
        onChange?.(value.filter((v) => v !== val));
    };

    const handleCreate = () => {
        const newVal = search.trim();
        if (!newVal) return;
        onChange?.([...value, newVal]);
        setSearch("");
    };

    useEffect(() => {
        const handleOut = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleOut);
        return () => document.removeEventListener("mousedown", handleOut);
    }, []);

    const padV = size === "sm" ? "6px" : size === "lg" ? "12px" : "9px";
    const padH = size === "sm" ? "10px" : size === "lg" ? "18px" : "14px";

    const tagColor = (opt: MultiSelectOption) => opt.color || "var(--color-primary)";

    return (
        <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                    {required && <span style={{ color: "var(--color-error)", marginLeft: "3px" }}>*</span>}
                </label>
            )}

            {/* Trigger */}
            <div
                id={id}
                onClick={() => !disabled && setOpen(!open)}
                style={{
                    minHeight: size === "sm" ? "38px" : size === "lg" ? "52px" : "44px",
                    padding: `${padV} ${padH}`,
                    paddingRight: "40px",
                    border: `1.5px solid ${open ? "var(--color-primary)" : hasError ? "var(--color-error)" : "var(--border-secondary)"}`,
                    borderRadius: "var(--radius-md)",
                    background: disabled ? "var(--bg-tertiary)" : "var(--bg-primary)",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    alignItems: "center",
                    position: "relative",
                    transition: "all var(--transition-base)",
                    boxShadow: open ? `0 0 0 3px rgba(255,107,53,0.15)` : "var(--shadow-xs)",
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                {selectedOptions.length === 0 && (
                    <span style={{ color: "var(--text-tertiary)", fontSize: size === "sm" ? "0.8125rem" : "0.9375rem" }}>
                        {placeholder}
                    </span>
                )}
                {selectedOptions.map((opt) => (
                    <span
                        key={opt.value}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 10px 3px 8px",
                            borderRadius: "var(--radius-full)",
                            background: `${tagColor(opt)}18`,
                            border: `1px solid ${tagColor(opt)}44`,
                            color: tagColor(opt),
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            lineHeight: 1,
                        }}
                    >
                        {opt.label}
                        <span
                            onClick={(e) => remove(e, opt.value)}
                            style={{ cursor: "pointer", display: "flex", alignItems: "center", opacity: 0.7 }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                        >
                            <FiX size={11} />
                        </span>
                    </span>
                ))}

                <span
                    style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
                        transition: "transform var(--transition-base)",
                        color: "var(--text-tertiary)",
                        display: "flex",
                        pointerEvents: "none",
                    }}
                >
                    <FiChevronDown size={16} />
                </span>
            </div>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        zIndex: 1000,
                        marginTop: "4px",
                        width: "100%",
                        maxHeight: "260px",
                        overflowY: "auto",
                        background: "var(--bg-primary)",
                        border: "1.5px solid var(--border-primary)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-lg)",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {searchable && (
                        <div
                            style={{
                                padding: "10px 12px",
                                borderBottom: "1px solid var(--border-primary)",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                position: "sticky",
                                top: 0,
                                background: "var(--bg-primary)",
                            }}
                        >
                            <FiSearch size={14} color="var(--text-tertiary)" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: "0.875rem",
                                    color: "var(--text-primary)",
                                    flex: 1,
                                }}
                            />
                        </div>
                    )}

                    {maxSelected && (
                        <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                                {value.length}/{maxSelected} selected
                            </span>
                        </div>
                    )}

                    <div>
                        {filtered.length === 0 && !showCreate && (
                            <div style={{ padding: "16px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                                No options found
                            </div>
                        )}

                        {filtered.map((opt) => {
                            const isSelected = value.includes(opt.value);
                            const isDisabled = maxSelected ? !isSelected && value.length >= maxSelected : false;
                            return (
                                <div
                                    key={opt.value}
                                    onClick={() => !isDisabled && toggle(opt.value)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "10px 14px",
                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                        background: isSelected ? "rgba(255,107,53,0.04)" : "transparent",
                                        opacity: isDisabled ? 0.4 : 1,
                                        transition: "background var(--transition-fast)",
                                        borderBottom: "1px solid var(--border-primary)",
                                    }}
                                    onMouseEnter={(e) => { if (!isDisabled) e.currentTarget.style.background = isSelected ? "rgba(255,107,53,0.06)" : "var(--bg-secondary)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? "rgba(255,107,53,0.04)" : "transparent"; }}
                                >
                                    <div
                                        style={{
                                            width: 18,
                                            height: 18,
                                            borderRadius: "4px",
                                            border: `2px solid ${isSelected ? "var(--color-primary)" : "var(--border-secondary)"}`,
                                            background: isSelected ? "var(--color-primary)" : "transparent",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            transition: "all var(--transition-fast)",
                                        }}
                                    >
                                        {isSelected && <FiCheck size={11} color="white" strokeWidth={3} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-primary)" }}>{opt.label}</div>
                                        {opt.description && (
                                            <div style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>{opt.description}</div>
                                        )}
                                    </div>
                                    {opt.color && (
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.color, flexShrink: 0 }} />
                                    )}
                                </div>
                            );
                        })}

                        {showCreate && (
                            <div
                                onClick={handleCreate}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 14px",
                                    cursor: "pointer",
                                    color: "var(--color-primary)",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                }}
                            >
                                + Create "{search}"
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(error || helperText) && (
                <p
                    style={{
                        fontSize: "0.8rem",
                        margin: 0,
                        color: hasError ? "var(--color-error)" : "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    {hasError && <FiAlertCircle size={13} />}
                    {error || helperText}
                </p>
            )}
        </div>
    );
};

export default MultiSelect;