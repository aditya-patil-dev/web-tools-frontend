"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    FiMaximize2,
    FiLock,
    FiUnlock
} from "react-icons/fi";

const MAX_FILES = 25;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp"];

type ResizeMode = "custom" | "percentage" | "preset";
type PresetSize = "thumbnail" | "small" | "medium" | "large" | "hd" | "fullhd" | "4k";

interface PresetDimension {
    label: string;
    width: number;
    height: number;
}

interface ResizedResult {
    original: File;
    resized: File;
    originalWidth: number;
    originalHeight: number;
    newWidth: number;
    newHeight: number;
    preview: string;
}

const PRESET_SIZES: Record<PresetSize, PresetDimension> = {
    thumbnail: { label: "Thumbnail (150×150)", width: 150, height: 150 },
    small: { label: "Small (320×240)", width: 320, height: 240 },
    medium: { label: "Medium (640×480)", width: 640, height: 480 },
    large: { label: "Large (1024×768)", width: 1024, height: 768 },
    hd: { label: "HD (1280×720)", width: 1280, height: 720 },
    fullhd: { label: "Full HD (1920×1080)", width: 1920, height: 1080 },
    "4k": { label: "4K (3840×2160)", width: 3840, height: 2160 }
};

const ImageResizerTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [resizedData, setResizedData] = useState<ResizedResult[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);

    // Resize settings
    const [resizeMode, setResizeMode] = useState<ResizeMode>("custom");
    const [customWidth, setCustomWidth] = useState<number>(800);
    const [customHeight, setCustomHeight] = useState<number>(600);
    const [percentage, setPercentage] = useState<number>(50);
    const [presetSize, setPresetSize] = useState<PresetSize>("medium");
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [quality, setQuality] = useState<number>(92);

    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.width, height: img.height });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
            };
            img.src = url;
        });
    };

    /* -----------------------------
       File Handling
    ------------------------------ */

    const processFiles = async (files: File[]) => {
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
        setResizedData([]);
        setConvertProgress(0);

        // Auto-set dimensions from first image if in custom mode
        if (validFiles.length > 0 && resizeMode === "custom") {
            try {
                const dims = await getImageDimensions(validFiles[0]);
                setCustomWidth(Math.round(dims.width * 0.5));
                setCustomHeight(Math.round(dims.height * 0.5));
            } catch (err) {
                console.error("Error getting dimensions:", err);
            }
        }

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
       Resize Logic
    ------------------------------ */

    const resizeImage = async (file: File): Promise<ResizedResult> => {
        return new Promise(async (resolve, reject) => {
            try {
                const img = new Image();
                const url = URL.createObjectURL(file);

                img.onload = async () => {
                    URL.revokeObjectURL(url);

                    const originalWidth = img.width;
                    const originalHeight = img.height;

                    let targetWidth: number;
                    let targetHeight: number;

                    // Calculate target dimensions based on mode
                    if (resizeMode === "custom") {
                        targetWidth = customWidth;
                        targetHeight = customHeight;

                        if (maintainAspectRatio) {
                            const aspectRatio = originalWidth / originalHeight;
                            targetHeight = Math.round(targetWidth / aspectRatio);
                        }
                    } else if (resizeMode === "percentage") {
                        targetWidth = Math.round((originalWidth * percentage) / 100);
                        targetHeight = Math.round((originalHeight * percentage) / 100);
                    } else {
                        // preset mode
                        const preset = PRESET_SIZES[presetSize];
                        targetWidth = preset.width;
                        targetHeight = preset.height;

                        if (maintainAspectRatio) {
                            const aspectRatio = originalWidth / originalHeight;
                            const presetRatio = preset.width / preset.height;

                            if (aspectRatio > presetRatio) {
                                targetWidth = preset.width;
                                targetHeight = Math.round(preset.width / aspectRatio);
                            } else {
                                targetHeight = preset.height;
                                targetWidth = Math.round(preset.height * aspectRatio);
                            }
                        }
                    }

                    // Create canvas and resize
                    const canvas = document.createElement("canvas");
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        reject(new Error("Failed to get canvas context"));
                        return;
                    }

                    // Use high-quality image smoothing
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";

                    // Draw resized image
                    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error("Failed to create blob"));
                                return;
                            }

                            const resizedFile = new File(
                                [blob],
                                file.name,
                                { type: file.type }
                            );

                            resolve({
                                original: file,
                                resized: resizedFile,
                                originalWidth,
                                originalHeight,
                                newWidth: targetWidth,
                                newHeight: targetHeight,
                                preview: URL.createObjectURL(resizedFile)
                            });
                        },
                        file.type,
                        quality / 100
                    );
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error("Failed to load image"));
                };

                img.src = url;
            } catch (err) {
                reject(err);
            }
        });
    };

    const handleResize = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload image files first.", "No Files Selected");
            return;
        }

        setLoading(true);
        setConvertProgress(0);
        toast.info("Resizing images...", "Processing");

        try {
            const results: ResizedResult[] = [];
            const totalFiles = selectedFiles.length;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const result = await resizeImage(file);
                results.push(result);

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setConvertProgress(progress);
            }

            setResizedData(results);

            toast.success(
                `${results.length} image(s) resized successfully!`,
                "Resize Complete"
            );
        } catch (err) {
            console.error(err);
            toast.error(
                "Error resizing images. Please try again.",
                "Resize Failed"
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
        if (!resizedData.length) return;

        try {
            if (resizedData.length === 1) {
                saveAs(resizedData[0].resized, resizedData[0].resized.name);
                toast.success("Download started!", "Success");
            } else {
                toast.info("Creating ZIP file...", "Please wait");

                const zip = new JSZip();
                resizedData.forEach(item => {
                    zip.file(item.resized.name, item.resized);
                });
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, "resized-images.zip");

                toast.success("ZIP download started!", "Success");
            }

            setTimeout(() => {
                resetForm();
                toast.info("Ready for new resize!", "Reset Complete");
            }, 1500);
        } catch (err) {
            console.error(err);
            toast.error("Error downloading files.", "Download Failed");
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setResizedData([]);
        setPreviews([]);
        setConvertProgress(0);
        const input = document.getElementById("inputResizer") as HTMLInputElement;
        if (input) input.value = "";
    };

    /* -----------------------------
       Aspect Ratio Handler
    ------------------------------ */

    const handleWidthChange = (newWidth: number) => {
        setCustomWidth(newWidth);
        if (maintainAspectRatio && selectedFiles.length > 0) {
            getImageDimensions(selectedFiles[0]).then(dims => {
                const aspectRatio = dims.width / dims.height;
                setCustomHeight(Math.round(newWidth / aspectRatio));
            });
        }
    };

    const handleHeightChange = (newHeight: number) => {
        setCustomHeight(newHeight);
        if (maintainAspectRatio && selectedFiles.length > 0) {
            getImageDimensions(selectedFiles[0]).then(dims => {
                const aspectRatio = dims.width / dims.height;
                setCustomWidth(Math.round(newHeight * aspectRatio));
            });
        }
    };

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
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Resize up to {MAX_FILES} images with custom dimensions, percentages, or presets.
                    Maintain aspect ratio and control output quality.
                </p>
            </div>

            {/* Resize Mode Selector */}
            <motion.div
                className="resize-mode-selector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <label className="mode-label">Resize Mode:</label>
                <div className="mode-options">
                    <button
                        className={`mode-btn ${resizeMode === "custom" ? "active" : ""}`}
                        onClick={() => setResizeMode("custom")}
                    >
                        <FiMaximize2 /> Custom Size
                    </button>
                    <button
                        className={`mode-btn ${resizeMode === "percentage" ? "active" : ""}`}
                        onClick={() => setResizeMode("percentage")}
                    >
                        📊 Percentage
                    </button>
                    <button
                        className={`mode-btn ${resizeMode === "preset" ? "active" : ""}`}
                        onClick={() => setResizeMode("preset")}
                    >
                        📐 Preset Sizes
                    </button>
                </div>
            </motion.div>

            {/* Resize Settings */}
            <motion.div
                className="resize-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                {/* Custom Size Mode */}
                {resizeMode === "custom" && (
                    <div className="custom-size-controls">
                        <div className="dimension-inputs">
                            <div className="input-group">
                                <label>Width (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={customWidth}
                                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                                    className="dimension-input"
                                />
                            </div>

                            <button
                                className="aspect-ratio-toggle"
                                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                                title={maintainAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                            >
                                {maintainAspectRatio ? <FiLock /> : <FiUnlock />}
                            </button>

                            <div className="input-group">
                                <label>Height (px)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={customHeight}
                                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                                    className="dimension-input"
                                    disabled={maintainAspectRatio}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Percentage Mode */}
                {resizeMode === "percentage" && (
                    <div className="percentage-controls">
                        <label className="percentage-label">
                            Resize to {percentage}% of original size
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="200"
                            step="5"
                            value={percentage}
                            onChange={(e) => setPercentage(Number(e.target.value))}
                            className="percentage-slider"
                        />
                        <div className="percentage-hints">
                            <span>10% (Tiny)</span>
                            <span>100% (Original)</span>
                            <span>200% (Double)</span>
                        </div>
                    </div>
                )}

                {/* Preset Mode */}
                {resizeMode === "preset" && (
                    <div className="preset-controls">
                        <label className="preset-label">Select Preset Size:</label>
                        <div className="preset-grid">
                            {(Object.keys(PRESET_SIZES) as PresetSize[]).map((key) => (
                                <button
                                    key={key}
                                    className={`preset-btn ${presetSize === key ? "active" : ""}`}
                                    onClick={() => setPresetSize(key)}
                                >
                                    <span className="preset-name">{PRESET_SIZES[key].label}</span>
                                    <span className="preset-dims">
                                        {PRESET_SIZES[key].width} × {PRESET_SIZES[key].height}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="aspect-ratio-toggle-preset">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={maintainAspectRatio}
                                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                />
                                <span>Maintain aspect ratio (fit within preset)</span>
                            </label>
                        </div>
                    </div>
                )}

                {/* Quality Slider */}
                <div className="quality-controls">
                    <label className="quality-label">
                        Output Quality: {quality}%
                    </label>
                    <input
                        type="range"
                        min="60"
                        max="100"
                        step="5"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="quality-slider"
                    />
                    <div className="quality-hints">
                        <span>Good (60%)</span>
                        <span>Best (100%)</span>
                    </div>
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
                    id="inputResizer"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                />

                <label htmlFor="inputResizer" className="tool-upload-label">
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

                        {/* Resize Button */}
                        <motion.button
                            className="btn-convert"
                            onClick={handleResize}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Resizing... {convertProgress}%
                                </>
                            ) : (
                                <>
                                    <FiMaximize2 />
                                    Resize Images
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
                {resizedData.length > 0 && (
                    <motion.div
                        className="tool-result-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="result-header">
                            <FiCheckCircle className="success-icon" />
                            <h3>Resize Complete!</h3>
                            <p>{resizedData.length} image(s) resized successfully</p>
                        </div>

                        {/* Resized Images Grid */}
                        <div className="preview-grid">
                            {resizedData.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="preview-item resized"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <img
                                        src={item.preview}
                                        alt={`Resized ${i + 1}`}
                                    />
                                    <div className="resize-info-badge">
                                        {item.newWidth} × {item.newHeight}
                                    </div>
                                    <div className="preview-name">{item.resized.name}</div>
                                    <div className="preview-dimensions">
                                        <span className="dim-before">
                                            {item.originalWidth} × {item.originalHeight}
                                        </span>
                                        <span className="dim-arrow">→</span>
                                        <span className="dim-after">
                                            {item.newWidth} × {item.newHeight}
                                        </span>
                                    </div>
                                    <div className="preview-size">
                                        {formatBytes(item.resized.size)}
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
                            Download {resizedData.length > 1 ? "All as ZIP" : "Image"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ImageResizerTool;