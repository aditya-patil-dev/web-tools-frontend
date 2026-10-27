"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
  FiSmile,
  FiUpload,
  FiDownload,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiType,
  FiSliders,
  FiRefreshCw,
  FiLayers,
  FiEye,
} from "react-icons/fi";

type MemeStyle = "classic" | "modern"; // classic = text on image, modern = text in header above image
type FontChoice = "Impact" | "Arial" | "Montserrat" | "Comic Sans MS" | "Trebuchet MS";

interface MemeTemplate {
  name: string;
  generate: () => string; // returns dataUrl
}

// Built-in lightweight SVG/Canvas meme starter templates
const MEME_TEMPLATES: MemeTemplate[] = [
  {
    name: "Drake Disapprove/Approve",
    generate: () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext("2d")!;
      // Top Half - No
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(400, 0, 400, 400);
      ctx.font = "bold 90px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🙅‍♂️", 200, 230);
      ctx.font = "bold 26px sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText("[ Top Option ]", 600, 210);

      // Bottom Half - Yes
      ctx.fillStyle = "#51cf66";
      ctx.fillRect(0, 400, 400, 400);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(400, 400, 400, 400);
      ctx.font = "bold 90px sans-serif";
      ctx.fillText("👉", 200, 630);
      ctx.font = "bold 26px sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText("[ Bottom Option ]", 600, 610);

      // Divider line
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(800, 400);
      ctx.moveTo(400, 0);
      ctx.lineTo(400, 800);
      ctx.stroke();

      return canvas.toDataURL("image/png");
    },
  },
  {
    name: "Two Buttons Choice",
    generate: () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(0, 0, 800, 600);

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(100, 100, 260, 160, 20);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(230, 180, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(440, 100, 260, 160, 20);
      ctx.fill();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(570, 180, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "140px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("😰", 400, 480);
      return canvas.toDataURL("image/png");
    },
  },
  {
    name: "Classic Dramatic Look",
    generate: () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#334155");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      ctx.font = "160px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🧐", 400, 360);
      return canvas.toDataURL("image/png");
    },
  },
];

