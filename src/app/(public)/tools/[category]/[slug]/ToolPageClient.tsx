"use client";
// src/app/(public)/tools/[category]/[slug]/ToolPageClient.tsx
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SlArrowRight } from "react-icons/sl";
import { FiCheckCircle } from "react-icons/fi";
import { ToolPageDTO } from "@/lib/api-calls/tools.api";
import { trackPageView } from "@/lib/api-calls/tracking";
import { RelatedTools, PopularTools, PeopleAlsoUsed } from "@/components/upsell/ToolSections";

// ── Lazy-loaded tool components ───────────────────────────────────────────────
// Each tool is only downloaded when the user actually visits that tool's page.
// ssr: false because all tools rely on browser APIs (canvas, File, URL.createObjectURL)
const JpgToPngTool = dynamic(() => import("@/components/tools/JpgToPngTool"), { ssr: false, loading: () => <ToolLoader /> });
const PngToJpgTool = dynamic(() => import("@/components/tools/PngToJpgTool"), { ssr: false, loading: () => <ToolLoader /> });
const WebpToJpgPngTool = dynamic(() => import("@/components/tools/WebpToJpgPngTool"), { ssr: false, loading: () => <ToolLoader /> });
const ImageToBase64Tool = dynamic(() => import("@/components/tools/ImageToBase64Tool"), { ssr: false, loading: () => <ToolLoader /> });
const ImageCompressorTool = dynamic(() => import("@/components/tools/ImageCompressorTool"), { ssr: false, loading: () => <ToolLoader /> });
const ImageResizerTool = dynamic(() => import("@/components/tools/ImageResizerTool"), { ssr: false, loading: () => <ToolLoader /> });
const BackgroundRemoverTool = dynamic(() => import("@/components/tools/BackgroundRemoverTool"), { ssr: false, loading: () => <ToolLoader /> });
const UniversalImageConverterTool = dynamic(() => import("@/components/tools/UniversalImageConverterTool"), { ssr: false, loading: () => <ToolLoader /> });
const FaviconGeneratorTool = dynamic(() => import("@/components/tools/FaviconGeneratorTool"), { ssr: false, loading: () => <ToolLoader /> });
const QRCodeGeneratorTool = dynamic(() => import("@/components/tools/QRCodeGeneratorTool"), { ssr: false, loading: () => <ToolLoader /> });
const ColorPickerTool = dynamic(() => import("@/components/tools/ColorPickerTool"), { ssr: false, loading: () => <ToolLoader /> });
const CaseConTool = dynamic(() => import("@/components/tools/CaseConTool"), { ssr: false, loading: () => <ToolLoader /> });
const JSONFormatterTool = dynamic(() => import("@/components/tools/JSONFormatterTool"), { ssr: false, loading: () => <ToolLoader /> });
const TextToPdfTool = dynamic(() => import("@/components/tools/TextToPdfTool"), { ssr: false, loading: () => <ToolLoader /> });
const MetaTagGeneratorTool = dynamic(() => import("@/components/tools/MetaTagGeneratorTool"), { ssr: false, loading: () => <ToolLoader /> });
const OpenGraphCheckerTool = dynamic(() => import("@/components/tools/OpenGraphCheckerTool"), { ssr: false, loading: () => <ToolLoader /> });
const RobotsTxtGeneratorTool = dynamic(() => import("@/components/tools/RobotsTxtGeneratorTool"), { ssr: false, loading: () => <ToolLoader /> });
const RedirectCheckerTool = dynamic(() => import("@/components/tools/RedirectCheckerTool"), { ssr: false, loading: () => <ToolLoader /> });
const SitemapGeneratorTool = dynamic(() => import("@/components/tools/SitemapGeneratorTool"), { ssr: false, loading: () => <ToolLoader /> });
const WebsiteSpeedTestTool = dynamic(() => import("@/components/tools/WebsiteSpeedTestTool"), { ssr: false, loading: () => <ToolLoader /> });
const HashGeneratorTool = dynamic(() => import("@/components/tools/HashGeneratorTool"), { ssr: false, loading: () => <ToolLoader /> });
const Base64Tool = dynamic(() => import("@/components/tools/Base64Tool"), { ssr: false, loading: () => <ToolLoader /> });
const JwtDecoderTool = dynamic(() => import("@/components/tools/JwtDecoderTool"), { ssr: false, loading: () => <ToolLoader /> });
const HeicConverterTool = dynamic(() => import("@/components/tools/HeicConverterTool"), { ssr: false, loading: () => <ToolLoader /> });
const JsonToCsvTool = dynamic(() => import("@/components/tools/JsonToCsvTool"), { ssr: false, loading: () => <ToolLoader /> });
const UnixTimestampTool = dynamic(() => import("@/components/tools/UnixTimestampTool"), { ssr: false, loading: () => <ToolLoader /> });
const PdfToJpgTool = dynamic(() => import("@/components/tools/PdfToJpgTool"), { ssr: false, loading: () => <ToolLoader /> });
const JpgToPdfTool = dynamic(() => import("@/components/tools/JpgToPdfTool"), { ssr: false, loading: () => <ToolLoader /> });
const MergePdfTool = dynamic(() => import("@/components/tools/MergePdfTool"), { ssr: false, loading: () => <ToolLoader /> });
const PdfToWordTool = dynamic(() => import("@/components/tools/PdfToWordTool"), { ssr: false, loading: () => <ToolLoader /> });
const PdfToExcelTool = dynamic(() => import("@/components/tools/PdfToExcelTool"), { ssr: false, loading: () => <ToolLoader /> });
const UnlockPdfTool = dynamic(() => import("@/components/tools/UnlockPdfTool"), { ssr: false, loading: () => <ToolLoader /> });
const ProtectPdfTool = dynamic(() => import("@/components/tools/ProtectPdfTool"), { ssr: false, loading: () => <ToolLoader /> });

