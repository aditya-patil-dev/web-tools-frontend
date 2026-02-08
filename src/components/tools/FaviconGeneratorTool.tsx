"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "@/components/toast/toast";
import {
    FiUpload,
    FiDownload,
    FiX,
    FiCheckCircle,
    FiImage,
    FiMonitor,
    FiSmartphone,
    FiTablet
} from "react-icons/fi";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];

interface FaviconSize {
    size: number;
    name: string;
    description: string;
    platform: string;
}

interface GeneratedFavicon {
    size: number;
    name: string;
    blob: Blob;
    preview: string;
}

const FAVICON_SIZES: FaviconSize[] = [
    { size: 16, name: "favicon-16x16.png", description: "Browser tab", platform: "Browser" },
    { size: 32, name: "favicon-32x32.png", description: "Taskbar shortcut", platform: "Browser" },
    { size: 48, name: "favicon-48x48.png", description: "Windows site icon", platform: "Windows" },
    { size: 64, name: "favicon-64x64.png", description: "Windows taskbar", platform: "Windows" },
    { size: 96, name: "favicon-96x96.png", description: "Google TV", platform: "Google TV" },
    { size: 128, name: "favicon-128x128.png", description: "Chrome Web Store", platform: "Chrome" },
    { size: 180, name: "apple-touch-icon.png", description: "iPhone/iPad", platform: "iOS" },
    { size: 192, name: "android-chrome-192x192.png", description: "Android home screen", platform: "Android" },
    { size: 512, name: "android-chrome-512x512.png", description: "Android splash", platform: "Android" }
];

