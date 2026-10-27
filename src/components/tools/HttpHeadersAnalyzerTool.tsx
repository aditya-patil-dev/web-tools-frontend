"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
  FiShield,
  FiZap,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiCopy,
  FiCheck,
  FiCode,
  FiRefreshCw,
  FiExternalLink,
  FiClock,
  FiInfo,
  FiFileText,
  FiDownload,
  FiSliders,
  FiLock,
  FiServer,
  FiDatabase,
} from "react-icons/fi";

interface HeaderCheckItem {
  id: string;
  name: string;
  requiredForScore: boolean;
  maxPoints: number;
  evaluate: (headers: Record<string, string>) => {
    status: "pass" | "warn" | "fail";
    points: number;
    value: string | null;
    summary: string;
    recommendation?: string;
  };
}

const SECURITY_HEADER_CHECKS: HeaderCheckItem[] = [
  {
    id: "hsts",
    name: "Strict-Transport-Security (HSTS)",
    requiredForScore: true,
    maxPoints: 20,
    evaluate: (h) => {
      const val = h["strict-transport-security"];
      if (!val) {
        return {
          status: "fail",
          points: 0,
          value: null,
          summary: "Missing. Browsers are vulnerable to SSL-stripping and man-in-the-middle attacks.",
          recommendation: "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'",
        };
      }
      const hasSubDomains = /includesubdomains/i.test(val);
      const hasPreload = /preload/i.test(val);
      const maxAgeMatch = val.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;

      if (maxAge >= 31536000 && hasSubDomains) {
        return {
          status: "pass",
          points: 20,
          value: val,
          summary: `Strongly configured (${Math.round(maxAge / 86400)} days, includeSubDomains${hasPreload ? ", preload" : ""}).`,
        };
      }
      return {
        status: "warn",
        points: 12,
        value: val,
        summary: "Present, but max-age should be at least 1 year (31536000s) with includeSubDomains.",
        recommendation: "Increase max-age to 31536000 and append 'includeSubDomains'.",
      };
    },
  },
  {
    id: "csp",
    name: "Content-Security-Policy (CSP)",
    requiredForScore: true,
    maxPoints: 25,
    evaluate: (h) => {
      const val = h["content-security-policy"];
      if (!val) {
        return {
          status: "fail",
          points: 0,
          value: null,
          summary: "Missing. Site is vulnerable to Cross-Site Scripting (XSS) and code injection attacks.",
          recommendation: "Define a Content-Security-Policy restricting script-src, object-src, and default-src.",
        };
      }
      if (/unsafe-inline|unsafe-eval/i.test(val)) {
        return {
          status: "warn",
          points: 15,
          value: val,
          summary: "Present, but contains 'unsafe-inline' or 'unsafe-eval' which weakens XSS defense.",
          recommendation: "Use cryptographic nonces or SHA hashes instead of 'unsafe-inline'.",
        };
      }
      return {
        status: "pass",
        points: 25,
        value: val,
        summary: "Excellent. Strict policy configured to mitigate XSS and unauthorized resource loading.",
      };
    },
  },
  {
    id: "xfo",
    name: "X-Frame-Options",
    requiredForScore: true,
    maxPoints: 15,
    evaluate: (h) => {
      const val = h["x-frame-options"] || (h["content-security-policy"] && /frame-ancestors/i.test(h["content-security-policy"]) ? "frame-ancestors (CSP)" : null);
      if (!val) {
        return {
          status: "fail",
          points: 0,
          value: null,
          summary: "Missing. Webpage can be embedded into malicious iframes (Clickjacking risk).",
          recommendation: "Add 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN'.",
        };
      }
      const upper = val.toUpperCase();
      if (upper.includes("DENY") || upper.includes("SAMEORIGIN") || val.includes("frame-ancestors")) {
        return {
          status: "pass",
          points: 15,
          value: val,
          summary: `Protected against Clickjacking (${val}).`,
        };
      }
      return {
        status: "warn",
        points: 8,
        value: val,
        summary: "X-Frame-Options present with non-standard directive.",
      };
    },
  },
  {
    id: "xcto",
    name: "X-Content-Type-Options",
    requiredForScore: true,
    maxPoints: 15,
    evaluate: (h) => {
      const val = h["x-content-type-options"];
      if (!val) {
        return {
          status: "fail",
          points: 0,
          value: null,
          summary: "Missing. Browsers may MIME-sniff response content away from declared Content-Type.",
          recommendation: "Add 'X-Content-Type-Options: nosniff'.",
        };
      }
      if (/nosniff/i.test(val)) {
        return {
          status: "pass",
          points: 15,
          value: val,
          summary: "MIME sniffing disabled ('nosniff').",
        };
      }
      return {
        status: "warn",
        points: 6,
        value: val,
        summary: "Configured without 'nosniff'.",
      };
    },
  },
  {
    id: "referrer",
    name: "Referrer-Policy",
    requiredForScore: true,
    maxPoints: 15,
    evaluate: (h) => {
      const val = h["referrer-policy"];
      if (!val) {
        return {
          status: "warn",
          points: 5,
          value: null,
          summary: "Missing. Browsers default to their standard referrer policy.",
          recommendation: "Set 'Referrer-Policy: strict-origin-when-cross-origin'.",
        };
      }
      if (/strict-origin-when-cross-origin|no-referrer|same-origin/i.test(val)) {
        return {
          status: "pass",
          points: 15,
          value: val,
          summary: `Strong privacy policy configured (${val}).`,
        };
      }
      return {
        status: "warn",
        points: 8,
        value: val,
        summary: `Configured as '${val}'.`,
      };
    },
  },
  {
    id: "permissions",
    name: "Permissions-Policy",
    requiredForScore: true,
    maxPoints: 10,
    evaluate: (h) => {
      const val = h["permissions-policy"] || h["feature-policy"];
      if (!val) {
        return {
          status: "warn",
          points: 2,
          value: null,
          summary: "Missing. Browser hardware features (camera, microphone, geolocation) not explicitly locked down.",
          recommendation: "Add 'Permissions-Policy: camera=(), microphone=(), geolocation=()'.",
        };
      }
      return {
        status: "pass",
        points: 10,
        value: val,
        summary: "Hardware and browser features explicitly controlled.",
      };
    },
  },
];

