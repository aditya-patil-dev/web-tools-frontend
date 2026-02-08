"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
    FiUpload,
    FiDownload,
    FiX,
    FiCheckCircle,
    FiLink,
    FiType,
    FiImage,
    FiDroplet,
    FiMaximize2
} from "react-icons/fi";

type QRDataType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

interface QRConfig {
    dataType: QRDataType;
    content: string;
    errorCorrectionLevel: ErrorCorrectionLevel;
    size: number;
    foregroundColor: string;
    backgroundColor: string;
    margin: number;
}

const QR_DATA_TYPES = [
    { value: "url" as QRDataType, label: "Website URL", icon: FiLink, placeholder: "https://example.com" },
    { value: "text" as QRDataType, label: "Plain Text", icon: FiType, placeholder: "Enter any text..." },
    { value: "email" as QRDataType, label: "Email", icon: "📧", placeholder: "email@example.com" },
    { value: "phone" as QRDataType, label: "Phone", icon: "📱", placeholder: "+1234567890" },
    { value: "sms" as QRDataType, label: "SMS", icon: "💬", placeholder: "+1234567890:Message here" },
    { value: "wifi" as QRDataType, label: "WiFi", icon: "📶", placeholder: "WIFI:S:NetworkName;T:WPA;P:password;;" },
    { value: "vcard" as QRDataType, label: "vCard", icon: "👤", placeholder: "BEGIN:VCARD..." }
];

const ERROR_CORRECTION_LEVELS = [
    { value: "L" as ErrorCorrectionLevel, label: "Low (7%)", description: "Smallest QR code" },
    { value: "M" as ErrorCorrectionLevel, label: "Medium (15%)", description: "Balanced (Recommended)" },
    { value: "Q" as ErrorCorrectionLevel, label: "Quartile (25%)", description: "Good for logos" },
    { value: "H" as ErrorCorrectionLevel, label: "High (30%)", description: "Best for logos" }
];

const PRESET_COLORS = [
    { name: "Black", fg: "#000000", bg: "#FFFFFF" },
    { name: "Blue", fg: "#1E40AF", bg: "#DBEAFE" },
    { name: "Green", fg: "#047857", bg: "#D1FAE5" },
    { name: "Purple", fg: "#7C3AED", bg: "#EDE9FE" },
    { name: "Red", fg: "#DC2626", bg: "#FEE2E2" },
    { name: "Orange", fg: "#EA580C", bg: "#FFEDD5" }
];

