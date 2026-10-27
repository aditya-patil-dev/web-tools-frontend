"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
  FiShare2,
  FiCopy,
  FiCheck,
  FiUpload,
  FiImage,
  FiGlobe,
  FiCode,
  FiTrash2,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiMoon,
  FiSun,
  FiDownload,
  FiRefreshCw,
  FiMaximize2,
  FiMessageSquare,
  FiBookmark,
  FiArrowUp,
  FiArrowDown,
  FiHeart,
  FiRepeat,
} from "react-icons/fi";

type Platform =
  | "twitter"
  | "facebook"
  | "linkedin"
  | "whatsapp"
  | "telegram"
  | "reddit"
  | "pinterest"
  | "threads"
  | "discord"
  | "slack";

type TwitterTheme = "dark" | "light";
type TwitterCardType = "summary_large_image" | "summary";

export default function SocialMediaCardSimulatorTool() {
  const [platform, setPlatform] = useState<Platform>("twitter");
  const [twitterTheme, setTwitterTheme] = useState<TwitterTheme>("dark");
  const [twitterCardType, setTwitterCardType] = useState<TwitterCardType>("summary_large_image");

  // Form State
  const [title, setTitle] = useState<string>(
    "Fusion Tools - 50+ Free Fast Online Web & Developer Utilities"
  );
  const [description, setDescription] = useState<string>(
    "Convert images, generate Schema JSON-LD, analyze SEO keyword density, simulate Google SERPs, and format developer code. 100% free and client-side private."
  );
  const [url, setUrl] = useState<string>("https://fusiontools.in/tools/seo-tools");
  const [siteName, setSiteName] = useState<string>("Fusion Tools");
  const [authorHandle, setAuthorHandle] = useState<string>("@fusiontools");
  const [imageUrl, setImageUrl] = useState<string>(
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80"
  );

  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; ratio: string } | null>({
    width: 1200,
    height: 630,
    ratio: "1.91:1 (Optimal)",
  });

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Domain from URL
  const domain = useMemo(() => {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return "fusiontools.in";
    }
  }, [url]);

  // Load Image and check dimensions
  const handleImageLoadCheck = (src: string) => {
    if (typeof window === "undefined") return;
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratioVal = (w / h).toFixed(2);
      let ratioDesc = `${ratioVal}:1`;
      if (Math.abs(w / h - 1.91) < 0.1) {
        ratioDesc += " (Optimal Open Graph)";
      } else if (Math.abs(w / h - 1.0) < 0.05) {
        ratioDesc += " (Square / Summary)";
      } else if (Math.abs(w / h - 1.78) < 0.05) {
        ratioDesc += " (16:9 Standard)";
      }
      setImageMeta({ width: w, height: h, ratio: ratioDesc });
    };
    img.src = src;
  };

  // Direct File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)", "Invalid File");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      handleImageLoadCheck(result);
      toast.success("Loaded local preview image!", "Image Uploaded");
    };
    reader.readAsDataURL(file);
  };

  // Generate HTML Meta Tags
  const generatedMetaTags = useMemo(() => {
    return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />

<!-- Open Graph / Facebook / WhatsApp / LinkedIn / Pinterest -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:site_name" content="${siteName}" />

<!-- Twitter / X -->
<meta name="twitter:card" content="${twitterCardType}" />
<meta name="twitter:url" content="${url}" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${imageUrl}" />
<meta name="twitter:creator" content="${authorHandle}" />
<meta name="twitter:site" content="${authorHandle}" />`;
  }, [title, description, url, siteName, authorHandle, imageUrl, twitterCardType]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedMetaTags);
    setCopiedCode(true);
    toast.success("Copied Open Graph & Twitter meta tags!", "Copied");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadSnippet = () => {
    const blob = new Blob([generatedMetaTags], { type: "text/html" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = "social-meta-tags.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
    toast.success("Downloaded meta tags snippet!", "Downloaded");
  };

  const loadSampleData = () => {
    setTitle("10 Best Free SEO & Developer Tools for 2026");
    setDescription(
      "Supercharge your workflow with fast, browser-based utilities. Simulate SERP snippets, generate Schema.org JSON-LD, crop pictures, and strip EXIF data instantly."
    );
    setUrl("https://fusiontools.in/tools/seo-tools");
    setSiteName("Fusion Tools");
    setAuthorHandle("@fusiontools");
    const sampleImg =
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=630&q=80";
    setImageUrl(sampleImg);
    handleImageLoadCheck(sampleImg);
    toast.success("Loaded sample share card content", "Sample Ready");
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setUrl("https://example.com");
    setImageUrl("");
    setImageMeta(null);
    toast.info("Cleared inputs", "Reset");
  };

  // Length validations
  const titleChars = title.length;
  const descChars = description.length;
  const isTitleLong = titleChars > 70;
  const isDescLong = descChars > 200;

  return (
    <motion.div
      className="tool-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Info Banner ──────────────────────────────────────────────── */}
      <div className="tool-info-banner">
        <FiShare2 />
        <p>
          Simulate how your links appear when shared across 10 major platforms: Twitter/X,
          WhatsApp, Facebook, LinkedIn, Telegram, Reddit, Pinterest, Threads, Discord, and Slack.
          Test image cropping ratios, character truncation, and export ready-to-use Open Graph
          &amp; Twitter Card meta tags.
        </p>
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          marginTop: 20,
          alignItems: "start",
        }}
      >
        {/* ── Left Column: Card Inputs & Meta Settings ───────────────── */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 16,
            border: "1px solid #334155",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Header & Quick Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #334155",
              paddingBottom: 14,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
              Share Card Content
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={loadSampleData} style={smallBtnStyle}>
                Sample Data
              </button>
              <button onClick={clearForm} style={{ ...smallBtnStyle, color: "#ef4444" }}>
                <FiTrash2 /> Clear
              </button>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={labelStyle}>Open Graph Title *</label>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isTitleLong ? "#f59e0b" : "#94a3b8",
                }}
              >
                {titleChars} / 70 chars {isTitleLong && "(May truncate)"}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Catchy Headline for Social Media"
              style={inputStyle}
            />
          </div>

          {/* Description Input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <label style={labelStyle}>Open Graph Description *</label>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isDescLong ? "#f59e0b" : "#94a3b8",
                }}
              >
                {descChars} / 200 chars {isDescLong && "(May truncate)"}
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a compelling summary that drives clicks..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* URL & Site Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Canonical URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Site / Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Fusion Tools"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Twitter Handle & Card Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Twitter Handle</label>
              <input
                type="text"
                value={authorHandle}
                onChange={(e) => setAuthorHandle(e.target.value)}
                placeholder="@username"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Twitter Card Layout</label>
              <select
                value={twitterCardType}
                onChange={(e) => setTwitterCardType(e.target.value as TwitterCardType)}
                style={inputStyle}
              >
                <option value="summary_large_image">Large Image Card (1200x630)</option>
                <option value="summary">Summary Small Thumbnail (1:1)</option>
              </select>
            </div>
          </div>

          {/* Image URL & Upload Section */}
          <div
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Social Share Image (OG Image)</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#38bdf8",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FiUpload /> Upload Local Image
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                handleImageLoadCheck(e.target.value);
              }}
              placeholder="https://example.com/social-preview.jpg"
              style={inputStyle}
            />

            {imageMeta && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#94a3b8",
                  paddingTop: 4,
                }}
              >
                <span>
                  Dimensions: <strong>{imageMeta.width} × {imageMeta.height} px</strong>
                </span>
                <span style={{ color: "#34d399", fontWeight: 600 }}>
                  Ratio: {imageMeta.ratio}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Platform Previews & Meta Code ───────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Platform Tabs & Theme Toggle Bar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#1e293b",
              borderRadius: 14,
              border: "1px solid #334155",
              padding: 10,
            }}
          >
            {/* Platform Tab Buttons (10 Platforms) */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* 1. Twitter / X */}
              <button
                onClick={() => setPlatform("twitter")}
                style={getTabStyle(platform === "twitter")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </button>

              {/* 2. WhatsApp */}
              <button
                onClick={() => setPlatform("whatsapp")}
                style={getTabStyle(platform === "whatsapp")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                WhatsApp
              </button>

              {/* 3. Facebook */}
              <button
                onClick={() => setPlatform("facebook")}
                style={getTabStyle(platform === "facebook")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>

              {/* 4. LinkedIn */}
              <button
                onClick={() => setPlatform("linkedin")}
                style={getTabStyle(platform === "linkedin")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </button>

              {/* 5. Telegram */}
              <button
                onClick={() => setPlatform("telegram")}
                style={getTabStyle(platform === "telegram")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </button>

              {/* 6. Reddit */}
              <button
                onClick={() => setPlatform("reddit")}
                style={getTabStyle(platform === "reddit")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
                Reddit
              </button>

              {/* 7. Pinterest */}
              <button
                onClick={() => setPlatform("pinterest")}
                style={getTabStyle(platform === "pinterest")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                </svg>
                Pinterest
              </button>

              {/* 8. Threads */}
              <button
                onClick={() => setPlatform("threads")}
                style={getTabStyle(platform === "threads")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.001 0C5.372 0 0 5.372 0 12.001c0 6.628 5.372 12 12.001 12 6.628 0 12-5.372 12-12 0-6.629-5.372-12.001-12-12.001zm6.757 14.542c-.22.955-.71 1.76-1.433 2.336-.723.577-1.637.876-2.671.876-1.503 0-2.775-.589-3.676-1.701-.902-1.112-1.353-2.628-1.353-4.403 0-1.787.456-3.308 1.368-4.425.912-1.116 2.195-1.705 3.712-1.705 1.488 0 2.736.568 3.61 1.644.873 1.076 1.323 2.533 1.323 4.225 0 .285-.015.578-.046.877h-7.85c.038.995.342 1.78.895 2.308.552.529 1.254.793 2.062.793.639 0 1.189-.17 1.614-.499.426-.328.71-.782.836-1.327h1.61z" />
                </svg>
                Threads
              </button>

              {/* 9. Discord */}
              <button
                onClick={() => setPlatform("discord")}
                style={getTabStyle(platform === "discord")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
                </svg>
                Discord
              </button>

              {/* 10. Slack */}
              <button
                onClick={() => setPlatform("slack")}
                style={getTabStyle(platform === "slack")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                </svg>
                Slack
              </button>
            </div>

            {/* Sub-bar with Theme / Layout controls */}
            {platform === "twitter" && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setTwitterTheme(twitterTheme === "dark" ? "light" : "dark")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: twitterTheme === "dark" ? "#0f172a" : "#e2e8f0",
                    color: twitterTheme === "dark" ? "#f8fafc" : "#0f172a",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {twitterTheme === "dark" ? <FiSun /> : <FiMoon />}
                  {twitterTheme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </div>
            )}
          </div>

          {/* ── Visual Preview Card Area ────────────────────────────── */}
          <div
            style={{
              padding: 24,
              background: "#090d16",
              borderRadius: 16,
              border: "1px solid #1e293b",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 380,
            }}
          >
            {/* 1. TWITTER / X SIMULATOR */}
            {platform === "twitter" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 520,
                  background: twitterTheme === "dark" ? "#000000" : "#ffffff",
                  color: twitterTheme === "dark" ? "#e7e9ea" : "#0f1419",
                  borderRadius: 16,
                  border: twitterTheme === "dark" ? "1px solid #2f3336" : "1px solid #cfd9de",
                  padding: 16,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {/* Mock Tweet Header */}
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2563eb, #38bdf8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "#fff",
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    FT
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{siteName}</span>
                      <span
                        style={{
                          fontSize: 13,
                          color: twitterTheme === "dark" ? "#71767b" : "#536471",
                        }}
                      >
                        {authorHandle} · 2h
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 14, lineHeight: 1.4 }}>
                      Check out this newly updated online resource! 👇
                    </p>
                  </div>
                </div>

                {/* Twitter Share Card */}
                {twitterCardType === "summary_large_image" ? (
                  <div
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: twitterTheme === "dark" ? "1px solid #2f3336" : "1px solid #cfd9de",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", aspectRatio: "1.91 / 1" }}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Twitter Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#1e293b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#64748b",
                          }}
                        >
                          <FiImage size={32} />
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 12,
                          left: 12,
                          background: "rgba(0, 0, 0, 0.75)",
                          color: "#ffffff",
                          fontSize: 12,
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontWeight: 500,
                        }}
                      >
                        {domain}
                      </div>
                    </div>
                    <div style={{ padding: 12 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: 4,
                        }}
                      >
                        {title || "Card Headline"}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: twitterTheme === "dark" ? "#71767b" : "#536471",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {description || "Card description preview..."}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: twitterTheme === "dark" ? "1px solid #2f3336" : "1px solid #cfd9de",
                      display: "flex",
                      height: 120,
                    }}
                  >
                    <div style={{ width: 120, height: "100%", flexShrink: 0 }}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Twitter Thumbnail"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "#1e293b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#64748b",
                          }}
                        >
                          <FiImage size={24} />
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: 12,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: twitterTheme === "dark" ? "#71767b" : "#536471",
                          marginBottom: 2,
                        }}
                      >
                        {domain}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {title || "Card Headline"}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: twitterTheme === "dark" ? "#71767b" : "#536471",
                          lineHeight: 1.3,
                          marginTop: 4,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {description}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. WHATSAPP SIMULATOR */}
            {platform === "whatsapp" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 420,
                  background: "#0b141a",
                  padding: "16px 12px",
                  borderRadius: 16,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {/* WhatsApp Chat Bubble */}
                <div
                  style={{
                    background: "#005c4b",
                    borderRadius: "12px 12px 2px 12px",
                    overflow: "hidden",
                    marginLeft: "auto",
                    maxWidth: 360,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    color: "#e9edef",
                  }}
                >
                  {/* Image */}
                  <div style={{ width: "100%", aspectRatio: "1.91 / 1", background: "#025144" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="WhatsApp Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#8696a0",
                        }}
                      >
                        <FiImage size={32} />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div style={{ padding: "10px 12px 6px" }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: "#e9edef",
                        marginBottom: 4,
                      }}
                    >
                      {title || "Card Headline"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#8696a0",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginBottom: 6,
                      }}
                    >
                      {description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 11,
                        color: "#8696a0",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        paddingTop: 6,
                      }}
                    >
                      <span>{domain}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        12:45 PM{" "}
                        <span style={{ color: "#53bdeb", fontWeight: 700 }}>✓✓</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FACEBOOK SIMULATOR */}
            {platform === "facebook" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 500,
                  background: "#242526",
                  color: "#e4e6eb",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid #3a3b3c",
                  fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                }}
              >
                <div style={{ padding: "12px 16px", display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#1877f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    FT
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14, display: "block" }}>
                      {siteName}
                    </span>
                    <span style={{ fontSize: 12, color: "#b0b3b8" }}>Just now · 🌎</span>
                  </div>
                </div>

                <div style={{ width: "100%", aspectRatio: "1.91 / 1", background: "#18191a" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Facebook Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#b0b3b8",
                      }}
                    >
                      <FiImage size={32} />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    background: "#3a3b3c",
                    borderTop: "1px solid #4e4f50",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      color: "#b0b3b8",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      marginBottom: 2,
                    }}
                  >
                    {domain}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#e4e6eb",
                      lineHeight: 1.3,
                      marginBottom: 4,
                    }}
                  >
                    {title || "Card Headline"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#b0b3b8",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {description}
                  </div>
                </div>
              </div>
            )}

            {/* 4. LINKEDIN SIMULATOR */}
            {platform === "linkedin" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 500,
                  background: "#1b1f23",
                  color: "#f3f2ef",
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #383c40",
                  fontFamily:
                    '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                <div style={{ padding: "12px 14px", display: "flex", gap: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#0a66c2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    FT
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14, display: "block" }}>
                      {siteName}
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.6)" }}>
                      2,400 followers · Promoted
                    </span>
                  </div>
                </div>

                <div style={{ width: "100%", aspectRatio: "1.91 / 1", background: "#000" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="LinkedIn Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8c8c8c",
                      }}
                    >
                      <FiImage size={32} />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "10px 14px",
                    background: "#282c31",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: 10 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title || "Card Headline"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255, 255, 255, 0.6)",
                        marginTop: 2,
                      }}
                    >
                      {domain}
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: 16,
                      border: "1px solid #70b5f9",
                      color: "#70b5f9",
                      background: "transparent",
                      fontSize: 13,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Learn more
                  </button>
                </div>
              </div>
            )}

            {/* 5. TELEGRAM SIMULATOR */}
            {platform === "telegram" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 440,
                  background: "#0e1621",
                  padding: 16,
                  borderRadius: 16,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {/* Telegram Message Bubble */}
                <div
                  style={{
                    background: "#182533",
                    borderRadius: "14px 14px 14px 4px",
                    padding: "12px 14px",
                    color: "#f5f5f5",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Link Header */}
                  <a
                    href={url}
                    onClick={(e) => e.preventDefault()}
                    style={{
                      fontSize: 13,
                      color: "#6ab3f3",
                      textDecoration: "underline",
                      display: "block",
                      marginBottom: 8,
                      wordBreak: "break-all",
                    }}
                  >
                    {url}
                  </a>

                  {/* Telegram Embed with Left Bar */}
                  <div
                    style={{
                      borderLeft: "3px solid #6ab3f3",
                      paddingLeft: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6ab3f3" }}>
                      {siteName}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
                      {title || "Card Headline"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#99abbb",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {description}
                    </div>

                    {imageUrl && (
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: "hidden",
                          width: "100%",
                          aspectRatio: "1.91 / 1",
                          marginTop: 4,
                        }}
                      >
                        <img
                          src={imageUrl}
                          alt="Telegram Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Time Footer */}
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#708499",
                      marginTop: 6,
                    }}
                  >
                    14:22
                  </div>
                </div>
              </div>
            )}

            {/* 6. REDDIT SIMULATOR */}
            {platform === "reddit" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 520,
                  background: "#1a1a1b",
                  color: "#d7dadc",
                  borderRadius: 12,
                  border: "1px solid #343536",
                  fontFamily: 'IBMPlexSans, Arial, sans-serif',
                  overflow: "hidden",
                }}
              >
                {/* Reddit Subreddit Bar */}
                <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#ff4500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    r/
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc" }}>r/technology</span>
                  <span style={{ fontSize: 12, color: "#818384" }}>
                    · Posted by u/{authorHandle.replace("@", "")} 4h ago
                  </span>
                </div>

                {/* Reddit Post Title & Flair */}
                <div style={{ padding: "0 16px 10px" }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#d7dadc", lineHeight: 1.3 }}>
                    {title || "Card Headline"}
                  </h4>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "#272729",
                      color: "#818384",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {domain} ↗
                  </span>
                </div>

                {/* Preview Image */}
                <div style={{ width: "100%", aspectRatio: "1.91 / 1", background: "#000" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Reddit Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#818384",
                      }}
                    >
                      <FiImage size={32} />
                    </div>
                  )}
                </div>

                {/* Reddit Interaction Bar */}
                <div
                  style={{
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    fontSize: 12,
                    color: "#818384",
                    fontWeight: 700,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#272729",
                      padding: "4px 8px",
                      borderRadius: 16,
                    }}
                  >
                    <FiArrowUp /> 1.4k <FiArrowDown />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiMessageSquare /> 184 Comments
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <FiShare2 /> Share
                  </div>
                </div>
              </div>
            )}

            {/* 7. PINTEREST SIMULATOR */}
            {platform === "pinterest" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 320,
                  background: "#111111",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #2b2b2b",
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                {/* Visual Pin Image */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "1.91 / 1", background: "#222" }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Pinterest Pin"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#767676",
                      }}
                    >
                      <FiImage size={32} />
                    </div>
                  )}
                  {/* Save button */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "#e60023",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "6px 12px",
                      borderRadius: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    }}
                  >
                    Save
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#a5a5a5", marginBottom: 4 }}>
                    {domain}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#ffffff",
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {title || "Card Headline"}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#a5a5a5",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: 10,
                    }}
                  >
                    {description}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      FT
                    </div>
                    <span style={{ fontSize: 12, color: "#efefef", fontWeight: 600 }}>
                      {siteName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 8. THREADS SIMULATOR */}
            {platform === "threads" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 480,
                  background: "#101010",
                  color: "#f3f5f7",
                  borderRadius: 16,
                  border: "1px solid #222222",
                  padding: 16,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#222",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    FT
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {authorHandle.replace("@", "")}
                      </span>
                      <span style={{ fontSize: 12, color: "#777777" }}>1h</span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 14, color: "#f3f5f7", lineHeight: 1.4 }}>
                      Check this out!
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #262626",
                    background: "#181818",
                  }}
                >
                  <div style={{ width: "100%", aspectRatio: "1.91 / 1" }}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Threads Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#555",
                        }}
                      >
                        <FiImage size={32} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 12, color: "#777777", display: "block", marginBottom: 2 }}>
                      {domain}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#f3f5f7",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title || "Card Headline"}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 14, marginTop: 12, color: "#f3f5f7", fontSize: 16 }}>
                  <FiHeart /> <FiMessageSquare /> <FiRepeat /> <FiShare2 />
                </div>
              </div>
            )}

            {/* 9. DISCORD SIMULATOR */}
            {platform === "discord" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 480,
                  background: "#2f3136",
                  color: "#dcddde",
                  borderRadius: 8,
                  padding: "14px 16px",
                  borderLeft: "4px solid #5865f2",
                  fontFamily:
                    '"gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                }}
              >
                <div style={{ fontSize: 12, color: "#b9bbbe", marginBottom: 6 }}>
                  {siteName}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#00aff4",
                    lineHeight: 1.3,
                    marginBottom: 6,
                  }}
                >
                  {title || "Card Headline"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#dcddde",
                    lineHeight: 1.4,
                    marginBottom: 10,
                  }}
                >
                  {description}
                </div>
                {imageUrl && (
                  <div
                    style={{
                      borderRadius: 6,
                      overflow: "hidden",
                      maxWidth: "100%",
                      aspectRatio: "1.91 / 1",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Discord Embed"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* 10. SLACK SIMULATOR */}
            {platform === "slack" && (
              <div
                style={{
                  width: "100%",
                  maxWidth: 480,
                  background: "#1a1d21",
                  color: "#d1d2d3",
                  borderRadius: 8,
                  padding: "12px 14px",
                  borderLeft: "4px solid #e01e5a",
                  fontFamily: 'Slack-Lato, appleLogo, sans-serif',
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#f8fafc",
                    marginBottom: 4,
                  }}
                >
                  <span>{siteName}</span>
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#1d9bd1",
                    lineHeight: 1.3,
                    marginBottom: 4,
                  }}
                >
                  {title || "Card Headline"}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#d1d2d3",
                    lineHeight: 1.4,
                    marginBottom: 10,
                  }}
                >
                  {description}
                </div>
                {imageUrl && (
                  <div
                    style={{
                      borderRadius: 6,
                      overflow: "hidden",
                      maxWidth: "100%",
                      aspectRatio: "1.91 / 1",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Slack Attachment"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Generated Meta Tags Code Block ──────────────────────── */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderBottom: "1px solid #334155",
                background: "#0f172a",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiCode style={{ color: "#38bdf8" }} /> Ready-to-Paste HTML Meta Tags
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={handleCopyCode}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: copiedCode ? "#10b981" : "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {copiedCode ? <FiCheck /> : <FiCopy />}
                  {copiedCode ? "Copied" : "Copy Tags"}
                </button>
                <button
                  onClick={handleDownloadSnippet}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    background: "#334155",
                    color: "#e2e8f0",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <FiDownload /> .html
                </button>
              </div>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 16,
                fontSize: 12,
                lineHeight: 1.6,
                color: "#e2e8f0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                maxHeight: 220,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                background: "#090d16",
              }}
            >
              <code>{generatedMetaTags}</code>
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Shared Inline Styles ───────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#f8fafc",
  fontSize: 13,
  outline: "none",
  transition: "border-color 0.2s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#cbd5e1",
  marginBottom: 4,
};

const smallBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 6,
  padding: "4px 10px",
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
};

const getTabStyle = (isActive: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 11px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: isActive ? 700 : 500,
  color: isActive ? "#ffffff" : "#94a3b8",
  background: isActive ? "#2563eb" : "transparent",
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap",
});
