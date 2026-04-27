"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { SlArrowRight } from "react-icons/sl";
import { FiCheckCircle } from "react-icons/fi";
import { ToolPageDTO } from "@/lib/api-calls/tools.api";
import ToolSuggestions from "@/components/tool-sugggestion/ToolSuggestions";

// ── Tool Components Registry ────────────────────────────────────────────────
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "jpg-to-png": dynamic(() => import("@/components/tools/JpgToPngTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "png-to-jpg": dynamic(() => import("@/components/tools/PngToJpgTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "webp-to-jpg-png": dynamic(
    () => import("@/components/tools/WebpToJpgPngTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "image-to-base64": dynamic(
    () => import("@/components/tools/ImageToBase64Tool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "image-compressor": dynamic(
    () => import("@/components/tools/ImageCompressorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "image-resizer": dynamic(
    () => import("@/components/tools/ImageResizerTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "background-remover": dynamic(
    () => import("@/components/tools/BackgroundRemoverTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "universal-image-converter": dynamic(
    () => import("@/components/tools/UniversalImageConverterTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "favicon-generator": dynamic(
    () => import("@/components/tools/FaviconGeneratorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "qr-code-generator": dynamic(
    () => import("@/components/tools/QRCodeGeneratorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "color-picker": dynamic(() => import("@/components/tools/ColorPickerTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "text-case-converter": dynamic(
    () => import("@/components/tools/CaseConTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "json-formatter": dynamic(
    () => import("@/components/tools/JSONFormatterTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "text-to-pdf": dynamic(() => import("@/components/tools/TextToPdfTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "meta-tag-generator": dynamic(
    () => import("@/components/tools/MetaTagGeneratorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "og-checker": dynamic(
    () => import("@/components/tools/OpenGraphCheckerTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "robots-txt-generator": dynamic(
    () => import("@/components/tools/RobotsTxtGeneratorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "redirect-checker": dynamic(
    () => import("@/components/tools/RedirectCheckerTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "sitemap-generator": dynamic(
    () => import("@/components/tools/SitemapGeneratorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "website-speed-test": dynamic(
    () => import("@/components/tools/WebsiteSpeedTestTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "hash-generator": dynamic(
    () => import("@/components/tools/HashGeneratorTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "base64-encoder-decoder": dynamic(
    () => import("@/components/tools/Base64Tool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "jwt-decoder": dynamic(() => import("@/components/tools/JwtDecoderTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "heic-to-jpg-png": dynamic(
    () => import("@/components/tools/HeicConverterTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "json-to-csv-converter": dynamic(
    () => import("@/components/tools/JsonToCsvTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "unix-timestamp-converter": dynamic(
    () => import("@/components/tools/UnixTimestampTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "pdf-to-jpg-converter": dynamic(
    () => import("@/components/tools/PdfToJpgTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "jpg-to-pdf-converter": dynamic(
    () => import("@/components/tools/JpgToPdfTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "merge-pdf": dynamic(() => import("@/components/tools/MergePdfTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "pdf-to-word-converter": dynamic(
    () => import("@/components/tools/PdfToWordTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "pdf-to-excel-converter": dynamic(
    () => import("@/components/tools/PdfToExcelTool"),
    {
      ssr: false,
      loading: () => <ToolLoader />,
    },
  ),
  "unlock-pdf": dynamic(() => import("@/components/tools/UnlockPdfTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
  "protect-pdf": dynamic(() => import("@/components/tools/ProtectPdfTool"), {
    ssr: false,
    loading: () => <ToolLoader />,
  }),
};

function ToolLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        color: "#888",
        fontSize: 14,
      }}
    >
      Loading tool…
    </div>
  );
}


interface ToolPageClientProps {
  tool: ToolPageDTO;
  category: string;
  slug: string;
}



// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolPageClient({
  tool,
  category,
}: ToolPageClientProps) {
  useEffect(() => {
    if (tool?.id) console.log(`Tracking page view for tool: ${tool.id}`);
  }, [tool?.id]);

  const ToolComponent = TOOL_COMPONENTS[tool.tool_type];
  const recommendations = tool.recommendations ?? null;

  return (
    <div className="tools-container">
      <div className="tool-container">
        {/* Breadcrumb */}
        <nav className="tool-breadcrumb">
          <Link href="/">Home</Link>
          <SlArrowRight />
          <Link href="/tools">Tools</Link>
          <SlArrowRight />
          <Link href={`/tools/${category}`}>{category}</Link>
          <SlArrowRight />
          <span>{tool.title}</span>
        </nav>

        {/* Header */}
        <header className="tool-page-header">
          <h1>{tool.page_title || tool.title}</h1>
        </header>

        {/* Tool */}
        <div>
          {ToolComponent ? (
            <ToolComponent />
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              Tool not found or under maintenance.
            </div>
          )}
        </div>

        {/* ABOVE: Related Tools */}
        <ToolSuggestions position="above" recommendations={recommendations} />

        {/* Long Content */}
        {tool.long_content && (
          <div>
            {tool.page_intro && <p>{tool.page_intro}</p>}
            <section className="tool-content-section">
              <div
                className="tool-content-body"
                dangerouslySetInnerHTML={{ __html: tool.long_content }}
              />
            </section>
          </div>
        )}

        {/* Features */}
        {tool.features && tool.features.length > 0 && (
          <section className="tool-features-section">
            <div className="section-header">
              <h2>Features &amp; Benefits</h2>
              <p>Everything you need to know about this tool</p>
            </div>
            <div className="features-grid">
              {tool.features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <FiCheckCircle style={{ color: "#ffffff" }} />
                  </div>
                  {feature.title && <h3>{feature.title}</h3>}
                  {feature.description && <p>{feature.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {tool.faqs && tool.faqs.length > 0 && (
          <section className="tool-faq-section">
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              <p>Common questions about this tool</p>
            </div>
            <div className="faq-list">
              {tool.faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  {faq.question && <h3>{faq.question}</h3>}
                  {faq.answer && <p>{faq.answer}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BELOW: Also-used + Popular */}
        <ToolSuggestions position="below" recommendations={recommendations} />
      </div>
    </div>
  );
}
