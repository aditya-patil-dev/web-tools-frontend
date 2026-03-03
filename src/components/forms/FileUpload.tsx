"use client";

import React, { useState, useRef, useId } from "react";
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiAlertCircle, FiImage, FiRefreshCw } from "react-icons/fi";

// ─── Shared helpers ────────────────────────────────────────────────────────────

interface LocalUploadedFile {
    file: File;
    id: string;
    preview?: string;
    status: "uploading" | "done" | "error";
    progress?: number;
}

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * "managed" mode  — caller passes an existing URL + an async upload handler.
 *   Used by settings pages (logo, favicon, etc.)
 *
 * "unmanaged" mode — caller gets raw File[] back via onFilesChange.
 *   Used everywhere else.
 */
type ManagedProps = {
    /** Current file URL already saved on the server (logo_url, favicon_url …) */
    value?: string;
    /** Called with the selected File; should upload and persist the URL */
    onUpload: (file: File) => Promise<void>;
    /** Show a spinner while the parent is uploading */
    isUploading?: boolean;
    /** "image" shows a rectangular preview; "icon" shows a small square */
    previewType?: "image" | "icon";
    onFilesChange?: never;
    multiple?: never;
    maxFiles?: never;
};

type UnmanagedProps = {
    value?: never;
    onUpload?: never;
    isUploading?: never;
    previewType?: never;
    /** Receives the full list of currently-selected files */
    onFilesChange?: (files: File[]) => void;
    multiple?: boolean;
    maxFiles?: number;
};

type FileUploadProps = (ManagedProps | UnmanagedProps) & {
    label?: string;
    helperText?: string;
    error?: string;
    accept?: string;
    maxSizeMB?: number;
    disabled?: boolean;
    variant?: "default" | "compact" | "image-only";
};

// ─── Component ─────────────────────────────────────────────────────────────────

