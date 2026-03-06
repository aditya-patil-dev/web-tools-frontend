"use client";

import { useState, useRef } from "react";
import { FiDownload, FiUpload, FiFileText, FiAlertCircle, FiCheckCircle, FiX, FiInfo } from "react-icons/fi";
import Select from "@/components/forms/Select";
import { useImportExport } from "@/hooks/useImportExport";
import { getResourceOptions } from "@/config/import-export.config";
import type { ImportMode } from "@/services/import-export.service";

export default function ImportExportPanel() {
    const {
        selectedResource,
        resourceConfig,
        importPreview,
        isProcessing,
        selectResource,
        handleExport,
        handleImport,
        downloadTemplate,
        clearPreview,
    } = useImportExport();

    const [importMode, setImportMode] = useState<ImportMode>("append");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resourceOptions = getResourceOptions();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await handleImport(file, importMode);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

            {/* ── HEADER ── */}
            <div style={{
                display: "flex", alignItems: "center", gap: "var(--space-4)",
                paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--border-primary)",
            }}>
                <div style={{
                    width: "48px", height: "48px", borderRadius: "var(--radius-xl)",
                    background: "var(--color-primary-light)", border: "1px solid rgba(255,107,53,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--font-2xl)",
                }}>
                    📦
                </div>
                <div>
                    <h2 style={{
                        fontSize: "var(--font-2xl)", fontWeight: 700,
                        color: "var(--text-primary)", letterSpacing: "-0.01em", margin: 0,
                    }}>
                        Bulk Import / Export
                    </h2>
                    <p style={{
                        fontSize: "var(--font-sm)", color: "var(--text-tertiary)", margin: "4px 0 0",
                    }}>
                        Import and export data in CSV format
                    </p>
                </div>
            </div>

            {/* ── RESOURCE SELECTOR ── */}
            <div style={{
                background: "var(--bg-secondary)", borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-primary)", padding: "var(--space-6)",
            }}>
                <Select
                    label="Select Resource"
                    options={resourceOptions}
                    value={selectedResource || ""}
                    onChange={(e) => selectResource(e.target.value)}
                    placeholder="Choose what to import/export"
                    helperText="Select the type of data you want to work with"
                />

                {resourceConfig && (
                    <div style={{
                        marginTop: "var(--space-4)", padding: "var(--space-3)",
                        background: "rgba(59,130,246,0.06)", borderRadius: "var(--radius-lg)",
                        border: "1px solid rgba(59,130,246,0.2)", display: "flex", gap: "10px",
                    }}>
                        <FiInfo size={16} style={{ color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
                        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", margin: 0 }}>
                            {resourceConfig.description}
                        </p>
                    </div>
                )}
            </div>

            {/* ── ACTIONS ── */}
            {resourceConfig && !importPreview && (
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)",
                }}>

                    {/* Export Card */}
                    <div style={{
                        background: "var(--bg-primary)", borderRadius: "var(--radius-xl)",
                        border: "1px solid var(--border-primary)", padding: "var(--space-6)",
                        boxShadow: "var(--shadow-sm)",
                    }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "var(--radius-lg)",
                            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "var(--space-4)",
                        }}>
                            <FiDownload size={20} style={{ color: "#10b981" }} />
                        </div>
                        <h3 style={{
                            fontSize: "var(--font-lg)", fontWeight: 700,
                            color: "var(--text-primary)", marginBottom: "var(--space-2)",
                        }}>
                            Export Data
                        </h3>
                        <p style={{
                            fontSize: "var(--font-sm)", color: "var(--text-tertiary)",
                            marginBottom: "var(--space-5)", lineHeight: 1.6,
                        }}>
                            Download all {resourceConfig.label.toLowerCase()} as a CSV file
                        </p>
                        <button
                            onClick={handleExport}
                            disabled={isProcessing}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                gap: "8px", padding: "12px 20px", borderRadius: "var(--radius-lg)",
                                border: "none", background: "var(--gradient-primary)", color: "#fff",
                                fontWeight: 700, fontSize: "var(--font-sm)", cursor: "pointer",
                                boxShadow: "0 4px 14px rgba(255,107,53,0.3)",
                                transition: "all var(--transition-base)",
                                opacity: isProcessing ? 0.6 : 1,
                            }}
                        >
                            <FiDownload size={16} />
                            Export CSV
                        </button>
                    </div>

                    {/* Import Card */}
                    <div style={{
                        background: "var(--bg-primary)", borderRadius: "var(--radius-xl)",
                        border: "1px solid var(--border-primary)", padding: "var(--space-6)",
                        boxShadow: "var(--shadow-sm)",
                    }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "var(--radius-lg)",
                            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            marginBottom: "var(--space-4)",
                        }}>
                            <FiUpload size={20} style={{ color: "#3b82f6" }} />
                        </div>
                        <h3 style={{
                            fontSize: "var(--font-lg)", fontWeight: 700,
                            color: "var(--text-primary)", marginBottom: "var(--space-2)",
                        }}>
                            Import Data
                        </h3>
                        <p style={{
                            fontSize: "var(--font-sm)", color: "var(--text-tertiary)",
                            marginBottom: "var(--space-4)", lineHeight: 1.6,
                        }}>
                            Upload a CSV file to import {resourceConfig.label.toLowerCase()}
                        </p>

                        {/* Import Mode */}
                        <div style={{ marginBottom: "var(--space-4)" }}>
                            <Select
                                label="Import Mode"
                                value={importMode}
                                onChange={(e) => setImportMode(e.target.value as ImportMode)}
                                options={[
                                    { value: "append", label: "Append - Add new records only" },
                                    { value: "update", label: "Update - Update existing + add new" },
                                ]}
                            />
                        </div>

                        {/* Template Download */}
                        <button
                            onClick={downloadTemplate}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                gap: "8px", padding: "10px 16px", borderRadius: "var(--radius-lg)",
                                border: "1px solid var(--border-primary)", background: "var(--bg-secondary)",
                                color: "var(--text-primary)", fontWeight: 600, fontSize: "var(--font-sm)",
                                cursor: "pointer", transition: "all var(--transition-base)",
                                marginBottom: "var(--space-3)",
                            }}
                        >
                            <FiFileText size={14} />
                            Download Template
                        </button>

                        {/* File Upload */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                            style={{ display: "none" }}
                            id="csv-upload"
                        />
                        <label
                            htmlFor="csv-upload"
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                gap: "8px", padding: "12px 20px", borderRadius: "var(--radius-lg)",
                                border: "none", background: "var(--gradient-primary)", color: "#fff",
                                fontWeight: 700, fontSize: "var(--font-sm)", cursor: "pointer",
                                boxShadow: "0 4px 14px rgba(255,107,53,0.3)",
                                transition: "all var(--transition-base)",
                                opacity: isProcessing ? 0.6 : 1,
                            }}
                        >
                            <FiUpload size={16} />
                            Upload CSV
                        </label>
                    </div>
                </div>
            )}

            {/* ── IMPORT PREVIEW ── */}
            {importPreview && importPreview.length > 0 && (
                <div style={{
                    background: "var(--bg-primary)", borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-primary)", overflow: "hidden",
                }}>
                    {/* Header */}
                    <div style={{
                        padding: "var(--space-5)", borderBottom: "1px solid var(--border-primary)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div>
                            <h3 style={{
                                fontSize: "var(--font-lg)", fontWeight: 700,
                                color: "var(--text-primary)", marginBottom: "4px",
                            }}>
                                Import Preview
                            </h3>
                            <p style={{ fontSize: "var(--font-sm)", color: "var(--text-tertiary)", margin: 0 }}>
                                {importPreview.filter(p => p.validation.valid).length} valid,{" "}
                                {importPreview.filter(p => !p.validation.valid).length} errors
                            </p>
                        </div>
                        <button
                            onClick={clearPreview}
                            style={{
                                width: "32px", height: "32px", borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-primary)", background: "var(--bg-secondary)",
                                color: "var(--text-tertiary)", cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    {/* Preview Table */}
                    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                        {importPreview.map((preview, index) => {
                            const isValid = preview.validation.valid;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        padding: "var(--space-4)", borderBottom: "1px solid var(--border-primary)",
                                        background: isValid ? "var(--bg-primary)" : "rgba(239,68,68,0.02)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                        {isValid ? (
                                            <FiCheckCircle size={16} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                                        ) : (
                                            <FiAlertCircle size={16} style={{ color: "var(--color-error)", flexShrink: 0 }} />
                                        )}
                                        <span style={{
                                            fontSize: "var(--font-xs)", fontWeight: 700,
                                            color: "var(--text-tertiary)",
                                        }}>
                                            Row {preview.row}
                                        </span>
                                    </div>

                                    {/* Data */}
                                    <div style={{
                                        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "var(--space-3)", marginBottom: isValid ? 0 : "var(--space-3)",
                                    }}>
                                        {Object.entries(preview.data).slice(0, 4).map(([key, value]) => (
                                            <div key={key}>
                                                <div style={{
                                                    fontSize: "var(--font-xs)", fontWeight: 600,
                                                    color: "var(--text-tertiary)", marginBottom: "2px",
                                                }}>
                                                    {key}
                                                </div>
                                                <div style={{
                                                    fontSize: "var(--font-sm)", color: "var(--text-primary)",
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>
                                                    {String(value || "—")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Errors */}
                                    {!isValid && preview.validation.errors.length > 0 && (
                                        <div style={{ marginTop: "var(--space-3)" }}>
                                            {preview.validation.errors.map((error, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        fontSize: "var(--font-xs)", color: "var(--color-error)",
                                                        padding: "6px 10px", background: "rgba(239,68,68,0.08)",
                                                        borderRadius: "var(--radius-md)", marginBottom: "4px",
                                                    }}
                                                >
                                                    <strong>{error.column}:</strong> {error.error}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}