const FaviconGeneratorTool = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [generatedFavicons, setGeneratedFavicons] = useState<GeneratedFavicon[]>([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedSizes, setSelectedSizes] = useState<number[]>(
        FAVICON_SIZES.map(f => f.size)
    );

    const canvasRef = useRef<HTMLCanvasElement>(null);

    /* -----------------------------
       File Handling
    ------------------------------ */

    const processFile = (file: File) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast.error("Only image files are allowed.", "Invalid File Type");
            return;
        }

        // Check if image is reasonably square
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            
            const aspectRatio = img.width / img.height;
            if (aspectRatio < 0.8 || aspectRatio > 1.2) {
                toast.warning(
                    "For best results, use a square image. Your image will be cropped to square.",
                    "Non-Square Image"
                );
            }

            if (img.width < 512 || img.height < 512) {
                toast.warning(
                    "Image is smaller than 512x512. Larger sizes may look pixelated.",
                    "Low Resolution"
                );
            }

            setSelectedFile(file);
            setImagePreview(URL.createObjectURL(file));
            setGeneratedFavicons([]);
            toast.success("Image uploaded successfully!", "Upload Complete");
        };

        img.src = url;
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
       Favicon Generation
    ------------------------------ */

    const generateFavicon = async (size: number, name: string): Promise<GeneratedFavicon> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                // Calculate square crop
                const sourceSize = Math.min(img.width, img.height);
                const sourceX = (img.width - sourceSize) / 2;
                const sourceY = (img.height - sourceSize) / 2;

                // High-quality rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw cropped and resized image
                ctx.drawImage(
                    img,
                    sourceX, sourceY, sourceSize, sourceSize,
                    0, 0, size, size
                );

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create blob'));
                        return;
                    }

                    resolve({
                        size,
                        name,
                        blob,
                        preview: URL.createObjectURL(blob)
                    });
                }, 'image/png', 1.0);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = imagePreview;
        });
    };

    const generateIcoFile = async (favicons: GeneratedFavicon[]): Promise<Blob> => {
        // Generate .ico file from PNG images
        // ICO format supports multiple sizes in one file
        const icoSizes = favicons.filter(f => [16, 32, 48].includes(f.size));
        
        if (icoSizes.length === 0) {
            throw new Error('No suitable sizes for ICO generation');
        }

        // Simple ICO file generation
        // ICO Header: 6 bytes + (16 bytes * number of images)
        const numImages = icoSizes.length;
        const headerSize = 6 + (16 * numImages);
        
        let totalSize = headerSize;
        const imageDataArray: ArrayBuffer[] = [];

        for (const favicon of icoSizes) {
            const arrayBuffer = await favicon.blob.arrayBuffer();
            imageDataArray.push(arrayBuffer);
            totalSize += arrayBuffer.byteLength;
        }

        const icoData = new Uint8Array(totalSize);
        let offset = 0;

        // ICO Header
        icoData[0] = 0; // Reserved
        icoData[1] = 0;
        icoData[2] = 1; // Type: 1 for ICO
        icoData[3] = 0;
        icoData[4] = numImages; // Number of images
        icoData[5] = 0;

        offset = 6;

        // Image directory entries
        let imageOffset = headerSize;
        for (let i = 0; i < icoSizes.length; i++) {
            const size = icoSizes[i].size;
            const imageData = imageDataArray[i];

            icoData[offset++] = size === 256 ? 0 : size; // Width (0 means 256)
            icoData[offset++] = size === 256 ? 0 : size; // Height
            icoData[offset++] = 0; // Color palette
            icoData[offset++] = 0; // Reserved
            icoData[offset++] = 1; // Color planes
            icoData[offset++] = 0;
            icoData[offset++] = 32; // Bits per pixel
            icoData[offset++] = 0;

            // Image size
            const sizeBytes = imageData.byteLength;
            icoData[offset++] = sizeBytes & 0xFF;
            icoData[offset++] = (sizeBytes >> 8) & 0xFF;
            icoData[offset++] = (sizeBytes >> 16) & 0xFF;
            icoData[offset++] = (sizeBytes >> 24) & 0xFF;

            // Image offset
            icoData[offset++] = imageOffset & 0xFF;
            icoData[offset++] = (imageOffset >> 8) & 0xFF;
            icoData[offset++] = (imageOffset >> 16) & 0xFF;
            icoData[offset++] = (imageOffset >> 24) & 0xFF;

            imageOffset += sizeBytes;
        }

        // Append image data
        for (const imageData of imageDataArray) {
            icoData.set(new Uint8Array(imageData), offset);
            offset += imageData.byteLength;
        }

        return new Blob([icoData], { type: 'image/x-icon' });
    };

    const handleGenerate = async () => {
        if (!selectedFile || !imagePreview) {
            toast.error("Please upload an image first.", "No Image");
            return;
        }

        if (selectedSizes.length === 0) {
            toast.error("Please select at least one size.", "No Sizes Selected");
            return;
        }

        setLoading(true);
        setProgress(0);
        toast.info("Generating favicons...", "Processing");

        try {
            const favicons: GeneratedFavicon[] = [];
            const totalSizes = selectedSizes.length;

            for (let i = 0; i < selectedSizes.length; i++) {
                const size = selectedSizes[i];
                const sizeConfig = FAVICON_SIZES.find(f => f.size === size);
                
                if (!sizeConfig) continue;

                const favicon = await generateFavicon(size, sizeConfig.name);
                favicons.push(favicon);

                const currentProgress = Math.round(((i + 1) / totalSizes) * 100);
                setProgress(currentProgress);
            }

            setGeneratedFavicons(favicons);
            toast.success(`Generated ${favicons.length} favicon sizes!`, "Generation Complete");
        } catch (err) {
            console.error(err);
            toast.error("Error generating favicons. Please try again.", "Generation Failed");
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    /* -----------------------------
       Download
    ------------------------------ */

    const handleDownloadAll = async () => {
        if (generatedFavicons.length === 0) return;

        try {
            toast.info("Creating favicon package...", "Please wait");

            const zip = new JSZip();

            // Add all PNG files
            generatedFavicons.forEach(favicon => {
                zip.file(favicon.name, favicon.blob);
            });

            // Generate and add .ico file
            try {
                const icoBlob = await generateIcoFile(generatedFavicons);
                zip.file("favicon.ico", icoBlob);
            } catch (err) {
                console.error("ICO generation error:", err);
                toast.warning("ICO file generation failed, but PNGs are included.", "Partial Success");
            }

            // Add HTML snippet
            const htmlSnippet = `<!-- Favicon HTML -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;

            zip.file("favicon-html.txt", htmlSnippet);

            // Generate ZIP
            const blob = await zip.generateAsync({ type: "blob" });
            saveAs(blob, "favicons.zip");

            toast.success("Favicon package downloaded!", "Success");
        } catch (err) {
            console.error(err);
            toast.error("Error creating download package.", "Download Failed");
        }
    };

    const handleDownloadSingle = (favicon: GeneratedFavicon) => {
        saveAs(favicon.blob, favicon.name);
        toast.success(`Downloaded ${favicon.name}`, "Success");
    };

    const toggleSize = (size: number) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const toggleAllSizes = () => {
        if (selectedSizes.length === FAVICON_SIZES.length) {
            setSelectedSizes([]);
        } else {
            setSelectedSizes(FAVICON_SIZES.map(f => f.size));
        }
    };

    const resetTool = () => {
        setSelectedFile(null);
        setImagePreview("");
        setGeneratedFavicons([]);
        setSelectedSizes(FAVICON_SIZES.map(f => f.size));
        const input = document.getElementById("inputFavicon") as HTMLInputElement;
        if (input) input.value = "";
    };

    /* -----------------------------
       Group sizes by platform
    ------------------------------ */

    const groupedSizes = FAVICON_SIZES.reduce((acc, size) => {
        if (!acc[size.platform]) {
            acc[size.platform] = [];
        }
        acc[size.platform].push(size);
        return acc;
    }, {} as Record<string, FaviconSize[]>);

    const platformIcons: Record<string, unknown> = {
        "Browser": FiMonitor,
        "Windows": FiMonitor,
        "iOS": FiSmartphone,
        "Android": FiSmartphone,
        "Chrome": FiMonitor,
        "Google TV": FiTablet
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

            {/* Info Banner */}
            <div className="tool-info-banner">
                <FiCheckCircle />
                <p>
                    Generate all favicon sizes for web, iOS, and Android. Creates .ico file and provides HTML snippets.
                    Upload a square image (512x512+ recommended).
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
                        id="inputFavicon"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="tool-file-input"
                    />

                    <label htmlFor="inputFavicon" className="tool-upload-label">
                        <FiUpload className="upload-icon" />
                        <h3>Drop your logo/icon here or click to browse</h3>
                        <p>Square images work best • Minimum 512x512 recommended</p>
                    </label>
                </div>
            )}

            {/* Favicon Workspace */}
            <AnimatePresence>
                {imagePreview && (
                    <motion.div
                        className="favicon-workspace"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {/* Preview & Controls */}
                        <div className="favicon-preview-section">
                            <div className="favicon-source-preview">
                                <img src={imagePreview} alt="Source" className="source-image" />
                                <button className="btn-change-image" onClick={resetTool}>
                                    <FiX /> Change Image
                                </button>
                            </div>

                            <div className="favicon-info-card">
                                <h3>📦 What you'll get:</h3>
                                <ul>
                                    <li>✅ All selected PNG sizes</li>
                                    <li>✅ favicon.ico (16x16, 32x32, 48x48)</li>
                                    <li>✅ HTML code snippet</li>
                                    <li>✅ Ready for web, iOS, Android</li>
                                </ul>
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="size-selection-section">
                            <div className="size-selection-header">
                                <h3>Select Favicon Sizes</h3>
                                <button className="btn-toggle-all" onClick={toggleAllSizes}>
                                    {selectedSizes.length === FAVICON_SIZES.length ? "Deselect All" : "Select All"}
                                </button>
                            </div>

                            {Object.entries(groupedSizes).map(([platform, sizes]) => {
                                const Icon = platformIcons[platform] || FiImage;
                                return (
                                    <div key={platform} className="platform-group">
                                        <div className="platform-header">
                                            <Icon />
                                            <h4>{platform}</h4>
                                        </div>
                                        <div className="sizes-grid">
                                            {sizes.map(size => (
                                                <label
                                                    key={size.size}
                                                    className={`size-checkbox-card ${selectedSizes.includes(size.size) ? "selected" : ""}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSizes.includes(size.size)}
                                                        onChange={() => toggleSize(size.size)}
                                                    />
                                                    <div className="size-info">
                                                        <span className="size-dimension">{size.size}×{size.size}</span>
                                                        <span className="size-desc">{size.description}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Generate Button */}
                        <motion.button
                            className="btn-generate-favicons"
                            onClick={handleGenerate}
                            disabled={loading || selectedSizes.length === 0}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" />
                                    Generating... {progress}%
                                </>
                            ) : (
                                <>
                                    <FiImage />
                                    Generate {selectedSizes.length} Favicon{selectedSizes.length !== 1 ? "s" : ""}
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
                                    className="progress-bar favicon-progress"
                                    style={{ width: `${progress}%` }}
                                />
                            </motion.div>
                        )}

                        {/* Generated Favicons */}
                        {generatedFavicons.length > 0 && (
                            <motion.div
                                className="generated-favicons-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="generated-header">
                                    <FiCheckCircle className="success-icon-large" />
                                    <h3>Favicons Generated!</h3>
                                    <p>{generatedFavicons.length} sizes ready to download</p>
                                </div>

                                {/* Preview Grid */}
                                <div className="favicon-preview-grid">
                                    {generatedFavicons.map((favicon, index) => (
                                        <motion.div
                                            key={index}
                                            className="favicon-preview-card"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <div className="favicon-preview-image-container">
                                                <img
                                                    src={favicon.preview}
                                                    alt={`${favicon.size}x${favicon.size}`}
                                                    className="favicon-preview-image"
                                                />
                                            </div>
                                            <div className="favicon-preview-info">
                                                <span className="favicon-size-label">{favicon.size}×{favicon.size}</span>
                                                <span className="favicon-name">{favicon.name}</span>
                                            </div>
                                            <button
                                                className="btn-download-single"
                                                onClick={() => handleDownloadSingle(favicon)}
                                                title="Download this size"
                                            >
                                                <FiDownload />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Download All Button */}
                                <motion.button
                                    className="btn-download-all-favicons"
                                    onClick={handleDownloadAll}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiDownload />
                                    Download All (.zip with .ico + HTML)
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FaviconGeneratorTool;
