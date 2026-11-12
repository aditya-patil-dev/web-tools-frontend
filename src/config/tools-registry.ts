export type ToolCategory = "image-tools" | "pdf-tools" | "seo-tools" | "developer-tools";

export type UserRole = "all" | "creator" | "marketer" | "developer" | "office";

export interface MasterTool {
  id: string;
  slug: string;
  title: string;
  category: ToolCategory;
  categoryLabel: string;
  shortDescription: string;
  href: string;
  icon: string;
  badge?: "AI POWERED" | "POPULAR" | "NEW" | "FAST" | "PRIVATE" | "HOT";
  roles: UserRole[];
  keywords: string[];
  stats?: {
    users?: string;
    rating?: number;
  };
}

export const MASTER_TOOLS: MasterTool[] = [
  // ── Image Tools ─────────────────────────────────────────────
  {
    id: "image-compressor",
    slug: "image-compressor",
    title: "Batch Image Compressor",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Compress JPG, PNG & WebP images up to 85% without visible quality loss. Instant client-side speed.",
    href: "/tools/image-tools/image-compressor",
    icon: "LuImage",
    badge: "FAST",
    roles: ["creator", "marketer", "developer", "office"],
    keywords: ["compress", "shrink", "optimize", "reduce size", "photo", "jpg", "png", "webp", "image size"],
    stats: { users: "45K+", rating: 4.95 },
  },
  {
    id: "background-remover",
    slug: "background-remover",
    title: "AI Background Remover",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Remove image backgrounds in 1-click using browser-based AI. Transparent cutout with zero server uploads.",
    href: "/tools/image-tools/background-remover",
    icon: "LuEraser",
    badge: "AI POWERED",
    roles: ["creator", "marketer", "office"],
    keywords: ["bg remove", "transparent", "cutout", "product photo", "png transparent", "ai background", "erase"],
    stats: { users: "62K+", rating: 4.98 },
  },
  {
    id: "screenshot-device-mockup-generator",
    slug: "screenshot-device-mockup-generator",
    title: "Device Mockup Generator",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Wrap screenshots inside beautiful macOS browser frames, iPhones, MacBooks, and gradient canvases.",
    href: "/tools/image-tools/screenshot-device-mockup-generator",
    icon: "LuMonitor",
    badge: "HOT",
    roles: ["creator", "marketer", "developer"],
    keywords: ["mockup", "screenshot", "iphone frame", "macbook frame", "browser window", "presentation", "dribbble"],
    stats: { users: "28K+", rating: 4.96 },
  },
  {
    id: "image-cropper",
    slug: "image-cropper",
    title: "Image Cropper & Avatar Maker",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Crop photos to exact aspect ratios or create circular profile avatars with borders and shadow effects.",
    href: "/tools/image-tools/image-cropper",
    icon: "LuCrop",
    badge: "POPULAR",
    roles: ["creator", "office"],
    keywords: ["crop", "circle crop", "avatar maker", "profile picture", "aspect ratio", "resize photo"],
    stats: { users: "19K+", rating: 4.92 },
  },
  {
    id: "svg-to-png",
    slug: "svg-to-png",
    title: "SVG to PNG Converter",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Convert vector SVG graphics or raw SVG markup into crystal-clear 2x/4x high-res PNGs.",
    href: "/tools/image-tools/svg-to-png",
    icon: "LuFileType",
    badge: "NEW",
    roles: ["developer", "creator"],
    keywords: ["svg", "png", "vector to raster", "convert svg", "high res png", "icon export"],
    stats: { users: "15K+", rating: 4.9 },
  },
  {
    id: "bulk-image-watermark-adder",
    slug: "bulk-image-watermark-adder",
    title: "Bulk Watermark Adder",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Protect your photos with customizable text or logo watermarks. Batch process 50+ images at once.",
    href: "/tools/image-tools/bulk-image-watermark-adder",
    icon: "LuShield",
    badge: "PRIVATE",
    roles: ["creator", "marketer"],
    keywords: ["watermark", "protect copyright", "batch watermark", "logo stamp", "photo branding"],
    stats: { users: "12K+", rating: 4.88 },
  },
  {
    id: "online-meme-generator",
    slug: "online-meme-generator",
    title: "Meme Generator",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Create viral memes in seconds with classic Impact font or modern Twitter/Reddit caption headers.",
    href: "/tools/image-tools/online-meme-generator",
    icon: "LuSmile",
    badge: "POPULAR",
    roles: ["creator", "marketer"],
    keywords: ["meme", "meme maker", "viral", "twitter header", "drake meme", "funny caption"],
    stats: { users: "34K+", rating: 4.94 },
  },
  {
    id: "exif-data-viewer-and-stripper",
    slug: "exif-data-viewer-and-stripper",
    title: "EXIF Viewer & Stripper",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Inspect hidden GPS location and camera metadata, or erase all EXIF data before sharing publicly.",
    href: "/tools/image-tools/exif-data-viewer-and-stripper",
    icon: "LuEye",
    badge: "PRIVATE",
    roles: ["creator", "developer", "office"],
    keywords: ["exif", "metadata", "gps location", "strip exif", "camera data", "privacy photo"],
    stats: { users: "11K+", rating: 4.91 },
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    title: "Instant Image Resizer",
    category: "image-tools",
    categoryLabel: "Image Tools",
    shortDescription: "Resize images by exact pixels, percentage, or social media dimensions (Instagram, Twitter, YouTube).",
    href: "/tools/image-tools/image-resizer",
    icon: "LuMaximize",
    badge: "FAST",
    roles: ["creator", "marketer"],
    keywords: ["resize", "dimensions", "width height", "scale photo", "social media size"],
    stats: { users: "22K+", rating: 4.9 },
  },

  // ── PDF Tools ───────────────────────────────────────────────
  {
    id: "pdf-to-word-converter",
    slug: "pdf-to-word-converter",
    title: "PDF to Word Converter",
    category: "pdf-tools",
    categoryLabel: "PDF Tools",
    shortDescription: "Convert PDF documents into editable Word (.docx) files while preserving typography and tables.",
    href: "/tools/pdf-tools/pdf-to-word-converter",
    icon: "LuFileText",
    badge: "POPULAR",
    roles: ["office", "developer", "marketer"],
    keywords: ["pdf to docx", "pdf to word", "convert pdf", "editable word", "document conversion"],
    stats: { users: "85K+", rating: 4.97 },
  },
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    title: "Merge PDF Online",
    category: "pdf-tools",
    categoryLabel: "PDF Tools",
    shortDescription: "Combine multiple PDF documents into one cleanly organized file with visual drag-and-drop page ordering.",
    href: "/tools/pdf-tools/merge-pdf",
    icon: "LuLayers",
    badge: "HOT",
    roles: ["office", "developer", "marketer"],
    keywords: ["merge pdf", "combine pdf", "join pdf", "combine documents", "pdf binder"],
    stats: { users: "72K+", rating: 4.95 },
  },
  {
    id: "jpg-to-pdf-converter",
    slug: "jpg-to-pdf-converter",
    title: "JPG & Images to PDF",
    category: "pdf-tools",
    categoryLabel: "PDF Tools",
    shortDescription: "Convert photos, scans, and receipts into a single clean PDF document ready for printing or email.",
    href: "/tools/pdf-tools/jpg-to-pdf-converter",
    icon: "LuFilePlus",
    badge: "FAST",
    roles: ["office", "creator"],
    keywords: ["jpg to pdf", "photos to pdf", "images to pdf", "receipt scan to pdf", "document creator"],
    stats: { users: "39K+", rating: 4.93 },
  },
  {
    id: "pdf-to-jpg-converter",
    slug: "pdf-to-jpg-converter",
    title: "PDF to JPG Extractor",
    category: "pdf-tools",
    categoryLabel: "PDF Tools",
    shortDescription: "Extract individual PDF pages as crystal-clear high-resolution JPG or PNG images in seconds.",
    href: "/tools/pdf-tools/pdf-to-jpg-converter",
    icon: "LuImageDown",
    badge: "NEW",
    roles: ["office", "creator"],
    keywords: ["pdf to jpg", "pdf to images", "extract pdf pages", "pdf screenshots"],
    stats: { users: "26K+", rating: 4.91 },
  },

  // ── SEO Tools ───────────────────────────────────────────────
  {
    id: "google-serp-snippet-simulator",
    slug: "google-serp-snippet-simulator",
    title: "Google SERP Simulator",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Simulate desktop and mobile Google Search snippets with live pixel width checks and rich snippet stars.",
    href: "/tools/seo-tools/google-serp-snippet-simulator",
    icon: "LuSearch",
    badge: "HOT",
    roles: ["marketer", "developer", "creator"],
    keywords: ["serp", "google snippet", "pixel width", "meta title preview", "ctr test", "meta description"],
    stats: { users: "51K+", rating: 4.98 },
  },
  {
    id: "social-media-share-card-simulator",
    slug: "social-media-share-card-simulator",
    title: "Social Share Card Simulator",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Preview and debug how your links appear on Twitter/X, Facebook, LinkedIn, Discord, and Slack.",
    href: "/tools/seo-tools/social-media-share-card-simulator",
    icon: "LuShare2",
    badge: "POPULAR",
    roles: ["marketer", "creator", "developer"],
    keywords: ["open graph", "twitter card", "og image", "social preview", "facebook share card", "slack preview"],
    stats: { users: "37K+", rating: 4.96 },
  },
  {
    id: "http-security-cache-headers-analyzer",
    slug: "http-security-cache-headers-analyzer",
    title: "Security & Cache Headers Analyzer",
    category: "seo-tools",
    categoryLabel: "SEO & Dev Tools",
    shortDescription: "Audit any website's HTTP security rating (A+ to F), HSTS, CSP, and caching policies with ready-to-use configs.",
    href: "/tools/seo-tools/http-security-cache-headers-analyzer",
    icon: "LuShieldCheck",
    badge: "NEW",
    roles: ["developer", "marketer"],
    keywords: ["security headers", "hsts", "csp", "cache control", "audit headers", "ssl security"],
    stats: { users: "24K+", rating: 4.94 },
  },
  {
    id: "schema-org-structured-data-generator",
    slug: "schema-org-structured-data-generator",
    title: "Schema.org JSON-LD Generator",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Generate valid Google JSON-LD schema markup for Articles, FAQs, Local Business, How-To, and Products.",
    href: "/tools/seo-tools/schema-org-structured-data-generator",
    icon: "LuCode2",
    badge: "HOT",
    roles: ["marketer", "developer"],
    keywords: ["schema", "structured data", "json ld", "faq schema", "rich snippets", "rich results"],
    stats: { users: "31K+", rating: 4.95 },
  },
  {
    id: "keyword-density-n-gram-analyzer",
    slug: "keyword-density-n-gram-analyzer",
    title: "Keyword Density & N-Gram Analyzer",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Analyze 1-gram to 4-gram keyword frequency and density to improve topical relevance and avoid keyword stuffing.",
    href: "/tools/seo-tools/keyword-density-n-gram-analyzer",
    icon: "LuBarChart2",
    badge: "POPULAR",
    roles: ["marketer", "creator"],
    keywords: ["keyword density", "n gram", "content optimization", "word frequency", "topical authority"],
    stats: { users: "29K+", rating: 4.92 },
  },
  {
    id: "meta-tag-generator",
    slug: "meta-tag-generator",
    title: "SEO Meta Tag Generator",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Generate valid HTML <title>, <meta description>, Open Graph, and Twitter tags in one click.",
    href: "/tools/seo-tools/meta-tag-generator",
    icon: "LuTags",
    badge: "FAST",
    roles: ["marketer", "developer"],
    keywords: ["meta tags", "html head", "seo title", "meta description generator", "og tags"],
    stats: { users: "44K+", rating: 4.93 },
  },
  {
    id: "robots-txt-generator",
    slug: "robots-txt-generator",
    title: "Robots.txt Generator",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Create clean, valid robots.txt files to manage search engine crawlers and protect private directories.",
    href: "/tools/seo-tools/robots-txt-generator",
    icon: "LuBot",
    badge: "FAST",
    roles: ["marketer", "developer"],
    keywords: ["robots txt", "crawl budget", "googlebot", "disallow rules", "sitemap declaration"],
    stats: { users: "20K+", rating: 4.89 },
  },
  {
    id: "hreflang-and-canonical-tag-generator",
    slug: "hreflang-and-canonical-tag-generator",
    title: "Hreflang & Canonical Generator",
    category: "seo-tools",
    categoryLabel: "SEO Tools",
    shortDescription: "Build multi-language hreflang tags, self-referential canonicals, and XML sitemaps with ISO language codes.",
    href: "/tools/seo-tools/hreflang-and-canonical-tag-generator",
    icon: "LuGlobe",
    badge: "NEW",
    roles: ["marketer", "developer"],
    keywords: ["hreflang", "canonical tag", "international seo", "multilingual seo", "iso language codes"],
    stats: { users: "16K+", rating: 4.91 },
  },

  // ── Developer & Text Tools ──────────────────────────────────
  {
    id: "json-formatter",
    slug: "json-formatter",
    title: "JSON Formatter & Validator",
    category: "developer-tools",
    categoryLabel: "Developer Tools",
    shortDescription: "Beautify, validate, minify, and inspect JSON with syntax highlighting and instant error detection.",
    href: "/tools/developer-tools/json-formatter",
    icon: "LuBraces",
    badge: "FAST",
    roles: ["developer", "office"],
    keywords: ["json format", "json validator", "beautify json", "minify json", "parse json"],
    stats: { users: "58K+", rating: 4.97 },
  },
  {
    id: "text-case-converter",
    slug: "text-case-converter",
    title: "Text Case Converter",
    category: "developer-tools",
    categoryLabel: "Text Tools",
    shortDescription: "Convert text instantly between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case.",
    href: "/tools/developer-tools/text-case-converter",
    icon: "LuCaseSensitive",
    badge: "POPULAR",
    roles: ["developer", "creator", "office"],
    keywords: ["case converter", "camelcase", "uppercase", "lowercase", "snake case", "title case", "kebab case"],
    stats: { users: "33K+", rating: 4.92 },
  },
  {
    id: "qr-code-generator",
    slug: "qr-code-generator",
    title: "Custom QR Code Generator",
    category: "developer-tools",
    categoryLabel: "Utility Tools",
    shortDescription: "Create custom QR codes for URLs, WiFi, contact cards, and text with custom colors and logo embedding.",
    href: "/tools/developer-tools/qr-code-generator",
    icon: "LuQrCode",
    badge: "HOT",
    roles: ["creator", "marketer", "office"],
    keywords: ["qr code", "qr generator", "wifi qr", "custom qr", "download qr", "barcode"],
    stats: { users: "41K+", rating: 4.94 },
  },
  {
    id: "color-picker",
    slug: "color-picker",
    title: "Color Palette & Converter",
    category: "developer-tools",
    categoryLabel: "Design & Dev",
    shortDescription: "Inspect, generate, and convert colors between HEX, RGB, HSL, and OKLCH with WCAG contrast ratios.",
    href: "/tools/developer-tools/color-picker",
    icon: "LuPalette",
    badge: "FAST",
    roles: ["creator", "developer"],
    keywords: ["color picker", "hex to rgb", "hsl", "palette generator", "contrast checker", "oklch"],
    stats: { users: "27K+", rating: 4.93 },
  },
  {
    id: "favicon-generator",
    slug: "favicon-generator",
    title: "Multi-Platform Favicon Generator",
    category: "developer-tools",
    categoryLabel: "Developer Tools",
    shortDescription: "Generate a complete favicon package (favicon.ico, 16x16, 32x32, 192x192, apple-touch-icon) in 1 click.",
    href: "/tools/developer-tools/favicon-generator",
    icon: "LuSparkles",
    badge: "NEW",
    roles: ["developer", "creator"],
    keywords: ["favicon", "favicon ico", "apple touch icon", "manifest icons", "website icon"],
    stats: { users: "23K+", rating: 4.91 },
  },
];

// ── Search & Filter Helpers ─────────────────────────────────────
export function searchTools(query: string, maxResults = 8): MasterTool[] {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();

  return MASTER_TOOLS.filter((tool) => {
    return (
      tool.title.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.categoryLabel.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }).slice(0, maxResults);
}

export function getToolsByRole(role: UserRole): MasterTool[] {
  if (role === "all") return MASTER_TOOLS;
  return MASTER_TOOLS.filter((t) => t.roles.includes(role));
}

export function getTrendingTools(limit = 6): MasterTool[] {
  return MASTER_TOOLS.filter(
    (t) => t.badge === "HOT" || t.badge === "AI POWERED" || t.badge === "POPULAR"
  ).slice(0, limit);
}

