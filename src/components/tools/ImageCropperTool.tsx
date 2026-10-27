"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
  FiCrop,
  FiUser,
  FiUpload,
  FiDownload,
  FiRotateCw,
  FiRotateCcw,
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiSliders,
  FiMaximize2,
  FiEye,
  FiZap,
} from "react-icons/fi";
import { LuFlipHorizontal, LuFlipVertical } from "react-icons/lu";

type ToolMode = "cropper" | "avatar";
type AspectRatioKey = "free" | "1:1" | "16:9" | "4:3" | "9:16" | "3:2";
type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

interface AspectPreset {
  label: string;
  ratio: number | null; // width / height
  icon?: string;
}

const ASPECT_PRESETS: Record<AspectRatioKey, AspectPreset> = {
  free: { label: "Freeform", ratio: null },
  "1:1": { label: "1:1 Square", ratio: 1 },
  "16:9": { label: "16:9 Banner", ratio: 16 / 9 },
  "4:3": { label: "4:3 Standard", ratio: 4 / 3 },
  "9:16": { label: "9:16 Story/Reels", ratio: 9 / 16 },
  "3:2": { label: "3:2 Photo", ratio: 3 / 2 },
};

const BORDER_PRESET_COLORS = [
  { name: "Blue", color: "#3b82f6" },
  { name: "Emerald", color: "#10b981" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Orange", color: "#ff6b35" },
  { name: "Rose", color: "#f43f5e" },
  { name: "White", color: "#ffffff" },
  { name: "Instagram Gradient", color: "gradient" },
];

export default function ImageCropperTool() {
  const [mode, setMode] = useState<ToolMode>("cropper");

  // Image source & metadata
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image.png");
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Cropping rect in display coordinates
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });

  // Settings
  const [aspectKey, setAspectKey] = useState<AspectRatioKey>("1:1");
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Avatar-specific settings
  const [hasBorder, setHasBorder] = useState<boolean>(false);
  const [borderWidth, setBorderWidth] = useState<number>(6);
  const [borderColor, setBorderColor] = useState<string>("#3b82f6");

  // Output settings
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [outputQuality, setOutputQuality] = useState<number>(92);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputDimensions, setOutputDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Drag & Resize state
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; rect: typeof cropRect }>({
    clientX: 0,
    clientY: 0,
    rect: { x: 0, y: 0, width: 200, height: 200 },
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-switch aspect ratio when mode changes
  useEffect(() => {
    if (mode === "avatar") {
      setAspectKey("1:1");
    }
  }, [mode]);

  // Load sample image for instant demo
  const loadSampleImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Stylish demo background
    const grad = ctx.createLinearGradient(0, 0, 1000, 1000);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.5, "#4338ca");
    grad.addColorStop(1, "#3b82f6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1000, 1000);

    // Glowing circle
    ctx.beginPath();
    ctx.arc(500, 420, 240, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b35";
    ctx.fill();

    // Inner icon / avatar graphic
    ctx.beginPath();
    ctx.arc(500, 360, 100, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(500, 640, 190, Math.PI, 0, false);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.font = "bold 56px sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "center";
    ctx.fillText("Fusion Avatar Demo", 500, 880);

    const url = canvas.toDataURL("image/png");
    setImageSrc(url);
    setFileName("sample-avatar.png");
    toast.success("Sample image loaded! Adjust the crop box or settings.", "Sample Loaded");
  };

  // Handle uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP, etc.).", "Invalid File");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setFileName(file.name);
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      toast.success(`Loaded "${file.name}"`, "Image Ready");
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  // Image load & container layout calculations
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalSize({ width: nw, height: nh });

    const dw = img.clientWidth;
    const dh = img.clientHeight;
    setDisplaySize({ width: dw, height: dh });

    // Initialize center crop box
    initCropBox(dw, dh, aspectKey);
  };

  const initCropBox = (dw: number, dh: number, currentAspectKey: AspectRatioKey) => {
    const targetRatio = mode === "avatar" ? 1 : ASPECT_PRESETS[currentAspectKey].ratio;
    let w = dw * 0.75;
    let h = dh * 0.75;

    if (targetRatio) {
      if (w / targetRatio <= dh * 0.85) {
        h = w / targetRatio;
      } else {
        h = dh * 0.85;
        w = h * targetRatio;
      }
    }

    const x = Math.max(0, (dw - w) / 2);
    const y = Math.max(0, (dh - h) / 2);
    setCropRect({ x: Math.round(x), y: Math.round(y), width: Math.round(w), height: Math.round(h) });
  };

  // Handle aspect preset changes
  const applyAspectPreset = (key: AspectRatioKey) => {
    setAspectKey(key);
    if (displaySize.width > 0 && displaySize.height > 0) {
      initCropBox(displaySize.width, displaySize.height, key);
    }
  };

  // Generate crop preview on canvas
  const generateCroppedPreview = useCallback(async () => {
    if (!imageSrc || !imgRef.current || displaySize.width === 0) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });

      // Calculate ratio between natural image and display image
      const scaleX = naturalSize.width / displaySize.width;
      const scaleY = naturalSize.height / displaySize.height;

      const cropX = cropRect.x * scaleX;
      const cropY = cropRect.y * scaleY;
      const cropW = cropRect.width * scaleX;
      const cropH = cropRect.height * scaleY;

      // Temporary canvas to extract the crop with zoom & rotations
      const outW = Math.max(16, Math.round(cropW));
      const outH = Math.max(16, Math.round(cropH));
      setOutputDimensions({ width: outW, height: outH });

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();

      // If avatar circle mode, apply circular clip
      if (mode === "avatar") {
        ctx.beginPath();
        const radius = Math.min(outW, outH) / 2;
        ctx.arc(outW / 2, outH / 2, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      // Handle Flip & Rotation
      ctx.translate(outW / 2, outH / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.scale(zoom, zoom);
      ctx.translate(-outW / 2, -outH / 2);

      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);
      ctx.restore();

      // If avatar mode has border
      if (mode === "avatar" && hasBorder && borderWidth > 0) {
        ctx.save();
        const radius = Math.min(outW, outH) / 2 - (borderWidth * (outW / 200)) / 2;
        ctx.beginPath();
        ctx.arc(outW / 2, outH / 2, Math.max(1, radius), 0, Math.PI * 2);
        ctx.lineWidth = borderWidth * (outW / 200);

        if (borderColor === "gradient") {
          const grad = ctx.createLinearGradient(0, 0, outW, outH);
          grad.addColorStop(0, "#f58529");
          grad.addColorStop(0.5, "#dd2a7b");
          grad.addColorStop(1, "#8134af");
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = borderColor;
        }
        ctx.stroke();
        ctx.restore();
      }

      // Export Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewBlob(blob);
            setPreviewUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
        },
        outputFormat,
        outputQuality / 100
      );
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  }, [
    imageSrc,
    cropRect,
    displaySize,
    naturalSize,
    mode,
    zoom,
    rotation,
    flipH,
    flipV,
    hasBorder,
    borderWidth,
    borderColor,
    outputFormat,
    outputQuality,
  ]);

  // Recalculate preview whenever settings change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      generateCroppedPreview();
    }, 120);
    return () => clearTimeout(timer);
  }, [generateCroppedPreview]);

  // Pointer Drag & Resize Handling
  const onPointerDown = (type: string, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(type);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      rect: { ...cropRect },
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || displaySize.width === 0) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    const orig = dragStartRef.current.rect;
    const activeRatio = mode === "avatar" ? 1 : ASPECT_PRESETS[aspectKey].ratio;

    let nx = orig.x;
    let ny = orig.y;
    let nw = orig.width;
    let nh = orig.height;

    const minSize = 40;

    if (isDragging === "move") {
      nx = Math.min(Math.max(0, orig.x + dx), displaySize.width - orig.width);
      ny = Math.min(Math.max(0, orig.y + dy), displaySize.height - orig.height);
    } else if (isDragging === "br") {
      nw = Math.max(minSize, Math.min(orig.width + dx, displaySize.width - orig.x));
      nh = activeRatio ? nw / activeRatio : Math.max(minSize, Math.min(orig.height + dy, displaySize.height - orig.y));
      if (activeRatio && orig.y + nh > displaySize.height) {
        nh = displaySize.height - orig.y;
        nw = nh * activeRatio;
      }
    } else if (isDragging === "tr") {
      nw = Math.max(minSize, Math.min(orig.width + dx, displaySize.width - orig.x));
      if (activeRatio) {
        nh = nw / activeRatio;
        ny = orig.y + (orig.height - nh);
        if (ny < 0) {
          ny = 0;
          nh = orig.y + orig.height;
          nw = nh * activeRatio;
        }
      } else {
        const potentialY = orig.y + dy;
        const clampedY = Math.max(0, Math.min(potentialY, orig.y + orig.height - minSize));
        nh = orig.height + (orig.y - clampedY);
        ny = clampedY;
      }
    } else if (isDragging === "bl") {
      const potentialX = orig.x + dx;
      const clampedX = Math.max(0, Math.min(potentialX, orig.x + orig.width - minSize));
      nw = orig.width + (orig.x - clampedX);
      nx = clampedX;
      nh = activeRatio ? nw / activeRatio : Math.max(minSize, Math.min(orig.height + dy, displaySize.height - orig.y));
      if (activeRatio && orig.y + nh > displaySize.height) {
        nh = displaySize.height - orig.y;
        nw = nh * activeRatio;
        nx = orig.x + orig.width - nw;
      }
    } else if (isDragging === "tl") {
      const potentialX = orig.x + dx;
      const clampedX = Math.max(0, Math.min(potentialX, orig.x + orig.width - minSize));
      nw = orig.width + (orig.x - clampedX);
      nx = clampedX;
      if (activeRatio) {
        nh = nw / activeRatio;
        ny = orig.y + (orig.height - nh);
        if (ny < 0) {
          ny = 0;
          nh = orig.y + orig.height;
          nw = nh * activeRatio;
          nx = orig.x + orig.width - nw;
        }
      } else {
        const potentialY = orig.y + dy;
        const clampedY = Math.max(0, Math.min(potentialY, orig.y + orig.height - minSize));
        nh = orig.height + (orig.y - clampedY);
        ny = clampedY;
      }
    }

    setCropRect({
      x: Math.round(nx),
      y: Math.round(ny),
      width: Math.round(nw),
      height: Math.round(nh),
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(null);
    }
  };

  // Actions
  const handleDownload = () => {
    if (!previewBlob) {
      toast.error("No cropped image ready for download.", "Error");
      return;
    }
    const ext = outputFormat === "image/png" ? ".png" : outputFormat === "image/webp" ? ".webp" : ".jpg";
    const cleanName = fileName.replace(/\.[^/.]+$/, "") + (mode === "avatar" ? "-avatar" : "-cropped") + ext;
    saveAs(previewBlob, cleanName);
    toast.success(`Downloaded "${cleanName}"!`, "Success");
  };

  const handleCopy = async () => {
    if (!previewBlob) return;
    try {
      if (window.ClipboardItem && navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": previewBlob })]);
        setCopied(true);
        toast.success("Cropped image copied to clipboard!", "Copied");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.warning("Clipboard image copy is not supported in this browser.", "Unsupported");
      }
    } catch {
      toast.error("Could not copy image to clipboard", "Error");
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageSrc(null);
    setPreviewBlob(null);
    setPreviewUrl(null);
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Cleared image", "Reset");
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
          Crop photos with precision aspect ratios or create circular profile avatars with custom border rings.
          Processed 100% locally in your browser for absolute privacy and speed.
        </p>
      </div>

      {/* ── Mode Switcher ────────────────────────────────────────────── */}
      <div className="mode-switcher" style={{ marginTop: 20 }}>
        <button
          type="button"
          className={`mode-btn ${mode === "cropper" ? "active" : ""}`}
          onClick={() => setMode("cropper")}
        >
          <FiCrop /> Standard Cropper
        </button>
        <button
          type="button"
          className={`mode-btn ${mode === "avatar" ? "active" : ""}`}
          onClick={() => setMode("avatar")}
        >
          <FiUser /> Circle Avatar Maker
        </button>
      </div>

      {/* ── UPLOAD OR CANVAS AREA ────────────────────────────────────── */}
      {!imageSrc ? (
        <div
          className="tool-upload-area"
          style={{ minHeight: 260 }}
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
            <h3>Drop your photo here</h3>
            <p>or click to browse from your device</p>
            <div className="btn-browse" style={{ marginTop: 12 }}>
              Choose Photo
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleImage();
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
                Try With Sample Avatar Image
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Main Workspace: Crop Canvas on Left, Settings on Right */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
              marginTop: 10,
            }}
          >
            {/* ── Left Column: Interactive Crop Viewport ─────────────────── */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1" }}>
                  Original: {naturalSize.width} &times; {naturalSize.height} px
                </span>
                <button
                  type="button"
                  className="btn-clear-all"
                  onClick={handleClear}
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  <FiTrash2 /> Change Image
                </button>
              </div>

              <div
                ref={containerRef}
                style={{
                  position: "relative",
                  width: "100%",
                  maxHeight: 520,
                  background:
                    "repeating-conic-gradient(rgba(255,255,255,0.04) 0% 25%, rgba(0,0,0,0.3) 0% 50%) 50% / 20px 20px",
                  borderRadius: 16,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.1)",
                  userSelect: "none",
                }}
              >
                {/* Base Image */}
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop Target"
                  onLoad={onImageLoad}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: 520,
                    objectFit: "contain",
                    transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    transition: "transform 0.15s ease",
                    pointerEvents: "none",
                  }}
                />

                {/* Dark Dimmer Backdrop with Cutout */}
                {displaySize.width > 0 && (
                  <div
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    style={{
                      position: "absolute",
                      inset: 0,
                      cursor: isDragging ? "grabbing" : "default",
                    }}
                  >
                    {/* SVG Cutout Overlay */}
                    <svg
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                      }}
                    >
                      <defs>
                        <mask id="crop-mask">
                          <rect width="100%" height="100%" fill="white" />
                          {mode === "avatar" ? (
                            <circle
                              cx={cropRect.x + cropRect.width / 2}
                              cy={cropRect.y + cropRect.height / 2}
                              r={Math.min(cropRect.width, cropRect.height) / 2}
                              fill="black"
                            />
                          ) : (
                            <rect
                              x={cropRect.x}
                              y={cropRect.y}
                              width={cropRect.width}
                              height={cropRect.height}
                              fill="black"
                            />
                          )}
                        </mask>
                      </defs>
                      <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#crop-mask)" />
                    </svg>

                    {/* Interactive Bounding Box */}
                    <div
                      onPointerDown={(e) => onPointerDown("move", e)}
                      style={{
                        position: "absolute",
                        left: cropRect.x,
                        top: cropRect.y,
                        width: cropRect.width,
                        height: cropRect.height,
                        borderRadius: mode === "avatar" ? "50%" : 0,
                        border: "2px solid #ff6b35",
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.4)",
                        cursor: "move",
                      }}
                    >
                      {/* Grid Lines (Rule of Thirds) */}
                      {mode === "cropper" && (
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                          <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.3)" }} />
                          <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.3)" }} />
                          <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.3)" }} />
                          <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.3)" }} />
                        </div>
                      )}

                      {/* Resize Handles */}
                      {(["tl", "tr", "bl", "br"] as const).map((pos) => {
                        const isTop = pos.includes("t");
                        const isLeft = pos.includes("l");
                        return (
                          <div
                            key={pos}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              onPointerDown(pos, e);
                            }}
                            style={{
                              position: "absolute",
                              top: isTop ? -6 : undefined,
                              bottom: !isTop ? -6 : undefined,
                              left: isLeft ? -6 : undefined,
                              right: !isLeft ? -6 : undefined,
                              width: 14,
                              height: 14,
                              background: "#ff6b35",
                              border: "2px solid #ffffff",
                              borderRadius: 4,
                              cursor: `${isTop ? (isLeft ? "nwse" : "nesw") : isLeft ? "nesw" : "nwse"}-resize`,
                              zIndex: 10,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Rotation & Flip Toolbar */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  title="Rotate 90° Left"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <FiRotateCcw /> -90&deg;
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate 90° Right"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <FiRotateCw /> +90&deg;
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  title="Flip Horizontal (Mirror Selfie)"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: flipH ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.05)",
                    border: flipH ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: flipH ? "#fff" : "#cbd5e1",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <LuFlipHorizontal /> Flip H
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV((f) => !f)}
                  title="Flip Vertical"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: flipV ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.05)",
                    border: flipV ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: flipV ? "#fff" : "#cbd5e1",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <LuFlipVertical /> Flip V
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setFlipH(false);
                    setFlipV(false);
                    if (displaySize.width > 0) initCropBox(displaySize.width, displaySize.height, aspectKey);
                  }}
                  title="Reset Transformations"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    color: "#94a3b8",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <FiRefreshCw /> Reset
                </button>
              </div>
            </div>

            {/* ── Right Column: Settings & Live Preview ─────────────────── */}
            <div>
              {/* Aspect Ratio Presets (Only in Standard Cropper Mode) */}
              {mode === "cropper" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 10 }}>
                    Aspect Ratio Presets
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {(Object.keys(ASPECT_PRESETS) as AspectRatioKey[]).map((key) => {
                      const active = aspectKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyAspectPreset(key)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: active ? 700 : 500,
                            cursor: "pointer",
                            border: active ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.08)",
                            background: active ? "var(--gradient-primary)" : "rgba(255,255,255,0.03)",
                            color: active ? "#ffffff" : "#94a3b8",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {ASPECT_PRESETS[key].label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Avatar Profile Ring Options (Only in Avatar Mode) */}
              {mode === "avatar" && (
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
                      Profile Border Ring
                    </label>
                    <button
                      type="button"
                      className={`ai-toggle-switch ${hasBorder ? "active" : ""}`}
                      onClick={() => setHasBorder((v) => !v)}
                      role="switch"
                      aria-checked={hasBorder}
                    >
                      <span className="ai-toggle-thumb" />
                    </button>
                  </div>

                  {hasBorder && (
                    <div>
                      {/* Color Palette */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0 10px" }}>
                        {BORDER_PRESET_COLORS.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setBorderColor(item.color)}
                            title={item.name}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              border:
                                borderColor === item.color
                                  ? "2px solid #ffffff"
                                  : "1px solid rgba(255,255,255,0.2)",
                              background:
                                item.color === "gradient"
                                  ? "linear-gradient(45deg, #f58529, #dd2a7b, #8134af)"
                                  : item.color,
                              cursor: "pointer",
                              outline: borderColor === item.color ? "2px solid #ff6b35" : "none",
                            }}
                          />
                        ))}
                      </div>

                      {/* Thickness Slider */}
                      <div className="quality-slider-container" style={{ margin: 0 }}>
                        <span className="quality-slider-label" style={{ fontSize: 12 }}>
                          Border Thickness
                        </span>
                        <div className="quality-slider-wrapper">
                          <input
                            type="range"
                            min="2"
                            max="20"
                            value={borderWidth}
                            onChange={(e) => setBorderWidth(Number(e.target.value))}
                            className="quality-slider"
                          />
                          <span className="quality-value">{borderWidth}px</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Zoom Slider */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div className="quality-slider-container" style={{ margin: 0 }}>
                  <span className="quality-slider-label" style={{ fontSize: 13, fontWeight: 600 }}>
                    Zoom Scale
                  </span>
                  <div className="quality-slider-wrapper">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="quality-slider"
                    />
                    <span className="quality-value">{zoom.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              {/* Output Preview & Export Options */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: 18,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                    <FiEye /> Live Result
                  </span>
                  <span style={{ fontSize: 12, color: "#ff6b35", fontWeight: 600 }}>
                    {outputDimensions.width} &times; {outputDimensions.height} px
                  </span>
                </div>

                {/* Preview Image Visualizer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "repeating-conic-gradient(rgba(255,255,255,0.08) 0% 25%, rgba(0,0,0,0.2) 0% 50%) 50% / 16px 16px",
                    borderRadius: 12,
                    padding: 18,
                    minHeight: 180,
                    overflow: "hidden",
                  }}
                >
                  {previewUrl ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
                      {/* Main Preview */}
                      <img
                        src={previewUrl}
                        alt="Cropped Output"
                        style={{
                          width: 130,
                          height: 130,
                          objectFit: "cover",
                          borderRadius: mode === "avatar" ? "50%" : 8,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        }}
                      />

                      {/* Social Size Mockups (Avatar Mode) */}
                      {mode === "avatar" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>Profile Preview</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img
                              src={previewUrl}
                              alt="Medium Avatar"
                              style={{ width: 48, height: 48, borderRadius: "50%" }}
                            />
                            <img
                              src={previewUrl}
                              alt="Small Avatar"
                              style={{ width: 32, height: 32, borderRadius: "50%" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "#888" }}>Generating preview...</span>
                  )}
                </div>

                {/* Format Selector */}
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  {[
                    { label: "PNG", format: "image/png" as const },
                    { label: "JPG", format: "image/jpeg" as const },
                    { label: "WebP", format: "image/webp" as const },
                  ].map((fmt) => (
                    <button
                      key={fmt.format}
                      type="button"
                      onClick={() => setOutputFormat(fmt.format)}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: outputFormat === fmt.format ? 700 : 500,
                        cursor: "pointer",
                        border:
                          outputFormat === fmt.format
                            ? "1px solid #ff6b35"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          outputFormat === fmt.format
                            ? "rgba(255,107,53,0.2)"
                            : "rgba(255,255,255,0.03)",
                        color: outputFormat === fmt.format ? "#fff" : "#94a3b8",
                      }}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <motion.button
                    type="button"
                    className="btn-download"
                    onClick={handleDownload}
                    disabled={!previewBlob || isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ flex: 1 }}
                  >
                    <FiDownload />
                    Download {mode === "avatar" ? "Avatar" : "Cropped Photo"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!previewBlob || isProcessing}
                    title="Copy to clipboard"
                    style={{
                      padding: "0 18px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.14)",
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
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
