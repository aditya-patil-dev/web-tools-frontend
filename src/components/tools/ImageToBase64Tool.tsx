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
    FiCopy,
    FiTrash2,
    FiCode
} from "react-icons/fi";

const MAX_FILES = 25;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

interface Base64Result {
    name: string;
    base64: string;
    preview: string;
}

const ImageToBase64Tool = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [base64Data, setBase64Data] = useState<Base64Result[]>([]);
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

        const validFiles = files.filter((file) =>
            ACCEPTED_TYPES.includes(file.type)
        );

        if (validFiles.length !== files.length) {
            toast.warning(
                "Only image files (PNG, JPG, JPEG, WebP, GIF) are allowed.",
                "Invalid File Type"
            );
        }

        if (!validFiles.length) return;

        setSelectedFiles(validFiles);
        setPreviews(validFiles.map(file => URL.createObjectURL(file)));
        setBase64Data([]);
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
       Convert to Base64
    ------------------------------ */

    const handleConvert = async () => {
        if (!selectedFiles.length) {
            toast.error("Please upload image files first.", "No Files Selected");
            return;
        }

        setLoading(true);
        setConvertProgress(0);
        toast.info("Converting to Base64...", "Processing");

        try {
            const results: Base64Result[] = [];
            const totalFiles = selectedFiles.length;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];

                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });

                results.push({
                    name: file.name,
                    base64: base64,
                    preview: URL.createObjectURL(file)
                });

                // Update progress
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                setConvertProgress(progress);
            }

            setBase64Data(results);

            toast.success(
                `${results.length} image(s) converted to Base64!`,
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
       Copy to Clipboard
    ------------------------------ */

    const copyToClipboard = async (text: string, fileName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${fileName} copied to clipboard!`, "Copied");
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy to clipboard.", "Copy Failed");
        }
    };

    /* -----------------------------
       Download
    ------------------------------ */

    const handleDownloadAll = async () => {
        if (!base64Data.length) return;

        try {
            if (base64Data.length === 1) {
                const blob = new Blob([base64Data[0].base64], { type: "text/plain" });
                saveAs(blob, `${base64Data[0].name}.txt`);
                toast.success("Download started!", "Success");
            } else {
                toast.info("Creating ZIP file...", "Please wait");

                const zip = new JSZip();
                base64Data.forEach(item => {
                    zip.file(`${item.name}.txt`, item.base64);
                });
                const blob = await zip.generateAsync({ type: "blob" });
                saveAs(blob, "base64-images.zip");

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
        setBase64Data([]);
        setPreviews([]);
        setConvertProgress(0);
        const input = document.getElementById("inputBase64") as HTMLInputElement;
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
                    Convert up to {MAX_FILES} images to Base64 encoded strings.
                    Perfect for embedding images in HTML, CSS, or JSON.
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
                    id="inputBase64"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="tool-file-input"
                />

                <label htmlFor="inputBase64" className="tool-upload-label">
                    <FiUpload className="upload-icon" />
                    <h3>Drop images here or click to browse</h3>
                    <p>
                        Supports PNG, JPG, WebP, GIF • Up to {MAX_FILES} images
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
                                    <FiCode />
                                    Convert to Base64
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
                {base64Data.length > 0 && (
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
                            <p>{base64Data.length} image(s) converted to Base64</p>
                        </div>

                        {/* Base64 Output List */}
                        <div className="base64-output-list">
                            {base64Data.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="base64-item"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="base64-header">
                                        <img
                                            src={item.preview}
                                            alt={item.name}
                                            className="base64-thumbnail"
                                        />
                                        <div className="base64-info">
                                            <h4>{item.name}</h4>
                                            <p>{item.base64.length} characters</p>
                                        </div>
                                    </div>

                                    <div className="base64-code-container">
                                        <textarea
                                            readOnly
                                            value={item.base64}
                                            rows={4}
                                            className="base64-textarea"
                                        />
                                        <button
                                            className="btn-copy-base64"
                                            onClick={() => copyToClipboard(item.base64, item.name)}
                                        >
                                            <FiCopy /> Copy
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Download Button */}
                        <motion.button
                            className="btn-download"
                            onClick={handleDownloadAll}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiDownload />
                            Download {base64Data.length > 1 ? "All as ZIP" : "as TXT"}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ImageToBase64Tool;