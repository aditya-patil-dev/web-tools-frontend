"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiCode,
    FiCopy,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiDownload,
    FiCheck,
    FiX,
} from "react-icons/fi";

type FormatMode = "beautify" | "minify" | "validate";

interface ValidationError {
    message: string;
    line?: number;
    column?: number;
}

const JSONFormatterTool = () => {
    const [inputJSON, setInputJSON] = useState<string>("");
    const [outputJSON, setOutputJSON] = useState<string>("");
    const [mode, setMode] = useState<FormatMode>("beautify");
    const [indentSize, setIndentSize] = useState<number>(2);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [copied, setCopied] = useState(false);
    const [jsonStats, setJsonStats] = useState({
        keys: 0,
        values: 0,
        objects: 0,
        arrays: 0,
        depth: 0,
        size: 0,
    });

    // Validate and parse JSON
    const validateJSON = (text: string): { valid: boolean; errors: ValidationError[]; parsed?: any } => {
        if (!text.trim()) {
            return { valid: false, errors: [{ message: "Input is empty" }] };
        }

        try {
            const parsed = JSON.parse(text);
            return { valid: true, errors: [], parsed };
        } catch (error: any) {
            const errorMatch = error.message.match(/position (\d+)/);
            const position = errorMatch ? parseInt(errorMatch[1]) : 0;

            // Calculate line and column from position
            const lines = text.substring(0, position).split('\n');
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;

            return {
                valid: false,
                errors: [{
                    message: error.message,
                    line,
                    column,
                }],
            };
        }
    };

    // Calculate JSON statistics
    const calculateStats = (obj: any) => {
        let keys = 0;
        let values = 0;
        let objects = 0;
        let arrays = 0;
        let maxDepth = 0;

        const traverse = (item: any, depth: number = 0) => {
            maxDepth = Math.max(maxDepth, depth);

            if (Array.isArray(item)) {
                arrays++;
                item.forEach(element => traverse(element, depth + 1));
            } else if (item !== null && typeof item === 'object') {
                objects++;
                Object.keys(item).forEach(key => {
                    keys++;
                    values++;
                    traverse(item[key], depth + 1);
                });
            } else {
                values++;
            }
        };

        traverse(obj);

        return {
            keys,
            values,
            objects,
            arrays,
            depth: maxDepth,
            size: JSON.stringify(obj).length,
        };
    };

    // Beautify JSON
    const beautifyJSON = (text: string, indent: number): string => {
        const validation = validateJSON(text);
        if (!validation.valid || !validation.parsed) {
            throw new Error("Invalid JSON");
        }
        return JSON.stringify(validation.parsed, null, indent);
    };

    // Minify JSON
    const minifyJSON = (text: string): string => {
        const validation = validateJSON(text);
        if (!validation.valid || !validation.parsed) {
            throw new Error("Invalid JSON");
        }
        return JSON.stringify(validation.parsed);
    };

    // Handle format action
    const handleFormat = () => {
        const validation = validateJSON(inputJSON);
        setIsValid(validation.valid);
        setErrors(validation.errors);

        if (!validation.valid) {
            setOutputJSON("");
            return;
        }

        try {
            let formatted = "";

            if (mode === "beautify") {
                formatted = beautifyJSON(inputJSON, indentSize);
            } else if (mode === "minify") {
                formatted = minifyJSON(inputJSON);
            } else if (mode === "validate") {
                formatted = inputJSON; // Keep original if just validating
            }

            setOutputJSON(formatted);

            // Calculate statistics
            if (validation.parsed) {
                setJsonStats(calculateStats(validation.parsed));
            }
        } catch (error: any) {
            setIsValid(false);
            setErrors([{ message: error.message }]);
            setOutputJSON("");
        }
    };

    // Auto-validate on input change
    useEffect(() => {
        if (inputJSON.trim()) {
            const validation = validateJSON(inputJSON);
            setIsValid(validation.valid);
            setErrors(validation.errors);

            if (validation.valid && validation.parsed) {
                setJsonStats(calculateStats(validation.parsed));
            }
        } else {
            setIsValid(null);
            setErrors([]);
            setJsonStats({
                keys: 0,
                values: 0,
                objects: 0,
                arrays: 0,
                depth: 0,
                size: 0,
            });
        }
    }, [inputJSON]);

    // Copy to clipboard
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Download as JSON file
    const handleDownload = () => {
        const textToDownload = outputJSON || inputJSON;
        const blob = new Blob([textToDownload], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `formatted-${mode}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Clear all
    const handleClear = () => {
        setInputJSON("");
        setOutputJSON("");
        setIsValid(null);
        setErrors([]);
        setCopied(false);
    };

    // Sample JSON examples
    const loadSampleJSON = (type: "simple" | "complex") => {
        const samples = {
            simple: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "active": true
}`,
            complex: `{
  "user": {
    "id": 12345,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "roles": ["admin", "editor"],
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    }
  },
  "posts": [
    {
      "id": 1,
      "title": "Hello World",
      "published": true,
      "tags": ["javascript", "react"]
    },
    {
      "id": 2,
      "title": "Learning JSON",
      "published": false,
      "tags": ["json", "tutorial"]
    }
  ]
}`
        };
        setInputJSON(samples[type]);
    };

    // Format byte size
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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
                    Format, beautify, minify, and validate JSON data instantly. Perfect for developers and API testing.
                </p>
            </div>

            {/* Controls Section */}
            <div className="json-controls-section">
                <div className="controls-left">
                    {/* Mode Selector */}
                    <div className="json-mode-selector">
                        <button
                            className={`mode-btn ${mode === "beautify" ? "active" : ""}`}
                            onClick={() => setMode("beautify")}
                        >
                            <FiCode /> Beautify
                        </button>
                        <button
                            className={`mode-btn ${mode === "minify" ? "active" : ""}`}
                            onClick={() => setMode("minify")}
                        >
                            <FiCode /> Minify
                        </button>
                        <button
                            className={`mode-btn ${mode === "validate" ? "active" : ""}`}
                            onClick={() => setMode("validate")}
                        >
                            <FiCheckCircle /> Validate
                        </button>
                    </div>

                    {/* Indent Size (only for beautify) */}
                    {mode === "beautify" && (
                        <div className="indent-selector">
                            <label>Indent:</label>
                            <select
                                value={indentSize}
                                onChange={(e) => setIndentSize(Number(e.target.value))}
                                className="indent-select"
                            >
                                <option value={2}>2 spaces</option>
                                <option value={4}>4 spaces</option>
                                <option value={8}>8 spaces</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="controls-right">
                    {/* Sample Data Buttons */}
                    <button
                        className="btn-sample"
                        onClick={() => loadSampleJSON("simple")}
                    >
                        Load Simple
                    </button>
                    <button
                        className="btn-sample"
                        onClick={() => loadSampleJSON("complex")}
                    >
                        Load Complex
                    </button>

                    {inputJSON && (
                        <button className="btn-clear-json" onClick={handleClear}>
                            <FiRefreshCw /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="json-workspace">
                {/* Left Side - Input */}
                <div className="json-input-section">
                    <div className="section-header">
                        <h3>
                            <FiCode /> Input JSON
                        </h3>
                        {isValid !== null && (
                            <div className={`validation-badge ${isValid ? "valid" : "invalid"}`}>
                                {isValid ? (
                                    <>
                                        <FiCheck /> Valid JSON
                                    </>
                                ) : (
                                    <>
                                        <FiX /> Invalid JSON
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <textarea
                        className={`json-input-area ${isValid === false ? "invalid" : ""}`}
                        placeholder='Paste your JSON here... e.g., {"name": "John", "age": 30}'
                        value={inputJSON}
                        onChange={(e) => setInputJSON(e.target.value)}
                        rows={20}
                        spellCheck={false}
                    />

                    {/* Error Messages */}
                    <AnimatePresence>
                        {errors.length > 0 && (
                            <motion.div
                                className="error-messages"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {errors.map((error, index) => (
                                    <div key={index} className="error-item">
                                        <FiAlertCircle />
                                        <div className="error-details">
                                            <div className="error-message">{error.message}</div>
                                            {error.line && (
                                                <div className="error-location">
                                                    Line {error.line}, Column {error.column}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Statistics */}
                    {inputJSON && isValid && (
                        <motion.div
                            className="json-stats-grid"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="stat-item">
                                <span className="stat-label">Keys:</span>
                                <span className="stat-value">{jsonStats.keys}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Objects:</span>
                                <span className="stat-value">{jsonStats.objects}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Arrays:</span>
                                <span className="stat-value">{jsonStats.arrays}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Depth:</span>
                                <span className="stat-value">{jsonStats.depth}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Size:</span>
                                <span className="stat-value">{formatBytes(jsonStats.size)}</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Right Side - Output */}
                <div className="json-output-section">
                    <div className="section-header">
                        <h3>
                            <FiCode /> Output
                        </h3>
                        {outputJSON && (
                            <div className="output-actions">
                                <motion.button
                                    className="btn-copy-json"
                                    onClick={() => handleCopy(outputJSON)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
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
                                </motion.button>

                                <motion.button
                                    className="btn-download-json"
                                    onClick={handleDownload}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiDownload /> Download
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {!outputJSON ? (
                        <div className="empty-output">
                            <FiCode className="empty-icon" />
                            <p>Formatted JSON will appear here</p>
                            <p className="empty-hint">Enter JSON and click the Format button</p>
                        </div>
                    ) : (
                        <div className="json-output-display">
                            <pre>
                                <code>{outputJSON}</code>
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            {/* Format Button */}
            <div className="json-action-section">
                <motion.button
                    className="btn-format-json"
                    onClick={handleFormat}
                    disabled={!inputJSON.trim() || isValid === false}
                    whileHover={{ scale: !inputJSON.trim() || isValid === false ? 1 : 1.02 }}
                    whileTap={{ scale: !inputJSON.trim() || isValid === false ? 1 : 0.98 }}
                >
                    <FiCode />
                    {mode === "beautify" && "Beautify JSON"}
                    {mode === "minify" && "Minify JSON"}
                    {mode === "validate" && "Validate JSON"}
                </motion.button>

                {outputJSON && mode !== "validate" && (
                    <div className="size-comparison">
                        <div className="size-item">
                            <span className="size-label">Original:</span>
                            <span className="size-value">{formatBytes(inputJSON.length)}</span>
                        </div>
                        <div className="size-arrow">→</div>
                        <div className="size-item">
                            <span className="size-label">Formatted:</span>
                            <span className="size-value">{formatBytes(outputJSON.length)}</span>
                        </div>
                        {mode === "minify" && outputJSON.length < inputJSON.length && (
                            <div className="size-savings">
                                Saved {formatBytes(inputJSON.length - outputJSON.length)}
                                ({Math.round((1 - outputJSON.length / inputJSON.length) * 100)}%)
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default JSONFormatterTool;

