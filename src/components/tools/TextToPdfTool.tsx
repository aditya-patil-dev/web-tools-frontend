"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiFileText, FiDownload, FiCheckCircle, FiAlertCircle,
    FiRefreshCw, FiSettings, FiChevronDown, FiChevronUp,
    FiX, FiZap, FiInfo,
} from "react-icons/fi";
import jsPDF from "jspdf";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Level } from "@tiptap/extension-heading";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type PageSize = "A4" | "Letter" | "Legal" | "A5";
type PageOrientation = "portrait" | "landscape";
type FontFamily = "helvetica" | "times" | "courier";
type FontSize = 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24;
type LineSpacing = 1 | 1.15 | 1.5 | 2;

interface PDFSettings {
    pageSize: PageSize;
    orientation: PageOrientation;
    fontFamily: FontFamily;
    fontSize: FontSize;
    lineSpacing: LineSpacing;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    addPageNumbers: boolean;
    addTimestamp: boolean;
    headerText: string;
    footerText: string;
}

interface Preset {
    id: string;
    label: string;
    icon: string;
    settings: Partial<PDFSettings>;
}

interface Toast {
    id: string;
    type: "success" | "error";
    message: string;
}

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const PAGE_SIZES = {
    A4: { width: 210, height: 297 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
    A5: { width: 148, height: 210 },
};

const PRESETS: Preset[] = [
    {
        id: "resume",
        label: "Resume",
        icon: "👤",
        settings: { pageSize: "Letter", orientation: "portrait", fontFamily: "times", fontSize: 11, lineSpacing: 1.15, marginTop: 18, marginBottom: 18, marginLeft: 18, marginRight: 18, addPageNumbers: false },
    },
    {
        id: "letter",
        label: "Letter",
        icon: "✉️",
        settings: { pageSize: "Letter", orientation: "portrait", fontFamily: "times", fontSize: 12, lineSpacing: 1.5, marginTop: 25, marginBottom: 25, marginLeft: 30, marginRight: 30, addPageNumbers: false },
    },
    {
        id: "report",
        label: "Report",
        icon: "📊",
        settings: { pageSize: "A4", orientation: "portrait", fontFamily: "helvetica", fontSize: 11, lineSpacing: 1.5, marginTop: 25, marginBottom: 25, marginLeft: 25, marginRight: 20, addPageNumbers: true },
    },
    {
        id: "code",
        label: "Code Doc",
        icon: "💻",
        settings: { pageSize: "A4", orientation: "landscape", fontFamily: "courier", fontSize: 10, lineSpacing: 1.15, marginTop: 15, marginBottom: 15, marginLeft: 15, marginRight: 15, addPageNumbers: true },
    },
];

const DEFAULT_SETTINGS: PDFSettings = {
    pageSize: "A4",
    orientation: "portrait",
    fontFamily: "helvetica",
    fontSize: 12,
    lineSpacing: 1.5,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 20,
    marginLeft: 20,
    addPageNumbers: true,
    addTimestamp: false,
    headerText: "",
    footerText: "",
};

const WORD_SOFT_LIMIT = 5000;
const CHAR_HARD_LIMIT = 50000;

/* ─────────────────────────────────────────
   HTML → PDF renderer (respects formatting)
───────────────────────────────────────── */
interface RenderNode {
    type: "h1" | "h2" | "h3" | "p" | "li" | "hr" | "blank";
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    listStyle?: "bullet" | "ordered";
    listIndex?: number;
}

function parseHTMLToNodes(html: string): RenderNode[] {
    const nodes: RenderNode[] = [];
    if (!html || html === "<p></p>") return nodes;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    function extractInlineText(el: Element): { text: string; bold: boolean; italic: boolean; underline: boolean } {
        let text = "";
        let bold = false;
        let italic = false;
        let underline = false;

        function walk(node: Node) {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent || "";
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = (node as Element).tagName.toLowerCase();
                if (tag === "strong" || tag === "b") bold = true;
                if (tag === "em" || tag === "i") italic = true;
                if (tag === "u") underline = true;
                node.childNodes.forEach(walk);
            }
        }
        walk(el);
        return { text, bold, italic, underline };
    }

    function processEl(el: Element) {
        const tag = el.tagName.toLowerCase();

        if (tag === "h1" || tag === "h2" || tag === "h3") {
            nodes.push({ type: tag as "h1" | "h2" | "h3", text: el.textContent?.trim() || "", bold: true });
            return;
        }

        if (tag === "p") {
            const text = el.textContent?.trim() || "";
            if (!text) { nodes.push({ type: "blank", text: "" }); return; }
            const inline = extractInlineText(el);
            nodes.push({ type: "p", text, bold: inline.bold, italic: inline.italic, underline: inline.underline });
            return;
        }

        if (tag === "ul") {
            el.querySelectorAll("li").forEach((li) => {
                nodes.push({ type: "li", text: li.textContent?.trim() || "", listStyle: "bullet" });
            });
            return;
        }

        if (tag === "ol") {
            el.querySelectorAll("li").forEach((li, i) => {
                nodes.push({ type: "li", text: li.textContent?.trim() || "", listStyle: "ordered", listIndex: i + 1 });
            });
            return;
        }

        if (tag === "hr") {
            nodes.push({ type: "hr", text: "" });
            return;
        }

        // Recurse into divs etc
        el.childNodes.forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) processEl(child as Element);
        });
    }

    doc.body.childNodes.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) processEl(child as Element);
    });

    return nodes;
}

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const TextToPDFTool = () => {
    const [fileName, setFileName] = useState("document");
    const [generating, setGenerating] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activePreset, setActivePreset] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [progress, setProgress] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [settings, setSettings] = useState<PDFSettings>(DEFAULT_SETTINGS);
    const fileNameRef = useRef<HTMLInputElement>(null);

    /* ── Editor ── */
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder: "Start writing your document here…" }),
            Underline,
            Highlight,
            Link.configure({ openOnClick: false }),
            TextAlign.configure({ types: ["heading", "paragraph"] }),
        ],
        content: "",
        onUpdate({ editor }) {
            const text = editor.getText();
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            setWordCount(words);
            setCharCount(text.length);
            // Auto-suggest filename from first heading/line
            const firstLine = text.split("\n").find((l) => l.trim());
            if (firstLine && fileName === "document") {
                const slug = firstLine.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "");
                if (slug) setFileName(slug);
            }
        },
        immediatelyRender: false,
    });

    /* ── Keyboard shortcut: Cmd/Ctrl+Enter → generate ── */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                generatePDF();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === ",") {
                e.preventDefault();
                setShowSettings((v) => !v);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [editor, settings, fileName]);

    /* ── Toast helpers ── */
    const addToast = (type: Toast["type"], message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };

    /* ── Settings helpers ── */
    const updateSetting = <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        setActivePreset(null);
    };

    const applyPreset = (preset: Preset) => {
        setSettings({
            ...DEFAULT_SETTINGS,
            ...preset.settings,
        } as PDFSettings);
        setActivePreset(preset.id);
        setShowSettings(true);
        addToast("success", `"${preset.label}" preset applied!`);
    };

    /* ── Stats ── */
    const estimatePages = (): number => {
        if (!editor || !editor.getText().trim()) return 0;
        const { pageSize, orientation, fontSize, lineSpacing, marginTop, marginBottom, marginLeft, marginRight } = settings;
        const dims = PAGE_SIZES[pageSize];
        const pw = orientation === "portrait" ? dims.width : dims.height;
        const ph = orientation === "portrait" ? dims.height : dims.width;
        const uw = pw - marginLeft - marginRight;
        const uh = ph - marginTop - marginBottom;
        const cpl = Math.floor(uw / (fontSize * 0.5));
        const lh = fontSize * 0.3527 * lineSpacing;
        const lpp = Math.floor(uh / lh);
        const totalLines = Math.ceil(charCount / cpl);
        return Math.max(1, Math.ceil(totalLines / lpp));
    };

    const estimateFileSize = (): string => {
        const kb = Math.max(10, Math.round(charCount * 0.05 + estimatePages() * 8));
        return kb > 1024 ? `~${(kb / 1024).toFixed(1)} MB` : `~${kb} KB`;
    };

    /* ── Clear ── */
    const handleClear = () => {
        editor?.commands.clearContent();
        setFileName("document");
        setWordCount(0);
        setCharCount(0);
    };

    /* ── Load Sample ── */
    const loadSample = () => {
        editor?.commands.setContent(`<h1>Sample Document</h1>
<p>This is a <strong>sample document</strong> to demonstrate the <em>Text to PDF</em> converter with rich formatting support.</p>
<h2>Key Features</h2>
<ul>
<li>Rich text editing with bold, italic, underline</li>
<li>Headings (H1, H2, H3) preserved in PDF</li>
<li>Bullet and numbered lists rendered correctly</li>
<li>Custom fonts, margins, and page sizes</li>
<li>Page numbers and headers/footers</li>
</ul>
<h2>Getting Started</h2>
<p>Replace this content with your own text. Use the toolbar above to format your document, then click <strong>Generate PDF</strong> to download.</p>
<h3>Tips</h3>
<ol>
<li>Use headings to structure your document</li>
<li>Apply <strong>bold</strong> for emphasis</li>
<li>Choose a preset for quick formatting</li>
</ol>`);
    };

    /* ── Generate PDF ── */
    const generatePDF = async () => {
        if (!editor || !editor.getText().trim() || generating) return;

        setGenerating(true);
        setProgress(0);

        try {
            const html = editor.getHTML();
            const nodes = parseHTMLToNodes(html);

            const { pageSize, orientation, fontFamily, fontSize, lineSpacing,
                marginTop, marginRight, marginBottom, marginLeft,
                addPageNumbers, addTimestamp, headerText, footerText } = settings;

            const dims = PAGE_SIZES[pageSize];
            const pageWidth = orientation === "portrait" ? dims.width : dims.height;
            const pageHeight = orientation === "portrait" ? dims.height : dims.width;

            const doc = new jsPDF({ orientation, unit: "mm", format: pageSize });

            const usableWidth = pageWidth - marginLeft - marginRight;
            let currentY = marginTop;
            let pageNumber = 1;

            setProgress(20);

            const addHeader = () => {
                if (headerText) {
                    doc.setFontSize(9);
                    doc.setFont(fontFamily, "normal");
                    doc.setTextColor(120, 120, 120);
                    doc.text(headerText, pageWidth / 2, marginTop - 8, { align: "center" });
                    doc.setTextColor(0, 0, 0);
                }
            };

            const addFooter = (page: number) => {
                const footerY = pageHeight - marginBottom + 8;
                doc.setFontSize(9);
                doc.setFont(fontFamily, "normal");
                doc.setTextColor(120, 120, 120);
                if (footerText) doc.text(footerText, pageWidth / 2, footerY, { align: "center" });
                if (addPageNumbers) doc.text(`Page ${page}`, pageWidth - marginRight, footerY, { align: "right" });
                if (addTimestamp) doc.text(new Date().toLocaleString(), marginLeft, footerY, { align: "left" });
                doc.setTextColor(0, 0, 0);
            };

            const checkNewPage = (neededHeight: number) => {
                if (currentY + neededHeight > pageHeight - marginBottom) {
                    addFooter(pageNumber);
                    doc.addPage();
                    pageNumber++;
                    currentY = marginTop;
                    addHeader();
                }
            };

            addHeader();

            setProgress(40);

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const progress = 40 + Math.round((i / nodes.length) * 40);
                setProgress(progress);

                if (node.type === "blank") {
                    currentY += fontSize * 0.3527 * lineSpacing * 0.5;
                    continue;
                }

                if (node.type === "hr") {
                    checkNewPage(6);
                    doc.setDrawColor(180, 180, 180);
                    doc.line(marginLeft, currentY, marginLeft + usableWidth, currentY);
                    doc.setDrawColor(0, 0, 0);
                    currentY += 6;
                    continue;
                }

                // Heading sizes
                let nodeFontSize = fontSize;
                let nodeFontStyle = "normal";
                let nodeSpacingBefore = 0;

                if (node.type === "h1") {
                    nodeFontSize = Math.min(fontSize * 1.8, 28);
                    nodeFontStyle = "bold";
                    nodeSpacingBefore = fontSize * 0.3527 * 1.5;
                } else if (node.type === "h2") {
                    nodeFontSize = Math.min(fontSize * 1.4, 22);
                    nodeFontStyle = "bold";
                    nodeSpacingBefore = fontSize * 0.3527 * 1.2;
                } else if (node.type === "h3") {
                    nodeFontSize = Math.min(fontSize * 1.15, 18);
                    nodeFontStyle = "bold";
                    nodeSpacingBefore = fontSize * 0.3527;
                } else if (node.bold && node.italic) {
                    nodeFontStyle = "bolditalic";
                } else if (node.bold) {
                    nodeFontStyle = "bold";
                } else if (node.italic) {
                    nodeFontStyle = "italic";
                }

                doc.setFont(fontFamily, nodeFontStyle);
                doc.setFontSize(nodeFontSize);

                const lineH = nodeFontSize * 0.3527 * lineSpacing;

                // List prefix
                let textToPrint = node.text;
                let xOffset = marginLeft;

                if (node.type === "li") {
                    xOffset = marginLeft + 5;
                    const usableListWidth = usableWidth - 5;
                    const prefix = node.listStyle === "bullet" ? "• " : `${node.listIndex}. `;
                    const lines = doc.splitTextToSize(textToPrint, usableListWidth - 6);

                    checkNewPage(lineH * lines.length + nodeSpacingBefore);
                    if (nodeSpacingBefore > 0) currentY += nodeSpacingBefore;
                    doc.text(prefix, xOffset, currentY);
                    lines.forEach((line: string, li: number) => {
                        if (li === 0) {
                            doc.text(line, xOffset + 6, currentY);
                        } else {
                            currentY += lineH;
                            doc.text(line, xOffset + 6, currentY);
                        }
                    });
                    currentY += lineH;
                    continue;
                }

                const lines = doc.splitTextToSize(textToPrint, usableWidth);
                checkNewPage(lineH * lines.length + nodeSpacingBefore);

                if (nodeSpacingBefore > 0) currentY += nodeSpacingBefore;

                lines.forEach((line: string) => {
                    doc.text(line, xOffset, currentY);
                    // Underline simulation
                    if (node.underline) {
                        const tw = doc.getTextWidth(line);
                        doc.setDrawColor(0, 0, 0);
                        doc.line(xOffset, currentY + 0.5, xOffset + tw, currentY + 0.5);
                    }
                    currentY += lineH;
                });

                // Extra spacing after headings
                if (node.type === "h1" || node.type === "h2" || node.type === "h3") {
                    currentY += lineH * 0.3;
                }
            }

            addFooter(pageNumber);

            setProgress(90);

            const safeFileName = fileName.trim() || "document";
            doc.save(`${safeFileName}.pdf`);

            setProgress(100);
            addToast("success", `"${safeFileName}.pdf" generated successfully!`);
        } catch (err) {
            console.error(err);
            addToast("error", "Failed to generate PDF. Please try again.");
        } finally {
            setTimeout(() => {
                setGenerating(false);
                setProgress(0);
            }, 600);
        }
    };

    const isEmpty = !editor || !editor.getText().trim();
    const isOverLimit = charCount > CHAR_HARD_LIMIT;
    const isNearLimit = wordCount >= WORD_SOFT_LIMIT;

    /* ─── Toolbar Button helper ─── */
    const ToolbarBtn = ({
        onClick, active, title, children,
    }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`rte-btn${active ? " rte-btn--active" : ""}`}
        >
            {children}
        </button>
    );

    /* ─────────────────────────────────────────
       RENDER
    ───────────────────────────────────────── */
    return (
        <motion.div
            className="tool-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="t2p-root">

                {/* ── Toast Stack ── */}
                <div className="t2p-toasts">
                    <AnimatePresence>
                        {toasts.map((toast) => (
                            <motion.div
                                key={toast.id}
                                className={`t2p-toast t2p-toast--${toast.type}`}
                                initial={{ opacity: 0, x: 60 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 60 }}
                            >
                                {toast.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                                <span>{toast.message}</span>
                                <button onClick={() => setToasts((p) => p.filter((t) => t.id !== toast.id))}>
                                    <FiX />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* ── Header Bar ── */}
                <div className="t2p-header">
                    <div className="t2p-filename-wrap">
                        <FiFileText className="t2p-filename-icon" />
                        <input
                            ref={fileNameRef}
                            type="text"
                            className="t2p-filename-input"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            placeholder="document"
                            aria-label="File name"
                        />
                        <span className="t2p-filename-ext">.pdf</span>
                        {!isEmpty && (
                            <span className="t2p-filesize">{estimateFileSize()}</span>
                        )}
                    </div>

                    <div className="t2p-header-actions">
                        <button className="t2p-btn-ghost" onClick={loadSample} title="Load sample content">
                            <FiZap /> Sample
                        </button>
                        {!isEmpty && (
                            <button className="t2p-btn-ghost t2p-btn-danger" onClick={handleClear} title="Clear document">
                                <FiRefreshCw /> Clear
                            </button>
                        )}
                        <button
                            className={`t2p-btn-ghost${showSettings ? " t2p-btn-active" : ""}`}
                            onClick={() => setShowSettings((v) => !v)}
                            title="Toggle settings (⌘,)"
                        >
                            <FiSettings />
                            Settings
                            {showSettings ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>
                </div>

                {/* ── Presets Row ── */}
                <div className="t2p-presets">
                    <span className="t2p-presets-label">Quick presets:</span>
                    {PRESETS.map((p) => (
                        <button
                            type="button"
                            key={p.id}
                            className={`t2p-preset-btn${activePreset === p.id ? " t2p-preset-btn--active" : ""}`}
                            onClick={(e) => { e.preventDefault(); applyPreset(p); }}
                        >
                            <span>{p.icon}</span> {p.label}
                        </button>
                    ))}
                </div>

                {/* ── Settings Panel ── */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="t2p-settings"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="t2p-settings-inner">

                                {/* Page */}
                                <div className="t2p-setting-group">
                                    <p className="t2p-setting-group-title">Page</p>
                                    <div className="t2p-setting-row">
                                        <label>Size</label>
                                        <select value={settings.pageSize} onChange={(e) => updateSetting("pageSize", e.target.value as PageSize)}>
                                            <option value="A4">A4</option>
                                            <option value="Letter">Letter</option>
                                            <option value="Legal">Legal</option>
                                            <option value="A5">A5</option>
                                        </select>
                                    </div>
                                    <div className="t2p-setting-row">
                                        <label>Orientation</label>
                                        <select value={settings.orientation} onChange={(e) => updateSetting("orientation", e.target.value as PageOrientation)}>
                                            <option value="portrait">Portrait</option>
                                            <option value="landscape">Landscape</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Font */}
                                <div className="t2p-setting-group">
                                    <p className="t2p-setting-group-title">Font</p>
                                    <div className="t2p-setting-row">
                                        <label>Family</label>
                                        <select value={settings.fontFamily} onChange={(e) => updateSetting("fontFamily", e.target.value as FontFamily)}>
                                            <option value="helvetica">Helvetica</option>
                                            <option value="times">Times New Roman</option>
                                            <option value="courier">Courier</option>
                                        </select>
                                    </div>
                                    <div className="t2p-setting-row">
                                        <label>Size</label>
                                        <select value={settings.fontSize} onChange={(e) => updateSetting("fontSize", Number(e.target.value) as FontSize)}>
                                            {[10, 11, 12, 14, 16, 18, 20, 24].map((s) => (
                                                <option key={s} value={s}>{s} pt</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="t2p-setting-row">
                                        <label>Line spacing</label>
                                        <select value={settings.lineSpacing} onChange={(e) => updateSetting("lineSpacing", Number(e.target.value) as LineSpacing)}>
                                            <option value={1}>Single (1.0)</option>
                                            <option value={1.15}>1.15</option>
                                            <option value={1.5}>1.5</option>
                                            <option value={2}>Double (2.0)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Margins */}
                                <div className="t2p-setting-group">
                                    <p className="t2p-setting-group-title">Margins (mm)</p>
                                    <div className="t2p-margins-visual">
                                        <div className="t2p-margin-outer">
                                            <input type="number" min="0" max="60" value={settings.marginTop}
                                                onChange={(e) => updateSetting("marginTop", Number(e.target.value))}
                                                title="Top margin" className="t2p-margin-top" />
                                            <div className="t2p-margin-middle">
                                                <input type="number" min="0" max="60" value={settings.marginLeft}
                                                    onChange={(e) => updateSetting("marginLeft", Number(e.target.value))}
                                                    title="Left margin" className="t2p-margin-left" />
                                                <div className="t2p-margin-page">
                                                    <FiFileText />
                                                </div>
                                                <input type="number" min="0" max="60" value={settings.marginRight}
                                                    onChange={(e) => updateSetting("marginRight", Number(e.target.value))}
                                                    title="Right margin" className="t2p-margin-right" />
                                            </div>
                                            <input type="number" min="0" max="60" value={settings.marginBottom}
                                                onChange={(e) => updateSetting("marginBottom", Number(e.target.value))}
                                                title="Bottom margin" className="t2p-margin-bottom" />
                                        </div>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="t2p-setting-group">
                                    <p className="t2p-setting-group-title">Options</p>
                                    <label className="t2p-checkbox-row">
                                        <input type="checkbox" checked={settings.addPageNumbers}
                                            onChange={(e) => updateSetting("addPageNumbers", e.target.checked)} />
                                        Page numbers
                                    </label>
                                    <label className="t2p-checkbox-row">
                                        <input type="checkbox" checked={settings.addTimestamp}
                                            onChange={(e) => updateSetting("addTimestamp", e.target.checked)} />
                                        Add timestamp
                                    </label>
                                    <div className="t2p-setting-row">
                                        <label>Header text</label>
                                        <input type="text" placeholder="Optional header…"
                                            value={settings.headerText}
                                            onChange={(e) => updateSetting("headerText", e.target.value)} />
                                    </div>
                                    <div className="t2p-setting-row">
                                        <label>Footer text</label>
                                        <input type="text" placeholder="Optional footer…"
                                            value={settings.footerText}
                                            onChange={(e) => updateSetting("footerText", e.target.value)} />
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Workspace ── */}
                <div className="t2p-workspace">

                    {/* Full-width Rich Text Editor */}
                    <div className="t2p-editor-panel">

                        {/* Toolbar */}
                        {editor && (
                            <div className="t2p-toolbar">
                                <div className="t2p-toolbar-group">
                                    <select
                                        className="t2p-toolbar-select"
                                        onChange={(e) => {
                                            const lv = Number(e.target.value);
                                            if (lv === 0) editor.chain().focus().setParagraph().run();
                                            else editor.chain().focus().toggleHeading({ level: lv as Level }).run();
                                        }}
                                        value={
                                            editor.isActive("heading", { level: 1 }) ? 1 :
                                                editor.isActive("heading", { level: 2 }) ? 2 :
                                                    editor.isActive("heading", { level: 3 }) ? 3 : 0
                                        }
                                        title="Text style"
                                    >
                                        <option value="0">Paragraph</option>
                                        <option value="1">Heading 1</option>
                                        <option value="2">Heading 2</option>
                                        <option value="3">Heading 3</option>
                                    </select>
                                </div>

                                <div className="t2p-toolbar-divider" />

                                <div className="t2p-toolbar-group">
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)">
                                        <strong>B</strong>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)">
                                        <em>I</em>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)">
                                        <u>U</u>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
                                        <s>S</s>
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
                                        <span style={{ background: "#fef08a", padding: "0 3px", borderRadius: 2 }}>H</span>
                                    </ToolbarBtn>
                                </div>

                                <div className="t2p-toolbar-divider" />

                                <div className="t2p-toolbar-group">
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
                                        ≡
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
                                        №
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
                                        "
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
                                        {"</>"}
                                    </ToolbarBtn>
                                </div>

                                <div className="t2p-toolbar-divider" />

                                <div className="t2p-toolbar-group">
                                    <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
                                        ⬅
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center">
                                        ↔
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
                                        ➡
                                    </ToolbarBtn>
                                </div>

                                <div className="t2p-toolbar-divider" />

                                <div className="t2p-toolbar-group">
                                    <ToolbarBtn
                                        onClick={() => {
                                            const url = prompt("Enter URL:");
                                            if (url) editor.chain().focus().setLink({ href: url }).run();
                                        }}
                                        active={editor.isActive("link")}
                                        title="Insert link"
                                    >
                                        🔗
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
                                        🔗̸
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
                                        —
                                    </ToolbarBtn>
                                </div>

                                <div className="t2p-toolbar-spacer" />

                                <div className="t2p-toolbar-group">
                                    <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (⌘Z)">
                                        ↩
                                    </ToolbarBtn>
                                    <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (⌘⇧Z)">
                                        ↪
                                    </ToolbarBtn>
                                </div>
                            </div>
                        )}

                        {/* Editor content */}
                        <div className="t2p-editor-body">
                            <EditorContent editor={editor} className="t2p-editor-content" />
                        </div>

                        {/* Word / char counters */}
                        <div className="t2p-editor-footer">
                            <div className="t2p-stats">
                                <span>{wordCount.toLocaleString()} words</span>
                                <span className="t2p-stats-sep">·</span>
                                <span className={isOverLimit ? "t2p-stat-danger" : isNearLimit ? "t2p-stat-warn" : ""}>
                                    {charCount.toLocaleString()} chars
                                </span>
                                {!isEmpty && (
                                    <>
                                        <span className="t2p-stats-sep">·</span>
                                        <span>~{estimatePages()} {estimatePages() === 1 ? "page" : "pages"}</span>
                                    </>
                                )}
                            </div>

                            {/* Char limit bar */}
                            {charCount > 0 && (
                                <div className="t2p-limit-bar">
                                    <div
                                        className={`t2p-limit-fill${isOverLimit ? " t2p-limit-fill--danger" : isNearLimit ? " t2p-limit-fill--warn" : ""}`}
                                        style={{ width: `${Math.min(100, (charCount / CHAR_HARD_LIMIT) * 100)}%` }}
                                    />
                                </div>
                            )}

                            {isNearLimit && !isOverLimit && (
                                <p className="t2p-limit-msg t2p-limit-msg--warn">
                                    <FiInfo /> Approaching character limit ({CHAR_HARD_LIMIT.toLocaleString()} max)
                                </p>
                            )}
                            {isOverLimit && (
                                <p className="t2p-limit-msg t2p-limit-msg--danger">
                                    <FiAlertCircle /> Over character limit — PDF output may be truncated
                                </p>
                            )}
                        </div>
                    </div>

                </div>

                {/* ── Full-width Document Summary Strip ── */}
                <AnimatePresence>
                    {!isEmpty && (
                        <motion.div
                            className="t2p-summary-strip"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Left: mini page thumbnail */}
                            <div className="t2p-summary-thumb-wrap">
                                <div
                                    className="t2p-summary-thumb"
                                    style={{
                                        aspectRatio: settings.orientation === "portrait"
                                            ? `${PAGE_SIZES[settings.pageSize].width} / ${PAGE_SIZES[settings.pageSize].height}`
                                            : `${PAGE_SIZES[settings.pageSize].height} / ${PAGE_SIZES[settings.pageSize].width}`,
                                    }}
                                >
                                    <div
                                        className="t2p-summary-thumb-area"
                                        style={{
                                            top: `${(settings.marginTop / (settings.orientation === "portrait" ? PAGE_SIZES[settings.pageSize].height : PAGE_SIZES[settings.pageSize].width)) * 100}%`,
                                            right: `${(settings.marginRight / (settings.orientation === "portrait" ? PAGE_SIZES[settings.pageSize].width : PAGE_SIZES[settings.pageSize].height)) * 100}%`,
                                            bottom: `${(settings.marginBottom / (settings.orientation === "portrait" ? PAGE_SIZES[settings.pageSize].height : PAGE_SIZES[settings.pageSize].width)) * 100}%`,
                                            left: `${(settings.marginLeft / (settings.orientation === "portrait" ? PAGE_SIZES[settings.pageSize].width : PAGE_SIZES[settings.pageSize].height)) * 100}%`,
                                        }}
                                    >
                                        {Array.from({ length: 7 }).map((_, i) => (
                                            <div key={i} className="t2p-summary-thumb-line" style={{ width: `${55 + Math.sin(i * 2.5) * 35}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Center: stat pills */}
                            <div className="t2p-summary-stats">
                                <div className="t2p-summary-stat">
                                    <span className="t2p-summary-stat-val">{estimatePages()}</span>
                                    <span className="t2p-summary-stat-lbl">{estimatePages() === 1 ? "Page" : "Pages"}</span>
                                </div>
                                <div className="t2p-summary-divider" />
                                <div className="t2p-summary-stat">
                                    <span className="t2p-summary-stat-val">{wordCount.toLocaleString()}</span>
                                    <span className="t2p-summary-stat-lbl">Words</span>
                                </div>
                                <div className="t2p-summary-divider" />
                                <div className="t2p-summary-stat">
                                    <span className="t2p-summary-stat-val">{charCount.toLocaleString()}</span>
                                    <span className="t2p-summary-stat-lbl">Chars</span>
                                </div>
                                <div className="t2p-summary-divider" />
                                <div className="t2p-summary-stat">
                                    <span className="t2p-summary-stat-val">{estimateFileSize()}</span>
                                    <span className="t2p-summary-stat-lbl">Est. size</span>
                                </div>
                            </div>

                            {/* Right: settings pills */}
                            <div className="t2p-summary-pills">
                                <span className="t2p-summary-pill">
                                    {settings.pageSize} · {settings.orientation === "portrait" ? "↕" : "↔"}
                                </span>
                                <span className="t2p-summary-pill">
                                    {settings.fontFamily} {settings.fontSize}pt
                                </span>
                                <span className="t2p-summary-pill">
                                    {settings.lineSpacing}× spacing
                                </span>
                                <span className="t2p-summary-pill">
                                    {settings.addPageNumbers ? "# pages" : "no page #"}
                                </span>
                                {settings.headerText && (
                                    <span className="t2p-summary-pill t2p-summary-pill--accent">
                                        Header: {settings.headerText.slice(0, 16)}{settings.headerText.length > 16 ? "…" : ""}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Generate Button ── */}
                <div className="t2p-action">
                    <div className="t2p-action-hint">
                        <FiInfo /> Press <kbd>⌘ Enter</kbd> to generate · <kbd>⌘ ,</kbd> for settings
                    </div>

                    <motion.button
                        className="t2p-btn-generate"
                        onClick={generatePDF}
                        disabled={isEmpty || generating || isOverLimit}
                        whileHover={{ scale: isEmpty || generating ? 1 : 1.02 }}
                        whileTap={{ scale: isEmpty || generating ? 1 : 0.97 }}
                        title={isEmpty ? "Add some text first" : isOverLimit ? "Content exceeds limit" : "Generate PDF (⌘ Enter)"}
                    >
                        {generating ? (
                            <span className="t2p-generating-inner">
                                <span className="t2p-spinner" />
                                Generating…
                            </span>
                        ) : (
                            <span className="t2p-generating-inner">
                                <FiDownload />
                                Generate PDF
                            </span>
                        )}
                        {/* Progress bar overlay */}
                        {generating && progress > 0 && (
                            <span
                                className="t2p-btn-progress"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                    </motion.button>
                </div>

            </div>
        </motion.div>
    );
};

export default TextToPDFTool;