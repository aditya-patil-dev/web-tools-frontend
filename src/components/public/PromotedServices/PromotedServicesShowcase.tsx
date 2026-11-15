"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLink from "@/components/common/AppLink";
import {
  LuSparkles,
  LuSearch,
  LuImage,
  LuFileText,
  LuCode,
  LuSmartphone,
  LuArrowRight,
  LuShieldCheck,
  LuZap,
  LuTrendingUp,
  LuCopy,
  LuCheck,
  LuLayers,
} from "react-icons/lu";

type PromotedServiceKey = "keyword" | "ai-image" | "pdf" | "dev" | "creator";

interface PromotedService {
  id: PromotedServiceKey;
  label: string;
  shortTag: string;
  icon: React.ReactNode;
  badge: string;
  badgeClass: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  stats: { value: string; label: string }[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

const PROMOTED_SERVICES: PromotedService[] = [
  {
    id: "keyword",
    label: "Keyword Research",
    shortTag: "Flagship SEO",
    icon: <LuSearch size={15} />,
    badge: "FLAGSHIP SUITE",
    badgeClass: "promo-badge-hot",
    title: "Keyword Research & Search Intent Analyzer",
    tagline: "Uncover High-Volume Keywords Before Your Competitors Do",
    description:
      "Scrape real-time Google search suggestions, question queries, and search intent clusters in under 1 second. Built for SEO professionals and content creators who need unlimited keyword insights with zero daily quotas.",
    highlights: [
      "Real-time Google Autocomplete query cluster extractor",
      "Automatic Informational, Commercial & Transactional intent scoring",
      "Unlimited queries with one-click clean CSV data export",
      "Keyword difficulty (KD%) and volume projections",
    ],
    stats: [
      { value: "250K+", label: "Keyword Pool" },
      { value: "0.3s", label: "Query Speed" },
      { value: "100%", label: "Free Forever" },
    ],
    primaryCta: {
      label: "Launch Keyword Research",
      href: "/keyword-research",
    },
    secondaryCta: {
      label: "Explore All SEO Tools →",
      href: "/tools/seo-tools",
    },
  },
  {
    id: "ai-image",
    label: "AI Image Studio",
    shortTag: "Client-Side AI",
    icon: <LuSparkles size={15} />,
    badge: "100% PRIVATE AI",
    badgeClass: "promo-badge-ai",
    title: "AI Background Remover & Image Optimizer",
    tagline: "Instant Neural Cutouts Without Uploading Files to Clouds",
    description:
      "Run state-of-the-art neural-network background removal and batch image compression directly in your browser. All image processing executes locally in device RAM using WebAssembly — your private photos never leave your device.",
    highlights: [
      "Ultra-crisp alpha edge cutouts with hair and fur detection",
      "Batch compress JPG, PNG, and WebP up to 85% size reduction",
      "Zero server uploads: 100% private in-browser execution",
      "High-resolution 4K transparent PNG downloads with no watermarks",
    ],
    stats: [
      { value: "-85%", label: "Avg Size Cut" },
      { value: "0.8s", label: "WASM Speed" },
      { value: "0 MB", label: "Cloud Uploads" },
    ],
    primaryCta: {
      label: "Try AI Background Remover",
      href: "/tools/image-tools/background-remover",
    },
    secondaryCta: {
      label: "Explore All Image Tools →",
      href: "/tools/image-tools",
    },
  },
  {
    id: "pdf",
    label: "PDF PowerHub",
    shortTag: "Document Suite",
    icon: <LuFileText size={15} />,
    badge: "WASM DOCUMENT HUB",
    badgeClass: "promo-badge-emerald",
    title: "PDF to Word, Merge & Document Converters",
    tagline: "Convert & Merge Confidential Documents With Bank-Grade Privacy",
    description:
      "Transform locked PDF contracts into fully editable Word (.docx) files, merge hundreds of invoice pages, and compress heavy documents for email. Fast client-side conversion ensures your sensitive documents remain strictly on your machine.",
    highlights: [
      "Preserves fonts, multi-column tables & complex formatting in Word (.docx)",
      "Combine and reorder unlimited PDFs in one continuous workflow",
      "No page limits, no email gates, and zero promotional watermarks",
      "Batch convert JPG images to standardized multi-page PDF documents",
    ],
    stats: [
      { value: "DOCX", label: "Editable Output" },
      { value: "Batch", label: "Multi-File" },
      { value: "Zero", label: "Watermarks" },
    ],
    primaryCta: {
      label: "Convert PDF to Word",
      href: "/tools/pdf-tools/pdf-to-word-converter",
    },
    secondaryCta: {
      label: "Explore All PDF Tools →",
      href: "/tools/pdf-tools",
    },
  },
  {
    id: "dev",
    label: "Dev Utilities",
    shortTag: "Zero Latency",
    icon: <LuCode size={15} />,
    badge: "ENGINEER TOOLKIT",
    badgeClass: "promo-badge-amber",
    title: "JSON Formatter, HTTP Headers & QR Studio",
    tagline: "Instant Client-Side Utilities for Developers & DevOps",
    description:
      "Format and validate large nested JSON trees, generate SVG vector QR codes with customizable brand colors, and audit your production website's HTTP security response headers for HSTS, CSP, and X-Frame security best practices.",
    highlights: [
      "Interactive collapsible JSON tree view with syntax error highlighting",
      "Vector SVG and high-resolution PNG QR codes with error-correction levels",
      "Production HTTP security header analyzer with A+ grading recommendations",
      "Instant Base64 image encoding/decoding and case transformations",
    ],
    stats: [
      { value: "0ms", label: "Zero Latency" },
      { value: "SVG/PNG", label: "Vector QR" },
      { value: "A+", label: "Security Audit" },
    ],
    primaryCta: {
      label: "Launch JSON Formatter",
      href: "/tools/developer-tools/json-formatter",
    },
    secondaryCta: {
      label: "Explore All Dev Tools →",
      href: "/tools/developer-tools",
    },
  },
  {
    id: "creator",
    label: "Creator Mockups",
    shortTag: "Visual Studio",
    icon: <LuSmartphone size={15} />,
    badge: "CREATOR SUITE",
    badgeClass: "promo-badge-cyan",
    title: "Device Mockup Generator & Meme Creator",
    tagline: "Transform Raw Screenshots Into High-Converting 4K Assets",
    description:
      "Frame your app screenshots into ultra-clean Apple iPhone, MacBook, and Chrome browser viewports with realistic shadows and gradient studio backdrops. Create viral memes with custom text overlays ready for Twitter and LinkedIn.",
    highlights: [
      "Realistic iPhone 16 Pro, MacBook Pro, and Browser canvas frames",
      "Custom studio gradient lighting, corner radius, and drop shadow controls",
      "Viral meme generator with classic top/bottom captions and bold typography",
      "One-click 4K high-res export with transparent alpha background support",
    ],
    stats: [
      { value: "4K Res", label: "Studio Quality" },
      { value: "Instant", label: "No Signup" },
      { value: "PNG", label: "Alpha Cutout" },
    ],
    primaryCta: {
      label: "Create Device Mockup",
      href: "/tools/image-tools/screenshot-device-mockup-generator",
    },
    secondaryCta: {
      label: "Launch Meme Generator →",
      href: "/tools/image-tools/meme-generator",
    },
  },
];

export default function PromotedServicesShowcase() {
  const [activeKey, setActiveKey] = useState<PromotedServiceKey>("keyword");
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Sample state for Keyword live demo
  const [demoQuery, setDemoQuery] = useState("nextjs seo");
  const [mockupDevice, setMockupDevice] = useState<"iphone" | "macbook" | "browser">("iphone");

  const currentService = PROMOTED_SERVICES.find((s) => s.id === activeKey) || PROMOTED_SERVICES[0];

  // Optional subtle auto-rotation timer (8 seconds) - pauses permanently on click or hover
  useEffect(() => {
    if (isAutoPaused) return;

    const timer = setInterval(() => {
      setActiveKey((prev) => {
        const currentIndex = PROMOTED_SERVICES.findIndex((s) => s.id === prev);
        const nextIndex = (currentIndex + 1) % PROMOTED_SERVICES.length;
        return PROMOTED_SERVICES[nextIndex].id;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, [isAutoPaused]);

  const handleSelectService = (id: PromotedServiceKey) => {
    setActiveKey(id);
    setIsAutoPaused(true); // User interacted, disable auto-rotation
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`{\n  "status": "success",\n  "tool": "FusionTools JSON",\n  "cached": true,\n  "speed": "0.1ms"\n}`);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <section
      className="promoted-services-section"
      onMouseEnter={() => setIsAutoPaused(true)}
      aria-label="Promoted Services and Flagship Tools"
    >
      <div className="promoted-services-container">
        {/* Section Header */}
        <div className="promoted-header">
          <h2 className="promoted-title">
            <span>All In One Private Platform</span>
          </h2>
          <p className="promoted-subtitle">
            Switch between our specialized suites below. Zero accounts, zero uploads to external servers, and instant browser execution.
          </p>
        </div>

        {/* ── 1. The Interactive "Non-Carousel" Switcher Rail ── */}
        <div className="promoted-switcher-rail" role="tablist">
          {PROMOTED_SERVICES.map((service) => {
            const isActive = service.id === activeKey;
            return (
              <button
                key={service.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectService(service.id)}
                className={`promoted-tab-btn ${isActive ? "active" : ""}`}
              >
                <div className="promoted-tab-icon-wrap">
                  {service.icon}
                </div>
                <div className="promoted-tab-text-wrap">
                  <span className="promoted-tab-label">{service.label}</span>
                  <span className="promoted-tab-tag">{service.shortTag}</span>
                </div>
                {isActive && <div className="promoted-active-indicator" />}
              </button>
            );
          })}
        </div>

        {/* ── 2. The Grand Stage: Active Promoted Showcase ── */}
        <div className="promoted-stage-card">
          <div className="promoted-stage-grid">
            {/* Left Column: The Pitch, Value, Features, and Launch CTAs */}
            <div className="promoted-content-col">
              <div className="promoted-card-top-row">
                <span className={`promoted-status-badge ${currentService.badgeClass}`}>
                  {currentService.badge}
                </span>
                <span className="promoted-privacy-note">
                  <LuShieldCheck size={14} style={{ color: "#10b981" }} />
                  <span>Client-Side Privacy</span>
                </span>
              </div>

              <h3 className="promoted-service-title">{currentService.title}</h3>
              <div className="promoted-service-tagline">{currentService.tagline}</div>
              <p className="promoted-service-desc">{currentService.description}</p>

              {/* Feature Highlights Checklist */}
              <div className="promoted-checklist">
                {currentService.highlights.map((highlight, idx) => (
                  <div key={idx} className="promoted-check-item">
                    <LuCheck size={14} className="check-icon" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Stat Boxes */}
              <div className="promoted-stats-row">
                {currentService.stats.map((stat, idx) => (
                  <div key={idx} className="promoted-stat-card">
                    <div className="promoted-stat-number">{stat.value}</div>
                    <div className="promoted-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="promoted-actions-row">
                <AppLink
                  href={currentService.primaryCta.href}
                  className="promoted-primary-btn"
                >
                  <span>{currentService.primaryCta.label}</span>
                  <LuArrowRight size={15} />
                </AppLink>
                <AppLink
                  href={currentService.secondaryCta.href}
                  className="promoted-secondary-link"
                >
                  <span>{currentService.secondaryCta.label}</span>
                </AppLink>
              </div>
            </div>

            {/* Right Column: Live Interactive Tool Preview Widget */}
            <div className="promoted-preview-col">
              <div className="promoted-preview-window">
                {/* Window Header */}
                <div className="promoted-window-bar">
                  <div className="promoted-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <span className="promoted-window-title">
                    {activeKey === "keyword" && "Keyword Research Engine · Live Simulator"}
                    {activeKey === "ai-image" && "AI Background Removal · Local WASM"}
                    {activeKey === "pdf" && "PDF Document Converter · Bank-Grade Memory"}
                    {activeKey === "dev" && "Developer Code Studio · Instant Syntax"}
                    {activeKey === "creator" && "Device Mockup Studio · 4K Canvas"}
                  </span>
                  <span className="promoted-live-tag">Live Preview</span>
                </div>

                {/* ── Demo 1: Keyword Research Live Mini-Inspector ── */}
                {activeKey === "keyword" && (
                  <div className="demo-body demo-keyword-body">
                    <div className="demo-keyword-search-box">
                      <LuSearch size={16} className="demo-search-icon" />
                      <input
                        type="text"
                        value={demoQuery}
                        onChange={(e) => setDemoQuery(e.target.value)}
                        placeholder="Type any keyword (e.g. nextjs seo)..."
                        className="demo-keyword-input"
                      />
                      <span className="demo-badge-pill">Live Cluster</span>
                    </div>

                    <div className="demo-keyword-quick-tags">
                      <span className="quick-tag-label">Try:</span>
                      {["nextjs seo", "free background remover", "merge pdf online"].map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => setDemoQuery(kw)}
                          className={`demo-quick-tag-btn ${demoQuery === kw ? "active" : ""}`}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>

                    <div className="demo-keyword-results-table">
                      <div className="demo-kw-row header">
                        <span>Keyword Query</span>
                        <span>Intent</span>
                        <span>Difficulty</span>
                        <span>Est. Vol</span>
                      </div>
                      <div className="demo-kw-row">
                        <span className="kw-text"><strong>{demoQuery}</strong> tutorial</span>
                        <span className="intent-badge intent-info">Info</span>
                        <span className="kd-badge kd-easy">24 (Low)</span>
                        <span className="vol-text">14.2K</span>
                      </div>
                      <div className="demo-kw-row">
                        <span className="kw-text">best <strong>{demoQuery}</strong> tools</span>
                        <span className="intent-badge intent-comm">Commercial</span>
                        <span className="kd-badge kd-med">48 (Med)</span>
                        <span className="vol-text">8.9K</span>
                      </div>
                      <div className="demo-kw-row">
                        <span className="kw-text">how to use <strong>{demoQuery}</strong></span>
                        <span className="intent-badge intent-info">Question</span>
                        <span className="kd-badge kd-easy">18 (Easy)</span>
                        <span className="vol-text">6.1K</span>
                      </div>
                    </div>

                    <div className="demo-footer-strip">
                      <span>✓ 100% Free · Google Autocomplete Clustering · No Limits</span>
                    </div>
                  </div>
                )}

                {/* ── Demo 2: AI Background Remover Before/After Studio ── */}
                {activeKey === "ai-image" && (
                  <div className="demo-body demo-image-body">
                    <div className="demo-image-preview-card">
                      <div className="demo-cutout-checkerboard">
                        <div className="demo-product-mockup">
                          <div className="demo-camera-graphic">
                            <span className="demo-lens" />
                            <span className="demo-flash" />
                          </div>
                          <span className="demo-cutout-label">✓ Transparent Alpha Cutout</span>
                        </div>
                      </div>
                    </div>

                    <div className="demo-image-specs">
                      <div className="demo-spec-box">
                        <span className="spec-label">Input Size:</span>
                        <span className="spec-val">4.2 MB (JPG)</span>
                      </div>
                      <div className="demo-spec-box">
                        <span className="spec-label">Output Size:</span>
                        <span className="spec-val highlight-green">410 KB (-90%)</span>
                      </div>
                      <div className="demo-spec-box">
                        <span className="spec-label">Processing:</span>
                        <span className="spec-val">Local WASM</span>
                      </div>
                    </div>

                    <AppLink
                      href="/tools/image-tools/background-remover"
                      className="demo-interactive-btn"
                    >
                      <LuSparkles size={14} />
                      <span>Upload Photo to Remove Background</span>
                    </AppLink>
                  </div>
                )}

                {/* ── Demo 3: PDF to Word Converter ── */}
                {activeKey === "pdf" && (
                  <div className="demo-body demo-pdf-body">
                    <div className="demo-pdf-flow-box">
                      <div className="demo-doc-icon pdf">
                        <LuFileText size={28} />
                        <span>annual_report.pdf</span>
                        <span className="format-tag">Source PDF</span>
                      </div>

                      <div className="demo-flow-arrow">
                        <LuZap size={18} className="zap-icon" />
                        <span className="flow-text">Browser Memory WASM</span>
                        <LuArrowRight size={18} />
                      </div>

                      <div className="demo-doc-icon docx">
                        <LuFileText size={28} />
                        <span>annual_report.docx</span>
                        <span className="format-tag success">Editable Word</span>
                      </div>
                    </div>

                    <div className="demo-security-banner">
                      <LuShieldCheck size={16} />
                      <span>Zero Uploads: Your sensitive legal documents stay 100% on your device.</span>
                    </div>

                    <AppLink
                      href="/tools/pdf-tools/pdf-to-word-converter"
                      className="demo-interactive-btn"
                    >
                      <LuFileText size={14} />
                      <span>Select PDF File to Convert</span>
                    </AppLink>
                  </div>
                )}

                {/* ── Demo 4: Developer JSON & Headers ── */}
                {activeKey === "dev" && (
                  <div className="demo-body demo-dev-body">
                    <div className="demo-code-header">
                      <span>payload.json</span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="demo-copy-btn"
                      >
                        {copiedSnippet ? <LuCheck size={13} color="#10b981" /> : <LuCopy size={13} />}
                        <span>{copiedSnippet ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>

                    <pre className="demo-code-block">
                      {`{
  "project": "FusionTools",
  "engine": "WebAssembly",
  "security": {
    "hsts": true,
    "csp": "A+",
    "zeroServerUploads": true
  },
  "fast": true
}`}
                    </pre>

                    <div className="demo-code-footer">
                      <span className="json-status">✓ Valid JSON Format</span>
                      <span className="json-size">4 lines · 112 bytes</span>
                    </div>
                  </div>
                )}

                {/* ── Demo 5: Creator Mockup Canvas ── */}
                {activeKey === "creator" && (
                  <div className="demo-body demo-creator-body">
                    {/* Device Switcher */}
                    <div className="demo-device-tabs">
                      <button
                        type="button"
                        onClick={() => setMockupDevice("iphone")}
                        className={`demo-device-btn ${mockupDevice === "iphone" ? "active" : ""}`}
                      >
                        iPhone 16 Pro
                      </button>
                      <button
                        type="button"
                        onClick={() => setMockupDevice("macbook")}
                        className={`demo-device-btn ${mockupDevice === "macbook" ? "active" : ""}`}
                      >
                        MacBook Pro
                      </button>
                      <button
                        type="button"
                        onClick={() => setMockupDevice("browser")}
                        className={`demo-device-btn ${mockupDevice === "browser" ? "active" : ""}`}
                      >
                        Chrome Canvas
                      </button>
                    </div>

                    {/* Canvas Frame */}
                    <div className="demo-mockup-stage">
                      <div className={`demo-mockup-frame ${mockupDevice}`}>
                        <div className="mockup-screen">
                          <div className="mockup-header-bar" />
                          <div className="mockup-content-mock">
                            <span className="mockup-logo-pill">FusionTools</span>
                            <div className="mockup-lines">
                              <div className="mockup-line" style={{ width: "80%" }} />
                              <div className="mockup-line" style={{ width: "60%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <AppLink
                      href="/tools/image-tools/screenshot-device-mockup-generator"
                      className="demo-interactive-btn"
                    >
                      <LuSmartphone size={14} />
                      <span>Wrap Screenshot in Device Frame</span>
                    </AppLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
