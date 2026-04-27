"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
    FiTrash2, FiScissors, FiLayers, FiInfo,
    FiAlertCircle, FiFileText, FiZap,
    FiDownload, FiUpload, FiX, FiCheckCircle,
    FiChevronDown, FiChevronUp
} from "react-icons/fi";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const MAX_FILES = 10;
const MAX_SIZE_MB = 10;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

type BackgroundColor = "transparent" | "white" | "black" | "custom";

interface ProcessedResult {
    original: File;
    processed: Blob;
    originalPreview: string;
    processedPreview: string;
    fileName: string;
    originalSize: number;
    processedSize: number;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/* Apply a solid background colour to a transparent PNG blob */
async function applyBackground(
    pngBlob: Blob,
    color: BackgroundColor,
    customHex: string,
): Promise<Blob> {
    if (color === "transparent") return pngBlob;

    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(pngBlob);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d")!;

            // Fill background
            if (color === "white") ctx.fillStyle = "#ffffff";
            else if (color === "black") ctx.fillStyle = "#000000";
            else ctx.fillStyle = customHex || "#ffffff";

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw image on top
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to apply background"));
            }, "image/jpeg", 0.95);
        };

        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
        img.src = url;
    });
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const BackgroundRemoverTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedResult[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);
    const [currentFile, setCurrentFile] = useState("");
    const [modelProgress, setModelProgress] = useState<number | null>(null);
    const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>("transparent");
    const [customColor, setCustomColor] = useState("#ffffff");
    const [sliderIdx, setSliderIdx] = useState(0); // for before/after
    const [sliderPos, setSliderPos] = useState(50); // 0-100
    const [showBgOptions, setShowBgOptions] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    /* ── File handling ── */
    const processFiles = useCallback((files: File[]) => {
        if (files.length > MAX_FILES) {
            toast.error(`Maximum ${MAX_FILES} images at once`, "Too many files");
            return;
        }

        const valid = files.filter(f => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE);
        const toolarge = files.filter(f => f.size > MAX_SIZE);
        const invalid = files.filter(f => !ACCEPTED_TYPES.includes(f.type));

        if (toolarge.length) toast.warning(`${toolarge.length} file(s) exceeded ${MAX_SIZE_MB} MB limit`, "Skipped");
        if (invalid.length) toast.warning(`${invalid.length} file(s) are not supported image types`, "Skipped");
        if (!valid.length) return;

        // Revoke old object URLs
        previews.forEach(p => URL.revokeObjectURL(p));

        setSelectedFiles(valid);
        setPreviews(valid.map(f => URL.createObjectURL(f)));
        setProcessedData([]);
        setProcessProgress(0);
        setCurrentFile("");
        toast.success(`${valid.length} image${valid.length > 1 ? "s" : ""} ready`, "Uploaded");
    }, [previews]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length) processFiles(files);
        e.target.value = "";
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) processFiles(files);
    };

    const removeFile = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setPreviews(newPreviews);
        if (!newFiles.length) resetForm();
    };

    /* ── Core removal — @imgly/background-removal ── */
    const removeSingle = async (file: File): Promise<ProcessedResult> => {
        // Dynamic import so the heavy ONNX library only loads when needed
        const { removeBackground } = await import("@imgly/background-removal");

        // Convert File → Blob URL (library accepts URL | Blob | ImageData)
        const inputUrl = URL.createObjectURL(file);

        let pngBlob: Blob;
        try {
            pngBlob = await removeBackground(inputUrl, {
                // ISNet-FP16: best quality, works on ANY subject (not just people)
                model: "isnet_fp16",
                output: { format: "image/png", quality: 1 },
                // Progress callback — fires for model download (first time) and inference
                progress: (key, current, total) => {
                    if (key.includes("fetch") || key.includes("download")) {
                        // Model is downloading (~30 MB, cached after first use)
                        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                        setModelProgress(pct < 100 ? pct : null);
                    }
                },
            });
        } finally {
            URL.revokeObjectURL(inputUrl);
        }

        // Apply background colour if not transparent
        const finalBlob = await applyBackground(pngBlob, backgroundColor, customColor);

        const ext = backgroundColor === "transparent" ? "png" : "jpg";
        const fileName = file.name.replace(/\.[^/.]+$/, `_no_bg.${ext}`);

        return {
            original: file,
            processed: finalBlob,
            originalPreview: URL.createObjectURL(file),
            processedPreview: URL.createObjectURL(finalBlob),
            fileName,
            originalSize: file.size,
            processedSize: finalBlob.size,
        };
    };

    /* ── Handle batch removal ── */
    const handleRemoveBackground = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload at least one image", "No files");
            return;
        }

        setLoading(true);
        setProcessProgress(0);
        setProcessedData([]);
        setModelProgress(null);

        const results: ProcessedResult[] = [];
        let failed = 0;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            setCurrentFile(file.name);

            try {
                const result = await removeSingle(file);
                results.push(result);
            } catch (err: any) {
                console.error(`Failed: ${file.name}`, err);
                failed++;
                toast.error(`Failed to process "${file.name}"`, "Error");
            }

            setProcessProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
        }

        setModelProgress(null);
        setCurrentFile("");

        if (results.length) {
            setProcessedData(results);
            setSliderIdx(0);
            setSliderPos(50);
            toast.success(
                `${results.length} image${results.length > 1 ? "s" : ""} processed!${failed ? ` (${failed} failed)` : ""}`,
                "Done"
            );
        } else {
            toast.error("All images failed to process", "Error");
        }

        setLoading(false);
        setProcessProgress(0);
    };

    /* ── Download ── */
    const downloadSingle = (item: ProcessedResult) => {
        saveAs(item.processed, item.fileName);
        toast.success(`Downloaded "${item.fileName}"`, "Done");
    };

    const downloadAll = async () => {
        if (!processedData.length) return;

        if (processedData.length === 1) {
            downloadSingle(processedData[0]);
            return;
        }

        toast.info("Creating ZIP…", "Please wait");
        const zip = new JSZip();
        processedData.forEach(item => zip.file(item.fileName, item.processed));
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "background-removed.zip");
        toast.success("ZIP downloaded!", "Done");
    };

    /* ── Before/After slider mouse handling ── */
    const handleSliderMouseMove = useCallback((e: React.MouseEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        setSliderPos(pos);
    }, []);

    const handleSliderTouchMove = useCallback((e: React.TouchEvent) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const pos = Math.max(0, Math.min(100, ((e.touches[0].clientX - rect.left) / rect.width) * 100));
        setSliderPos(pos);
    }, []);

    /* ── Reset ── */
    const resetForm = () => {
        previews.forEach(p => URL.revokeObjectURL(p));
        processedData.forEach(r => {
            URL.revokeObjectURL(r.originalPreview);
            URL.revokeObjectURL(r.processedPreview);
        });
        setSelectedFiles([]);
        setProcessedData([]);
        setPreviews([]);
        setProcessProgress(0);
        setCurrentFile("");
        setModelProgress(null);
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
            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Remove backgrounds from up to {MAX_FILES} images at once &mdash; all processing
                    happens locally in your browser.
                </p>
            </div>

            {/* Background Options Toggle */}
            <div className="bg-options-toggle-container">
                <button
                    type="button"
                    className="btn-toggle-options"
                    onClick={() => setShowBgOptions(!showBgOptions)}
                >
                    <div className="toggle-label">
                        <FiLayers />
                        <span>Background Options</span>
                    </div>
                    {showBgOptions ? <FiChevronUp /> : <FiChevronDown />}
                </button>
            </div>

            {/* Background Options Content */}
            <AnimatePresence>
                {showBgOptions && (
                    <motion.div
                        className="bg-options-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="bg-options-grid">
                            {([
                                { id: "transparent", label: "Transparent", sub: "PNG" },
                                { id: "white", label: "White", sub: "JPG" },
                                { id: "black", label: "Black", sub: "JPG" },
                                { id: "custom", label: "Custom", sub: "JPG" },
                            ] as { id: BackgroundColor; label: string; sub: string }[]).map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    className={`bg-option-btn${backgroundColor === opt.id ? " active" : ""}`}
                                    onClick={() => setBackgroundColor(opt.id)}
                                >
                                    {opt.id === "transparent" && <div className="bg-preview transparent-bg" />}
                                    {opt.id === "white" && <div className="bg-preview white-bg" />}
                                    {opt.id === "black" && <div className="bg-preview black-bg" />}
                                    {opt.id === "custom" && (
                                        <div
                                            className="bg-preview"
                                            style={{ background: customColor, border: "1px solid #e2e8f0" }}
                                        />
                                    )}
                                    <span>{opt.label}</span>
                                    <small>{opt.sub}</small>
                                </button>
                            ))}
                        </div>

                        {/* Custom colour picker */}
                        <AnimatePresence>
                            {backgroundColor === "custom" && (
                                <motion.div
                                    className="bgr-custom-color-row"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="bgr-custom-color-label">Pick colour:</label>
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={e => setCustomColor(e.target.value)}
                                        className="bgr-color-input"
                                    />
                                    <span className="bgr-color-hex">{customColor}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Info */}
            <motion.div
                className="ai-info-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <FiInfo className="ai-info-icon" />
                <div className="ai-info-content">
                    <p>
                        Uses the <strong>ISNet AI model</strong> via ONNX WebAssembly
                    </p>
                </div>
            </motion.div>

            {/* Upload Area */}
            <div
                className={`tool-upload-area${dragActive ? " drag-active" : ""}${selectedFiles.length > 0 ? " has-files" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    id="inputBgRemove"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                    disabled={loading}
                />
                <label htmlFor="inputBgRemove" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop images here</h3>
                    <p>or click to browse your device</p>

                    <div className="btn-browse">Browse files</div>

                    <div className="uploader-tags">
                        <div className="uploader-tag">
                            <FiFileText /> PNG, JPG, WebP
                        </div>
                        <div className="uploader-tag">
                            <FiZap /> Max {MAX_SIZE_MB} MB each
                        </div>
                        <div className="uploader-tag">
                            <FiLayers /> Up to {MAX_FILES} files
                        </div>
                    </div>
                </label>
            </div>

            {/* File Previews */}
            <AnimatePresence>
                {previews.length > 0 && (
                    <motion.div
                        className="tool-preview-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="preview-header">
                            <h3>Selected Files ({selectedFiles.length})</h3>
                            <button className="btn-clear-all" onClick={resetForm}>
                                <FiTrash2 /> Clear All
                            </button>
                        </div>

                        <div className="preview-grid">
                            {previews.map((src, i) => (
                                <motion.div
                                    key={i}
                                    className="preview-item"
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{ delay: i * 0.05 }}
                                    layout
                                >
                                    <img src={src} alt={`Preview ${i + 1}`} />
                                    <button
                                        className="preview-remove"
                                        onClick={() => removeFile(i)}
                                        disabled={loading}
                                    >
                                        <FiX />
                                    </button>
                                    <div className="preview-name">{selectedFiles[i].name}</div>
                                    <div className="preview-size">{fmtBytes(selectedFiles[i].size)}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Model download progress */}
                        <AnimatePresence>
                            {modelProgress !== null && (
                                <motion.div
                                    className="bgr-model-progress"
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                                        <motion.div
                                            className="bgr-model-icon"
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        >
                                            ✨
                                        </motion.div>
                                        <div style={{ flex: 1 }}>
                                            <motion.p
                                                key={Math.floor(modelProgress / 20)}
                                                className="bgr-model-title"
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {[
                                                    "Loading the scissors...",
                                                    "Waking up the AI...",
                                                    "Teaching pixels to disappear...",
                                                    "Fetching the background-slayer...",
                                                    "Almost there, promise...",
                                                ][Math.min(4, Math.floor(modelProgress / 20))]}
                                            </motion.p>
                                            <p className="bgr-model-sub">
                                                {modelProgress < 50
                                                    ? "Hold tight — this only downloads once, then it's instant"
                                                    : "Almost done! Future images will start immediately"}
                                            </p>
                                            <div className="bgr-model-progress-track">
                                                <motion.div
                                                    className="bgr-model-progress-fill"
                                                    animate={{ width: `${modelProgress}%` }}
                                                    transition={{ duration: 0.4 }}
                                                />
                                            </div>
                                            <p className="bgr-model-hint">
                                                Cached in your browser after this · {modelProgress}% complete
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Current file being processed */}
                        {loading && currentFile && (
                            <p className="bgr-processing-label">
                                Processing: <strong>{currentFile}</strong>
                            </p>
                        )}

                        {/* Process Button */}
                        <motion.button
                            type="button"
                            className="btn-convert btn-ai"
                            onClick={handleRemoveBackground}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Removing backgrounds… {processProgress}%
                                </>
                            ) : (
                                <>
                                    <FiScissors />
                                    Remove Background{selectedFiles.length > 1 ? "s" : ""}
                                </>
                            )}
                        </motion.button>

                        {/* Progress bar */}
                        {loading && (
                            <motion.div
                                className="progress-bar-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div
                                    className="progress-bar ai-progress"
                                    style={{ width: `${processProgress}%` }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
                {processedData.length > 0 && (
                    <motion.div
                        className="tool-result-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.45 }}
                    >
                        <div className="result-header">
                            <FiCheckCircle className="success-icon" />
                            <h3>Background Removal Complete!</h3>
                            <p>{processedData.length} image{processedData.length > 1 ? "s" : ""} processed</p>
                        </div>

                        {/* Thumbnail nav — when multiple results */}
                        {processedData.length > 1 && (
                            <div className="bgr-thumb-nav">
                                {processedData.map((item, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`bgr-thumb${sliderIdx === i ? " bgr-thumb--active" : ""}`}
                                        onClick={() => { setSliderIdx(i); setSliderPos(50); }}
                                    >
                                        <img
                                            src={item.processedPreview}
                                            alt={item.fileName}
                                            className={backgroundColor === "transparent" ? "bgr-checkered" : ""}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Before / After drag slider */}
                        {processedData[sliderIdx] && (
                            <div
                                className="bgr-slider-wrap"
                                ref={sliderRef}
                                onMouseMove={handleSliderMouseMove}
                                onTouchMove={handleSliderTouchMove}
                            >
                                {/* After (processed) — full width underneath */}
                                <div
                                    className={`bgr-slider-after${backgroundColor === "transparent" ? " bgr-checkered" : ""}`}
                                    style={{ background: backgroundColor === "white" ? "#fff" : backgroundColor === "black" ? "#000" : backgroundColor === "custom" ? customColor : undefined }}
                                >
                                    <img
                                        src={processedData[sliderIdx].processedPreview}
                                        alt="After"
                                        draggable={false}
                                    />
                                    <span className="bgr-slider-label bgr-slider-label--right">After</span>
                                </div>

                                {/* Before (original) — clips to left of slider */}
                                <div
                                    className="bgr-slider-before"
                                    style={{ width: `${sliderPos}%` }}
                                >
                                    <img
                                        src={processedData[sliderIdx].originalPreview}
                                        alt="Before"
                                        draggable={false}
                                    />
                                    <span className="bgr-slider-label bgr-slider-label--left">Before</span>
                                </div>

                                {/* Drag handle */}
                                <div
                                    className="bgr-slider-handle"
                                    style={{ left: `${sliderPos}%` }}
                                >
                                    <div className="bgr-slider-line" />
                                    <div className="bgr-slider-knob">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Drag hint */}
                                <span className="bgr-drag-hint">← Drag to compare →</span>
                            </div>
                        )}

                        {/* File info row */}
                        {processedData[sliderIdx] && (
                            <div className="bgr-file-info">
                                <span className="bgr-file-name">{processedData[sliderIdx].fileName}</span>
                                <span className="bgr-file-sizes">
                                    {fmtBytes(processedData[sliderIdx].originalSize)}
                                    <span className="bgr-arrow">→</span>
                                    {fmtBytes(processedData[sliderIdx].processedSize)}
                                </span>
                                <button
                                    type="button"
                                    className="bgr-btn-single-dl"
                                    onClick={() => downloadSingle(processedData[sliderIdx])}
                                >
                                    <FiDownload /> Download this
                                </button>
                            </div>
                        )}

                        {/* Download all */}
                        <motion.button
                            type="button"
                            className="btn-download"
                            onClick={downloadAll}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiDownload />
                            {processedData.length > 1 ? `Download All (${processedData.length}) as ZIP` : "Download Image"}
                        </motion.button>

                        {/* Process more */}
                        <button
                            type="button"
                            className="bgr-btn-reset"
                            onClick={resetForm}
                        >
                            <FiTrash2 /> Process new images
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BackgroundRemoverTool;

