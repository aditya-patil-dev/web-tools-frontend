"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
  FiGlobe,
  FiCode,
  FiCopy,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiLayers,
  FiLink,
  FiRefreshCw,
  FiFileText,
  FiServer,
} from "react-icons/fi";

// Curated list of popular ISO 639-1 languages
const POPULAR_LANGUAGES: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "zh", name: "Chinese (中文)" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "sv", name: "Swedish (Svenska)" },
  { code: "da", name: "Danish (Dansk)" },
  { code: "fi", name: "Finnish (Suomi)" },
  { code: "no", name: "Norwegian (Norsk)" },
  { code: "cs", name: "Czech (Čeština)" },
  { code: "el", name: "Greek (Ελληνικά)" },
  { code: "he", name: "Hebrew (עברית)" },
  { code: "id", name: "Indonesian (Bahasa)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "th", name: "Thai (ไทย)" },
];

// Curated list of popular ISO 3166-1 alpha-2 countries / regions
const POPULAR_COUNTRIES: { code: string; name: string }[] = [
  { code: "", name: "Global / Any Region" },
  { code: "US", name: "United States (US)" },
  { code: "GB", name: "United Kingdom (GB)" },
  { code: "CA", name: "Canada (CA)" },
  { code: "AU", name: "Australia (AU)" },
  { code: "IN", name: "India (IN)" },
  { code: "ES", name: "Spain (ES)" },
  { code: "MX", name: "Mexico (MX)" },
  { code: "DE", name: "Germany (DE)" },
  { code: "FR", name: "France (FR)" },
  { code: "BR", name: "Brazil (BR)" },
  { code: "JP", name: "Japan (JP)" },
  { code: "IT", name: "Italy (IT)" },
  { code: "CN", name: "China (CN)" },
  { code: "NL", name: "Netherlands (NL)" },
  { code: "RU", name: "Russia (RU)" },
  { code: "KR", name: "South Korea (KR)" },
  { code: "CH", name: "Switzerland (CH)" },
  { code: "AT", name: "Austria (AT)" },
  { code: "BE", name: "Belgium (BE)" },
  { code: "SG", name: "Singapore (SG)" },
  { code: "NZ", name: "New Zealand (NZ)" },
  { code: "IE", name: "Ireland (IE)" },
  { code: "ZA", name: "South Africa (ZA)" },
  { code: "AE", name: "United Arab Emirates (AE)" },
];

interface HreflangRow {
  id: string;
  isXDefault: boolean;
  language: string;
  country: string;
  url: string;
  isCurrentPageCanonical: boolean;
}

