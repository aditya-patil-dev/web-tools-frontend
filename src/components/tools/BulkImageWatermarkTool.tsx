"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
  FiUpload,
  FiDownload,
  FiType,
  FiImage,
  FiGrid,
  FiTrash2,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiLayers,
  FiZap,
  FiEye,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";

const MAX_FILES = 30;
type WatermarkType = "text" | "logo";
type PositionType =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "tile";

interface UploadedImage {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  sizeBytes: number;
}

interface ProcessedImage {
  id: string;
  name: string;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

// 9-point anchor positions
const ANCHORS: { id: PositionType; label: string }[] = [
  { id: "top-left", label: "TL" },
  { id: "top-center", label: "TC" },
  { id: "top-right", label: "TR" },
  { id: "middle-left", label: "ML" },
  { id: "center", label: "C" },
  { id: "middle-right", label: "MR" },
  { id: "bottom-left", label: "BL" },
  { id: "bottom-center", label: "BC" },
  { id: "bottom-right", label: "BR" },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function BulkImageWatermarkTool() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  // Watermark Settings
  const [wmType, setWmType] = useState<WatermarkType>("text");
  const [position, setPosition] = useState<PositionType>("bottom-right");
  const [opacity, setOpacity] = useState<number>(80); // 10 - 100
  const [margin, setMargin] = useState<number>(24); // px margin from edges

  // Text Watermark Settings
  const [text, setText] = useState<string>("© Fusion Tools");
  const [fontFamily, setFontFamily] = useState<string>("sans-serif");
  const [fontSizePercent, setFontSizePercent] = useState<number>(4); // % of image height
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [textBg, setTextBg] = useState<boolean>(true); // semi-transparent pill behind text
  const [rotation, setRotation] = useState<number>(0); // -90 to 90

  // Logo Watermark Settings
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoName, setLogoName] = useState<string>("");
  const [logoScalePercent, setLogoScalePercent] = useState<number>(18); // % of image width

