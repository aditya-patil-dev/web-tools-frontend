"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiCode, FiCopy, FiCheckCircle, FiAlertCircle,
    FiRefreshCw, FiDownload, FiCheck, FiX, FiZap,
    FiMinimize2, FiMaximize2, FiDatabase,
} from "react-icons/fi";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type FormatMode = "beautify" | "minify" | "validate";

interface ValidationError {
    message: string;
    line?: number;
    column?: number;
}

interface JsonStats {
    keys: number;
    values: number;
    objects: number;
    arrays: number;
    depth: number;
    size: number;
}

/* ─────────────────────────────────────────
   JSON Syntax Highlighter
───────────────────────────────────────── */
const JsonHighlight = ({ code }: { code: string }) => {
    const highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = "jf-num";
                if (/^"/.test(match)) {
                    cls = /:$/.test(match) ? "jf-key" : "jf-str";
                } else if (/true|false/.test(match)) {
                    cls = "jf-bool";
                } else if (/null/.test(match)) {
                    cls = "jf-null";
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const JSONFormatterTool = () => {
    const [inputJSON, setInputJSON] = useState("");
    const [outputJSON, setOutputJSON] = useState("");
    const [mode, setMode] = useState<FormatMode>("beautify");
    const [indentSize, setIndentSize] = useState(2);
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [copied, setCopied] = useState(false);
    const [jsonStats, setJsonStats] = useState<JsonStats>({ keys: 0, values: 0, objects: 0, arrays: 0, depth: 0, size: 0 });

    /* ── Validate ── */
    const validateJSON = useCallback((text: string): { valid: boolean; errors: ValidationError[]; parsed?: any } => {
        if (!text.trim()) return { valid: false, errors: [{ message: "Input is empty" }] };
        try {
            const parsed = JSON.parse(text);
            return { valid: true, errors: [], parsed };
        } catch (error: any) {
            const pos = error.message.match(/position (\d+)/);
            const position = pos ? parseInt(pos[1]) : 0;
            const lines = text.substring(0, position).split("\n");
            const line = lines.length;
            const column = lines[lines.length - 1].length + 1;
            return { valid: false, errors: [{ message: error.message, line, column }] };
        }
    }, []);

    /* ── Stats ── */
    const calculateStats = useCallback((obj: any): JsonStats => {
        let keys = 0, values = 0, objects = 0, arrays = 0, maxDepth = 0;
        const traverse = (item: any, depth = 0) => {
            maxDepth = Math.max(maxDepth, depth);
            if (Array.isArray(item)) {
                arrays++;
                item.forEach(el => traverse(el, depth + 1));
            } else if (item !== null && typeof item === "object") {
                objects++;
                Object.keys(item).forEach(k => { keys++; values++; traverse(item[k], depth + 1); });
            } else {
                values++;
            }
        };
        traverse(obj);
        return { keys, values, objects, arrays, depth: maxDepth, size: JSON.stringify(obj).length };
    }, []);

    /* ── Auto-validate on input change ── */
    useEffect(() => {
        if (inputJSON.trim()) {
            const v = validateJSON(inputJSON);
            setIsValid(v.valid);
            setErrors(v.errors);
            if (v.valid && v.parsed) setJsonStats(calculateStats(v.parsed));
        } else {
            setIsValid(null);
            setErrors([]);
            setJsonStats({ keys: 0, values: 0, objects: 0, arrays: 0, depth: 0, size: 0 });
        }
    }, [inputJSON, validateJSON, calculateStats]);

    /* ── Format ── */
    const handleFormat = () => {
        const v = validateJSON(inputJSON);
        setIsValid(v.valid);
        setErrors(v.errors);
        if (!v.valid || !v.parsed) { setOutputJSON(""); return; }

        try {
            let formatted = "";
            if (mode === "beautify") formatted = JSON.stringify(v.parsed, null, indentSize);
            else if (mode === "minify") formatted = JSON.stringify(v.parsed);
            else formatted = inputJSON;
            setOutputJSON(formatted);
            setJsonStats(calculateStats(v.parsed));
        } catch (err: any) {
            setIsValid(false);
            setErrors([{ message: err.message }]);
            setOutputJSON("");
        }
    };

    /* ── Copy ── */
    const handleCopy = async () => {
        const text = outputJSON || inputJSON;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch { /* ignore */ }
    };

    /* ── Download ── */
    const handleDownload = () => {
        const text = outputJSON || inputJSON;
        if (!text) return;
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `formatted-${mode}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    /* ── Clear ── */
    const handleClear = () => {
        setInputJSON(""); setOutputJSON("");
        setIsValid(null); setErrors([]);
        setCopied(false);
    };

    /* ── Samples ── */
    const loadSample = (type: "simple" | "complex") => {
        const samples = {
            simple: `{\n  "name": "Alice Chen",\n  "age": 31,\n  "email": "alice@example.com",\n  "active": true,\n  "score": 9.8\n}`,
            complex: `{\n  "user": {\n    "id": 12345,\n    "name": "Jane Smith",\n    "email": "jane@example.com",\n    "roles": ["admin", "editor"],\n    "preferences": {\n      "theme": "dark",\n      "notifications": true,\n      "language": "en"\n    }\n  },\n  "posts": [\n    {\n      "id": 1,\n      "title": "Hello World",\n      "published": true,\n      "tags": ["javascript", "react"]\n    },\n    {\n      "id": 2,\n      "title": "Learning JSON",\n      "published": false,\n      "tags": ["json", "tutorial"]\n    }\n  ]\n}`,
        };
        setInputJSON(samples[type]);
        setOutputJSON("");
    };

    const canFormat = !!inputJSON.trim() && isValid !== false;
    const savingsPct = outputJSON && mode === "minify" && outputJSON.length < inputJSON.length
        ? Math.round((1 - outputJSON.length / inputJSON.length) * 100)
        : null;

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="tool-info-banner">
                <FiCode />
                <p>
                    Beautify, minify, and validate JSON data instantly. All processing happens locally for maximum privacy.
                </p>
            </div>

            <div className="case-converter-section">

                {/* ── Controls bar ── */}
                <div className="case-options-grid">
                    {([
                        { id: "beautify", icon: <FiMaximize2 />, label: "Beautify" },
                        { id: "minify", icon: <FiMinimize2 />, label: "Minify" },
                        { id: "validate", icon: <FiCheckCircle />, label: "Validate" },
                    ] as { id: FormatMode; icon: React.ReactNode; label: string }[]).map(m => (
                        <button
                            key={m.id}
                            type="button"
                            className={`case-option-btn${mode === m.id ? " active" : ""}`}
                            onClick={() => setMode(m.id)}
                        >
                            <div className="case-icon">{m.icon}</div>
                            <div className="case-info"><span className="case-label">{m.label}</span></div>
                        </button>
                    ))}
                </div>

                    {/* Indent selector */}
                    <AnimatePresence>
                        {mode === "beautify" && (
                            <motion.div
                                className="jf-indent-wrap"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="jf-indent-label">Indent</label>
                                <select
                                    className="jf-indent-select"
                                    value={indentSize}
                                    onChange={e => setIndentSize(Number(e.target.value))}
                                >
                                    <option value={2}>2 spaces</option>
                                    <option value={4}>4 spaces</option>
                                    <option value={8}>8 spaces</option>
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Sample + clear buttons */}
                <div className="output-actions" style={{ marginTop: 12, justifyContent: "flex-start" }}>
                    <button type="button" className="btn-ghost" onClick={() => loadSample("simple")}>
                        <FiZap /> Simple
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => loadSample("complex")}>
                        <FiDatabase /> Complex
                    </button>
                    {inputJSON && (
                        <button type="button" className="btn-ghost" onClick={handleClear}>
                            <FiRefreshCw /> Clear
                        </button>
                    )}
                </div>

                {/* ── Input — full width ── */}
                <div className="text-input-section" style={{ marginTop: 24 }}>
                    <div className="section-header">
                        <h3>
                            <FiCode /> Input JSON
                        </h3>
                        <div className="output-actions">
                            {/* Live validation badge */}
                            {isValid !== null && (
                                <span className={`stat-label ${isValid ? "text-success" : "text-error"}`} style={{ marginRight: 12, color: isValid ? "var(--color-success)" : "var(--color-error)" }}>
                                    {isValid ? <FiCheck /> : <FiX />} {isValid ? "Valid" : "Invalid"}
                                </span>
                            )}
                            {/* Live stats */}
                            {inputJSON && (
                                <span className="stat-label">
                                    {inputJSON.length.toLocaleString()} chars
                                </span>
                            )}
                        </div>
                    </div>

                    <textarea
                        className="text-input-area"
                        placeholder={'Paste your JSON here…\nExample: {"name": "Alice", "age": 30}'}
                        value={inputJSON}
                        onChange={e => setInputJSON(e.target.value)}
                        spellCheck={false}
                        autoComplete="off"
                        rows={10}
                    />

                    {/* Error messages */}
                    <AnimatePresence>
                        {errors.length > 0 && (
                            <motion.div
                                className="jf-errors"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {errors.map((err, i) => (
                                    <div key={i} className="jf-error-item">
                                        <FiAlertCircle />
                                        <div>
                                            <p className="jf-error-msg">{err.message}</p>
                                            {err.line && (
                                                <p className="jf-error-loc">Line {err.line}, Column {err.column}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Stats Grid */}
                <AnimatePresence>
                    {inputJSON && isValid && (
                        <motion.div
                            className="text-stats-grid"
                            style={{ marginTop: 16 }}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                        >
                            {[
                                { label: "Keys", value: jsonStats.keys.toLocaleString() },
                                { label: "Objects", value: jsonStats.objects.toLocaleString() },
                                { label: "Arrays", value: jsonStats.arrays.toLocaleString() },
                                { label: "Depth", value: jsonStats.depth.toLocaleString() },
                                { label: "Size", value: formatBytes(jsonStats.size) },
                            ].map(s => (
                                <div key={s.label} className="stat-card">
                                    <span className="stat-value" style={{ fontSize: "1.25rem" }}>{s.value}</span>
                                    <span className="stat-label">{s.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Format button — full width ── */}
                <motion.button
                    type="button"
                    className="btn-convert"
                    style={{ marginTop: 24 }}
                    onClick={handleFormat}
                    disabled={!canFormat}
                    whileHover={{ scale: canFormat ? 1.01 : 1 }}
                    whileTap={{ scale: canFormat ? 0.98 : 1 }}
                >
                    <FiCode />
                    {mode === "beautify" && "Beautify JSON"}
                    {mode === "minify" && "Minify JSON"}
                    {mode === "validate" && "Validate JSON"}
                </motion.button>

                {/* Output Section */}
                <AnimatePresence>
                    {(outputJSON || (isValid === true && mode === "validate")) && (
                        <motion.div
                            className="converted-output-section"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="section-header">
                                <h3>
                                    <FiCode /> Output
                                    {mode === "validate" && isValid && (
                                        <span className="stat-label" style={{ marginLeft: 12, color: "var(--color-success)" }}>
                                            <FiCheck /> Valid
                                        </span>
                                    )}
                                </h3>

                                <div className="output-actions">
                                    {/* Size comparison */}
                                    {outputJSON && mode !== "validate" && (
                                        <div className="stat-label" style={{ marginRight: 16 }}>
                                            <span>{formatBytes(inputJSON.length)}</span>
                                            <span style={{ margin: "0 8px" }}>→</span>
                                            <span>{formatBytes(outputJSON.length)}</span>
                                        </div>
                                    )}

                                    {outputJSON && (
                                        <div className="output-actions">
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={handleCopy}
                                            >
                                                {copied ? <><FiCheckCircle /> Copied!</> : <><FiCopy /> Copy</>}
                                            </button>
                                            <button type="button" className="btn-ghost" onClick={handleDownload}>
                                                <FiDownload /> Download
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {outputJSON ? (
                                <div className="converted-text-display">
                                    <pre style={{ margin: 0 }}>
                                        <JsonHighlight code={outputJSON} />
                                    </pre>
                                </div>
                            ) : mode === "validate" && isValid ? (
                                <div style={{ textAlign: "center", padding: "20px 0" }}>
                                    <FiCheckCircle style={{ fontSize: 48, color: "var(--color-success)", marginBottom: 12 }} />
                                    <p style={{ fontWeight: 700 }}>JSON is valid!</p>
                                </div>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    );
};

export default JSONFormatterTool;