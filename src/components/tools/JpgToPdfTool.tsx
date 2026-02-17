"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/toast/toast";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiAlertCircle,
    FiImage,
    FiTrash2,
    FiZap,
    FiMove,
    FiX
} from "react-icons/fi";

interface ImageFile {
    id: string;
    file: File;
    preview: string;
    width: number;
    height: number;
}

type PageSize = "a4" | "letter" | "legal" | "a5";
type PageOrientation = "portrait" | "landscape";
type ImageFit = "fit" | "fill" | "stretch";

const JpgToPdfTool = () => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pageSize, setPageSize] = useState<PageSize>("a4");
    const [orientation, setOrientation] = useState<PageOrientation>("portrait");
    const [imageFit, setImageFit] = useState<ImageFit>("fit");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Page size dimensions in mm
    const pageSizes = {
        a4: { width: 210, height: 297 },
        letter: { width: 216, height: 279 },
        legal: { width: 216, height: 356 },
        a5: { width: 148, height: 210 }
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter(file => file.type.startsWith("image/"));

        if (validFiles.length === 0) {
            toast.error("Please select image files", "Invalid Files");
            return;
        }

        if (validFiles.length !== files.length) {
            toast.warning(`${files.length - validFiles.length} non-image files were skipped`, "Warning");
        }

        // Check total number of images
        if (images.length + validFiles.length > 50) {
            toast.error("Maximum 50 images allowed", "Too Many Images");
            return;
        }

        // Process each image
        const newImages: ImageFile[] = [];

        for (const file of validFiles) {
            // Check file size (max 5MB per image)
            if (file.size > 5 * 1024 * 1024) {
                toast.warning(`${file.name} is too large (max 5MB)`, "Warning");
                continue;
            }

            try {
                const preview = await createImagePreview(file);
                const dimensions = await getImageDimensions(preview);

                newImages.push({
                    id: `${Date.now()}-${Math.random()}`,
                    file: file,
                    preview: preview,
                    width: dimensions.width,
                    height: dimensions.height
                });
            } catch (err) {
                toast.warning(`Failed to load ${file.name}`, "Warning");
            }
        }

        setImages([...images, ...newImages]);
        setError(null);
        toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} added`, "Success");

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Create image preview URL
    const createImagePreview = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Get image dimensions
    const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = src;
        });
    };

    // Remove image
    const removeImage = (id: string) => {
        setImages(images.filter(img => img.id !== id));
        toast.info("Image removed", "Removed");
    };

    // Handle drag start
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === index) return;

        const newImages = [...images];
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, draggedImage);

        setImages(newImages);
        setDraggedIndex(index);
    };

    // Handle drag end
    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    // Convert images to PDF
    const convertToPdf = async () => {
        if (images.length === 0) {
            toast.error("Please add at least one image", "No Images");
            return;
        }

        setConverting(true);
        setError(null);

        try {
            // Get page dimensions
            const size = pageSizes[pageSize];
            const width = orientation === "portrait" ? size.width : size.height;
            const height = orientation === "portrait" ? size.height : size.width;

            // Create PDF
            const pdf = new jsPDF({
                orientation: orientation,
                unit: "mm",
                format: pageSize
            });

            // Add each image to PDF
            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                // Add new page for images after the first
                if (i > 0) {
                    pdf.addPage();
                }

                // Calculate image dimensions
                let imgWidth = width;
                let imgHeight = height;
                let x = 0;
                let y = 0;

                if (imageFit === "fit") {
                    // Fit image within page maintaining aspect ratio
                    const imgRatio = image.width / image.height;
                    const pageRatio = width / height;

                    if (imgRatio > pageRatio) {
                        // Image is wider
                        imgHeight = width / imgRatio;
                        y = (height - imgHeight) / 2;
                    } else {
                        // Image is taller
                        imgWidth = height * imgRatio;
                        x = (width - imgWidth) / 2;
                    }
                } else if (imageFit === "fill") {
                    // Fill page, may crop image
                    const imgRatio = image.width / image.height;
                    const pageRatio = width / height;

                    if (imgRatio > pageRatio) {
                        // Image is wider
                        imgWidth = height * imgRatio;
                        x = (width - imgWidth) / 2;
                    } else {
                        // Image is taller
                        imgHeight = width / imgRatio;
                        y = (height - imgHeight) / 2;
                    }
                }
                // For "stretch", use full page dimensions (already set)

                // Add image to PDF
                pdf.addImage(
                    image.preview,
                    "JPEG",
                    x,
                    y,
                    imgWidth,
                    imgHeight
                );
            }

            // Save PDF
            const pdfBlob = pdf.output("blob");
            saveAs(pdfBlob, "converted.pdf");

            toast.success(`PDF created with ${images.length} page${images.length > 1 ? 's' : ''}!`, "Success");
        } catch (err: any) {
            console.error("Conversion error:", err);
            setError(err.message || "Failed to create PDF");
            toast.error("Failed to create PDF", "Error");
        } finally {
            setConverting(false);
        }
    };

    // Clear all images
    const handleClear = () => {
        setImages([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.info("All images cleared", "Cleared");
    };

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
                    Convert JPG, PNG, and other images to a single PDF file. Arrange images in any order,
                    choose page size and orientation. Perfect for creating photo albums and image portfolios.
                </p>
            </div>

            {/* PDF Options */}
            <div className="pdf-creation-options">
                <div className="option-group">
                    <label>Page Size:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as PageSize)}
                        className="option-select"
                    >
                        <option value="a4">A4 (210 × 297 mm)</option>
                        <option value="letter">Letter (216 × 279 mm)</option>
                        <option value="legal">Legal (216 × 356 mm)</option>
                        <option value="a5">A5 (148 × 210 mm)</option>
                    </select>
                </div>

                <div className="option-group">
                    <label>Orientation:</label>
                    <div className="orientation-selector">
                        <button
                            className={`orientation-btn ${orientation === "portrait" ? "active" : ""}`}
                            onClick={() => setOrientation("portrait")}
                        >
                            Portrait
                        </button>
                        <button
                            className={`orientation-btn ${orientation === "landscape" ? "active" : ""}`}
                            onClick={() => setOrientation("landscape")}
                        >
                            Landscape
                        </button>
                    </div>
                </div>

                <div className="option-group">
                    <label>Image Fit:</label>
                    <select
                        value={imageFit}
                        onChange={(e) => setImageFit(e.target.value as ImageFit)}
                        className="option-select"
                    >
                        <option value="fit">Fit (Maintain ratio)</option>
                        <option value="fill">Fill (May crop)</option>
                        <option value="stretch">Stretch (Full page)</option>
                    </select>
                </div>
            </div>

            {/* Upload Section */}
            <div className="jpg-upload-section">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="file-input-hidden"
                    id="jpgFileInput"
                />
                <label htmlFor="jpgFileInput" className="jpg-upload-area">
                    <FiUpload className="upload-icon" />
                    <h3>Click to add images</h3>
                    <p>or drag and drop</p>
                    <small>JPG, PNG, GIF, WebP • Max 5MB per image • Up to 50 images</small>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiAlertCircle />
                    <span>{error}</span>
                </motion.div>
            )}

            {/* Images Preview */}
            {images.length > 0 && (
                <motion.div
                    className="images-preview-section"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="preview-header">
                        <h3>
                            <FiImage /> Images ({images.length})
                        </h3>
                        <div className="preview-actions">
                            <span className="drag-hint">
                                <FiMove /> Drag to reorder
                            </span>
                            <button className="btn-clear-images" onClick={handleClear}>
                                <FiTrash2 /> Clear All
                            </button>
                        </div>
                    </div>

                    <div className="images-preview-grid">
                        <AnimatePresence>
                            {images.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    className={`preview-image-card ${draggedIndex === index ? "dragging" : ""}`}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <div className="image-number">{index + 1}</div>
                                    <div className="preview-image-wrapper">
                                        <img src={image.preview} alt={image.file.name} />
                                    </div>
                                    <div className="preview-image-info">
                                        <div className="image-filename">{image.file.name}</div>
                                        <div className="image-size">
                                            {image.width} × {image.height} • {(image.file.size / 1024).toFixed(0)} KB
                                        </div>
                                    </div>
                                    <button
                                        className="btn-remove-preview"
                                        onClick={() => removeImage(image.id)}
                                    >
                                        <FiX />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="conversion-section">
                        <motion.button
                            className="btn-create-pdf"
                            onClick={convertToPdf}
                            disabled={converting || images.length === 0}
                            whileHover={{ scale: converting ? 1 : 1.02 }}
                            whileTap={{ scale: converting ? 1 : 0.98 }}
                        >
                            {converting ? (
                                <>
                                    <span className="spinner" />
                                    Creating PDF...
                                </>
                            ) : (
                                <>
                                    <FiDownload />
                                    Create PDF ({images.length} page{images.length !== 1 ? 's' : ''})
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* How It Works */}
            {images.length === 0 && (
                <div className="how-it-works">
                    <h3>How It Works</h3>
                    <div className="steps-grid">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Add Images</h4>
                            <p>Upload JPG, PNG, or other images</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Arrange Order</h4>
                            <p>Drag and drop to reorder pages</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Configure</h4>
                            <p>Choose size, orientation, fit</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Create PDF</h4>
                            <p>Download your PDF file</p>
                        </div>
                    </div>

                    <div className="feature-highlights">
                        <div className="feature-item">
                            <FiImage />
                            <span>Multiple image formats supported</span>
                        </div>
                        <div className="feature-item">
                            <FiMove />
                            <span>Drag and drop to reorder</span>
                        </div>
                        <div className="feature-item">
                            <FiZap />
                            <span>Fast browser-based conversion</span>
                        </div>
                        <div className="feature-item">
                            <FiCheckCircle />
                            <span>100% private - no uploads</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default JpgToPdfTool;
