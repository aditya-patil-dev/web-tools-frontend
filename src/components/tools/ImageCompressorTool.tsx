"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import { RiArrowLeftRightFill } from "react-icons/ri";
import {
    FiUpload,
    FiDownload,
    FiX,
    FiCheckCircle,
    FiTrash2,
    FiTrendingDown,
    FiImage
} from "react-icons/fi";

const MAX_FILES = 25;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp"];

interface CompressionResult {
    original: File;
    compressed: File;
    originalSize: number;
    compressedSize: number;
    savedBytes: number;
    savedPercent: number;
    preview: string;
}

const ImageCompressorTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [compressedData, setCompressedData] = useState<CompressionResult[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [compressionLevel, setCompressionLevel] = useState<number>(50);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);

    /* -----------------------------
       Helper Functions
    ------------------------------ */

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = 2;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    /* -----------------------------
       File Handling
    ------------------------------ */

    const processFiles = (files: File[]) => {
        if (files.length > MAX_FILES) {
            toast.error(
                `You can only upload up to ${MAX_FILES} images.`,
                "Upload Limit Exceeded"
            );
            return;
        }

        const validFiles = files.filter((file) =>
            ACCEPTED_TYPES.includes(file.type)
        );

        if (validFiles.length !== files.length) {
            toast.warning(
                "Only image files (PNG, JPG, WebP, GIF, BMP) are allowed.",
                "Invalid File Type"
            );
        }

        if (!validFiles.length) return;

        setSelectedFiles(validFiles);
        setPreviews(validFiles.map(file => URL.createObjectURL(file)));
        setCompressedData([]);
        setConvertProgress(0);

        toast.success(
            `${validFiles.length} file(s) uploaded successfully!`,
            "Upload Complete"
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        processFiles(files);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);

        setSelectedFiles(newFiles);
        setPreviews(newPreviews);

        if (newFiles.length === 0) {
            resetForm();
        } else {
            toast.info("File removed");
        }
    };

    /* -----------------------------
       Drag & Drop
    ------------------------------ */

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files
            ? Array.from(e.dataTransfer.files)
            : [];

        processFiles(files);
    };

    /* -----------------------------
       Compress Logic
    ------------------------------ */

    const handleCompress = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload image files first.", "No Files Selected");
            return;
        }

        setLoading(true);
        setConvertProgress(0);
        toast.info("Compressing images...", "Processing");

        try {
            const results: CompressionResult[] = [];
            const totalFiles = selectedFiles.length;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const originalSize = file.size;

                // Calculate max size based on compression level
                const originalSizeMB = file.size / (1024 * 1024);
                const maxSizeMB = Math.max(originalSizeMB * (compressionLevel / 100), 0.01);

                const options = {
                    maxSizeMB: maxSizeMB,
                    useWebWorker: true,
                    maxWidthOrHeight: 4096, // Prevent extreme upscaling
                    initialQuality: compressionLevel / 100,
                };

                const compressedBlob = await imageCompression(file, options);
                const compressedFile = new File([compressedBlob], file.name, {
                    type: file.type,
                });

                const compressedSize = compressedFile.size;
                const savedBytes = originalSize - compressedSize;
                const savedPercent = ((savedBytes / originalSize) * 100);

                results.push({
                    original: file,
                    compressed: compressedFile,
                    originalSize,
                    compressedSize,
                    savedBytes,
                    savedPercent: savedPercent > 0 ? savedPercent : 0,
                    preview: URL.createObjectURL(compressedFile)
                });

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setConvertProgress(progress);
            }

            setCompressedData(results);

            const totalSaved = results.reduce((sum, r) => sum + r.savedBytes, 0);
            toast.success(
                `${results.length} image(s) compressed! Saved ${formatBytes(totalSaved)}`,
                "Compression Complete"
            );
        } catch (err) {
            console.error(err);
            toast.error(
                "Error compressing images. Please try again.",
                "Compression Failed"
            );
        } finally {
            setLoading(false);
            setConvertProgress(0);
        }
    };

    /* -----------------------------
       Download
    ------------------------------ */

    const handleDownload = async () => {
        if (!compressedData.length) return;

        try {
            if (compressedData.length === 1) {
                saveAs(compressedData[0].compressed, compressedData[0].compressed.name);
                toast.success("Download started!", "Success");
            } else {
                toast.info("Creating ZIP file...", "Please wait");

                const zip = new JSZip();
                compressedData.forEach(item => {
                    zip.file(item.compressed.name, item.compressed);
                });
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, "compressed-images.zip");

                toast.success("ZIP download started!", "Success");
            }

            setTimeout(() => {
                resetForm();
                toast.info("Ready for new compression!", "Reset Complete");
            }, 1500);
        } catch (err) {
            console.error(err);
            toast.error("Error downloading files.", "Download Failed");
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setCompressedData([]);
        setPreviews([]);
        setConvertProgress(0);
        const input = document.getElementById("inputCompressor") as HTMLInputElement;
        if (input) input.value = "";
    };

    /* -----------------------------
       Calculate Stats
    ------------------------------ */

    const totalOriginalSize = compressedData.reduce((sum, item) => sum + item.originalSize, 0);
    const totalCompressedSize = compressedData.reduce((sum, item) => sum + item.compressedSize, 0);
    const totalSaved = totalOriginalSize - totalCompressedSize;
    const totalSavedPercent = totalOriginalSize > 0 ? ((totalSaved / totalOriginalSize) * 100) : 0;

    /* -----------------------------
       UI
    ------------------------------ */

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
                    Compress up to {MAX_FILES} images to reduce file size while maintaining quality.
                    Supports PNG, JPG, WebP, GIF, and BMP formats.
                </p>
            </div>

            {/* Compression Level Selector */}
            <motion.div
                className="tool-compression-selector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <label className="compression-label">
                    <FiTrendingDown /> Compression Level: {compressionLevel}%
                </label>
                <input
                    type="range"
                    min="10"
                    max="90"
                    step="10"
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(Number(e.target.value))}
                    className="compression-slider"
                />
                <div className="compression-hints">
                    <span className="hint-low">Higher Quality</span>
                    <span className="hint-high">Smaller Size</span>
                </div>
            </motion.div>

            {/* Upload Area */}
            <div
                className={`tool-upload-area ${dragActive ? "drag-active" : ""} ${selectedFiles.length > 0 ? "has-files" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    id="inputCompressor"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                />

                <label htmlFor="inputCompressor" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop images here or click to browse</h3>
                    <p>
                        Supports PNG, JPG, WebP, GIF, BMP • Up to {MAX_FILES} images
                    </p>
                </label>
            </div>

            {/* Previews */}
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
                            <button
                                className="btn-clear-all"
                                onClick={resetForm}
                                title="Clear all files"
                            >
                                <FiTrash2 /> Clear All
                            </button>
                        </div>

                        <div className="preview-grid">
                            {previews.map((src, i) => (
                                <motion.div
                                    key={i}
                                    className="preview-item"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{
                                        delay: i * 0.05,
                                        duration: 0.3
                                    }}
                                    layout
                                >
                                    <img src={src} alt={`Preview ${i + 1}`} />
                                    <button
                                        className="preview-remove"
                                        onClick={() => removeFile(i)}
                                        title="Remove file"
                                    >
                                        <FiX />
                                    </button>
                                    <div className="preview-name">
                                        {selectedFiles[i].name}
                                    </div>
                                    <div className="preview-size">
                                        {formatBytes(selectedFiles[i].size)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Compress Button */}
                        <motion.button
                            className="btn-convert"
                            onClick={handleCompress}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Compressing... {convertProgress}%
                                </>
                            ) : (
                                <>
                                    <FiTrendingDown />
                                    Compress Images
                                </>
                            )}
                        </motion.button>

                        {/* Progress Bar */}
                        {loading && (
                            <motion.div
                                className="progress-bar-container"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div
                                    className="progress-bar"
                                    style={{ width: `${convertProgress}%` }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Section */}
            <AnimatePresence>
                {compressedData.length > 0 && (
                    <motion.div
                        className="tool-result-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="result-header">
                            <FiCheckCircle className="success-icon" />
                            <h3>Compression Complete!</h3>
                            <p>{compressedData.length} image(s) compressed successfully</p>
                        </div>

                        {/* Compression Stats */}
                        <div className="compression-stats">
                            <div className="stat-card">
                                <span className="stat-label">Original Size</span>
                                <span className="stat-value">{formatBytes(totalOriginalSize)}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Compressed Size</span>
                                <span className="stat-value">{formatBytes(totalCompressedSize)}</span>
                            </div>
                            <div className="stat-card highlight">
                                <span className="stat-label">Total Saved</span>
                                <span className="stat-value">
                                    {formatBytes(totalSaved)} ({totalSavedPercent.toFixed(1)}%)
                                </span>
                            </div>
                        </div>

                        {/* Compressed Images Grid */}
                        <div className="preview-grid">
                            {compressedData.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="preview-item compressed"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <img
                                        src={item.preview}
                                        alt={`Compressed ${i + 1}`}
                                    />
                                    <div className="compression-badge">
                                        -{item.savedPercent.toFixed(0)}%
                                    </div>
                                    <div className="preview-name">{item.compressed.name}</div>
                                    <div className="preview-sizes">
                                        <span className="size-before">{formatBytes(item.originalSize)}</span>
                                        <span className="size-arrow">→</span>
                                        <span className="size-after">{formatBytes(item.compressedSize)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Download Button */}
                        <motion.button
                            className="btn-download"
                            onClick={handleDownload}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiDownload />
                            Download {compressedData.length > 1 ? "All as ZIP" : "Image"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ImageCompressorTool;