"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSearch,
    FiCheckCircle,
    FiAlertCircle,
    FiXCircle,
    FiRefreshCw,
    FiGlobe,
    FiFacebook,
    FiTwitter,
    FiImage,
    FiExternalLink,
    FiCopy,
    FiCode,
} from "react-icons/fi";

interface OGTag {
    property: string;
    content: string;
    status: "found" | "missing" | "warning";
}

interface ValidationResult {
    title: OGTag | null;
    description: OGTag | null;
    image: OGTag | null;
    url: OGTag | null;
    type: OGTag | null;
    siteName: OGTag | null;
    locale: OGTag | null;
    twitterCard: OGTag | null;
    twitterTitle: OGTag | null;
    twitterDescription: OGTag | null;
    twitterImage: OGTag | null;
    twitterSite: OGTag | null;
}

interface CheckResult {
    url: string;
    status: "success" | "error" | "loading";
    validationResult: ValidationResult | null;
    metaTitle: string;
    metaDescription: string;
    faviconUrl: string;
    errorMessage?: string;
    issues: string[];
    warnings: string[];
    suggestions: string[];
    score: number;
}

const OpenGraphCheckerTool = () => {
    const [url, setUrl] = useState<string>("");
    const [checking, setChecking] = useState(false);
    const [result, setResult] = useState<CheckResult | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "details" | "preview">("overview");
    const [copied, setCopied] = useState(false);

    // Simulate OG tag checking (in production, this would call your backend API)
    const checkOpenGraphTags = async () => {
        if (!url.trim()) return;

        // Validate URL format
        try {
            new URL(url);
        } catch {
            setResult({
                url: url,
                status: "error",
                validationResult: null,
                metaTitle: "",
                metaDescription: "",
                faviconUrl: "",
                errorMessage: "Invalid URL format. Please enter a valid URL (e.g., https://example.com)",
                issues: [],
                warnings: [],
                suggestions: [],
                score: 0,
            });
            return;
        }

        setChecking(true);
        setResult({
            url: url,
            status: "loading",
            validationResult: null,
            metaTitle: "",
            metaDescription: "",
            faviconUrl: "",
            issues: [],
            warnings: [],
            suggestions: [],
            score: 0,
        });

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulated result (in production, replace with actual API call)
        const mockResult: CheckResult = {
            url: url,
            status: "success",
            metaTitle: "Example Domain - Professional Web Solutions",
            metaDescription:
                "Leading provider of web solutions and digital services. Trusted by thousands of businesses worldwide.",
            faviconUrl: "https://example.com/favicon.ico",
            validationResult: {
                title: {
                    property: "og:title",
                    content: "Example Domain - Professional Web Solutions",
                    status: "found",
                },
                description: {
                    property: "og:description",
                    content:
                        "Leading provider of web solutions and digital services. Trusted by thousands of businesses worldwide.",
                    status: "found",
                },
                image: {
                    property: "og:image",
                    content: "https://example.com/images/og-image.jpg",
                    status: "found",
                },
                url: {
                    property: "og:url",
                    content: url,
                    status: "found",
                },
                type: {
                    property: "og:type",
                    content: "website",
                    status: "found",
                },
                siteName: {
                    property: "og:site_name",
                    content: "Example Domain",
                    status: "found",
                },
                locale: {
                    property: "og:locale",
                    content: "en_US",
                    status: "found",
                },
                twitterCard: {
                    property: "twitter:card",
                    content: "summary_large_image",
                    status: "found",
                },
                twitterTitle: {
                    property: "twitter:title",
                    content: "Example Domain - Professional Web Solutions",
                    status: "found",
                },
                twitterDescription: {
                    property: "twitter:description",
                    content: "Leading provider of web solutions and digital services.",
                    status: "found",
                },
                twitterImage: {
                    property: "twitter:image",
                    content: "https://example.com/images/twitter-card.jpg",
                    status: "found",
                },
                twitterSite: {
                    property: "twitter:site",
                    content: "@exampledomain",
                    status: "found",
                },
            },
            issues: [],
            warnings: [
                "OG image dimensions should be verified (recommended: 1200x630px)",
                "Consider adding og:image:alt for accessibility",
            ],
            suggestions: [
                "Add og:image:width and og:image:height for faster rendering",
                "Consider adding article:published_time if this is a blog post",
                "Add twitter:creator tag to credit the content author",
            ],
            score: 85,
        };

        setResult(mockResult);
        setChecking(false);
    };

    // Handle URL input change
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        checkOpenGraphTags();
    };

    // Load sample URL
    const loadSample = () => {
        setUrl("https://www.example.com");
    };

    // Clear results
    const handleClear = () => {
        setUrl("");
        setResult(null);
        setActiveTab("overview");
    };

    // Copy tag to clipboard
    const copyTag = (tag: OGTag) => {
        const htmlTag = `<meta property="${tag.property}" content="${tag.content}">`;
        navigator.clipboard.writeText(htmlTag);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Get score color
    const getScoreColor = (score: number): string => {
        if (score >= 80) return "#10b981";
        if (score >= 60) return "#f59e0b";
        return "#ef4444";
    };

    // Get status icon
    const getStatusIcon = (status: "found" | "missing" | "warning") => {
        switch (status) {
            case "found":
                return <FiCheckCircle className="status-icon success" />;
            case "missing":
                return <FiXCircle className="status-icon error" />;
            case "warning":
                return <FiAlertCircle className="status-icon warning" />;
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
                    Check and validate Open Graph tags on any website. Ensure your content looks perfect
                    when shared on social media platforms.
                </p>
            </div>

            {/* URL Input Section */}
            <div className="og-checker-input-section">
                <form onSubmit={handleSubmit} className="url-input-form">
                    <div className="url-input-wrapper">
                        <FiGlobe className="input-icon" />
                        <input
                            type="text"
                            placeholder="Enter website URL (e.g., https://www.example.com)"
                            value={url}
                            onChange={handleUrlChange}
                            className="url-input-field"
                            disabled={checking}
                        />
                        {url && !checking && (
                            <button
                                type="button"
                                className="clear-url-btn"
                                onClick={() => setUrl("")}
                                aria-label="Clear URL"
                            >
                                <FiXCircle />
                            </button>
                        )}
                    </div>

                    <div className="input-actions">
                        <button
                            type="submit"
                            className="btn-check-og"
                            disabled={!url.trim() || checking}
                        >
                            {checking ? (
                                <>
                                    <span className="spinner" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <FiSearch /> Check OG Tags
                                </>
                            )}
                        </button>

                        <button type="button" className="btn-sample" onClick={loadSample}>
                            Load Sample
                        </button>

                        {result && !checking && (
                            <button type="button" className="btn-clear-og" onClick={handleClear}>
                                <FiRefreshCw /> Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Results Section */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        className="og-results-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {result.status === "error" ? (
                            <div className="error-state">
                                <FiXCircle className="error-icon" />
                                <h3>Error Checking URL</h3>
                                <p>{result.errorMessage}</p>
                            </div>
                        ) : result.status === "loading" ? (
                            <div className="loading-state">
                                <span className="spinner large" />
                                <p>Fetching and analyzing Open Graph tags...</p>
                            </div>
                        ) : (
                            <>
                                {/* Score Card */}
                                <div className="og-score-card">
                                    <div className="score-circle">
                                        <svg viewBox="0 0 120 120" className="score-svg">
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="54"
                                                fill="none"
                                                stroke="#e5e7eb"
                                                strokeWidth="12"
                                            />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="54"
                                                fill="none"
                                                stroke={getScoreColor(result.score)}
                                                strokeWidth="12"
                                                strokeDasharray={`${(result.score / 100) * 339.292} 339.292`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 60 60)"
                                            />
                                        </svg>
                                        <div className="score-text">
                                            <span className="score-number">{result.score}</span>
                                            <span className="score-label">Score</span>
                                        </div>
                                    </div>

                                    <div className="score-details">
                                        <h3>Open Graph Validation</h3>
                                        <p className="checked-url">
                                            <FiExternalLink />
                                            <a href={result.url} target="_blank" rel="noopener noreferrer">
                                                {result.url}
                                            </a>
                                        </p>

                                        <div className="score-summary">
                                            {result.issues.length === 0 && (
                                                <div className="summary-item success">
                                                    <FiCheckCircle />
                                                    <span>All essential OG tags found</span>
                                                </div>
                                            )}
                                            {result.issues.length > 0 && (
                                                <div className="summary-item error">
                                                    <FiXCircle />
                                                    <span>{result.issues.length} critical issues found</span>
                                                </div>
                                            )}
                                            {result.warnings.length > 0 && (
                                                <div className="summary-item warning">
                                                    <FiAlertCircle />
                                                    <span>{result.warnings.length} warnings</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="og-tabs">
                                    <button
                                        className={`og-tab ${activeTab === "overview" ? "active" : ""}`}
                                        onClick={() => setActiveTab("overview")}
                                    >
                                        <FiCheckCircle /> Overview
                                    </button>
                                    <button
                                        className={`og-tab ${activeTab === "details" ? "active" : ""}`}
                                        onClick={() => setActiveTab("details")}
                                    >
                                        <FiCode /> Tag Details
                                    </button>
                                    <button
                                        className={`og-tab ${activeTab === "preview" ? "active" : ""}`}
                                        onClick={() => setActiveTab("preview")}
                                    >
                                        <FiFacebook /> Preview
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="og-tab-content">
                                    {/* Overview Tab */}
                                    {activeTab === "overview" && (
                                        <motion.div
                                            className="overview-content"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Issues */}
                                            {result.issues.length > 0 && (
                                                <div className="issues-section">
                                                    <h4>
                                                        <FiXCircle /> Critical Issues
                                                    </h4>
                                                    <ul className="issue-list error">
                                                        {result.issues.map((issue, index) => (
                                                            <li key={index}>{issue}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Warnings */}
                                            {result.warnings.length > 0 && (
                                                <div className="warnings-section">
                                                    <h4>
                                                        <FiAlertCircle /> Warnings
                                                    </h4>
                                                    <ul className="issue-list warning">
                                                        {result.warnings.map((warning, index) => (
                                                            <li key={index}>{warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Suggestions */}
                                            {result.suggestions.length > 0 && (
                                                <div className="suggestions-section">
                                                    <h4>
                                                        <FiCheckCircle /> Suggestions for Improvement
                                                    </h4>
                                                    <ul className="issue-list suggestion">
                                                        {result.suggestions.map((suggestion, index) => (
                                                            <li key={index}>{suggestion}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {result.issues.length === 0 &&
                                                result.warnings.length === 0 &&
                                                result.suggestions.length === 0 && (
                                                    <div className="perfect-score">
                                                        <FiCheckCircle className="perfect-icon" />
                                                        <h4>Perfect Open Graph Implementation!</h4>
                                                        <p>
                                                            All essential Open Graph tags are properly configured. Your content
                                                            will look great when shared on social media.
                                                        </p>
                                                    </div>
                                                )}
                                        </motion.div>
                                    )}

                                    {/* Details Tab */}
                                    {activeTab === "details" && result.validationResult && (
                                        <motion.div
                                            className="details-content"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Basic Meta Tags */}
                                            <div className="tag-group">
                                                <h4>Basic Meta Tags</h4>
                                                <div className="tag-list">
                                                    <div className="tag-item">
                                                        <FiCheckCircle className="tag-status success" />
                                                        <div className="tag-info">
                                                            <strong>Title Tag</strong>
                                                            <span>{result.metaTitle}</span>
                                                        </div>
                                                    </div>
                                                    <div className="tag-item">
                                                        <FiCheckCircle className="tag-status success" />
                                                        <div className="tag-info">
                                                            <strong>Meta Description</strong>
                                                            <span>{result.metaDescription}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Open Graph Tags */}
                                            <div className="tag-group">
                                                <h4>
                                                    <FiFacebook /> Open Graph Tags
                                                </h4>
                                                <div className="tag-list">
                                                    {result.validationResult.title && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.title.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.title.property}</strong>
                                                                <span>{result.validationResult.title.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.title!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.description && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.description.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.description.property}</strong>
                                                                <span>{result.validationResult.description.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.description!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.image && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.image.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.image.property}</strong>
                                                                <span className="image-url">
                                                                    <FiImage />
                                                                    {result.validationResult.image.content}
                                                                </span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.image!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.url && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.url.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.url.property}</strong>
                                                                <span>{result.validationResult.url.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.url!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.type && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.type.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.type.property}</strong>
                                                                <span>{result.validationResult.type.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.type!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.siteName && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.siteName.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.siteName.property}</strong>
                                                                <span>{result.validationResult.siteName.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.siteName!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.locale && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.locale.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.locale.property}</strong>
                                                                <span>{result.validationResult.locale.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.locale!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Twitter Card Tags */}
                                            <div className="tag-group">
                                                <h4>
                                                    <FiTwitter /> Twitter Card Tags
                                                </h4>
                                                <div className="tag-list">
                                                    {result.validationResult.twitterCard && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.twitterCard.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.twitterCard.property}</strong>
                                                                <span>{result.validationResult.twitterCard.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.twitterCard!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.twitterTitle && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.twitterTitle.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.twitterTitle.property}</strong>
                                                                <span>{result.validationResult.twitterTitle.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.twitterTitle!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.twitterDescription && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.twitterDescription.status)}
                                                            <div className="tag-info">
                                                                <strong>
                                                                    {result.validationResult.twitterDescription.property}
                                                                </strong>
                                                                <span>{result.validationResult.twitterDescription.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() =>
                                                                    copyTag(result.validationResult!.twitterDescription!)
                                                                }
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.twitterImage && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.twitterImage.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.twitterImage.property}</strong>
                                                                <span className="image-url">
                                                                    <FiImage />
                                                                    {result.validationResult.twitterImage.content}
                                                                </span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.twitterImage!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {result.validationResult.twitterSite && (
                                                        <div className="tag-item">
                                                            {getStatusIcon(result.validationResult.twitterSite.status)}
                                                            <div className="tag-info">
                                                                <strong>{result.validationResult.twitterSite.property}</strong>
                                                                <span>{result.validationResult.twitterSite.content}</span>
                                                            </div>
                                                            <button
                                                                className="btn-copy-tag"
                                                                onClick={() => copyTag(result.validationResult!.twitterSite!)}
                                                                title="Copy tag"
                                                            >
                                                                <FiCopy />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Preview Tab */}
                                    {activeTab === "preview" && result.validationResult && (
                                        <motion.div
                                            className="preview-content"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Facebook Preview */}
                                            <div className="preview-card">
                                                <h4>
                                                    <FiFacebook /> Facebook Preview
                                                </h4>
                                                <div className="facebook-preview-og">
                                                    {result.validationResult.image && (
                                                        <div className="preview-image-og">
                                                            <FiImage />
                                                            <span>{result.validationResult.image.content}</span>
                                                        </div>
                                                    )}
                                                    <div className="preview-content-og">
                                                        <div className="preview-url-og">
                                                            {result.validationResult.url?.content || result.url}
                                                        </div>
                                                        <div className="preview-title-og">
                                                            {result.validationResult.title?.content || result.metaTitle}
                                                        </div>
                                                        <div className="preview-description-og">
                                                            {result.validationResult.description?.content ||
                                                                result.metaDescription}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Twitter Preview */}
                                            <div className="preview-card">
                                                <h4>
                                                    <FiTwitter /> Twitter Preview
                                                </h4>
                                                <div className="twitter-preview-og">
                                                    {(result.validationResult.twitterImage ||
                                                        result.validationResult.image) && (
                                                            <div className="preview-image-og large">
                                                                <FiImage />
                                                                <span>
                                                                    {result.validationResult.twitterImage?.content ||
                                                                        result.validationResult.image?.content}
                                                                </span>
                                                            </div>
                                                        )}
                                                    <div className="preview-content-og">
                                                        <div className="preview-title-og">
                                                            {result.validationResult.twitterTitle?.content ||
                                                                result.validationResult.title?.content ||
                                                                result.metaTitle}
                                                        </div>
                                                        <div className="preview-description-og">
                                                            {result.validationResult.twitterDescription?.content ||
                                                                result.validationResult.description?.content ||
                                                                result.metaDescription}
                                                        </div>
                                                        <div className="preview-url-og">
                                                            {result.validationResult.url?.content || result.url}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* LinkedIn Preview */}
                                            <div className="preview-card">
                                                <h4>
                                                    <FiGlobe /> LinkedIn Preview
                                                </h4>
                                                <div className="linkedin-preview-og">
                                                    {result.validationResult.image && (
                                                        <div className="preview-image-og">
                                                            <FiImage />
                                                            <span>{result.validationResult.image.content}</span>
                                                        </div>
                                                    )}
                                                    <div className="preview-content-og">
                                                        <div className="preview-title-og">
                                                            {result.validationResult.title?.content || result.metaTitle}
                                                        </div>
                                                        <div className="preview-url-og">
                                                            {result.validationResult.url?.content || result.url}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        className="success-toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <FiCheckCircle /> Tag copied to clipboard!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default OpenGraphCheckerTool;