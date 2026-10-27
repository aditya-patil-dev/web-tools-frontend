"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiLayout,
  FiUpload,
  FiDownload,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiSliders,
  FiEye,
  FiGlobe,
  FiLock,
  FiLayers,
} from "react-icons/fi";

type DeviceType = "browser" | "phone" | "tablet" | "laptop" | "floating";
type ShadowPreset = "none" | "soft" | "bold" | "glow";
type CanvasAspect = "auto" | "16:9" | "1:1" | "4:3";

const GRADIENT_PRESETS = [
  { name: "Sunset", value: "linear-gradient(135deg, #ff6b35 0%, #f7c59f 100%)", css: "linear-gradient(135deg, #ff6b35, #f7c59f)" },
  { name: "Hyper Purple", value: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", css: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { name: "Oceanic", value: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)", css: "linear-gradient(135deg, #0ea5e9, #10b981)" },
  { name: "Cyberpunk", value: "linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)", css: "linear-gradient(135deg, #f43f5e, #3b82f6)" },
  { name: "Midnight", value: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", css: "linear-gradient(135deg, #0f172a, #334155)" },
  { name: "Emerald", value: "linear-gradient(135deg, #065f46 0%, #10b981 100%)", css: "linear-gradient(135deg, #065f46, #10b981)" },
];

export default function DeviceMockupTool() {
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("screenshot.png");

  // Device & Layout Options
  const [device, setDevice] = useState<DeviceType>("browser");
  const [canvasAspect, setCanvasAspect] = useState<CanvasAspect>("16:9");
  const [padding, setPadding] = useState<number>(48); // 16px - 80px
  const [shadow, setShadow] = useState<ShadowPreset>("bold");
  const [cornerRadius, setCornerRadius] = useState<number>(14);

  // Background Options
  const [bgType, setBgType] = useState<"gradient" | "solid" | "transparent">("gradient");
  const [gradient, setGradient] = useState<string>(GRADIENT_PRESETS[0].value);
  const [solidColor, setSolidColor] = useState<string>("#1e293b");

  // Browser Specific Options
  const [browserTheme, setBrowserTheme] = useState<"dark" | "light">("dark");
  const [browserUrl, setBrowserUrl] = useState<string>("fusiontools.in");
  const [showUrlBar, setShowUrlBar] = useState<boolean>(true);

  // Export State
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample screenshot
  const loadSampleScreenshot = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 750;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Modern Dashboard UI Mockup
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 1200, 750);

      // Sidebar
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, 220, 750);

      // Logo
      ctx.fillStyle = "#ff6b35";
      ctx.beginPath();
      ctx.arc(40, 40, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("Analytics OS", 70, 46);

      // Nav items
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i === 1 ? "rgba(255, 107, 53, 0.2)" : "rgba(255, 255, 255, 0.05)";
        ctx.beginPath();
        ctx.roundRect(20, 90 + i * 45, 180, 34, 8);
        ctx.fill();

        ctx.fillStyle = i === 1 ? "#ff6b35" : "#94a3b8";
        ctx.font = "14px sans-serif";
        ctx.fillText(["Dashboard", "Live Traffic", "Conversions", "Team", "Settings"][i], 40, 112 + i * 45);
      }

      // Top metric cards
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = "#161f30";
        ctx.beginPath();
        ctx.roundRect(250 + i * 310, 40, 290, 130, 12);
        ctx.fill();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "14px sans-serif";
        ctx.fillText(["Monthly Active Users", "Total Revenue", "Avg Conversion Rate"][i], 270 + i * 310, 75);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px sans-serif";
        ctx.fillText(["148,290", "$42,850", "4.86%"][i], 270 + i * 310, 125);
      }

      // Large Graph Card
      ctx.fillStyle = "#161f30";
      ctx.beginPath();
      ctx.roundRect(250, 200, 910, 500, 14);
      ctx.fill();

      // Chart line
      ctx.beginPath();
      ctx.moveTo(290, 550);
      ctx.bezierCurveTo(450, 380, 600, 600, 750, 320);
      ctx.bezierCurveTo(850, 200, 1000, 420, 1120, 260);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ff6b35";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("Performance Trends & User Engagement (Q3)", 280, 240);
    }

    const dataUrl = canvas.toDataURL("image/png");
    setScreenshotSrc(dataUrl);
    setFileName("dashboard-preview.png");
    toast.success("Loaded sample modern dashboard screenshot!", "Sample Ready");
  };

  // Upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP).", "Invalid File");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotSrc(event.target?.result as string);
      setFileName(file.name);
      toast.success(`Loaded "${file.name}"!`, "Screenshot Ready");
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Canvas Mockup Renderer (Generates High-DPI Output)
  // ─────────────────────────────────────────────────────────────────────────────
  const renderMockupCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!screenshotSrc) return null;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = screenshotSrc;
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    // Determine Canvas Output Resolution (High-Res 2x base)
    let canvasW = 1600;
    let canvasH = 1000;

    if (canvasAspect === "16:9") {
      canvasW = 1600;
      canvasH = 900;
    } else if (canvasAspect === "1:1") {
      canvasW = 1200;
      canvasH = 1200;
    } else if (canvasAspect === "4:3") {
      canvasW = 1600;
      canvasH = 1200;
    } else {
      // Auto
      const imgAspect = img.naturalWidth / img.naturalHeight;
      canvasW = 1400;
      canvasH = Math.round(1400 / imgAspect) + padding * 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Draw Background
    if (bgType === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      if (gradient.includes("#ff6b35")) {
        grad.addColorStop(0, "#ff6b35");
        grad.addColorStop(1, "#f7c59f");
      } else if (gradient.includes("#8b5cf6")) {
        grad.addColorStop(0, "#8b5cf6");
        grad.addColorStop(1, "#ec4899");
      } else if (gradient.includes("#0ea5e9")) {
        grad.addColorStop(0, "#0ea5e9");
        grad.addColorStop(1, "#10b981");
      } else if (gradient.includes("#f43f5e")) {
        grad.addColorStop(0, "#f43f5e");
        grad.addColorStop(1, "#3b82f6");
      } else if (gradient.includes("#065f46")) {
        grad.addColorStop(0, "#065f46");
        grad.addColorStop(1, "#10b981");
      } else {
        grad.addColorStop(0, "#0f172a");
        grad.addColorStop(1, "#334155");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (bgType === "solid") {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // 2. Compute Device Framing Bounds
    const availW = canvasW - padding * 2;
    const availH = canvasH - padding * 2;

    let headerH = 0;
    let radius = cornerRadius * 2;

    if (device === "browser") {
      headerH = showUrlBar ? 64 : 44;
    } else if (device === "laptop") {
      headerH = 34;
      radius = 18;
    } else if (device === "phone") {
      radius = 42;
    } else if (device === "tablet") {
      radius = 32;
    }

    // Fit image inside available space
    const targetImgW = availW;
    const aspect = img.naturalWidth / img.naturalHeight;
    let targetImgH = targetImgW / aspect;

    if (targetImgH + headerH > availH) {
      targetImgH = availH - headerH;
    }

    const deviceW = Math.min(availW, Math.round(targetImgH * aspect));
    const deviceH = Math.round(targetImgH + headerH);

    const devX = Math.round((canvasW - deviceW) / 2);
    const devY = Math.round((canvasH - deviceH) / 2);

    // 3. Draw Drop Shadow
    if (shadow !== "none") {
      ctx.save();
      if (shadow === "soft") {
        ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
      } else if (shadow === "bold") {
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 65;
        ctx.shadowOffsetY = 30;
      } else if (shadow === "glow") {
        ctx.shadowColor = "rgba(255, 107, 53, 0.45)";
        ctx.shadowBlur = 75;
        ctx.shadowOffsetY = 15;
      }
      ctx.beginPath();
      ctx.roundRect(devX, devY, deviceW, deviceH, radius);
      ctx.fillStyle = "#000000";
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Device Chassis & Content
    ctx.save();

    // Clip to rounded device frame
    ctx.beginPath();
    ctx.roundRect(devX, devY, deviceW, deviceH, radius);
    ctx.clip();

    // ── BROWSER FRAME ──
    if (device === "browser") {
      const isDark = browserTheme === "dark";
      ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
      ctx.fillRect(devX, devY, deviceW, headerH);

      // Traffic light dots
      const dotY = devY + headerH / 2;
      const dotStartX = devX + 24;
      const dotRadius = 6;
      const dotGap = 18;

      ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((col, idx) => {
        ctx.beginPath();
        ctx.arc(dotStartX + idx * dotGap, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      });

      // Address Bar Pill
      if (showUrlBar) {
        const urlW = Math.min(500, deviceW - 160);
        const urlX = devX + (deviceW - urlW) / 2;
        const urlH = 32;
        const urlY = devY + (headerH - urlH) / 2;

        ctx.beginPath();
        ctx.roundRect(urlX, urlY, urlW, urlH, 8);
        ctx.fillStyle = isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.85)";
        ctx.fill();

        ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
        ctx.font = "13px sans-serif";
        ctx.fillText(`🔒 ${browserUrl}`, urlX + 16, urlY + 21);
      }

      // Draw Screenshot
      ctx.drawImage(img, devX, devY + headerH, deviceW, deviceH - headerH);
    }
    // ── SMARTPHONE FRAME ──
    else if (device === "phone") {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(devX, devY, deviceW, deviceH);

      // Screenshot with margin
      const bezel = 12;
      ctx.drawImage(img, devX + bezel, devY + bezel, deviceW - bezel * 2, deviceH - bezel * 2);

      // Dynamic Island Pill
      const pillW = Math.min(130, deviceW * 0.35);
      const pillH = 26;
      ctx.beginPath();
      ctx.roundRect(devX + (deviceW - pillW) / 2, devY + 16, pillW, pillH, 13);
      ctx.fillStyle = "#000000";
      ctx.fill();
    }
    // ── TABLET FRAME ──
    else if (device === "tablet") {
      ctx.fillStyle = "#111827";
      ctx.fillRect(devX, devY, deviceW, deviceH);

      const bezel = 18;
      ctx.drawImage(img, devX + bezel, devY + bezel, deviceW - bezel * 2, deviceH - bezel * 2);

      // Front Camera dot
      ctx.beginPath();
      ctx.arc(devX + deviceW / 2, devY + 9, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#374151";
      ctx.fill();
    }
    // ── LAPTOP / MACBOOK FRAME ──
    else if (device === "laptop") {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(devX, devY, deviceW, deviceH);

      // Camera dot
      ctx.beginPath();
      ctx.arc(devX + deviceW / 2, devY + headerH / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#475569";
      ctx.fill();

      // Screen inside lid
      const lidBezel = 10;
      ctx.drawImage(
        img,
        devX + lidBezel,
        devY + headerH,
        deviceW - lidBezel * 2,
        deviceH - headerH - lidBezel
      );
    }
    // ── FLOATING CARD FRAME ──
    else {
      ctx.drawImage(img, devX, devY, deviceW, deviceH);
    }

    // Border around device
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    return canvas;
  }, [
    screenshotSrc,
    canvasAspect,
    padding,
    cornerRadius,
    device,
    showUrlBar,
    browserTheme,
    browserUrl,
    bgType,
    gradient,
    solidColor,
    shadow,
  ]);

  // Update Live Preview (debounced)
  useEffect(() => {
    let active = true;
    const generate = async () => {
      setIsRendering(true);
      const canvas = await renderMockupCanvas();
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

    const timer = setTimeout(generate, 140);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [renderMockupCanvas]);

  // Actions
  const handleDownload = async () => {
    setIsRendering(true);
    const canvas = await renderMockupCanvas();
    if (!canvas) {
      toast.error("Failed to generate mockup image", "Error");
      setIsRendering(false);
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const cleanName = fileName.replace(/\.[^/.]+$/, "") + "-mockup.png";
        saveAs(blob, cleanName);
        toast.success(`Downloaded high-res "${cleanName}"!`, "Success");
      }
      setIsRendering(false);
    }, "image/png");
  };

  const handleCopy = async () => {
    setIsRendering(true);
    const canvas = await renderMockupCanvas();
    if (!canvas) {
      setIsRendering(false);
      return;
    }
    canvas.toBlob(async (blob) => {
      if (blob && window.ClipboardItem && navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        toast.success("Mockup image copied to clipboard!", "Copied");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.warning("Clipboard image copy not supported in this browser", "Unsupported");
      }
      setIsRendering(false);
    }, "image/png");
  };

  const clearAll = () => {
    if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
    setScreenshotSrc(null);
    setLivePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Cleared screenshot", "Reset");
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
        <FiCheckCircle />
        <p>
          Turn boring screenshots into eye-catching product mockups. Choose modern browser tabs,
          smartphones, or floating glass frames with vibrant gradient backdrops.
        </p>
      </div>

      {/* ── EMPTY / UPLOAD STATE ─────────────────────────────────────── */}
      {!screenshotSrc ? (
        <div
          className="tool-upload-area"
          style={{ minHeight: 260, cursor: "pointer", marginTop: 20 }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="tool-file-input"
          />
          <div className="tool-upload-label">
            <FiUpload className="upload-icon" />
            <h3>Drop your screenshot or app design here</h3>
            <p>supports PNG, JPG, WebP, and SVG exports</p>
            <div className="btn-browse" style={{ marginTop: 12 }}>
              Choose Screenshot
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleScreenshot();
                }}
                style={{
                  background: "rgba(255, 107, 53, 0.15)",
                  border: "1px solid rgba(255, 107, 53, 0.35)",
                  color: "#ff6b35",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Try With Sample Dashboard Screenshot
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {/* Top Bar with Clear & Size */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
              Source: {fileName}
            </span>
            <button
              type="button"
              className="btn-clear-all"
              onClick={clearAll}
              style={{ fontSize: 12, padding: "4px 10px" }}
            >
              <FiTrash2 /> Change Screenshot
            </button>
          </div>

          {/* ── Workspace: Live Canvas on Left, Controls on Right ────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {/* ── Left Column: Live Mockup Viewport ────────────────────── */}
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
                    alt="Mockup Preview"
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

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
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
                  Download Mockup (PNG)
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

            {/* ── Right Column: Studio Customization ───────────────────── */}
            <div>
              {/* Device Frame Selector */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>
                  Device Frame Style
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { id: "browser" as const, label: "Browser Tab", icon: <FiGlobe /> },
                    { id: "laptop" as const, label: "MacBook", icon: <FiMonitor /> },
                    { id: "phone" as const, label: "Smartphone", icon: <FiSmartphone /> },
                    { id: "tablet" as const, label: "Tablet", icon: <FiTablet /> },
                    { id: "floating" as const, label: "Clean Card", icon: <FiLayout /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDevice(item.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: device === item.id ? 700 : 500,
                        cursor: "pointer",
                        border:
                          device === item.id ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.08)",
                        background:
                          device === item.id ? "var(--gradient-primary)" : "rgba(255,255,255,0.03)",
                        color: device === item.id ? "#fff" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        justifyContent: "center",
                      }}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>

                {/* Browser Extra Options */}
                {device === "browser" && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        type="text"
                        value={browserUrl}
                        onChange={(e) => setBrowserUrl(e.target.value)}
                        placeholder="e.g. yourdomain.com"
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          fontSize: 12,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setBrowserTheme((t) => (t === "dark" ? "light" : "dark"))}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#cbd5e1",
                        }}
                      >
                        {browserTheme === "dark" ? "🌙 Dark Bar" : "☀️ Light Bar"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Backdrop Selector */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
                    Backdrop Canvas
                  </label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["gradient", "solid", "transparent"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setBgType(t)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          cursor: "pointer",
                          border: bgType === t ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
                          background: bgType === t ? "rgba(255,107,53,0.2)" : "transparent",
                          color: bgType === t ? "#fff" : "#94a3b8",
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {bgType === "gradient" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {GRADIENT_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setGradient(p.value)}
                        title={p.name}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: gradient === p.value ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.2)",
                          background: p.css,
                          cursor: "pointer",
                          outline: gradient === p.value ? "2px solid #ff6b35" : "none",
                        }}
                      />
                    ))}
                  </div>
                )}

                {bgType === "solid" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      style={{
                        width: 36,
                        height: 36,
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: "transparent",
                      }}
                    />
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>Hex: {solidColor}</span>
                  </div>
                )}
              </div>

              {/* Sliders: Padding & Shadow */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Canvas Padding ({padding}px)</span>
                    <input
                      type="range"
                      min="16"
                      max="80"
                      value={padding}
                      onChange={(e) => setPadding(Number(e.target.value))}
                      className="quality-slider"
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Corner Radius ({cornerRadius}px)</span>
                    <input
                      type="range"
                      min="6"
                      max="28"
                      value={cornerRadius}
                      onChange={(e) => setCornerRadius(Number(e.target.value))}
                      className="quality-slider"
                    />
                  </div>
                </div>

                {/* Aspect Ratio & Shadow */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                  <div>
                    <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                      Canvas Ratio
                    </span>
                    <select
                      value={canvasAspect}
                      onChange={(e) => setCanvasAspect(e.target.value as CanvasAspect)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      <option value="16:9">16:9 Landscape / Twitter</option>
                      <option value="1:1">1:1 Square / Instagram</option>
                      <option value="4:3">4:3 Product Hunt</option>
                      <option value="auto">Auto (Match Image)</option>
                    </select>
                  </div>

                  <div>
                    <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                      Drop Shadow
                    </span>
                    <select
                      value={shadow}
                      onChange={(e) => setShadow(e.target.value as ShadowPreset)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    >
                      <option value="bold">Bold 3D Shadow</option>
                      <option value="soft">Soft Subtle Shadow</option>
                      <option value="glow">Glow Shadow</option>
                      <option value="none">No Shadow</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