// Sample Presets for instantaneous testing
const PRESET_GITHUB = {
  name: "GitHub (Grade A+)",
  url: "https://github.com",
  headers: {
    "server": "GitHub.com",
    "date": "Sun, 25 Oct 2026 15:40:00 GMT",
    "content-type": "text/html; charset=utf-8",
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "content-security-policy": "default-src 'none'; base-uri 'self'; child-src github.com; connect-src 'self' uploads.github.com; font-src github.githubassets.com; form-action 'self' github.com; frame-ancestors 'none'; img-src 'self' data: github.githubassets.com; script-src 'self' github.githubassets.com; style-src 'unsafe-inline' github.githubassets.com",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "origin-when-cross-origin, strict-origin-when-cross-origin",
    "permissions-policy": "geolocation=(), microphone=(), camera=()",
    "cache-control": "max-age=0, private, must-revalidate",
    "etag": 'W/"7b82f0c78a9d123456"',
    "vary": "X-PJAX, Accept-Encoding, Accept",
    "x-xss-protection": "0",
  },
  statusCode: 200,
  statusText: "OK",
  responseTimeMs: 98,
};

const PRESET_INSECURE = {
  name: "Legacy Insecure Server (Grade F)",
  url: "http://legacy-sample.test",
  headers: {
    "server": "Apache/2.2.14 (Ubuntu) PHP/5.2.10",
    "x-powered-by": "PHP/5.2.10",
    "date": "Sun, 25 Oct 2026 15:40:00 GMT",
    "content-type": "text/html",
    "cache-control": "public, max-age=86400",
    "last-modified": "Wed, 15 Jan 2025 12:00:00 GMT",
  },
  statusCode: 200,
  statusText: "OK",
  responseTimeMs: 240,
};

