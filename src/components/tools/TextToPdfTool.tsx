"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiSettings,
    FiType,
    FiAlignLeft,
} from "react-icons/fi";
import jsPDF from "jspdf";

type PageSize = "A4" | "Letter" | "Legal" | "A5";
type PageOrientation = "portrait" | "landscape";
type FontFamily = "helvetica" | "times" | "courier";
type FontSize = 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24;
type LineSpacing = 1 | 1.15 | 1.5 | 2;

interface PDFSettings {
    pageSize: PageSize;
    orientation: PageOrientation;
    fontFamily: FontFamily;
    fontSize: FontSize;
    lineSpacing: LineSpacing;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    addPageNumbers: boolean;
    addTimestamp: boolean;
    headerText: string;
    footerText: string;
}

const TextToPDFTool = () => {
    const [inputText, setInputText] = useState<string>("");
    const [fileName, setFileName] = useState<string>("document");
    const [generating, setGenerating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [previewGenerated, setPreviewGenerated] = useState(false);

    const [settings, setSettings] = useState<PDFSettings>({
        pageSize: "A4",
        orientation: "portrait",
        fontFamily: "helvetica",
        fontSize: 12,
        lineSpacing: 1.5,
        marginTop: 20,
        marginRight: 20,
        marginBottom: 20,
        marginLeft: 20,
        addPageNumbers: true,
        addTimestamp: false,
        headerText: "",
        footerText: "",
    });

    // Page dimensions in mm
    const pageSizes = {
        A4: { width: 210, height: 297 },
        Letter: { width: 216, height: 279 },
        Legal: { width: 216, height: 356 },
        A5: { width: 148, height: 210 },
    };

    // Calculate text statistics
    const stats = {
        characters: inputText.length,
        words: inputText.trim() ? inputText.trim().split(/\s+/).length : 0,
        lines: inputText.split("\n").length,
        paragraphs: inputText.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length,
    };

    // Estimate page count
    const estimatePages = (): number => {
        if (!inputText.trim()) return 0;

        const { pageSize, orientation, fontSize, lineSpacing, marginTop, marginBottom, marginLeft, marginRight } = settings;
        const dims = pageSizes[pageSize];
        const pageWidth = orientation === "portrait" ? dims.width : dims.height;
        const pageHeight = orientation === "portrait" ? dims.height : dims.width;

        // Calculate usable area
        const usableWidth = pageWidth - marginLeft - marginRight;
        const usableHeight = pageHeight - marginTop - marginBottom;

        // Approximate characters per line and lines per page
        const charsPerLine = Math.floor(usableWidth / (fontSize * 0.6));
        const lineHeight = fontSize * 0.3527 * lineSpacing; // Convert pt to mm
        const linesPerPage = Math.floor(usableHeight / lineHeight);

        const totalLines = Math.ceil(inputText.length / charsPerLine);
        const estimatedPages = Math.ceil(totalLines / linesPerPage);

        return Math.max(1, estimatedPages);
    };

    // Generate PDF
    const generatePDF = () => {
        if (!inputText.trim()) return;

        setGenerating(true);

        try {
            const { pageSize, orientation, fontFamily, fontSize, lineSpacing, marginTop, marginRight, marginBottom, marginLeft, addPageNumbers, addTimestamp, headerText, footerText } = settings;

            const dims = pageSizes[pageSize];
            const pageWidth = orientation === "portrait" ? dims.width : dims.height;
            const pageHeight = orientation === "portrait" ? dims.height : dims.width;

            const doc = new jsPDF({
                orientation,
                unit: "mm",
                format: pageSize,
            });

            doc.setFont(fontFamily);
            doc.setFontSize(fontSize);

            const usableWidth = pageWidth - marginLeft - marginRight;
            const lineHeight = fontSize * 0.3527 * lineSpacing; // Convert points to mm

            let currentY = marginTop;
            let pageNumber = 1;

            // Split text into lines
            const lines = doc.splitTextToSize(inputText, usableWidth);

            // Add header if specified
            const addHeader = (page: number) => {
                if (headerText) {
                    doc.setFontSize(10);
                    doc.setFont(fontFamily, "normal");
                    doc.text(headerText, pageWidth / 2, marginTop - 10, { align: "center" });
                    doc.setFontSize(fontSize);
                }
            };

            // Add footer if specified
            const addFooter = (page: number) => {
                const footerY = pageHeight - marginBottom + 10;

                if (footerText) {
                    doc.setFontSize(10);
                    doc.setFont(fontFamily, "normal");
                    doc.text(footerText, pageWidth / 2, footerY, { align: "center" });
                }

                if (addPageNumbers) {
                    doc.setFontSize(10);
                    doc.setFont(fontFamily, "normal");
                    const pageText = `Page ${page}`;
                    doc.text(pageText, pageWidth - marginRight, footerY, { align: "right" });
                }

                if (addTimestamp) {
                    doc.setFontSize(8);
                    doc.setFont(fontFamily, "normal");
                    const timestamp = new Date().toLocaleString();
                    doc.text(timestamp, marginLeft, footerY, { align: "left" });
                }

                doc.setFontSize(fontSize);
            };

            // Add first page header
            addHeader(pageNumber);

            // Add lines to PDF
            lines.forEach((line: string, index: number) => {
                // Check if we need a new page
                if (currentY + lineHeight > pageHeight - marginBottom) {
                    // Add footer to current page
                    addFooter(pageNumber);

                    // Create new page
                    doc.addPage();
                    pageNumber++;
                    currentY = marginTop;

                    // Add header to new page
                    addHeader(pageNumber);
                }

                doc.text(line, marginLeft, currentY);
                currentY += lineHeight;
            });

            // Add footer to last page
            addFooter(pageNumber);

            // Save PDF
            const safeFileName = fileName.trim() || "document";
            doc.save(`${safeFileName}.pdf`);

            setPreviewGenerated(true);
            setTimeout(() => setPreviewGenerated(false), 3000);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    // Update settings
    const updateSetting = <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    // Clear all
    const handleClear = () => {
        setInputText("");
        setFileName("document");
        setPreviewGenerated(false);
    };

    // Load sample text
    const loadSample = (type: "short" | "long") => {
        const samples = {
            short: `Sample Document

This is a sample text to demonstrate the Text to PDF converter.

Key Features:
- Customizable fonts and sizes
- Adjustable margins
- Page numbers and timestamps
- Headers and footers
- Multiple page sizes

You can replace this text with your own content and generate a professional PDF document instantly.`,
            long: `Lorem Ipsum Document

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Introduction

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Section 1: Background

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Section 2: Analysis

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.

Conclusion

Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.`,
        };
        setInputText(samples[type]);
    };

    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle className="info-icon" />
                <p>
                    Convert your text to professional PDF documents with customizable formatting, fonts, margins, and page settings.
                </p>
            </div>

            {/* Top Controls */}
            <div className="pdf-top-controls">
                <div className="file-name-input">
                    <FiFileText />
                    <input
                        type="text"
                        placeholder="Enter file name..."
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="pdf-filename-field"
                    />
                    <span className="file-extension">.pdf</span>
                </div>

                <div className="control-buttons">
                    <button className="btn-sample" onClick={() => loadSample("short")}>
                        Load Sample
                    </button>
                    <button className="btn-sample" onClick={() => loadSample("long")}>
                        Load Long Text
                    </button>
                    <button
                        className="btn-settings-toggle"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <FiSettings /> {showSettings ? "Hide" : "Show"} Settings
                    </button>
                    {inputText && (
                        <button className="btn-clear-pdf" onClick={handleClear}>
                            <FiRefreshCw /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="pdf-settings-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h3>
                            <FiSettings /> PDF Settings
                        </h3>

                        <div className="settings-grid">
                            {/* Page Settings */}
                            <div className="setting-group">
                                <h4>Page</h4>

                                <div className="setting-item">
                                    <label>Size:</label>
                                    <select
                                        value={settings.pageSize}
                                        onChange={(e) => updateSetting("pageSize", e.target.value as PageSize)}
                                    >
                                        <option value="A4">A4 (210 × 297 mm)</option>
                                        <option value="Letter">Letter (8.5 × 11 in)</option>
                                        <option value="Legal">Legal (8.5 × 14 in)</option>
                                        <option value="A5">A5 (148 × 210 mm)</option>
                                    </select>
                                </div>

                                <div className="setting-item">
                                    <label>Orientation:</label>
                                    <select
                                        value={settings.orientation}
                                        onChange={(e) => updateSetting("orientation", e.target.value as PageOrientation)}
                                    >
                                        <option value="portrait">Portrait</option>
                                        <option value="landscape">Landscape</option>
                                    </select>
                                </div>
                            </div>

                            {/* Font Settings */}
                            <div className="setting-group">
                                <h4>Font</h4>

                                <div className="setting-item">
                                    <label>Family:</label>
                                    <select
                                        value={settings.fontFamily}
                                        onChange={(e) => updateSetting("fontFamily", e.target.value as FontFamily)}
                                    >
                                        <option value="helvetica">Helvetica</option>
                                        <option value="times">Times New Roman</option>
                                        <option value="courier">Courier</option>
                                    </select>
                                </div>

                                <div className="setting-item">
                                    <label>Size:</label>
                                    <select
                                        value={settings.fontSize}
                                        onChange={(e) => updateSetting("fontSize", Number(e.target.value) as FontSize)}
                                    >
                                        <option value={10}>10 pt</option>
                                        <option value={11}>11 pt</option>
                                        <option value={12}>12 pt</option>
                                        <option value={14}>14 pt</option>
                                        <option value={16}>16 pt</option>
                                        <option value={18}>18 pt</option>
                                        <option value={20}>20 pt</option>
                                        <option value={24}>24 pt</option>
                                    </select>
                                </div>

                                <div className="setting-item">
                                    <label>Line Spacing:</label>
                                    <select
                                        value={settings.lineSpacing}
                                        onChange={(e) => updateSetting("lineSpacing", Number(e.target.value) as LineSpacing)}
                                    >
                                        <option value={1}>Single (1.0)</option>
                                        <option value={1.15}>1.15</option>
                                        <option value={1.5}>1.5</option>
                                        <option value={2}>Double (2.0)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Margins */}
                            <div className="setting-group">
                                <h4>Margins (mm)</h4>

                                <div className="margins-grid">
                                    <div className="setting-item">
                                        <label>Top:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.marginTop}
                                            onChange={(e) => updateSetting("marginTop", Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <label>Right:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.marginRight}
                                            onChange={(e) => updateSetting("marginRight", Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <label>Bottom:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.marginBottom}
                                            onChange={(e) => updateSetting("marginBottom", Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="setting-item">
                                        <label>Left:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={settings.marginLeft}
                                            onChange={(e) => updateSetting("marginLeft", Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Options */}
                            <div className="setting-group">
                                <h4>Options</h4>

                                <div className="setting-checkbox">
                                    <input
                                        type="checkbox"
                                        id="pageNumbers"
                                        checked={settings.addPageNumbers}
                                        onChange={(e) => updateSetting("addPageNumbers", e.target.checked)}
                                    />
                                    <label htmlFor="pageNumbers">Add page numbers</label>
                                </div>

                                <div className="setting-checkbox">
                                    <input
                                        type="checkbox"
                                        id="timestamp"
                                        checked={settings.addTimestamp}
                                        onChange={(e) => updateSetting("addTimestamp", e.target.checked)}
                                    />
                                    <label htmlFor="timestamp">Add timestamp</label>
                                </div>

                                <div className="setting-item">
                                    <label>Header:</label>
                                    <input
                                        type="text"
                                        placeholder="Optional header text"
                                        value={settings.headerText}
                                        onChange={(e) => updateSetting("headerText", e.target.value)}
                                    />
                                </div>

                                <div className="setting-item">
                                    <label>Footer:</label>
                                    <input
                                        type="text"
                                        placeholder="Optional footer text"
                                        value={settings.footerText}
                                        onChange={(e) => updateSetting("footerText", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Workspace */}
            <div className="pdf-workspace">
                {/* Left - Text Input */}
                <div className="pdf-input-section">
                    <div className="section-header">
                        <h3>
                            <FiType /> Your Text
                        </h3>
                    </div>

                    <textarea
                        className="pdf-text-area"
                        placeholder="Type or paste your text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={20}
                    />

                    {/* Statistics */}
                    {inputText && (
                        <motion.div
                            className="pdf-stats"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="stat-item">
                                <span className="stat-label">Characters:</span>
                                <span className="stat-value">{stats.characters.toLocaleString()}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Words:</span>
                                <span className="stat-value">{stats.words.toLocaleString()}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Lines:</span>
                                <span className="stat-value">{stats.lines.toLocaleString()}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Paragraphs:</span>
                                <span className="stat-value">{stats.paragraphs.toLocaleString()}</span>
                            </div>
                            <div className="stat-item highlight">
                                <span className="stat-label">Est. Pages:</span>
                                <span className="stat-value">{estimatePages()}</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right - Preview Info */}
                <div className="pdf-preview-section">
                    <div className="section-header">
                        <h3>
                            <FiAlignLeft /> Preview Info
                        </h3>
                    </div>

                    {!inputText ? (
                        <div className="empty-preview">
                            <FiFileText className="empty-icon" />
                            <p>Enter text to generate PDF</p>
                            <p className="empty-hint">Your PDF preview info will appear here</p>
                        </div>
                    ) : (
                        <div className="preview-info-card">
                            <div className="preview-info-item">
                                <strong>File Name:</strong>
                                <span>{fileName || "document"}.pdf</span>
                            </div>
                            <div className="preview-info-item">
                                <strong>Page Size:</strong>
                                <span>{settings.pageSize} ({settings.orientation})</span>
                            </div>
                            <div className="preview-info-item">
                                <strong>Font:</strong>
                                <span>{settings.fontFamily} {settings.fontSize}pt</span>
                            </div>
                            <div className="preview-info-item">
                                <strong>Line Spacing:</strong>
                                <span>{settings.lineSpacing}x</span>
                            </div>
                            <div className="preview-info-item">
                                <strong>Margins:</strong>
                                <span>
                                    T:{settings.marginTop} R:{settings.marginRight} B:{settings.marginBottom} L:{settings.marginLeft}
                                </span>
                            </div>
                            <div className="preview-info-item">
                                <strong>Page Numbers:</strong>
                                <span>{settings.addPageNumbers ? "Yes" : "No"}</span>
                            </div>
                            {settings.headerText && (
                                <div className="preview-info-item">
                                    <strong>Header:</strong>
                                    <span>{settings.headerText}</span>
                                </div>
                            )}
                            {settings.footerText && (
                                <div className="preview-info-item">
                                    <strong>Footer:</strong>
                                    <span>{settings.footerText}</span>
                                </div>
                            )}

                            <div className="estimated-pages-card">
                                <FiFileText />
                                <div>
                                    <div className="pages-count">{estimatePages()}</div>
                                    <div className="pages-label">Estimated Pages</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Generate Button */}
            <div className="pdf-action-section">
                <motion.button
                    className="btn-generate-pdf"
                    onClick={generatePDF}
                    disabled={!inputText.trim() || generating}
                    whileHover={{ scale: !inputText.trim() || generating ? 1 : 1.02 }}
                    whileTap={{ scale: !inputText.trim() || generating ? 1 : 0.98 }}
                >
                    {generating ? (
                        <>
                            <span className="spinner" />
                            Generating PDF...
                        </>
                    ) : (
                        <>
                            <FiDownload />
                            Generate PDF
                        </>
                    )}
                </motion.button>

                <AnimatePresence>
                    {previewGenerated && (
                        <motion.div
                            className="success-message"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <FiCheckCircle />
                            PDF generated successfully! Check your downloads.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default TextToPDFTool;

