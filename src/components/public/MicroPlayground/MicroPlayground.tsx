"use client";

import React, { useState, useRef, useCallback } from "react";
import AppLink from "@/components/common/AppLink";
import {
  LuSparkles,
  LuSearch,
  LuSlidersHorizontal,
  LuArrowRight,
  LuStar,
} from "react-icons/lu";

export default function MicroPlayground() {
  const [activeMode, setActiveMode] = useState<"slider" | "serp">("slider");

  // Slider state
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPos(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleSliderMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // SERP interactive preview state
  const [serpTitle, setSerpTitle] = useState("Best Free Web Tools for Creators & Developers — FusionTools");
  const [serpDesc, setSerpDesc] = useState(
    "Fast, private online utilities: batch compress images, convert PDF to editable Word, simulate Google SERP snippets, and format JSON in seconds. No signup needed."
  );

  return (
    <section className="micro-playground-section">
      <div className="playground-container">
        <div className="playground-header">
          <span className="playground-pill">Instant Browser Experience</span>
          <h2>Try Before You Navigate</h2>
          <p>
            Experience how our client-side tools work right now. Zero downloads, zero accounts, instantaneous speed.
          </p>
        </div>

        {/* Switcher Modes */}
        <div className="playground-modes">
          <button
            type="button"
            onClick={() => setActiveMode("slider")}
            className={`playground-mode-btn ${activeMode === "slider" ? "active" : ""}`}
          >
            <LuSparkles size={16} />
            <span>AI Background Remover & Compressor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("serp")}
            className={`playground-mode-btn ${activeMode === "serp" ? "active" : ""}`}
          >
            <LuSearch size={16} />
            <span>Live Google SERP Simulator</span>
          </button>
        </div>

        {/* ── Mode 1: Before / After Split Slider ── */}
        {activeMode === "slider" && (
          <div>
            <div
              ref={containerRef}
              className="split-slider-container"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* After Layer (Transparent alpha cutout) */}
              <div className="slider-after-image">
                <span className="slider-badge-tag slider-badge-after">AFTER: 210 KB</span>
                <span className="slider-corner-pill pill-after">✓ Transparent PNG (-94%)</span>
                
                {/* Visual Subject on transparent checkerboard */}
                <div className="slider-subject-art">
                  <div className="slider-camera-box">
                    <div className="camera-lens-graphic">
                      <div className="camera-lens-glare" />
                    </div>
                    <div className="camera-details">
                      <span className="camera-dot" />
                      <span className="camera-text">PRO STUDIO · 4K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before Layer (Dark heavy studio background - clipped to sliderPos) */}
              <div
                className="slider-before-image"
                style={{
                  clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                }}
              >
                <span className="slider-badge-tag slider-badge-before">BEFORE: 3.4 MB</span>
                <span className="slider-corner-pill pill-before">⚠ Heavy Studio Background</span>

                {/* Exact same visual subject on dark background */}
                <div className="slider-subject-art">
                  <div className="slider-camera-box">
                    <div className="camera-lens-graphic">
                      <div className="camera-lens-glare" />
                    </div>
                    <div className="camera-details">
                      <span className="camera-dot" />
                      <span className="camera-text">PRO STUDIO · 4K</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Divider Bar */}
              <div className="slider-divider-line" style={{ left: `${sliderPos}%` }}>
                <div className="slider-handle-knob">
                  <LuSlidersHorizontal />
                </div>
              </div>
            </div>

            <div className="playground-slider-footer">
              <span className="slider-instruction-text">
                ← Drag slider to inspect background removal & compression →
              </span>
              <AppLink
                href="/tools/image-tools/background-remover"
                className="sandbox-action-btn"
              >
                <span>Try With Your Own Photo</span>
                <LuArrowRight size={14} />
              </AppLink>
            </div>
          </div>
        )}

        {/* ── Mode 2: Live Google SERP Simulator ── */}
        {activeMode === "serp" && (
          <div className="serp-playground-grid">
            {/* Input Controls */}
            <div className="serp-inputs-panel">
              <div className="serp-field-group">
                <div className="serp-label">
                  <span>Page Title</span>
                  <span className="serp-counter">{serpTitle.length} / 60 chars</span>
                </div>
                <input
                  type="text"
                  value={serpTitle}
                  onChange={(e) => setSerpTitle(e.target.value)}
                  className="serp-input"
                />
              </div>

              <div className="serp-field-group">
                <div className="serp-label">
                  <span>Meta Description</span>
                  <span className="serp-counter">{serpDesc.length} / 160 chars</span>
                </div>
                <textarea
                  rows={3}
                  value={serpDesc}
                  onChange={(e) => setSerpDesc(e.target.value)}
                  className="serp-textarea"
                />
              </div>

              <AppLink
                href="/tools/seo-tools/google-serp-snippet-simulator"
                className="sandbox-action-btn serp-launch-btn"
              >
                <span>Launch Full SERP Pixel Analyzer</span>
                <LuArrowRight size={14} />
              </AppLink>
            </div>

            {/* Live Search Snippet Preview */}
            <div className="serp-preview-panel">
              <div className="serp-preview-url">
                <span className="serp-favicon-placeholder">🌐</span>
                <span>https://fusiontools.com › tools</span>
              </div>
              <h3 className="serp-preview-title">
                {serpTitle || "Your Page Title Goes Here"}
              </h3>
              {/* Ratings commented out:
              <div className="serp-preview-stars">
                {[...Array(5)].map((_, i) => (
                  <LuStar key={i} size={12} fill="#e37400" />
                ))}
                <span>4.9 (1,420 reviews)</span>
              </div>
              */}
              <p className="serp-preview-desc">
                {serpDesc || "Your meta description preview will appear here in real-time as you type..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
