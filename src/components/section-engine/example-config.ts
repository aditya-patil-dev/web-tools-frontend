// ─────────────────────────────────────────────────────────────
//  SectionEngine — Home Page Config
//  URLs follow the Next.js route: /tools/[category]/[slug]
//  Slugs match the TOOL_COMPONENTS registry in ToolPageClient.tsx
// ─────────────────────────────────────────────────────────────

import type { PageConfig } from './SectionEngine'

export const homePageConfig: PageConfig = {
    sections:
        [
            {
                "id": "img-tools",
                "layout": "hero-side",
                "label": "Image Tools",
                "title": "Image",
                "titleAccent": "Tools",
                "subtitle": "Free Online Image Editors: Compress, Convert, and Resize Photos Instantly",
                "viewAllHref": "/tools/image-tools",
                "viewAllLabel": "View All Image Tools",
                "tools": [
                    {
                        "id": "image-compressor",
                        "title": "Online Image Compressor",
                        "description": "Bulk compress JPG, PNG, and WebP images without losing quality. Best free tool for faster website loading speeds.",
                        "href": "/tools/image-tools/image-compressor",
                        "icon": "ImageDown",
                        "tag": "IMAGE",
                        "badge": "FREE & FAST"
                    },
                    {
                        "id": "background-remover",
                        "title": "AI Background Remover",
                        "description": "Remove image backgrounds online in one click with AI. Create transparent PNGs for products and e-commerce.",
                        "href": "/tools/image-tools/background-remover",
                        "icon": "Eraser",
                        "tag": "AI",
                        "badge": "AI POWERED"
                    },
                    {
                        "id": "jpg-to-png",
                        "title": "JPG to PNG Converter",
                        "description": "Convert JPG to transparent PNG online. High-quality image conversion with no loss in visual fidelity.",
                        "href": "/tools/image-tools/jpg-to-png",
                        "icon": "FileImage",
                        "tag": "CONVERT"
                    },
                    {
                        "id": "image-resizer",
                        "title": "Instant Image Resizer",
                        "description": "Change image dimensions (pixels or percentage) instantly. Perfect for Instagram, Facebook, and Web SEO.",
                        "href": "/tools/image-tools/image-resizer",
                        "icon": "Maximize2",
                        "tag": "IMAGE",
                        "badge": "SECURE"
                    }
                ]
            },
            {
                "id": "pdf-tools",
                "layout": "accent-grid",
                "label": "PDF Tools",
                "title": "PDF",
                "titleAccent": "Tools",
                "subtitle": "Secure Online PDF Tools: Merge, Convert, and Edit Documents Without Server Uploads",
                "viewAllHref": "/tools/pdf-tools",
                "viewAllLabel": "View All PDF Tools",
                "tools": [
                    {
                        "id": "pdf-to-word-converter",
                        "title": "PDF to Word Converter",
                        "description": "Convert PDF to editable Word (DOCX) files online. Secure browser-based extraction for complete privacy.",
                        "href": "/tools/pdf-tools/pdf-to-word-converter",
                        "icon": "FileText",
                        "tag": "PDF",
                        "badge": "PRIVATE",
                        "accent": "coral"
                    },
                    {
                        "id": "merge-pdf",
                        "title": "Merge PDF Online",
                        "description": "Combine multiple PDF files into one document. Drag and drop to reorder pages before merging.",
                        "href": "/tools/pdf-tools/merge-pdf",
                        "icon": "AlignJustify",
                        "tag": "PDF",
                        "badge": "FREE",
                        "accent": "blue"
                    },
                    {
                        "id": "jpg-to-pdf-converter",
                        "title": "JPG to PDF Converter",
                        "description": "Turn photos into professional PDF documents. Supports batch conversion for JPG, PNG, and WebP.",
                        "href": "/tools/pdf-tools/jpg-to-pdf-converter",
                        "icon": "FilePlus",
                        "tag": "PDF",
                        "accent": "purple"
                    },
                    {
                        "id": "pdf-to-jpg-converter",
                        "title": "PDF to JPG Extractor",
                        "description": "Extract pages from a PDF as high-quality JPG images instantly in your browser.",
                        "href": "/tools/pdf-tools/pdf-to-jpg-converter",
                        "icon": "Image",
                        "tag": "PDF",
                        "badge": "NEW",
                        "accent": "teal"
                    }
                ]
            },
            {
                "id": "seo-tools",
                "layout": "two-col",
                "label": "SEO Tools",
                "title": "SEO",
                "titleAccent": "Tools",
                "subtitle": "Improve Search Rankings: Free Technical SEO and Meta Tag Analysis Tools",
                "viewAllHref": "/tools/seo-tools",
                "viewAllLabel": "View All SEO Tools",
                "tools": [
                    {
                        "id": "meta-tag-generator",
                        "title": "SEO Meta Tag Generator",
                        "description": "Create perfectly formatted meta titles and descriptions to boost your CTR on Google and Bing.",
                        "href": "/tools/seo-tools/meta-tag-generator",
                        "icon": "Tags",
                        "tag": "SEO",
                        "badge": "POPULAR"
                    },
                    {
                        "id": "robots-txt-generator",
                        "title": "Robots.txt Generator",
                        "description": "Generate valid robots.txt files to guide search engine crawlers and optimize your crawl budget.",
                        "href": "/tools/seo-tools/robots-txt-generator",
                        "icon": "Bot",
                        "tag": "SEO"
                    },
                    {
                        "id": "sitemap-generator",
                        "title": "XML Sitemap Generator",
                        "description": "Automatically generate a sitemap.xml for any website to ensure all your pages get indexed.",
                        "href": "/tools/seo-tools/sitemap-generator",
                        "icon": "Map",
                        "tag": "SEO",
                        "badge": "FREE"
                    },
                    {
                        "id": "og-checker",
                        "title": "Open Graph Tag Checker",
                        "description": "Debug and preview social media link previews for Facebook, Twitter, and LinkedIn.",
                        "href": "/tools/seo-tools/og-checker",
                        "icon": "Share2",
                        "tag": "SOCIAL"
                    }
                ]
            },
            {
                "id": "text-tools",
                "layout": "accent-grid",
                "label": "Word & Text Tools",
                "title": "Text",
                "titleAccent": "Tools",
                "subtitle": "Beautify and Format Text: Word Counters, Case Converters, and More",
                "viewAllHref": "/tools/text-tools",
                "viewAllLabel": "View All Text Tools",
                "tools": [
                    {
                        "id": "word-counter",
                        "title": "Free Word Counter",
                        "description": "Count words, characters, and sentences in real-time. Ideal for SEO meta descriptions and essays.",
                        "href": "/tools/text-tools/case-converter",
                        "icon": "Hash",
                        "tag": "TEXT",
                        "badge": "LIVE"
                    },
                    {
                        "id": "case-converter",
                        "title": "Online Case Converter",
                        "description": "Instantly change text to UPPERCASE, lowercase, Title Case, or Sentence case with one click.",
                        "href": "/tools/text-tools/case-converter",
                        "icon": "Type",
                        "tag": "TEXT"
                    }
                ]
            }
        ]
}

