"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiUpload, FiDownload, FiCheckCircle, FiAlertCircle,
    FiFileText, FiTrash2, FiLock, FiUnlock, FiEye,
    FiEyeOff, FiX, FiCheck, FiPlus, FiShield,
} from "react-icons/fi";
import { toolsApi } from "@/lib/api-calls/tools.api";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const UnlockPdfTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const canUnlock = !!selectedFile && !!password.trim() && !unlocking;

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

    /* ── Unlock ── */
    const unlockPdf = async () => {
        if (!canUnlock || !selectedFile) return;

        setUnlocking(true);
        setError(null);
        setSuccess(false);

        try {
            const { blob, fileName } = await toolsApi.unlockPdf({
                file: selectedFile,
                password: password.trim(),
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
            toast.success(`"${fileName}" downloaded — password removed!`, "Unlocked!");
            setTimeout(() => setSuccess(false), 4000);

        } catch (err: any) {
            const msg = err?.response?.data?.message
                || err?.message
                || "Failed to unlock PDF. Please check your password.";
            setError(msg);
            toast.error(msg, "Failed");
        } finally {
            setUnlocking(false);
        }
    };

    /* ── Clear ── */
    const handleClear = () => {
        setSelectedFile(null);
        setPassword("");
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
            <div className="ul-root">

                {/* ── Drop zone ── */}
                <div
                    className={`ul-dropzone${dragOver ? " ul-dropzone--active" : ""}${selectedFile ? " ul-dropzone--compact" : ""}`}
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
                        className="ul-file-input"
                    />

                    {!selectedFile ? (
                        <>
                            <motion.div
                                className="ul-dropzone-icon"
                                animate={{ y: dragOver ? -6 : 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {dragOver ? <FiPlus /> : <FiUpload />}
                            </motion.div>
                            <div className="ul-dropzone-text">
                                <p className="ul-dropzone-cta">
                                    {dragOver ? "Drop PDF here!" : "Click or drag a PDF file here"}
                                </p>
                                <p className="ul-dropzone-hint">Max 20 MB · Password-protected PDFs</p>
                            </div>
                        </>
                    ) : (
                        /* Compact file info row */
                        <div className="ul-file-row">
                            <div className="ul-file-icon">
                                <FiFileText />
                                <span className="ul-file-pdf-lbl">PDF</span>
                            </div>
                            <div className="ul-file-info">
                                <p className="ul-file-name" title={selectedFile.name}>
                                    {selectedFile.name}
                                </p>
                                <p className="ul-file-meta">{fmtSize(selectedFile.size)}</p>
                            </div>
                            <div className={`ul-file-status${success ? " ul-file-status--ok" : ""}`}>
                                {success
                                    ? <><FiCheckCircle /> Unlocked!</>
                                    : <><FiLock /> Password protected</>}
                            </div>
                            <button
                                type="button"
                                className="ul-btn-remove"
                                onClick={handleClear}
                                title="Remove file"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Form — only shown when file selected ── */}
                <AnimatePresence>
                    {selectedFile && (
                        <motion.div
                            className="ul-form"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Password field */}
                            <div className="ul-field">
                                <label className="ul-label" htmlFor="ul-password">
                                    <FiLock /> PDF Password
                                    <span className="ul-label-hint">
                                        Enter the password used to protect this PDF
                                    </span>
                                </label>

                                <div className={`ul-input-wrap${error && error.toLowerCase().includes("password") ? " ul-input-wrap--err" : success ? " ul-input-wrap--ok" : ""}`}>
                                    <input
                                        id="ul-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setError(null); }}
                                        onKeyDown={e => e.key === "Enter" && unlockPdf()}
                                        placeholder="Enter the PDF password"
                                        className="ul-input"
                                        autoComplete="off"
                                        disabled={unlocking}
                                    />
                                    <button
                                        type="button"
                                        className="ul-eye-btn"
                                        onClick={() => setShowPassword(v => !v)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                <p className="ul-field-hint">
                                    Press Enter or click Unlock to proceed
                                </p>
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        className="ul-error"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                    >
                                        <FiAlertCircle />
                                        <span>{error}</span>
                                        <button type="button" onClick={() => setError(null)}>
                                            <FiX />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Unlock button */}
                            <motion.button
                                type="button"
                                className={`ul-btn-unlock${success ? " ul-btn-unlock--done" : ""}`}
                                onClick={unlockPdf}
                                disabled={!canUnlock}
                                whileHover={{ scale: canUnlock ? 1.01 : 1 }}
                                whileTap={{ scale: canUnlock ? 0.97 : 1 }}
                            >
                                {unlocking ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            style={{ display: "flex" }}
                                        >
                                            <FiUnlock />
                                        </motion.span>
                                        Unlocking PDF…
                                    </>
                                ) : success ? (
                                    <><FiCheck /> Unlocked & Downloaded!</>
                                ) : (
                                    <><FiDownload /> Unlock & Download PDF</>
                                )}
                            </motion.button>

                            {/* Privacy note */}
                            <div className="ul-privacy-note">
                                <FiShield />
                                <span>
                                    Processed securely on server · File deleted immediately after download · Only unlock PDFs you own
                                </span>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Feature cards (empty state) ── */}
                {!selectedFile && (
                    <motion.div
                        className="ul-features"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {[
                            { icon: <FiUnlock />, title: "Real decryption", desc: "Removes AES-256 and RC4 password protection using the correct password." },
                            { icon: <FiShield />, title: "Privacy first", desc: "File is deleted from the server immediately after your download." },
                            { icon: <FiDownload />, title: "Instant download", desc: "Unlocked PDF downloads directly to your device." },
                            { icon: <FiCheckCircle />, title: "Original unchanged", desc: "Your original protected file is never modified." },
                        ].map(f => (
                            <div key={f.title} className="ul-feature-card">
                                <div className="ul-feature-icon">{f.icon}</div>
                                <div>
                                    <p className="ul-feature-title">{f.title}</p>
                                    <p className="ul-feature-desc">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

            </div>
        </motion.div>
    );
};

export default UnlockPdfTool;