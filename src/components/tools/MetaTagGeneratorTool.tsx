"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiCode,
    FiCopy,
    FiCheckCircle,
    FiAlertCircle,
    FiRefreshCw,
    FiEye,
    FiGlobe,
    FiTwitter,
    FiFacebook,
    FiImage,
} from "react-icons/fi";

interface MetaTags {
    // Basic SEO
    title: string;
    description: string;
    keywords: string;
    author: string;
    canonical: string;
    robots: string;

    // Open Graph (Facebook)
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    ogSiteName: string;

    // Twitter Card
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    twitterSite: string;
    twitterCreator: string;

    // Additional
    viewport: string;
    charset: string;
    language: string;
    themeColor: string;
}

const MetaTagGeneratorTool = () => {
    const [activeTab, setActiveTab] = useState<"basic" | "og" | "twitter" | "additional">("basic");
    const [copied, setCopied] = useState(false);
    const [previewMode, setPreviewMode] = useState<"code" | "visual">("code");

    const [metaTags, setMetaTags] = useState<MetaTags>({
        // Basic SEO
        title: "",
        description: "",
        keywords: "",
        author: "",
        canonical: "",
        robots: "index, follow",

        // Open Graph
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
        ogUrl: "",
        ogType: "website",
        ogSiteName: "",

        // Twitter Card
        twitterCard: "summary_large_image",
        twitterTitle: "",
        twitterDescription: "",
        twitterImage: "",
        twitterSite: "",
        twitterCreator: "",

        // Additional
        viewport: "width=device-width, initial-scale=1.0",
        charset: "UTF-8",
        language: "en",
        themeColor: "#ffffff",
    });

    // Update meta tag value
    const updateMetaTag = <K extends keyof MetaTags>(key: K, value: MetaTags[K]) => {
        setMetaTags((prev) => ({ ...prev, [key]: value }));
    };

    // Auto-sync OG and Twitter tags with basic tags
    const syncWithBasic = (field: "title" | "description") => {
        if (field === "title") {
            if (!metaTags.ogTitle) updateMetaTag("ogTitle", metaTags.title);
            if (!metaTags.twitterTitle) updateMetaTag("twitterTitle", metaTags.title);
        } else if (field === "description") {
            if (!metaTags.ogDescription) updateMetaTag("ogDescription", metaTags.description);
            if (!metaTags.twitterDescription)
                updateMetaTag("twitterDescription", metaTags.description);
        }
    };

    // Generate HTML code
    const generateHTML = (): string => {
        let html = "";

        // Charset and Viewport (always included)
        html += `<!-- Essential Meta Tags -->\n`;
        html += `<meta charset="${metaTags.charset}">\n`;
        html += `<meta name="viewport" content="${metaTags.viewport}">\n`;
        if (metaTags.language) {
            html += `<meta http-equiv="content-language" content="${metaTags.language}">\n`;
        }

        // Basic SEO
        if (metaTags.title) {
            html += `\n<!-- Basic SEO -->\n`;
            html += `<title>${metaTags.title}</title>\n`;
        }
        if (metaTags.description) {
            html += `<meta name="description" content="${metaTags.description}">\n`;
        }
        if (metaTags.keywords) {
            html += `<meta name="keywords" content="${metaTags.keywords}">\n`;
        }
        if (metaTags.author) {
            html += `<meta name="author" content="${metaTags.author}">\n`;
        }
        if (metaTags.robots) {
            html += `<meta name="robots" content="${metaTags.robots}">\n`;
        }
        if (metaTags.canonical) {
            html += `<link rel="canonical" href="${metaTags.canonical}">\n`;
        }

        // Open Graph
        if (
            metaTags.ogTitle ||
            metaTags.ogDescription ||
            metaTags.ogImage ||
            metaTags.ogUrl
        ) {
            html += `\n<!-- Open Graph / Facebook -->\n`;
            if (metaTags.ogType) {
                html += `<meta property="og:type" content="${metaTags.ogType}">\n`;
            }
            if (metaTags.ogTitle) {
                html += `<meta property="og:title" content="${metaTags.ogTitle}">\n`;
            }
            if (metaTags.ogDescription) {
                html += `<meta property="og:description" content="${metaTags.ogDescription}">\n`;
            }
            if (metaTags.ogImage) {
                html += `<meta property="og:image" content="${metaTags.ogImage}">\n`;
            }
            if (metaTags.ogUrl) {
                html += `<meta property="og:url" content="${metaTags.ogUrl}">\n`;
            }
            if (metaTags.ogSiteName) {
                html += `<meta property="og:site_name" content="${metaTags.ogSiteName}">\n`;
            }
        }

        // Twitter Card
        if (
            metaTags.twitterTitle ||
            metaTags.twitterDescription ||
            metaTags.twitterImage
        ) {
            html += `\n<!-- Twitter Card -->\n`;
            if (metaTags.twitterCard) {
                html += `<meta name="twitter:card" content="${metaTags.twitterCard}">\n`;
            }
            if (metaTags.twitterTitle) {
                html += `<meta name="twitter:title" content="${metaTags.twitterTitle}">\n`;
            }
            if (metaTags.twitterDescription) {
                html += `<meta name="twitter:description" content="${metaTags.twitterDescription}">\n`;
            }
            if (metaTags.twitterImage) {
                html += `<meta name="twitter:image" content="${metaTags.twitterImage}">\n`;
            }
            if (metaTags.twitterSite) {
                html += `<meta name="twitter:site" content="${metaTags.twitterSite}">\n`;
            }
            if (metaTags.twitterCreator) {
                html += `<meta name="twitter:creator" content="${metaTags.twitterCreator}">\n`;
            }
        }

        // Additional
        if (metaTags.themeColor) {
            html += `\n<!-- Additional -->\n`;
            html += `<meta name="theme-color" content="${metaTags.themeColor}">\n`;
        }

        return html.trim();
    };

    // Copy to clipboard
    const copyToClipboard = () => {
        const htmlCode = generateHTML();
        navigator.clipboard.writeText(htmlCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Load sample data
    const loadSample = () => {
        setMetaTags({
            title: "Amazing Product - Best Solutions for Your Business",
            description:
                "Discover our amazing product that helps businesses grow faster. Get started today with our comprehensive solution trusted by 10,000+ companies.",
            keywords: "business software, productivity tools, saas, cloud solutions",
            author: "Company Name",
            canonical: "https://www.example.com/product",
            robots: "index, follow",

            ogTitle: "Amazing Product - Best Solutions for Your Business",
            ogDescription:
                "Discover our amazing product that helps businesses grow faster. Get started today with our comprehensive solution trusted by 10,000+ companies.",
            ogImage: "https://www.example.com/images/og-image.jpg",
            ogUrl: "https://www.example.com/product",
            ogType: "website",
            ogSiteName: "Company Name",

            twitterCard: "summary_large_image",
            twitterTitle: "Amazing Product - Best Solutions for Your Business",
            twitterDescription:
                "Discover our amazing product that helps businesses grow faster. Trusted by 10,000+ companies.",
            twitterImage: "https://www.example.com/images/twitter-card.jpg",
            twitterSite: "@companyname",
            twitterCreator: "@companyname",

            viewport: "width=device-width, initial-scale=1.0",
            charset: "UTF-8",
            language: "en",
            themeColor: "#4F46E5",
        });
    };

    // Clear all
    const handleClear = () => {
        setMetaTags({
            title: "",
            description: "",
            keywords: "",
            author: "",
            canonical: "",
            robots: "index, follow",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            ogUrl: "",
            ogType: "website",
            ogSiteName: "",
            twitterCard: "summary_large_image",
            twitterTitle: "",
            twitterDescription: "",
            twitterImage: "",
            twitterSite: "",
            twitterCreator: "",
            viewport: "width=device-width, initial-scale=1.0",
            charset: "UTF-8",
            language: "en",
            themeColor: "#ffffff",
        });
    };

    // Character count helper
    const getCharCount = (text: string, max: number) => {
        return { count: text.length, isOver: text.length > max };
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
                    Generate SEO-optimized meta tags for your website. Perfect for improving search
                    engine visibility and social media sharing.
                </p>
            </div>

            {/* Top Controls */}
            <div className="meta-top-controls">
                <div className="control-buttons">
                    <button className="btn-sample" onClick={loadSample}>
                        Load Sample
                    </button>
                    {(metaTags.title || metaTags.description) && (
                        <button className="btn-clear-meta" onClick={handleClear}>
                            <FiRefreshCw /> Clear All
                        </button>
                    )}
                </div>

                <div className="preview-toggle">
                    <button
                        className={`preview-btn ${previewMode === "code" ? "active" : ""}`}
                        onClick={() => setPreviewMode("code")}
                    >
                        <FiCode /> Code
                    </button>
                    <button
                        className={`preview-btn ${previewMode === "visual" ? "active" : ""}`}
                        onClick={() => setPreviewMode("visual")}
                    >
                        <FiEye /> Preview
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="meta-tabs">
                <button
                    className={`meta-tab ${activeTab === "basic" ? "active" : ""}`}
                    onClick={() => setActiveTab("basic")}
                >
                    <FiGlobe /> Basic SEO
                </button>
                <button
                    className={`meta-tab ${activeTab === "og" ? "active" : ""}`}
                    onClick={() => setActiveTab("og")}
                >
                    <FiFacebook /> Open Graph
                </button>
                <button
                    className={`meta-tab ${activeTab === "twitter" ? "active" : ""}`}
                    onClick={() => setActiveTab("twitter")}
                >
                    <FiTwitter /> Twitter Card
                </button>
                <button
                    className={`meta-tab ${activeTab === "additional" ? "active" : ""}`}
                    onClick={() => setActiveTab("additional")}
                >
                    Additional
                </button>
            </div>

            {/* Tab Content */}
            <div className="meta-content">
                {/* Basic SEO Tab */}
                {activeTab === "basic" && (
                    <motion.div
                        className="meta-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="form-group">
                            <label htmlFor="title">
                                Page Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                placeholder="Enter your page title (50-60 characters recommended)"
                                value={metaTags.title}
                                onChange={(e) => updateMetaTag("title", e.target.value)}
                                onBlur={() => syncWithBasic("title")}
                                maxLength={100}
                            />
                            <div className="char-count">
                                <span
                                    className={
                                        getCharCount(metaTags.title, 60).isOver ? "over-limit" : ""
                                    }
                                >
                                    {metaTags.title.length} / 60 characters
                                </span>
                                {metaTags.title.length > 60 && (
                                    <span className="warning">⚠️ Title may be truncated in search results</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Meta Description <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                placeholder="Write a compelling description of your page (150-160 characters recommended)"
                                value={metaTags.description}
                                onChange={(e) => updateMetaTag("description", e.target.value)}
                                onBlur={() => syncWithBasic("description")}
                                maxLength={300}
                            />
                            <div className="char-count">
                                <span
                                    className={
                                        getCharCount(metaTags.description, 160).isOver ? "over-limit" : ""
                                    }
                                >
                                    {metaTags.description.length} / 160 characters
                                </span>
                                {metaTags.description.length > 160 && (
                                    <span className="warning">
                                        ⚠️ Description may be truncated in search results
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="keywords">Keywords</label>
                            <input
                                type="text"
                                id="keywords"
                                placeholder="keyword1, keyword2, keyword3 (comma separated)"
                                value={metaTags.keywords}
                                onChange={(e) => updateMetaTag("keywords", e.target.value)}
                            />
                            <small className="help-text">
                                Separate keywords with commas. Note: Most search engines ignore this tag.
                            </small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="author">Author</label>
                                <input
                                    type="text"
                                    id="author"
                                    placeholder="Your name or company name"
                                    value={metaTags.author}
                                    onChange={(e) => updateMetaTag("author", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="robots">Robots</label>
                                <select
                                    id="robots"
                                    value={metaTags.robots}
                                    onChange={(e) => updateMetaTag("robots", e.target.value)}
                                >
                                    <option value="index, follow">Index, Follow (Default)</option>
                                    <option value="noindex, follow">No Index, Follow</option>
                                    <option value="index, nofollow">Index, No Follow</option>
                                    <option value="noindex, nofollow">No Index, No Follow</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="canonical">Canonical URL</label>
                            <input
                                type="url"
                                id="canonical"
                                placeholder="https://www.example.com/page"
                                value={metaTags.canonical}
                                onChange={(e) => updateMetaTag("canonical", e.target.value)}
                            />
                            <small className="help-text">
                                Specify the preferred version of a page to avoid duplicate content issues.
                            </small>
                        </div>
                    </motion.div>
                )}

                {/* Open Graph Tab */}
                {activeTab === "og" && (
                    <motion.div
                        className="meta-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="info-box">
                            <FiFacebook />
                            <div>
                                <strong>Open Graph Tags</strong>
                                <p>Control how your content appears when shared on Facebook, LinkedIn, and other social platforms.</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="ogTitle">OG Title</label>
                            <input
                                type="text"
                                id="ogTitle"
                                placeholder="Title for social media (uses page title if empty)"
                                value={metaTags.ogTitle}
                                onChange={(e) => updateMetaTag("ogTitle", e.target.value)}
                                maxLength={100}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="ogDescription">OG Description</label>
                            <textarea
                                id="ogDescription"
                                rows={3}
                                placeholder="Description for social media (uses meta description if empty)"
                                value={metaTags.ogDescription}
                                onChange={(e) => updateMetaTag("ogDescription", e.target.value)}
                                maxLength={300}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="ogImage">
                                OG Image URL <span className="required">*</span>
                            </label>
                            <input
                                type="url"
                                id="ogImage"
                                placeholder="https://www.example.com/image.jpg (1200x630px recommended)"
                                value={metaTags.ogImage}
                                onChange={(e) => updateMetaTag("ogImage", e.target.value)}
                            />
                            <small className="help-text">
                                Recommended size: 1200x630px. Supported formats: JPG, PNG, GIF.
                            </small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="ogUrl">OG URL</label>
                                <input
                                    type="url"
                                    id="ogUrl"
                                    placeholder="https://www.example.com/page"
                                    value={metaTags.ogUrl}
                                    onChange={(e) => updateMetaTag("ogUrl", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ogType">OG Type</label>
                                <select
                                    id="ogType"
                                    value={metaTags.ogType}
                                    onChange={(e) => updateMetaTag("ogType", e.target.value)}
                                >
                                    <option value="website">Website</option>
                                    <option value="article">Article</option>
                                    <option value="product">Product</option>
                                    <option value="video">Video</option>
                                    <option value="music">Music</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="ogSiteName">Site Name</label>
                            <input
                                type="text"
                                id="ogSiteName"
                                placeholder="Your website or brand name"
                                value={metaTags.ogSiteName}
                                onChange={(e) => updateMetaTag("ogSiteName", e.target.value)}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Twitter Card Tab */}
                {activeTab === "twitter" && (
                    <motion.div
                        className="meta-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="info-box">
                            <FiTwitter />
                            <div>
                                <strong>Twitter Card Tags</strong>
                                <p>Optimize how your content appears when shared on Twitter/X.</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="twitterCard">Card Type</label>
                            <select
                                id="twitterCard"
                                value={metaTags.twitterCard}
                                onChange={(e) => updateMetaTag("twitterCard", e.target.value)}
                            >
                                <option value="summary">Summary Card</option>
                                <option value="summary_large_image">Summary with Large Image</option>
                                <option value="app">App Card</option>
                                <option value="player">Player Card</option>
                            </select>
                            <small className="help-text">
                                Summary Large Image is recommended for most content.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="twitterTitle">Twitter Title</label>
                            <input
                                type="text"
                                id="twitterTitle"
                                placeholder="Title for Twitter (uses page title if empty)"
                                value={metaTags.twitterTitle}
                                onChange={(e) => updateMetaTag("twitterTitle", e.target.value)}
                                maxLength={70}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="twitterDescription">Twitter Description</label>
                            <textarea
                                id="twitterDescription"
                                rows={3}
                                placeholder="Description for Twitter (uses meta description if empty)"
                                value={metaTags.twitterDescription}
                                onChange={(e) => updateMetaTag("twitterDescription", e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="twitterImage">
                                Twitter Image URL <span className="required">*</span>
                            </label>
                            <input
                                type="url"
                                id="twitterImage"
                                placeholder="https://www.example.com/image.jpg (1200x628px recommended)"
                                value={metaTags.twitterImage}
                                onChange={(e) => updateMetaTag("twitterImage", e.target.value)}
                            />
                            <small className="help-text">
                                Recommended size: 1200x628px for large card, 120x120px for summary card.
                            </small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="twitterSite">Twitter Site Handle</label>
                                <input
                                    type="text"
                                    id="twitterSite"
                                    placeholder="@yourbrand"
                                    value={metaTags.twitterSite}
                                    onChange={(e) => updateMetaTag("twitterSite", e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="twitterCreator">Twitter Creator Handle</label>
                                <input
                                    type="text"
                                    id="twitterCreator"
                                    placeholder="@author"
                                    value={metaTags.twitterCreator}
                                    onChange={(e) => updateMetaTag("twitterCreator", e.target.value)}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Additional Tab */}
                {activeTab === "additional" && (
                    <motion.div
                        className="meta-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="charset">Character Set</label>
                                <select
                                    id="charset"
                                    value={metaTags.charset}
                                    onChange={(e) => updateMetaTag("charset", e.target.value)}
                                >
                                    <option value="UTF-8">UTF-8 (Recommended)</option>
                                    <option value="ISO-8859-1">ISO-8859-1</option>
                                    <option value="UTF-16">UTF-16</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="language">Language</label>
                                <input
                                    type="text"
                                    id="language"
                                    placeholder="en"
                                    value={metaTags.language}
                                    onChange={(e) => updateMetaTag("language", e.target.value)}
                                />
                                <small className="help-text">ISO language code (e.g., en, es, fr)</small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="viewport">Viewport</label>
                            <input
                                type="text"
                                id="viewport"
                                placeholder="width=device-width, initial-scale=1.0"
                                value={metaTags.viewport}
                                onChange={(e) => updateMetaTag("viewport", e.target.value)}
                            />
                            <small className="help-text">
                                Controls page dimensions and scaling on mobile devices.
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="themeColor">Theme Color</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    id="themeColor"
                                    value={metaTags.themeColor}
                                    onChange={(e) => updateMetaTag("themeColor", e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="#ffffff"
                                    value={metaTags.themeColor}
                                    onChange={(e) => updateMetaTag("themeColor", e.target.value)}
                                />
                            </div>
                            <small className="help-text">
                                Customizes browser toolbar color on mobile devices.
                            </small>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Preview Section */}
            <div className="meta-preview-section">
                <div className="preview-header">
                    <h3>
                        {previewMode === "code" ? (
                            <>
                                <FiCode /> Generated HTML
                            </>
                        ) : (
                            <>
                                <FiEye /> Social Media Preview
                            </>
                        )}
                    </h3>
                    <button className="btn-copy" onClick={copyToClipboard}>
                        {copied ? (
                            <>
                                <FiCheckCircle /> Copied!
                            </>
                        ) : (
                            <>
                                <FiCopy /> Copy Code
                            </>
                        )}
                    </button>
                </div>

                {previewMode === "code" ? (
                    <div className="code-preview">
                        <pre>
                            <code>{generateHTML() || "<!-- Fill in the fields to generate meta tags -->"}</code>
                        </pre>
                    </div>
                ) : (
                    <div className="visual-preview">
                        {/* Google Search Preview */}
                        <div className="preview-card">
                            <h4>
                                <FiGlobe /> Google Search Result
                            </h4>
                            <div className="google-preview">
                                <div className="google-url">
                                    {metaTags.canonical || "https://www.example.com"}
                                </div>
                                <div className="google-title">
                                    {metaTags.title || "Page Title - Your Brand Name"}
                                </div>
                                <div className="google-description">
                                    {metaTags.description ||
                                        "Meta description appears here. Write a compelling description to improve click-through rates from search results."}
                                </div>
                            </div>
                        </div>

                        {/* Facebook Preview */}
                        <div className="preview-card">
                            <h4>
                                <FiFacebook /> Facebook Share
                            </h4>
                            <div className="facebook-preview">
                                {(metaTags.ogImage || metaTags.twitterImage) && (
                                    <div className="preview-image">
                                        <FiImage />
                                        <span>
                                            {metaTags.ogImage || metaTags.twitterImage}
                                        </span>
                                    </div>
                                )}
                                <div className="preview-content">
                                    <div className="preview-url">
                                        {metaTags.ogUrl || metaTags.canonical || "example.com"}
                                    </div>
                                    <div className="preview-title">
                                        {metaTags.ogTitle || metaTags.title || "Page Title"}
                                    </div>
                                    <div className="preview-description">
                                        {metaTags.ogDescription ||
                                            metaTags.description ||
                                            "Description appears here"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Twitter Preview */}
                        <div className="preview-card">
                            <h4>
                                <FiTwitter /> Twitter Card
                            </h4>
                            <div className="twitter-preview">
                                {(metaTags.twitterImage || metaTags.ogImage) && (
                                    <div className="preview-image large">
                                        <FiImage />
                                        <span>
                                            {metaTags.twitterImage || metaTags.ogImage}
                                        </span>
                                    </div>
                                )}
                                <div className="preview-content">
                                    <div className="preview-title">
                                        {metaTags.twitterTitle || metaTags.title || "Page Title"}
                                    </div>
                                    <div className="preview-description">
                                        {metaTags.twitterDescription ||
                                            metaTags.description ||
                                            "Description appears here"}
                                    </div>
                                    <div className="preview-url">
                                        {metaTags.canonical || "example.com"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Message */}
            <AnimatePresence>
                {copied && (
                    <motion.div
                        className="success-toast"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <FiCheckCircle /> Meta tags copied to clipboard!
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MetaTagGeneratorTool;