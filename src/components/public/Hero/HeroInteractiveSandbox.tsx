"use client";

import React, { useState } from "react";
import AppLink from "@/components/common/AppLink";
import {
  LuFileText,
  LuUpload,
  LuArrowRight,
  LuSparkles,
  LuShieldCheck,
  LuCpu,
  LuZap,
  LuActivity,
} from "react-icons/lu";

export type SandboxScope = "all" | "image" | "pdf" | "seo" | "dev";

interface HeroInteractiveSandboxProps {
  activeScope?: SandboxScope;
  onScopeChange?: (scope: SandboxScope) => void;
}

export default function HeroInteractiveSandbox({
  activeScope = "image",
  onScopeChange,
}: HeroInteractiveSandboxProps) {
  // If "all" is selected on the search console, default the sandbox to "image" (flagship)
  const effectiveTab = activeScope === "all" ? "image" : activeScope;
  const [sampleUrl, setSampleUrl] = useState("mywebsite.com");

  return (
    <div className="sandbox-card">
      {/* ── Connected Interactive Studio Window Header (No duplicate tabs) ── */}
      <div className="sandbox-window-header">
        <div className="sandbox-window-left">
          <div className="sandbox-mac-dots">
            <span className="mac-dot dot-red" />
            <span className="mac-dot dot-yellow" />
            <span className="mac-dot dot-green" />
          </div>
          <span className="sandbox-header-title">
            {effectiveTab === "pdf" && "PDF Hub · In-Browser Processing"}
            {effectiveTab === "seo" && "Technical SEO & SERP Simulator"}
            {effectiveTab === "dev" && "Developer Code & JSON Studio"}
            {effectiveTab === "image" && "Image Studio · Client-Side WASM"}
          </span>
        </div>

        <div className="sandbox-window-right">
          <span className="sandbox-live-pill">
            <span className="live-pulse-dot" />
            <span>Interactive Demo</span>
          </span>
        </div>
      </div>

      {/* Tab Body */}
      <div className="sandbox-body">
        {effectiveTab === "image" && (
          <div className="sandbox-interactive-zone">
            <div className="sandbox-zone-title">
              <h3>Image Studio (Client-Side)</h3>
              <span className="sandbox-badge">
                <LuShieldCheck size={13} />
                <span>Zero Uploads · 100% Private</span>
              </span>
            </div>

            <AppLink href="/tools/image-tools/image-compressor" className="sandbox-dropzone-preview">
              <LuUpload size={32} className="sandbox-drop-icon" />
              <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                Drop image here or click to compress
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                Supports JPG, PNG, WebP up to 50MB
              </p>
            </AppLink>

            <div className="sandbox-stats-strip">
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value" style={{ color: "var(--color-success)" }}>-82%</div>
                <div className="sandbox-stat-label">Avg. Size Cut</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">0.8s</div>
                <div className="sandbox-stat-label">Fast Speed</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">High Res</div>
                <div className="sandbox-stat-label">Quality Kept</div>
              </div>
            </div>

            <div className="sandbox-footer-action">
              <AppLink
                href="/tools/image-tools/background-remover"
                style={{ fontSize: "12.5px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <LuSparkles size={14} color="var(--color-primary)" />
                Try AI Background Remover
              </AppLink>
              <AppLink href="/tools/image-tools/image-compressor" className="sandbox-action-btn">
                Launch Compressor <LuArrowRight size={14} />
              </AppLink>
            </div>
          </div>
        )}

        {effectiveTab === "pdf" && (
          <div className="sandbox-interactive-zone">
            <div className="sandbox-zone-title">
              <h3>PDF Hub & Converters</h3>
              <span className="sandbox-badge">
                <LuCpu size={13} />
                <span>Browser Processing</span>
              </span>
            </div>

            <AppLink href="/tools/pdf-tools/pdf-to-word-converter" className="sandbox-dropzone-preview">
              <LuFileText size={32} className="sandbox-drop-icon" />
              <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>
                Convert PDF to Editable Word (.docx)
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                Preserves fonts, tables & formatting
              </p>
            </AppLink>

            <div className="sandbox-stats-strip">
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">DOCX</div>
                <div className="sandbox-stat-label">Editable Output</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">Batch</div>
                <div className="sandbox-stat-label">Multi-Page</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">Free</div>
                <div className="sandbox-stat-label">No Watermark</div>
              </div>
            </div>

            <div className="sandbox-footer-action">
              <AppLink
                href="/tools/pdf-tools/merge-pdf"
                style={{ fontSize: "12.5px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                Merge Multiple PDFs
              </AppLink>
              <AppLink href="/tools/pdf-tools/pdf-to-word-converter" className="sandbox-action-btn">
                Open PDF to Word <LuArrowRight size={14} />
              </AppLink>
            </div>
          </div>
        )}

        {effectiveTab === "seo" && (
          <div className="sandbox-interactive-zone">
            <div className="sandbox-zone-title">
              <h3>Live Technical SEO Suite</h3>
              <span className="sandbox-badge">
                <LuZap size={13} />
                <span>Instant Audit</span>
              </span>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <input
                type="text"
                value={sampleUrl}
                onChange={(e) => setSampleUrl(e.target.value)}
                placeholder="domain.com"
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-primary)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
              <AppLink
                href={`/tools/seo-tools/google-serp-snippet-simulator?site=${encodeURIComponent(sampleUrl)}`}
                className="sandbox-action-btn"
                style={{ padding: "8px 14px", fontSize: "12px" }}
              >
                Simulate
              </AppLink>
            </div>

            <div className="sandbox-stats-strip">
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">SERP</div>
                <div className="sandbox-stat-label">Google Snippet</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">A+</div>
                <div className="sandbox-stat-label">Security Audit</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">OG Cards</div>
                <div className="sandbox-stat-label">Social Previews</div>
              </div>
            </div>

            <div className="sandbox-footer-action">
              <AppLink
                href="/tools/seo-tools/http-security-cache-headers-analyzer"
                style={{ fontSize: "12.5px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                Audit Security Headers
              </AppLink>
              <AppLink href="/tools/seo-tools/google-serp-snippet-simulator" className="sandbox-action-btn">
                SERP Simulator <LuArrowRight size={14} />
              </AppLink>
            </div>
          </div>
        )}

        {effectiveTab === "dev" && (
          <div className="sandbox-interactive-zone">
            <div className="sandbox-zone-title">
              <h3>Developer & Text Tools</h3>
              <span className="sandbox-badge">
                <LuActivity size={13} />
                <span>Zero Latency</span>
              </span>
            </div>

            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "10px",
                padding: "10px 12px",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "var(--text-secondary)",
                lineHeight: "1.4"
              }}
            >
              <div>{`{ "project": "FusionTools", "status": 200, "fast": true }`}</div>
            </div>

            <div className="sandbox-stats-strip">
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">JSON</div>
                <div className="sandbox-stat-label">Format & Lint</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">Case</div>
                <div className="sandbox-stat-label">camel / snake</div>
              </div>
              <div className="sandbox-stat-box">
                <div className="sandbox-stat-value">QR Code</div>
                <div className="sandbox-stat-label">Vector Generator</div>
              </div>
            </div>

            <div className="sandbox-footer-action">
              <AppLink
                href="/tools/developer-tools/qr-code-generator"
                style={{ fontSize: "12.5px", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                Create Custom QR
              </AppLink>
              <AppLink href="/tools/developer-tools/json-formatter" className="sandbox-action-btn">
                Open JSON Formatter <LuArrowRight size={14} />
              </AppLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
