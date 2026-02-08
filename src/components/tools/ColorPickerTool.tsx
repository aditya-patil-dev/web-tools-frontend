"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import {
    FiUpload,
    FiX,
    FiCheckCircle,
    FiCopy,
    FiDroplet,
    FiEye,
    FiLayers,
    FiZap
} from "react-icons/fi";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/bmp"];

interface ColorInfo {
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
    cmyk: { c: number; m: number; y: number; k: number };
}

interface PaletteColor {
    color: ColorInfo;
    percentage: number;
}

const ColorPickerTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [pickedColor, setPickedColor] = useState<ColorInfo | null>(null);
    const [dominantColors, setDominantColors] = useState<PaletteColor[]>([]);
    const [isPickingColor, setIsPickingColor] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [zoomedPixel, setZoomedPixel] = useState<string>("");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const zoomCanvasRef = useRef<HTMLCanvasElement>(null);

    /* -----------------------------
       Color Conversion Functions
    ------------------------------ */

    const rgbToHex = (r: number, g: number, b: number): string => {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    };

    const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
        let c = 1 - (r / 255);
        let m = 1 - (g / 255);
        let y = 1 - (b / 255);
        let k = Math.min(c, m, y);

        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 100 };
        }

        c = Math.round(((c - k) / (1 - k)) * 100);
        m = Math.round(((m - k) / (1 - k)) * 100);
        y = Math.round(((y - k) / (1 - k)) * 100);
        k = Math.round(k * 100);

        return { c, m, y, k };
    };

    const getColorInfo = (r: number, g: number, b: number): ColorInfo => {
        return {
            hex: rgbToHex(r, g, b),
            rgb: { r, g, b },
            hsl: rgbToHsl(r, g, b),
            cmyk: rgbToCmyk(r, g, b)
        };
    };

    /* -----------------------------
       Extract Dominant Colors
    ------------------------------ */

    const extractDominantColors = (imageData: ImageData, numColors: number = 8): PaletteColor[] => {
        const pixels = imageData.data;
        const colorMap = new Map<string, number>();
        const step = 4; // Sample every 4th pixel for performance

        // Count colors
        for (let i = 0; i < pixels.length; i += step * 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            // Skip transparent pixels
            if (a < 128) continue;

            // Quantize colors to reduce similar shades
            const qr = Math.round(r / 10) * 10;
            const qg = Math.round(g / 10) * 10;
            const qb = Math.round(b / 10) * 10;
            const key = `${qr},${qg},${qb}`;

            colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // Sort by frequency
        const sortedColors = Array.from(colorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, numColors);

        const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0);

        return sortedColors.map(([colorKey, count]) => {
            const [r, g, b] = colorKey.split(',').map(Number);
            return {
                color: getColorInfo(r, g, b),
                percentage: Math.round((count / totalPixels) * 100)
            };
        });
    };

    /* -----------------------------
       File Handling
    ------------------------------ */

    const processFile = (file: File) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Only image files are allowed.", "Invalid File Type");
            return;
        }

        setSelectedFile(file);
        const preview = URL.createObjectURL(file);
        setImagePreview(preview);
        setPickedColor(null);
        setDominantColors([]);

        toast.success("Image uploaded successfully!", "Upload Complete");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
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

        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    /* -----------------------------
       Image Loading & Canvas Setup
    ------------------------------ */

    useEffect(() => {
        if (!imagePreview || !imageRef.current || !canvasRef.current) return;

        const img = imageRef.current;
        const canvas = canvasRef.current;

        img.onload = () => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
            }
        };
    }, [imagePreview]);

    /* -----------------------------
       Color Picking
    ------------------------------ */

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!isPickingColor || !canvasRef.current || !imageRef.current) return;

        const canvas = canvasRef.current;
        const img = imageRef.current;
        const rect = img.getBoundingClientRect();

        const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const color = getColorInfo(pixel[0], pixel[1], pixel[2]);

        setPickedColor(color);
        setIsPickingColor(false);
        toast.success(`Color picked: ${color.hex}`, "Color Picked");
    };

    const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!isPickingColor || !canvasRef.current || !imageRef.current || !zoomCanvasRef.current) return;

        const canvas = canvasRef.current;
        const img = imageRef.current;
        const zoomCanvas = zoomCanvasRef.current;
        const rect = img.getBoundingClientRect();

        const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
        const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

        setCursorPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });

        // Draw zoomed pixel preview
        const ctx = canvas.getContext('2d');
        const zoomCtx = zoomCanvas.getContext('2d');

        if (ctx && zoomCtx) {
            const size = 11; // 11x11 grid
            const sourceData = ctx.getImageData(x - 5, y - 5, size, size);

            zoomCanvas.width = size * 10;
            zoomCanvas.height = size * 10;

            for (let py = 0; py < size; py++) {
                for (let px = 0; px < size; px++) {
                    const i = (py * size + px) * 4;
                    const r = sourceData.data[i];
                    const g = sourceData.data[i + 1];
                    const b = sourceData.data[i + 2];

                    zoomCtx.fillStyle = rgbToHex(r, g, b);
                    zoomCtx.fillRect(px * 10, py * 10, 10, 10);

                    // Highlight center pixel
                    if (px === 5 && py === 5) {
                        zoomCtx.strokeStyle = '#fff';
                        zoomCtx.lineWidth = 2;
                        zoomCtx.strokeRect(px * 10, py * 10, 10, 10);
                        zoomCtx.strokeStyle = '#000';
                        zoomCtx.lineWidth = 1;
                        zoomCtx.strokeRect(px * 10 + 1, py * 10 + 1, 8, 8);
                    }
                }
            }

            setZoomedPixel(zoomCanvas.toDataURL());
        }
    };

    /* -----------------------------
       Extract Palette
    ------------------------------ */

    const handleExtractPalette = () => {
        if (!canvasRef.current) {
            toast.error("Please upload an image first.", "No Image");
            return;
        }

        setExtracting(true);
        toast.info("Extracting color palette...", "Processing");

        setTimeout(() => {
            const ctx = canvasRef.current!.getContext('2d');
            if (!ctx) return;

            const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
            const palette = extractDominantColors(imageData, 8);

            setDominantColors(palette);
            setExtracting(false);
            toast.success(`Extracted ${palette.length} dominant colors!`, "Palette Ready");
        }, 500);
    };

    /* -----------------------------
       Copy Functions
    ------------------------------ */

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard!`, "Copied");
        } catch (err) {
            toast.error("Failed to copy to clipboard.", "Copy Failed");
        }
    };

    const resetTool = () => {
        setSelectedFile(null);
        setImagePreview("");
        setPickedColor(null);
        setDominantColors([]);
        setIsPickingColor(false);
        const input = document.getElementById("inputColorPicker") as HTMLInputElement;
        if (input) input.value = "";
    };

    /* -----------------------------
       UI
    ------------------------------ */

    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <canvas ref={zoomCanvasRef} style={{ display: "none" }} />

            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Extract colors from images with eyedropper tool. Get HEX, RGB, HSL, and CMYK codes.
                    Generate color palettes with dominant colors.
                </p>
            </div>

            {/* Upload Area */}
            {!imagePreview && (
                <div
                    className={`tool-upload-area ${dragActive ? "drag-active" : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        id="inputColorPicker"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="tool-file-input"
                    />

                    <label htmlFor="inputColorPicker" className="tool-upload-label">
                        <FiUpload className="upload-icon" />
                        <h3>Drop an image here or click to browse</h3>
                        <p>Supports PNG, JPG, WebP, GIF, BMP</p>
                    </label>
                </div>
            )}

            {/* Image Preview & Color Picker */}
            <AnimatePresence>
                {imagePreview && (
                    <motion.div
                        className="color-picker-workspace"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {/* Controls */}
                        <div className="color-picker-controls">
                            <button
                                className={`btn-eyedropper ${isPickingColor ? "active" : ""}`}
                                onClick={() => setIsPickingColor(!isPickingColor)}
                            >
                                <FiDroplet />
                                {isPickingColor ? "Click on image to pick color" : "Enable Eyedropper"}
                            </button>

                            <button
                                className="btn-extract-palette"
                                onClick={handleExtractPalette}
                                disabled={extracting}
                            >
                                {extracting ? (
                                    <>
                                        <span className="spinner-small" />
                                        Extracting...
                                    </>
                                ) : (
                                    <>
                                        <FiLayers />
                                        Extract Color Palette
                                    </>
                                )}
                            </button>

                            <button
                                className="btn-reset-picker"
                                onClick={resetTool}
                            >
                                <FiX />
                                Change Image
                            </button>
                        </div>

                        {/* Image Container */}
                        <div className={`image-picker-container ${isPickingColor ? "picking" : ""}`}>
                            <img
                                ref={imageRef}
                                src={imagePreview}
                                alt="Color picker source"
                                className="picker-image"
                                onClick={handleImageClick}
                                onMouseMove={handleImageMouseMove}
                                crossOrigin="anonymous"
                            />

                            {/* Zoom Preview */}
                            {isPickingColor && zoomedPixel && (
                                <div
                                    className="zoom-preview"
                                    style={{
                                        left: cursorPosition.x + 20,
                                        top: cursorPosition.y + 20
                                    }}
                                >
                                    <img src={zoomedPixel} alt="Zoomed pixel" />
                                </div>
                            )}
                        </div>

                        {/* Picked Color Display */}
                        {pickedColor && (
                            <motion.div
                                className="picked-color-section"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="section-header">
                                    <FiEye />
                                    <h3>Picked Color</h3>
                                </div>

                                <div className="color-display-grid">
                                    <div
                                        className="color-swatch-large"
                                        style={{ backgroundColor: pickedColor.hex }}
                                    >
                                        <span className="swatch-label">{pickedColor.hex}</span>
                                    </div>

                                    <div className="color-codes">
                                        <div className="color-code-item">
                                            <label>HEX</label>
                                            <div className="code-value">
                                                <input
                                                    type="text"
                                                    value={pickedColor.hex}
                                                    readOnly
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(pickedColor.hex, "HEX")}
                                                    className="btn-copy-code"
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="color-code-item">
                                            <label>RGB</label>
                                            <div className="code-value">
                                                <input
                                                    type="text"
                                                    value={`rgb(${pickedColor.rgb.r}, ${pickedColor.rgb.g}, ${pickedColor.rgb.b})`}
                                                    readOnly
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(
                                                        `rgb(${pickedColor.rgb.r}, ${pickedColor.rgb.g}, ${pickedColor.rgb.b})`,
                                                        "RGB"
                                                    )}
                                                    className="btn-copy-code"
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="color-code-item">
                                            <label>HSL</label>
                                            <div className="code-value">
                                                <input
                                                    type="text"
                                                    value={`hsl(${pickedColor.hsl.h}, ${pickedColor.hsl.s}%, ${pickedColor.hsl.l}%)`}
                                                    readOnly
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(
                                                        `hsl(${pickedColor.hsl.h}, ${pickedColor.hsl.s}%, ${pickedColor.hsl.l}%)`,
                                                        "HSL"
                                                    )}
                                                    className="btn-copy-code"
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="color-code-item">
                                            <label>CMYK</label>
                                            <div className="code-value">
                                                <input
                                                    type="text"
                                                    value={`cmyk(${pickedColor.cmyk.c}%, ${pickedColor.cmyk.m}%, ${pickedColor.cmyk.y}%, ${pickedColor.cmyk.k}%)`}
                                                    readOnly
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(
                                                        `cmyk(${pickedColor.cmyk.c}%, ${pickedColor.cmyk.m}%, ${pickedColor.cmyk.y}%, ${pickedColor.cmyk.k}%)`,
                                                        "CMYK"
                                                    )}
                                                    className="btn-copy-code"
                                                >
                                                    <FiCopy />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Dominant Colors Palette */}
                        {dominantColors.length > 0 && (
                            <motion.div
                                className="palette-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="section-header">
                                    <FiZap />
                                    <h3>Dominant Colors</h3>
                                    <span className="palette-count">{dominantColors.length} colors extracted</span>
                                </div>

                                <div className="palette-grid">
                                    {dominantColors.map((paletteColor, index) => (
                                        <motion.div
                                            key={index}
                                            className="palette-color-card"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <div
                                                className="palette-swatch"
                                                style={{ backgroundColor: paletteColor.color.hex }}
                                                onClick={() => setPickedColor(paletteColor.color)}
                                            />
                                            <div className="palette-info">
                                                <span className="palette-hex">{paletteColor.color.hex}</span>
                                                <span className="palette-percentage">{paletteColor.percentage}%</span>
                                            </div>
                                            <button
                                                className="btn-copy-palette"
                                                onClick={() => copyToClipboard(paletteColor.color.hex, "Color")}
                                            >
                                                <FiCopy />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ColorPickerTool;
