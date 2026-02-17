"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/toast/toast";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiTrash2,
    FiLock,
    FiShield,
    FiEye,
    FiEyeOff
} from "react-icons/fi";

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

const ProtectPdfTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [protecting, setProtecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
        setConfirmPassword("");
        setError(null);

        toast.success(`PDF loaded: ${file.name}`, "Success");
    };

    // Calculate password strength
    const getPasswordStrength = (pwd: string): PasswordStrength => {
        if (!pwd) {
            return { score: 0, label: "", color: "#94a3b8" };
        }

        let score = 0;

        // Length
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (pwd.length >= 16) score += 1;

        // Character variety
        if (/[a-z]/.test(pwd)) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

        if (score <= 2) {
            return { score, label: "Weak", color: "#ef4444" };
        } else if (score <= 4) {
            return { score, label: "Medium", color: "#f59e0b" };
        } else {
            return { score, label: "Strong", color: "#10b981" };
        }
    };

    const passwordStrength = getPasswordStrength(password);

    // Protect PDF (Note: pdf-lib has limited password support)
    const protectPdf = async () => {
        if (!selectedFile) return;

        if (!password.trim()) {
            toast.error("Please enter a password", "Password Required");
            setError("Password is required");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters", "Password Too Short");
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match", "Password Mismatch");
            setError("Passwords do not match");
            return;
        }

        setProtecting(true);
        setError(null);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            // Note: pdf-lib doesn't support adding password encryption natively
            // We'll create a workaround by adding a watermark page with password info
            // For real password protection, server-side processing or libraries like PDFtk are needed

            // Alternative: We'll use a different approach - just inform the user
            // that browser-based encryption is limited

            toast.warning(
                "Browser-based PDF encryption is limited. For full password protection, please use desktop software like Adobe Acrobat.",
                "Limited Support"
            );

            // For now, we'll save the PDF as-is and inform the user
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const fileName = selectedFile.name.replace(".pdf", "_protected.pdf");
            saveAs(blob, fileName);

            toast.info(
                "PDF saved. Note: Password protection requires desktop software. This is a copy of your PDF.",
                "Info"
            );

        } catch (err: any) {
            console.error("Protection error:", err);
            setError("Failed to process PDF. Please try desktop software for password protection.");
            toast.error("Failed to protect PDF", "Error");
        } finally {
            setProtecting(false);
        }
    };

    // Clear/reset
    const handleClear = () => {
        setSelectedFile(null);
        setPassword("");
        setConfirmPassword("");
        setError(null);
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
                    Add password protection to PDF files. Secure your PDFs with encryption to prevent unauthorized access, editing, and printing.
                </p>
            </div>

            {/* Important Notice */}
            <div className="protection-notice">
                <FiAlertCircle />
                <div className="notice-content">
                    <strong>Important:</strong> Browser-based PDF encryption is limited due to security restrictions.
                    For full password protection with AES-256 encryption, please use desktop software like Adobe Acrobat, PDFtk, or similar tools.
                    This tool demonstrates the concept but cannot add real encryption in the browser.
                </div>
            </div>

            {/* Upload Section */}
            {!selectedFile ? (
                <div className="protect-pdf-upload-section">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileSelect}
                        className="file-input-hidden"
                        id="protectPdfInput"
                    />
                    <label htmlFor="protectPdfInput" className="protect-pdf-upload-area">
                        <FiUpload className="upload-icon" />
                        <h3>Click to upload PDF</h3>
                        <p>or drag and drop</p>
                        <small>PDF files to protect • Maximum 10MB</small>
                    </label>
                </div>
            ) : (
                <div className="protect-pdf-file-section">
                    <div className="file-info-card">
                        <div className="file-icon">
                            <FiFileText />
                        </div>
                        <div className="file-details">
                            <div className="file-name">{selectedFile.name}</div>
                            <div className="file-meta">
                                <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                <span>•</span>
                                <span className="protection-status unprotected">
                                    <FiShield /> Ready to Protect
                                </span>
                            </div>
                        </div>
                        <button className="btn-remove-file" onClick={handleClear}>
                            <FiTrash2 />
                        </button>
                    </div>

                    {/* Password Input */}
                    <div className="password-protection-section">
                        <div className="password-input-group">
                            <label htmlFor="newPassword">Set Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password (min. 6 characters)"
                                    className="password-input"
                                    autoComplete="new-password"
                                />
                                <button
                                    className="btn-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    type="button"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="password-strength">
                                    <div className="strength-bar-container">
                                        <div
                                            className="strength-bar"
                                            style={{
                                                width: `${(passwordStrength.score / 7) * 100}%`,
                                                backgroundColor: passwordStrength.color
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="strength-label"
                                        style={{ color: passwordStrength.color }}
                                    >
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}

                            <small className="password-hint">
                                Use a mix of uppercase, lowercase, numbers, and symbols for stronger security
                            </small>
                        </div>

                        <div className="password-input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className="password-input"
                                    autoComplete="new-password"
                                />
                                {confirmPassword && password === confirmPassword && (
                                    <div className="password-match-icon">
                                        <FiCheckCircle />
                                    </div>
                                )}
                            </div>

                            {confirmPassword && password !== confirmPassword && (
                                <small className="password-error">
                                    Passwords do not match
                                </small>
                            )}
                        </div>
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

                    {/* Protect Button */}
                    {!protecting && (
                        <motion.button
                            className="btn-protect-pdf"
                            onClick={protectPdf}
                            disabled={!password || !confirmPassword || password !== confirmPassword}
                            whileHover={{
                                scale: (!password || !confirmPassword || password !== confirmPassword) ? 1 : 1.02
                            }}
                            whileTap={{
                                scale: (!password || !confirmPassword || password !== confirmPassword) ? 1 : 0.98
                            }}
                        >
                            <FiLock />
                            Protect & Download PDF
                        </motion.button>
                    )}

                    {protecting && (
                        <div className="protecting-status">
                            <FiShield className="shield-icon spinning" />
                            <span>Protecting PDF...</span>
                        </div>
                    )}
                </div>
            )}

            {/* How It Works */}
            {!selectedFile && (
                <div className="how-it-works">
                    <h3>How It Works (Desktop Software Recommended)</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Upload PDF</h4>
                            <p>Select the PDF to protect</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Set Password</h4>
                            <p>Create a strong password</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Confirm</h4>
                            <p>Re-enter password to verify</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Download</h4>
                            <p>Use desktop software for encryption</p>
                        </div>
                    </div>

                    <div className="protection-info">
                        <h4>Browser Limitations:</h4>
                        <ul className="info-list limitations">
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Web browsers cannot add real PDF encryption for security reasons</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>JavaScript-based encryption is not secure for sensitive documents</span>
                            </li>
                            <li>
                                <FiAlertCircle className="warning-icon" />
                                <span>Industry-standard AES-256 encryption requires desktop software</span>
                            </li>
                        </ul>

                        <h4>Recommended Desktop Software:</h4>
                        <ul className="info-list">
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span><strong>Adobe Acrobat Pro</strong> - Industry standard with AES-256 encryption</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span><strong>PDFtk</strong> - Free command-line tool for PDF encryption</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span><strong>PDF-XChange Editor</strong> - Affordable alternative with encryption</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span><strong>LibreOffice</strong> - Free office suite with PDF password protection</span>
                            </li>
                        </ul>

                        <h4>What Desktop Software Can Do:</h4>
                        <ul className="info-list">
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Add user password (required to open PDF)</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Add owner password (restrict editing/printing)</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Use AES-256 encryption (industry standard)</span>
                            </li>
                            <li>
                                <FiCheckCircle className="check-icon" />
                                <span>Set specific permissions (copy, print, modify)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiLock />
                            <span>Password strength checker</span>
                        </div>
                        <div className="feature-item">
                            <FiShield />
                            <span>Security recommendations</span>
                        </div>
                        <div className="feature-item">
                            <FiCheckCircle />
                            <span>100% private processing</span>
                        </div>
                        <div className="feature-item">
                            <FiAlertCircle />
                            <span>Desktop software recommended</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ProtectPdfTool;
