export type NavItem = {
  label: string;
  href?: string;
  children?: {
    label: string;
    href: string;
    badge?: "new" | "beta";
  }[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
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
    ],
  },
  {
    label: "SEO Tools",
    href: "/tools/seo-tools",
    children: [
      {
        label: "JSON Formatter",
        href: "/tools/seo-tools/meta-tag-generator",
      },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "About",
    href: "/about",
  },
];
