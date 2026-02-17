"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiTrash2,
    FiZap,
    FiMove,
    FiX,
    FiLayers
} from "react-icons/fi";

interface PdfFile {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    loading: boolean;
}

const MergePdfTool = () => {
    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [merging, setMerging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter(file => file.type === "application/pdf");

        if (validFiles.length === 0) {
            toast.error("Please select PDF files", "Invalid Files");
            return;
        }

        if (validFiles.length !== files.length) {
            toast.warning(`${files.length - validFiles.length} non-PDF files were skipped`, "Warning");
        }

        // Check total number of PDFs
        if (pdfFiles.length + validFiles.length > 20) {
            toast.error("Maximum 20 PDF files allowed", "Too Many Files");
            return;
        }

        // Process each PDF
        const newPdfs: PdfFile[] = validFiles.map(file => ({
            id: `${Date.now()}-${Math.random()}`,
            file: file,
            name: file.name,
            size: file.size,
            pageCount: 0,
            loading: true
        }));

        setPdfFiles([...pdfFiles, ...newPdfs]);

        // Get page counts asynchronously
        for (const pdf of newPdfs) {
            try {
                const arrayBuffer = await pdf.file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pageCount = pdfDoc.getPageCount();

                setPdfFiles(prev => prev.map(p =>
                    p.id === pdf.id
                        ? { ...p, pageCount, loading: false }
                        : p
                ));
            } catch (err) {
                toast.error(`Failed to load ${pdf.name}`, "Error");
                setPdfFiles(prev => prev.filter(p => p.id !== pdf.id));
            }
        }

        setError(null);
        toast.success(`${validFiles.length} PDF${validFiles.length > 1 ? 's' : ''} added`, "Success");

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Remove PDF
    const removePdf = (id: string) => {
        setPdfFiles(pdfFiles.filter(pdf => pdf.id !== id));
        toast.info("PDF removed", "Removed");
    };

    // Handle drag start
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === index) return;

        const newPdfs = [...pdfFiles];
        const draggedPdf = newPdfs[draggedIndex];
        newPdfs.splice(draggedIndex, 1);
        newPdfs.splice(index, 0, draggedPdf);

        setPdfFiles(newPdfs);
        setDraggedIndex(index);
    };

    // Handle drag end
    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Merge PDFs
    const mergePdfs = async () => {
        if (pdfFiles.length < 2) {
            toast.error("Please add at least 2 PDF files to merge", "Not Enough Files");
            return;
        }

        // Check if any PDFs are still loading
        if (pdfFiles.some(pdf => pdf.loading)) {
            toast.warning("Please wait for all PDFs to finish loading", "Loading");
            return;
        }

        setMerging(true);
        setError(null);

        try {
            // Create a new PDF document
            const mergedPdf = await PDFDocument.create();

            // Process each PDF in order
            for (let i = 0; i < pdfFiles.length; i++) {
                const pdfFile = pdfFiles[i];

                try {
                    // Load the PDF
                    const arrayBuffer = await pdfFile.file.arrayBuffer();
                    const pdf = await PDFDocument.load(arrayBuffer);

                    // Copy all pages from this PDF
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                    // Add all copied pages to the merged PDF
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page);
                    });

                } catch (err) {
                    throw new Error(`Failed to process ${pdfFile.name}`);
                }
            }

            // Save the merged PDF
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });

            saveAs(blob, "merged.pdf");

            const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.pageCount, 0);
            toast.success(`Successfully merged ${pdfFiles.length} PDFs (${totalPages} pages)!`, "Success");

        } catch (err: any) {
            console.error("Merge error:", err);
            setError(err.message || "Failed to merge PDFs");
            toast.error(err.message || "Failed to merge PDFs", "Error");
        } finally {
            setMerging(false);
        }
    };

    // Clear all PDFs
    const handleClear = () => {
        setPdfFiles([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info("All PDFs cleared", "Cleared");
    };

    // Calculate total pages and size
    const totalPages = pdfFiles.reduce((sum, pdf) => sum + pdf.pageCount, 0);
    const totalSize = pdfFiles.reduce((sum, pdf) => sum + pdf.size, 0);

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
                    Combine multiple PDF files into one document. Drag and drop to reorder files.
                    Perfect for merging contracts, reports, or scanned documents.
                </p>
            </div>

            {/* Upload Section */}
            <div className="pdf-merge-upload-section">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="file-input-hidden"
                    id="mergePdfInput"
                />
                <label htmlFor="mergePdfInput" className="pdf-merge-upload-area">
                    <FiUpload className="upload-icon" />
                    <h3>Click to add PDF files</h3>
                    <p>or drag and drop</p>
                    <small>Add multiple PDF files • Max 20 files • Max 10MB per file</small>
                </label>
            </div>

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

            {/* PDF Files List */}
            {pdfFiles.length > 0 && (
                <motion.div
                    className="pdf-files-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="pdf-files-header">
                        <div className="header-info">
                            <h3>
                                <FiFileText /> PDF Files ({pdfFiles.length})
                            </h3>
                            <div className="files-stats">
                                <span>{totalPages} total pages</span>
                                <span>•</span>
                                <span>{(totalSize / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <span className="drag-hint">
                                <FiMove /> Drag to reorder
                            </span>
                            <button className="btn-clear-pdfs" onClick={handleClear}>
                                <FiTrash2 /> Clear All
                            </button>
                        </div>
                    </div>

                    <div className="pdf-files-list">
                        <AnimatePresence>
                            {pdfFiles.map((pdf, index) => (
                                <motion.div
                                    key={pdf.id}
                                    className={`pdf-file-item ${draggedIndex === index ? "dragging" : ""}`}
                                    draggable={!pdf.loading}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="file-number">{index + 1}</div>

                                    <div className="file-icon">
                                        <FiFileText />
                                    </div>

                                    <div className="file-details">
                                        <div className="file-name">{pdf.name}</div>
                                        <div className="file-meta">
                                            {pdf.loading ? (
                                                <span className="loading-text">Loading...</span>
                                            ) : (
                                                <>
                                                    <span>{pdf.pageCount} page{pdf.pageCount !== 1 ? 's' : ''}</span>
                                                    <span>•</span>
                                                    <span>{(pdf.size / 1024).toFixed(0)} KB</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="file-drag-handle">
                                        <FiMove />
                                    </div>

                                    <button
                                        className="btn-remove-pdf"
                                        onClick={() => removePdf(pdf.id)}
                                        disabled={pdf.loading}
                                    >
                                        <FiX />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Merge Section */}
                    <div className="merge-section">
                        <div className="merge-info">
                            <FiLayers className="merge-icon" />
                            <div className="merge-text">
                                <div className="merge-label">Ready to merge</div>
                                <div className="merge-stats">
                                    {pdfFiles.length} files → {totalPages} pages → 1 PDF
                                </div>
                            </div>
                        </div>

                        <motion.button
                            className="btn-merge-pdfs"
                            onClick={mergePdfs}
                            disabled={merging || pdfFiles.length < 2 || pdfFiles.some(p => p.loading)}
                            whileHover={{ scale: merging ? 1 : 1.02 }}
                            whileTap={{ scale: merging ? 1 : 0.98 }}
                        >
                            {merging ? (
                                <>
                                    <span className="spinner" />
                                    Merging PDFs...
                                </>
                            ) : (
                                <>
                                    <FiDownload />
                                    Merge & Download PDF
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* How It Works */}
            {pdfFiles.length === 0 && (
                <div className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Add PDFs</h4>
                            <p>Upload 2 or more PDF files</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Arrange Order</h4>
                            <p>Drag and drop to reorder files</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Merge</h4>
                            <p>Click merge to combine all PDFs</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Download</h4>
                            <p>Get your merged PDF file</p>
                        </div>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiLayers />
                            <span>Combine unlimited PDFs</span>
                        </div>
                        <div className="feature-item">
                            <FiMove />
                            <span>Drag and drop to reorder</span>
                        </div>
                        <div className="feature-item">
                            <FiZap />
                            <span>Fast browser-based merging</span>
                        </div>
                        <div className="feature-item">
                            <FiCheckCircle />
                            <span>100% private - no uploads</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MergePdfTool;
