"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
  FiSearch,
  FiMonitor,
  FiSmartphone,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiGlobe,
  FiCode,
  FiTrash2,
  FiMoon,
  FiSun,
  FiStar,
  FiEye,
} from "react-icons/fi";

type ViewportMode = "desktop" | "mobile";
type GoogleTheme = "light" | "dark";

// Measure text pixel width using a temporary canvas with Google font metrics
function measureTextWidth(text: string, font: string): number {
  if (typeof window === "undefined") return text.length * 10;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 10;
  ctx.font = font;
  return Math.round(ctx.measureText(text).width);
}

export default function GoogleSerpSimulatorTool() {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [googleTheme, setGoogleTheme] = useState<GoogleTheme>("light");

  // Core Inputs
  const [title, setTitle] = useState<string>(
    "Free Online Image & PDF Tools - Fusion Tools"
  );
  const [url, setUrl] = useState<string>("https://fusiontools.in/tools/image-tools");
  const [description, setDescription] = useState<string>(
    "Explore fast, free online productivity tools. Convert SVG to PNG, crop photos, add watermarks in bulk, and strip EXIF data directly in your browser with zero upload wait."
  );
  const [siteName, setSiteName] = useState<string>("Fusion Tools");
  const [keyword, setKeyword] = useState<string>("free online");

  // Rich Snippet Toggles
  const [showDate, setShowDate] = useState<boolean>(true);
  const [pubDate, setPubDate] = useState<string>("Oct 25, 2026");
  const [showRating, setShowRating] = useState<boolean>(true);
  const [ratingVal, setRatingVal] = useState<number>(4.9);
  const [reviewCount, setReviewCount] = useState<number>(142);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Constants for Limits
  const MAX_TITLE_PX = viewport === "desktop" ? 600 : 560;
  const MAX_TITLE_CHARS = 60;
  const MAX_DESC_PX = viewport === "desktop" ? 960 : 780;
  const MAX_DESC_CHARS = viewport === "desktop" ? 160 : 120;

  // Pixel Widths
  const titlePx = useMemo(() => {
    return measureTextWidth(title, "20px Arial, sans-serif");
  }, [title]);

  const descPx = useMemo(() => {
    return measureTextWidth(description, "14px Arial, sans-serif");
  }, [description]);

  // Truncation calculations
  const isTitleTruncated = titlePx > MAX_TITLE_PX || title.length > MAX_TITLE_CHARS;
  const isDescTruncated = descPx > MAX_DESC_PX || description.length > MAX_DESC_CHARS;

  // Display URL breakdown (Protocol, Domain, Path)
  const parsedUrl = useMemo(() => {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      const cleanPath = u.pathname.replace(/^\/|\/$/g, "").replace(/\//g, " › ");
      return {
        domain: u.hostname,
        breadcrumb: cleanPath ? ` › ${cleanPath}` : "",
      };
    } catch {
      return { domain: "example.com", breadcrumb: " › tools" };
    }
  }, [url]);

  // Bold query terms inside snippet if keyword matches
  const renderHighlightedSnippet = (rawText: string) => {
    if (!keyword.trim()) return rawText;
    const words = keyword.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return rawText;

    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = rawText.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} style={{ color: googleTheme === "dark" ? "#ffffff" : "#202124", fontWeight: 700 }}>
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  // Sample Data loader
  const loadSampleData = () => {
    setTitle("10 Best Free Online SEO Tools for 2026 (Rank #1 Fast)");
    setUrl("https://fusiontools.in/tools/seo-tools/google-serp-simulator");
    setDescription(
      "Optimize your search snippets with the top free online SEO tools. Simulate desktop and mobile Google SERP results, test title tag pixel widths, and prevent truncation."
    );
    setSiteName("Fusion Tools");
    setKeyword("free online SEO tools");
    setShowDate(true);
    setPubDate("Oct 25, 2026");
    setShowRating(true);
    setRatingVal(4.9);
    setReviewCount(248);
    toast.success("Loaded sample high-CTR SERP snippet!", "Sample Ready");
  };

  // Copy HTML Meta Tags
  const copyMetaTags = () => {
    const code = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("HTML Meta Tags copied to clipboard!", "Copied");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const clearForm = () => {
    setTitle("");
    setUrl("https://example.com");
    setDescription("");
    setKeyword("");
    toast.info("Cleared inputs", "Reset");
  };

  return (
    <motion.div
      className="tool-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Info Banner ──────────────────────────────────────────────── */}
      <div className="tool-info-banner">
        <FiSearch />
        <p>
          Simulate how your web pages appear in Google Search on desktop and mobile. Calculate pixel
          widths, prevent snippet truncation, and test rich stars &amp; breadcrumbs in real-time.
        </p>
      </div>

      {/* ── Mode Switcher & Viewport Toggles ─────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 20,
          marginBottom: 16,
        }}
      >
        {/* Desktop vs Mobile Tabs */}
        <div className="mode-switcher" style={{ margin: 0 }}>
          <button
            type="button"
            className={`mode-btn ${viewport === "desktop" ? "active" : ""}`}
            onClick={() => setViewport("desktop")}
          >
            <FiMonitor /> Desktop SERP Preview
          </button>
          <button
            type="button"
            className={`mode-btn ${viewport === "mobile" ? "active" : ""}`}
            onClick={() => setViewport("mobile")}
          >
            <FiSmartphone /> Mobile SERP Preview
          </button>
        </div>

        {/* Google Theme Toggle (Light / Dark) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setGoogleTheme((t) => (t === "light" ? "dark" : "light"))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#cbd5e1",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {googleTheme === "light" ? (
              <>
                <FiMoon /> Google Dark Mode
              </>
            ) : (
              <>
                <FiSun style={{ color: "#facc15" }} /> Google Light Mode
              </>
            )}
          </button>
          <button
            type="button"
            onClick={loadSampleData}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(255, 107, 53, 0.15)",
              border: "1px solid rgba(255, 107, 53, 0.35)",
              color: "#ff6b35",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Sample
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Studio ──────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {/* ── Left Column: Live Google SERP Card Preview ──────────────── */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
              <FiEye /> Google Search Result Simulation ({viewport})
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Limits: {MAX_TITLE_PX}px Title / {MAX_DESC_PX}px Snippet
            </span>
          </div>

          {/* Authentic Google Result Card Box */}
          <div
            style={{
              background: googleTheme === "light" ? "#ffffff" : "#202124",
              borderRadius: 16,
              padding: viewport === "desktop" ? "24px 28px" : "18px 20px",
              border: googleTheme === "light" ? "1px solid #e2e8f0" : "1px solid #3c4043",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25)",
              fontFamily: "Arial, sans-serif",
              maxWidth: viewport === "mobile" ? 420 : "100%",
              margin: viewport === "mobile" ? "0 auto" : "0",
              transition: "all 0.2s ease",
            }}
          >
            {/* Header: Favicon + Domain Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              {/* Favicon Circle */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: googleTheme === "light" ? "#f1f3f4" : "#303134",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                🌐
              </div>
              <div style={{ lineHeight: 1.25, overflow: "hidden" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: googleTheme === "light" ? "#202124" : "#dadce0",
                    fontWeight: 600,
                  }}
                >
                  {siteName || "Site Name"}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: googleTheme === "light" ? "#4d5156" : "#bdc1c6",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  https://{parsedUrl.domain}
                  <span style={{ color: googleTheme === "light" ? "#70757a" : "#9aa0a6" }}>
                    {parsedUrl.breadcrumb}
                  </span>
                </span>
              </div>
            </div>

            {/* Title Link */}
            <h3
              style={{
                margin: "4px 0 6px",
                fontSize: viewport === "desktop" ? 20 : 18,
                lineHeight: 1.3,
                fontWeight: 400,
                color: googleTheme === "light" ? "#1a0dab" : "#8ab4f8",
                cursor: "pointer",
                wordBreak: "break-word",
              }}
            >
              {title || "Please enter a page title..."}
              {isTitleTruncated && (
                <span style={{ color: "#ef4444", fontWeight: 700 }} title="Title will be cut off by Google">
                  {" "}
                  &hellip;
                </span>
              )}
            </h3>

            {/* Rich Rating Stars Row (if enabled) */}
            {showRating && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: googleTheme === "light" ? "#70757a" : "#bdc1c6",
                  marginBottom: 6,
                }}
              >
                <div style={{ color: "#fbbc04", display: "flex", gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} style={{ fill: "#fbbc04", fontSize: 13 }} />
                  ))}
                </div>
                <span>
                  Rating: <strong>{ratingVal.toFixed(1)}</strong> &middot; ‎{reviewCount} reviews
                </span>
              </div>
            )}

            {/* Meta Description Snippet */}
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.58,
                color: googleTheme === "light" ? "#4d5156" : "#bdc1c6",
                wordBreak: "break-word",
              }}
            >
              {showDate && (
                <span
                  style={{
                    color: googleTheme === "light" ? "#70757a" : "#9aa0a6",
                    marginRight: 6,
                  }}
                >
                  {pubDate} &mdash;
                </span>
              )}
              {description ? (
                renderHighlightedSnippet(description)
              ) : (
                <span style={{ fontStyle: "italic", opacity: 0.6 }}>
                  Enter a meta description to see live preview...
                </span>
              )}
              {isDescTruncated && (
                <span style={{ color: "#ef4444", fontWeight: 700 }} title="Snippet will be cut off by Google">
                  {" "}
                  &hellip;
                </span>
              )}
            </p>
          </div>

          {/* ── SEO Health & Pixel Metrics Summary ─────────────────────── */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: 16,
              marginTop: 18,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <FiCheckCircle style={{ color: "#10b981" }} /> Snippet Health Audit
            </span>

            {/* Title Health Meter */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#cbd5e1" }}>Title Tag Length:</span>
                <span style={{ color: isTitleTruncated ? "#ef4444" : "#10b981", fontWeight: 700 }}>
                  {title.length} / {MAX_TITLE_CHARS} chars ({titlePx} / {MAX_TITLE_PX}px)
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (titlePx / MAX_TITLE_PX) * 100)}%`,
                    background: isTitleTruncated ? "#ef4444" : title.length >= 40 ? "#10b981" : "#f59e0b",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
              {isTitleTruncated && (
                <span style={{ fontSize: 11, color: "#ef4444", display: "block", marginTop: 4 }}>
                  ⚠️ Title exceeds Google&apos;s pixel boundary and will be truncated with &hellip;
                </span>
              )}
            </div>

            {/* Description Health Meter */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: "#cbd5e1" }}>Meta Description Length:</span>
                <span style={{ color: isDescTruncated ? "#ef4444" : "#10b981", fontWeight: 700 }}>
                  {description.length} / {MAX_DESC_CHARS} chars ({descPx} / {MAX_DESC_PX}px)
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (descPx / MAX_DESC_PX) * 100)}%`,
                    background: isDescTruncated ? "#ef4444" : description.length >= 100 ? "#10b981" : "#f59e0b",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
              {isDescTruncated && (
                <span style={{ fontSize: 11, color: "#ef4444", display: "block", marginTop: 4 }}>
                  ⚠️ Meta description is too long for this viewport and will be cut off.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Input Controls ────────────────────────────── */}
        <div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
            }}
          >
            {/* Title Input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                Page Title Tag (&lt;title&gt;)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10 Best SEO Tools for 2026..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.3)",
                  border: isTitleTruncated ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* Target URL */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                Canonical URL / Permalink
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/tools/..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* Meta Description */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                Meta Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write an enticing summary with primary keywords..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.3)",
                  border: isDescTruncated ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Keyword & Site Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                  Target Query Keyword
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. online tools"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                  Site Brand Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. Fusion Tools"
                  style={{
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            {/* Rich Snippet Enhancements Toggle */}
            <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#cbd5e1", marginBottom: 10 }}>
                Rich Snippet Enhancements
              </span>

              {/* Date Tag */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Publication Date in Snippet</span>
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  style={{ accentColor: "#ff6b35", cursor: "pointer", width: 16, height: 16 }}
                />
              </div>

              {/* Star Rating */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Star Ratings &amp; Reviews</span>
                <input
                  type="checkbox"
                  checked={showRating}
                  onChange={(e) => setShowRating(e.target.checked)}
                  style={{ accentColor: "#ff6b35", cursor: "pointer", width: 16, height: 16 }}
                />
              </div>

              {showRating && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Score ({ratingVal})</span>
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={ratingVal}
                      onChange={(e) => setRatingVal(Number(e.target.value))}
                      className="quality-slider"
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Review Count ({reviewCount})</span>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Number(e.target.value))}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: 6,
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Generated HTML Meta Tags Box ───────────────────────────── */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                <FiCode /> HTML Meta Code
              </span>
              <button
                type="button"
                onClick={copyMetaTags}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(255, 107, 53, 0.15)",
                  border: "1px solid rgba(255, 107, 53, 0.35)",
                  borderRadius: 6,
                  color: "#ff6b35",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
              >
                {copiedCode ? <FiCheck /> : <FiCopy />} Copy Tags
              </button>
            </div>

            <pre
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                padding: 12,
                borderRadius: 8,
                fontSize: 11,
                color: "#cbd5e1",
                fontFamily: "monospace",
                overflowX: "auto",
                margin: 0,
              }}
            >
              {`<title>${title}</title>\n<meta name="description" content="${description}" />\n<link rel="canonical" href="${url}" />`}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
