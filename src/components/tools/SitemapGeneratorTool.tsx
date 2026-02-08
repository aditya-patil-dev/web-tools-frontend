"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText,
    FiPlus,
    FiTrash2,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiCopy,
    FiRefreshCw,
    FiSettings,
    FiGlobe,
    FiCalendar,
    FiTrendingUp,
} from "react-icons/fi";

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
type Priority = "0.0" | "0.1" | "0.2" | "0.3" | "0.4" | "0.5" | "0.6" | "0.7" | "0.8" | "0.9" | "1.0";

interface SitemapUrl {
    id: string;
    loc: string;
    lastmod: string;
    changefreq: ChangeFrequency;
    priority: Priority;
}

const SitemapGeneratorTool = () => {
    const [urls, setUrls] = useState<SitemapUrl[]>([
        {
            id: "1",
            loc: "",
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: "0.5",
        },
    ]);
    const [baseUrl, setBaseUrl] = useState<string>("");
    const [generatedXml, setGeneratedXml] = useState<string>("");
    const [showXml, setShowXml] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [bulkInput, setBulkInput] = useState("");
    const [showBulkAdd, setShowBulkAdd] = useState(false);

    // Settings
    const [settings, setSettings] = useState({
        includeLastmod: true,
        includeChangefreq: true,
        includePriority: true,
        prettyPrint: true,
    });

    // Add new URL
    const addUrl = () => {
        const newUrl: SitemapUrl = {
            id: Date.now().toString(),
            loc: "",
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: "0.5",
        };
        setUrls([...urls, newUrl]);
    };

    // Remove URL
    const removeUrl = (id: string) => {
        if (urls.length === 1) return; // Keep at least one URL
        setUrls(urls.filter((url) => url.id !== id));
    };

    // Update URL field
    const updateUrl = (id: string, field: keyof SitemapUrl, value: string) => {
        setUrls(
            urls.map((url) =>
                url.id === id ? { ...url, [field]: value } : url
            )
        );
    };

    // Validate URL
    const isValidUrl = (urlString: string): boolean => {
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    // Bulk add URLs
    const handleBulkAdd = () => {
        const lines = bulkInput
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const newUrls: SitemapUrl[] = lines.map((line) => {
            // Check if line has full URL or just path
            let fullUrl = line;
            if (!line.startsWith("http")) {
                fullUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${line.replace(/^\//, "")}` : line;
            }

            return {
                id: `${Date.now()}-${Math.random()}`,
                loc: fullUrl,
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "weekly" as ChangeFrequency,
                priority: "0.5" as Priority,
            };
        });

        // Replace the default empty URL or add to existing
        if (urls.length === 1 && urls[0].loc === "") {
            setUrls(newUrls);
        } else {
            setUrls([...urls, ...newUrls]);
        }

        setBulkInput("");
        setShowBulkAdd(false);
    };

    // Generate XML
    const generateXml = () => {
        const validUrls = urls.filter((url) => url.loc.trim() !== "" && isValidUrl(url.loc));

        if (validUrls.length === 0) {
            alert("Please add at least one valid URL");
            return;
        }

        const indent = settings.prettyPrint ? "  " : "";
        const newline = settings.prettyPrint ? "\n" : "";

        let xml = '<?xml version="1.0" encoding="UTF-8"?>' + newline;
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + newline;

        validUrls.forEach((url) => {
            xml += indent + "<url>" + newline;
            xml += indent + indent + `<loc>${escapeXml(url.loc)}</loc>` + newline;

            if (settings.includeLastmod && url.lastmod) {
                xml += indent + indent + `<lastmod>${url.lastmod}</lastmod>` + newline;
            }

            if (settings.includeChangefreq && url.changefreq) {
                xml += indent + indent + `<changefreq>${url.changefreq}</changefreq>` + newline;
            }

            if (settings.includePriority && url.priority) {
                xml += indent + indent + `<priority>${url.priority}</priority>` + newline;
            }

            xml += indent + "</url>" + newline;
        });

        xml += "</urlset>";

        setGeneratedXml(xml);
        setShowXml(true);
    };

    // Escape XML special characters
    const escapeXml = (str: string): string => {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    };

    // Download XML
    const downloadXml = () => {
        if (!generatedXml) {
            generateXml();
            return;
        }

        const blob = new Blob([generatedXml], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sitemap.xml";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Copy to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedXml);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    // Clear all
    const clearAll = () => {
        setUrls([
            {
                id: "1",
                loc: "",
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "weekly",
                priority: "0.5",
            },
        ]);
        setGeneratedXml("");
        setShowXml(false);
        setBaseUrl("");
    };

    // Load sample
    const loadSample = () => {
        const sampleUrls: SitemapUrl[] = [
            {
                id: "1",
                loc: "https://example.com/",
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "daily",
                priority: "1.0",
            },
            {
                id: "2",
                loc: "https://example.com/about",
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "monthly",
                priority: "0.8",
            },
            {
                id: "3",
                loc: "https://example.com/blog",
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "weekly",
                priority: "0.9",
            },
            {
                id: "4",
                loc: "https://example.com/contact",
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "yearly",
                priority: "0.7",
            },
        ];
        setUrls(sampleUrls);
        setBaseUrl("https://example.com");
    };

    // Get statistics
    const stats = {
        totalUrls: urls.filter((url) => url.loc.trim() !== "").length,
        validUrls: urls.filter((url) => url.loc.trim() !== "" && isValidUrl(url.loc)).length,
        invalidUrls: urls.filter((url) => url.loc.trim() !== "" && !isValidUrl(url.loc)).length,
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
                    Create XML sitemaps for your website to help search engines discover and index your pages. Generate valid sitemap.xml files with customizable settings.
                </p>
            </div>

            {/* Top Controls */}
            <div className="sitemap-top-controls">
                <div className="base-url-input">
                    <FiGlobe />
                    <input
                        type="text"
                        placeholder="Base URL (optional, e.g., https://example.com)"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        className="sitemap-base-url-field"
                    />
                </div>
                <div className="control-buttons">
                    <button className="btn-sample" onClick={loadSample}>
                        <FiFileText />
                        Load Sample
                    </button>
                    <button
                        className="btn-bulk-add"
                        onClick={() => setShowBulkAdd(!showBulkAdd)}
                    >
                        <FiPlus />
                        Bulk Add URLs
                    </button>
                    <button
                        className="btn-settings-toggle"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <FiSettings />
                        {showSettings ? "Hide" : "Show"} Settings
                    </button>
                    {urls.length > 1 && (
                        <button className="btn-clear-sitemap" onClick={clearAll}>
                            <FiRefreshCw />
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Bulk Add Panel */}
            <AnimatePresence>
                {showBulkAdd && (
                    <motion.div
                        className="bulk-add-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h3>
                            <FiPlus />
                            Bulk Add URLs
                        </h3>
                        <p className="bulk-add-hint">
                            Enter one URL or path per line. If you've set a base URL above, you can enter just the paths (e.g., /about, /contact).
                        </p>
                        <textarea
                            className="bulk-add-textarea"
                            placeholder="Example:
                                        /about
                                        /services
                                        /blog
                                        /contact
                                        https://example.com/products"
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            rows={8}
                        />
                        <div className="bulk-add-actions">
                            <button className="btn-bulk-add-apply" onClick={handleBulkAdd}>
                                <FiCheckCircle />
                                Add URLs
                            </button>
                            <button
                                className="btn-bulk-add-cancel"
                                onClick={() => {
                                    setShowBulkAdd(false);
                                    setBulkInput("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="sitemap-settings-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h3>
                            <FiSettings />
                            Sitemap Settings
                        </h3>
                        <div className="settings-checkboxes">
                            <div className="setting-checkbox">
                                <input
                                    type="checkbox"
                                    id="includeLastmod"
                                    checked={settings.includeLastmod}
                                    onChange={(e) =>
                                        setSettings({ ...settings, includeLastmod: e.target.checked })
                                    }
                                />
                                <label htmlFor="includeLastmod">Include Last Modified Date</label>
                            </div>
                            <div className="setting-checkbox">
                                <input
                                    type="checkbox"
                                    id="includeChangefreq"
                                    checked={settings.includeChangefreq}
                                    onChange={(e) =>
                                        setSettings({ ...settings, includeChangefreq: e.target.checked })
                                    }
                                />
                                <label htmlFor="includeChangefreq">Include Change Frequency</label>
                            </div>
                            <div className="setting-checkbox">
                                <input
                                    type="checkbox"
                                    id="includePriority"
                                    checked={settings.includePriority}
                                    onChange={(e) =>
                                        setSettings({ ...settings, includePriority: e.target.checked })
                                    }
                                />
                                <label htmlFor="includePriority">Include Priority</label>
                            </div>
                            <div className="setting-checkbox">
                                <input
                                    type="checkbox"
                                    id="prettyPrint"
                                    checked={settings.prettyPrint}
                                    onChange={(e) =>
                                        setSettings({ ...settings, prettyPrint: e.target.checked })
                                    }
                                />
                                <label htmlFor="prettyPrint">Pretty Print (Formatted XML)</label>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Statistics */}
            <div className="sitemap-stats">
                <div className="stat-item">
                    <FiGlobe className="stat-icon" />
                    <div className="stat-content">
                        <span className="stat-label">Total URLs</span>
                        <span className="stat-value">{stats.totalUrls}</span>
                    </div>
                </div>
                <div className="stat-item">
                    <FiCheckCircle className="stat-icon valid" />
                    <div className="stat-content">
                        <span className="stat-label">Valid URLs</span>
                        <span className="stat-value">{stats.validUrls}</span>
                    </div>
                </div>
                {stats.invalidUrls > 0 && (
                    <div className="stat-item">
                        <FiAlertCircle className="stat-icon invalid" />
                        <div className="stat-content">
                            <span className="stat-label">Invalid URLs</span>
                            <span className="stat-value">{stats.invalidUrls}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* URL List */}
            <div className="sitemap-url-list">
                <div className="url-list-header">
                    <h3>
                        <FiGlobe />
                        URLs
                    </h3>
                    <button className="btn-add-url" onClick={addUrl}>
                        <FiPlus />
                        Add URL
                    </button>
                </div>

                <div className="url-items">
                    {urls.map((url, index) => {
                        const isValid = url.loc.trim() === "" || isValidUrl(url.loc);

                        return (
                            <motion.div
                                key={url.id}
                                className={`url-item ${!isValid ? "invalid" : ""}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="url-item-header">
                                    <span className="url-number">#{index + 1}</span>
                                    {urls.length > 1 && (
                                        <button
                                            className="btn-remove-url"
                                            onClick={() => removeUrl(url.id)}
                                            title="Remove URL"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>

                                <div className="url-item-fields">
                                    <div className="url-field full-width">
                                        <label>
                                            <FiGlobe />
                                            URL <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com/page"
                                            value={url.loc}
                                            onChange={(e) => updateUrl(url.id, "loc", e.target.value)}
                                            className={!isValid ? "invalid-input" : ""}
                                        />
                                        {!isValid && url.loc.trim() !== "" && (
                                            <span className="field-error">Invalid URL format</span>
                                        )}
                                    </div>

                                    <div className="url-field">
                                        <label>
                                            <FiCalendar />
                                            Last Modified
                                        </label>
                                        <input
                                            type="date"
                                            value={url.lastmod}
                                            onChange={(e) => updateUrl(url.id, "lastmod", e.target.value)}
                                        />
                                    </div>

                                    <div className="url-field">
                                        <label>
                                            <FiRefreshCw />
                                            Change Frequency
                                        </label>
                                        <select
                                            value={url.changefreq}
                                            onChange={(e) =>
                                                updateUrl(url.id, "changefreq", e.target.value)
                                            }
                                        >
                                            <option value="always">Always</option>
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="never">Never</option>
                                        </select>
                                    </div>

                                    <div className="url-field">
                                        <label>
                                            <FiTrendingUp />
                                            Priority
                                        </label>
                                        <select
                                            value={url.priority}
                                            onChange={(e) => updateUrl(url.id, "priority", e.target.value)}
                                        >
                                            <option value="1.0">1.0 (Highest)</option>
                                            <option value="0.9">0.9</option>
                                            <option value="0.8">0.8</option>
                                            <option value="0.7">0.7</option>
                                            <option value="0.6">0.6</option>
                                            <option value="0.5">0.5 (Default)</option>
                                            <option value="0.4">0.4</option>
                                            <option value="0.3">0.3</option>
                                            <option value="0.2">0.2</option>
                                            <option value="0.1">0.1</option>
                                            <option value="0.0">0.0 (Lowest)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="sitemap-actions">
                <motion.button
                    className="btn-generate-sitemap"
                    onClick={generateXml}
                    disabled={stats.validUrls === 0}
                    whileHover={{ scale: stats.validUrls === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: stats.validUrls === 0 ? 1 : 0.98 }}
                >
                    <FiFileText />
                    Generate Sitemap
                </motion.button>

                {generatedXml && (
                    <>
                        <motion.button
                            className="btn-download-sitemap"
                            onClick={downloadXml}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <FiDownload />
                            Download sitemap.xml
                        </motion.button>

                        <motion.button
                            className="btn-copy-sitemap"
                            onClick={copyToClipboard}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {copySuccess ? (
                                <>
                                    <FiCheckCircle />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <FiCopy />
                                    Copy XML
                                </>
                            )}
                        </motion.button>
                    </>
                )}
            </div>

            {/* XML Preview */}
            <AnimatePresence>
                {showXml && generatedXml && (
                    <motion.div
                        className="xml-preview-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="xml-preview-header">
                            <h3>
                                <FiFileText />
                                Generated Sitemap XML
                            </h3>
                            <button
                                className="btn-close-preview"
                                onClick={() => setShowXml(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <pre className="xml-preview-code">
                            <code>{generatedXml}</code>
                        </pre>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SEO Tips */}
            <div className="sitemap-tips">
                <h3 className="tips-title">
                    <FiCheckCircle />
                    Sitemap Best Practices
                </h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <div className="tip-icon">
                            <FiGlobe />
                        </div>
                        <div className="tip-content">
                            <h4>Upload to Root Directory</h4>
                            <p>
                                Place sitemap.xml in your website's root directory for easy discovery.
                            </p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <FiFileText />
                        </div>
                        <div className="tip-content">
                            <h4>Submit to Search Engines</h4>
                            <p>
                                Submit your sitemap to Google Search Console and Bing Webmaster Tools for faster indexing.
                            </p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <FiRefreshCw />
                        </div>
                        <div className="tip-content">
                            <h4>Keep It Updated</h4>
                            <p>
                                Update your sitemap whenever you add new pages or make significant changes to existing ones.
                            </p>
                        </div>
                    </div>
                    <div className="tip-card">
                        <div className="tip-icon">
                            <FiTrendingUp />
                        </div>
                        <div className="tip-content">
                            <h4>Set Priorities Wisely</h4>
                            <p>
                                Use 1.0 for your homepage, 0.8-0.9 for important pages, and 0.5-0.7 for regular content.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SitemapGeneratorTool;