export default function MemeGeneratorTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("meme.png");

  // Meme Text
  const [topText, setTopText] = useState<string>("ONE DOES NOT SIMPLY");
  const [bottomText, setBottomText] = useState<string>("CODE WITHOUT COFFEE");

  // Styling Settings
  const [style, setStyle] = useState<MemeStyle>("classic");
  const [font, setFont] = useState<FontChoice>("Impact");
  const [fontSizePercent, setFontSizePercent] = useState<number>(8); // % of image height
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [outlineColor, setOutlineColor] = useState<string>("#000000");
  const [outlineWidth, setOutlineWidth] = useState<number>(5);
  const [allCaps, setAllCaps] = useState<boolean>(true);

  // Modern Header Mode Settings
  const [headerBg, setHeaderBg] = useState<"white" | "black">("white");

  // Output & Actions
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-load template on initial mount
  useEffect(() => {
    const defaultDataUrl = MEME_TEMPLATES[0].generate();
    setImageSrc(defaultDataUrl);
    setFileName("drake-meme.png");
  }, []);

  // Upload custom photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).", "Invalid File");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setFileName(file.name);
      toast.success(`Loaded "${file.name}"!`, "Image Ready");
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  // Helper: Wrap text onto multiple lines if wider than maxWidth
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    rawText: string,
    maxWidth: number
  ): string[] => {
    const words = rawText.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const testLine = `${currentLine} ${words[i]}`;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Canvas Meme Renderer
  // ─────────────────────────────────────────────────────────────────────────────
  const renderMemeCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!imageSrc) return null;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    const W = img.naturalWidth || 800;
    const H = img.naturalHeight || 600;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const processedTop = allCaps ? topText.toUpperCase() : topText;
    const processedBottom = allCaps ? bottomText.toUpperCase() : bottomText;

    const computedFontSize = Math.max(20, Math.round((H * fontSizePercent) / 100));
    const fontStr = `900 ${computedFontSize}px ${font}`;
    ctx.font = fontStr;

    // ── STYLE 1: MODERN HEADER STYLE (White/Dark bar above image) ──
    if (style === "modern") {
      const headerPadding = 36;
      ctx.font = `700 ${Math.max(22, Math.round((H * fontSizePercent * 0.7) / 100))}px ${font === "Impact" ? "Arial" : font}`;
      const headerLines = wrapText(ctx, processedTop, W - headerPadding * 2);
      const lineHeight = computedFontSize * 1.25;
      const headerH = Math.max(80, headerLines.length * lineHeight + headerPadding * 1.5);

      canvas.width = W;
      canvas.height = H + headerH;

      // Fill Header
      ctx.fillStyle = headerBg === "white" ? "#ffffff" : "#0f172a";
      ctx.fillRect(0, 0, W, headerH);

      // Draw Header Text
      ctx.fillStyle = headerBg === "white" ? "#000000" : "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = `700 ${Math.max(22, Math.round((H * fontSizePercent * 0.7) / 100))}px ${font === "Impact" ? "Arial" : font}`;
      headerLines.forEach((line, idx) => {
        ctx.fillText(line, headerPadding, headerPadding * 0.6 + idx * lineHeight);
      });

      // Draw Main Image below header
      ctx.drawImage(img, 0, headerH, W, H);
    }
    // ── STYLE 2: CLASSIC MEME OVERLAY (Text on top/bottom with black stroke) ──
    else {
      canvas.width = W;
      canvas.height = H;

      // Draw Base Image
      ctx.drawImage(img, 0, 0, W, H);

      ctx.font = fontStr;
      ctx.textAlign = "center";
      ctx.lineWidth = outlineWidth * (W / 600);
      ctx.strokeStyle = outlineColor;
      ctx.fillStyle = textColor;
      ctx.lineJoin = "round";

      // 1. Draw Top Text
      if (processedTop.trim()) {
        const topLines = wrapText(ctx, processedTop, W * 0.9);
        const lineHeight = computedFontSize * 1.15;
        topLines.forEach((line, idx) => {
          const y = computedFontSize + 20 + idx * lineHeight;
          if (outlineWidth > 0) ctx.strokeText(line, W / 2, y);
          ctx.fillText(line, W / 2, y);
        });
      }

      // 2. Draw Bottom Text
      if (processedBottom.trim()) {
        const bottomLines = wrapText(ctx, processedBottom, W * 0.9);
        const lineHeight = computedFontSize * 1.15;
        const totalBottomH = bottomLines.length * lineHeight;
        bottomLines.forEach((line, idx) => {
          const y = H - 30 - totalBottomH + (idx + 1) * lineHeight;
          if (outlineWidth > 0) ctx.strokeText(line, W / 2, y);
          ctx.fillText(line, W / 2, y);
        });
      }
    }

    return canvas;
  }, [
    imageSrc,
    topText,
    bottomText,
    style,
    font,
    fontSizePercent,
    textColor,
    outlineColor,
    outlineWidth,
    allCaps,
    headerBg,
  ]);

  // Update Live Preview (debounced)
  useEffect(() => {
    let active = true;
    const generate = async () => {
      setIsRendering(true);
      const canvas = await renderMemeCanvas();
      if (canvas && active) {
        setOutputDimensions({ width: canvas.width, height: canvas.height });
        canvas.toBlob((blob) => {
          if (blob && active) {
            const url = URL.createObjectURL(blob);
            setLivePreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          }
          setIsRendering(false);
        }, "image/png");
      } else {
        setIsRendering(false);
      }
    };

    const timer = setTimeout(generate, 120);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [renderMemeCanvas]);

  // Actions
  const handleDownload = async () => {
    setIsRendering(true);
    const canvas = await renderMemeCanvas();
    if (!canvas) {
      toast.error("Failed to generate meme", "Error");
      setIsRendering(false);
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const cleanName = fileName.replace(/\.[^/.]+$/, "") + "-meme.png";
        saveAs(blob, cleanName);
        toast.success(`Downloaded "${cleanName}"!`, "Success");
      }
      setIsRendering(false);
    }, "image/png");
  };

  const handleCopy = async () => {
    setIsRendering(true);
    const canvas = await renderMemeCanvas();
    if (!canvas) {
      setIsRendering(false);
      return;
    }
    canvas.toBlob(async (blob) => {
      if (blob && window.ClipboardItem && navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        toast.success("Meme copied to clipboard!", "Copied");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.warning("Clipboard image copy not supported in this browser.", "Unsupported");
      }
      setIsRendering(false);
    }, "image/png");
  };

  const selectTemplate = (tpl: MemeTemplate) => {
    const dataUrl = tpl.generate();
    setImageSrc(dataUrl);
    setFileName(`${tpl.name.toLowerCase().replace(/\s+/g, "-")}.png`);
    toast.success(`Loaded "${tpl.name}" template!`, "Template Ready");
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
        <FiSmile />
        <p>
          Create classic top/bottom memes or modern Twitter/Reddit header style memes in seconds.
          Upload any picture or choose a template &mdash; rendered locally in high definition.
        </p>
      </div>

      {/* ── Mode Switcher: Classic vs Modern ──────────────────────────── */}
      <div className="mode-switcher" style={{ marginTop: 20 }}>
        <button
          type="button"
          className={`mode-btn ${style === "classic" ? "active" : ""}`}
          onClick={() => setStyle("classic")}
        >
          <FiType /> Classic Meme (Top &amp; Bottom Overlay)
        </button>
        <button
          type="button"
          className={`mode-btn ${style === "modern" ? "active" : ""}`}
          onClick={() => setStyle("modern")}
        >
          <FiLayers /> Modern Header (Twitter / Reddit Style)
        </button>
      </div>

      {/* ── Main Studio Grid ─────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
          marginTop: 16,
        }}
      >
        {/* ── Left Column: Live Meme Preview ──────────────────────────── */}
        <div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 420,
              background:
                "repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%, rgba(0,0,0,0.3) 0% 50%) 50% / 16px 16px",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {livePreviewUrl ? (
              <img
                src={livePreviewUrl}
                alt="Live Meme"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Generating preview...</span>
            )}

            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 11,
                color: "#94a3b8",
              }}
            >
              {outputDimensions.width} &times; {outputDimensions.height} px
            </div>
          </div>

          {/* Quick Template Selector */}
          <div style={{ marginTop: 14 }}>
            <span style={{ display: "block", fontSize: 12, color: "#cbd5e1", fontWeight: 600, marginBottom: 8 }}>
              Choose a Starter Template:
            </span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {MEME_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => selectTemplate(tpl)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#cbd5e1",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {tpl.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(255,107,53,0.15)",
                  border: "1px solid rgba(255,107,53,0.3)",
                  color: "#ff6b35",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Upload Custom Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <motion.button
              type="button"
              className="btn-download"
              onClick={handleDownload}
              disabled={isRendering}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ flex: 1 }}
            >
              <FiDownload />
              Download Meme (PNG)
            </motion.button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={isRendering}
              title="Copy to clipboard"
              style={{
                padding: "0 18px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                color: copied ? "#10b981" : "#cbd5e1",
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {copied ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
        </div>

        {/* ── Right Column: Text Inputs & Typography Studio ────────── */}
        <div>
          {/* Text Input Panel */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
              {style === "modern" ? "Meme Caption / Headline" : "Top Caption Text"}
            </label>
            <textarea
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Enter top caption..."
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
                marginBottom: 14,
                resize: "vertical",
              }}
            />

            {style === "classic" && (
              <>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                  Bottom Caption Text
                </label>
                <textarea
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom caption..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    marginBottom: 8,
                    resize: "vertical",
                  }}
                />
              </>
            )}

            {/* Quick Caps Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Force ALL-CAPS font</span>
              <button
                type="button"
                className={`ai-toggle-switch ${allCaps ? "active" : ""}`}
                onClick={() => setAllCaps((v) => !v)}
                role="switch"
                aria-checked={allCaps}
              >
                <span className="ai-toggle-thumb" />
              </button>
            </div>
          </div>

          {/* Typography & Font Settings */}
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 18,
            }}
          >
            {/* Font Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                  Font Family
                </span>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value as FontChoice)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: 13,
                  }}
                >
                  <option value="Impact">Impact (Iconic Meme)</option>
                  <option value="Arial">Arial (Clean)</option>
                  <option value="Montserrat">Montserrat (Modern)</option>
                  <option value="Comic Sans MS">Comic Sans (Playful)</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                </select>
              </div>

              {style === "classic" ? (
                <div>
                  <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                    Text Color &amp; Outline
                  </span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      title="Fill Color"
                      style={{
                        width: 32,
                        height: 32,
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "transparent",
                      }}
                    />
                    <input
                      type="color"
                      value={outlineColor}
                      onChange={(e) => setOutlineColor(e.target.value)}
                      title="Outline Stroke Color"
                      style={{
                        width: 32,
                        height: 32,
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        background: "transparent",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                    Header Theme
                  </span>
                  <button
                    type="button"
                    onClick={() => setHeaderBg((b) => (b === "white" ? "black" : "white"))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {headerBg === "white" ? "⚪ White Header" : "⚫ Dark Header"}
                  </button>
                </div>
              )}
            </div>

            {/* Sliders: Size & Stroke */}
            <div style={{ display: "grid", gridTemplateColumns: style === "classic" ? "1fr 1fr" : "1fr", gap: 14 }}>
              <div>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Text Size ({fontSizePercent}%)</span>
                <input
                  type="range"
                  min="4"
                  max="14"
                  value={fontSizePercent}
                  onChange={(e) => setFontSizePercent(Number(e.target.value))}
                  className="quality-slider"
                />
              </div>

              {style === "classic" && (
                <div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Black Outline ({outlineWidth}px)</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={outlineWidth}
                    onChange={(e) => setOutlineWidth(Number(e.target.value))}
                    className="quality-slider"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
