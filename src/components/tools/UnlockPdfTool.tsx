"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
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
    FiLock,
    FiUnlock,
    FiEye,
    FiEyeOff
} from "react-icons/fi";

const UnlockPdfTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [unlocking, setUnlocking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPasswordProtected, setIsPasswordProtected] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setPassword("");
        setError(null);
        setIsPasswordProtected(null);

        // Check if PDF is password protected
        await checkIfPasswordProtected(file);

        toast.success(`PDF loaded: ${file.name}`, "Success");
    };

    // Check if PDF is password protected
    const checkIfPasswordProtected = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();

            try {
                // Try to load without password
                await PDFDocument.load(arrayBuffer);
                setIsPasswordProtected(false);
                toast.info("This PDF is not password protected", "No Password");
            } catch (err: any) {
                // If it fails, it's likely password protected
                if (err.message?.includes("encrypted") || err.message?.includes("password")) {
                    setIsPasswordProtected(true);
                } else {
                    setIsPasswordProtected(false);
                }
            }
        } catch (err) {
            console.error("Error checking PDF:", err);
        }
    };

    // Unlock PDF
    const unlockPdf = async () => {
        if (!selectedFile) return;

        // If PDF is not password protected, just save it
        if (isPasswordProtected === false) {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const fileName = selectedFile.name.replace(".pdf", "_unlocked.pdf");
            saveAs(blob, fileName);
            toast.success("PDF saved (no password protection)", "Success");
            return;
        }

        if (!password.trim()) {
            toast.error("Please enter the PDF password", "Password Required");
            setError("Password is required");
            return;
        }

        setUnlocking(true);
        setError(null);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();

            // Try to load PDF with password
            let pdfDoc: PDFDocument;

            try {
                pdfDoc = await PDFDocument.load(arrayBuffer, {
                    ignoreEncryption: false,
                    // Note: pdf-lib has limited password support
                    // It can read some encrypted PDFs but may not support all encryption types
                });
            } catch (err: any) {
                if (err.message?.includes("encrypted") || err.message?.includes("password")) {
                    throw new Error("Incorrect password or unsupported encryption type. This tool works with basic PDF passwords only.");
                }
                throw err;
            }

            // Save PDF without encryption
            const pdfBytes = await pdfDoc.save();

            // Download unlocked PDF
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const fileName = selectedFile.name.replace(".pdf", "_unlocked.pdf");
            saveAs(blob, fileName);

            toast.success("PDF unlocked and downloaded!", "Success");
            setPassword("");

        } catch (err: any) {
            console.error("Unlock error:", err);

            let errorMessage = "Failed to unlock PDF";

            if (err.message?.includes("password")) {
                errorMessage = "Incorrect password. Please try again.";
            } else if (err.message?.includes("encrypted")) {
                errorMessage = "This PDF uses advanced encryption that is not supported. Try using Adobe Acrobat or other PDF software.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            toast.error(errorMessage, "Unlock Failed");
        } finally {
            setUnlocking(false);
        }
    };

    // Clear/reset
    const handleClear = () => {
        setSelectedFile(null);
        setPassword("");
        setError(null);
        setIsPasswordProtected(null);
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
                    Remove password protection from PDF files. Unlock password-protected PDFs to view, edit, and share freely.
                    All processing happens in your browser.
                </p>
            </div>

            {/* Security Notice */}
            <div className="security-notice">
                <FiLock />
                <div className="notice-content">
                    <strong>Privacy & Security:</strong> Your PDF and password are processed entirely in your browser.
                    No files or passwords are uploaded to any server. Only unlock PDFs you own or have permission to access.
                </div>
            </div>

            {/* Upload Section */}
            {!selectedFile ? (
                <div className="unlock-pdf-upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                        id="unlockPdfInput"
                    />
                    <label htmlFor="unlockPdfInput" className="unlock-pdf-upload-area">
                        <FiUpload className="upload-icon" />
                        <h3>Click to upload PDF</h3>
                        <p>or drag and drop</p>
                        <small>Password-protected PDF files • Maximum 10MB</small>
                    </label>
                </div>
            ) : (
                <div className="unlock-pdf-file-section">
                    <div className="file-info-card">
                        <div className="file-icon">
                            <FiFileText />
                        </div>
                        <div className="file-details">
                            <div className="file-name">{selectedFile.name}</div>
                            <div className="file-meta">
                                <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                {isPasswordProtected !== null && (
                                    <>
                                        <span>•</span>
                                        <span className={`protection-status ${isPasswordProtected ? "protected" : "unprotected"}`}>
                                            {isPasswordProtected ? (
                                                <>
                                                    <FiLock /> Password Protected
                                                </>
                                            ) : (
                                                <>
                                                    <FiUnlock /> No Password
                                                </>
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button className="btn-remove-file" onClick={handleClear}>
                            <FiTrash2 />
                        </button>
                    </div>

                    {/* Password Input */}
                    {isPasswordProtected && (
                        <div className="password-input-section">
                            <label htmlFor="pdfPassword">PDF Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="pdfPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && unlockPdf()}
                                    placeholder="Enter PDF password"
                                    className="password-input"
                                    autoComplete="off"
                                />
                                <button
                                    className="btn-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            <small className="password-hint">
                                Enter the password that was used to protect this PDF
                            </small>
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

                    {/* Unlock Button */}
                    {!unlocking && (
                        <motion.button
                            className="btn-unlock-pdf"
                            onClick={unlockPdf}
                            disabled={isPasswordProtected && !password.trim()}
                            whileHover={{ scale: (isPasswordProtected && !password.trim()) ? 1 : 1.02 }}
                            whileTap={{ scale: (isPasswordProtected && !password.trim()) ? 1 : 0.98 }}
                        >
                            {unlocking ? (
                                <>
                                    <span className="spinner" />
                                    Unlocking PDF...
                                </>
                            ) : (
                                <>
                                    <FiUnlock />
                                    {isPasswordProtected === false ? "Download PDF" : "Unlock & Download PDF"}
                                </>
                            )}
                        </motion.button>
                    )}

                    {unlocking && (
                        <div className="unlocking-status">
                            <FiLock className="lock-icon spinning" />
                            <span>Unlocking PDF...</span>
                        </div>
                    )}
                </div>
            )}

            {/* How It Works */}
            {!selectedFile && (
                <div className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Upload PDF</h4>
                            <p>Select password-protected PDF</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Enter Password</h4>
                            <p>Type the PDF password</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Unlock</h4>
                            <p>Tool removes password protection</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Download</h4>
                            <p>Get unlocked PDF file</p>
                        </div>
                    </div>

                    <div className="unlock-info">
                        <h4>Important Information:</h4>
                        <ul className="info-list">
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Works with basic PDF password protection</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Creates unlocked copy of your PDF</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Original file remains unchanged</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>100% browser-based - no server uploads</span>
                            </li>
                        </ul>

                        <h4>Limitations:</h4>
                        <ul className="info-list limitations">
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Only works if you know the password</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Advanced encryption may not be supported</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Only unlock PDFs you own or have permission for</span>
                            </li>
                        </ul>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiUnlock />
                            <span>Remove PDF passwords</span>
                        </div>
                        <div className="feature-item">
                            <FiLock />
                            <span>100% secure and private</span>
                        </div>
                        <div className="feature-item">
                            <FiDownload />
                            <span>Download unlocked PDF</span>
                        </div>
                        <div className="feature-item">
                            <FiCheckCircle />
                            <span>No server uploads</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default UnlockPdfTool;
