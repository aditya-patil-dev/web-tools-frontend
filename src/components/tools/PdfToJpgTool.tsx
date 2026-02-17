"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiImage,
    FiTrash2,
    FiZap
} from "react-icons/fi";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for PDF.js
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface ConvertedPage {
    pageNumber: number;
    imageUrl: string;
    width: number;
    height: number;
}

type ImageQuality = "low" | "medium" | "high";
type ImageFormat = "jpg" | "png";

const PdfToJpgTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [imageQuality, setImageQuality] = useState<ImageQuality>("high");
    const [imageFormat, setImageFormat] = useState<ImageFormat>("jpg");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Quality scale mapping
    const qualityScales = {
        low: 1.0,
        medium: 1.5,
        high: 2.0
    };

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            toast.error("Please select a PDF file", "Invalid File");
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("PDF file must be less than 10MB", "File Too Large");
            return;
        }

        setSelectedFile(file);
        setConvertedPages([]);
        setError(null);
        toast.success(`PDF loaded: ${file.name}`, "Success");
    };

    // Convert PDF to images
    const convertPdfToImages = async () => {
        if (!selectedFile) return;

        setConverting(true);
        setError(null);
        setConvertedPages([]);
        setCurrentPage(0);

        try {
            // Read PDF file
            const arrayBuffer = await selectedFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            setTotalPages(pdf.numPages);
            const pages: ConvertedPage[] = [];

            // Convert each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                setCurrentPage(pageNum);

                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: qualityScales[imageQuality] });

                // Create canvas
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");

                if (!context) {
                    throw new Error("Failed to get canvas context");
                }

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                // Render page to canvas
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert canvas to image
                const imageUrl = canvas.toDataURL(
                    imageFormat === "jpg" ? "image/jpeg" : "image/png",
                    imageFormat === "jpg" ? 0.92 : 1.0
                );

                pages.push({
                    pageNumber: pageNum,
                    imageUrl: imageUrl,
                    width: viewport.width,
                    height: viewport.height
                });
            }

            setConvertedPages(pages);
            toast.success(`Successfully converted ${pages.length} pages!`, "Success");
        } catch (err: any) {
            console.error("Conversion error:", err);
            setError(err.message || "Failed to convert PDF");
            toast.error("Failed to convert PDF", "Error");
        } finally {
            setConverting(false);
            setCurrentPage(0);
        }
    };

    // Download single image
    const downloadSingleImage = (page: ConvertedPage) => {
        const link = document.createElement("a");
        link.href = page.imageUrl;
        link.download = `page-${page.pageNumber}.${imageFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Page ${page.pageNumber} downloaded`, "Success");
    };

    // Download all as ZIP
    const downloadAllAsZip = async () => {
        if (convertedPages.length === 0) return;

        try {
            const zip = new JSZip();

            // Add each image to ZIP
            for (const page of convertedPages) {
                const base64Data = page.imageUrl.split(",")[1];
                zip.file(`page-${page.pageNumber}.${imageFormat}`, base64Data, { base64: true });
            }

            // Generate ZIP
            const zipBlob = await zip.generateAsync({ type: "blob" });

            // Get filename without extension
            const fileName = selectedFile?.name.replace(".pdf", "") || "converted";

            saveAs(zipBlob, `${fileName}-images.zip`);
            toast.success("All pages downloaded as ZIP", "Success");
        } catch (err) {
            toast.error("Failed to create ZIP file", "Error");
        }
    };

    // Clear/reset
    const handleClear = () => {
        setSelectedFile(null);
        setConvertedPages([]);
        setError(null);
        setTotalPages(0);
        setCurrentPage(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info("Cleared", "Reset");
    };

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
                    Convert PDF pages to JPG or PNG images with high quality. Perfect for extracting pages,
                    creating thumbnails, or sharing PDF content as images.
                </p>
            </div>

            {/* Conversion Options */}
            <div className="pdf-options-section">
                <div className="option-group">
                    <label>Image Format:</label>
                    <div className="format-selector">
                        <button
                            className={`format-btn ${imageFormat === "jpg" ? "active" : ""}`}
                            onClick={() => setImageFormat("jpg")}
                        >
                            JPG (Smaller size)
                        </button>
                        <button
                            className={`format-btn ${imageFormat === "png" ? "active" : ""}`}
                            onClick={() => setImageFormat("png")}
                        >
                            PNG (Better quality)
                        </button>
                    </div>
                </div>

                <div className="option-group">
                    <label>Quality:</label>
                    <div className="quality-selector">
                        <button
                            className={`quality-btn ${imageQuality === "low" ? "active" : ""}`}
                            onClick={() => setImageQuality("low")}
                        >
                            Low (Faster)
                        </button>
                        <button
                            className={`quality-btn ${imageQuality === "medium" ? "active" : ""}`}
                            onClick={() => setImageQuality("medium")}
                        >
                            Medium
                        </button>
                        <button
                            className={`quality-btn ${imageQuality === "high" ? "active" : ""}`}
                            onClick={() => setImageQuality("high")}
                        >
                            High (Best)
                        </button>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            {!selectedFile ? (
                <div className="pdf-upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                        id="pdfFileInput"
                    />
                    <label htmlFor="pdfFileInput" className="pdf-upload-area">
                        <FiUpload className="upload-icon" />
                        <h3>Click to upload PDF</h3>
                        <p>or drag and drop</p>
                        <small>Maximum file size: 10MB</small>
                    </label>
                </div>
            ) : (
                <div className="pdf-file-info">
                    <div className="file-info-card">
                        <div className="file-icon">
                            <FiFileText />
                        </div>
                        <div className="file-details">
                            <div className="file-name">{selectedFile.name}</div>
                            <div className="file-size">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </div>
                        </div>
                        <button className="btn-remove-file" onClick={handleClear}>
                            <FiTrash2 />
                        </button>
                    </div>

                    {!converting && convertedPages.length === 0 && (
                        <motion.button
                            className="btn-convert-pdf"
                            onClick={convertPdfToImages}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiZap />
                            Convert to {imageFormat.toUpperCase()}
                        </motion.button>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiAlertCircle />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Conversion Progress */}
            {converting && (
                <motion.div
                    className="conversion-progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="progress-info">
                        <FiZap className="progress-icon spinning" />
                        <div className="progress-text">
                            <div className="progress-label">Converting PDF...</div>
                            <div className="progress-pages">
                                Page {currentPage} of {totalPages}
                            </div>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(currentPage / totalPages) * 100}%` }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Converted Images */}
            {convertedPages.length > 0 && (
                <motion.div
                    className="converted-images-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="results-header">
                        <h3>
                            <FiCheckCircle /> Converted Images ({convertedPages.length})
                        </h3>
                        <button className="btn-download-all" onClick={downloadAllAsZip}>
                            <FiDownload /> Download All as ZIP
                        </button>
                    </div>

                    <div className="images-grid">
                        <AnimatePresence>
                            {convertedPages.map((page, index) => (
                                <motion.div
                                    key={page.pageNumber}
                                    className="image-card"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="image-preview">
                                        <img
                                            src={page.imageUrl}
                                            alt={`Page ${page.pageNumber}`}
                                        />
                                    </div>
                                    <div className="image-info">
                                        <div className="image-meta">
                                            <span className="page-number">Page {page.pageNumber}</span>
                                            <span className="image-dimensions">
                                                {Math.round(page.width / qualityScales[imageQuality])} × {Math.round(page.height / qualityScales[imageQuality])} px
                                            </span>
                                        </div>
                                        <button
                                            className="btn-download-single"
                                            onClick={() => downloadSingleImage(page)}
                                        >
                                            <FiDownload />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="conversion-actions">
                        <button className="btn-convert-another" onClick={handleClear}>
                            Convert Another PDF
                        </button>
                    </div>
                </motion.div>
            )}

            {/* How It Works */}
            {!selectedFile && !converting && convertedPages.length === 0 && (
                <div className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Upload PDF</h4>
                            <p>Select your PDF file (max 10MB)</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Choose Settings</h4>
                            <p>Select format and quality</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Convert</h4>
                            <p>Click convert and wait</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Download</h4>
                            <p>Get individual images or ZIP</p>
                        </div>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiImage />
                            <span>Convert all pages to images</span>
                        </div>
                        <div className="feature-item">
                            <FiZap />
                            <span>High quality output</span>
                        </div>
                        <div className="feature-item">
                            <FiDownload />
                            <span>Download as ZIP or individual files</span>
                        </div>
                        <div className="feature-item">
                            <FiCheckCircle />
                            <span>100% browser-based and private</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default PdfToJpgTool;
