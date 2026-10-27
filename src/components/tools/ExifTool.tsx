"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
  FiEye,
  FiShield,
  FiUpload,
  FiDownload,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiMapPin,
  FiCamera,
  FiSliders,
  FiCalendar,
  FiInfo,
  FiLayers,
  FiZap,
} from "react-icons/fi";

// ─────────────────────────────────────────────────────────────────────────────
// EXIF Data Types & Pure JS/TS Parser
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedExif {
  // Camera & Device
  make?: string;
  model?: string;
  software?: string;
  lensModel?: string;

  // Exposure & Capture Settings
  iso?: number;
  exposureTime?: string;
  fNumber?: string;
  focalLength?: string;
  focalLength35mm?: string;
  flash?: string;
  exposureProgram?: string;
  whiteBalance?: string;
  meteringMode?: string;

  // Dates
  dateTimeOriginal?: string;
  dateTimeDigitized?: string;
  dateTimeModified?: string;

  // Image Dimensions & Color
  width?: number;
  height?: number;
  colorSpace?: string;
  orientation?: number | string;

  // GPS Location
  latitude?: number;
  longitude?: number;
  altitude?: number;
  mapsUrl?: string;

  // Raw raw tags count
  rawTagsCount: number;
  hasExif: boolean;
}

// Helper: parse TIFF rational (num / den)
function readRational(view: DataView, offset: number, littleEndian: boolean): number {
  const num = view.getUint32(offset, littleEndian);
  const den = view.getUint32(offset + 4, littleEndian);
  return den === 0 ? 0 : num / den;
}

// Helper: parse string from DataView
function readString(view: DataView, offset: number, length: number): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    const charCode = view.getUint8(offset + i);
    if (charCode === 0) break;
    str += String.fromCharCode(charCode);
  }
  return str.trim();
}

// Pure client-side JPEG EXIF parser (APP1 marker -> TIFF IFDs)
export function parseJpegExif(buffer: ArrayBuffer): ParsedExif {
  const view = new DataView(buffer);
  const result: ParsedExif = { rawTagsCount: 0, hasExif: false };

  // Check JPEG SOI (0xFFD8)
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
    return result;
  }

  let offset = 2;
  const length = view.byteLength;

  while (offset < length) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);

    // APP1 marker (EXIF)
    if (marker === 0xe1) {
      const app1Length = view.getUint16(offset + 2);
      const exifHeaderOffset = offset + 4;

      // Verify "Exif\0\0"
      if (
        readString(view, exifHeaderOffset, 4) === "Exif" &&
        view.getUint16(exifHeaderOffset + 4) === 0x0000
      ) {
        result.hasExif = true;
        const tiffOffset = exifHeaderOffset + 6;
        parseTiff(view, tiffOffset, result);
      }
      break;
    } else if ((marker >= 0xe0 && marker <= 0xef) || marker === 0xfe || marker === 0xdb) {
      // Skip other segments
      const segmentLen = view.getUint16(offset + 2);
      offset += 2 + segmentLen;
    } else {
      break;
    }
  }

  return result;
}