  // Processing & Export
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Load sample demo images
  const loadSampleImages = () => {
    const samples = [
      { name: "mountain-view.png", color1: "#0f172a", color2: "#1e3a8a", icon: "🏔️", title: "Alpine Horizon" },
      { name: "sunset-ocean.png", color1: "#831843", color2: "#ea580c", icon: "🌅", title: "Golden Coast" },
      { name: "neon-city.png", color1: "#4c1d95", color2: "#065f46", icon: "🌃", title: "Cyber Metro" },
    ];

    const generatedItems: UploadedImage[] = samples.map((s, idx) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, s.color1);
        grad.addColorStop(1, s.color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        ctx.font = "140px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.icon, 600, 360);

        ctx.font = "bold 52px sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillText(s.title, 600, 520);
      }

      const dataUrl = canvas.toDataURL("image/png");
      const byteChars = atob(dataUrl.split(",")[1]);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: "image/png" });
      const file = new File([blob], s.name, { type: "image/png" });

      return {
        id: `sample-${idx}-${Date.now()}`,
        file,
        name: s.name,
        previewUrl: dataUrl,
        sizeBytes: blob.size,
      };
    });

    setImages(generatedItems);
    setActivePreviewIndex(0);
    setProcessedImages([]);
    toast.success("Loaded 3 demo images! Customize your watermark below.", "Sample Loaded");
  };

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
    if (e.target) e.target.value = "";
  };

  const processFiles = (files: File[]) => {
    const valid = files.filter((f) => f.type.startsWith("image/"));
    if (valid.length !== files.length) {
      toast.warning("Some non-image files were skipped.", "Invalid Files");
    }
    if (!valid.length) return;

    if (images.length + valid.length > MAX_FILES) {
      toast.error(`You can add up to ${MAX_FILES} images at once.`, "Upload Limit");
      return;
    }

    const newItems: UploadedImage[] = valid.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      sizeBytes: file.size,
    }));

    setImages((prev) => [...prev, ...newItems]);
    setProcessedImages([]);
    toast.success(`${newItems.length} image(s) added!`, "Images Uploaded");
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a PNG, SVG, or JPG logo.", "Invalid Logo");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoSrc(event.target?.result as string);
      setLogoName(file.name);
      toast.success(`Loaded logo "${file.name}"`, "Logo Ready");
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    processFiles(files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (activePreviewIndex >= index && activePreviewIndex > 0) {
      setActivePreviewIndex(activePreviewIndex - 1);
    }
    setProcessedImages([]);
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    processedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
    setImages([]);
    setProcessedImages([]);
    setLivePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Cleared all images", "Reset");
  };

  // Render watermark on a target canvas
  const applyWatermarkToCanvas = useCallback(
    async (
      imgElement: HTMLImageElement,
      logoElement: HTMLImageElement | null
    ): Promise<HTMLCanvasElement> => {
      const canvas = document.createElement("canvas");
      canvas.width = imgElement.naturalWidth;
      canvas.height = imgElement.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Draw original image
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.globalAlpha = opacity / 100;

      const W = canvas.width;
      const H = canvas.height;

      // ── TYPE A: TEXT WATERMARK ──────────────────────────────────────────
      if (wmType === "text" && text.trim()) {
        const computedFontSize = Math.max(14, Math.round((H * fontSizePercent) / 100));
        ctx.font = `600 ${computedFontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = computedFontSize;

        if (position === "tile") {
          // Repeating diagonal tiled pattern
          const tileAngle = -30 * (Math.PI / 180);
          ctx.rotate(tileAngle);

          const stepX = textWidth + 140;
          const stepY = textHeight + 100;

          const diag = Math.sqrt(W * W + H * H);
          for (let x = -diag; x < diag * 1.5; x += stepX) {
            for (let y = -diag; y < diag * 1.5; y += stepY) {
              ctx.fillStyle = textColor;
              ctx.fillText(text, x, y);
            }
          }
        } else {
          // Calculate 9-point anchor coordinate
          let x = margin;
          let y = margin + textHeight;

          if (position.includes("center") || position === "center") {
            x = (W - textWidth) / 2;
          } else if (position.includes("right")) {
            x = W - textWidth - margin;
          }

          if (position.includes("middle") || position === "center") {
            y = (H + textHeight) / 2;
          } else if (position.includes("bottom")) {
            y = H - margin;
          }

          ctx.save();
          if (rotation !== 0) {
            ctx.translate(x + textWidth / 2, y - textHeight / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-(x + textWidth / 2), -(y - textHeight / 2));
          }

          // Optional subtle pill backdrop for contrast
          if (textBg) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            const padX = computedFontSize * 0.4;
            const padY = computedFontSize * 0.25;
            ctx.beginPath();
            ctx.roundRect(
              x - padX,
              y - textHeight - padY * 0.3,
              textWidth + padX * 2,
              textHeight + padY * 1.5,
              computedFontSize * 0.3
            );
            ctx.fill();
          }

          ctx.fillStyle = textColor;
          ctx.textBaseline = "alphabetic";
          ctx.fillText(text, x, y);
          ctx.restore();
        }
      }

      // ── TYPE B: LOGO WATERMARK ──────────────────────────────────────────
      if (wmType === "logo" && logoElement) {
        const logoTargetW = Math.max(30, Math.round((W * logoScalePercent) / 100));
        const aspect = logoElement.naturalHeight / logoElement.naturalWidth;
        const logoTargetH = logoTargetW * aspect;

        if (position === "tile") {
          const tileAngle = -25 * (Math.PI / 180);
          ctx.rotate(tileAngle);
          const stepX = logoTargetW + 120;
          const stepY = logoTargetH + 100;
          const diag = Math.sqrt(W * W + H * H);

          for (let x = -diag; x < diag * 1.5; x += stepX) {
            for (let y = -diag; y < diag * 1.5; y += stepY) {
              ctx.drawImage(logoElement, x, y, logoTargetW, logoTargetH);
            }
          }
        } else {
          let x = margin;
          let y = margin;

          if (position.includes("center") || position === "center") {
            x = (W - logoTargetW) / 2;
          } else if (position.includes("right")) {
            x = W - logoTargetW - margin;
          }

          if (position.includes("middle") || position === "center") {
            y = (H - logoTargetH) / 2;
          } else if (position.includes("bottom")) {
            y = H - logoTargetH - margin;
          }

          ctx.drawImage(logoElement, x, y, logoTargetW, logoTargetH);
        }
      }

      ctx.restore();
      return canvas;
    },
    [
      wmType,
      text,
      fontFamily,
      fontSizePercent,
      textColor,
      textBg,
      rotation,
      position,
      opacity,
      margin,
      logoScalePercent,
    ]
  );

  // Update Live Preview for currently active image
  useEffect(() => {
    if (!images.length || activePreviewIndex >= images.length) {
      setLivePreviewUrl(null);
      return;
    }

    let isMounted = true;
    const current = images[activePreviewIndex];

    const generatePreview = async () => {
      try {
        const img = new Image();
        img.src = current.previewUrl;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });

        let logoImg: HTMLImageElement | null = null;
        if (wmType === "logo" && logoSrc) {
          logoImg = new Image();
          logoImg.src = logoSrc;
          await new Promise((res, rej) => {
            logoImg!.onload = res;
            logoImg!.onerror = rej;
          });
        }

        const canvas = await applyWatermarkToCanvas(img, logoImg);
        canvas.toBlob((blob) => {
          if (blob && isMounted) {
            const url = URL.createObjectURL(blob);
            setLivePreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          }
        }, "image/jpeg", 0.9);
      } catch (err) {
        console.error(err);
      }
    };

    const timer = setTimeout(generatePreview, 120);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [images, activePreviewIndex, applyWatermarkToCanvas, wmType, logoSrc]);

  // Bulk Apply & Process
  const handleBulkProcess = async () => {
    if (!images.length) {
      toast.error("Please upload images first.", "No Images");
      return;
    }

    if (wmType === "logo" && !logoSrc) {
      toast.error("Please upload a watermark logo image first.", "No Logo");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    toast.info(`Watermarking ${images.length} images...`, "Processing");

    let logoImg: HTMLImageElement | null = null;
    if (wmType === "logo" && logoSrc) {
      logoImg = new Image();
      logoImg.src = logoSrc;
      await new Promise((res, rej) => {
        logoImg!.onload = res;
        logoImg!.onerror = rej;
      });
    }

    const results: ProcessedImage[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
        });

        const canvas = await applyWatermarkToCanvas(img, logoImg);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
            item.file.type.includes("png") ? "image/png" : "image/jpeg",
            0.92
          );
        });

        const previewUrl = URL.createObjectURL(blob);
        const ext = item.file.type.includes("png") ? ".png" : ".jpg";
        const cleanName = item.name.replace(/\.[^/.]+$/, "") + "-watermarked" + ext;

        results.push({
          id: `wm-${i}-${Date.now()}`,
          name: cleanName,
          blob,
          previewUrl,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: blob.size,
        });

        setProgress(Math.round(((i + 1) / images.length) * 100));
      }

      setProcessedImages(results);
      toast.success(
        `All ${results.length} images successfully watermarked!`,
        "Watermarking Complete"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to process images", "Error");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  // Downloads
  const handleDownloadSingle = (item: ProcessedImage) => {
    saveAs(item.blob, item.name);
    toast.success(`Downloaded ${item.name}!`, "Success");
  };

  const handleDownloadAll = async () => {
    if (!processedImages.length) return;

    if (processedImages.length === 1) {
      handleDownloadSingle(processedImages[0]);
      return;
    }

    toast.info("Zipping watermarked images...", "Please wait");
    try {
      const zip = new JSZip();
      processedImages.forEach((img) => {
        zip.file(img.name, img.blob);
      });
      const archive = await zip.generateAsync({ type: "blob" });
      saveAs(archive, "watermarked-images.zip");
      toast.success("ZIP download started!", "Success");
    } catch {
      toast.error("Failed to build ZIP archive", "Error");
    }
  };

  const handleCopy = async (item: ProcessedImage) => {
    try {
      if (window.ClipboardItem && navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ [item.blob.type]: item.blob })]);
        setCopiedId(item.id);
        toast.success("Image copied to clipboard!", "Copied");
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        toast.warning("Clipboard image copy not supported in this browser.", "Unsupported");
      }
    } catch {
      toast.error("Failed to copy image to clipboard", "Error");
    }
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
          Protect your photography and brand in bulk. Add custom text or transparent logo watermarks
          with 9-point positioning or full-canvas repeated tiles &mdash; processed 100% locally.
        </p>
      </div>

      {/* ── UPLOAD AREA ──────────────────────────────────────────────── */}
      {images.length === 0 ? (
        <div
          className={`tool-upload-area ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ minHeight: 250, cursor: "pointer", marginTop: 20 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="tool-file-input"
          />
          <div className="tool-upload-label">
            <FiUpload className="upload-icon" />
            <h3>Drop multiple images here to watermark</h3>
            <p>supports JPG, PNG, WebP, and BMP files</p>
            <div className="btn-browse" style={{ marginTop: 12 }}>
              Select Images
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSampleImages();
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
                Try With 3 Sample Photos
              </button>
            </div>
            <div className="uploader-tags" style={{ marginTop: 16 }}>
              <div className="uploader-tag">
                <FiLayers /> Up to {MAX_FILES} photos
              </div>
              <div className="uploader-tag">
                <FiZap /> Batch ZIP Export
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {/* Top Bar with Image Count & Add More */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {images.length} Image{images.length > 1 ? "s" : ""} Selected
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#e2e8f0",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                + Add More
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>
            <button
              type="button"
              className="btn-clear-all"
              onClick={clearAll}
              style={{ fontSize: 12, padding: "5px 12px" }}
            >
              <FiTrash2 /> Clear All
            </button>
          </div>

          {/* ── Main Layout: Live Preview on Left, Watermark Studio on Right ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {/* ── Left Column: Live Preview & Image Selector ───────────── */}
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 380,
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
                    alt="Watermark Live Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>Rendering preview...</div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(4px)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  Live Preview: {images[activePreviewIndex]?.name}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 12,
                  overflowX: "auto",
                  paddingBottom: 6,
                }}
              >
                {images.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => setActivePreviewIndex(idx)}
                    style={{
                      position: "relative",
                      width: 64,
                      height: 64,
                      flexShrink: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      border:
                        activePreviewIndex === idx
                          ? "2px solid #ff6b35"
                          : "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      background: "#000",
                    }}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      title="Remove"
                      style={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 18,
                        height: 18,
                        background: "rgba(0,0,0,0.7)",
                        border: "none",
                        borderRadius: "50%",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        cursor: "pointer",
                      }}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: Watermark Controls ─────────────────────── */}
            <div>
              {/* Type Switcher: Text vs Logo */}
              <div className="mode-switcher" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className={`mode-btn ${wmType === "text" ? "active" : ""}`}
                  onClick={() => setWmType("text")}
                >
                  <FiType /> Text Watermark
                </button>
                <button
                  type="button"
                  className={`mode-btn ${wmType === "logo" ? "active" : ""}`}
                  onClick={() => setWmType("logo")}
                >
                  <FiImage /> Logo Watermark
                </button>
              </div>

              {/* ── TEXT WATERMARK SETTINGS ── */}
              {wmType === "text" && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  {/* Text Input */}
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 6 }}>
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. © 2026 BrandName"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      marginBottom: 14,
                    }}
                  />

                  {/* Font, Color & Background Pill */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                        Font Family
                      </span>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                          fontSize: 12,
                        }}
                      >
                        <option value="sans-serif">Modern Sans</option>
                        <option value="serif">Classic Serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="Impact">Impact (Bold)</option>
                        <option value="cursive">Signature Script</option>
                      </select>
                    </div>

                    <div>
                      <span style={{ display: "block", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                        Text Color
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          style={{
                            width: 34,
                            height: 34,
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            background: "transparent",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setTextBg((v) => !v)}
                          style={{
                            flex: 1,
                            padding: "6px 8px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: textBg ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
                            background: textBg ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.04)",
                            color: textBg ? "#fff" : "#94a3b8",
                          }}
                        >
                          Pill Backdrop
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Size & Rotation Sliders */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Font Size ({fontSizePercent}%)</span>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        value={fontSizePercent}
                        onChange={(e) => setFontSizePercent(Number(e.target.value))}
                        className="quality-slider"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Rotation ({rotation}&deg;)</span>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="quality-slider"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── LOGO WATERMARK SETTINGS ── */}
              {wmType === "logo" && (
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
                    Logo Watermark File
                  </label>
                  {!logoSrc ? (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      style={{
                        width: "100%",
                        padding: "16px",
                        borderRadius: 10,
                        border: "2px dashed rgba(255, 107, 53, 0.4)",
                        background: "rgba(255, 107, 53, 0.05)",
                        color: "#ff6b35",
                        fontWeight: 600,
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      <FiUpload style={{ marginRight: 6 }} /> Choose PNG / SVG Logo
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={logoSrc}
                          alt="Watermark Logo"
                          style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }}
                        />
                        <span style={{ fontSize: 12, color: "#fff" }}>{logoName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff6b35",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        Change
                      </button>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />

                  {/* Logo Scale Slider */}
                  <div style={{ marginTop: 14 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Logo Size ({logoScalePercent}% of image)</span>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={logoScalePercent}
                      onChange={(e) => setLogoScalePercent(Number(e.target.value))}
                      className="quality-slider"
                    />
                  </div>
                </div>
              )}

              {/* ── POSITION & OPACITY GRID ── */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* 9-Point Anchor Box */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#cbd5e1", marginBottom: 8 }}>
                      Position Placement
                    </label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 6,
                        width: 120,
                      }}
                    >
                      {ANCHORS.map((a) => {
                        const active = position === a.id;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setPosition(a.id)}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: "pointer",
                              border: active ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
                              background: active ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                              color: active ? "#fff" : "#94a3b8",
                            }}
                          >
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                    {/* Tile Pattern Button */}
                    <button
                      type="button"
                      onClick={() => setPosition("tile")}
                      style={{
                        marginTop: 8,
                        width: 120,
                        padding: "6px 8px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: position === "tile" ? "1px solid #ff6b35" : "1px solid rgba(255,255,255,0.1)",
                        background: position === "tile" ? "var(--gradient-primary)" : "rgba(255,255,255,0.04)",
                        color: position === "tile" ? "#fff" : "#94a3b8",
                      }}
                    >
                      <FiGrid style={{ marginRight: 4 }} /> Tile Pattern
                    </button>
                  </div>

                  {/* Opacity & Margin */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>Opacity ({opacity}%)</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="quality-slider"
                      />
                    </div>
                    {position !== "tile" && (
                      <div style={{ marginTop: 10 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>Edge Margin ({margin}px)</span>
                        <input
                          type="range"
                          min="8"
                          max="80"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="quality-slider"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── CONVERT TRIGGER ── */}
              <motion.button
                type="button"
                className="btn-convert"
                onClick={handleBulkProcess}
                disabled={isProcessing}
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner" />
                    Watermarking Images... {progress}%
                  </>
                ) : (
                  <>
                    <FiLayers />
                    Apply Watermark to All ({images.length}) Images
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* ── RESULTS SECTION ── */}
          <AnimatePresence>
            {processedImages.length > 0 && (
              <motion.div
                className="tool-result-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                style={{ marginTop: 32 }}
              >
                <div className="result-header">
                  <FiCheckCircle className="success-icon" />
                  <h3>Watermarking Complete!</h3>
                  <p>
                    {processedImages.length} image{processedImages.length > 1 ? "s" : ""} watermarked with high precision
                  </p>
                </div>

                <div className="preview-grid">
                  {processedImages.map((img) => (
                    <motion.div
                      key={img.id}
                      className="preview-item converted"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div
                        style={{
                          height: 120,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#000",
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>
                      <div className="preview-badge">PROTECTED</div>
                      <div className="preview-name">{img.name}</div>
                      <div className="preview-size">
                        {img.width} &times; {img.height} px &bull; {formatBytes(img.sizeBytes)}
                      </div>

                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(img)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            padding: "6px 8px",
                            background: "rgba(255, 107, 53, 0.2)",
                            border: "1px solid rgba(255, 107, 53, 0.4)",
                            borderRadius: 6,
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FiDownload /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(img)}
                          title="Copy image"
                          style={{
                            padding: "6px 10px",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: 6,
                            color: copiedId === img.id ? "#10b981" : "#cbd5e1",
                            fontSize: 11,
                            cursor: "pointer",
                          }}
                        >
                          {copiedId === img.id ? <FiCheck /> : <FiCopy />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  type="button"
                  className="btn-download"
                  onClick={handleDownloadAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ marginTop: 24 }}
                >
                  <FiDownload />
                  Download {processedImages.length > 1 ? `All as ZIP (${processedImages.length})` : "Watermarked Image"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
