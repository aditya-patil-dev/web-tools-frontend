"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/toast/toast";
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiTrash2,
    FiZap,
    FiFile
} from "react-icons/fi";

// Set worker path for PDF.js
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
}

interface ConversionProgress {
    currentPage: number;
    totalPages: number;
    status: string;
}

const PdfToWordTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState<ConversionProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        setError(null);
        setProgress(null);
        toast.success(`PDF loaded: ${file.name}`, "Success");
    };

    // Extract text from PDF
    const extractTextFromPdf = async (file: File): Promise<string[]> => {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const totalPages = pdf.numPages;
        const pages: string[] = [];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            setProgress({
                currentPage: pageNum,
                totalPages: totalPages,
                status: "Extracting text..."
            });

            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Extract text items and join them
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");

            pages.push(pageText);
        }

        return pages;
    };

    // Create Word document from text
    const createWordDocument = async (pages: string[]): Promise<Blob> => {
        setProgress({
            currentPage: 0,
            totalPages: pages.length,
            status: "Creating Word document..."
        });

        const paragraphs: Paragraph[] = [];

        // Add each page as paragraphs
        pages.forEach((pageText, index) => {
            // Add page number heading if multiple pages
            if (pages.length > 1) {
                paragraphs.push(
                    new Paragraph({
                        text: `Page ${index + 1}`,
                        heading: HeadingLevel.HEADING_2,
                        spacing: {
                            before: index === 0 ? 0 : 400,
                            after: 200
                        }
                    })
                );
            }

            // Split text into lines and create paragraphs
            const lines = pageText.split(/\n+/).filter(line => line.trim());
            
            if (lines.length === 0) {
                // If no clear lines, split by sentences
                const sentences = pageText.split(/\.\s+/).filter(s => s.trim());
                sentences.forEach((sentence) => {
                    if (sentence.trim()) {
                        paragraphs.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: sentence.trim() + (sentence.endsWith('.') ? '' : '.'),
                                        size: 24 // 12pt
                                    })
                                ],
                                spacing: {
                                    after: 120
                                }
                            })
                        );
                    }
                });
            } else {
                lines.forEach((line) => {
                    if (line.trim()) {
                        paragraphs.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: line.trim(),
                                        size: 24 // 12pt
                                    })
                                ],
                                spacing: {
                                    after: 120
                                }
                            })
                        );
                    }
                });
            }

            // Add page break after each page except the last
            if (index < pages.length - 1) {
                paragraphs.push(
                    new Paragraph({
                        pageBreakBefore: true
                    })
                );
            }
        });

        // Create document
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,    // 1 inch = 1440 twips
                            right: 1440,
                            bottom: 1440,
                            left: 1440
                        }
                    }
                },
                children: paragraphs
            }]
        });

        // Generate blob
        const blob = await Packer.toBlob(doc);
        return blob;
    };

    // Convert PDF to Word
    const convertPdfToWord = async () => {
        if (!selectedFile) return;

        setConverting(true);
        setError(null);

        try {
            // Extract text from PDF
            const pages = await extractTextFromPdf(selectedFile);

            if (pages.every(page => !page.trim())) {
                throw new Error("No text found in PDF. This might be a scanned document or image-based PDF.");
            }

            // Create Word document
            const blob = await createWordDocument(pages);

            // Download file
            const fileName = selectedFile.name.replace(".pdf", ".docx");
            saveAs(blob, fileName);

            toast.success("PDF converted to Word successfully!", "Success");
            setProgress(null);

        } catch (err: any) {
            console.error("Conversion error:", err);
            setError(err.message || "Failed to convert PDF to Word");
            toast.error(err.message || "Failed to convert PDF to Word", "Error");
        } finally {
            setConverting(false);
        }
    };

    // Clear/reset
    const handleClear = () => {
        setSelectedFile(null);
        setError(null);
        setProgress(null);
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
                    Convert PDF documents to editable Word (DOCX) files. Extracts text content and preserves basic formatting.
                    Perfect for editing PDF content in Microsoft Word.
                </p>
            </div>

            {/* Important Notice */}
            <div className="conversion-notice">
                <FiAlertCircle />
                <div className="notice-content">
                    <strong>Important:</strong> This tool extracts text from PDFs. Works best with text-based PDFs.
                    Scanned PDFs or image-based PDFs may not convert properly. Complex formatting, tables, and images may not be preserved.
                </div>
            </div>

            {/* Upload Section */}
            {!selectedFile ? (
                <div className="pdf-word-upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                        id="pdfWordInput"
                    />
                    <label htmlFor="pdfWordInput" className="pdf-word-upload-area">
                        <FiUpload className="upload-icon" />
                        <h3>Click to upload PDF</h3>
                        <p>or drag and drop</p>
                        <small>Text-based PDF files only • Maximum 10MB</small>
                    </label>
                </div>
            ) : (
                <div className="pdf-word-file-info">
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

                    {!converting && !progress && (
                        <motion.button
                            className="btn-convert-pdf-word"
                            onClick={convertPdfToWord}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiFile />
                            Convert to Word (DOCX)
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
            {converting && progress && (
                <motion.div
                    className="conversion-progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="progress-info">
                        <FiZap className="progress-icon spinning" />
                        <div className="progress-text">
                            <div className="progress-label">{progress.status}</div>
                            {progress.totalPages > 0 && (
                                <div className="progress-pages">
                                    {progress.currentPage > 0 && `Page ${progress.currentPage} of ${progress.totalPages}`}
                                </div>
                            )}
                        </div>
                    </div>
                    {progress.totalPages > 0 && progress.currentPage > 0 && (
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(progress.currentPage / progress.totalPages) * 100}%` }}
                            />
                        </div>
                    )}
                </motion.div>
            )}

            {/* How It Works */}
            {!selectedFile && !converting && (
                <div className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Upload PDF</h4>
                            <p>Select your text-based PDF file</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Extract Text</h4>
                            <p>Tool extracts all text content</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Convert</h4>
                            <p>Creates editable Word document</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Download</h4>
                            <p>Get your DOCX file instantly</p>
                        </div>
                    </div>

                    <div className="conversion-info">
                        <h4>What Gets Converted:</h4>
                        <ul className="info-list">
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Text content from all pages</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Basic paragraph structure</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Page breaks between pages</span>
                            </li>
                        </ul>

                        <h4>Limitations:</h4>
                        <ul className="info-list limitations">
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Scanned PDFs require OCR (not supported)</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Complex formatting may not be preserved</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Tables and images not converted</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Font styles may be simplified</span>
                            </li>
                        </ul>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiFile />
                            <span>Text extraction from PDFs</span>
                        </div>
                        <div className="feature-item">
                            <FiZap />
                            <span>Fast browser-based conversion</span>
                        </div>
                        <div className="feature-item">
                            <FiDownload />
                            <span>Download as editable DOCX</span>
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

export default PdfToWordTool;
