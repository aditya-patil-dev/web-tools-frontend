"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
    FiUpload,
    FiDownload,
    FiX,
    FiCheckCircle,
    FiTrash2,
    FiScissors,
    FiCpu,
    FiLayers,
    FiInfo
} from "react-icons/fi";

const MAX_FILES = 10; // Reduced for performance
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

type BackgroundColor = "transparent" | "white" | "black" | "blur";

interface ProcessedResult {
    original: File;
    processed: File;
    originalPreview: string;
    processedPreview: string;
    fileName: string;
}

const BackgroundRemoverTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedResult[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);
    const [backgroundColor, setBackgroundColor] = useState<BackgroundColor>("transparent");
    const [edgeBlur, setEdgeBlur] = useState<number>(3);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<bodyPix.BodyPix | null>(null);

    /* -----------------------------
       Load TensorFlow Model
    ------------------------------ */

    useEffect(() => {
        loadModel();

        return () => {
            // Cleanup
            if (modelRef.current) {
                modelRef.current = null;
            }
        };
    }, []);

    const loadModel = async () => {
        if (modelRef.current) return; // Already loaded

        setModelLoading(true);
        toast.info("Loading AI model... This may take a moment.", "Initializing");

        try {
            // Set backend to WebGL for better performance
            await tf.setBackend('webgl');
            await tf.ready();

            // Load BodyPix model with optimized settings
            const net = await bodyPix.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                multiplier: 0.75,
                quantBytes: 2
            });

            modelRef.current = net;
            toast.success("AI model loaded successfully!", "Ready");
        } catch (error) {
            console.error("Error loading model:", error);
            toast.error(
                "Failed to load AI model. Please refresh and try again.",
                "Model Error"
            );
        } finally {
            setModelLoading(false);
        }
    };

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
                `You can only process up to ${MAX_FILES} images at once for optimal performance.`,
                "Upload Limit Exceeded"
            );
            return;
        }

        const validFiles = files.filter((file) =>
            ACCEPTED_TYPES.includes(file.type)
        );

        if (validFiles.length !== files.length) {
            toast.warning(
                "Only image files (PNG, JPG, WebP) are allowed.",
                "Invalid File Type"
            );
        }

        if (!validFiles.length) return;

        setSelectedFiles(validFiles);
        setPreviews(validFiles.map(file => URL.createObjectURL(file)));
        setProcessedData([]);
        setProcessProgress(0);

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
       Background Removal Logic
    ------------------------------ */

    const removeBackground = async (file: File): Promise<ProcessedResult> => {
        return new Promise(async (resolve, reject) => {
            try {
                if (!modelRef.current) {
                    throw new Error("Model not loaded");
                }

                const img = new Image();
                const url = URL.createObjectURL(file);

                img.onload = async () => {
                    URL.revokeObjectURL(url);

                    try {
                        // Get segmentation
                        const segmentation = await modelRef.current!.segmentPerson(img, {
                            flipHorizontal: false,
                            internalResolution: 'medium',
                            segmentationThreshold: 0.7,
                        });

                        // Create canvas
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');

                        if (!ctx) {
                            throw new Error("Failed to get canvas context");
                        }

                        // Draw original image
                        ctx.drawImage(img, 0, 0);

                        // Get image data
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const pixels = imageData.data;

                        // Process based on background color choice
                        if (backgroundColor === "transparent") {
                            // Make background transparent
                            for (let i = 0; i < segmentation.data.length; i++) {
                                if (segmentation.data[i] === 0) {
                                    pixels[i * 4 + 3] = 0; // Set alpha to 0
                                } else if (edgeBlur > 0) {
                                    // Smooth edges
                                    const alpha = pixels[i * 4 + 3];
                                    pixels[i * 4 + 3] = Math.min(255, alpha + edgeBlur * 10);
                                }
                            }
                        } else {
                            // Replace with solid color or blur
                            let bgR = 255, bgG = 255, bgB = 255;

                            if (backgroundColor === "black") {
                                bgR = bgG = bgB = 0;
                            } else if (backgroundColor === "white") {
                                bgR = bgG = bgB = 255;
                            }

                            for (let i = 0; i < segmentation.data.length; i++) {
                                if (segmentation.data[i] === 0) {
                                    if (backgroundColor === "blur") {
                                        // Apply blur effect (simplified)
                                        pixels[i * 4] = pixels[i * 4] * 0.5;
                                        pixels[i * 4 + 1] = pixels[i * 4 + 1] * 0.5;
                                        pixels[i * 4 + 2] = pixels[i * 4 + 2] * 0.5;
                                    } else {
                                        pixels[i * 4] = bgR;
                                        pixels[i * 4 + 1] = bgG;
                                        pixels[i * 4 + 2] = bgB;
                                    }
                                }
                            }
                        }

                        // Put processed image data back
                        ctx.putImageData(imageData, 0, 0);

                        // Convert to blob
                        canvas.toBlob((blob) => {
                            if (!blob) {
                                reject(new Error("Failed to create blob"));
                                return;
                            }

                            const fileName = file.name.replace(/\.[^/.]+$/, '') +
                                (backgroundColor === "transparent" ? '.png' : '.jpg');
                            const processedFile = new File(
                                [blob],
                                fileName,
                                { type: backgroundColor === "transparent" ? 'image/png' : 'image/jpeg' }
                            );

                            resolve({
                                original: file,
                                processed: processedFile,
                                originalPreview: URL.createObjectURL(file),
                                processedPreview: URL.createObjectURL(blob),
                                fileName: fileName
                            });
                        }, backgroundColor === "transparent" ? 'image/png' : 'image/jpeg', 0.95);

                    } catch (error) {
                        reject(error);
                    }
                };

                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error("Failed to load image"));
                };

                img.src = url;
            } catch (error) {
                reject(error);
            }
        });
    };

    const handleRemoveBackground = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload images first.", "No Files Selected");
            return;
        }

        if (!modelRef.current) {
            toast.error("AI model is still loading. Please wait.", "Model Not Ready");
            return;
        }

        setLoading(true);
        setProcessProgress(0);
        toast.info("Removing backgrounds with AI...", "Processing");

        try {
            const results: ProcessedResult[] = [];
            const totalFiles = selectedFiles.length;
            let failedCount = 0;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                try {
                    const result = await removeBackground(file);
                    results.push(result);
                } catch (err) {
                    console.error(`Failed to process ${file.name}:`, err);
                    failedCount++;
                }

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setProcessProgress(progress);
            }

            if (results.length > 0) {
                setProcessedData(results);
                toast.success(
                    `${results.length} background(s) removed successfully!`,
                    "Processing Complete"
                );

                if (failedCount > 0) {
                    toast.warning(
                        `${failedCount} file(s) failed to process.`,
                        "Partial Success"
                    );
                }
            } else {
                toast.error(
                    "All processing failed. Please try again.",
                    "Processing Failed"
                );
            }
        } catch (err) {
            console.error(err);
            toast.error(
                "Error processing images. Please try again.",
                "Processing Failed"
            );
        } finally {
            setLoading(false);
            setProcessProgress(0);
        }
    };

    /* -----------------------------
       Download
    ------------------------------ */

    const handleDownload = async () => {
        if (!processedData.length) return;

        try {
            if (processedData.length === 1) {
                saveAs(processedData[0].processed, processedData[0].fileName);
                toast.success("Download started!", "Success");
            } else {
                toast.info("Creating ZIP file...", "Please wait");

                const zip = new JSZip();
                processedData.forEach(item => {
                    zip.file(item.fileName, item.processed);
                });
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, "background-removed.zip");

                toast.success("ZIP download started!", "Success");
            }

            setTimeout(() => {
                resetForm();
                toast.info("Ready for new processing!", "Reset Complete");
            }, 1500);
        } catch (err) {
            console.error(err);
            toast.error("Error downloading files.", "Download Failed");
        }
    };

    const resetForm = () => {
        setSelectedFiles([]);
        setProcessedData([]);
        setPreviews([]);
        setProcessProgress(0);
        const input = document.getElementById("inputBgRemove") as HTMLInputElement;
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
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Remove backgrounds from images using AI-powered segmentation.
                    Process up to {MAX_FILES} images with TensorFlow BodyPix model.
                </p>
            </div>

            {/* AI Model Status */}
            {modelLoading && (
                <motion.div
                    className="ai-model-loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="model-loading-content">
                        <FiCpu className="model-icon spinning" />
                        <div>
                            <h4>Loading AI Model...</h4>
                            <p>Initializing TensorFlow BodyPix for background removal</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Background Options */}
            <motion.div
                className="bg-options-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <label className="bg-options-label">
                    <FiLayers /> Replace Background With:
                </label>
                <div className="bg-options-grid">
                    <button
                        className={`bg-option-btn ${backgroundColor === "transparent" ? "active" : ""}`}
                        onClick={() => setBackgroundColor("transparent")}
                    >
                        <div className="bg-preview transparent-bg" />
                        <span>Transparent</span>
                        <small>PNG format</small>
                    </button>
                    <button
                        className={`bg-option-btn ${backgroundColor === "white" ? "active" : ""}`}
                        onClick={() => setBackgroundColor("white")}
                    >
                        <div className="bg-preview white-bg" />
                        <span>White</span>
                        <small>JPG format</small>
                    </button>
                    <button
                        className={`bg-option-btn ${backgroundColor === "black" ? "active" : ""}`}
                        onClick={() => setBackgroundColor("black")}
                    >
                        <div className="bg-preview black-bg" />
                        <span>Black</span>
                        <small>JPG format</small>
                    </button>
                    <button
                        className={`bg-option-btn ${backgroundColor === "blur" ? "active" : ""}`}
                        onClick={() => setBackgroundColor("blur")}
                    >
                        <div className="bg-preview blur-bg" />
                        <span>Blur</span>
                        <small>JPG format</small>
                    </button>
                </div>
            </motion.div>

            {/* Edge Blur Slider */}
            {backgroundColor === "transparent" && (
                <motion.div
                    className="edge-blur-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <label className="edge-blur-label">
                        Edge Smoothing: {edgeBlur}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={edgeBlur}
                        onChange={(e) => setEdgeBlur(Number(e.target.value))}
                        className="edge-blur-slider"
                    />
                    <div className="edge-blur-hints">
                        <span>Sharp</span>
                        <span>Smooth</span>
                    </div>
                </motion.div>
            )}

            {/* AI Info Card */}
            <motion.div
                className="ai-info-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <FiInfo className="ai-info-icon" />
                <div className="ai-info-content">
                    <p>
                        <strong>How it works:</strong> This tool uses TensorFlow.js BodyPix model
                        to detect people/objects and intelligently remove backgrounds.
                        All processing happens in your browser - no server uploads!
                    </p>
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
                    id="inputBgRemove"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                    disabled={modelLoading}
                />

                <label htmlFor="inputBgRemove" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop images here or click to browse</h3>
                    <p>
                        Best results with portraits & clear subjects • Up to {MAX_FILES} images
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

                        {/* Process Button */}
                        <motion.button
                            className="btn-convert btn-ai"
                            onClick={handleRemoveBackground}
                            disabled={loading || modelLoading}
                            whileHover={{ scale: loading || modelLoading ? 1 : 1.02 }}
                            whileTap={{ scale: loading || modelLoading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Processing with AI... {processProgress}%
                                </>
                            ) : modelLoading ? (
                                <>
                                    <FiCpu className="spinning" />
                                    Loading Model...
                                </>
                            ) : (
                                <>
                                    <FiScissors />
                                    Remove Background
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
                                    className="progress-bar ai-progress"
                                    style={{ width: `${processProgress}%` }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Section */}
            <AnimatePresence>
                {processedData.length > 0 && (
                    <motion.div
                        className="tool-result-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="result-header">
                            <FiCheckCircle className="success-icon" />
                            <h3>Background Removal Complete!</h3>
                            <p>{processedData.length} image(s) processed successfully</p>
                        </div>

                        {/* Before/After Comparison Grid */}
                        <div className="before-after-grid">
                            {processedData.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="before-after-item"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="comparison-container">
                                        <div className="comparison-side">
                                            <span className="comparison-label">Before</span>
                                            <img
                                                src={item.originalPreview}
                                                alt={`Original ${i + 1}`}
                                                className="comparison-img"
                                            />
                                        </div>
                                        <div className="comparison-divider">
                                            <FiScissors />
                                        </div>
                                        <div className="comparison-side">
                                            <span className="comparison-label">After</span>
                                            <div
                                                className={`comparison-img-wrapper ${backgroundColor === "transparent" ? "checkered-bg" : ""
                                                    }`}
                                            >
                                                <img
                                                    src={item.processedPreview}
                                                    alt={`Processed ${i + 1}`}
                                                    className="comparison-img"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="comparison-filename">
                                        {item.fileName}
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
                            Download {processedData.length > 1 ? "All as ZIP" : "Image"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BackgroundRemoverTool;