// ─────────────────────────────────────────────────────────────
//  Full slug reference (from TOOL_COMPONENTS in ToolPageClient.tsx)
// ─────────────────────────────────────────────────────────────
//
//  IMAGE:  jpg-to-png | png-to-jpg | webp-to-jpg-png | image-to-base64
//          image-compressor | image-resizer | background-remover
//          universal-image-converter | favicon-generator | qr-code-generator
//          color-picker | heic-to-jpg-png
//
//  PDF:    text-to-pdf | pdf-to-jpg-converter | jpg-to-pdf-converter
//          merge-pdf | pdf-to-word-converter | pdf-to-excel-converter
//          unlock-pdf | protect-pdf
//
//  SEO:    meta-tag-generator | og-checker | robots-txt-generator
//          redirect-checker | sitemap-generator | website-speed-test
//
//  DEV:    text-case-converter | json-formatter | hash-generator
//          base64-encoder-decoder | jwt-decoder | json-to-csv-converter
//          unix-timestamp-converter
//
//  Category listing pages:
//    /tools              → AllToolsClient.tsx
//    /tools/image-tools        → ToolsClient.tsx  (category = "image")
//    /tools/pdf          → ToolsClient.tsx  (category = "pdf")
//    /tools/seo          → ToolsClient.tsx  (category = "seo")
//    /tools/dev          → ToolsClient.tsx  (category = "dev")