function parseTiff(view: DataView, tiffOffset: number, result: ParsedExif) {
  // Byte order
  const byteOrder = view.getUint16(tiffOffset);
  const littleEndian = byteOrder === 0x4949; // "II" = little endian, "MM" = big endian

  // Verify TIFF magic number (42)
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) return;

  const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
  if (firstIfdOffset < 8) return;

  const readIfdEntries = (ifdOffset: number, isGps = false, isExifSub = false) => {
    if (tiffOffset + ifdOffset + 2 > view.byteLength) return;
    const entryCount = view.getUint16(tiffOffset + ifdOffset, littleEndian);
    let entryOffset = tiffOffset + ifdOffset + 2;

    for (let i = 0; i < entryCount; i++) {
      if (entryOffset + 12 > view.byteLength) break;

      const tag = view.getUint16(entryOffset, littleEndian);
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const count = view.getUint32(entryOffset + 4, littleEndian);
      const valOffset = entryOffset + 8;

      result.rawTagsCount++;

      // Tag Value Resolver
      const getValueOffset = () => {
        // If fits in 4 bytes, it's inside valOffset; otherwise pointer relative to tiffOffset
        const sizeMap: Record<number, number> = { 1: 1, 2: 2, 3: 2, 4: 4, 5: 8, 7: 1, 9: 4, 10: 8 };
        const totalSize = (sizeMap[type] || 1) * count;
        return totalSize <= 4 ? valOffset : tiffOffset + view.getUint32(valOffset, littleEndian);
      };

      const valPtr = getValueOffset();

      // ── IFD0 Tags ──
      if (!isGps && !isExifSub) {
        if (tag === 0x010f) result.make = readString(view, valPtr, count);
        else if (tag === 0x0110) result.model = readString(view, valPtr, count);
        else if (tag === 0x0112) result.orientation = view.getUint16(valPtr, littleEndian);
        else if (tag === 0x0131) result.software = readString(view, valPtr, count);
        else if (tag === 0x0132) result.dateTimeModified = readString(view, valPtr, count);
        else if (tag === 0x8769) {
          // Pointer to Exif SubIFD
          const subIfdOffset = view.getUint32(valOffset, littleEndian);
          readIfdEntries(subIfdOffset, false, true);
        } else if (tag === 0x8825) {
          // Pointer to GPS SubIFD
          const gpsIfdOffset = view.getUint32(valOffset, littleEndian);
          readIfdEntries(gpsIfdOffset, true, false);
        }
      }

      // ── Exif SubIFD Tags ──
      if (isExifSub) {
        if (tag === 0x829a) {
          // ExposureTime
          const exp = readRational(view, valPtr, littleEndian);
          result.exposureTime = exp < 1 && exp > 0 ? `1/${Math.round(1 / exp)}s` : `${exp}s`;
        } else if (tag === 0x829d) {
          // FNumber
          const f = readRational(view, valPtr, littleEndian);
          result.fNumber = `f/${f.toFixed(1)}`;
        } else if (tag === 0x8827) {
          // ISO
          result.iso = view.getUint16(valPtr, littleEndian);
        } else if (tag === 0x9003) {
          result.dateTimeOriginal = readString(view, valPtr, count);
        } else if (tag === 0x9004) {
          result.dateTimeDigitized = readString(view, valPtr, count);
        } else if (tag === 0x920a) {
          // Focal length
          const fl = readRational(view, valPtr, littleEndian);
          result.focalLength = `${fl.toFixed(1)} mm`;
        } else if (tag === 0xa405) {
          result.focalLength35mm = `${view.getUint16(valPtr, littleEndian)} mm`;
        } else if (tag === 0xa434) {
          result.lensModel = readString(view, valPtr, count);
        } else if (tag === 0x9209) {
          const flashVal = view.getUint16(valPtr, littleEndian);
          result.flash = (flashVal & 1) !== 0 ? "Fired" : "Did not fire";
        } else if (tag === 0xa001) {
          const cs = view.getUint16(valPtr, littleEndian);
          result.colorSpace = cs === 1 ? "sRGB" : cs === 65535 ? "Uncalibrated" : "Adobe RGB";
        } else if (tag === 0xa002) {
          result.width = view.getUint32(valOffset, littleEndian);
        } else if (tag === 0xa003) {
          result.height = view.getUint32(valOffset, littleEndian);
        }
      }

      // ── GPS SubIFD Tags ──
      if (isGps) {
        if (tag === 0x0002) {
          // Latitude (3 rationals: deg, min, sec)
          const deg = readRational(view, valPtr, littleEndian);
          const min = readRational(view, valPtr + 8, littleEndian);
          const sec = readRational(view, valPtr + 16, littleEndian);
          result.latitude = deg + min / 60 + sec / 3600;
        } else if (tag === 0x0004) {
          // Longitude
          const deg = readRational(view, valPtr, littleEndian);
          const min = readRational(view, valPtr + 8, littleEndian);
          const sec = readRational(view, valPtr + 16, littleEndian);
          result.longitude = deg + min / 60 + sec / 3600;
        } else if (tag === 0x0006) {
          result.altitude = Math.round(readRational(view, valPtr, littleEndian));
        }
      }

      entryOffset += 12;
    }
  };

  readIfdEntries(firstIfdOffset);

  // If GPS coordinates found, build maps link
  if (result.latitude && result.longitude) {
    result.mapsUrl = `https://www.google.com/maps?q=${result.latitude.toFixed(6)},${result.longitude.toFixed(6)}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface FileItem {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  previewUrl: string;
  exif: ParsedExif;
  cleanedBlob?: Blob;
  cleanedUrl?: string;
  cleanedSize?: number;
}

export default function ExifTool() {
  const [activeTab, setActiveTab] = useState<"viewer" | "stripper">("viewer");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isStripping, setIsStripping] = useState<boolean>(false);
  const [stripProgress, setStripProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sample image with simulated EXIF
  const loadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, "#09203f");
      grad.addColorStop(1, "#537895");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      ctx.font = "bold 56px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("📷 Canon EOS R5 Sample Photo", 600, 380);

      ctx.font = "32px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText("50mm f/1.8 • 1/500s • ISO 100", 600, 450);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    const byteChars = atob(dataUrl.split(",")[1]);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
    const blob = new Blob([byteArr], { type: "image/jpeg" });
    const file = new File([blob], "canon-sample-photo.jpg", { type: "image/jpeg" });

    // Simulated rich camera EXIF for demonstration
    const sampleExif: ParsedExif = {
      make: "Canon",
      model: "Canon EOS R5",
      software: "Adobe Lightroom Classic 13.1",
      lensModel: "RF50mm F1.8 STM",
      iso: 100,
      exposureTime: "1/500s",
      fNumber: "f/1.8",
      focalLength: "50.0 mm",
      focalLength35mm: "50 mm",
      flash: "Did not fire",
      whiteBalance: "Auto",
      colorSpace: "sRGB",
      width: 1200,
      height: 800,
      dateTimeOriginal: "2026:08:14 17:34:22",
      dateTimeModified: "2026:08:14 18:02:10",
      latitude: 37.774929,
      longitude: -122.419418,
      altitude: 48,
      mapsUrl: "https://www.google.com/maps?q=37.774929,-122.419418",
      rawTagsCount: 42,
      hasExif: true,
    };

    setFiles([
      {
        id: `sample-${Date.now()}`,
        file,
        name: file.name,
        sizeBytes: blob.size,
        previewUrl: dataUrl,
        exif: sampleExif,
      },
    ]);
    setActiveFileIndex(0);
    toast.success("Loaded demo photo with camera & GPS metadata!", "Sample Ready");
  };

  // Handle uploaded files
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files ? Array.from(e.target.files) : [];
    if (!uploaded.length) return;

    const items: FileItem[] = [];

    for (const file of uploaded) {
      const buffer = await file.arrayBuffer();
      const exif = parseJpegExif(buffer);
      const previewUrl = URL.createObjectURL(file);

      items.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        sizeBytes: file.size,
        previewUrl,
        exif,
      });
    }

    setFiles((prev) => [...prev, ...items]);
    toast.success(`${items.length} photo(s) analyzed!`, "Analysis Complete");
    if (e.target) e.target.value = "";
  };

  // Strip EXIF data via Canvas re-export (100% removes all metadata)
  const stripExifFromImage = async (item: FileItem): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to export clean blob"));
          },
          "image/jpeg",
          0.93
        );
      };
      img.onerror = reject;
      img.src = item.previewUrl;
    });
  };

  // Bulk Clean & Strip Action
  const handleStripAll = async () => {
    if (!files.length) return;

    setIsStripping(true);
    setStripProgress(0);
    toast.info("Stripping EXIF and privacy metadata...", "Cleaning");

    const updated = [...files];

    try {
      for (let i = 0; i < updated.length; i++) {
        const item = updated[i];
        const cleanBlob = await stripExifFromImage(item);
        const cleanUrl = URL.createObjectURL(cleanBlob);

        updated[i] = {
          ...item,
          cleanedBlob: cleanBlob,
          cleanedUrl: cleanUrl,
          cleanedSize: cleanBlob.size,
        };

        setStripProgress(Math.round(((i + 1) / updated.length) * 100));
      }

      setFiles(updated);
      toast.success(
        `All ${updated.length} photos stripped of EXIF & location data!`,
        "Cleaned & Protected"
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to strip metadata from some files.", "Error");
    } finally {
      setIsStripping(false);
      setStripProgress(0);
    }
  };

  // Download Cleaned Image
  const handleDownloadClean = (item: FileItem) => {
    if (!item.cleanedBlob) return;
    const cleanName = item.name.replace(/\.[^/.]+$/, "") + "-clean.jpg";
    saveAs(item.cleanedBlob, cleanName);
    toast.success(`Downloaded "${cleanName}"!`, "Success");
  };

  // Download All as ZIP
  const handleDownloadAllClean = async () => {
    const cleaned = files.filter((f) => f.cleanedBlob);
    if (!cleaned.length) return;

    if (cleaned.length === 1) {
      handleDownloadClean(cleaned[0]);
      return;
    }

    toast.info("Packing clean photos into ZIP...", "Please wait");
    try {
      const zip = new JSZip();
      cleaned.forEach((item) => {
        const cleanName = item.name.replace(/\.[^/.]+$/, "") + "-clean.jpg";
        zip.file(cleanName, item.cleanedBlob!);
      });
      const archive = await zip.generateAsync({ type: "blob" });
      saveAs(archive, "clean-photos-no-exif.zip");
      toast.success("ZIP download started!", "Success");
    } catch {
      toast.error("Failed to generate ZIP archive", "Error");
    }
  };

  // Copy EXIF as JSON
  const handleCopyJson = () => {
    const current = files[activeFileIndex];
    if (!current) return;
    const jsonStr = JSON.stringify(current.exif, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    toast.success("EXIF metadata copied as JSON!", "Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.previewUrl);
      if (f.cleanedUrl) URL.revokeObjectURL(f.cleanedUrl);
    });
    setFiles([]);
    setActiveFileIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Cleared all photos", "Reset");
  };

  const activeItem = files[activeFileIndex];
  const exif = activeItem?.exif;

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
          Inspect hidden camera settings, device models, and GPS location coordinates &mdash; or
          strip 100% of EXIF metadata before sharing photos online. Everything runs locally in your browser.
        </p>
      </div>

      {/* ── Mode Switcher ────────────────────────────────────────────── */}
      <div className="mode-switcher" style={{ marginTop: 20 }}>
        <button
          type="button"
          className={`mode-btn ${activeTab === "viewer" ? "active" : ""}`}
          onClick={() => setActiveTab("viewer")}
        >
          <FiEye /> EXIF Metadata Inspector
        </button>
        <button
          type="button"
          className={`mode-btn ${activeTab === "stripper" ? "active" : ""}`}
          onClick={() => setActiveTab("stripper")}
        >
          <FiShield /> Privacy Cleaner (EXIF Stripper)
        </button>
      </div>

      {/* ── UPLOAD OR EMPTY STATE ────────────────────────────────────── */}
      {files.length === 0 ? (
        <div
          className="tool-upload-area"
          style={{ minHeight: 250, cursor: "pointer", marginTop: 20 }}
          onClick={() => fileInputRef.current?.click()}
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
            <h3>Drop photos here to inspect or clean metadata</h3>
            <p>supports JPEG, JPG, PNG, and WebP images</p>
            <div className="btn-browse" style={{ marginTop: 12 }}>
              Select Photos
            </div>
            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSample();
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
                Try With Sample Camera &amp; GPS Photo
              </button>
            </div>
            <div className="uploader-tags" style={{ marginTop: 16 }}>
              <div className="uploader-tag">
                <FiCamera /> Camera &amp; Lens Info
              </div>
              <div className="uploader-tag">
                <FiMapPin /> GPS Geotag Finder
              </div>
              <div className="uploader-tag">
                <FiShield /> 1-Click Privacy Strip
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 20 }}>
          {/* Header Bar */}
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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {files.length} Photo{files.length > 1 ? "s" : ""} Loaded
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

          {/* Thumbnail Strip */}
          {files.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingBottom: 10,
                marginBottom: 18,
              }}
            >
              {files.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveFileIndex(idx)}
                  style={{
                    position: "relative",
                    width: 72,
                    height: 72,
                    flexShrink: 0,
                    borderRadius: 10,
                    overflow: "hidden",
                    border:
                      activeFileIndex === idx
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
                  {item.exif?.hasExif && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 2,
                        left: 2,
                        fontSize: 9,
                        fontWeight: 700,
                        background: "#ff6b35",
                        color: "#fff",
                        padding: "1px 4px",
                        borderRadius: 4,
                      }}
                    >
                      EXIF
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: EXIF VIEWER / INSPECTOR
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "viewer" && activeItem && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              {/* Photo Card Preview */}
              <div>
                <div
                  style={{
                    background: "#000",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.1)",
                    height: 380,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={activeItem.previewUrl}
                    alt={activeItem.name}
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                    {activeItem.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {(activeItem.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                {/* Quick Strip Trigger */}
                <button
                  type="button"
                  className="btn-convert"
                  onClick={() => {
                    setActiveTab("stripper");
                    handleStripAll();
                  }}
                  style={{ marginTop: 16 }}
                >
                  <FiShield /> Strip EXIF From This Photo
                </button>
              </div>

              {/* Metadata Tables */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    Extracted EXIF Metadata ({exif?.rawTagsCount || 0} Tags)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 6,
                      color: copied ? "#10b981" : "#cbd5e1",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? <FiCheck /> : <FiCopy />} Copy JSON
                  </button>
                </div>

                {!exif?.hasExif ? (
                  <div
                    style={{
                      padding: 24,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 14,
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    <FiCheckCircle style={{ fontSize: 32, color: "#10b981", marginBottom: 8 }} />
                    <h4 style={{ color: "#fff", marginBottom: 6 }}>No EXIF Metadata Detected</h4>
                    <p style={{ fontSize: 13 }}>
                      This image is already clean of personal device identifiers, camera settings, and GPS geotags.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Camera Hardware */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#ff6b35",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        <FiCamera /> Camera &amp; Lens
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 13 }}>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Make:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.make || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Model:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.model || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Lens:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.lensModel || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Software:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.software || "—"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Exposure Settings */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#ff6b35",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        <FiSliders /> Exposure &amp; Optics
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 12px", fontSize: 13 }}>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Shutter Speed:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.exposureTime || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Aperture:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.fNumber || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>ISO:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.iso || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Focal Length:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.focalLength || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>35mm Equiv:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.focalLength35mm || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Flash:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.flash || "—"}</div>
                        </div>
                      </div>
                    </div>

                    {/* GPS Coordinates */}
                    {exif?.latitude && exif?.longitude && (
                      <div
                        style={{
                          background: "rgba(239, 68, 68, 0.08)",
                          border: "1px solid rgba(239, 68, 68, 0.25)",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#ef4444",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          <FiMapPin /> GPS Geotag Detected (Privacy Alert!)
                        </span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                          <div>
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>Latitude:</span>
                            <div style={{ color: "#fff", fontWeight: 600 }}>{exif.latitude.toFixed(6)}</div>
                          </div>
                          <div>
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>Longitude:</span>
                            <div style={{ color: "#fff", fontWeight: 600 }}>{exif.longitude.toFixed(6)}</div>
                          </div>
                        </div>
                        <a
                          href={exif.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-block",
                            marginTop: 10,
                            color: "#ff6b35",
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "underline",
                          }}
                        >
                          📍 View Location on Google Maps &rarr;
                        </a>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: 14,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#ff6b35",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        <FiCalendar /> Dates &amp; Timestamps
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", fontSize: 13 }}>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Date Taken:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.dateTimeOriginal || "—"}</div>
                        </div>
                        <div>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>Date Modified:</span>
                          <div style={{ color: "#fff", fontWeight: 600 }}>{exif?.dateTimeModified || "—"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: PRIVACY CLEANER / EXIF STRIPPER
             ───────────────────────────────────────────────────────────── */}
          {activeTab === "stripper" && (
            <div>
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 24,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                <FiShield style={{ fontSize: 40, color: "#10b981", marginBottom: 12 }} />
                <h3 style={{ color: "#fff", marginBottom: 6 }}>
                  Strip Metadata From {files.length} Photo{files.length > 1 ? "s" : ""}
                </h3>
                <p style={{ color: "#94a3b8", fontSize: 13, maxWidth: 540, margin: "0 auto 20px" }}>
                  Permanently removes camera serial numbers, device models, GPS coordinates, author tags, and
                  software history before posting to social media or forums.
                </p>

                <motion.button
                  type="button"
                  className="btn-convert"
                  onClick={handleStripAll}
                  disabled={isStripping}
                  whileHover={{ scale: isStripping ? 1 : 1.02 }}
                  whileTap={{ scale: isStripping ? 1 : 0.98 }}
                  style={{ maxWidth: 360, margin: "0 auto" }}
                >
                  {isStripping ? (
                    <>
                      <span className="spinner" />
                      Cleaning Photos... {stripProgress}%
                    </>
                  ) : (
                    <>
                      <FiShield />
                      Clean &amp; Strip All EXIF Data
                    </>
                  )}
                </motion.button>
              </div>

              {/* Cleaned Results Grid */}
              {files.some((f) => f.cleanedBlob) && (
                <div style={{ marginTop: 24 }}>
                  <div className="preview-grid">
                    {files
                      .filter((f) => f.cleanedBlob)
                      .map((item) => (
                        <div key={item.id} className="preview-item converted">
                          <img src={item.cleanedUrl} alt={item.name} />
                          <div className="preview-badge" style={{ background: "#10b981" }}>
                            100% CLEAN
                          </div>
                          <div className="preview-name">{item.name}</div>
                          <div className="preview-size">
                            Cleaned: {((item.cleanedSize || 0) / 1024).toFixed(1)} KB
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadClean(item)}
                            style={{
                              marginTop: 8,
                              width: "100%",
                              padding: "6px 8px",
                              background: "rgba(255, 107, 53, 0.2)",
                              border: "1px solid rgba(255, 107, 53, 0.4)",
                              borderRadius: 6,
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <FiDownload /> Save Clean Photo
                          </button>
                        </div>
                      ))}
                  </div>

                  <motion.button
                    type="button"
                    className="btn-download"
                    onClick={handleDownloadAllClean}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginTop: 24 }}
                  >
                    <FiDownload />
                    Download {files.length > 1 ? `All Clean Photos as ZIP (${files.length})` : "Clean Photo"}
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
