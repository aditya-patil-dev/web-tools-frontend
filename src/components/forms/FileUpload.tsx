"use client";

import React, { useState, useRef, useId } from "react";
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle, FiImage } from "react-icons/fi";

interface UploadedFile {
    file: File;
    id: string;
    preview?: string;
    status: "uploading" | "done" | "error";
    progress?: number;
}

interface FileUploadProps {
    label?: string;
    helperText?: string;
    error?: string;
    accept?: string;
    multiple?: boolean;
    maxSizeMB?: number;
    maxFiles?: number;
    onFilesChange?: (files: File[]) => void;
    disabled?: boolean;
    variant?: "default" | "compact" | "image-only";
}

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    helperText,
    error,
    accept,
    multiple,
    maxSizeMB = 10,
    maxFiles = 10,
    onFilesChange,
    disabled,
    variant = "default",
}) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string>("");
    const hasError = !!error || !!localError;

    const validateAndAdd = (incoming: File[]) => {
        setLocalError("");
        const maxBytes = maxSizeMB * 1024 * 1024;
        const valid: File[] = [];
        const newItems: UploadedFile[] = [];

        for (const f of incoming) {
            if (f.size > maxBytes) {
                setLocalError(`"${f.name}" exceeds the ${maxSizeMB}MB limit.`);
                continue;
            }
            if (files.length + newItems.length >= maxFiles) {
                setLocalError(`Maximum ${maxFiles} files allowed.`);
                break;
            }
            const id = Math.random().toString(36).slice(2);
            const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
            newItems.push({ file: f, id, preview, status: "done" });
            valid.push(f);
        }

        const updated = [...files, ...newItems];
        setFiles(updated);
        onFilesChange?.(updated.map((u) => u.file));
    };

    const removeFile = (fid: string) => {
        const updated = files.filter((f) => f.id !== fid);
        setFiles(updated);
        onFilesChange?.(updated.map((u) => u.file));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        validateAndAdd(Array.from(e.dataTransfer.files));
    };

    const borderColor = isDragging
        ? "var(--color-primary)"
        : hasError
            ? "var(--color-error)"
            : "var(--border-secondary)";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {label && (
                <label
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

            {/* Drop Zone */}
            <div
                onDragEnter={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
                onDragOver={(e) => { e.preventDefault(); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                style={{
                    border: `2px dashed ${borderColor}`,
                    borderRadius: "var(--radius-lg)",
                    padding: variant === "compact" ? "20px 24px" : "36px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    cursor: disabled ? "not-allowed" : "pointer",
                    background: isDragging
                        ? "rgba(255,107,53,0.04)"
                        : hasError
                            ? "rgba(239,68,68,0.02)"
                            : "var(--bg-secondary)",
                    transition: "all var(--transition-base)",
                    opacity: disabled ? 0.6 : 1,
                    textAlign: "center",
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    id={id}
                    accept={accept}
                    multiple={multiple}
                    style={{ display: "none" }}
                    onChange={(e) => validateAndAdd(Array.from(e.target.files || []))}
                />
                <div
                    style={{
                        width: variant === "compact" ? 40 : 56,
                        height: variant === "compact" ? 40 : 56,
                        borderRadius: "var(--radius-xl)",
                        background: isDragging ? "rgba(255,107,53,0.12)" : "var(--bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all var(--transition-base)",
                    }}
                >
                    <FiUploadCloud
                        size={variant === "compact" ? 20 : 28}
                        color={isDragging ? "var(--color-primary)" : "var(--text-tertiary)"}
                    />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        Drop files here or{" "}
                        <span style={{ color: "var(--color-primary)", textDecoration: "underline" }}>browse</span>
                    </p>
                    {variant !== "compact" && (
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                            {accept ? `Supports: ${accept}` : "All file types supported"} · Max {maxSizeMB}MB
                            {multiple ? ` · Up to ${maxFiles} files` : ""}
                        </p>
                    )}
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {files.map((f) => (
                        <div
                            key={f.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 14px",
                                border: "1.5px solid var(--border-primary)",
                                borderRadius: "var(--radius-md)",
                                background: "var(--bg-primary)",
                                boxShadow: "var(--shadow-xs)",
                            }}
                        >
                            {/* Thumbnail or Icon */}
                            {f.preview ? (
                                <img
                                    src={f.preview}
                                    alt={f.file.name}
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "var(--radius-sm)",
                                        background: "var(--bg-tertiary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <FiFile size={18} color="var(--text-tertiary)" />
                                </div>
                            )}

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "0.875rem",
                                        fontWeight: 500,
                                        color: "var(--text-primary)",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {f.file.name}
                                </p>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                                    {formatSize(f.file.size)}
                                </p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {f.status === "done" && <FiCheckCircle size={16} color="var(--color-success)" />}
                                {f.status === "error" && <FiAlertCircle size={16} color="var(--color-error)" />}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--text-tertiary)",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "4px",
                                        borderRadius: "var(--radius-sm)",
                                        transition: "color var(--transition-fast)",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(error || localError || helperText) && (
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
                    {error || localError || helperText}
                </p>
            )}
        </div>
    );
};

export default FileUpload;