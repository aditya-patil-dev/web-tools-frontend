"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
    FiCode, FiCopy, FiCheckCircle, FiRefreshCw,
    FiDownload, FiAlertCircle, FiTable, FiArrowRight,
    FiRepeat, FiZap, FiDatabase, FiSettings,
} from "react-icons/fi";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type ConversionMode = "json-to-csv" | "csv-to-json";

interface ConversionResult {
    output: string;
    preview: any[];
    headers: string[];
    rowCount: number;
    colCount: number;
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const fmtKb = (str: string) => `${(str.length / 1024).toFixed(2)} KB`;

/* Simple JSON syntax highlighter */
const JsonHighlight = ({ code }: { code: string }) => {
    const highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = "jc-num";
                if (/^"/.test(match)) {
                    cls = /:$/.test(match) ? "jc-key" : "jc-str";
                } else if (/true|false/.test(match)) {
                    cls = "jc-bool";
                } else if (/null/.test(match)) {
                    cls = "jc-null";
                }
                return `<span class="${cls}">${match}</span>`;
            });
    return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const JsonToCsvTool = () => {
    const [mode,           setMode]           = useState<ConversionMode>("json-to-csv");
    const [inputData,      setInputData]      = useState("");
    const [result,         setResult]         = useState<ConversionResult | null>(null);
    const [copied,         setCopied]         = useState(false);
    const [error,          setError]          = useState<string | null>(null);
    const [delimiter,      setDelimiter]      = useState(",");
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [converting,     setConverting]     = useState(false);

    /* ── Live input stats ── */
    const inputStats = useMemo(() => {
        if (!inputData.trim()) return null;
        return {
            chars: inputData.length,
            lines: inputData.split("\n").length,
        };
    }, [inputData]);

    /* ── JSON → CSV ── */
    const convertJsonToCsv = (json: string): ConversionResult => {
        let data = JSON.parse(json);
        if (!Array.isArray(data)) data = [data];
        if (data.length === 0) throw new Error("JSON array is empty");

        const csv = Papa.unparse(data, {
            delimiter,
            header: includeHeaders,
            skipEmptyLines: true,
        });

        const parsed = Papa.parse(csv, { delimiter, header: includeHeaders, preview: 6 });
        const headers = includeHeaders && parsed.data.length > 0
            ? Object.keys((parsed.data[0] as any) || {})
            : [];

        return {
            output:   csv,
            preview:  parsed.data.slice(0, 5) as any[],
            headers,
            rowCount: data.length,
            colCount: headers.length || (data[0] ? Object.keys(data[0]).length : 0),
        };
    };

    /* ── CSV → JSON ── */
    const convertCsvToJson = (csv: string): ConversionResult => {
        const parsed = Papa.parse(csv, {
            delimiter: delimiter === "auto" ? "" : delimiter,
            header: includeHeaders,
            skipEmptyLines: true,
            dynamicTyping: true,
        });

        if (parsed.errors.length > 0)
            throw new Error(`CSV parse error: ${parsed.errors[0].message}`);

        const json = JSON.stringify(parsed.data, null, 2);
        const arr  = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
        const headers = arr.length > 0 && typeof arr[0] === "object" ? Object.keys(arr[0] as any) : [];

        return {
            output:   json,
            preview:  arr.slice(0, 5),
            headers,
            rowCount: arr.length,
            colCount: headers.length,
        };
    };

    /* ── Handle convert ── */
    const handleConvert = () => {
        setError(null);
        setResult(null);

        if (!inputData.trim()) {
            setError("Please enter data to convert");
            return;
        }

        setConverting(true);

        // Use setTimeout to allow spinner to render before sync work
        setTimeout(() => {
            try {
                const res = mode === "json-to-csv"
                    ? convertJsonToCsv(inputData)
                    : convertCsvToJson(inputData);
                setResult(res);
                toast.success(
                    `Converted! ${res.rowCount.toLocaleString()} rows · ${res.colCount} columns`,
                    "Success"
                );
            } catch (err: any) {
                const msg = err instanceof SyntaxError ? "Invalid JSON format" : (err.message || "Conversion failed");
                setError(msg);
                toast.error(msg, "Failed");
            } finally {
                setConverting(false);
            }
        }, 0);
    };

    /* ── Copy ── */
    const handleCopy = async () => {
        if (!result?.output) return;
        try {
            await navigator.clipboard.writeText(result.output);
            setCopied(true);
            toast.success("Copied to clipboard!", "Copied");
            setTimeout(() => setCopied(false), 2500);
        } catch { toast.error("Failed to copy", "Error"); }
    };

    /* ── Download ── */
    const handleDownload = () => {
        if (!result?.output) return;
        const ext  = mode === "json-to-csv" ? "csv" : "json";
        const type = mode === "json-to-csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8";
        const blob = new Blob([result.output], { type });
        saveAs(blob, `converted.${ext}`);
        toast.success(`Downloaded as converted.${ext}`, "Downloaded");
    };

    /* ── Clear ── */
    const handleClear = () => {
        setInputData("");
        setResult(null);
        setError(null);
    };

    /* ── Load sample ── */
    const loadSample = () => {
        if (mode === "json-to-csv") {
            setInputData(JSON.stringify([
                { id: 1, name: "Alice Chen",    email: "alice@example.com",  age: 31, active: true  },
                { id: 2, name: "Bob Martinez",  email: "bob@example.com",    age: 27, active: true  },
                { id: 3, name: "Carol Johnson", email: "carol@example.com",  age: 35, active: false },
                { id: 4, name: "David Kim",     email: "david@example.com",  age: 29, active: true  },
            ], null, 2));
        } else {
            setInputData(`id,name,email,age,active\n1,Alice Chen,alice@example.com,31,true\n2,Bob Martinez,bob@example.com,27,true\n3,Carol Johnson,carol@example.com,35,false\n4,David Kim,david@example.com,29,true`);
        }
        setResult(null);
        setError(null);
    };

    /* ── Switch mode ── */
    const switchMode = () => {
        setMode(m => m === "json-to-csv" ? "csv-to-json" : "json-to-csv");
        setInputData("");
        setResult(null);
        setError(null);
    };

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
        <div className="jc-root">

            {/* ── Mode + Options bar ── */}
            <div className="jc-topbar">
                {/* Mode switcher */}
                <div className="jc-mode-switcher">
                    <button
                        type="button"
                        className={`jc-mode-btn${mode === "json-to-csv" ? " jc-mode-btn--active" : ""}`}
                        onClick={() => mode !== "json-to-csv" && switchMode()}
                    >
                        <FiCode /> JSON → CSV
                    </button>

                    <button
                        type="button"
                        className="jc-mode-swap"
                        onClick={switchMode}
                        title="Swap mode"
                    >
                        <motion.span
                            animate={{ rotate: mode === "csv-to-json" ? 180 : 0 }}
                            transition={{ duration: 0.35 }}
                            style={{ display: "flex" }}
                        >
                            <FiRepeat />
                        </motion.span>
                    </button>

                    <button
                        type="button"
                        className={`jc-mode-btn${mode === "csv-to-json" ? " jc-mode-btn--active" : ""}`}
                        onClick={() => mode !== "csv-to-json" && switchMode()}
                    >
                        <FiTable /> CSV → JSON
                    </button>
                </div>

                {/* Options */}
                <div className="jc-options">
                    <div className="jc-option">
                        <label className="jc-option-label"><FiSettings /> Delimiter</label>
                        <select
                            className="jc-option-select"
                            value={delimiter}
                            onChange={e => setDelimiter(e.target.value)}
                        >
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="\t">Tab</option>
                            <option value="|">Pipe (|)</option>
                            {mode === "csv-to-json" && <option value="auto">Auto-detect</option>}
                        </select>
                    </div>

                    <label className="jc-checkbox-row">
                        <input
                            type="checkbox"
                            checked={includeHeaders}
                            onChange={e => setIncludeHeaders(e.target.checked)}
                        />
                        <span>{mode === "json-to-csv" ? "Include headers" : "First row is headers"}</span>
                    </label>
                </div>
            </div>

            {/* ── Editor columns ── */}
            <div className="jc-editors">

                {/* Input */}
                <div className="jc-panel">
                    <div className="jc-panel-header">
                        <span className="jc-panel-title">
                            {mode === "json-to-csv" ? <FiCode /> : <FiTable />}
                            {mode === "json-to-csv" ? "JSON Input" : "CSV Input"}
                        </span>
                        <div className="jc-panel-actions">
                            <button type="button" className="jc-btn-ghost" onClick={loadSample}>
                                <FiZap /> Sample
                            </button>
                            {inputData && (
                                <button type="button" className="jc-btn-ghost jc-btn-ghost--danger" onClick={handleClear}>
                                    <FiRefreshCw /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <textarea
                        className="jc-textarea"
                        value={inputData}
                        onChange={e => setInputData(e.target.value)}
                        placeholder={
                            mode === "json-to-csv"
                                ? '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]'
                                : "name,age\nAlice,30\nBob,25"
                        }
                        spellCheck={false}
                        autoComplete="off"
                    />

                    {/* Live stats */}
                    {inputStats && (
                        <div className="jc-input-stats">
                            <span>{inputStats.chars.toLocaleString()} chars</span>
                            <span className="jc-stats-sep">·</span>
                            <span>{inputStats.lines.toLocaleString()} lines</span>
                        </div>
                    )}
                </div>

                {/* Output */}
                <div className="jc-panel">
                    <div className="jc-panel-header">
                        <span className="jc-panel-title">
                            {mode === "json-to-csv" ? <FiTable /> : <FiCode />}
                            {mode === "json-to-csv" ? "CSV Output" : "JSON Output"}
                        </span>
                        {result && (
                            <div className="jc-panel-actions">
                                <button
                                    type="button"
                                    className={`jc-btn-ghost${copied ? " jc-btn-ghost--done" : ""}`}
                                    onClick={handleCopy}
                                >
                                    {copied ? <><FiCheckCircle /> Copied!</> : <><FiCopy /> Copy</>}
                                </button>
                                <button type="button" className="jc-btn-ghost" onClick={handleDownload}>
                                    <FiDownload /> Download
                                </button>
                            </div>
                        )}
                    </div>

                    {!result ? (
                        <div className="jc-empty-output">
                            {mode === "json-to-csv"
                                ? <FiTable className="jc-empty-icon" />
                                : <FiCode className="jc-empty-icon" />}
                            <p>Output will appear here</p>
                            <span>Click Convert to see results</span>
                        </div>
                    ) : (
                        <>
                            <div className="jc-output-code">
                                <pre>
                                    {mode === "csv-to-json"
                                        ? <JsonHighlight code={result.output} />
                                        : <code>{result.output}</code>
                                    }
                                </pre>
                            </div>
                            <div className="jc-output-stats">
                                <span>{result.rowCount.toLocaleString()} rows</span>
                                <span className="jc-stats-sep">·</span>
                                <span>{result.colCount} columns</span>
                                <span className="jc-stats-sep">·</span>
                                <span>{fmtKb(result.output)}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Error ── */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="jc-error"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <FiAlertCircle /><span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Convert button — full width ── */}
            <motion.button
                type="button"
                className="jc-btn-convert"
                onClick={handleConvert}
                disabled={!inputData.trim() || converting}
                whileHover={{ scale: !inputData.trim() || converting ? 1 : 1.01 }}
                whileTap={{ scale: !inputData.trim() || converting ? 1 : 0.98 }}
            >
                {converting ? (
                    <><span className="jc-spinner" /> Converting…</>
                ) : (
                    <><FiArrowRight /> Convert to {mode === "json-to-csv" ? "CSV" : "JSON"}</>
                )}
            </motion.button>

            {/* ── Full-width Preview ── */}
            <AnimatePresence>
                {result && result.preview.length > 0 && (
                    <motion.div
                        className="jc-preview"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="jc-preview-header">
                            <span className="jc-preview-title">
                                {mode === "json-to-csv" ? <FiTable /> : <FiDatabase />}
                                Data Preview
                            </span>
                            <span className="jc-preview-meta">
                                Showing {Math.min(5, result.rowCount)} of {result.rowCount.toLocaleString()} rows
                                {result.colCount > 0 && ` · ${result.colCount} columns`}
                            </span>
                        </div>

                        {/* Table preview (for JSON→CSV output or CSV→JSON with objects) */}
                        {result.headers.length > 0 && (
                            <div className="jc-table-wrap">
                                <table className="jc-table">
                                    <thead>
                                        <tr>
                                            <th className="jc-table-rownum">#</th>
                                            {result.headers.map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.preview.map((row: any, ri: number) => (
                                            <tr key={ri}>
                                                <td className="jc-table-rownum">{ri + 1}</td>
                                                {result.headers.map(h => (
                                                    <td key={h}>
                                                        <span className={`jc-cell-val${typeof row[h] === "boolean" ? " jc-cell-bool" : typeof row[h] === "number" ? " jc-cell-num" : row[h] === null || row[h] === undefined ? " jc-cell-null" : ""}`}>
                                                            {row[h] === null || row[h] === undefined
                                                                ? <em>null</em>
                                                                : typeof row[h] === "boolean"
                                                                    ? row[h] ? "true" : "false"
                                                                    : String(row[h])}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Raw preview fallback for headerless data */}
                        {result.headers.length === 0 && (
                            <div className="jc-preview-raw">
                                <pre><code>{JSON.stringify(result.preview, null, 2)}</code></pre>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Info cards (only when empty) ── */}
            {!inputData && !result && (
                <motion.div
                    className="jc-info-grid"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {[
                        { icon: <FiTable />,    title: "JSON → CSV",           desc: "Convert JSON arrays to CSV for Excel, Google Sheets, and data analysis tools." },
                        { icon: <FiCode />,     title: "CSV → JSON",           desc: "Convert CSV to JSON for APIs and web apps. Auto-detects numbers and booleans." },
                        { icon: <FiSettings />, title: "Delimiter options",    desc: "Comma, semicolon, tab, pipe — or auto-detect mode for CSV input." },
                        { icon: <FiDatabase />, title: "Smart type detection", desc: "Numbers, booleans, and nulls are automatically typed during conversion." },
                        { icon: <FiDownload />, title: "Export ready",         desc: "Download as .csv or .json files, or copy directly to clipboard." },
                        { icon: <FiZap />,      title: "Instant & private",    desc: "All conversion happens in your browser — data never leaves your device." },
                    ].map(c => (
                        <div key={c.title} className="jc-info-card">
                            <div className="jc-info-icon">{c.icon}</div>
                            <div>
                                <p className="jc-info-title">{c.title}</p>
                                <p className="jc-info-desc">{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

        </div>
        </motion.div>
    );
};

export default JsonToCsvTool;