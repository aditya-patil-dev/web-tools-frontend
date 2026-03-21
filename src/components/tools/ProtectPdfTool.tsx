"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiUpload, FiDownload, FiCheckCircle, FiAlertCircle,
    FiFileText, FiTrash2, FiLock, FiShield, FiEye,
    FiEyeOff, FiX, FiCheck, FiPlus, FiPrinter,
    FiCopy, FiEdit,
} from "react-icons/fi";
import { toolsApi } from "@/lib/api-calls/tools.api";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface PasswordStrength {
    score: number;      // 0–7
    label: string;
    color: string;
    tips: string[];
}

interface Permissions {
    allowPrint: boolean;
    allowCopy: boolean;
    allowModify: boolean;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getPasswordStrength = (pwd: string): PasswordStrength => {
    if (!pwd) return { score: 0, label: "", color: "var(--color-slate-300)", tips: [] };

    let score = 0;
    const tips: string[] = [];

    if (pwd.length >= 8) score += 1; else tips.push("Use at least 8 characters");
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (/[a-z]/.test(pwd)) score += 1; else tips.push("Add lowercase letters");
    if (/[A-Z]/.test(pwd)) score += 1; else tips.push("Add uppercase letters");
    if (/[0-9]/.test(pwd)) score += 1; else tips.push("Add numbers");
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1; else tips.push("Add symbols (!@#$%)");

    if (score <= 2) return { score, label: "Weak", color: "#ef4444", tips };
    if (score <= 4) return { score, label: "Fair", color: "#f59e0b", tips };
    if (score <= 5) return { score, label: "Good", color: "#3b82f6", tips };
    return { score, label: "Strong", color: "#10b981", tips };
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const ProtectPdfTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [protecting, setProtecting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissions, setPermissions] = useState<Permissions>({
        allowPrint: true,
        allowCopy: false,
        allowModify: false,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const strength = getPasswordStrength(password);
    const passwordsMatch = password && confirmPassword && password === confirmPassword;
    const passwordMismatch = !!confirmPassword && password !== confirmPassword;
    const canProtect = !!selectedFile && !!password && password.length >= 6 && passwordsMatch && !protecting;

    /* ── File handling ── */
    const processFile = useCallback((file: File) => {
        if (file.type !== "application/pdf") {
            toast.error("Please select a PDF file", "Invalid File");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error("PDF must be less than 20 MB", "File Too Large");
            return;
        }
        setSelectedFile(file);
        setPassword("");
        setConfirmPassword("");
        setOwnerPassword("");
        setError(null);
        setSuccess(false);
        toast.success(`"${file.name}" loaded`, "PDF Ready");
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    /* ── Protect PDF ── */
    const protectPdf = async () => {
        if (!canProtect || !selectedFile) return;

        setProtecting(true);
        setError(null);
        setSuccess(false);

        try {
            const { blob, fileName } = await toolsApi.protectPdf({
                file: selectedFile,
                password,
                ownerPassword: ownerPassword || password,
                allowPrint: permissions.allowPrint,
                allowCopy: permissions.allowCopy,
                allowModify: permissions.allowModify,
            });

            // Trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setSuccess(true);
            toast.success(`"${fileName}" downloaded with AES-256 encryption!`, "Protected!");

            setTimeout(() => setSuccess(false), 4000);

        } catch (err: any) {
            const msg = err?.response?.data?.message
                || err?.message
                || "Failed to protect PDF. Please try again.";
            setError(msg);
            toast.error(msg, "Error");
        } finally {
            setProtecting(false);
        }
    };

    /* ── Clear ── */
    const handleClear = () => {
        setSelectedFile(null);
        setPassword("");
        setConfirmPassword("");
        setOwnerPassword("");
        setError(null);
        setSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="pp-root">

                {/* ── Drop zone ── */}
                <div
                    className={`pp-dropzone${dragOver ? " pp-dropzone--active" : ""}${selectedFile ? " pp-dropzone--compact" : ""}`}
                    onDrop={handleDrop}
                    onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                    role={selectedFile ? undefined : "button"}
                    tabIndex={selectedFile ? undefined : 0}
                    onKeyDown={e => !selectedFile && e.key === "Enter" && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="pp-file-input"
                    />

                    {!selectedFile ? (
                        <>
                            <motion.div
                                className="pp-dropzone-icon"
                                animate={{ y: dragOver ? -6 : 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {dragOver ? <FiPlus /> : <FiUpload />}
                            </motion.div>
                            <div className="pp-dropzone-text">
                                <p className="pp-dropzone-cta">{dragOver ? "Drop PDF here!" : "Click or drag a PDF file here"}</p>
                                <p className="pp-dropzone-hint">Max 20 MB · AES-256 encryption</p>
                            </div>
                        </>
                    ) : (
                        /* Compact file info row */
                        <div className="pp-file-row">
                            <div className="pp-file-icon">
                                <FiFileText />
                                <span className="pp-file-pdf-lbl">PDF</span>
                            </div>
                            <div className="pp-file-info">
                                <p className="pp-file-name" title={selectedFile.name}>{selectedFile.name}</p>
                                <p className="pp-file-meta">{fmtSize(selectedFile.size)}</p>
                            </div>
                            <div className={`pp-file-status${success ? " pp-file-status--ok" : ""}`}>
                                {success
                                    ? <><FiCheckCircle /> Protected!</>
                                    : <><FiShield /> Ready to protect</>}
                            </div>
                            <button type="button" className="pp-btn-remove" onClick={handleClear} title="Remove file">
                                <FiTrash2 />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Password fields — only shown when file selected ── */}
                <AnimatePresence>
                    {selectedFile && (
                        <motion.div
                            className="pp-form"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Password */}
                            <div className="pp-field">
                                <label className="pp-label" htmlFor="pp-password">
                                    <FiLock /> User Password
                                    <span className="pp-label-hint">Required to open the PDF</span>
                                </label>
                                <div className={`pp-input-wrap${passwordMismatch || (password && password.length < 6) ? " pp-input-wrap--err" : ""}`}>
                                    <input
                                        id="pp-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter password (min. 6 characters)"
                                        className="pp-input"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="pp-eye-btn"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                {/* Strength meter */}
                                {password && (
                                    <div className="pp-strength">
                                        <div className="pp-strength-track">
                                            <motion.div
                                                className="pp-strength-fill"
                                                style={{ background: strength.color }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(strength.score / 7) * 100}%` }}
                                                transition={{ duration: 0.35 }}
                                            />
                                        </div>
                                        <span className="pp-strength-label" style={{ color: strength.color }}>
                                            {strength.label}
                                        </span>
                                    </div>
                                )}

                                {/* Tips */}
                                {password && strength.tips.length > 0 && (
                                    <p className="pp-strength-tip">{strength.tips[0]}</p>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div className="pp-field">
                                <label className="pp-label" htmlFor="pp-confirm">
                                    <FiLock /> Confirm Password
                                </label>
                                <div className={`pp-input-wrap${passwordMismatch ? " pp-input-wrap--err" : passwordsMatch ? " pp-input-wrap--ok" : ""}`}>
                                    <input
                                        id="pp-confirm"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter password"
                                        className="pp-input"
                                        autoComplete="new-password"
                                    />
                                    {passwordsMatch && (
                                        <span className="pp-input-check"><FiCheck /></span>
                                    )}
                                    {passwordMismatch && (
                                        <span className="pp-input-x"><FiX /></span>
                                    )}
                                </div>
                                {passwordMismatch && (
                                    <p className="pp-field-err">Passwords do not match</p>
                                )}
                            </div>

                            {/* Permissions */}
                            <div className="pp-permissions">
                                <p className="pp-permissions-title"><FiShield /> Document Permissions</p>
                                <div className="pp-permissions-grid">
                                    {([
                                        { key: "allowPrint", icon: <FiPrinter />, label: "Allow Printing", desc: "Users can print the PDF" },
                                        { key: "allowCopy", icon: <FiCopy />, label: "Allow Copying", desc: "Users can copy text" },
                                        { key: "allowModify", icon: <FiEdit />, label: "Allow Editing", desc: "Users can modify content" },
                                    ] as { key: keyof Permissions; icon: React.ReactNode; label: string; desc: string }[]).map(p => (
                                        <label key={p.key} className={`pp-perm-card${permissions[p.key] ? " pp-perm-card--on" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={permissions[p.key]}
                                                onChange={e => setPermissions(prev => ({ ...prev, [p.key]: e.target.checked }))}
                                                className="pp-perm-checkbox"
                                            />
                                            <div className="pp-perm-icon">{p.icon}</div>
                                            <div className="pp-perm-text">
                                                <span className="pp-perm-label">{p.label}</span>
                                                <span className="pp-perm-desc">{p.desc}</span>
                                            </div>
                                            <div className={`pp-perm-toggle${permissions[p.key] ? " pp-perm-toggle--on" : ""}`}>
                                                {permissions[p.key] ? <FiCheck /> : <FiX />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Advanced — owner password */}
                            <div className="pp-advanced">
                                <button
                                    type="button"
                                    className="pp-advanced-toggle"
                                    onClick={() => setShowAdvanced(v => !v)}
                                >
                                    <span>{showAdvanced ? "▾" : "▸"} Advanced Options</span>
                                    <span className="pp-advanced-hint">Owner password, permissions override</span>
                                </button>

                                <AnimatePresence>
                                    {showAdvanced && (
                                        <motion.div
                                            className="pp-advanced-body"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="pp-field">
                                                <label className="pp-label" htmlFor="pp-owner">
                                                    <FiShield /> Owner Password
                                                    <span className="pp-label-hint">
                                                        Allows changing permissions (defaults to user password)
                                                    </span>
                                                </label>
                                                <div className="pp-input-wrap">
                                                    <input
                                                        id="pp-owner"
                                                        type={showPassword ? "text" : "password"}
                                                        value={ownerPassword}
                                                        onChange={e => setOwnerPassword(e.target.value)}
                                                        placeholder="Leave blank to use same as user password"
                                                        className="pp-input"
                                                        autoComplete="new-password"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pp-advanced-note">
                                                <FiAlertCircle />
                                                <span>The owner password lets PDF editors override restrictions.
                                                    Use a different, stronger password than the user password for maximum security.</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="pp-error"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                    >
                                        <FiAlertCircle /><span>{error}</span>
                                        <button type="button" onClick={() => setError(null)}><FiX /></button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Protect button */}
                            <motion.button
                                type="button"
                                className={`pp-btn-protect${success ? " pp-btn-protect--done" : ""}`}
                                onClick={protectPdf}
                                disabled={!canProtect}
                                whileHover={{ scale: canProtect ? 1.01 : 1 }}
                                whileTap={{ scale: canProtect ? 0.97 : 1 }}
                            >
                                {protecting ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            style={{ display: "flex" }}
                                        >
                                            <FiShield />
                                        </motion.span>
                                        Encrypting PDF…
                                    </>
                                ) : success ? (
                                    <><FiCheckCircle /> Protected & Downloaded!</>
                                ) : (
                                    <><FiDownload /> Protect & Download PDF</>
                                )}
                            </motion.button>

                            {/* Encryption info badge */}
                            <div className="pp-encrypt-badge">
                                <FiLock />
                                <span>AES-256 encryption · Processed securely on server · File deleted after download</span>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Feature cards (empty state) ── */}
                {!selectedFile && (
                    <motion.div
                        className="pp-features"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {[
                            { icon: <FiLock />, title: "AES-256 Encryption", desc: "Industry-standard encryption — the same used by banks and governments." },
                            { icon: <FiShield />, title: "Permission Controls", desc: "Restrict printing, copying text, and editing independently." },
                            { icon: <FiCheckCircle />, title: "100% Private", desc: "PDF is deleted from our server immediately after download." },
                            { icon: <FiDownload />, title: "Instant Download", desc: "Encrypted PDF downloads directly to your device." },
                        ].map(f => (
                            <div key={f.title} className="pp-feature-card">
                                <div className="pp-feature-icon">{f.icon}</div>
                                <div>
                                    <p className="pp-feature-title">{f.title}</p>
                                    <p className="pp-feature-desc">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

            </div>
        </motion.div>
    );
};

export default ProtectPdfTool;