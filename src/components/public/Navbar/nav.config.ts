export type NavItem = {
  label: string;
  href?: string;
  children?: {
    label: string;
    href: string;
    badge?: "new" | "beta" | "pro" | "ai";
  }[];
};

// Top row navigation items (static pages)
export const TOP_NAV_ITEMS = [
  // {
  //   label: "Pricing",
  //   href: "/pricing",
  // },
  {
    label: "About",
    href: "/about",
  },
];

// Bottom row navigation items (tools with dropdowns)
export const TOOLS_NAV_ITEMS: NavItem[] = [
  {
    label: "IMG Tools",
    href: "/tools/image-tools",
    children: [
      {
        label: "Image Compressor",
        href: "/tools/image-tools/image-compressor",
      },
      { label: "Image Resizer", href: "/tools/image-tools/image-resizer" },
      { label: "Image to Base64", href: "/tools/image-tools/image-to-base64" },
      { label: "Image Cropper", href: "/tools/image-tools/image-cropper", badge: "new" },
      { label: "JPG to PNG", href: "/tools/image-tools/jpg-to-png" },
      { label: "PNG to JPG", href: "/tools/image-tools/png-to-jpg" },
      { label: "SVG to PNG", href: "/tools/image-tools/svg-to-png", badge: "new" },
      { label: "Watermark Adder", href: "/tools/image-tools/bulk-image-watermark-adder", badge: "new" },
      { label: "EXIF Viewer & Stripper", href: "/tools/image-tools/exif-data-viewer-and-stripper", badge: "new" },
      { label: "Device Mockup Generator", href: "/tools/image-tools/screenshot-device-mockup-generator", badge: "new" },
      { label: "Meme Generator", href: "/tools/image-tools/online-meme-generator", badge: "new" },
      { label: "WebP Converter", href: "/tools/image-tools/webp-converter" },
      { label: "SVG to PNG", href: "/tools/image-tools/svg-to-png", badge: "new" },
      { label: "Image Cropper & Avatar", href: "/tools/image-tools/image-cropper", badge: "new" },
      { label: "Device Mockup Generator", href: "/tools/image-tools/device-mockup-generator", badge: "new" },
      { label: "EXIF Viewer & Stripper", href: "/tools/image-tools/exif-viewer-stripper", badge: "new" },
      { label: "Meme Generator", href: "/tools/image-tools/meme-generator", badge: "new" },
      { label: "Bulk Watermark Adder", href: "/tools/image-tools/bulk-watermark", badge: "new" },
    ],
  },
  {
    label: "Text Tools",
    href: "/tools/text-tools",
    children: [
      { label: "Case Converter", href: "/tools/text-tools/case-converter" },
      {
        label: "Word Counter",
        href: "/tools/text-tools/word-counter",
        badge: "new",
      },
      { label: "Text Formatter", href: "/tools/text-tools/text-formatter" },
    ],
  },
  {
    label: "Dev Tools",
    href: "/tools/developer-tools",
    children: [
      {
        label: "JSON Formatter",
        href: "/tools/developer-tools/json-formatter",
      },
      {
        label: "Code Beautifier",
        href: "/tools/developer-tools/code-beautifier",
        badge: "new",
      },
    ],
  },
  {
    label: "SEO Tools",
    href: "/tools/seo-tools",
    children: [
      {
        label: "SERP Simulator",
        href: "/tools/seo-tools/google-serp-snippet-simulator",
        badge: "new",
      },
      {
        label: "Schema Generator",
        href: "/tools/seo-tools/schema-org-structured-data-generator",
        badge: "new",
      },
      {
        label: "Keyword Density Analyzer",
        href: "/tools/seo-tools/keyword-density-n-gram-analyzer",
        badge: "new",
      },
      {
        label: "Social Share Simulator",
        href: "/tools/seo-tools/social-media-share-card-simulator",
        badge: "new",
      },
      {
        label: "HTTP Headers Analyzer",
        href: "/tools/seo-tools/http-security-cache-headers-analyzer",
        badge: "new",
      },
      {
        label: "Hreflang Generator",
        href: "/tools/seo-tools/hreflang-and-canonical-tag-generator",
        badge: "new",
      },
      {
        label: "Meta Tag Generator",
        href: "/tools/seo-tools/meta-tag-generator",
      },
      {
        label: "Robots.txt Generator",
        href: "/tools/seo-tools/robots-txt-generator",
      },
    ],
  },
  {
    label: "PDF Tools",
    href: "/tools/pdf-tools",
    children: [
      {
        label: "PDF Merger",
        href: "/tools/pdf-tools/pdf-merger",
      },
      {
        label: "PDF Compressor",
        href: "/tools/pdf-tools/pdf-compressor",
      },
    ],
  },
];