export default function HreflangGeneratorTool() {
  const [format, setFormat] = useState<"html" | "xml" | "http">("html");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [includeCanonical, setIncludeCanonical] = useState<boolean>(true);

  // Initial State: Standard Global + Multi-Regional Setup
  const [rows, setRows] = useState<HreflangRow[]>([
    {
      id: "1",
      isXDefault: true,
      language: "en",
      country: "",
      url: "https://fusiontools.in/tools/seo-tools",
      isCurrentPageCanonical: true,
    },
    {
      id: "2",
      isXDefault: false,
      language: "en",
      country: "US",
      url: "https://fusiontools.in/us/tools/seo-tools",
      isCurrentPageCanonical: false,
    },
    {
      id: "3",
      isXDefault: false,
      language: "en",
      country: "GB",
      url: "https://fusiontools.in/uk/tools/seo-tools",
      isCurrentPageCanonical: false,
    },
    {
      id: "4",
      isXDefault: false,
      language: "es",
      country: "ES",
      url: "https://fusiontools.in/es/tools/seo-tools",
      isCurrentPageCanonical: false,
    },
    {
      id: "5",
      isXDefault: false,
      language: "de",
      country: "DE",
      url: "https://fusiontools.in/de/tools/seo-tools",
      isCurrentPageCanonical: false,
    },
  ]);

  // Compute calculated hreflang code for each row
  const computedRows = useMemo(() => {
    return rows.map((r) => {
      let code = "x-default";
      if (!r.isXDefault) {
        code = r.language.toLowerCase();
        if (r.country.trim()) {
          code += `-${r.country.toUpperCase()}`;
        }
      }
      return {
        ...r,
        hreflangCode: code,
      };
    });
  }, [rows]);

  // Find canonical URL
  const canonicalRow = useMemo(() => {
    return computedRows.find((r) => r.isCurrentPageCanonical) || computedRows[0];
  }, [computedRows]);

  // Validation Checks
  const validation = useMemo(() => {
    const issues: string[] = [];
    const hasXDefault = computedRows.some((r) => r.isXDefault);
    if (!hasXDefault) {
      issues.push("Missing 'x-default' fallback for users whose language is not matched.");
    }

    // Check duplicate hreflang codes
    const codeCounts: Record<string, number> = {};
    computedRows.forEach((r) => {
      codeCounts[r.hreflangCode] = (codeCounts[r.hreflangCode] || 0) + 1;
    });
    Object.entries(codeCounts).forEach(([code, count]) => {
      if (count > 1) {
        issues.push(`Duplicate hreflang tag found for code '${code}' (${count} times).`);
      }
    });

    // Check valid URLs
    const invalidUrls = computedRows.filter(
      (r) => !r.url.startsWith("http://") && !r.url.startsWith("https://")
    );
    if (invalidUrls.length > 0) {
      issues.push(`${invalidUrls.length} row(s) have invalid URLs (must begin with https://).`);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }, [computedRows]);

  // Generate Output Code based on Selected Format
  const generatedCode = useMemo(() => {
    if (format === "html") {
      let code = "";
      if (includeCanonical && canonicalRow?.url) {
        code += `<!-- Canonical Tag for Current Page -->\n<link rel="canonical" href="${canonicalRow.url}" />\n\n`;
      }
      code += `<!-- Multi-Language / Regional Hreflang Tags -->\n`;
      computedRows.forEach((r) => {
        code += `<link rel="alternate" hreflang="${r.hreflangCode}" href="${r.url}" />\n`;
      });
      return code.trim();
    }

    if (format === "xml") {
      let xml = `<!-- XML Sitemap URL with xhtml:link Hreflang Annotations -->\n<url>\n`;
      xml += `  <loc>${canonicalRow?.url || "https://example.com"}</loc>\n`;
      computedRows.forEach((r) => {
        xml += `  <xhtml:link rel="alternate" hreflang="${r.hreflangCode}" href="${r.url}" />\n`;
      });
      xml += `</url>`;
      return xml;
    }

    if (format === "http") {
      const links: string[] = [];
      if (includeCanonical && canonicalRow?.url) {
        links.push(`<${canonicalRow.url}>; rel="canonical"`);
      }
      computedRows.forEach((r) => {
        links.push(`<${r.url}>; rel="alternate"; hreflang="${r.hreflangCode}"`);
      });
      return `Link: ${links.join(",\n      ")}`;
    }

    return "";
  }, [format, includeCanonical, canonicalRow, computedRows]);

  // Handlers
  const handleAddRow = () => {
    const newId = String(Date.now());
    setRows([
      ...rows,
      {
        id: newId,
        isXDefault: false,
        language: "fr",
        country: "FR",
        url: "https://fusiontools.in/fr/tools/seo-tools",
        isCurrentPageCanonical: false,
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) {
      toast.error("You must have at least one locale row", "Cannot Delete");
      return;
    }
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleSetCanonical = (id: string) => {
    setRows(
      rows.map((r) => ({
        ...r,
        isCurrentPageCanonical: r.id === id,
      }))
    );
    toast.success("Set as current page canonical URL", "Canonical Updated");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    toast.success(`Copied ${format.toUpperCase()} tags to clipboard!`, "Copied");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === "xml" ? "xml" : format === "http" ? "txt" : "html";
    const mime =
      format === "xml"
        ? "application/xml"
        : format === "http"
        ? "text/plain"
        : "text/html";
    const blob = new Blob([generatedCode], { type: mime });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `hreflang-tags.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
    toast.success(`Downloaded hreflang-tags.${ext}!`, "Downloaded");
  };

  const loadEcommercePreset = () => {
    setRows([
      {
        id: "1",
        isXDefault: true,
        language: "en",
        country: "",
        url: "https://mystore.com/products/shoes",
        isCurrentPageCanonical: true,
      },
      {
        id: "2",
        isXDefault: false,
        language: "en",
        country: "US",
        url: "https://mystore.com/us/products/shoes",
        isCurrentPageCanonical: false,
      },
      {
        id: "3",
        isXDefault: false,
        language: "en",
        country: "GB",
        url: "https://mystore.com/uk/products/shoes",
        isCurrentPageCanonical: false,
      },
      {
        id: "4",
        isXDefault: false,
        language: "es",
        country: "MX",
        url: "https://mystore.com/mx/products/shoes",
        isCurrentPageCanonical: false,
      },
      {
        id: "5",
        isXDefault: false,
        language: "ja",
        country: "JP",
        url: "https://mystore.com/jp/products/shoes",
        isCurrentPageCanonical: false,
      },
    ]);
    toast.success("Loaded E-Commerce International preset", "Preset Ready");
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
        <FiGlobe />
        <p>
          Generate valid Google-approved multi-language and multi-regional hreflang annotations.
          Prevent duplicate content penalties, align self-referential canonical tags, and export in
          HTML &lt;head&gt;, XML Sitemap, or HTTP header formats.
        </p>
      </div>

      {/* ── Two-Column Main Layout ────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          marginTop: 20,
          alignItems: "start",
        }}
      >
        {/* ── Left Column: Locale & URL Builder ──────────────────────── */}
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
              Language &amp; Regional Locales ({rows.length})
            </h3>
            <button onClick={loadEcommercePreset} style={smallBtnStyle}>
              Sample Preset
            </button>
          </div>

          {/* Validation Alert Box */}
          {!validation.isValid ? (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontSize: 12,
                color: "#fbbf24",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                <FiAlertTriangle /> Hreflang Validation Warnings:
              </div>
              <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                {validation.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 10,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#34d399",
              }}
            >
              <FiCheckCircle />
              <span>All hreflang and canonical configurations are 100% valid.</span>
            </div>
          )}

          {/* Canonical Tag Toggle */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#cbd5e1",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={includeCanonical}
              onChange={(e) => setIncludeCanonical(e.target.checked)}
              style={{ accentColor: "#2563eb", width: 16, height: 16 }}
            />
            Include Self-Referential &lt;link rel=&quot;canonical&quot;&gt; Tag
          </label>

          {/* Locale Rows Repeater */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((row, index) => (
              <div
                key={row.id}
                style={{
                  background: "#0f172a",
                  border: `1px solid ${row.isCurrentPageCanonical ? "#3b82f6" : "#334155"}`,
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  position: "relative",
                  boxShadow: row.isCurrentPageCanonical
                    ? "0 0 12px rgba(59, 130, 246, 0.2)"
                    : "none",
                }}
              >
                {/* Row Top Status & Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: row.isXDefault ? "#7c3aed" : "#2563eb",
                        color: "#fff",
                        fontFamily: "monospace",
                      }}
                    >
                      {row.isXDefault
                        ? "x-default"
                        : `${row.language}${row.country ? `-${row.country}` : ""}`}
                    </span>
                    {row.isCurrentPageCanonical && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "rgba(16, 185, 129, 0.2)",
                          color: "#34d399",
                        }}
                      >
                        CANONICAL PAGE
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {!row.isCurrentPageCanonical && (
                      <button
                        onClick={() => handleSetCanonical(row.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#60a5fa",
                          fontSize: 11,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Make Canonical
                      </button>
                    )}
                    {rows.length > 1 && (
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: 4,
                        }}
                        title="Remove row"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>

                {/* Locale Dropdowns */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr", gap: 8 }}>
                  <div>
                    <label style={labelStyle}>Language</label>
                    <select
                      value={row.language}
                      disabled={row.isXDefault}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].language = e.target.value;
                        setRows(updated);
                      }}
                      style={{
                        ...inputStyle,
                        opacity: row.isXDefault ? 0.5 : 1,
                        cursor: row.isXDefault ? "not-allowed" : "pointer",
                      }}
                    >
                      {POPULAR_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} ({lang.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Country / Region</label>
                    <select
                      value={row.country}
                      disabled={row.isXDefault}
                      onChange={(e) => {
                        const updated = [...rows];
                        updated[index].country = e.target.value;
                        setRows(updated);
                      }}
                      style={{
                        ...inputStyle,
                        opacity: row.isXDefault ? 0.5 : 1,
                        cursor: row.isXDefault ? "not-allowed" : "pointer",
                      }}
                    >
                      {POPULAR_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Fallback Type</label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...rows];
                        updated[index].isXDefault = !updated[index].isXDefault;
                        setRows(updated);
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 8px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: "1px solid #334155",
                        cursor: "pointer",
                        background: row.isXDefault ? "#7c3aed" : "#1e293b",
                        color: row.isXDefault ? "#ffffff" : "#94a3b8",
                      }}
                    >
                      {row.isXDefault ? "x-default" : "Standard"}
                    </button>
                  </div>
                </div>

                {/* Target URL Input */}
                <div>
                  <label style={labelStyle}>Destination Page URL *</label>
                  <input
                    type="url"
                    value={row.url}
                    onChange={(e) => {
                      const updated = [...rows];
                      updated[index].url = e.target.value;
                      setRows(updated);
                    }}
                    placeholder="https://example.com/es/page"
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}

            <button
              onClick={handleAddRow}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                borderRadius: 10,
                background: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                border: "1px dashed #3b82f6",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              <FiPlus /> Add Another Language / Region
            </button>
          </div>
        </div>

        {/* ── Right Column: Generated Code & Export ──────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Format Selector Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              background: "#1e293b",
              borderRadius: 14,
              border: "1px solid #334155",
              padding: 8,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setFormat("html")}
                style={getFormatTabStyle(format === "html")}
              >
                <FiFileText /> HTML &lt;head&gt;
              </button>
              <button
                onClick={() => setFormat("xml")}
                style={getFormatTabStyle(format === "xml")}
              >
                <FiCode /> XML Sitemap
              </button>
              <button
                onClick={() => setFormat("http")}
                style={getFormatTabStyle(format === "http")}
              >
                <FiServer /> HTTP Header
              </button>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleCopy}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: copiedCode ? "#10b981" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {copiedCode ? <FiCheck /> : <FiCopy />}
                {copiedCode ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  background: "#334155",
                  color: "#e2e8f0",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FiDownload />
              </button>
            </div>
          </div>

          {/* Formatted Code Block Container */}
          <div
            style={{
              background: "#090d16",
              borderRadius: 14,
              border: "1px solid #1e293b",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 16px",
                background: "#0f172a",
                borderBottom: "1px solid #1e293b",
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              <span>
                {format === "html"
                  ? "HTML <link rel=\"alternate\"> Code"
                  : format === "xml"
                  ? "XML Sitemap <url> Entry"
                  : "HTTP Response Header"}
              </span>
              <span>{computedRows.length} Locales</span>
            </div>

            <pre
              style={{
                margin: 0,
                padding: 16,
                fontSize: 12,
                lineHeight: 1.6,
                color: "#e2e8f0",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                maxHeight: 380,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              <code>{generatedCode}</code>
            </pre>
          </div>

          {/* Educational Best Practices Box */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 14,
              border: "1px solid #334155",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 6 }}>
              <FiInfo style={{ color: "#38bdf8" }} /> International SEO Hreflang Best Practices
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: "#cbd5e1" }}>1. Reciprocal Links:</strong> Hreflang annotations must be reciprocal. If page A links to page B, page B must also link back to page A with the exact same tags.
              </div>
              <div>
                <strong style={{ color: "#cbd5e1" }}>2. Always Include x-default:</strong> The <code>x-default</code> tag specifies which page should be served to users whose language does not match any specified alternate.
              </div>
              <div>
                <strong style={{ color: "#cbd5e1" }}>3. Self-Referential Canonical:</strong> Each regional page must contain a self-referential canonical tag pointing to itself, NOT to the default language page.
              </div>
              <div>
                <strong style={{ color: "#cbd5e1" }}>4. Correct ISO Codes:</strong> Always use lowercase ISO 639-1 for languages (e.g. <code>en</code>, <code>es</code>) and uppercase ISO 3166-1 for regions (e.g. <code>GB</code>, <code>MX</code>).
              </div>
            </div>
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
  fontSize: 11,
  fontWeight: 600,
  color: "#94a3b8",
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

const getFormatTabStyle = (isActive: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: isActive ? 700 : 500,
  color: isActive ? "#ffffff" : "#94a3b8",
  background: isActive ? "#2563eb" : "transparent",
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
});