const QRCodeGeneratorTool = () => {
    const [config, setConfig] = useState<QRConfig>({
        dataType: "url",
        content: "",
        errorCorrectionLevel: "M",
        size: 512,
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
        margin: 4
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [logoSize, setLogoSize] = useState<number>(20); // Percentage of QR code
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const [generating, setGenerating] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const logoCanvasRef = useRef<HTMLCanvasElement>(null);

    /* -----------------------------
       Generate QR Code
    ------------------------------ */

    const generateQRCode = async () => {
        if (!config.content.trim()) {
            toast.error("Please enter content for the QR code.", "No Content");
            return;
        }

        setGenerating(true);
        toast.info("Generating QR code...", "Processing");

        try {
            // Format content based on type
            let formattedContent = config.content;

            switch (config.dataType) {
                case "email":
                    formattedContent = `mailto:${config.content}`;
                    break;
                case "phone":
                    formattedContent = `tel:${config.content}`;
                    break;
                case "sms":
                    const [phone, message] = config.content.split(':');
                    formattedContent = `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
                    break;
                // wifi and vcard use content as-is
            }

            // Generate QR code to canvas
            const canvas = canvasRef.current;
            if (!canvas) {
                throw new Error("Canvas not available");
            }

            await QRCode.toCanvas(canvas, formattedContent, {
                errorCorrectionLevel: config.errorCorrectionLevel,
                width: config.size,
                margin: config.margin,
                color: {
                    dark: config.foregroundColor,
                    light: config.backgroundColor
                }
            });

            // If logo is present, overlay it
            if (logoFile && logoPreview) {
                await overlayLogo(canvas);
            } else {
                setQrCodeDataUrl(canvas.toDataURL('image/png'));
            }

            toast.success("QR code generated successfully!", "Success");
        } catch (err) {
            console.error(err);
            toast.error("Error generating QR code. Please try again.", "Generation Failed");
        } finally {
            setGenerating(false);
        }
    };

    const overlayLogo = async (qrCanvas: HTMLCanvasElement) => {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                const ctx = qrCanvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Calculate logo size and position
                const logoSizePx = (qrCanvas.width * logoSize) / 100;
                const logoX = (qrCanvas.width - logoSizePx) / 2;
                const logoY = (qrCanvas.height - logoSizePx) / 2;

                // Draw white background circle/square for logo
                const padding = logoSizePx * 0.1;
                ctx.fillStyle = config.backgroundColor;
                ctx.beginPath();
                ctx.arc(
                    qrCanvas.width / 2,
                    qrCanvas.height / 2,
                    (logoSizePx + padding * 2) / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();

                // Draw logo
                ctx.drawImage(img, logoX, logoY, logoSizePx, logoSizePx);

                setQrCodeDataUrl(qrCanvas.toDataURL('image/png'));
                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load logo'));
            };

            img.src = logoPreview;
        });
    };

    /* -----------------------------
       Auto-generate on changes
    ------------------------------ */

    useEffect(() => {
        if (config.content.trim()) {
            const debounce = setTimeout(() => {
                generateQRCode();
            }, 500);

            return () => clearTimeout(debounce);
        }
    }, [config, logoPreview, logoSize]);

    /* -----------------------------
       Logo Upload
    ------------------------------ */

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload an image file.", "Invalid File");
                return;
            }

            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            toast.success("Logo uploaded!", "Success");
        }
    };

    const handleLogoDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            toast.success("Logo uploaded!", "Success");
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview("");
        const input = document.getElementById("logoInput") as HTMLInputElement;
        if (input) input.value = "";
        toast.info("Logo removed", "Info");
    };

    /* -----------------------------
       Download
    ------------------------------ */

    const handleDownload = (format: 'png' | 'svg' | 'jpg') => {
        if (!qrCodeDataUrl) {
            toast.error("Please generate a QR code first.", "No QR Code");
            return;
        }

        if (format === 'svg') {
            // For SVG, we need to regenerate
            QRCode.toString(config.content, {
                type: 'svg',
                errorCorrectionLevel: config.errorCorrectionLevel,
                width: config.size,
                margin: config.margin,
                color: {
                    dark: config.foregroundColor,
                    light: config.backgroundColor
                }
            }).then(svg => {
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                saveAs(blob, 'qrcode.svg');
                toast.success("SVG downloaded!", "Success");
            });
        } else if (format === 'jpg') {
            // Convert PNG to JPG
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            saveAs(blob, 'qrcode.jpg');
                            toast.success("JPG downloaded!", "Success");
                        }
                    }, 'image/jpeg', 0.95);
                }
            };
            img.src = qrCodeDataUrl;
        } else {
            // PNG
            saveAs(qrCodeDataUrl, 'qrcode.png');
            toast.success("PNG downloaded!", "Success");
        }
    };

    const applyPresetColor = (preset: typeof PRESET_COLORS[0]) => {
        setConfig({
            ...config,
            foregroundColor: preset.fg,
            backgroundColor: preset.bg
        });
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
            <canvas ref={logoCanvasRef} style={{ display: "none" }} />

            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Generate custom QR codes with logos, custom colors, and multiple formats.
                    Perfect for business cards, marketing materials, and digital content.
                </p>
            </div>

            <div className="qr-generator-workspace">
                {/* Left Panel - Settings */}
                <div className="qr-settings-panel">
                    {/* Data Type Selection */}
                    <div className="qr-section">
                        <h3 className="qr-section-title">
                            <FiType /> QR Code Type
                        </h3>
                        <div className="data-type-grid">
                            {QR_DATA_TYPES.map(type => {
                                const Icon = typeof type.icon === 'string' ? null : type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        className={`data-type-btn ${config.dataType === type.value ? "active" : ""}`}
                                        onClick={() => setConfig({ ...config, dataType: type.value, content: "" })}
                                    >
                                        {Icon ? <Icon /> : <span className="emoji-icon">{type.icon}</span>}
                                        <span>{type.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Input */}
                    <div className="qr-section">
                        <h3 className="qr-section-title">
                            <FiLink /> Content
                        </h3>
                        <textarea
                            className="qr-content-input"
                            value={config.content}
                            onChange={(e) => setConfig({ ...config, content: e.target.value })}
                            placeholder={QR_DATA_TYPES.find(t => t.value === config.dataType)?.placeholder}
                            rows={4}
                        />
                        <small className="input-hint">
                            {config.content.length} characters
                        </small>
                    </div>

                    {/* Logo Upload */}
                    <div className="qr-section">
                        <h3 className="qr-section-title">
                            <FiImage /> Logo (Optional)
                        </h3>

                        {!logoPreview ? (
                            <div
                                className={`logo-upload-area ${dragActive ? "drag-active" : ""}`}
                                onDragEnter={handleLogoDrag}
                                onDragLeave={handleLogoDrag}
                                onDragOver={handleLogoDrag}
                                onDrop={handleLogoDrop}
                            >
                                <input
                                    id="logoInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="logo-file-input"
                                />
                                <label htmlFor="logoInput" className="logo-upload-label">
                                    <FiUpload />
                                    <span>Upload Logo</span>
                                </label>
                            </div>
                        ) : (
                            <div className="logo-preview-container">
                                <img src={logoPreview} alt="Logo" className="logo-preview" />
                                <button className="btn-remove-logo" onClick={removeLogo}>
                                    <FiX /> Remove
                                </button>
                            </div>
                        )}

                        {logoPreview && (
                            <div className="logo-size-control">
                                <label>Logo Size: {logoSize}%</label>
                                <input
                                    type="range"
                                    min="10"
                                    max="40"
                                    value={logoSize}
                                    onChange={(e) => setLogoSize(Number(e.target.value))}
                                    className="logo-size-slider"
                                />
                                <div className="logo-size-hints">
                                    <span>Small</span>
                                    <span>Large</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Color Customization */}
                    <div className="qr-section">
                        <h3 className="qr-section-title">
                            <FiDroplet /> Colors
                        </h3>

                        <div className="color-presets">
                            {PRESET_COLORS.map(preset => (
                                <button
                                    key={preset.name}
                                    className="color-preset-btn"
                                    onClick={() => applyPresetColor(preset)}
                                    title={preset.name}
                                >
                                    <div
                                        className="preset-color-swatch"
                                        style={{
                                            background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="color-pickers">
                            <div className="color-picker-item">
                                <label>Foreground</label>
                                <div className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        value={config.foregroundColor}
                                        onChange={(e) => setConfig({ ...config, foregroundColor: e.target.value })}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={config.foregroundColor}
                                        onChange={(e) => setConfig({ ...config, foregroundColor: e.target.value })}
                                        className="color-hex-input"
                                    />
                                </div>
                            </div>

                            <div className="color-picker-item">
                                <label>Background</label>
                                <div className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        value={config.backgroundColor}
                                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={config.backgroundColor}
                                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                                        className="color-hex-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="qr-section">
                        <h3 className="qr-section-title">
                            <FiMaximize2 /> Advanced Settings
                        </h3>

                        <div className="advanced-settings">
                            <div className="setting-item">
                                <label>Error Correction</label>
                                <select
                                    value={config.errorCorrectionLevel}
                                    onChange={(e) => setConfig({ ...config, errorCorrectionLevel: e.target.value as ErrorCorrectionLevel })}
                                    className="setting-select"
                                >
                                    {ERROR_CORRECTION_LEVELS.map(level => (
                                        <option key={level.value} value={level.value}>
                                            {level.label} - {level.description}
                                        </option>
                                    ))}
                                </select>
                                <small className="setting-hint">
                                    Higher levels allow QR codes to work even if partially damaged. Use "Q" or "H" when adding logos.
                                </small>
                            </div>

                            <div className="setting-item">
                                <label>Size: {config.size}px</label>
                                <input
                                    type="range"
                                    min="256"
                                    max="2048"
                                    step="128"
                                    value={config.size}
                                    onChange={(e) => setConfig({ ...config, size: Number(e.target.value) })}
                                    className="setting-slider"
                                />
                                <div className="setting-hints">
                                    <span>256px</span>
                                    <span>2048px</span>
                                </div>
                            </div>

                            <div className="setting-item">
                                <label>Margin: {config.margin}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={config.margin}
                                    onChange={(e) => setConfig({ ...config, margin: Number(e.target.value) })}
                                    className="setting-slider"
                                />
                                <div className="setting-hints">
                                    <span>No margin</span>
                                    <span>Large margin</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Preview & Download */}
                <div className="qr-preview-panel">
                    <div className="qr-preview-section">
                        <h3 className="qr-preview-title">Preview</h3>

                        {qrCodeDataUrl ? (
                            <motion.div
                                className="qr-preview-container"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="qr-preview-wrapper">
                                    <img src={qrCodeDataUrl} alt="QR Code" className="qr-preview-image" />
                                </div>

                                <div className="qr-download-buttons">
                                    <button
                                        className="btn-download-qr"
                                        onClick={() => handleDownload('png')}
                                    >
                                        <FiDownload /> Download PNG
                                    </button>
                                    <button
                                        className="btn-download-qr secondary"
                                        onClick={() => handleDownload('jpg')}
                                    >
                                        <FiDownload /> Download JPG
                                    </button>
                                    <button
                                        className="btn-download-qr secondary"
                                        onClick={() => handleDownload('svg')}
                                    >
                                        <FiDownload /> Download SVG
                                    </button>
                                </div>

                                <div className="qr-info-box">
                                    <h4>✓ QR Code Ready</h4>
                                    <ul>
                                        <li>Size: {config.size}×{config.size}px</li>
                                        <li>Error Correction: {config.errorCorrectionLevel} ({ERROR_CORRECTION_LEVELS.find(l => l.value === config.errorCorrectionLevel)?.label})</li>
                                        {logoPreview && <li>Logo: Embedded ({logoSize}%)</li>}
                                        <li>Format: PNG, JPG, SVG</li>
                                    </ul>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="qr-preview-placeholder">
                                <FiLink className="placeholder-icon" />
                                <h4>Enter content to generate QR code</h4>
                                <p>Your QR code will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default QRCodeGeneratorTool;