export const FileUpload: React.FC<FileUploadProps> = (props) => {
    const {
        label,
        helperText,
        error,
        accept,
        maxSizeMB = 10,
        disabled,
        variant = "default",
    } = props;

    const isManaged = "onUpload" in props && typeof props.onUpload === "function";

    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<LocalUploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string>("");

    const hasError = !!error || !!localError;

    // ── Managed mode: single-file upload ──────────────────────────────────────

    const handleManagedFile = async (file: File) => {
        if (!isManaged) return;
        setLocalError("");

        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
            setLocalError(`File exceeds the ${maxSizeMB}MB limit.`);
            return;
        }

        try {
            await (props as ManagedProps).onUpload(file);
        } catch {
            setLocalError("Upload failed. Please try again.");
        }
    };

    // ── Unmanaged mode: multi-file list ───────────────────────────────────────

    const maxFiles = (!isManaged && (props as UnmanagedProps).maxFiles) || 10;
    const multiple = (!isManaged && (props as UnmanagedProps).multiple) || false;

    const validateAndAdd = (incoming: File[]) => {
        if (isManaged) {
            // In managed mode only ever handle the first file
            if (incoming[0]) handleManagedFile(incoming[0]);
            return;
        }

        setLocalError("");
        const maxBytes = maxSizeMB * 1024 * 1024;
        const valid: File[] = [];
        const newItems: LocalUploadedFile[] = [];

        for (const f of incoming) {
            if (f.size > maxBytes) {
                setLocalError(`"${f.name}" exceeds the ${maxSizeMB}MB limit.`);
                continue;
            }
            if (files.length + newItems.length >= maxFiles) {
                setLocalError(`Maximum ${maxFiles} files allowed.`);
                break;
            }
            const uid = Math.random().toString(36).slice(2);
            const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
            newItems.push({ file: f, id: uid, preview, status: "done" });
            valid.push(f);
        }

        const updated = [...files, ...newItems];
        setFiles(updated);
        (props as UnmanagedProps).onFilesChange?.(updated.map((u) => u.file));
    };

    const removeFile = (fid: string) => {
        const updated = files.filter((f) => f.id !== fid);
        setFiles(updated);
        (props as UnmanagedProps).onFilesChange?.(updated.map((u) => u.file));
    };

    // ── Drag handlers ─────────────────────────────────────────────────────────

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        validateAndAdd(Array.from(e.dataTransfer.files));
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const borderColor = isDragging
        ? "var(--color-primary)"
        : hasError
            ? "var(--color-error)"
            : "var(--border-secondary)";

    const isUploading = isManaged ? !!(props as ManagedProps).isUploading : false;
    const currentUrl = isManaged ? (props as ManagedProps).value : undefined;
    const previewType = isManaged ? ((props as ManagedProps).previewType ?? "image") : undefined;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

            {/* ── Managed: existing-file preview ── */}
            {isManaged && currentUrl && (
                <ExistingFilePreview
                    url={currentUrl}
                    previewType={previewType!}
                    onReplace={() => !disabled && !isUploading && inputRef.current?.click()}
                    disabled={!!disabled || isUploading}
                    isUploading={isUploading}
                />
            )}

            {/* ── Drop zone (hidden when managed + already has a value) ── */}
            {(!isManaged || !currentUrl) && (
                <div
                    onDragEnter={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !disabled && !isUploading && inputRef.current?.click()}
                    style={{
                        border: `2px dashed ${borderColor}`,
                        borderRadius: "var(--radius-lg)",
                        padding: variant === "compact" ? "20px 24px" : "36px 24px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        cursor: disabled || isUploading ? "not-allowed" : "pointer",
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
                        multiple={!isManaged && multiple}
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
                        {isUploading ? (
                            <FiRefreshCw
                                size={variant === "compact" ? 20 : 28}
                                color="var(--color-primary)"
                                style={{ animation: "spin 1s linear infinite" }}
                            />
                        ) : (
                            <FiUploadCloud
                                size={variant === "compact" ? 20 : 28}
                                color={isDragging ? "var(--color-primary)" : "var(--text-tertiary)"}
                            />
                        )}
                    </div>

                    <div>
                        <p style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 600, color: "var(--text-primary)" }}>
                            {isUploading
                                ? "Uploading…"
                                : <>Drop files here or{" "}
                                    <span style={{ color: "var(--color-primary)", textDecoration: "underline" }}>browse</span>
                                </>
                            }
                        </p>
                        {variant !== "compact" && !isUploading && (
                            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                                {accept ? `Supports: ${accept}` : "All file types supported"} · Max {maxSizeMB}MB
                                {!isManaged && multiple ? ` · Up to ${maxFiles} files` : ""}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Unmanaged file list ── */}
            {!isManaged && files.length > 0 && (
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

            {/* ── Helper / error text ── */}
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

            {/* Spinner keyframe — only injected once */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

// ─── Sub-component: preview of an already-uploaded file ────────────────────────

interface ExistingFilePreviewProps {
    url: string;
    previewType: "image" | "icon";
    onReplace: () => void;
    disabled: boolean;
    isUploading: boolean;
}

const ExistingFilePreview: React.FC<ExistingFilePreviewProps> = ({
    url,
    previewType,
    onReplace,
    disabled,
    isUploading,
}) => {
    const isIcon = previewType === "icon";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 16px",
                border: "1.5px solid var(--border-primary)",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg-primary)",
                boxShadow: "var(--shadow-xs)",
            }}
        >
            {/* Preview */}
            <div
                style={{
                    width: isIcon ? 40 : 80,
                    height: isIcon ? 40 : 48,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                    border: "1px solid var(--border-primary)",
                }}
            >
                <img
                    src={url}
                    alt="Current file"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: isIcon ? "contain" : "cover",
                    }}
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                />
            </div>

            {/* URL hint */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        margin: 0,
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                    title={url}
                >
                    {url.split("/").pop()}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                    Currently uploaded
                </p>
            </div>

            {/* Replace button */}
            <button
                type="button"
                onClick={onReplace}
                disabled={disabled}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-secondary)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                    transition: "all var(--transition-fast)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = "var(--color-primary)";
                        e.currentTarget.style.color = "var(--color-primary)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-secondary)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                }}
            >
                {isUploading
                    ? <><FiRefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Uploading…</>
                    : <><FiRefreshCw size={13} /> Replace</>
                }
            </button>
        </div>
    );
};

export default FileUpload;