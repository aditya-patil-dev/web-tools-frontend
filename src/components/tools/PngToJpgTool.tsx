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
    FiImage,
    FiTrash2
} from "react-icons/fi";

const MAX_FILES = 25;
const ACCEPTED_TYPE = "image/png";

const PngToJpgTool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [convertedFiles, setConvertedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);

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

        const validFiles = files.filter(
            (file) => file.type === ACCEPTED_TYPE
        );

        if (validFiles.length !== files.length) {
            toast.warning(
                "Only PNG images are allowed.",
                "Invalid File Type"
            );
        }

        if (!validFiles.length) return;

        setSelectedFiles(validFiles);
        setPreviews(validFiles.map(file => URL.createObjectURL(file)));
        setConvertedFiles([]);
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
       Convert Logic
    ------------------------------ */

    const handleConvert = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload PNG files first.", "No Files Selected");
            return;
        }

        setLoading(true);
        setConvertProgress(0);
        toast.info("Converting images...", "Processing");

        try {
            const converted: File[] = [];
            const totalFiles = selectedFiles.length;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                const compressed = await imageCompression(file, {
                    fileType: "image/jpeg",
                    maxWidthOrHeight: 1000,
                    useWebWorker: true
                });

                const convertedFile = new File(
                    [compressed],
                    `${file.name.replace(/\.[^/.]+$/, "")}.jpg`,
                    { type: "image/jpeg" }
                );

                converted.push(convertedFile);

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setConvertProgress(progress);
            }

            setConvertedFiles(converted);

            toast.success(
                `${converted.length} image(s) converted successfully!`,
                "Conversion Complete"
            );
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
        if (!convertedFiles.length) return;

        try {
            if (convertedFiles.length === 1) {
                saveAs(convertedFiles[0], convertedFiles[0].name);
                toast.success("Download started!", "Success");
            } else {
                toast.info("Creating ZIP file...", "Please wait");

                const zip = new JSZip();
                convertedFiles.forEach(file => zip.file(file.name, file));
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, "converted-images.zip");

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
        setConvertedFiles([]);
        setPreviews([]);
        setConvertProgress(0);
        const input = document.getElementById("inputPng") as HTMLInputElement;
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
                    Convert up to {MAX_FILES} PNG images to JPG format.
                    All processing happens in your browser - 100% private and secure.
                </p>
            </div>

            {/* Upload Area */}
            <div
                className={`tool-upload-area ${dragActive ? "drag-active" : ""} ${selectedFiles.length > 0 ? "has-files" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    id="inputPng"
                    type="file"
                    accept={ACCEPTED_TYPE}
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                />

                <label htmlFor="inputPng" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop PNG files here or click to browse</h3>
                    <p>
                        Support for up to {MAX_FILES} images • Max 10MB each
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
                                        {(selectedFiles[i].size / 1024).toFixed(0)} KB
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
                                    Convert to JPG
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
                {convertedFiles.length > 0 && (
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
                            <p>{convertedFiles.length} image(s) converted successfully</p>
                        </div>

                        <div className="preview-grid">
                            {convertedFiles.map((file, i) => (
                                <motion.div
                                    key={i}
                                    className="preview-item converted"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Converted ${i + 1}`}
                                    />
                                    <div className="preview-badge">JPG</div>
                                    <div className="preview-name">{file.name}</div>
                                    <div className="preview-size">
                                        {(file.size / 1024).toFixed(0)} KB
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
                            Download {convertedFiles.length > 1 ? "as ZIP" : "JPG"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PngToJpgTool;