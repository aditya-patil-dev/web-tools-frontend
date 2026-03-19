"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import {
    FiUpload, FiDownload, FiCheckCircle, FiAlertCircle,
    FiFileText, FiTrash2, FiZap, FiMove, FiX, FiLayers,
    FiArrowUp, FiArrowDown, FiCheck, FiPlus,
} from "react-icons/fi";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface PdfFile {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    status: "loading" | "ready" | "error" | "oversized" | "duplicate";
    errorMsg?: string;
}

type MergeStep = "idle" | "loading" | "copying" | "building" | "saving" | "done" | "error";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const MAX_FILES        = 20;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE    = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_SIZE   = 50 * 1024 * 1024; // 50 MB

const MERGE_STEPS: Record<MergeStep, string> = {
    idle:     "",
    loading:  "Loading PDF files…",
    copying:  "Copying pages…",
    building: "Building document…",
    saving:   "Saving merged PDF…",
    done:     "Merged successfully!",
    error:    "Merge failed",
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtSize = (bytes: number) => {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const truncate = (name: string, max = 36) =>
    name.length > max ? `${name.slice(0, max - 3)}…` : name;

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

/** Shimmer skeleton for page count while loading */
const PageCountSkeleton = () => (
    <span className="mp-skel mp-skel--badge" />
);

/** Status icon on each card */
const StatusIcon = ({ status }: { status: PdfFile["status"] }) => {
    if (status === "loading")   return <span className="mp-card-spinner" />;
    if (status === "ready")     return <FiCheckCircle className="mp-card-status mp-card-status--ok" />;
    if (status === "error")     return <FiAlertCircle className="mp-card-status mp-card-status--err" />;
    if (status === "oversized") return <FiAlertCircle className="mp-card-status mp-card-status--warn" />;
    if (status === "duplicate") return <FiAlertCircle className="mp-card-status mp-card-status--warn" />;
    return null;
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const MergePdfTool = () => {
    const [pdfFiles,       setPdfFiles]       = useState<PdfFile[]>([]);
    const [dragOver,       setDragOver]       = useState(false);
    const [draggedIndex,   setDraggedIndex]   = useState<number | null>(null);
    const [mergeStep,      setMergeStep]      = useState<MergeStep>("idle");
    const [mergeProgress,  setMergeProgress]  = useState(0);   // 0–100
    const [mergeSuccess,   setMergeSuccess]   = useState(false);
    const [outputName,     setOutputName]     = useState("merged");
    const [error,          setError]          = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Process incoming File objects ── */
    const processFiles = useCallback(async (raw: File[]) => {
        const pdfs = raw.filter(f => f.type === "application/pdf");
        const skipped = raw.length - pdfs.length;

        if (skipped > 0) toast.warning(`${skipped} non-PDF file${skipped > 1 ? "s" : ""} skipped`, "Warning");
        if (pdfs.length === 0) { toast.error("Please add PDF files", "No PDFs"); return; }

        if (pdfFiles.length + pdfs.length > MAX_FILES) {
            toast.error(`Maximum ${MAX_FILES} files allowed`, "Too Many Files");
            return;
        }

        const existingNames = new Set(pdfFiles.map(p => p.name));

        const newPdfs: PdfFile[] = pdfs.map(file => ({
            id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            name:      file.name,
            size:      file.size,
            pageCount: 0,
            status:    file.size > MAX_FILE_SIZE ? "oversized" :
                       existingNames.has(file.name) ? "duplicate" : "loading",
            errorMsg:  file.size > MAX_FILE_SIZE ? `Exceeds ${MAX_FILE_SIZE_MB} MB limit` :
                       existingNames.has(file.name) ? "Possible duplicate" : undefined,
        }));

        setPdfFiles(prev => [...prev, ...newPdfs]);
        setError(null);

        // Load page counts async for valid files
        for (const pdf of newPdfs) {
            if (pdf.status !== "loading") continue;
            try {
                const buf      = await pdf.file.arrayBuffer();
                const doc      = await PDFDocument.load(buf);
                const pages    = doc.getPageCount();
                setPdfFiles(prev => prev.map(p =>
                    p.id === pdf.id ? { ...p, pageCount: pages, status: "ready" } : p
                ));
            } catch {
                setPdfFiles(prev => prev.map(p =>
                    p.id === pdf.id ? { ...p, status: "error", errorMsg: "Failed to read PDF" } : p
                ));
                toast.error(`Could not read "${pdf.name}"`, "Error");
            }
        }

        const valid = newPdfs.filter(p => p.status === "loading" || p.size <= MAX_FILE_SIZE);
        if (valid.length > 0)
            toast.success(`${valid.length} PDF${valid.length > 1 ? "s" : ""} added`, "Added");

        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [pdfFiles]);

    /* ── File input ── */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length) processFiles(files);
    };

    /* ── Drop zone ── */
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) processFiles(files);
    }, [processFiles]);

    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
    const handleDragOverZone = (e: React.DragEvent) => { e.preventDefault(); };

    /* ── List reorder — drag ── */
    const handleItemDragStart = (index: number) => setDraggedIndex(index);
    const handleItemDragOver  = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setPdfFiles(prev => {
            const arr = [...prev];
            const [item] = arr.splice(draggedIndex, 1);
            arr.splice(index, 0, item);
            return arr;
        });
        setDraggedIndex(index);
    };
    const handleItemDragEnd = () => setDraggedIndex(null);

    /* ── List reorder — buttons ── */
    const moveItem = (index: number, dir: -1 | 1) => {
        const next = index + dir;
        if (next < 0 || next >= pdfFiles.length) return;
        setPdfFiles(prev => {
            const arr = [...prev];
            [arr[index], arr[next]] = [arr[next], arr[index]];
            return arr;
        });
    };

    /* ── Remove ── */
    const removePdf = (id: string) => setPdfFiles(prev => prev.filter(p => p.id !== id));

    /* ── Clear all ── */
    const handleClear = () => {
        setPdfFiles([]);
        setError(null);
        setMergeStep("idle");
        setMergeProgress(0);
        setMergeSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    /* ── Merge ── */
    const mergePdfs = async () => {
        const validFiles = pdfFiles.filter(p => p.status === "ready");

        if (validFiles.length < 2) {
            toast.error("Add at least 2 valid PDF files", "Not Enough Files");
            return;
        }

        const totalSize = validFiles.reduce((s, p) => s + p.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            toast.warning("Total size exceeds 50 MB — merge may be slow", "Large Files");
        }

        setError(null);
        setMergeSuccess(false);
        setMergeProgress(0);
        setMergeStep("loading");

        try {
            const mergedPdf = await PDFDocument.create();
            const step = 100 / validFiles.length;

            setMergeStep("copying");

            for (let i = 0; i < validFiles.length; i++) {
                const pdfFile = validFiles[i];
                try {
                    const buf    = await pdfFile.file.arrayBuffer();
                    const doc    = await PDFDocument.load(buf);
                    const pages  = await mergedPdf.copyPages(doc, doc.getPageIndices());
                    pages.forEach(p => mergedPdf.addPage(p));
                    setMergeProgress(Math.round((i + 1) * step));
                } catch {
                    throw new Error(`Failed to process "${pdfFile.name}"`);
                }
            }

            setMergeStep("building");
            setMergeProgress(90);

            setMergeStep("saving");
            const bytes = await mergedPdf.save();
            const blob  = new Blob([bytes as unknown as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
            const fname = (outputName.trim() || "merged") + ".pdf";
            saveAs(blob, fname);

            setMergeProgress(100);
            setMergeStep("done");
            setMergeSuccess(true);

            const totalPages = validFiles.reduce((s, p) => s + p.pageCount, 0);
            toast.success(`${fname} · ${totalPages} pages · ${fmtSize(blob.size)}`, "Downloaded!");

            setTimeout(() => {
                setMergeStep("idle");
                setMergeProgress(0);
                setMergeSuccess(false);
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Failed to merge PDFs");
            setMergeStep("error");
            setMergeProgress(0);
            toast.error(err.message || "Merge failed", "Error");
        }
    };

    /* ── Stats ── */
    const readyFiles  = pdfFiles.filter(p => p.status === "ready");
    const totalPages  = readyFiles.reduce((s, p) => s + p.pageCount, 0);
    const totalSize   = pdfFiles.reduce((s, p) => s + p.size, 0);
    const merging     = mergeStep !== "idle" && mergeStep !== "done" && mergeStep !== "error";
    const canMerge    = readyFiles.length >= 2 && !merging;

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
        <div className="mp-root">

            {/* ── Drop Zone ── */}
            <div
                className={`mp-dropzone${dragOver ? " mp-dropzone--active" : ""}${pdfFiles.length > 0 ? " mp-dropzone--compact" : ""}`}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOverZone}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                aria-label="Upload PDF files"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="mp-file-input"
                    id="mergePdfInput"
                />

                <motion.div
                    className="mp-dropzone-icon"
                    animate={{ y: dragOver ? -6 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {dragOver ? <FiPlus /> : <FiUpload />}
                </motion.div>

                <div className="mp-dropzone-text">
                    {dragOver ? (
                        <p className="mp-dropzone-cta">Drop PDF files here!</p>
                    ) : pdfFiles.length > 0 ? (
                        <p className="mp-dropzone-cta">Add more PDFs</p>
                    ) : (
                        <>
                            <p className="mp-dropzone-cta">Click or drag PDF files here</p>
                            <p className="mp-dropzone-hint">Up to {MAX_FILES} files · Max {MAX_FILE_SIZE_MB} MB each</p>
                        </>
                    )}
                </div>
            </div>

            {/* ── Error ── */}
            <AnimatePresence>
                {error && (
                    <motion.div className="mp-error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <FiAlertCircle /><span>{error}</span>
                        <button type="button" onClick={() => setError(null)}><FiX /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── File List ── */}
            <AnimatePresence>
                {pdfFiles.length > 0 && (
                    <motion.div
                        className="mp-files-section"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        {/* Header */}
                        <div className="mp-files-header">
                            <div className="mp-files-header-left">
                                <span className="mp-files-title">
                                    <FiFileText /> PDF Files
                                    <span className="mp-files-count">{pdfFiles.length}</span>
                                </span>
                                {readyFiles.length > 0 && (
                                    <span className="mp-files-meta">
                                        {totalPages} pages · {fmtSize(totalSize)}
                                    </span>
                                )}
                            </div>
                            <div className="mp-files-header-right">
                                <span className="mp-drag-hint"><FiMove /> Drag to reorder</span>
                                <button type="button" className="mp-btn-clear" onClick={handleClear}>
                                    <FiTrash2 /> Clear all
                                </button>
                            </div>
                        </div>

                        {/* Column labels */}
                        <div className="mp-col-labels">
                            <span style={{ width: 28 }} />
                            <span className="mp-col-label" style={{ flex: 1 }}>File</span>
                            <span className="mp-col-label mp-col-pages">Pages</span>
                            <span className="mp-col-label mp-col-size">Size</span>
                            <span style={{ width: 80 }} />
                        </div>

                        {/* File cards */}
                        <div className="mp-file-list">
                            <AnimatePresence initial={false}>
                                {pdfFiles.map((pdf, index) => (
                                    <motion.div
                                        key={pdf.id}
                                        layout
                                        className={`mp-file-card${draggedIndex === index ? " mp-file-card--dragging" : ""}${pdf.status === "error" || pdf.status === "oversized" ? " mp-file-card--invalid" : ""}`}
                                        draggable={pdf.status === "ready"}
                                        onDragStart={() => handleItemDragStart(index)}
                                        onDragOver={e => handleItemDragOver(e, index)}
                                        onDragEnd={handleItemDragEnd}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        {/* Order badge */}
                                        <span className="mp-file-order">{index + 1}</span>

                                        {/* PDF icon */}
                                        <div className="mp-file-icon">
                                            <FiFileText />
                                            <span className="mp-file-pdf-label">PDF</span>
                                        </div>

                                        {/* Name + status */}
                                        <div className="mp-file-info">
                                            <p className="mp-file-name" title={pdf.name}>{truncate(pdf.name)}</p>
                                            {(pdf.status === "error" || pdf.status === "oversized" || pdf.status === "duplicate") && (
                                                <p className="mp-file-errmsg">{pdf.errorMsg}</p>
                                            )}
                                        </div>

                                        {/* Page count */}
                                        <div className="mp-col-pages">
                                            {pdf.status === "loading" ? (
                                                <PageCountSkeleton />
                                            ) : pdf.status === "ready" ? (
                                                <span className="mp-page-badge">{pdf.pageCount}p</span>
                                            ) : (
                                                <span className="mp-page-badge mp-page-badge--na">—</span>
                                            )}
                                        </div>

                                        {/* Size */}
                                        <span className="mp-col-size mp-file-size">{fmtSize(pdf.size)}</span>

                                        {/* Status icon */}
                                        <StatusIcon status={pdf.status} />

                                        {/* Reorder arrows */}
                                        <div className="mp-file-arrows">
                                            <button type="button" className="mp-arrow-btn" onClick={() => moveItem(index, -1)} disabled={index === 0} title="Move up">
                                                <FiArrowUp />
                                            </button>
                                            <button type="button" className="mp-arrow-btn" onClick={() => moveItem(index, 1)} disabled={index === pdfFiles.length - 1} title="Move down">
                                                <FiArrowDown />
                                            </button>
                                        </div>

                                        {/* Drag handle */}
                                        <div className="mp-drag-handle" title="Drag to reorder">
                                            <FiMove />
                                        </div>

                                        {/* Remove */}
                                        <button type="button" className="mp-btn-remove" onClick={() => removePdf(pdf.id)} disabled={merging} title="Remove">
                                            <FiX />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Connector flow line */}
                        {readyFiles.length >= 2 && (
                            <div className="mp-flow-hint">
                                <FiLayers className="mp-flow-icon" />
                                <span>{pdfFiles.length} files will be merged in the order shown above</span>
                            </div>
                        )}

                        {/* Output filename */}
                        <div className="mp-output-row">
                            <label className="mp-output-label" htmlFor="mp-output-name">
                                Output filename
                            </label>
                            <div className="mp-output-input-wrap">
                                <input
                                    id="mp-output-name"
                                    type="text"
                                    className="mp-output-input"
                                    value={outputName}
                                    onChange={e => setOutputName(e.target.value)}
                                    placeholder="merged"
                                    maxLength={60}
                                    disabled={merging}
                                />
                                <span className="mp-output-ext">.pdf</span>
                            </div>
                        </div>

                        {/* Stats summary */}
                        <div className="mp-merge-summary">
                            <div className="mp-summary-stat">
                                <span className="mp-summary-val">{readyFiles.length}</span>
                                <span className="mp-summary-lbl">PDF{readyFiles.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="mp-summary-arrow">→</div>
                            <div className="mp-summary-stat">
                                <span className="mp-summary-val">{totalPages}</span>
                                <span className="mp-summary-lbl">Pages</span>
                            </div>
                            <div className="mp-summary-arrow">→</div>
                            <div className="mp-summary-stat">
                                <span className="mp-summary-val">1</span>
                                <span className="mp-summary-lbl">PDF</span>
                            </div>
                            <div className="mp-summary-size">{fmtSize(totalSize)}</div>
                        </div>

                        {/* Progress bar */}
                        <AnimatePresence>
                            {merging && (
                                <motion.div className="mp-progress-wrap" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                                    <div className="mp-progress-label">
                                        <span>{MERGE_STEPS[mergeStep]}</span>
                                        <span className="mp-progress-pct">{mergeProgress}%</span>
                                    </div>
                                    <div className="mp-progress-track">
                                        <motion.div
                                            className="mp-progress-fill"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${mergeProgress}%` }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Merge button */}
                        <motion.button
                            type="button"
                            className={`mp-btn-merge${mergeSuccess ? " mp-btn-merge--done" : ""}`}
                            onClick={mergePdfs}
                            disabled={!canMerge}
                            whileHover={{ scale: canMerge ? 1.02 : 1 }}
                            whileTap={{ scale: canMerge ? 0.97 : 1 }}
                        >
                            {merging ? (
                                <><span className="mp-spinner" /> {MERGE_STEPS[mergeStep]}</>
                            ) : mergeSuccess ? (
                                <><FiCheck /> Merged & Downloaded!</>
                            ) : (
                                <><FiDownload /> Merge & Download PDF</>
                            )}
                        </motion.button>

                        {readyFiles.length < 2 && !merging && (
                            <p className="mp-merge-hint">
                                <FiAlertCircle /> Add at least 2 valid PDF files to merge
                            </p>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Empty state features strip ── */}
            {pdfFiles.length === 0 && (
                <motion.div
                    className="mp-features"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {[
                        { icon: <FiLayers />, label: "Up to 20 PDFs",         desc: "Combine any number of files" },
                        { icon: <FiMove />,   label: "Drag to reorder",        desc: "Set the exact merge order" },
                        { icon: <FiZap />,    label: "100% in-browser",        desc: "Files never leave your device" },
                        { icon: <FiCheckCircle />, label: "Preserves quality", desc: "No compression or quality loss" },
                    ].map(f => (
                        <div key={f.label} className="mp-feature-card">
                            <div className="mp-feature-icon">{f.icon}</div>
                            <div>
                                <p className="mp-feature-label">{f.label}</p>
                                <p className="mp-feature-desc">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

        </div>
        </motion.div>
    );
};

export default MergePdfTool;