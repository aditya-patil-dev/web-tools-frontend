"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiLink,
    FiCheckCircle,
    FiAlertCircle,
    FiArrowRight,
    FiRefreshCw,
    FiClock,
    FiActivity,
    FiExternalLink,
    FiCopy,
    FiDownload,
} from "react-icons/fi";
import { checkRedirect } from "@/lib/api-calls/tools.api";

interface RedirectHop {
    url: string;
    statusCode: number;
    statusText: string;
    redirectType: string;
    responseTime: number;
    headers: Record<string, string>;
}

interface RedirectResult {
    originalUrl: string;
    finalUrl: string;
    redirectChain: RedirectHop[];
    totalRedirects: number;
    totalTime: number;
    hasIssues: boolean;
    issues: string[];
    timestamp: string;
}

const RedirectCheckerTool = () => {
    const [url, setUrl] = useState<string>("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<RedirectResult | null>(null);
    const [error, setError] = useState<string>("");
    const [expandedHop, setExpandedHop] = useState<number | null>(null);

    // Get redirect type description
    const getRedirectTypeInfo = (statusCode: number) => {
        const redirectTypes: Record<number, { name: string; description: string; color: string }> = {
            301: {
                name: "Permanent Redirect",
                description: "Search engines will update their index to the new URL",
                color: "#10b981",
            },
            302: {
                name: "Temporary Redirect",
                description: "Search engines will keep the original URL in their index",
                color: "#f59e0b",
            },
            303: {
                name: "See Other",
                description: "Client should use GET method for the redirected request",
                color: "#3b82f6",
            },
            307: {
                name: "Temporary Redirect",
                description: "Same as 302 but preserves request method",
                color: "#f59e0b",
            },
            308: {
                name: "Permanent Redirect",
                description: "Same as 301 but preserves request method",
                color: "#10b981",
            },
            200: {
                name: "Success",
                description: "Final destination reached successfully",
                color: "#10b981",
            },
            404: {
                name: "Not Found",
                description: "The requested resource could not be found",
                color: "#ef4444",
            },
            500: {
                name: "Server Error",
                description: "Internal server error occurred",
                color: "#ef4444",
            },
        };

        return (
            redirectTypes[statusCode] || {
                name: `HTTP ${statusCode}`,
                description: "Unknown status code",
                color: "#6b7280",
            }
        );
    };

    // Validate URL
    const validateUrl = (input: string): string | null => {
        try {
            let urlToValidate = input.trim();

            // Add protocol if missing
            if (!urlToValidate.match(/^https?:\/\//i)) {
                urlToValidate = "https://" + urlToValidate;
            }

            const urlObj = new URL(urlToValidate);
            return urlObj.href;
        } catch {
            return null;
        }
    };

    // Check redirects
    const checkRedirects = async () => {
        const validatedUrl = validateUrl(url);

        if (!validatedUrl) {
            setError("Please enter a valid URL");
            return;
        }

        setError("");
        setChecking(true);
        setResult(null);

        try {
            const data = await checkRedirect(validatedUrl);
            setResult(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to check redirects. Please try again.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setChecking(false);
        }
    };

    // Copy result to clipboard
    const copyToClipboard = () => {
        if (!result) return;

        const text = `
        Redirect Chain Analysis
        =======================
        Original URL: ${result.originalUrl}
        Final URL: ${result.finalUrl}
        Total Redirects: ${result.totalRedirects}
        Total Time: ${(result.totalTime / 1000).toFixed(2)}s

        Redirect Chain:
        ${result.redirectChain
                .map(
                    (hop, i) =>
                        `${i + 1}. ${hop.url}
        Status: ${hop.statusCode} ${hop.statusText}
        Type: ${hop.redirectType}
        Time: ${hop.responseTime}ms`
                )
                .join("\n\n")}

        ${result.hasIssues ? `\nIssues Found:\n${result.issues.map((issue, i) => `${i + 1}. ${issue}`).join("\n")}` : "\nNo issues found!"}
            `.trim();

        navigator.clipboard.writeText(text);
    };

    // Export as JSON
    const exportAsJson = () => {
        if (!result) return;

        const dataStr = JSON.stringify(result, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `redirect-check-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handle enter key
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !checking) {
            checkRedirects();
        }
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
                    Check HTTP redirect chains, identify 301/302 redirects, detect redirect loops, and analyze SEO impact. Perfect for website migrations and link optimization.
                </p>
            </div>

            {/* URL Input Section */}
            <div className="redirect-input-section">
                <div className="url-input-wrapper">
                    <FiLink className="input-icon" />
                    <input
                        type="text"
                        className="redirect-url-input"
                        placeholder="Enter URL to check (e.g., example.com or https://example.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <motion.button
                        className="btn-check-redirect"
                        onClick={checkRedirects}
                        disabled={!url.trim() || checking}
                        whileHover={{ scale: !url.trim() || checking ? 1 : 1.02 }}
                        whileTap={{ scale: !url.trim() || checking ? 1 : 0.98 }}
                    >
                        {checking ? (
                            <>
                                <span className="spinner" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <FiActivity />
                                Check Redirects
                            </>
                        )}
                    </motion.button>
                </div>

                {error && (
                    <motion.div
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <FiAlertCircle />
                        {error}
                    </motion.div>
                )}
            </div>

            {/* Results Section */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        className="redirect-results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {/* Summary Cards */}
                        <div className="redirect-summary">
                            <div className="summary-card">
                                <div className="summary-icon">
                                    <FiArrowRight />
                                </div>
                                <div className="summary-content">
                                    <div className="summary-label">Total Redirects</div>
                                    <div className="summary-value">{result.totalRedirects}</div>
                                </div>
                            </div>

                            <div className="summary-card">
                                <div className="summary-icon">
                                    <FiClock />
                                </div>
                                <div className="summary-content">
                                    <div className="summary-label">Total Time</div>
                                    <div className="summary-value">
                                        {(result.totalTime / 1000).toFixed(2)}s
                                    </div>
                                </div>
                            </div>

                            <div className={`summary-card ${result.hasIssues ? "has-issues" : "no-issues"}`}>
                                <div className="summary-icon">
                                    {result.hasIssues ? <FiAlertCircle /> : <FiCheckCircle />}
                                </div>
                                <div className="summary-content">
                                    <div className="summary-label">Status</div>
                                    <div className="summary-value">
                                        {result.hasIssues ? `${result.issues.length} Issue${result.issues.length > 1 ? 's' : ''}` : "All Good"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="result-actions">
                            <button className="btn-action" onClick={copyToClipboard}>
                                <FiCopy />
                                Copy Results
                            </button>
                            <button className="btn-action" onClick={exportAsJson}>
                                <FiDownload />
                                Export JSON
                            </button>
                        </div>

                        {/* Issues Alert */}
                        {result.hasIssues && (
                            <div className="issues-alert">
                                <div className="issues-header">
                                    <FiAlertCircle />
                                    <h3>Issues Found</h3>
                                </div>
                                <ul className="issues-list">
                                    {result.issues.map((issue, index) => (
                                        <li key={index}>{issue}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* URL Flow */}
                        <div className="url-flow-section">
                            <h3 className="section-title">
                                <FiLink />
                                Redirect Chain
                            </h3>

                            <div className="url-flow">
                                <div className="flow-item original">
                                    <div className="flow-badge">Original URL</div>
                                    <div className="flow-url">
                                        <a href={result.originalUrl} target="_blank" rel="noopener noreferrer">
                                            {result.originalUrl}
                                            <FiExternalLink />
                                        </a>
                                    </div>
                                </div>

                                {result.redirectChain.map((hop, index) => (
                                    <React.Fragment key={index}>
                                        {index < result.redirectChain.length - 1 && (
                                            <div className="flow-arrow">
                                                <FiArrowRight />
                                                <span className="redirect-type-label">
                                                    {hop.statusCode} {hop.redirectType}
                                                </span>
                                            </div>
                                        )}

                                        {index < result.redirectChain.length - 1 && (
                                            <div className="flow-item redirect">
                                                <div className="flow-badge">
                                                    Redirect {index + 1}
                                                </div>

                                                <div className="flow-url">
                                                    <a
                                                        href={result.redirectChain[index + 1].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {result.redirectChain[index + 1].url}
                                                        <FiExternalLink />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}


                                {result.totalRedirects > 0 && (
                                    <div className="flow-arrow">
                                        <FiArrowRight />
                                        <span className="redirect-type-label">Final</span>
                                    </div>
                                )}

                                <div className="flow-item final">
                                    <div className="flow-badge">Final Destination</div>
                                    <div className="flow-url">
                                        <a href={result.finalUrl} target="_blank" rel="noopener noreferrer">
                                            {result.finalUrl}
                                            <FiExternalLink />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Chain */}
                        <div className="redirect-chain-section">
                            <h3 className="section-title">
                                <FiActivity />
                                Detailed Analysis
                            </h3>

                            <div className="redirect-chain">
                                {result.redirectChain.map((hop, index) => {
                                    const typeInfo = getRedirectTypeInfo(hop.statusCode);
                                    const isExpanded = expandedHop === index;

                                    return (
                                        <div
                                            key={index}
                                            className={`chain-item ${isExpanded ? "expanded" : ""}`}
                                        >
                                            <div
                                                className="chain-header"
                                                onClick={() => setExpandedHop(isExpanded ? null : index)}
                                            >
                                                <div className="chain-step">
                                                    <div className="step-number">{index + 1}</div>
                                                    <div className="step-info">
                                                        <div className="step-url">{hop.url}</div>
                                                        <div className="step-meta">
                                                            <span
                                                                className="status-badge"
                                                                style={{ backgroundColor: typeInfo.color }}
                                                            >
                                                                {hop.statusCode} - {typeInfo.name}
                                                            </span>
                                                            <span className="response-time">
                                                                <FiClock />
                                                                {hop.responseTime}ms
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <motion.div
                                                    className="expand-icon"
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                >
                                                    <FiArrowRight />
                                                </motion.div>
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        className="chain-details"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                    >
                                                        <div className="detail-item">
                                                            <strong>Status:</strong> {hop.statusCode} {hop.statusText}
                                                        </div>
                                                        <div className="detail-item">
                                                            <strong>Type:</strong> {typeInfo.name}
                                                        </div>
                                                        <div className="detail-item">
                                                            <strong>Description:</strong> {typeInfo.description}
                                                        </div>
                                                        <div className="detail-item">
                                                            <strong>Response Time:</strong> {hop.responseTime}ms
                                                        </div>
                                                        {hop.headers.location && (
                                                            <div className="detail-item">
                                                                <strong>Redirects To:</strong>{" "}
                                                                <a
                                                                    href={hop.headers.location}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="detail-link"
                                                                >
                                                                    {hop.headers.location}
                                                                    <FiExternalLink />
                                                                </a>
                                                            </div>
                                                        )}
                                                        {Object.keys(hop.headers).length > 0 && (
                                                            <div className="detail-headers">
                                                                <strong>Key Headers:</strong>
                                                                <div className="headers-list">
                                                                    {Object.entries(hop.headers)
                                                                        .filter(([key]) =>
                                                                            ["location", "server", "cache-control", "content-type"].includes(
                                                                                key.toLowerCase()
                                                                            )
                                                                        )
                                                                        .map(([key, value]) => (
                                                                            <div key={key} className="header-row">
                                                                                <span className="header-key">{key}:</span>
                                                                                <span className="header-value">{value}</span>
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SEO Tips */}
                        <div className="seo-tips-section">
                            <h3 className="section-title">
                                <FiCheckCircle />
                                SEO Best Practices
                            </h3>
                            <div className="tips-grid">
                                <div className="tip-card">
                                    <div className="tip-icon green">301</div>
                                    <div className="tip-content">
                                        <h4>Use 301 for Permanent Changes</h4>
                                        <p>
                                            When moving content permanently, use 301 redirects to pass SEO value to the new URL.
                                        </p>
                                    </div>
                                </div>
                                <div className="tip-card">
                                    <div className="tip-icon orange">302</div>
                                    <div className="tip-content">
                                        <h4>302 for Temporary Changes</h4>
                                        <p>
                                            Use 302 only for temporary redirects. Search engines won't update their index.
                                        </p>
                                    </div>
                                </div>
                                <div className="tip-card">
                                    <div className="tip-icon red">
                                        <FiRefreshCw />
                                    </div>
                                    <div className="tip-content">
                                        <h4>Avoid Redirect Chains</h4>
                                        <p>
                                            Keep redirects to a minimum. Each hop adds latency and dilutes SEO value.
                                        </p>
                                    </div>
                                </div>
                                <div className="tip-card">
                                    <div className="tip-icon blue">
                                        <FiCheckCircle />
                                    </div>
                                    <div className="tip-content">
                                        <h4>Always Use HTTPS</h4>
                                        <p>
                                            Ensure your final destination uses HTTPS for security and better rankings.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!result && !checking && !error && (
                <div className="empty-state">
                    <FiLink className="empty-icon" />
                    <h3>Check Your Redirects</h3>
                    <p>
                        Enter a URL above to analyze its redirect chain, identify issues, and get SEO recommendations.
                    </p>
                    <div className="example-urls">
                        <p className="example-label">Try these examples:</p>
                        <button
                            className="example-btn"
                            onClick={() => setUrl("http://google.com")}
                        >
                            http://google.com
                        </button>
                        <button
                            className="example-btn"
                            onClick={() => setUrl("twitter.com")}
                        >
                            twitter.com
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default RedirectCheckerTool;