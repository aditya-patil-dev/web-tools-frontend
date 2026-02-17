export type NavItem = {
  label: string;
  href?: string;
  children?: {
    label: string;
    href: string;
    badge?: "new" | "beta";
  }[];
};

// Top row navigation items (static pages)
export const TOP_NAV_ITEMS = [
  {
    label: "Pricing",
    href: "/pricing",
  },
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
      { label: "JPG to PNG", href: "/tools/image-tools/jpg-to-png" },
      { label: "PNG to JPG", href: "/tools/image-tools/png-to-jpg" },
      { label: "WebP Converter", href: "/tools/image-tools/webp-converter" },
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
