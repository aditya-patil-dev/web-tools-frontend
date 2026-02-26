"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SlArrowRight } from "react-icons/sl";
import { fetchToolPage, ToolPageDTO } from "@/lib/api-calls/tools.api";
import { trackPageView } from "@/lib/api-calls/tracking";
import { ToolPageSections } from "@/components/upsell/ToolSections";

import JpgToPngTool from "@/components/tools/JpgToPngTool";
import PngToJpgTool from "@/components/tools/PngToJpgTool";
import WebpToJpgPngTool from "@/components/tools/WebpToJpgPngTool";
import ImageToBase64Tool from "@/components/tools/ImageToBase64Tool";
import ImageCompressorTool from "@/components/tools/ImageCompressorTool";
import ImageResizerTool from "@/components/tools/ImageResizerTool";
import BackgroundRemoverTool from "@/components/tools/BackgroundRemoverTool";
import UniversalImageConverterTool from "@/components/tools/UniversalImageConverterTool";
import FaviconGeneratorTool from "@/components/tools/FaviconGeneratorTool";
import QRCodeGeneratorTool from "@/components/tools/QRCodeGeneratorTool";
import ColorPickerTool from "@/components/tools/ColorPickerTool";
import CaseConTool from "@/components/tools/CaseConTool";
import JSONFormatterTool from "@/components/tools/JSONFormatterTool";
import TextToPdfTool from "@/components/tools/TextToPdfTool";
import MetaTagGeneratorTool from "@/components/tools/MetaTagGeneratorTool";
import OpenGraphCheckerTool from "@/components/tools/OpenGraphCheckerTool";
import RobotsTxtGeneratorTool from "@/components/tools/RobotsTxtGeneratorTool";
import RedirectCheckerTool from "@/components/tools/RedirectCheckerTool";
import SitemapGeneratorTool from "@/components/tools/SitemapGeneratorTool";
import WebsiteSpeedTestTool from "@/components/tools/WebsiteSpeedTestTool";
import HashGeneratorTool from "@/components/tools/HashGeneratorTool";
import Base64Tool from "@/components/tools/Base64Tool";
import JwtDecoderTool from "@/components/tools/JwtDecoderTool";
import HeicConverterTool from "@/components/tools/HeicConverterTool";
import JsonToCsvTool from "@/components/tools/JsonToCsvTool";
import UnixTimestampTool from "@/components/tools/UnixTimestampTool";
import PdfToJpgTool from "@/components/tools/PdfToJpgTool";
import JpgToPdfTool from "@/components/tools/JpgToPdfTool";
import MergePdfTool from "@/components/tools/MergePdfTool";
import PdfToWordTool from "@/components/tools/PdfToWordTool";
import PdfToExcelTool from "@/components/tools/PdfToExcelTool";
import UnlockPdfTool from "@/components/tools/UnlockPdfTool";
import ProtectPdfTool from "@/components/tools/ProtectPdfTool";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const } }
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export default function ToolPage() {
    const { category, slug } = useParams<{ category: string; slug: string }>();
    const [tool, setTool] = useState<ToolPageDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!category || !slug) return;
        const loadTool = async () => {
            try {
                const data = await fetchToolPage(category, slug);
                setTool(data);
            } catch (err) {
                console.error(err);
                setTool(null);
            } finally {
                setLoading(false);
            }
        };
        loadTool();
    }, [category, slug]);

    // ── PAGE_VIEW tracking ─────────────────────────────────────────────────────
    // Runs once after tool.id is available. Deduped via sessionStorage so
    // React 18 Strict Mode double-invocation never double-counts a view.
    useEffect(() => {
        if (tool?.id) trackPageView(String(tool.id));
    }, [tool?.id]);
    // ──────────────────────────────────────────────────────────────────────────

    if (!loading && !tool) return notFound();
    if (loading || !tool) {
        return (
            <div className="tool-page-wrapper">
                <div className="tool-container">
                    <div className="tool-loading">
                        <div className="spinner-large" />
                        <p>Loading tool...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="tools-container">
            <div className="tool-container">

                {/* Breadcrumb */}
                <motion.nav className="tool-breadcrumb"
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Link href="/">Home</Link><SlArrowRight />
                    <Link href="/tools">Tools</Link><SlArrowRight />
                    <Link href={`/tools/${category}`}>{category}</Link><SlArrowRight />
                    <span>{tool.title}</span>
                </motion.nav>

                {/* Header */}
                <motion.header className="tool-page-header" initial="hidden" animate="visible" variants={fadeInUp}>
                    <h1>{tool.page_title || tool.title}</h1>
                    {tool.page_intro && <p>{tool.page_intro}</p>}
                </motion.header>

                {/* Tool Runtime */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                    {tool.tool_type === "jpg-to-png" && <JpgToPngTool />}
                    {tool.tool_type === "png-to-jpg" && <PngToJpgTool />}
                    {tool.tool_type === "webp-to-jpg-png" && <WebpToJpgPngTool />}
                    {tool.tool_type === "image-to-base64" && <ImageToBase64Tool />}
                    {tool.tool_type === "image-compressor" && <ImageCompressorTool />}
                    {tool.tool_type === "image-resizer" && <ImageResizerTool />}
                    {tool.tool_type === "background-remover" && <BackgroundRemoverTool />}
                    {tool.tool_type === "universal-image-converter" && <UniversalImageConverterTool />}
                    {tool.tool_type === "favicon-generator" && <FaviconGeneratorTool />}
                    {tool.tool_type === "qr-code-generator" && <QRCodeGeneratorTool />}
                    {tool.tool_type === "color-picker" && <ColorPickerTool />}
                    {tool.tool_type === "text-case-converter" && <CaseConTool />}
                    {tool.tool_type === "json-formatter" && <JSONFormatterTool />}
                    {tool.tool_type === "text-to-pdf" && <TextToPdfTool />}
                    {tool.tool_type === "meta-tag-generator" && <MetaTagGeneratorTool />}
                    {tool.tool_type === "og-checker" && <OpenGraphCheckerTool />}
                    {tool.tool_type === "robots-txt-generator" && <RobotsTxtGeneratorTool />}
                    {tool.tool_type === "redirect-checker" && <RedirectCheckerTool />}
                    {tool.tool_type === "sitemap-generator" && <SitemapGeneratorTool />}
                    {tool.tool_type === "website-speed-test" && <WebsiteSpeedTestTool />}
                    {tool.tool_type === "hash-generator" && <HashGeneratorTool />}
                    {tool.tool_type === "base64-encoder-decoder" && <Base64Tool />}
                    {tool.tool_type === "jwt-decoder" && <JwtDecoderTool />}
                    {tool.tool_type === "heic-to-jpg-png" && <HeicConverterTool />}
                    {tool.tool_type === "json-to-csv-converter" && <JsonToCsvTool />}
                    {tool.tool_type === "unix-timestamp-converter" && <UnixTimestampTool />}
                    {tool.tool_type === "pdf-to-jpg-converter" && <PdfToJpgTool />}
                    {tool.tool_type === "jpg-to-pdf-converter" && <JpgToPdfTool />}
                    {tool.tool_type === "merge-pdf" && <MergePdfTool />}
                    {tool.tool_type === "pdf-to-word-converter" && <PdfToWordTool />}
                    {tool.tool_type === "pdf-to-excel-converter" && <PdfToExcelTool />}
                    {tool.tool_type === "unlock-pdf" && <UnlockPdfTool />}
                    {tool.tool_type === "protect-pdf" && <ProtectPdfTool />}
                </motion.div>

                {/* Features */}
                {tool.features && tool.features.length > 0 && (
                    <motion.section className="tool-features-section"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
                        <div className="section-header">
                            <h2>Features & Benefits</h2>
                            <p>Everything you need to know about this tool</p>
                        </div>
                        <motion.div className="features-grid" variants={staggerContainer}>
                            {tool.features.map((feature, index) => (
                                <motion.div key={index} className="feature-card" variants={itemVariants}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                                    <div className="feature-icon">
                                        {index === 0 ? "🚀" : index === 1 ? "⚡" : index === 2 ? "🔒" : "✨"}
                                    </div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>
                )}

                {/* FAQ */}
                {tool.faqs && tool.faqs.length > 0 && (
                    <motion.section className="tool-faq-section"
                        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
                        <div className="section-header">
                            <h2>Frequently Asked Questions</h2>
                            <p>Common questions about this tool</p>
                        </div>
                        <motion.div className="faq-list" variants={staggerContainer}>
                            {tool.faqs.map((faq, index) => (
                                <motion.div key={index} className="faq-item" variants={itemVariants}>
                                    <h3>{faq.question}</h3>
                                    <p>{faq.answer}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>
                )}

            </div>{/* /.tool-container */}

            {/* ── Upsell / Discovery Sections ───────────────────────────────
                Outside .tool-container → full-width layout.
                currentToolId = tool.id → every card click sends ref_tool_id
                so backend knows "user was on X and clicked Y from widget Z".
            ──────────────────────────────────────────────────────────────── */}
            <ToolPageSections
                toolSlug={slug}
                currentToolId={String(tool.id)}
            />

        </div>
    );
}