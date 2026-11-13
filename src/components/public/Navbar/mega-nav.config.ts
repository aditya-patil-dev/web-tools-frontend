export interface NavTool {
  id: string;
  title: string;
  shortDescription: string;
  href: string;
  icon: string; // Lucide or React icon name
  badge?: "AI" | "HOT" | "NEW" | "POPULAR" | "FAST" | "FREE" | "DEV" | "PRIVATE";
}

export interface NavSubCategory {
  id: string;
  title: string;
  tools: NavTool[];
}

export interface NavCategory {
  id: string;
  slug: string;
  label: string;
  href: string;
  icon: string;
  accent: string; // Hex or gradient
  subCategories: NavSubCategory[];
  featured: {
    title: string;
    tagline: string;
    description: string;
    href: string;
    badge: string;
    icon: string;
    cta: string;
  };
}

export const MEGA_NAV_CATEGORIES: NavCategory[] = [
  {
    id: "image-tools",
    slug: "image-tools",
    label: "Image Tools",
    href: "/tools/image-tools",
    icon: "LuImage",
    accent: "#ff6b35",
    featured: {
      title: "AI Background Remover",
      tagline: "Instant Browser AI",
      description: "Remove image backgrounds with 100% client-side privacy. Zero server uploads.",
      href: "/tools/image-tools/background-remover",
      badge: "AI POWERED",
      icon: "LuEraser",
      cta: "Try Background Remover",
    },
    subCategories: [
      {
        id: "img-compress-convert",
        title: "Compression & Format",
        tools: [
          {
            id: "image-compressor",
            title: "Batch Image Compressor",
            shortDescription: "Compress JPG, PNG & WebP up to 85%",
            href: "/tools/image-tools/image-compressor",
            icon: "LuImage",
            badge: "FAST",
          },
          {
            id: "webp-converter",
            title: "WebP Converter",
            shortDescription: "Convert images to ultra-small modern WebP",
            href: "/tools/image-tools/webp-converter",
            icon: "LuSparkles",
            badge: "FAST",
          },
          {
            id: "jpg-to-png",
            title: "JPG to PNG",
            shortDescription: "Lossless conversion with alpha support",
            href: "/tools/image-tools/jpg-to-png",
            icon: "LuFileType",
            badge: "FREE",
          },
          {
            id: "png-to-jpg",
            title: "PNG to JPG",
            shortDescription: "Flatten transparent PNGs to clean JPGs",
            href: "/tools/image-tools/png-to-jpg",
            icon: "LuFileType",
            badge: "FREE",
          },
          {
            id: "svg-to-png",
            title: "SVG to PNG Converter",
            shortDescription: "Export vector markup as 4K raster PNG",
            href: "/tools/image-tools/svg-to-png",
            icon: "LuCode",
            badge: "NEW",
          },
          {
            id: "image-to-base64",
            title: "Image to Base64",
            shortDescription: "Generate inline DataURI code strings",
            href: "/tools/image-tools/image-to-base64",
            icon: "LuBraces",
            badge: "DEV",
          },
        ],
      },
      {
        id: "img-edit-size",
        title: "Sizing & Manipulation",
        tools: [
          {
            id: "image-cropper",
            title: "Image Cropper & Avatar",
            shortDescription: "Precise ratios, circular crops & shadows",
            href: "/tools/image-tools/image-cropper",
            icon: "LuCrop",
            badge: "POPULAR",
          },
          {
            id: "image-resizer",
            title: "Instant Image Resizer",
            shortDescription: "Exact pixels or percentage scaling",
            href: "/tools/image-tools/image-resizer",
            icon: "LuMaximize2",
            badge: "POPULAR",
          },
          {
            id: "bulk-image-watermark-adder",
            title: "Bulk Watermark Adder",
            shortDescription: "Stamp text or logo copyright on photos",
            href: "/tools/image-tools/bulk-image-watermark-adder",
            icon: "LuStamp",
            badge: "NEW",
          },
        ],
      },
      {
        id: "img-creative",
        title: "Creative & Mockups",
        tools: [
          {
            id: "screenshot-device-mockup-generator",
            title: "Device Mockup Generator",
            shortDescription: "Wrap images in macOS & iPhone 3D frames",
            href: "/tools/image-tools/screenshot-device-mockup-generator",
            icon: "LuMonitor",
            badge: "HOT",
          },
          {
            id: "online-meme-generator",
            title: "Meme Generator",
            shortDescription: "Viral templates with custom typography",
            href: "/tools/image-tools/online-meme-generator",
            icon: "LuSmile",
            badge: "FREE",
          },
          {
            id: "exif-data-viewer-and-stripper",
            title: "EXIF Viewer & Stripper",
            shortDescription: "Audit & delete GPS metadata for privacy",
            href: "/tools/image-tools/exif-data-viewer-and-stripper",
            icon: "LuShieldCheck",
            badge: "PRIVATE",
          },
        ],
      },
    ],
  },
  {
    id: "pdf-tools",
    slug: "pdf-tools",
    label: "PDF Tools",
    href: "/tools/pdf-tools",
    icon: "LuFileText",
    accent: "#3b82f6",
    featured: {
      title: "PDF to Word (DOCX)",
      tagline: "Client-Side OCR",
      description: "Extract text, tables, and formatting from PDF directly into editable Word DOCX.",
      href: "/tools/pdf-tools/pdf-to-word-converter",
      badge: "POPULAR",
      icon: "LuFileText",
      cta: "Convert PDF to Word",
    },
    subCategories: [
      {
        id: "pdf-convert",
        title: "Convert PDF",
        tools: [
          {
            id: "pdf-to-word-converter",
            title: "PDF to Word Converter",
            shortDescription: "Convert PDF to editable DOCX documents",
            href: "/tools/pdf-tools/pdf-to-word-converter",
            icon: "LuFileText",
            badge: "POPULAR",
          },
          {
            id: "jpg-to-pdf-converter",
            title: "JPG to PDF Converter",
            shortDescription: "Turn multi-page images into clean PDF",
            href: "/tools/pdf-tools/jpg-to-pdf-converter",
            icon: "LuFilePlus",
            badge: "FAST",
          },
          {
            id: "pdf-to-jpg-converter",
            title: "PDF to JPG Extractor",
            shortDescription: "Extract high-res pages as separate JPGs",
            href: "/tools/pdf-tools/pdf-to-jpg-converter",
            icon: "LuImage",
            badge: "FREE",
          },
        ],
      },
      {
        id: "pdf-manage",
        title: "Manage & Compress",
        tools: [
          {
            id: "merge-pdf",
            title: "Merge PDF Online",
            shortDescription: "Combine multiple PDF files into one",
            href: "/tools/pdf-tools/merge-pdf",
            icon: "LuLayers",
            badge: "POPULAR",
          },
          {
            id: "pdf-compressor",
            title: "PDF Compressor",
            shortDescription: "Reduce PDF MB size without losing readability",
            href: "/tools/pdf-tools/pdf-compressor",
            icon: "LuMinimize2",
            badge: "FAST",
          },
        ],
      },
    ],
  },
  {
    id: "seo-tools",
    slug: "seo-tools",
    label: "SEO Tools",
    href: "/tools/seo-tools",
    icon: "LuTrendingUp",
    accent: "#10b981",
    featured: {
      title: "Keyword Research Tool",
      tagline: "Flagship Suite",
      description: "Explore search volumes, search intent classification, and KD% difficulty metrics.",
      href: "/seo/tools/keyword-research",
      badge: "HOT FLAGSHIP",
      icon: "LuSearch",
      cta: "Open Keyword Research",
    },
    subCategories: [
      {
        id: "seo-intel",
        title: "Search Intelligence",
        tools: [
          {
            id: "keyword-research-flagship",
            title: "Keyword Research Tool",
            shortDescription: "Search volume, intent, and KD% metrics",
            href: "/seo/tools/keyword-research",
            icon: "LuSearch",
            badge: "HOT",
          },
          {
            id: "google-serp-snippet-simulator",
            title: "Google SERP Simulator",
            shortDescription: "Pixel-perfect Google desktop & mobile snippet preview",
            href: "/tools/seo-tools/google-serp-snippet-simulator",
            icon: "LuEye",
            badge: "POPULAR",
          },
          {
            id: "keyword-density-n-gram-analyzer",
            title: "Keyword Density Analyzer",
            shortDescription: "N-gram word frequency & over-optimization checker",
            href: "/tools/seo-tools/keyword-density-n-gram-analyzer",
            icon: "LuBarChart3",
            badge: "NEW",
          },
        ],
      },
      {
        id: "seo-tech",
        title: "Technical SEO & Tags",
        tools: [
          {
            id: "http-security-cache-headers-analyzer",
            title: "HTTP Headers & Security",
            shortDescription: "Analyze HSTS, CSP, X-Frame, and Cache-Control",
            href: "/tools/seo-tools/http-security-cache-headers-analyzer",
            icon: "LuShieldCheck",
            badge: "POPULAR",
          },
          {
            id: "schema-org-structured-data-generator",
            title: "Schema.org Generator",
            shortDescription: "JSON-LD schema markup for Articles & FAQs",
            href: "/tools/seo-tools/schema-org-structured-data-generator",
            icon: "LuBraces",
            badge: "NEW",
          },
          {
            id: "hreflang-and-canonical-tag-generator",
            title: "Hreflang & Canonical",
            shortDescription: "Multi-language & canonical tag builder",
            href: "/tools/seo-tools/hreflang-and-canonical-tag-generator",
            icon: "LuGlobe",
            badge: "NEW",
          },
          {
            id: "social-media-share-card-simulator",
            title: "Social Share Card Preview",
            shortDescription: "Simulate Twitter, Facebook & LinkedIn OG preview",
            href: "/tools/seo-tools/social-media-share-card-simulator",
            icon: "LuShare2",
            badge: "NEW",
          },
          {
            id: "meta-tag-generator",
            title: "Meta Tag Generator",
            shortDescription: "Generate standard SEO head tags",
            href: "/tools/seo-tools/meta-tag-generator",
            icon: "LuTag",
            badge: "FREE",
          },
          {
            id: "robots-txt-generator",
            title: "Robots.txt Generator",
            shortDescription: "Create crawler directives for Googlebot & Bing",
            href: "/tools/seo-tools/robots-txt-generator",
            icon: "LuBot",
            badge: "FREE",
          },
        ],
      },
    ],
  },
  {
    id: "developer-tools",
    slug: "developer-tools",
    label: "Dev Tools",
    href: "/tools/developer-tools",
    icon: "LuCode",
    accent: "#8b5cf6",
    featured: {
      title: "JSON Formatter & Validator",
      tagline: "Zero Latency",
      description: "Format, lint, tree-view inspect, and minify JSON data with instant error highlighting.",
      href: "/tools/developer-tools/json-formatter",
      badge: "FAST",
      icon: "LuCode",
      cta: "Format JSON Now",
    },
    subCategories: [
      {
        id: "dev-formatters",
        title: "Formatters & Beautifiers",
        tools: [
          {
            id: "json-formatter",
            title: "JSON Formatter & Linter",
            shortDescription: "Tree view, validate, minify & format JSON",
            href: "/tools/developer-tools/json-formatter",
            icon: "LuCode",
            badge: "FAST",
          },
          {
            id: "code-beautifier",
            title: "Code Beautifier",
            shortDescription: "Format HTML, CSS, JS with proper indentation",
            href: "/tools/developer-tools/code-beautifier",
            icon: "LuSparkles",
            badge: "NEW",
          },
        ],
      },
      {
        id: "dev-utilities",
        title: "Encoders & Generator",
        tools: [
          {
            id: "qr-code-generator",
            title: "QR Code Generator",
            shortDescription: "Custom color, logo, and vector SVG QR codes",
            href: "/tools/developer-tools/qr-code-generator",
            icon: "LuQrCode",
            badge: "POPULAR",
          },
          {
            id: "base64-encode-decode",
            title: "Base64 Encoder / Decoder",
            shortDescription: "Convert strings & UTF-8 payloads to Base64",
            href: "/tools/developer-tools/base64-encode-decode",
            icon: "LuBinary",
            badge: "DEV",
          },
          {
            id: "url-slug-generator",
            title: "URL Slug Generator",
            shortDescription: "Clean hyphenated URL-friendly permalinks",
            href: "/tools/developer-tools/url-slug-generator",
            icon: "LuLink",
            badge: "FREE",
          },
        ],
      },
    ],
  },
  {
    id: "text-tools",
    slug: "text-tools",
    label: "Text Tools",
    href: "/tools/text-tools",
    icon: "LuFileEdit",
    accent: "#ec4899",
    featured: {
      title: "Word & Character Counter",
      tagline: "Live Metrics",
      description: "Analyze word counts, character counts, reading time, and speaking duration in real-time.",
      href: "/tools/text-tools/word-counter",
      badge: "POPULAR",
      icon: "LuFileText",
      cta: "Count Words Live",
    },
    subCategories: [
      {
        id: "text-metrics",
        title: "Text Analysis",
        tools: [
          {
            id: "word-counter",
            title: "Word & Character Counter",
            shortDescription: "Live count, sentences, reading time & stats",
            href: "/tools/text-tools/word-counter",
            icon: "LuFileText",
            badge: "POPULAR",
          },
        ],
      },
      {
        id: "text-transforms",
        title: "Formatting & Case",
        tools: [
          {
            id: "case-converter",
            title: "Case Converter",
            shortDescription: "UPPER, lower, Title Case, camelCase & kebab",
            href: "/tools/text-tools/case-converter",
            icon: "LuType",
            badge: "FREE",
          },
          {
            id: "text-formatter",
            title: "Text Cleaner & Formatter",
            shortDescription: "Remove extra spaces, blank lines, duplicates",
            href: "/tools/text-tools/text-formatter",
            icon: "LuSparkles",
            badge: "NEW",
          },
        ],
      },
    ],
  },
];