// ── Skeleton shown while a tool chunk is downloading ─────────────────────────
function ToolLoader() {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
            color: "#888",
            fontSize: 14,
        }}>
            Loading tool…
        </div>
    );
}

// ── Animation variants ────────────────────────────────────────────────────────
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const } },
};
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface ToolPageClientProps {
    tool: ToolPageDTO;
    category: string;
    slug: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ToolPageClient({ tool, category, slug }: ToolPageClientProps) {

    // PAGE_VIEW tracking — fires once after mount.
    // Deduped via sessionStorage so React 18 Strict Mode
    // double-invoke never double-counts.
    useEffect(() => {
        if (tool?.id) trackPageView(tool.id);
    }, [tool?.id]);

    return (
        <div className="tools-container">
            <div className="tool-container">

                {/* Breadcrumb */}
                <motion.nav
                    className="tool-breadcrumb"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Link href="/">Home</Link>
                    <SlArrowRight />
                    <Link href="/tools">Tools</Link>
                    <SlArrowRight />
                    <Link href={`/tools/${category}`}>{category}</Link>
                    <SlArrowRight />
                    <span>{tool.title}</span>
                </motion.nav>

                {/* Header */}
                <motion.header
                    className="tool-page-header"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <h1>{tool.page_title || tool.title}</h1>
                    {tool.page_intro && <p>{tool.page_intro}</p>}
                </motion.header>

                {/* Tool Runtime — only the matching chunk is downloaded */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
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

                <div className="my-4">
                    <PeopleAlsoUsed toolSlug={tool.slug} toolId={tool.id} />
                </div>

                {/* Long Content Section */}
                {tool.long_content && (
                    <motion.section
                        className="tool-content-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                    >
                        <div
                            className="tool-content-body"
                            dangerouslySetInnerHTML={{ __html: tool.long_content }}
                        />
                    </motion.section>
                )}

                {/* Features */}
                {tool.features && tool.features.length > 0 && (
                    <motion.section
                        className="tool-features-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                    >
                        <div className="section-header">
                            <h2>Features &amp; Benefits</h2>
                            <p>Everything you need to know about this tool</p>
                        </div>
                        <motion.div className="features-grid" variants={staggerContainer}>
                            {tool.features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="feature-card"
                                    variants={itemVariants}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                >
                                    <div className="feature-icon">
                                        <FiCheckCircle style={{ color: "#ffffff" }} />
                                    </div>
                                    {feature.title && <h3>{feature.title}</h3>}
                                    {feature.description && <p>{feature.description}</p>}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>
                )}

                <div className="my-4">
                    <RelatedTools toolSlug={tool.slug} toolId={tool.id} />
                </div>

                {/* FAQ */}
                {tool.faqs && tool.faqs.length > 0 && (
                    <motion.section
                        className="tool-faq-section"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                    >
                        <div className="section-header">
                            <h2>Frequently Asked Questions</h2>
                            <p>Common questions about this tool</p>
                        </div>
                        <motion.div className="faq-list" variants={staggerContainer}>
                            {tool.faqs.map((faq, index) => (
                                <motion.div key={index} className="faq-item" variants={itemVariants}>
                                    {faq.question && <h3>{faq.question}</h3>}
                                    {faq.answer && <p>{faq.answer}</p>}
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.section>
                )}

                <div className="my-4">
                    <PopularTools currentToolId={tool.id} />
                </div>

            </div>
        </div>
    );
}