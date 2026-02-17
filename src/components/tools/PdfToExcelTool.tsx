"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiTrash2,
    FiZap,
    FiTable,
    FiRefreshCw
} from "react-icons/fi";

// Set worker path for PDF.js
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
        new URL(
            "pdfjs-dist/build/pdf.worker.min.mjs",
            import.meta.url
        ).toString();
}

type ConversionMode = "pdf-to-excel" | "excel-to-pdf";

interface ConversionProgress {
    currentPage: number;
    totalPages: number;
    status: string;
}

const PdfExcelConverterTool = () => {
    const [mode, setMode] = useState<ConversionMode>("pdf-to-excel");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [converting, setConverting] = useState(false);
    const [progress, setProgress] = useState<ConversionProgress | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type based on mode
        if (mode === "pdf-to-excel") {
            if (file.type !== "application/pdf") {
                toast.error("Please select a PDF file", "Invalid File");
                return;
            }
        } else {
            const validTypes = [
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
                "application/vnd.ms-excel", // .xls
                "text/csv" // .csv
            ];

            if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
                toast.error("Please select an Excel or CSV file", "Invalid File");
                return;
            }
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File must be less than 10MB", "File Too Large");
            return;
        }

        setSelectedFile(file);
        setError(null);
        setProgress(null);
        toast.success(`File loaded: ${file.name}`, "Success");
    };

    // Extract text from PDF with positioning
    const extractTextFromPdf = async (file: File): Promise<any[]> => {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const totalPages = pdf.numPages;
        const allData: any[] = [];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            setProgress({
                currentPage: pageNum,
                totalPages: totalPages,
                status: "Extracting data from PDF..."
            });

            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Group text items by vertical position (rows)
            const rows: Map<number, any[]> = new Map();

            textContent.items.forEach((item: any) => {
                const y = Math.round(item.transform[5]); // Y position
                const x = item.transform[4]; // X position

                if (!rows.has(y)) {
                    rows.set(y, []);
                }

                rows.get(y)?.push({
                    text: item.str,
                    x: x,
                    y: y
                });
            });

            // Sort rows by Y position (top to bottom)
            const sortedRows = Array.from(rows.values())
                .sort((a, b) => b[0].y - a[0].y);

            // Convert each row to array of text
            const pageData = sortedRows.map(row => {
                // Sort items in row by X position (left to right)
                const sortedRow = row.sort((a, b) => a.x - b.x);
                return sortedRow.map(item => item.text);
            });

            // Add page separator
            if (totalPages > 1) {
                allData.push([`--- Page ${pageNum} ---`]);
            }

            allData.push(...pageData);
        }

        return allData;
    };

    // Create Excel workbook from data
    const createExcelWorkbook = (data: any[][]): XLSX.WorkBook => {
        setProgress({
            currentPage: 0,
            totalPages: 0,
            status: "Creating Excel file..."
        });

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Create worksheet from data
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // Auto-size columns
        const colWidths: any[] = [];
        data.forEach(row => {
            row.forEach((cell, colIndex) => {
                const cellLength = cell ? String(cell).length : 10;
                if (!colWidths[colIndex] || colWidths[colIndex] < cellLength) {
                    colWidths[colIndex] = Math.min(cellLength + 2, 50);
                }
            });
        });

        worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        return workbook;
    };

    // Read Excel file and extract data
    const readExcelFile = async (file: File): Promise<any[][]> => {
        setProgress({
            currentPage: 0,
            totalPages: 0,
            status: "Reading Excel file..."
        });

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Get first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to array of arrays
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        defval: ""
                    });

                    resolve(jsonData as any[][]);
                } catch (err) {
                    reject(new Error("Failed to read Excel file"));
                }
            };

            reader.onerror = () => {
                reject(new Error("Failed to read file"));
            };

            reader.readAsArrayBuffer(file);
        });
    };

    // Create PDF from Excel data
    const createPdfFromExcel = async (data: any[][]): Promise<Blob> => {
        setProgress({
            currentPage: 0,
            totalPages: 0,
            status: "Creating PDF..."
        });

        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // Add title
        pdf.setFontSize(16);
        pdf.text("Excel Data", 14, 15);

        // Create table
        autoTable(pdf, {
            head: data.length > 0 ? [data[0]] : [],
            body: data.slice(1),
            startY: 25,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [255, 107, 53],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            margin: { top: 25, right: 10, bottom: 10, left: 10 }
        });

        return pdf.output('blob');
    };

    // Convert PDF to Excel
    const convertPdfToExcel = async () => {
        if (!selectedFile) return;

        setConverting(true);
        setError(null);

        try {
            // Extract text from PDF
            const data = await extractTextFromPdf(selectedFile);

            if (data.length === 0 || data.every(row => row.length === 0)) {
                throw new Error("No data found in PDF. This might be a scanned document or image-based PDF.");
            }

            // Create Excel workbook
            const workbook = createExcelWorkbook(data);

            // Generate Excel file
            const excelBuffer = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
                cellStyles: true
            });

            // Create blob and download
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const fileName = selectedFile.name.replace(/\.pdf$/i, ".xlsx");
            saveAs(blob, fileName);

            toast.success("PDF converted to Excel successfully!", "Success");
            setProgress(null);

        } catch (err: any) {
            console.error("Conversion error:", err);
            setError(err.message || "Failed to convert PDF to Excel");
            toast.error(err.message || "Failed to convert PDF to Excel", "Error");
        } finally {
            setConverting(false);
        }
    };

    // Convert Excel to PDF
    const convertExcelToPdf = async () => {
        if (!selectedFile) return;

        setConverting(true);
        setError(null);

        try {
            // Read Excel file
            const data = await readExcelFile(selectedFile);

            if (data.length === 0) {
                throw new Error("No data found in Excel file.");
            }

            // Create PDF
            const pdfBlob = await createPdfFromExcel(data);

            // Download
            const fileName = selectedFile.name.replace(/\.(xlsx|xls|csv)$/i, ".pdf");
            saveAs(pdfBlob, fileName);

            toast.success("Excel converted to PDF successfully!", "Success");
            setProgress(null);

        } catch (err: any) {
            console.error("Conversion error:", err);
            setError(err.message || "Failed to convert Excel to PDF");
            toast.error(err.message || "Failed to convert Excel to PDF", "Error");
        } finally {
            setConverting(false);
        }
    };

    // Handle conversion based on mode
    const handleConvert = () => {
        if (mode === "pdf-to-excel") {
            convertPdfToExcel();
        } else {
            convertExcelToPdf();
        }
    };

    // Switch mode
    const switchMode = () => {
        setMode(mode === "pdf-to-excel" ? "excel-to-pdf" : "pdf-to-excel");
        setSelectedFile(null);
        setError(null);
        setProgress(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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

    const acceptedFileTypes = mode === "pdf-to-excel"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";

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
                    Convert between PDF and Excel formats. Extract data from PDFs to Excel spreadsheets,
                    or convert Excel files to professional PDF documents.
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="converter-mode-section">
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${mode === "pdf-to-excel" ? "active" : ""}`}
                        onClick={() => mode !== "pdf-to-excel" && switchMode()}
                    >
                        <FiFileText />
                        PDF to Excel
                    </button>
                    <button
                        className="mode-switch-icon"
                        onClick={switchMode}
                        title="Switch mode"
                    >
                        <FiRefreshCw />
                    </button>
                    <button
                        className={`mode-btn ${mode === "excel-to-pdf" ? "active" : ""}`}
                        onClick={() => mode !== "excel-to-pdf" && switchMode()}
                    >
                        <FiTable />
                        Excel to PDF
                    </button>
                </div>
            </div>

            {/* Important Notice */}
            <div className="conversion-notice">
                <FiAlertCircle />
                <div className="notice-content">
                    {mode === "pdf-to-excel" ? (
                        <>
                            <strong>PDF to Excel:</strong> Extracts text and data from PDFs into Excel format.
                            Works best with text-based PDFs containing tables. Scanned PDFs require OCR (not supported).
                        </>
                    ) : (
                        <>
                            <strong>Excel to PDF:</strong> Converts Excel spreadsheets to PDF documents.
                            First sheet only. Data is preserved, but Excel formulas and advanced formatting may not convert.
                        </>
                    )}
                </div>
            </div>

            {/* Upload Section */}
            {!selectedFile ? (
                <div className="pdf-excel-upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFileTypes}
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                        id="pdfExcelInput"
                    />
                    <label htmlFor="pdfExcelInput" className="pdf-excel-upload-area">
                        <FiUpload className="upload-icon" />
                        <h3>
                            Click to upload {mode === "pdf-to-excel" ? "PDF" : "Excel"}
                        </h3>
                        <p>or drag and drop</p>
                        <small>
                            {mode === "pdf-to-excel"
                                ? "PDF files with tables or data • Maximum 10MB"
                                : "Excel files (XLSX, XLS) or CSV • Maximum 10MB"
                            }
                        </small>
                    </label>
                </div>
            ) : (
                <div className="pdf-excel-file-info">
                    <div className="file-info-card">
                        <div className="file-icon">
                            {mode === "pdf-to-excel" ? <FiFileText /> : <FiTable />}
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
                            className={`btn-convert-pdf-excel ${mode === "excel-to-pdf" ? "excel-mode" : ""}`}
                            onClick={handleConvert}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {mode === "pdf-to-excel" ? (
                                <>
                                    <FiTable />
                                    Convert to Excel (XLSX)
                                </>
                            ) : (
                                <>
                                    <FiFileText />
                                    Convert to PDF
                                </>
                            )}
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
                            <h4>Choose Mode</h4>
                            <p>Select PDF to Excel or Excel to PDF</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Upload File</h4>
                            <p>Select your {mode === "pdf-to-excel" ? "PDF" : "Excel"} file</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Convert</h4>
                            <p>Tool processes your file</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Download</h4>
                            <p>Get your converted file</p>
                        </div>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiTable />
                            <span>Bidirectional conversion</span>
                        </div>
                        <div className="feature-item">
                            <FiZap />
                            <span>Fast browser-based processing</span>
                        </div>
                        <div className="feature-item">
                            <FiDownload />
                            <span>Instant download</span>
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

export default PdfExcelConverterTool;
