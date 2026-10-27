"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import { RiArrowLeftRightFill } from "react-icons/ri";
import {
  FiUpload,
  FiDownload,
  FiX,
  FiCheckCircle,
  FiTrash2,
  FiFileText,
  FiZap,
  FiLayers,
  FiCode,
  FiCopy,
  FiCheck,
  FiEye,
  FiMaximize2,
} from "react-icons/fi";

const MAX_FILES = 25;
type ScaleOption = 1 | 2 | 4 | 8 | "custom";
type BackgroundOption = "transparent" | "white" | "black" | "custom";
type InputTab = "upload" | "paste";

interface SvgMeta {
  width: number;
  height: number;
  viewBox?: string;
}

interface SvgItem {
  id: string;
  name: string;
  svgContent: string;
  originalSize: number;
  previewUrl: string;
  meta: SvgMeta;
}

interface ConvertedPng {
  id: string;
  name: string;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

// Helper to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Parse SVG string to get width, height, and viewBox
function parseSvgMeta(svgText: string): SvgMeta {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgEl = doc.querySelector("svg");
    if (!svgEl) return { width: 500, height: 500 };

    let width = parseFloat(svgEl.getAttribute("width") || "");
    let height = parseFloat(svgEl.getAttribute("height") || "");
    const viewBox = svgEl.getAttribute("viewBox");

    if ((!width || !height || isNaN(width) || isNaN(height)) && viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && !isNaN(parts[2]) && !isNaN(parts[3])) {
        width = parts[2];
        height = parts[3];
      }
    }

    if (!width || isNaN(width)) width = 500;
    if (!height || isNaN(height)) height = 500;

    return {
      width: Math.round(width),
      height: Math.round(height),
      viewBox: viewBox || undefined,
    };
  } catch {
    return { width: 500, height: 500 };
  }
}