export default function HttpHeadersAnalyzerTool() {
  const [activeTab, setActiveTab] = useState<"audit" | "raw" | "config">("audit");
  const [urlInput, setUrlInput] = useState<string>("https://github.com");
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<{
    url: string;
    statusCode: number;
    statusText: string;
    responseTimeMs: number;
    headers: Record<string, string>;
  }>(PRESET_GITHUB);

  // Raw text input for Manual Paste Tab
  const [rawHeadersText, setRawHeadersText] = useState<string>("");
  const [searchHeaderFilter, setSearchHeaderFilter] = useState<string>("");
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [configFormat, setConfigFormat] = useState<"nginx" | "apache" | "vercel" | "nextjs">("nginx");

  // Fetch URL headers via our server route
  const handleAnalyzeUrl = async (targetUrl?: string) => {
    const url = (targetUrl || urlInput).trim();
    if (!url) {
      toast.error("Please enter a valid website URL", "Missing URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to analyze headers for this URL");
      }

      setAnalysisData({
        url: json.url,
        statusCode: json.statusCode,
        statusText: json.statusText,
        responseTimeMs: json.responseTimeMs,
        headers: json.headers,
      });

      toast.success(`Successfully retrieved headers for ${json.url}!`, "Headers Retrieved");
    } catch (err: any) {
      toast.error(
        err.message || "Could not fetch headers. Check URL or try Paste Raw Headers mode.",
        "Analysis Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Parse raw text headers
  const handleParseRawText = () => {
    if (!rawHeadersText.trim()) {
      toast.error("Please paste HTTP headers first", "Empty");
      return;
    }

    const lines = rawHeadersText.split(/\r?\n/);
    const parsed: Record<string, string> = {};
    let status = 200;
    let statusText = "OK";

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (/^HTTP\/\d/i.test(trimmed)) {
        const parts = trimmed.split(" ");
        if (parts.length >= 2) {
          status = parseInt(parts[1], 10) || 200;
          statusText = parts.slice(2).join(" ") || "OK";
        }
        return;
      }

      const colonIdx = trimmed.indexOf(":");
      if (colonIdx > 0) {
        const key = trimmed.substring(0, colonIdx).trim().toLowerCase();
        const value = trimmed.substring(colonIdx + 1).trim();
        parsed[key] = value;
      }
    });

    setAnalysisData({
      url: "Raw Pasted Headers",
      statusCode: status,
      statusText,
      responseTimeMs: 0,
      headers: parsed,
    });

    setActiveTab("audit");
    toast.success(`Parsed ${Object.keys(parsed).length} headers!`, "Loaded");
  };

  // Compute Overall Security Score & Breakdown
  const scoreReport = useMemo(() => {
    const headers = analysisData.headers;
    let earnedPoints = 0;
    let maxPoints = 0;

    const checks = SECURITY_HEADER_CHECKS.map((check) => {
      const result = check.evaluate(headers);
      earnedPoints += result.points;
      maxPoints += check.maxPoints;
      return {
        ...check,
        result,
      };
    });

    // Penalize information disclosure
    let penalty = 0;
    const serverVal = headers["server"];
    const poweredBy = headers["x-powered-by"];
    if (serverVal && /\d+\.\d+/.test(serverVal)) {
      penalty += 5; // e.g. Apache/2.4.41 leaks version
    }
    if (poweredBy) {
      penalty += 5; // e.g. Express, PHP/7.4
    }

    const finalScore = Math.max(0, Math.min(100, Math.round((earnedPoints / maxPoints) * 100) - penalty));

    let grade = "F";
    let gradeColor = "#ef4444";
    let gradeDesc = "Critically Vulnerable. Missing multiple core security headers.";

    if (finalScore >= 95) {
      grade = "A+";
      gradeColor = "#10b981";
      gradeDesc = "Outstanding. Comprehensive protection against XSS, clickjacking, and MITM.";
    } else if (finalScore >= 85) {
      grade = "A";
      gradeColor = "#22c55e";
      gradeDesc = "Excellent security posture. Well-hardened headers.";
    } else if (finalScore >= 70) {
      grade = "B";
      gradeColor = "#3b82f6";
      gradeDesc = "Good protection, but minor security enhancements recommended.";
    } else if (finalScore >= 50) {
      grade = "C";
      gradeColor = "#f59e0b";
      gradeDesc = "Moderate risk. Missing important defenses like CSP or HSTS.";
    } else if (finalScore >= 30) {
      grade = "D";
      gradeColor = "#f97316";
      gradeDesc = "High risk. Key security headers absent.";
    }

    return {
      finalScore,
      grade,
      gradeColor,
      gradeDesc,
      checks,
      penalty,
      serverVal,
      poweredBy,
    };
  }, [analysisData]);

  // Caching & CDN Analysis
  const cacheReport = useMemo(() => {
    const h = analysisData.headers;
    const cacheControl = h["cache-control"] || null;
    const etag = h["etag"] || null;
    const lastModified = h["last-modified"] || null;
    const expires = h["expires"] || null;
    const age = h["age"] || null;
    const cdnCache = h["cf-cache-status"] || h["x-cache"] || h["x-vercel-cache"] || h["fastly-debug-digest"] || null;
    const vary = h["vary"] || null;

    let isPublic = false;
    let isPrivate = false;
    let isNoCache = false;
    let maxAgeSec: number | null = null;

    if (cacheControl) {
      isPublic = /public/i.test(cacheControl);
      isPrivate = /private/i.test(cacheControl);
      isNoCache = /no-cache|no-store/i.test(cacheControl);
      const match = cacheControl.match(/max-age=(\d+)/i);
      if (match) maxAgeSec = parseInt(match[1], 10);
    }

    return {
      cacheControl,
      etag,
      lastModified,
      expires,
      age,
      cdnCache,
      vary,
      isPublic,
      isPrivate,
      isNoCache,
      maxAgeSec,
    };
  }, [analysisData]);

  // Filtered raw headers table
  const allHeadersList = useMemo(() => {
    const list = Object.entries(analysisData.headers).map(([key, value]) => ({
      key,
      value,
    }));
    if (!searchHeaderFilter.trim()) return list;
    const q = searchHeaderFilter.toLowerCase().trim();
    return list.filter((item) => item.key.includes(q) || item.value.toLowerCase().includes(q));
  }, [analysisData, searchHeaderFilter]);

  // Generate Web Server Configs
  const generatedConfig = useMemo(() => {
    switch (configFormat) {
      case "nginx":
        return `# Nginx Security & Caching Headers Configuration
# Add inside your server {} or location {} block:

add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Static Assets Caching
location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
}`;

      case "apache":
        return `# Apache (.htaccess) Security & Caching Headers
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
    Header always set Content-Security-Policy "default-src 'self'; img-src 'self' data: https:;"

    # Cache-Control for Static Assets
    <FilesMatch "\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>`;

      case "vercel":
        return `// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}`;

      case "nextjs":
        return `// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
        ],
      },
    ];
  },
};`;
    }
  }, [configFormat]);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopiedConfig(true);
    toast.success(`Copied ${configFormat.toUpperCase()} configuration!`, "Copied");
    setTimeout(() => setCopiedConfig(false), 2000);
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
        <FiShield />
        <p>
          Audit your website’s HTTP security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy)
          and cache directives (Cache-Control, ETag, CDN status). Get an A+ security rating and
          generate ready-to-paste server configurations.
        </p>
      </div>

      {/* ── Top URL Input & Mode Bar ──────────────────────────────────── */}
      <div
        style={{
          background: "#1e293b",
          borderRadius: 16,
          border: "1px solid #334155",
          padding: 20,
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              minWidth: 260,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <FiServer style={{ color: "#64748b" }} />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyzeUrl()}
              placeholder="Enter URL to analyze (e.g. https://yourdomain.com)"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f8fafc",
                fontSize: 14,
                width: "100%",
              }}
            />
          </div>

          <button
            onClick={() => handleAnalyzeUrl()}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
              transition: "all 0.2s ease",
            }}
          >
            {loading ? <FiRefreshCw className="spin-animate" /> : <FiSearch />}
            {loading ? "Inspecting..." : "Analyze Headers"}
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Try instant presets:</span>
          <button
            onClick={() => {
              setUrlInput(PRESET_GITHUB.url);
              setAnalysisData(PRESET_GITHUB);
              toast.info("Loaded GitHub headers (Grade A+)", "Preset Loaded");
            }}
            style={presetBtnStyle}
          >
            GitHub (Grade A+)
          </button>
          <button
            onClick={() => {
              setUrlInput(PRESET_INSECURE.url);
              setAnalysisData(PRESET_INSECURE);
              toast.info("Loaded Insecure Sample (Grade F)", "Preset Loaded");
            }}
            style={presetBtnStyle}
          >
            Insecure Server (Grade F)
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 20,
          marginBottom: 20,
          borderBottom: "1px solid #334155",
          paddingBottom: 10,
        }}
      >
        <button
          onClick={() => setActiveTab("audit")}
          style={getSubNavStyle(activeTab === "audit")}
        >
          <FiShield /> Security &amp; Cache Audit
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          style={getSubNavStyle(activeTab === "raw")}
        >
          <FiFileText /> Raw Headers ({allHeadersList.length}) / Paste Mode
        </button>
        <button
          onClick={() => setActiveTab("config")}
          style={getSubNavStyle(activeTab === "config")}
        >
          <FiCode /> Server Config Generator
        </button>
      </div>

      {/* ── TAB 1: AUDIT VIEW ─────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Score Banner Card */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              padding: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              alignItems: "center",
            }}
          >
            {/* Grade Circle & Score */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: `linear-gradient(135deg, ${scoreReport.gradeColor}22, ${scoreReport.gradeColor}44)`,
                  border: `2px solid ${scoreReport.gradeColor}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 8px 24px ${scoreReport.gradeColor}33`,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: scoreReport.gradeColor,
                    lineHeight: 1,
                  }}
                >
                  {scoreReport.grade}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", marginTop: 2 }}>
                  {scoreReport.finalScore}/100
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#f8fafc",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Security Rating: Grade {scoreReport.grade}
                </span>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.4 }}>
                  {scoreReport.gradeDesc}
                </p>
              </div>
            </div>

            {/* Target URL Details */}
            <div
              style={{
                background: "#0f172a",
                borderRadius: 12,
                border: "1px solid #334155",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>Target URL:</span>
                <span style={{ color: "#f8fafc", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                  {analysisData.url}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#94a3b8" }}>HTTP Status:</span>
                <span
                  style={{
                    color: analysisData.statusCode < 400 ? "#34d399" : "#ef4444",
                    fontWeight: 700,
                  }}
                >
                  {analysisData.statusCode} {analysisData.statusText}
                </span>
              </div>
              {analysisData.responseTimeMs > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#94a3b8" }}>Response Latency:</span>
                  <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                    {analysisData.responseTimeMs} ms
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Core Security Headers Checklist */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
                Core Security Headers Evaluation
              </h3>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {scoreReport.checks.filter((c) => c.result.status === "pass").length} /{" "}
                {scoreReport.checks.length} Implemented
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {scoreReport.checks.map((item) => {
                const res = item.result;
                const isPass = res.status === "pass";
                const isWarn = res.status === "warn";

                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#0f172a",
                      border: `1px solid ${
                        isPass ? "#10b98133" : isWarn ? "#f59e0b33" : "#ef444433"
                      }`,
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {isPass ? (
                          <FiCheckCircle style={{ color: "#10b981", fontSize: 18 }} />
                        ) : isWarn ? (
                          <FiAlertTriangle style={{ color: "#f59e0b", fontSize: 18 }} />
                        ) : (
                          <FiXCircle style={{ color: "#ef4444", fontSize: 18 }} />
                        )}
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                          {item.name}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 999,
                          color: isPass ? "#34d399" : isWarn ? "#fbbf24" : "#f87171",
                          background: isPass
                            ? "rgba(16, 185, 129, 0.15)"
                            : isWarn
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                        }}
                      >
                        {isPass ? "SECURE" : isWarn ? "WARNING" : "MISSING"} ({res.points} /{" "}
                        {item.maxPoints} pts)
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: 13, color: "#cbd5e1", lineHeight: 1.4 }}>
                      {res.summary}
                    </p>

                    {res.value && (
                      <div
                        style={{
                          padding: "6px 10px",
                          background: "#090d16",
                          borderRadius: 6,
                          fontSize: 11,
                          fontFamily: "monospace",
                          color: "#38bdf8",
                          overflowX: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {res.value}
                      </div>
                    )}

                    {res.recommendation && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#94a3b8",
                          background: "rgba(30, 41, 59, 0.5)",
                          padding: "6px 10px",
                          borderRadius: 6,
                        }}
                      >
                        <strong style={{ color: "#e2e8f0" }}>Recommendation:</strong>{" "}
                        {res.recommendation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caching & CDN Directives Audit */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
              HTTP Caching &amp; CDN Directives
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <div style={cacheCardStyle}>
                <span style={cacheLabelStyle}>Cache-Control</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: cacheReport.cacheControl ? "#34d399" : "#f87171" }}>
                  {cacheReport.cacheControl || "Not Defined"}
                </span>
                {cacheReport.maxAgeSec !== null && (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    Max Age: {cacheReport.maxAgeSec} seconds (~{Math.round(cacheReport.maxAgeSec / 3600)}h)
                  </span>
                )}
              </div>

              <div style={cacheCardStyle}>
                <span style={cacheLabelStyle}>ETag Validation</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: cacheReport.etag ? "#38bdf8" : "#94a3b8" }}>
                  {cacheReport.etag || "Not Present"}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {cacheReport.etag ? "Supports HTTP 304 Not Modified" : "Conditional requests disabled"}
                </span>
              </div>

              <div style={cacheCardStyle}>
                <span style={cacheLabelStyle}>CDN Edge Cache Status</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: cacheReport.cdnCache ? "#38bdf8" : "#94a3b8" }}>
                  {cacheReport.cdnCache || "No CDN Headers Detected"}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {cacheReport.cdnCache ? "Cached via CDN Edge" : "Direct origin response"}
                </span>
              </div>

              <div style={cacheCardStyle}>
                <span style={cacheLabelStyle}>Server Fingerprint Leak</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: scoreReport.serverVal || scoreReport.poweredBy ? "#f59e0b" : "#34d399",
                  }}
                >
                  {scoreReport.serverVal || scoreReport.poweredBy
                    ? `${scoreReport.serverVal || ""} ${scoreReport.poweredBy ? `(${scoreReport.poweredBy})` : ""}`
                    : "Hidden (Protected)"}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  {scoreReport.serverVal ? "Exposes software version" : "Zero server leak"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RAW HEADERS & MANUAL PASTE ──────────────────────────── */}
      {activeTab === "raw" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Manual Headers Paste Box */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
                Paste Raw HTTP Response Headers (from cURL or DevTools)
              </span>
              <button
                onClick={handleParseRawText}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FiZap /> Parse &amp; Audit Headers
              </button>
            </div>

            <textarea
              rows={6}
              value={rawHeadersText}
              onChange={(e) => setRawHeadersText(e.target.value)}
              placeholder={`HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Cache-Control: public, max-age=3600`}
              style={{
                width: "100%",
                padding: 14,
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 10,
                color: "#e2e8f0",
                fontSize: 13,
                fontFamily: "monospace",
                outline: "none",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Raw Headers Table */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
                All Response Headers ({allHeadersList.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "6px 12px",
                  minWidth: 200,
                }}
              >
                <FiSearch style={{ color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Filter headers..."
                  value={searchHeaderFilter}
                  onChange={(e) => setSearchHeaderFilter(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#f8fafc",
                    fontSize: 12,
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                border: "1px solid #334155",
                borderRadius: 10,
                overflow: "hidden",
                background: "#0f172a",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8", width: 220 }}>
                      Header Key
                    </th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#94a3b8" }}>
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allHeadersList.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid #1e293b",
                        background: idx % 2 === 0 ? "transparent" : "rgba(30, 41, 59, 0.4)",
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 14px",
                          fontWeight: 700,
                          color: "#38bdf8",
                          fontFamily: "monospace",
                          verticalAlign: "top",
                        }}
                      >
                        {item.key}
                      </td>
                      <td
                        style={{
                          padding: "10px 14px",
                          color: "#e2e8f0",
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SERVER CONFIG GENERATOR ────────────────────────────── */}
      {activeTab === "config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              border: "1px solid #334155",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Format Selector Pills */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["nginx", "apache", "vercel", "nextjs"] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setConfigFormat(fmt)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: configFormat === fmt ? 700 : 500,
                      background: configFormat === fmt ? "#2563eb" : "#0f172a",
                      color: configFormat === fmt ? "#fff" : "#94a3b8",
                      border: "1px solid #334155",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {fmt === "nextjs" ? "Next.js" : fmt === "apache" ? "Apache (.htaccess)" : fmt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyConfig}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: copiedConfig ? "#10b981" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {copiedConfig ? <FiCheck /> : <FiCopy />}
                {copiedConfig ? "Copied Config!" : "Copy Configuration"}
              </button>
            </div>

            {/* Code Block Container */}
            <div
              style={{
                background: "#090d16",
                borderRadius: 12,
                border: "1px solid #1e293b",
                overflow: "hidden",
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: 18,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#e2e8f0",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                <code>{generatedConfig}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Shared Inline Styles ───────────────────────────────────────────────────
const getSubNavStyle = (isActive: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 16px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: isActive ? 700 : 500,
  color: isActive ? "#ffffff" : "#94a3b8",
  background: isActive ? "rgba(37, 99, 235, 0.2)" : "transparent",
  border: isActive ? "1px solid #3b82f6" : "1px solid transparent",
  cursor: "pointer",
  transition: "all 0.15s ease",
});

const presetBtnStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 6,
  padding: "4px 10px",
  color: "#cbd5e1",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
};

const cacheCardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const cacheLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
