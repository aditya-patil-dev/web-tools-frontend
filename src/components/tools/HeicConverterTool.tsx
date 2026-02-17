"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import heic2any from "heic2any";
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
    FiSmartphone
} from "react-icons/fi";
import { SiApple } from "react-icons/si";

const MAX_FILES = 25;
const ACCEPTED_TYPE = "image/heic";

type OutputFormat = "jpg" | "png";

interface ConversionResult {
    original: File;
    converted: File;
    originalSize: number;
    convertedSize: number;
    fileName: string;
    preview: string;
}

const HeicConverterTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [convertedData, setConvertedData] = useState<ConversionResult[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpg");
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);
    const [quality, setQuality] = useState<number>(92);

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

    const isHeicFile = (file: File): boolean => {
        const fileName = file.name.toLowerCase();
        const heicExtensions = ['.heic', '.heif'];
        return heicExtensions.some(ext => fileName.endsWith(ext)) ||
            file.type === 'image/heic' ||
            file.type === 'image/heif';
    };

    const processFiles = async (files: File[]) => {
        if (files.length > MAX_FILES) {
            toast.error(
                `You can only upload up to ${MAX_FILES} images.`,
                "Upload Limit Exceeded"
            );
            return;
        }

        const validFiles = files.filter((file) => isHeicFile(file));

        if (validFiles.length !== files.length) {
            toast.warning(
                "Only HEIC/HEIF image files are allowed.",
                "Invalid File Type"
            );
        }

        if (!validFiles.length) return;

        setSelectedFiles(validFiles);
        setConvertedData([]);
        setConvertProgress(0);

        // Create previews by converting to blob URLs
        try {
            const previewUrls: string[] = [];
            for (const file of validFiles) {
                try {
                    const blob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.5 // Lower quality for preview
                    });
                    const blobArray = Array.isArray(blob) ? blob : [blob];
                    previewUrls.push(URL.createObjectURL(blobArray[0]));
                } catch (err) {
                    console.error("Preview error:", err);
                    // Use placeholder if preview fails
                    previewUrls.push("");
                }
            }
            setPreviews(previewUrls);
        } catch (err) {
            console.error("Error creating previews:", err);
            setPreviews([]);
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
       Convert HEIC Logic
    ------------------------------ */

    const convertHeicFile = async (file: File): Promise<ConversionResult> => {
        try {
            const mimeType = outputFormat === "jpg" ? "image/jpeg" : "image/png";
            const extension = outputFormat === "jpg" ? ".jpg" : ".png";

            const blob = await heic2any({
                blob: file,
                toType: mimeType,
                quality: quality / 100
            });

            // heic2any can return array or single blob
            const resultBlob = Array.isArray(blob) ? blob[0] : blob;

            const fileName = file.name.replace(/\.(heic|heif)$/i, extension);
            const convertedFile = new File([resultBlob], fileName, {
                type: mimeType
            });

            return {
                original: file,
                converted: convertedFile,
                originalSize: file.size,
                convertedSize: convertedFile.size,
                fileName: fileName,
                preview: URL.createObjectURL(resultBlob)
            };
        } catch (error) {
            console.error("Conversion error:", error);
            throw new Error(`Failed to convert ${file.name}`);
        }
    };

    const handleConvert = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload HEIC files first.", "No Files Selected");
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
                    const result = await convertHeicFile(file);
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
                saveAs(blob, `heic-converted-${outputFormat}.zip`);

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
        const input = document.getElementById("inputHeic") as HTMLInputElement;
        if (input) input.value = "";
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
            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Convert up to {MAX_FILES} HEIC/HEIF images from iPhone to JPG or PNG format.
                    Perfect for sharing Apple photos on any device or platform.
                </p>
            </div>

            {/* HEIC Info Card */}
            <motion.div
                className="heic-info-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="heic-info-header">
                    <SiApple className="apple-icon" />
                    <h4>About HEIC Format</h4>
                </div>
                <div className="heic-info-content">
                    <div className="heic-info-item">
                        <FiSmartphone className="info-icon" />
                        <span>Default format for iPhone & iPad photos since iOS 11</span>
                    </div>
                    <div className="heic-info-item">
                        <FiImage className="info-icon" />
                        <span>50% smaller file size than JPG with same quality</span>
                    </div>
                    <div className="heic-info-item">
                        <FiCheckCircle className="info-icon" />
                        <span>Not widely supported outside Apple ecosystem</span>
                    </div>
                </div>
            </motion.div>

            {/* Output Format Selector */}
            <motion.div
                className="tool-format-selector"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <label className="format-label">Convert To:</label>
                <div className="format-options">
                    <button
                        className={`format-btn ${outputFormat === "jpg" ? "active" : ""}`}
                        onClick={() => setOutputFormat("jpg")}
                    >
                        <FiImage /> JPG
                        <span className="format-hint">Smaller, Photos</span>
                    </button>
                    <button
                        className={`format-btn ${outputFormat === "png" ? "active" : ""}`}
                        onClick={() => setOutputFormat("png")}
                    >
                        <FiImage /> PNG
                        <span className="format-hint">Larger, Quality</span>
                    </button>
                </div>
            </motion.div>

            {/* Quality Slider */}
            <motion.div
                className="quality-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
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
                    id="inputHeic"
                    type="file"
                    accept=".heic,.heif,image/heic,image/heif"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                />

                <label htmlFor="inputHeic" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop HEIC/HEIF files here or click to browse</h3>
                    <p>
                        iPhone/iPad photos • Up to {MAX_FILES} images
                    </p>
                </label>
            </div>

            {/* Previews */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
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
                            {selectedFiles.map((file, i) => (
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
                                    {previews[i] ? (
                                        <img src={previews[i]} alt={`Preview ${i + 1}`} />
                                    ) : (
                                        <div className="preview-placeholder">
                                            <FiImage />
                                            <span>HEIC</span>
                                        </div>
                                    )}
                                    <button
                                        className="preview-remove"
                                        onClick={() => removeFile(i)}
                                        title="Remove file"
                                    >
                                        <FiX />
                                    </button>
                                    <div className="format-badge heic">HEIC</div>
                                    <div className="preview-name">
                                        {file.name}
                                    </div>
                                    <div className="preview-size">
                                        {formatBytes(file.size)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Convert Button */}
                        <motion.button
                            className="btn-convert"
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
                            <p>{convertedData.length} HEIC image(s) converted to {outputFormat.toUpperCase()}</p>
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
                                    <div className="conversion-badge heic-conversion">
                                        HEIC → {outputFormat.toUpperCase()}
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
                            Download {convertedData.length > 1 ? `All as ZIP` : outputFormat.toUpperCase()}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HeicConverterTool;
