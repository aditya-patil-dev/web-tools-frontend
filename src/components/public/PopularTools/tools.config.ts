export type ToolItem = {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: "new" | "popular";
};

export const POPULAR_TOOLS: ToolItem[] = [
  {
    title: "Image Converter",
    description: "Convert JPG, PNG, WEBP images instantly.",
    href: "/tools/image-converter",
    icon: "🖼️",
    badge: "popular",
  },
  {
    title: "Keyword Research",
    description: "Find low-competition keywords in seconds.",
    href: "/tools/keyword-research",
    icon: "🔍",
  },
  {
    title: "Image Compressor",
    description: "Reduce image size without losing quality.",
    href: "/tools/image-compressor",
    icon: "⚡",
  },
  {
    title: "Meta Tag Generator",
    description: "Generate SEO-friendly meta tags easily.",
    href: "/tools/meta-tag-generator",
    icon: "🧠",
    badge: "new",
  },
  {
    title: "Text Case Converter",
    description: "Convert text to upper, lower, title case.",
    href: "/tools/text-case-converter",
    icon: "✍️",
  },
  {
    title: "AI Content Helper",
    description: "Generate ideas and short content with AI.",
    href: "/tools/ai-content-helper",
    icon: "🤖",
  },
];
