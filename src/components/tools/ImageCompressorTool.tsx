"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import apiClient from "@/lib/api/api";
import {
  FiUpload,
  FiDownload,
  FiX,
  FiCheckCircle,
  FiTrash2,
  FiTrendingDown,
  FiZap,
  FiInfo,
  FiFileText,
  FiLayers,
} from "react-icons/fi";

const MAX_FILES = 25;
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
];

// ─── Types ─────────────────────────────────────────────────────────────────

interface AiCompressResponseData {
  imageBase64: string;
  mimeType: string;
  outputFormat: string;
  aiMessage: string;
  originalSize: number;
  compressedSize: number;
}

interface AiCompressApiResponse {
  success: boolean;
  message: string;
  data: AiCompressResponseData;
}

interface CompressionResult {
  original: File;
  compressed: File | null;
  compressedBlob?: Blob;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
  preview: string;
  outputFormat?: string;
  aiOptimized?: boolean;
  aiMessage?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────

const ImageCompressorTool = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressedData, setCompressedData] = useState<CompressionResult[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(50);
  const [aiMode, setAiMode] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>("");

  // ── Helpers ───────────────────────────────────────────────────────────

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileExtension = (filename: string) =>
    filename.split(".").pop()?.toLowerCase() ?? "";

  // ── File Handling ─────────────────────────────────────────────────────

  const processFiles = (files: File[]) => {
    if (files.length > MAX_FILES) {
      toast.error(
        `You can only upload up to ${MAX_FILES} images.`,
        "Upload Limit Exceeded",
      );
      return;
    }
    const validFiles = files.filter((f) => ACCEPTED_TYPES.includes(f.type));
    if (validFiles.length !== files.length) {
      toast.warning(
        "Only image files (PNG, JPG, WebP, GIF, BMP) are allowed.",
        "Invalid File Type",
      );
    }
    if (!validFiles.length) return;

    setSelectedFiles(validFiles);
    setPreviews(validFiles.map((f) => URL.createObjectURL(f)));
    setCompressedData([]);
    setConvertProgress(0);
    toast.success(
      `${validFiles.length} file(s) uploaded successfully!`,
      "Upload Complete",
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files ? Array.from(e.target.files) : []);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    if (newFiles.length === 0) resetForm();
    else toast.info("File removed");
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFiles(e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []);
  };

  // ── AI Compress — calls Express backend via centralized apiClient ──────
  //
  // Key integration details:
  //   • Uses `apiClient` (axios instance) from src/lib/api/api.ts
  //   • Sends FormData; the request interceptor automatically removes
  //     Content-Type so axios sets the multipart boundary correctly
  //   • Server errors arrive as err.response.data.message (Express format)

  const handleAiCompress = async () => {
    setLoading(true);
    setConvertProgress(0);
    toast.info(
      "AI is analyzing and optimizing your images...",
      "AI Processing",
    );

    const results: CompressionResult[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentProcessing(file.name);

        const formData = new FormData();
        formData.append("image", file);

        // Hits:  POST {NEXT_PUBLIC_API_BASE_URL}/tools/ai-compress
        const response = await apiClient.post<AiCompressApiResponse>(
          "/tools/ai-compress",
          formData,
        );

        const { data } = response.data;

        // Decode base64 → Blob for local preview + download
        const byteChars = atob(data.imageBase64);
        const byteArr = new Uint8Array(byteChars.length);
        for (let b = 0; b < byteChars.length; b++) {
          byteArr[b] = byteChars.charCodeAt(b);
        }
        const compressedBlob = new Blob([byteArr], { type: data.mimeType });

        const originalSize = file.size;
        const compressedSize = compressedBlob.size;
        const savedBytes = Math.max(originalSize - compressedSize, 0);
        const savedPercent =
          originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

        results.push({
          original: file,
          compressed: null,
          compressedBlob,
          originalSize,
          compressedSize,
          savedBytes,
          savedPercent,
          preview: URL.createObjectURL(compressedBlob),
          outputFormat: data.outputFormat,
          aiOptimized: true,
          aiMessage: data.aiMessage,
        });

        setConvertProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      setCompressedData(results);
      const totalSaved = results.reduce((s, r) => s + r.savedBytes, 0);
      toast.success(
        `${results.length} image(s) AI-optimized! Saved ${formatBytes(totalSaved)}`,
        "AI Optimization Complete",
      );
    } catch (err: any) {
      console.error("[ai-compress]", err);
      // Axios surfaces Express error body as err.response.data
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "AI compression failed. Please try again.";
      toast.error(message, "AI Error");
    } finally {
      setLoading(false);
      setConvertProgress(0);
      setCurrentProcessing("");
    }
  };

  // ── Manual Compress — pure client-side, no backend call ───────────────

  const handleManualCompress = async () => {
    setLoading(true);
    setConvertProgress(0);
    toast.info("Compressing images...", "Processing");

    try {
      const results: CompressionResult[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const originalSize = file.size;
        const originalSizeMB = file.size / (1024 * 1024);
        const maxSizeMB = Math.max(
          originalSizeMB * (compressionLevel / 100),
          0.01,
        );

        const compressedBlob = await imageCompression(file, {
          maxSizeMB,
          useWebWorker: true,
          maxWidthOrHeight: 4096,
          initialQuality: compressionLevel / 100,
        });

        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
        });
        const compressedSize = compressedFile.size;
        const savedBytes = Math.max(originalSize - compressedSize, 0);
        const savedPercent =
          originalSize > 0 ? (savedBytes / originalSize) * 100 : 0;

        results.push({
          original: file,
          compressed: compressedFile,
          originalSize,
          compressedSize,
          savedBytes,
          savedPercent,
          preview: URL.createObjectURL(compressedFile),
          aiOptimized: false,
        });

        setConvertProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      }

      setCompressedData(results);
      const totalSaved = results.reduce((s, r) => s + r.savedBytes, 0);
      toast.success(
        `${results.length} image(s) compressed! Saved ${formatBytes(totalSaved)}`,
        "Done",
      );
    } catch (err) {
      console.error(err);
      toast.error(
        "Error compressing images. Please try again.",
        "Compression Failed",
      );
    } finally {
      setLoading(false);
      setConvertProgress(0);
    }
  };

  const handleCompress = () => {
    if (!selectedFiles.length) {
      toast.error("Please upload image files first.", "No Files Selected");
      return;
    }
    if (aiMode) handleAiCompress();
    else handleManualCompress();
  };

  // ── Download ──────────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!compressedData.length) return;

    try {
      const getBlob = (item: CompressionResult): Blob =>
        item.compressedBlob ?? (item.compressed as File);

      const getFilename = (item: CompressionResult): string => {
        if (
          item.outputFormat &&
          item.outputFormat !== getFileExtension(item.original.name)
        ) {
          const base = item.original.name.replace(/\.[^.]+$/, "");
          return `${base}.${item.outputFormat}`;
        }
        return item.original.name;
      };

      if (compressedData.length === 1) {
        saveAs(getBlob(compressedData[0]), getFilename(compressedData[0]));
        toast.success("Download started!", "Success");
      } else {
        toast.info("Creating ZIP file...", "Please wait");
        const zip = new JSZip();
        compressedData.forEach((item) =>
          zip.file(getFilename(item), getBlob(item)),
        );
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "ai-optimized-images.zip");
        toast.success("ZIP download started!", "Success");
      }

      setTimeout(() => {
        resetForm();
        toast.info("Ready for new compression!", "Reset Complete");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Error downloading files.", "Download Failed");
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setCompressedData([]);
    setPreviews([]);
    setConvertProgress(0);
    const input = document.getElementById(
      "inputCompressor",
    ) as HTMLInputElement;
    if (input) input.value = "";
  };

  // ── Derived stats ─────────────────────────────────────────────────────

  const totalOriginalSize = compressedData.reduce(
    (s, i) => s + i.originalSize,
    0,
  );
  const totalCompressedSize = compressedData.reduce(
    (s, i) => s + i.compressedSize,
    0,
  );
  const totalSaved = totalOriginalSize - totalCompressedSize;
  const totalSavedPercent =
    totalOriginalSize > 0 ? (totalSaved / totalOriginalSize) * 100 : 0;
  const anyAiOptimized = compressedData.some((r) => r.aiOptimized);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="tool-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Info Banner */}
      <div className="tool-info-banner">
        <FiCheckCircle />
        <p>
          Compress up to {MAX_FILES} images &mdash; all processing
          happens locally in your browser.
        </p>
      </div>

      {/* ── AI Toggle ──────────────────────────────────────────────── */}
      <motion.div
        className="ai-toggle-row"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="ai-toggle-left">
          <span className="ai-toggle-label">
            <FiZap className="ai-zap-icon" />
            AI Optimization
            <span className="ai-badge">Recommended</span>
          </span>

          <span
            className="ai-tooltip-trigger"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <FiInfo />
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  className="ai-tooltip"
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  Automatically selects the best compression settings and output
                  format for optimal visual quality and smallest file size. No
                  manual tuning required.
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        </div>

        <button
          className={`ai-toggle-switch ${aiMode ? "active" : ""}`}
          onClick={() => setAiMode((v) => !v)}
          aria-label="Toggle AI optimization"
          role="switch"
          aria-checked={aiMode}
        >
          <span className="ai-toggle-thumb" />
        </button>
      </motion.div>

      {/* ── Manual slider (hidden when AI is on) ─────────────────── */}
      <AnimatePresence>
        {!aiMode && (
          <motion.div
            className="quality-slider-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span className="quality-slider-label">Compression Level</span>
            <div className="quality-slider-wrapper">
              <input
                type="range"
                min="10"
                max="90"
                step="10"
                value={compressionLevel}
                onChange={(e) => setCompressionLevel(Number(e.target.value))}
                className="quality-slider"
              />
              <span className="quality-value">{compressionLevel}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Upload Area ────────────────────────────────────────────── */}
      <div
        className={`tool-upload-area ${dragActive ? "drag-active" : ""} ${selectedFiles.length > 0 ? "has-files" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="inputCompressor"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="tool-file-input"
        />
        <label htmlFor="inputCompressor" className="tool-upload-label">
          <FiUpload className="upload-icon" />
          <h3>Drop images here</h3>
          <p>or click to browse your device</p>
          
          <div className="btn-browse">Browse files</div>

          <div className="uploader-tags">
            <div className="uploader-tag">
              <FiFileText /> All formats
            </div>
            <div className="uploader-tag">
              <FiZap /> AI Optimized
            </div>
            <div className="uploader-tag">
              <FiLayers /> Up to {MAX_FILES} files
            </div>
          </div>
        </label>
      </div>

      {/* ── Previews ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            className="tool-preview-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="preview-header">
              <h3>Selected Files ({selectedFiles.length})</h3>
              <button
                className="btn-clear-all"
                onClick={resetForm}
                title="Clear all files"
              >
                <FiTrash2 /> Clear All
              </button>
            </div>

            <div className="preview-grid">
              {previews.map((src, i) => (
                <motion.div
                  key={i}
                  className="preview-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  layout
                >
                  <img src={src} alt={`Preview ${i + 1}`} />
                  <button
                    className="preview-remove"
                    onClick={() => removeFile(i)}
                    title="Remove file"
                  >
                    <FiX />
                  </button>
                  <div className="preview-name">{selectedFiles[i].name}</div>
                  <div className="preview-size">
                    {formatBytes(selectedFiles[i].size)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Compress Button */}
            <motion.button
              className={`btn-convert ${aiMode ? "btn-convert--ai" : ""}`}
              onClick={handleCompress}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  {aiMode ? "AI Optimizing" : "Compressing"}...{" "}
                  {convertProgress}%
                  {currentProcessing && (
                    <span className="processing-name">
                      {" "}
                      — {currentProcessing}
                    </span>
                  )}
                </>
              ) : aiMode ? (
                <>
                  <FiZap /> AI Optimize Images
                </>
              ) : (
                <>
                  <FiTrendingDown /> Compress Images
                </>
              )}
            </motion.button>

            {/* Progress Bar */}
            {loading && (
              <motion.div
                className="progress-bar-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  className={`progress-bar ${aiMode ? "progress-bar--ai" : ""}`}
                  style={{ width: `${convertProgress}%` }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {compressedData.length > 0 && (
          <motion.div
            className="tool-result-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="result-header">
              <FiCheckCircle className="success-icon" />
              <h3>
                {anyAiOptimized
                  ? "AI Optimization Complete!"
                  : "Compression Complete!"}
              </h3>
              <p>{compressedData.length} image(s) processed successfully</p>

              {anyAiOptimized && (
                <motion.div
                  className="ai-result-badge"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FiZap />
                  AI optimized for best quality and smallest size
                </motion.div>
              )}
            </div>

            {/* Stats */}
            <div className="compression-stats">
              <div className="stat-card">
                <span className="stat-label">Original Size</span>
                <span className="stat-value">
                  {formatBytes(totalOriginalSize)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Optimized Size</span>
                <span className="stat-value">
                  {formatBytes(totalCompressedSize)}
                </span>
              </div>
              <div className="stat-card highlight">
                <span className="stat-label">Total Saved</span>
                <span className="stat-value">
                  {formatBytes(totalSaved)}{" "}
                  <em>({totalSavedPercent.toFixed(1)}%)</em>
                </span>
              </div>
            </div>

            {/* Compressed Images Grid */}
            <div className="preview-grid">
              {compressedData.map((item, i) => (
                <motion.div
                  key={i}
                  className="preview-item compressed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img src={item.preview} alt={`Compressed ${i + 1}`} />
                  <div
                    className={`compression-badge ${item.aiOptimized ? "badge--ai" : ""}`}
                  >
                    {item.aiOptimized && <FiZap />}-
                    {item.savedPercent.toFixed(0)}%
                  </div>
                  {item.outputFormat && (
                    <div className="format-badge">
                      .{item.outputFormat.toUpperCase()}
                    </div>
                  )}
                  <div className="preview-name">{item.original.name}</div>
                  <div className="preview-sizes">
                    <span className="size-before">
                      {formatBytes(item.originalSize)}
                    </span>
                    <span className="size-arrow">&#x2192;</span>
                    <span className="size-after">
                      {formatBytes(item.compressedSize)}
                    </span>
                  </div>
                  {item.aiMessage && (
                    <div className="ai-item-hint">{item.aiMessage}</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Download */}
            <motion.button
              className="btn-download"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiDownload />
              Download {compressedData.length > 1 ? "All as ZIP" : "Image"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ImageCompressorTool;
