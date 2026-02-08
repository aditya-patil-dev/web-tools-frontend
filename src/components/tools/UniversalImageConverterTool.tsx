"use client";

import { useState } from "react";
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
    FiImage,
    FiLayers,
    FiZap
} from "react-icons/fi";

const MAX_FILES = 25;
const ACCEPTED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/svg+xml"
];

type ImageFormat = "png" | "jpg" | "webp" | "gif" | "bmp";

interface FormatOption {
    value: ImageFormat;
    label: string;
    extension: string;
    description: string;
    icon: string;
}

interface ConversionResult {
    original: File;
    converted: File;
    originalFormat: string;
    targetFormat: string;
    originalSize: number;
    convertedSize: number;
    fileName: string;
    preview: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
    {
        value: "png",
        label: "PNG",
        extension: ".png",
        description: "Lossless, Transparency",
        icon: "🖼️"
    },
    {
        value: "jpg",
        label: "JPG",
        extension: ".jpg",
        description: "Compressed, Photos",
        icon: "📸"
    },
    {
        value: "webp",
        label: "WebP",
        extension: ".webp",
        description: "Modern, Smallest",
        icon: "⚡"
    },
    {
        value: "gif",
        label: "GIF",
        extension: ".gif",
        description: "Animations, Limited Colors",
        icon: "🎬"
    },
    {
        value: "bmp",
        label: "BMP",
        extension: ".bmp",
        description: "Uncompressed, Large",
        icon: "🎨"
    }
];

const UniversalImageConverterTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [convertedData, setConvertedData] = useState<ConversionResult[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [outputFormat, setOutputFormat] = useState<ImageFormat>("png");
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);
    const [quality, setQuality] = useState<number>(92);
    const [maintainTransparency, setMaintainTransparency] = useState(true);

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

    const getFormatFromMimeType = (mimeType: string): string => {
        const formats: Record<string, string> = {
            'image/png': 'PNG',
            'image/jpeg': 'JPG',
            'image/jpg': 'JPG',
            'image/webp': 'WebP',
            'image/gif': 'GIF',
            'image/bmp': 'BMP',
            'image/tiff': 'TIFF',
            'image/svg+xml': 'SVG'
        };
        return formats[mimeType] || 'Unknown';
    };

    const getMimeTypeFromFormat = (format: ImageFormat): string => {
        const mimeTypes: Record<ImageFormat, string> = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'webp': 'image/webp',
            'gif': 'image/gif',
            'bmp': 'image/bmp'
        };
        return mimeTypes[format];
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
                "Only image files are allowed.",
                "Invalid File Type"
            );
        }

        if (!validFiles.length) return;

        setSelectedFiles(validFiles);
        setPreviews(validFiles.map(file => URL.createObjectURL(file)));
        setConvertedData([]);
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
       Conversion Logic
    ------------------------------ */

    const convertImage = async (file: File): Promise<ConversionResult> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    // High-quality rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';

                    // Handle transparency for formats that don't support it
                    if (outputFormat === 'jpg' || outputFormat === 'bmp') {
                        if (!maintainTransparency) {
                            // Fill with white background
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                    }

                    // Draw image
                    ctx.drawImage(img, 0, 0);

                    // Special handling for GIF (convert to static image)
                    const targetMimeType = getMimeTypeFromFormat(outputFormat);
                    const qualityValue = outputFormat === 'png' ? 1 : quality / 100;

                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to create blob'));
                                return;
                            }

                            const originalFormat = getFormatFromMimeType(file.type);
                            const fileName = file.name.replace(/\.[^/.]+$/, '') +
                                FORMAT_OPTIONS.find(f => f.value === outputFormat)!.extension;

                            const convertedFile = new File([blob], fileName, {
                                type: targetMimeType
                            });

                            resolve({
                                original: file,
                                converted: convertedFile,
                                originalFormat,
                                targetFormat: outputFormat.toUpperCase(),
                                originalSize: file.size,
                                convertedSize: blob.size,
                                fileName,
                                preview: URL.createObjectURL(blob)
                            });
                        },
                        targetMimeType,
                        qualityValue
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    };

    const handleConvert = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload image files first.", "No Files Selected");
            return;
        }

        setLoading(true);
        setConvertProgress(0);
        toast.info(`Converting to ${outputFormat.toUpperCase()}...`, "Processing");

        try {
            const results: ConversionResult[] = [];
            const totalFiles = selectedFiles.length;
            let failedCount = 0;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                try {
                    const result = await convertImage(file);
                    results.push(result);
                } catch (err) {
                    console.error(`Failed to convert ${file.name}:`, err);
                    failedCount++;
                }

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setConvertProgress(progress);
            }

            if (results.length > 0) {
                setConvertedData(results);
                toast.success(
                    `${results.length} image(s) converted to ${outputFormat.toUpperCase()}!`,
                    "Conversion Complete"
                );

                if (failedCount > 0) {
                    toast.warning(
                        `${failedCount} file(s) failed to convert.`,
                        "Partial Success"
                    );
                }
            } else {
                toast.error(
                    "All conversions failed. Please try again.",
                    "Conversion Failed"
                );
            }
        } catch (err) {
            console.error(err);
            toast.error(
                "Error converting images. Please try again.",
                "Conversion Failed"
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
        if (!convertedData.length) return;

        try {
            if (convertedData.length === 1) {
                saveAs(convertedData[0].converted, convertedData[0].fileName);
                toast.success("Download started!", "Success");
            } else {
                toast.info("Creating ZIP file...", "Please wait");

                const zip = new JSZip();
                convertedData.forEach(item => {
                    zip.file(item.fileName, item.converted);
                });
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, `converted-to-${outputFormat}.zip`);

                toast.success("ZIP download started!", "Success");
            }

            setTimeout(() => {
                resetForm();
                toast.info("Ready for new conversion!", "Reset Complete");
            }, 1500);
        } catch (err) {
            console.error(err);
            toast.error("Error downloading files.", "Download Failed");
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setConvertedData([]);
        setPreviews([]);
        setConvertProgress(0);
        const input = document.getElementById("inputUniversal") as HTMLInputElement;
        if (input) input.value = "";
    };

    /* -----------------------------
       Statistics
    ------------------------------ */

    const totalOriginalSize = convertedData.reduce((sum, item) => sum + item.originalSize, 0);
    const totalConvertedSize = convertedData.reduce((sum, item) => sum + item.convertedSize, 0);
    const sizeDifference = totalOriginalSize - totalConvertedSize;
    const percentageChange = totalOriginalSize > 0
        ? ((sizeDifference / totalOriginalSize) * 100)
        : 0;

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
                    Universal image converter supporting PNG, JPG, WebP, GIF, and BMP formats.
                    Convert up to {MAX_FILES} images with batch processing.
                </p>
            </div>

            {/* Format Info Grid */}
            <motion.div
                className="format-info-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="format-info-header">
                    <FiLayers />
                    <h4>Supported Formats</h4>
                </div>
                <div className="format-cards">
                    {FORMAT_OPTIONS.map((format) => (
                        <div key={format.value} className="format-card-mini">
                            <span className="format-icon">{format.icon}</span>
                            <div className="format-details">
                                <strong>{format.label}</strong>
                                <small>{format.description}</small>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Output Format Selector */}
            <motion.div
                className="universal-format-selector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <label className="format-selector-label">
                    <FiZap /> Convert To:
                </label>
                <div className="format-options-universal">
                    {FORMAT_OPTIONS.map((format) => (
                        <button
                            key={format.value}
                            className={`format-option-btn ${outputFormat === format.value ? "active" : ""}`}
                            onClick={() => setOutputFormat(format.value)}
                        >
                            <span className="format-icon-large">{format.icon}</span>
                            <div className="format-info">
                                <strong>{format.label}</strong>
                                <small>{format.description}</small>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Quality & Options */}
            <motion.div
                className="conversion-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {/* Quality Slider (not for PNG) */}
                {outputFormat !== "png" && (
                    <div className="quality-control">
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
                            <span>Recommended (92%)</span>
                            <span>Best (100%)</span>
                        </div>
                    </div>
                )}

                {/* Transparency Option */}
                {(outputFormat === "jpg" || outputFormat === "bmp") && (
                    <div className="transparency-option">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={!maintainTransparency}
                                onChange={(e) => setMaintainTransparency(!e.target.checked)}
                            />
                            <span>Replace transparency with white background</span>
                        </label>
                        <small className="option-hint">
                            {outputFormat.toUpperCase()} does not support transparency
                        </small>
                    </div>
                )}

                {outputFormat === "png" && (
                    <div className="format-note">
                        <FiCheckCircle />
                        <span>PNG conversion is lossless - original quality preserved</span>
                    </div>
                )}

                {outputFormat === "webp" && (
                    <div className="format-note webp-note">
                        <FiZap />
                        <span>WebP provides 25-35% smaller files than PNG/JPG</span>
                    </div>
                )}
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
                    id="inputUniversal"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                />

                <label htmlFor="inputUniversal" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop images here or click to browse</h3>
                    <p>
                        Supports PNG, JPG, WebP, GIF, BMP, TIFF, SVG • Up to {MAX_FILES} images
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
                                    <div className="format-badge-universal">
                                        {getFormatFromMimeType(selectedFiles[i].type)}
                                    </div>
                                    <div className="preview-name">
                                        {selectedFiles[i].name}
                                    </div>
                                    <div className="preview-size">
                                        {formatBytes(selectedFiles[i].size)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Convert Button */}
                        <motion.button
                            className="btn-convert btn-universal"
                            onClick={handleConvert}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Converting... {convertProgress}%
                                </>
                            ) : (
                                <>
                                    <RiArrowLeftRightFill />
                                    Convert to {outputFormat.toUpperCase()}
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
                                    className="progress-bar universal-progress"
                                    style={{ width: `${convertProgress}%` }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Section */}
            <AnimatePresence>
                {convertedData.length > 0 && (
                    <motion.div
                        className="tool-result-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="result-header">
                            <FiCheckCircle className="success-icon" />
                            <h3>Conversion Complete!</h3>
                            <p>{convertedData.length} image(s) converted to {outputFormat.toUpperCase()}</p>
                        </div>

                        {/* Conversion Stats */}
                        <div className="conversion-stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">Original Size</span>
                                <span className="stat-value">{formatBytes(totalOriginalSize)}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Converted Size</span>
                                <span className="stat-value">{formatBytes(totalConvertedSize)}</span>
                            </div>
                            <div className={`stat-card ${percentageChange > 0 ? 'highlight' : ''}`}>
                                <span className="stat-label">Size Change</span>
                                <span className="stat-value">
                                    {percentageChange > 0 ? '-' : '+'}{Math.abs(percentageChange).toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Converted Images Grid */}
                        <div className="preview-grid">
                            {convertedData.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="preview-item converted"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <img
                                        src={item.preview}
                                        alt={`Converted ${i + 1}`}
                                    />
                                    <div className="conversion-badge-universal">
                                        {item.originalFormat} → {item.targetFormat}
                                    </div>
                                    <div className="preview-name">{item.fileName}</div>
                                    <div className="preview-sizes">
                                        <span className="size-before">{formatBytes(item.originalSize)}</span>
                                        <span className="size-arrow">→</span>
                                        <span className="size-after">{formatBytes(item.convertedSize)}</span>
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
                            Download {convertedData.length > 1 ? "All as ZIP" : outputFormat.toUpperCase()}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UniversalImageConverterTool;
