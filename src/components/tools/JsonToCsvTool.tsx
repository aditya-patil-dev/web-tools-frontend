"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
    FiCode,
    FiCopy,
    FiCheckCircle,
    FiRefreshCw,
    FiDownload,
    FiAlertCircle,
    FiTable,
    FiFileText,
    FiArrowRight
} from "react-icons/fi";

type ConversionMode = "json-to-csv" | "csv-to-json";

const JsonToCsvTool = () => {
    const [mode, setMode] = useState<ConversionMode>("json-to-csv");
    const [inputData, setInputData] = useState("");
    const [outputData, setOutputData] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [delimiter, setDelimiter] = useState(",");
    const [includeHeaders, setIncludeHeaders] = useState(true);
    const [preview, setPreview] = useState<any[]>([]);

    // JSON to CSV conversion
    const convertJsonToCsv = (jsonString: string): string => {
        try {
            // Parse JSON
            let jsonData = JSON.parse(jsonString);

            // Handle single object - convert to array
            if (!Array.isArray(jsonData)) {
                jsonData = [jsonData];
            }

            // Check if array is empty
            if (jsonData.length === 0) {
                throw new Error("JSON array is empty");
            }

            // Convert to CSV using PapaParse
            const csv = Papa.unparse(jsonData, {
                delimiter: delimiter,
                header: includeHeaders,
                skipEmptyLines: true,
            });

            return csv;
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                throw new Error("Invalid JSON format");
            }
            throw new Error(err.message || "Failed to convert JSON to CSV");
        }
    };

    // CSV to JSON conversion
    const convertCsvToJson = (csvString: string): string => {
        try {
            // Parse CSV using PapaParse
            const result = Papa.parse(csvString, {
                delimiter: delimiter === "auto" ? "" : delimiter,
                header: includeHeaders,
                skipEmptyLines: true,
                dynamicTyping: true, // Convert numbers and booleans
            });

            if (result.errors.length > 0) {
                const firstError = result.errors[0];
                throw new Error(`CSV parsing error: ${firstError.message}`);
            }

            // Convert to JSON
            const json = JSON.stringify(result.data, null, 2);
            return json;
        } catch (err: any) {
            throw new Error(err.message || "Failed to convert CSV to JSON");
        }
    };

    // Handle conversion
    const handleConvert = () => {
        setError(null);
        setOutputData("");
        setPreview([]);

        if (!inputData.trim()) {
            setError("Please enter data to convert");
            return;
        }

        try {
            let result: string;

            if (mode === "json-to-csv") {
                result = convertJsonToCsv(inputData);
                toast.success("JSON converted to CSV successfully!", "Success");

                // Generate preview
                const parsed = Papa.parse(result, {
                    delimiter: delimiter,
                    header: includeHeaders,
                    preview: 5, // Show first 5 rows
                });
                setPreview(parsed.data);
            } else {
                result = convertCsvToJson(inputData);
                toast.success("CSV converted to JSON successfully!", "Success");

                // Generate preview
                const jsonData = JSON.parse(result);
                setPreview(Array.isArray(jsonData) ? jsonData.slice(0, 5) : [jsonData]);
            }

            setOutputData(result);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message, "Conversion Failed");
        }
    };

    // Copy to clipboard
    const handleCopy = async () => {
        if (!outputData) return;

        try {
            await navigator.clipboard.writeText(outputData);
            setCopied(true);
            toast.success("Copied to clipboard!", "Success");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy", "Error");
        }
    };

    // Download file
    const handleDownload = () => {
        if (!outputData) return;

        const blob = new Blob([outputData], {
            type: mode === "json-to-csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8"
        });

        const fileName = mode === "json-to-csv" ? "converted.csv" : "converted.json";
        saveAs(blob, fileName);

        toast.success(`Downloaded as ${fileName}`, "Success");
    };

    // Clear all
    const handleClear = () => {
        setInputData("");
        setOutputData("");
        setError(null);
        setPreview([]);
        toast.info("Cleared", "Reset");
    };

    // Load sample data
    const loadSample = () => {
        if (mode === "json-to-csv") {
            const sampleJson = [
                {
                    id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                    age: 30,
                    active: true
                },
                {
                    id: 2,
                    name: "Jane Smith",
                    email: "jane@example.com",
                    age: 28,
                    active: true
                },
                {
                    id: 3,
                    name: "Bob Johnson",
                    email: "bob@example.com",
                    age: 35,
                    active: false
                }
            ];
            setInputData(JSON.stringify(sampleJson, null, 2));
        } else {
            const sampleCsv = `id,name,email,age,active
1,John Doe,john@example.com,30,true
2,Jane Smith,jane@example.com,28,true
3,Bob Johnson,bob@example.com,35,false`;
            setInputData(sampleCsv);
        }
        toast.success("Sample data loaded", "Success");
    };

    // Switch mode
    const switchMode = () => {
        setMode(mode === "json-to-csv" ? "csv-to-json" : "json-to-csv");
        setInputData("");
        setOutputData("");
        setError(null);
        setPreview([]);
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
                    Convert between JSON and CSV formats instantly. Perfect for data import/export,
                    spreadsheet integration, and API data transformation.
                </p>
            </div>

            {/* Mode Switcher */}
            <div className="converter-mode-section">
                <div className="mode-switcher">
                    <button
                        className={`mode-btn ${mode === "json-to-csv" ? "active" : ""}`}
                        onClick={() => mode !== "json-to-csv" && switchMode()}
                    >
                        <FiCode />
                        JSON to CSV
                    </button>
                    <button
                        className="mode-switch-icon"
                        onClick={switchMode}
                        title="Switch mode"
                    >
                        <FiRefreshCw />
                    </button>
                    <button
                        className={`mode-btn ${mode === "csv-to-json" ? "active" : ""}`}
                        onClick={() => mode !== "csv-to-json" && switchMode()}
                    >
                        <FiTable />
                        CSV to JSON
                    </button>
                </div>

                {/* Conversion Options */}
                <div className="conversion-options">
                    <div className="option-group">
                        <label>Delimiter:</label>
                        <select
                            value={delimiter}
                            onChange={(e) => setDelimiter(e.target.value)}
                            className="option-select"
                        >
                            <option value=",">Comma (,)</option>
                            <option value=";">Semicolon (;)</option>
                            <option value="\t">Tab (\t)</option>
                            <option value="|">Pipe (|)</option>
                            {mode === "csv-to-json" && <option value="auto">Auto-detect</option>}
                        </select>
                    </div>

                    <div className="option-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={includeHeaders}
                                onChange={(e) => setIncludeHeaders(e.target.checked)}
                            />
                            <span>
                                {mode === "json-to-csv" ? "Include column headers" : "First row is headers"}
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="converter-workspace">
                {/* Input Section */}
                <div className="converter-input-section">
                    <div className="section-header">
                        <h3>
                            {mode === "json-to-csv" ? <FiCode /> : <FiTable />}
                            {mode === "json-to-csv" ? "JSON Input" : "CSV Input"}
                        </h3>
                        <div className="header-actions">
                            <button className="btn-sample-converter" onClick={loadSample}>
                                Load Sample
                            </button>
                            {inputData && (
                                <button className="btn-clear-converter" onClick={handleClear}>
                                    <FiRefreshCw /> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <textarea
                        className="converter-input-area"
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        placeholder={
                            mode === "json-to-csv"
                                ? 'Paste your JSON here...\nExample: [{"name": "John", "age": 30}]'
                                : 'Paste your CSV here...\nExample:\nname,age\nJohn,30'
                        }
                        rows={16}
                        spellCheck={false}
                    />

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

                    {inputData && (
                        <div className="input-stats">
                            {mode === "json-to-csv" ? (
                                <span>JSON: {inputData.length.toLocaleString()} characters</span>
                            ) : (
                                <span>CSV: {inputData.split('\n').length} lines</span>
                            )}
                        </div>
                    )}

                    {/* Convert Button */}
                    <motion.button
                        className="btn-convert"
                        onClick={handleConvert}
                        disabled={!inputData.trim()}
                        whileHover={{ scale: !inputData.trim() ? 1 : 1.02 }}
                        whileTap={{ scale: !inputData.trim() ? 1 : 0.98 }}
                    >
                        <FiArrowRight />
                        Convert to {mode === "json-to-csv" ? "CSV" : "JSON"}
                    </motion.button>
                </div>

                {/* Output Section */}
                <div className="converter-output-section">
                    <div className="section-header">
                        <h3>
                            {mode === "json-to-csv" ? <FiTable /> : <FiCode />}
                            {mode === "json-to-csv" ? "CSV Output" : "JSON Output"}
                        </h3>
                        {outputData && (
                            <div className="output-actions">
                                <button className="btn-copy-converter" onClick={handleCopy}>
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
                                <button className="btn-download-converter" onClick={handleDownload}>
                                    <FiDownload /> Download
                                </button>
                            </div>
                        )}
                    </div>

                    {!outputData ? (
                        <div className="empty-output">
                            {mode === "json-to-csv" ? <FiTable className="empty-icon" /> : <FiCode className="empty-icon" />}
                            <p>Output will appear here</p>
                            <small>
                                {mode === "json-to-csv"
                                    ? "Enter JSON data and click Convert to CSV"
                                    : "Enter CSV data and click Convert to JSON"}
                            </small>
                        </div>
                    ) : (
                        <>
                            <div className="converter-output-display">
                                <pre>
                                    <code>{outputData}</code>
                                </pre>
                            </div>

                            {outputData && (
                                <div className="output-stats">
                                    {mode === "json-to-csv" ? (
                                        <>
                                            <span>CSV: {outputData.split('\n').length} lines</span>
                                            <span>•</span>
                                            <span>{(outputData.length / 1024).toFixed(2)} KB</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>JSON: {outputData.length.toLocaleString()} characters</span>
                                            <span>•</span>
                                            <span>{(outputData.length / 1024).toFixed(2)} KB</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Preview Table */}
                            {preview.length > 0 && mode === "json-to-csv" && (
                                <div className="preview-section">
                                    <h4>Preview (First 5 rows)</h4>
                                    <div className="preview-table-container">
                                        <table className="preview-table">
                                            <tbody>
                                                {preview.map((row: any, index: number) => (
                                                    <tr key={index}>
                                                        {Array.isArray(row) ? (
                                                            row.map((cell: any, cellIndex: number) => (
                                                                <td key={cellIndex}>{cell}</td>
                                                            ))
                                                        ) : (
                                                            Object.values(row).map((cell: any, cellIndex: number) => (
                                                                <td key={cellIndex}>{String(cell)}</td>
                                                            ))
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Preview JSON */}
                            {preview.length > 0 && mode === "csv-to-json" && (
                                <div className="preview-section">
                                    <h4>Preview (First 5 records)</h4>
                                    <div className="preview-json">
                                        <pre>
                                            <code>{JSON.stringify(preview, null, 2)}</code>
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Info Section */}
            {!inputData && !outputData && (
                <div className="converter-info-section">
                    <h3>About JSON & CSV Conversion</h3>
                    <div className="info-grid">
                        <div className="info-card">
                            <h4>📊 JSON to CSV</h4>
                            <p>
                                Convert JSON arrays or objects to CSV format for spreadsheet applications like Excel,
                                Google Sheets, or data analysis tools.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔄 CSV to JSON</h4>
                            <p>
                                Convert CSV files to JSON format for APIs, web applications, and modern data processing.
                                Automatically detects data types.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>⚙️ Delimiter Options</h4>
                            <p>
                                Support for comma, semicolon, tab, and pipe delimiters. Auto-detect mode available for
                                CSV to JSON conversion.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>📝 Header Handling</h4>
                            <p>
                                Choose to include or exclude column headers. Headers become JSON object keys when
                                converting CSV to JSON.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>🔢 Smart Type Detection</h4>
                            <p>
                                Automatically converts strings to numbers and booleans when appropriate during CSV to
                                JSON conversion.
                            </p>
                        </div>
                        <div className="info-card">
                            <h4>💾 Export Options</h4>
                            <p>
                                Download converted data as .csv or .json files. Copy to clipboard for quick pasting
                                into other applications.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default JsonToCsvTool;