// Render SVG string onto a canvas and return a PNG blob
function renderSvgToPng(
  svgContent: string,
  targetWidth: number,
  targetHeight: number,
  bgColor: BackgroundOption,
  customHex: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) {
        return reject(new Error("Invalid SVG content"));
      }

      if (!svgEl.getAttribute("xmlns")) {
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      // If viewBox is missing, synthesize one from width/height so it scales cleanly
      if (!svgEl.getAttribute("viewBox")) {
        const origW = parseFloat(svgEl.getAttribute("width") || "") || targetWidth;
        const origH = parseFloat(svgEl.getAttribute("height") || "") || targetHeight;
        svgEl.setAttribute("viewBox", `0 0 ${origW} ${origH}`);
      }

      svgEl.setAttribute("width", targetWidth.toString());
      svgEl.setAttribute("height", targetHeight.toString());

      const serializer = new XMLSerializer();
      const serialized = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([serialized], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error("Unable to create canvas context"));
        }

        // Apply background if not transparent
        if (bgColor === "white") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (bgColor === "black") {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (bgColor === "custom") {
          ctx.fillStyle = customHex || "#ffffff";
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(url);

        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            resolve(pngBlob);
          } else {
            reject(new Error("Failed to export PNG from canvas"));
          }
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to render SVG"));
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b35" />
      <stop offset="100%" stop-color="#f7c59f" />
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="90" fill="url(#grad)" />
  <path d="M70 100 L90 120 L135 75" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
</svg>`;

export default function SvgToPngTool() {
  const [tab, setTab] = useState<InputTab>("upload");
  const [svgList, setSvgList] = useState<SvgItem[]>([]);
  const [pastedCode, setPastedCode] = useState<string>("");
  const [pastedMeta, setPastedMeta] = useState<SvgMeta | null>(null);

  // Settings
  const [scale, setScale] = useState<ScaleOption>(2);
  const [customWidth, setCustomWidth] = useState<number>(1000);
  const [customHeight, setCustomHeight] = useState<number>(1000);
  const [bgMode, setBgMode] = useState<BackgroundOption>("transparent");
  const [customHex, setCustomHex] = useState<string>("#ffffff");

  // Output & Processing
  const [loading, setLoading] = useState<boolean>(false);
  const [convertProgress, setConvertProgress] = useState<number>(0);
  const [convertedPngs, setConvertedPngs] = useState<ConvertedPng[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse pasted SVG metadata
  useEffect(() => {
    if (tab === "paste" && pastedCode.trim()) {
      const meta = parseSvgMeta(pastedCode);
      setPastedMeta(meta);
      if (scale !== "custom") {
        setCustomWidth(meta.width * (scale as number));
        setCustomHeight(meta.height * (scale as number));
      }
    } else {
      setPastedMeta(null);
    }
  }, [pastedCode, tab, scale]);

  // Handle incoming SVG files
  const processFiles = useCallback(
    async (files: File[]) => {
      const svgFiles = files.filter(
        (f) =>
          f.type === "image/svg+xml" ||
          f.name.toLowerCase().endsWith(".svg")
      );

      if (svgFiles.length !== files.length) {
        toast.warning(
          "Some files were skipped. Only .svg files are supported.",
          "Invalid File Type"
        );
      }

      if (!svgFiles.length) return;

      if (svgList.length + svgFiles.length > MAX_FILES) {
        toast.error(
          `You can only convert up to ${MAX_FILES} SVGs at once.`,
          "Upload Limit Exceeded"
        );
        return;
      }

      const newItems: SvgItem[] = [];

      for (const file of svgFiles) {
        try {
          const text = await file.text();
          const meta = parseSvgMeta(text);
          const previewBlob = new Blob([text], {
            type: "image/svg+xml;charset=utf-8",
          });
          newItems.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            svgContent: text,
            originalSize: file.size,
            previewUrl: URL.createObjectURL(previewBlob),
            meta,
          });
        } catch {
          toast.error(`Could not read "${file.name}"`, "Read Error");
        }
      }

      setSvgList((prev) => [...prev, ...newItems]);
      setConvertedPngs([]);
      toast.success(
        `${newItems.length} SVG file(s) loaded!`,
        "Upload Complete"
      );
    },
    [svgList.length]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    processFiles(files);
    if (e.target) e.target.value = "";
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    processFiles(files);
  };

  const removeSvg = (index: number) => {
    const target = svgList[index];
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    setSvgList((prev) => prev.filter((_, i) => i !== index));
    setConvertedPngs([]);
  };

  const clearAll = () => {
    svgList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    convertedPngs.forEach((png) => URL.revokeObjectURL(png.previewUrl));
    setSvgList([]);
    setConvertedPngs([]);
    setPastedCode("");
    setPastedMeta(null);
    setConvertProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Cleared all items", "Reset");
  };

  // Convert execution
  const handleConvert = async () => {
    const itemsToConvert: { name: string; content: string; meta: SvgMeta }[] = [];

    if (tab === "upload") {
      if (!svgList.length) {
        toast.error("Please upload at least one SVG file first.", "No Files");
        return;
      }
      svgList.forEach((item) => {
        itemsToConvert.push({
          name: item.name.replace(/\.[^/.]+$/, "") + ".png",
          content: item.svgContent,
          meta: item.meta,
        });
      });
    } else {
      if (!pastedCode.trim()) {
        toast.error("Please paste valid SVG markup first.", "Empty SVG");
        return;
      }
      const meta = pastedMeta || parseSvgMeta(pastedCode);
      itemsToConvert.push({
        name: "vector-graphic.png",
        content: pastedCode,
        meta,
      });
    }

    setLoading(true);
    setConvertProgress(0);
    toast.info("Converting SVG to PNG...", "Processing");

    const results: ConvertedPng[] = [];

    try {
      for (let i = 0; i < itemsToConvert.length; i++) {
        const item = itemsToConvert[i];
        let targetW = item.meta.width;
        let targetH = item.meta.height;

        if (scale === "custom") {
          targetW = customWidth > 0 ? customWidth : item.meta.width;
          targetH = customHeight > 0 ? customHeight : item.meta.height;
        } else {
          targetW = Math.round(item.meta.width * scale);
          targetH = Math.round(item.meta.height * scale);
        }

        const pngBlob = await renderSvgToPng(
          item.content,
          targetW,
          targetH,
          bgMode,
          customHex
        );

        const previewUrl = URL.createObjectURL(pngBlob);
        results.push({
          id: `png-${i}-${Date.now()}`,
          name: item.name,
          blob: pngBlob,
          previewUrl,
          width: targetW,
          height: targetH,
          sizeBytes: pngBlob.size,
        });

        setConvertProgress(Math.round(((i + 1) / itemsToConvert.length) * 100));
      }

      setConvertedPngs(results);
      toast.success(
        `${results.length} PNG image(s) generated successfully!`,
        "Conversion Complete"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Error converting SVG to PNG. Check your markup.",
        "Conversion Failed"
      );
    } finally {
      setLoading(false);
      setConvertProgress(0);
    }
  };

  // Download logic
  const handleDownloadSingle = (png: ConvertedPng) => {
    saveAs(png.blob, png.name);
    toast.success(`Downloaded ${png.name}!`, "Success");
  };

  const handleDownloadAll = async () => {
    if (!convertedPngs.length) return;

    if (convertedPngs.length === 1) {
      handleDownloadSingle(convertedPngs[0]);
      return;
    }

    toast.info("Building ZIP package...", "Please wait");
    try {
      const zip = new JSZip();
      convertedPngs.forEach((item) => {
        zip.file(item.name, item.blob);
      });
      const archive = await zip.generateAsync({ type: "blob" });
      saveAs(archive, "converted-svg-pngs.zip");
      toast.success("ZIP download started!", "Success");
    } catch {
      toast.error("Failed to build ZIP file", "Download Failed");
    }
  };

  // Copy PNG blob to clipboard
  const handleCopy = async (png: ConvertedPng) => {
    try {
      if (typeof window !== "undefined" && window.ClipboardItem && navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": png.blob }),
        ]);
        setCopiedId(png.id);
        toast.success("Copied PNG image to clipboard!", "Clipboard");
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        toast.warning(
          "Clipboard image copy is not supported in this browser.",
          "Clipboard"
        );
      }
    } catch {
      toast.error("Could not copy image to clipboard", "Error");
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
          Convert SVG vectors to high-resolution PNG images. Choose resolution multipliers,
          transparency, or solid backgrounds &mdash; processed 100% locally in your browser.
        </p>
      </div>

      {/* ── Mode Switcher ────────────────────────────────────────────── */}
      <div className="mode-switcher" style={{ marginTop: 20 }}>
        <button
          type="button"
          className={`mode-btn ${tab === "upload" ? "active" : ""}`}
          onClick={() => {
            setTab("upload");
            setConvertedPngs([]);
          }}
        >
          <FiUpload /> Upload SVG Files
        </button>
        <button
          type="button"
          className={`mode-btn ${tab === "paste" ? "active" : ""}`}
          onClick={() => {
            setTab("paste");
            setConvertedPngs([]);
          }}
        >
          <FiCode /> Paste SVG Code
        </button>
      </div>

      {/* ── TAB 1: FILE UPLOADER ─────────────────────────────────────── */}
      {tab === "upload" && (
        <div
          className={`tool-upload-area ${dragActive ? "drag-active" : ""} ${
            svgList.length > 0 ? "has-files" : ""
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            id="inputSvg"
            type="file"
            accept=".svg,image/svg+xml"
            multiple
            onChange={handleFileChange}
            className="tool-file-input"
          />

          <label htmlFor="inputSvg" className="tool-upload-label">
            <FiUpload className="upload-icon" />
            <h3>Drop SVG files here</h3>
            <p>or click to browse from your computer</p>

            <div className="btn-browse">Browse SVG Files</div>

            <div className="uploader-tags">
              <div className="uploader-tag">
                <FiFileText /> SVG only
              </div>
              <div className="uploader-tag">
                <FiZap /> Infinite scaling
              </div>
              <div className="uploader-tag">
                <FiLayers /> Up to {MAX_FILES} files
              </div>
            </div>
          </label>
        </div>
      )}

      {/* ── TAB 2: CODE PASTER ──────────────────────────────────────── */}
      {tab === "paste" && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FiCode /> Paste &lt;svg&gt; markup here
            </span>
            <button
              type="button"
              onClick={() => setPastedCode(SAMPLE_SVG)}
              style={{
                background: "rgba(255, 107, 53, 0.15)",
                border: "1px solid rgba(255, 107, 53, 0.3)",
                color: "#ff6b35",
                fontSize: 12,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Load Sample
            </button>
          </div>

          <textarea
            value={pastedCode}
            onChange={(e) => setPastedCode(e.target.value)}
            placeholder="<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>&#10;  <circle cx='50' cy='50' r='40' fill='#ff6b35' />&#10;</svg>"
            rows={7}
            style={{
              width: "100%",
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              color: "#f8fafc",
              padding: 14,
              fontFamily: "monospace",
              fontSize: 13,
              resize: "vertical",
              outline: "none",
            }}
          />

          {pastedMeta && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              <span>
                Detected Size:{" "}
                <strong style={{ color: "#fff" }}>
                  {pastedMeta.width} &times; {pastedMeta.height} px
                </strong>
              </span>
              {pastedMeta.viewBox && (
                <span>
                  viewBox:{" "}
                  <code style={{ color: "#ff6b35" }}>{pastedMeta.viewBox}</code>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS: Scale & Background ────────────────────────────── */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: 20,
          margin: "20px 0",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Resolution / Scale */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: 8,
              }}
            >
              Export Resolution / Scale
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {([1, 2, 4, 8] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScale(s)}
                  style={{
                    flex: "1 1 50px",
                    padding: "8px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    border:
                      scale === s
                        ? "1px solid #ff6b35"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                    background:
                      scale === s
                        ? "var(--gradient-primary)"
                        : "rgba(255, 255, 255, 0.04)",
                    color: scale === s ? "#fff" : "#94a3b8",
                    transition: "all 0.2s ease",
                  }}
                >
                  {s}x {s === 1 ? "(100%)" : s === 2 ? "(Retina)" : s === 4 ? "(4K)" : "(8K)"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setScale("custom")}
                style={{
                  flex: "1 1 60px",
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border:
                    scale === "custom"
                      ? "1px solid #ff6b35"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  background:
                    scale === "custom"
                      ? "var(--gradient-primary)"
                      : "rgba(255, 255, 255, 0.04)",
                  color: scale === "custom" ? "#fff" : "#94a3b8",
                }}
              >
                Custom px
              </button>
            </div>

            {scale === "custom" && (
              <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Width (px)</span>
                  <input
                    type="number"
                    min={16}
                    max={8192}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(16, Number(e.target.value)))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  />
                </div>
                <span style={{ marginTop: 16, color: "#94a3b8" }}>&times;</span>
                <div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Height (px)</span>
                  <input
                    type="number"
                    min={16}
                    max={8192}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(16, Number(e.target.value)))}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Background Style */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#cbd5e1",
                marginBottom: 8,
              }}
            >
              Background Color
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setBgMode("transparent")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    bgMode === "transparent"
                      ? "1px solid #ff6b35"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  background:
                    bgMode === "transparent"
                      ? "rgba(255, 107, 53, 0.2)"
                      : "rgba(255, 255, 255, 0.04)",
                  color: bgMode === "transparent" ? "#fff" : "#94a3b8",
                }}
              >
                🏁 Transparent
              </button>
              <button
                type="button"
                onClick={() => setBgMode("white")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    bgMode === "white"
                      ? "1px solid #ff6b35"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  background:
                    bgMode === "white"
                      ? "rgba(255, 107, 53, 0.2)"
                      : "rgba(255, 255, 255, 0.04)",
                  color: bgMode === "white" ? "#fff" : "#94a3b8",
                }}
              >
                ⚪ White
              </button>
              <button
                type="button"
                onClick={() => setBgMode("black")}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border:
                    bgMode === "black"
                      ? "1px solid #ff6b35"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  background:
                    bgMode === "black"
                      ? "rgba(255, 107, 53, 0.2)"
                      : "rgba(255, 255, 255, 0.04)",
                  color: bgMode === "black" ? "#fff" : "#94a3b8",
                }}
              >
                ⚫ Black
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 10,
                  border:
                    bgMode === "custom"
                      ? "1px solid #ff6b35"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  background:
                    bgMode === "custom"
                      ? "rgba(255, 107, 53, 0.2)"
                      : "rgba(255, 255, 255, 0.04)",
                  cursor: "pointer",
                }}
                onClick={() => setBgMode("custom")}
              >
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => {
                    setCustomHex(e.target.value);
                    setBgMode("custom");
                  }}
                  style={{
                    width: 26,
                    height: 26,
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: "transparent",
                  }}
                  title="Pick custom color"
                />
                <span style={{ fontSize: 13, color: bgMode === "custom" ? "#fff" : "#94a3b8" }}>
                  Custom
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SELECTED SVG PREVIEWS (Upload Tab) ───────────────────────── */}
      <AnimatePresence>
        {tab === "upload" && svgList.length > 0 && (
          <motion.div
            className="tool-preview-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="preview-header">
              <h3>Uploaded SVGs ({svgList.length})</h3>
              <button
                type="button"
                className="btn-clear-all"
                onClick={clearAll}
                title="Clear all SVGs"
              >
                <FiTrash2 /> Clear All
              </button>
            </div>

            <div className="preview-grid">
              {svgList.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="preview-item"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <div
                    style={{
                      height: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "repeating-conic-gradient(rgba(255,255,255,0.06) 0% 25%, rgba(0,0,0,0.1) 0% 50%) 50% / 16px 16px",
                      borderRadius: 10,
                      overflow: "hidden",
                      padding: 10,
                    }}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="preview-remove"
                    onClick={() => removeSvg(i)}
                    title="Remove SVG"
                  >
                    <FiX />
                  </button>
                  <div className="preview-name">{item.name}</div>
                  <div className="preview-size">
                    {item.meta.width} &times; {item.meta.height} px &bull; {formatBytes(item.originalSize)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONVERT TRIGGER BUTTON ──────────────────────────────────── */}
      {(svgList.length > 0 || (tab === "paste" && pastedCode.trim().length > 0)) && (
        <div style={{ marginTop: 20 }}>
          <motion.button
            type="button"
            className="btn-convert"
            onClick={handleConvert}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Converting... {convertProgress}%
              </>
            ) : (
              <>
                <RiArrowLeftRightFill />
                Convert to PNG ({scale === "custom" ? `${customWidth}×${customHeight}px` : `${scale}x resolution`})
              </>
            )}
          </motion.button>

          {loading && (
            <motion.div
              className="progress-bar-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 14 }}
            >
              <div
                className="progress-bar"
                style={{ width: `${convertProgress}%` }}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* ── RESULTS SECTION ─────────────────────────────────────────── */}
      <AnimatePresence>
        {convertedPngs.length > 0 && (
          <motion.div
            className="tool-result-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            style={{ marginTop: 30 }}
          >
            <div className="result-header">
              <FiCheckCircle className="success-icon" />
              <h3>Conversion Complete!</h3>
              <p>
                {convertedPngs.length} PNG {convertedPngs.length > 1 ? "images" : "image"} generated
                with crisp rasterization
              </p>
            </div>

            <div className="preview-grid">
              {convertedPngs.map((png) => (
                <motion.div
                  key={png.id}
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
                      background:
                        bgMode === "transparent"
                          ? "repeating-conic-gradient(rgba(255,255,255,0.08) 0% 25%, rgba(0,0,0,0.15) 0% 50%) 50% / 16px 16px"
                          : bgMode === "white"
                          ? "#ffffff"
                          : bgMode === "black"
                          ? "#000000"
                          : customHex,
                      borderRadius: 10,
                      overflow: "hidden",
                      padding: 10,
                    }}
                  >
                    <img
                      src={png.previewUrl}
                      alt={png.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div className="preview-badge">PNG</div>
                  <div className="preview-name">{png.name}</div>
                  <div className="preview-size">
                    {png.width} &times; {png.height} px &bull; {formatBytes(png.sizeBytes)}
                  </div>

                  {/* Actions per card */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(png)}
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
                      onClick={() => handleCopy(png)}
                      title="Copy to clipboard"
                      style={{
                        padding: "6px 10px",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: 6,
                        color: copiedId === png.id ? "#10b981" : "#cbd5e1",
                        fontSize: 11,
                        cursor: "pointer",
                      }}
                    >
                      {copiedId === png.id ? <FiCheck /> : <FiCopy />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Download Main Button */}
            <motion.button
              type="button"
              className="btn-download"
              onClick={handleDownloadAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: 24 }}
            >
              <FiDownload />
              Download {convertedPngs.length > 1 ? `All as ZIP (${convertedPngs.length})` : "PNG Image"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
