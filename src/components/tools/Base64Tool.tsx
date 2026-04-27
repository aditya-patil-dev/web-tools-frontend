"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiCode,
    FiCopy,
    FiCheckCircle,
    FiRefreshCw,
    FiUpload,
    FiDownload,
    FiImage,
    FiFile,
    FiAlertCircle,
    FiArrowRight,
    FiArrowLeft,
    FiType
} from "react-icons/fi";

type OperationMode = "encode" | "decode";
type InputType = "text" | "file";

const Base64Tool = () => {
    const [mode, setMode] = useState<OperationMode>("encode");
    const [inputType, setInputType] = useState<InputType>("text");
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Encode text to Base64
    const encodeToBase64 = (text: string): string => {
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch (err) {
            throw new Error("Failed to encode text to Base64");
        }
    };

    // Decode Base64 to text
    const decodeFromBase64 = (base64: string): string => {
        try {
            // Remove whitespace and newlines
            const cleaned = base64.replace(/\s/g, "");
            return decodeURIComponent(escape(atob(cleaned)));
        } catch (err) {
            throw new Error("Invalid Base64 string");
        }
    };

    // Handle text encoding/decoding
    const handleProcess = () => {
        setError(null);
        setOutputText("");

        if (!inputText.trim()) {
            setError("Please enter text to process");
            return;
        }

        try {
            if (mode === "encode") {
                const encoded = encodeToBase64(inputText);
                setOutputText(encoded);
                toast.success("Text encoded to Base64", "Success");
            } else {
                const decoded = decodeFromBase64(inputText);
                setOutputText(decoded);
                toast.success("Base64 decoded successfully", "Success");
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message, "Error");
        }
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB", "File Too Large");
            return;
        }

        setSelectedFile(file);
        setError(null);

        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result as string;

            if (mode === "encode") {
                // For encoding, extract base64 from data URL
                const base64 = result.split(",")[1];
                setOutputText(base64);

                // Show preview for images
                if (file.type.startsWith("image/")) {
                    setFilePreview(result);
                }

                toast.success(`File encoded: ${file.name}`, "Success");
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read file", "Error");
            setError("Failed to read file");
        };

        reader.readAsDataURL(file);
    };

    // Handle decode file (from Base64 to downloadable file)
    const handleDecodeFile = () => {
        if (!inputText.trim()) {
            toast.error("Please enter Base64 data", "No Input");
            return;
        }

        setError(null);

        try {
            // Try to detect file type from Base64 header
            let mimeType = "application/octet-stream";
            let fileName = "decoded-file";

            // Check if it's a data URL
            if (inputText.startsWith("data:")) {
                const matches = inputText.match(/^data:(.+);base64,(.+)$/);
                if (matches) {
                    mimeType = matches[1];
                    const base64Data = matches[2];
                    downloadBase64File(base64Data, mimeType, fileName);
                    return;
                }
            }

            // Assume it's raw base64
            downloadBase64File(inputText, mimeType, fileName);
        } catch (err: any) {
            setError("Invalid Base64 data");
            toast.error("Failed to decode file", "Error");
        }
    };

    // Download Base64 as file
    const downloadBase64File = (base64Data: string, mimeType: string, fileName: string) => {
        try {
            const cleaned = base64Data.replace(/\s/g, "");
            const byteCharacters = atob(cleaned);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            // Determine file extension
            let extension = "";
            if (mimeType.includes("image/png")) extension = ".png";
            else if (mimeType.includes("image/jpeg")) extension = ".jpg";
            else if (mimeType.includes("image/gif")) extension = ".gif";
            else if (mimeType.includes("image/webp")) extension = ".webp";
            else if (mimeType.includes("application/pdf")) extension = ".pdf";
            else if (mimeType.includes("text/plain")) extension = ".txt";

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName + extension;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("File downloaded successfully", "Success");
        } catch (err) {
            toast.error("Failed to download file", "Error");
            throw err;
        }
    };

    // Copy to clipboard
    const handleCopy = async () => {
        if (!outputText) return;

        try {
            await navigator.clipboard.writeText(outputText);
            setCopied(true);
            toast.success("Copied to clipboard!", "Success");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy", "Error");
        }
    };

    // Download output as text file
    const handleDownloadText = () => {
        if (!outputText) return;

        const blob = new Blob([outputText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mode === "encode" ? "encoded.txt" : "decoded.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Downloaded as text file", "Success");
    };

    // Clear all
    const handleClear = () => {
        setInputText("");
        setOutputText("");
        setSelectedFile(null);
        setFilePreview("");
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info("Cleared", "Reset");
    };

    // Load sample
    const loadSample = () => {
        if (mode === "encode") {
            setInputText("Hello, World! This is a sample text for Base64 encoding.");
        } else {
            setInputText("SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=");
        }
        toast.success("Sample loaded", "Success");
    };

    // Switch mode
    const switchMode = () => {
        setMode(mode === "encode" ? "decode" : "encode");
        setInputText("");
        setOutputText("");
        setSelectedFile(null);
        setFilePreview("");
        setError(null);
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
                <FiCode />
                <p>
                    Encode text and files to Base64 or decode Base64 strings back to original format instantly. All processing happens locally in your browser.
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="case-converter-section">
                <div className="case-options-grid">
                    <button
                        className={`case-option-btn ${mode === "encode" ? "active" : ""}`}
                        onClick={() => mode !== "encode" && switchMode()}
                    >
                        <div className="case-icon"><FiCode /></div>
                        <div className="case-info">
                            <span className="case-label">Encode to Base64</span>
                        </div>
                    </button>
                    <button
                        className={`case-option-btn ${mode === "decode" ? "active" : ""}`}
                        onClick={() => mode !== "decode" && switchMode()}
                    >
                        <div className="case-icon"><FiRefreshCw /></div>
                        <div className="case-info">
                            <span className="case-label">Decode from Base64</span>
                        </div>
                    </button>
                </div>

                {/* Input Type Selector (only for encode mode) */}
                {mode === "encode" && (
                    <div className="case-options-grid" style={{ marginTop: 12 }}>
                        <button
                            className={`case-option-btn ${inputType === "text" ? "active" : ""}`}
                            onClick={() => setInputType("text")}
                        >
                            <div className="case-icon"><FiType /></div>
                            <div className="case-info"><span className="case-label">Text Input</span></div>
                        </button>
                        <button
                            className={`case-option-btn ${inputType === "file" ? "active" : ""}`}
                            onClick={() => setInputType("file")}
                        >
                            <div className="case-icon"><FiFile /></div>
                            <div className="case-info"><span className="case-label">File Input</span></div>
                        </button>
                    </div>
                )}
            </div>

            <div className="text-tool-workspace">
                {/* Input Section */}
                <div className="text-input-section">
                    <div className="section-header">
                        <h3>
                            {mode === "encode" ? <FiArrowRight /> : <FiArrowLeft />}
                            {mode === "encode" ? "Input Data" : "Base64 Input"}
                        </h3>
                        <div className="output-actions">
                            <button className="btn-ghost" onClick={loadSample}>
                                Sample
                            </button>
                            {(inputText || selectedFile) && (
                                <button className="btn-ghost" onClick={handleClear}>
                                    <FiRefreshCw /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {mode === "encode" && inputType === "file" ? (
                        <div className="file-upload-section">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileUpload}
                                className="file-input-hidden"
                                id="base64FileInput"
                            />
                            <label htmlFor="base64FileInput" className="tool-upload-area">
                                <div className="upload-icon">
                                    <FiUpload />
                                </div>
                                <h4>Click to upload file</h4>
                                <p>Support for images, PDF, and text files (Max 5MB)</p>
                            </label>

                            {selectedFile && (
                                <div className="selected-file-info">
                                    <div className="file-icon">
                                        {selectedFile.type.startsWith("image/") ? <FiImage /> : <FiFile />}
                                    </div>
                                    <div className="file-details">
                                        <div className="file-name">{selectedFile.name}</div>
                                        <div className="file-size">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </div>
                                    </div>
                                    <button
                                        className="btn-remove-file"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setFilePreview("");
                                            setOutputText("");
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                    >
                                        <FiAlertCircle />
                                    </button>
                                </div>
                            )}

                            {filePreview && (
                                <div className="file-preview">
                                    <img src={filePreview} alt="Preview" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <textarea
                            className="text-input-area"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={
                                mode === "encode"
                                    ? "Enter text to encode..."
                                    : "Paste Base64 string to decode..."
                            }
                            rows={12}
                            spellCheck={false}
                        />
                    )}

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

                    {/* Character Count */}
                    {inputText && inputType === "text" && (
                        <div className="char-count-display">
                            {inputText.length.toLocaleString()} characters
                        </div>
                    )}

                    {/* Process Button */}
                    {inputType === "text" && (
                        <motion.button
                            className="btn-convert"
                            onClick={handleProcess}
                            disabled={!inputText.trim()}
                            whileHover={{ scale: !inputText.trim() ? 1 : 1.01 }}
                            whileTap={{ scale: !inputText.trim() ? 1 : 0.98 }}
                        >
                            {mode === "encode" ? (
                                <>
                                    <FiCode /> Encode to Base64
                                </>
                            ) : (
                                <>
                                    <FiCode /> Decode from Base64
                                </>
                            )}
                        </motion.button>
                    )}

                    {/* Decode File Button (for decode mode) */}
                    {mode === "decode" && inputText && (
                        <motion.button
                            className="btn-download"
                            onClick={handleDecodeFile}
                            style={{ marginTop: 12 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiDownload /> Decode as File
                        </motion.button>
                    )}
                </div>

                {/* Output Section */}
                <div className="case-converter-section">
                    <div className="section-header">
                        <h3>
                            {mode === "encode" ? <FiCode /> : <FiType />}
                            {mode === "encode" ? "Base64 Output" : "Decoded Output"}
                        </h3>
                        {outputText && (
                            <div className="output-actions">
                                <button
                                    className="btn-ghost"
                                    onClick={handleCopy}
                                >
                                    {copied ? (
                                        <>
                                            <FiCheckCircle /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <FiCopy /> Copy
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn-ghost"
                                    onClick={handleDownloadText}
                                >
                                    <FiDownload /> Download
                                </button>
                            </div>
                        )}
                    </div>

                    {!outputText ? (
                        <div className="empty-output">
                            <FiCode className="empty-icon" style={{ fontSize: 48, opacity: 0.1, marginBottom: 16 }} />
                            <p>Output will appear here</p>
                            <small>
                                {mode === "encode" ? "Enter text or upload a file to encode" : "Enter Base64 string to decode"}
                            </small>
                        </div>
                    ) : (
                        <div className="converted-text-display">
                            <code>{outputText}</code>
                            {outputText.length > 0 && (
                                <div className="output-stats" style={{ marginTop: 12, fontSize: 12, opacity: 0.5, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 8 }}>
                                    <span>{outputText.length.toLocaleString()} characters</span>
                                    <span style={{ margin: "0 8px" }}>•</span>
                                    <span>{(outputText.length / 1024).toFixed(2)} KB</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            {!inputText && !outputText && (
                <div className="base64-info-section">
                    <h3>About Base64 Encoding</h3>
                    <div className="info-grid">
                        <div className="info-card">
                            <h4>📝 What is Base64?</h4>
                            <p>
                                Base64 is a binary-to-text encoding scheme that represents binary data in ASCII format.
                                It's commonly used to encode data for transmission over text-based protocols.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔄 How it works</h4>
                            <p>
                                Base64 converts binary data into a set of 64 ASCII characters (A-Z, a-z, 0-9, +, /).
                                Every 3 bytes (24 bits) are encoded into 4 Base64 characters.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>💡 Common Uses</h4>
                            <p>
                                Email attachments (MIME), embedding images in HTML/CSS, JWT tokens, API authentication,
                                data URLs, and transmitting binary data over text protocols.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>📊 Size Impact</h4>
                            <p>
                                Base64 encoding increases data size by approximately 33%. For example, a 3KB file becomes
                                about 4KB when Base64 encoded.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🖼️ Image Embedding</h4>
                            <p>
                                Use Base64 to embed images directly in HTML/CSS using data URLs:
                                <code>data:image/png;base64,iVBORw0KG...</code>
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔒 Security Note</h4>
                            <p>
                                Base64 is encoding, not encryption. It provides no security or privacy.
                                Encoded data can be easily decoded by anyone.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Base64Tool;