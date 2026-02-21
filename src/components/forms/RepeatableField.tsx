"use client";

/**
 * RepeatableField
 * ───────────────────────────────────────────────────────
 * A generic, reusable component for managing dynamic lists
 * of structured form fields (features, FAQs, links, etc.)
 *
 * Usage example:
 *
 *   type Feature = { title: string; description: string };
 *
 *   <RepeatableField<Feature>
 *     items={features}
 *     onChange={setFeatures}
 *     defaultItem={{ title: "", description: "" }}
 *     addLabel="Add Feature"
 *     fields={[
 *       { key: "title",       label: "Feature Title", type: "input",    placeholder: "e.g., Real-time Responses" },
 *       { key: "description", label: "Description",   type: "textarea", placeholder: "Describe this feature..." },
 *     ]}
 *   />
 */

import React from "react";
import styles from "./RepeatableField.module.css";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type FieldDefinition<T> = {
    /** Key of the item object this field maps to */
    key: keyof T;
    /** Label shown above the input */
    label: string;
    /** Input type */
    type: "input" | "textarea";
    /** HTML input type for "input" fields (default: "text") */
    inputType?: string;
    placeholder?: string;
    required?: boolean;
    /** Max character length */
    maxLength?: number;
    /** Helper text shown below the field */
    helperText?: string;
    /** Minimum rows for textarea */
    minRows?: number;
};

export type RepeatableFieldProps<T extends Record<string, unknown>> = {
    /** The current array of items */
    items: T[];
    /** Called whenever items change */
    onChange: (items: T[]) => void;
    /** A factory function OR plain object used to create a new empty item */
    defaultItem: T | (() => T);
    /** Field configuration */
    fields: FieldDefinition<T>[];
    /** Label for the add button */
    addLabel?: string;
    /** Max items allowed (undefined = unlimited) */
    maxItems?: number;
    /** Whether to show the item index badge */
    showIndex?: boolean;
    /** Custom empty state message */
    emptyMessage?: string;
    /** Extra className for the outer wrapper */
    className?: string;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function makeDefault<T>(defaultItem: T | (() => T)): T {
    return typeof defaultItem === "function"
        ? (defaultItem as () => T)()
        : { ...defaultItem };
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function RepeatableField<T extends Record<string, unknown>>({
    items,
    onChange,
    defaultItem,
    fields,
    addLabel = "Add Item",
    maxItems,
    showIndex = true,
    className = "",
}: RepeatableFieldProps<T>) {

    // ── Update a single field of a single item ──
    const handleChange = (index: number, key: keyof T, value: string) => {
        onChange(
            items.map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            )
        );
    };

    // ── Add a new empty item ──
    const handleAdd = () => {
        if (maxItems && items.length >= maxItems) return;
        onChange([...items, makeDefault(defaultItem)]);
    };

    // ── Remove an item (keeps at least one empty row) ──
    const handleRemove = (index: number) => {
        if (items.length === 1) {
            onChange([makeDefault(defaultItem)]);
        } else {
            onChange(items.filter((_, i) => i !== index));
        }
    };

    const canAdd = !maxItems || items.length < maxItems;

    return (
        <div className={`${styles.list} ${className}`}>

            {/* ── Item cards ── */}
            {items.map((item, index) => (
                <div key={index} className={styles.card}>

                    {/* Index badge */}
                    {showIndex && (
                        <span className={styles.index} aria-hidden="true">
                            {index + 1}
                        </span>
                    )}

                    {/* Remove button */}
                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemove(index)}
                        aria-label={`Remove item ${index + 1}`}
                        title="Remove"
                    >
                        ✕
                    </button>

                    {/* Fields */}
                    <div className={styles.fields}>
                        {fields.map((field) => {
                            const value = String(item[field.key] ?? "");
                            const fieldId = `repeatable-${index}-${String(field.key)}`;

                            return (
                                <div key={String(field.key)}>
                                    <label
                                        htmlFor={fieldId}
                                        style={{
                                            display: "block",
                                            fontSize: "var(--font-sm)",
                                            fontWeight: 600,
                                            color: "var(--text-primary)",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        {field.label}
                                        {field.required && (
                                            <span style={{ color: "var(--color-error)", marginLeft: "3px" }}>*</span>
                                        )}
                                    </label>

                                    {field.type === "textarea" ? (
                                        <textarea
                                            id={fieldId}
                                            value={value}
                                            placeholder={field.placeholder}
                                            maxLength={field.maxLength}
                                            rows={field.minRows ?? 3}
                                            onChange={(e) => handleChange(index, field.key, e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "10px 12px",
                                                borderRadius: "var(--radius-lg)",
                                                border: "1px solid var(--border-primary)",
                                                background: "var(--bg-primary)",
                                                color: "var(--text-primary)",
                                                fontSize: "var(--font-sm)",
                                                lineHeight: 1.6,
                                                resize: "vertical",
                                                outline: "none",
                                                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                                                fontFamily: "inherit",
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "var(--color-primary)";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.12)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "var(--border-primary)";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    ) : (
                                        <input
                                            id={fieldId}
                                            type={field.inputType ?? "text"}
                                            value={value}
                                            placeholder={field.placeholder}
                                            maxLength={field.maxLength}
                                            onChange={(e) => handleChange(index, field.key, e.target.value)}
                                            style={{
                                                width: "100%",
                                                height: "42px",
                                                padding: "0 12px",
                                                borderRadius: "var(--radius-lg)",
                                                border: "1px solid var(--border-primary)",
                                                background: "var(--bg-primary)",
                                                color: "var(--text-primary)",
                                                fontSize: "var(--font-sm)",
                                                outline: "none",
                                                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                                                fontFamily: "inherit",
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = "var(--color-primary)";
                                                e.target.style.boxShadow = "0 0 0 3px rgba(255,107,53,0.12)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = "var(--border-primary)";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    )}

                                    {/* Helper text */}
                                    {field.helperText && (
                                        <p
                                            style={{
                                                marginTop: "5px",
                                                fontSize: "var(--font-xs)",
                                                color: "var(--text-tertiary)",
                                            }}
                                        >
                                            {field.helperText}
                                        </p>
                                    )}

                                    {/* Char count */}
                                    {field.maxLength && (
                                        <p
                                            style={{
                                                marginTop: "4px",
                                                fontSize: "var(--font-xs)",
                                                color:
                                                    value.length > field.maxLength * 0.9
                                                        ? "var(--color-warning)"
                                                        : "var(--text-tertiary)",
                                                textAlign: "right",
                                            }}
                                        >
                                            {value.length} / {field.maxLength}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* ── Add button ── */}
            {canAdd && (
                <button type="button" className={styles.addBtn} onClick={handleAdd}>
                    <span className={styles.addIcon} aria-hidden="true">+</span>
                    {addLabel}
                    {maxItems && (
                        <span
                            style={{
                                marginLeft: "auto",
                                fontSize: "var(--font-xs)",
                                color: "var(--text-tertiary)",
                                fontWeight: 500,
                            }}
                        >
                            {items.length} / {maxItems}
                        </span>
                    )}
                </button>
            )}

            {/* ── Max reached notice ── */}
            {maxItems && items.length >= maxItems && (
                <p
                    style={{
                        textAlign: "center",
                        fontSize: "var(--font-xs)",
                        color: "var(--text-tertiary)",
                        marginTop: "4px",
                    }}
                >
                    Maximum of {maxItems} items reached
                </p>
            )}
        </div>
    );
}

export default RepeatableField;