import { api } from "@/lib/api/api";
import { toNumber } from "@/lib/api/apiHelpers";

export type ToolItem = {
  id: string;
  title: string;
  short_description: string;
  slug: string;
  category_slug: string;
  badge?: "new" | "popular" | "pro";
  tags: string[];
  views: number;
  users_count: number;
  rating: number;
  tool_url: string;
};

export type CategoryPage = {
  page_title: string;
  page_description: string;
  page_intro?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  noindex?: boolean;
};

const FALLBACK_CATEGORY_TOOLS: Record<string, ToolItem[]> = {
  "image-tools": [
    {
      id: "svg-to-png",
      title: "SVG to PNG Converter",
      short_description: "Convert SVG vector files or raw markup to high-res PNG images with transparency and scale multipliers.",
      slug: "svg-to-png",
      category_slug: "image-tools",
      badge: "new",
      tags: ["svg", "png", "converter", "image"],
      views: 1250,
      users_count: 850,
      rating: 4.9,
      tool_url: "/tools/image-tools/svg-to-png",
    },
    {
      id: "image-cropper",
      title: "Image Cropper & Circle Avatar Maker",
      short_description: "Crop pictures to standard aspect ratios or generate circular profile avatars with borders.",
      slug: "image-cropper",
      category_slug: "image-tools",
      badge: "popular",
      tags: ["cropper", "avatar", "circle-crop", "image"],
      views: 2450,
      users_count: 1720,
      rating: 4.95,
      tool_url: "/tools/image-tools/image-cropper",
    },
    {
      id: "bulk-image-watermark-adder",
      title: "Bulk Image Watermark Adder",
      short_description: "Watermark multiple images at once with custom text or logos, 9-point placement, or tile patterns.",
      slug: "bulk-image-watermark-adder",
      category_slug: "image-tools",
      badge: "new",
      tags: ["watermark", "bulk", "logo", "protect", "image"],
      views: 3100,
      users_count: 2280,
      rating: 4.9,
      tool_url: "/tools/image-tools/bulk-image-watermark-adder",
    },
    {
      id: "exif-data-viewer-and-stripper",
      title: "EXIF Data Viewer & Stripper",
      short_description: "View hidden camera metadata and GPS coordinates, or strip EXIF data before sharing online.",
      slug: "exif-data-viewer-and-stripper",
      category_slug: "image-tools",
      badge: "new",
      tags: ["exif", "metadata", "privacy", "gps", "camera"],
      views: 1950,
      users_count: 1420,
      rating: 4.92,
      tool_url: "/tools/image-tools/exif-data-viewer-and-stripper",
    },
    {
      id: "screenshot-device-mockup-generator",
      title: "Screenshot Device Mockup Generator",
      short_description: "Wrap screenshots inside beautiful browser tabs, iPhones, MacBooks, and gradient backdrops.",
      slug: "screenshot-device-mockup-generator",
      category_slug: "image-tools",
      badge: "popular",
      tags: ["mockup", "screenshot", "device", "browser", "image"],
      views: 4200,
      users_count: 2950,
      rating: 4.98,
      tool_url: "/tools/image-tools/screenshot-device-mockup-generator",
    },
    {
      id: "online-meme-generator",
      title: "Online Meme Generator",
      short_description: "Create classic top/bottom memes or modern Twitter/Reddit header style memes.",
      slug: "online-meme-generator",
      category_slug: "image-tools",
      badge: "popular",
      tags: ["meme", "meme-generator", "funny", "viral", "image"],
      views: 5600,
      users_count: 4120,
      rating: 4.96,
      tool_url: "/tools/image-tools/online-meme-generator",
    },
  ],
  "seo-tools": [
    {
      id: "google-serp-snippet-simulator",
      title: "Google SERP Snippet Simulator",
      short_description: "Simulate desktop and mobile Google Search snippets with live pixel width checks and rich snippets.",
      slug: "google-serp-snippet-simulator",
      category_slug: "seo-tools",
      badge: "new",
      tags: ["serp", "google", "meta-tags", "seo", "snippet"],
      views: 3800,
      users_count: 2640,
      rating: 4.95,
      tool_url: "/tools/seo-tools/google-serp-snippet-simulator",
    },
    {
      id: "schema-org-structured-data-generator",
      title: "Schema.org Structured Data Generator",
      short_description: "Generate valid Google JSON-LD structured data for FAQs, Articles, Products, Local Business, How-To, and Events.",
      slug: "schema-org-structured-data-generator",
      category_slug: "seo-tools",
      badge: "new",
      tags: ["schema", "structured-data", "json-ld", "rich-snippets", "faq-schema", "seo"],
      views: 4500,
      users_count: 3100,
      rating: 4.96,
      tool_url: "/tools/seo-tools/schema-org-structured-data-generator",
    },
    {
      id: "keyword-density-n-gram-analyzer",
      title: "Keyword Density & N-Gram Analyzer",
      short_description: "Analyze 1-gram to 4-gram keyword frequency and density to optimize topical relevance and prevent keyword stuffing.",
      slug: "keyword-density-n-gram-analyzer",
      category_slug: "seo-tools",
      badge: "new",
      tags: ["keyword-density", "n-gram", "keyword-stuffing", "seo", "content-analysis"],
      views: 4200,
      users_count: 2850,
      rating: 4.94,
      tool_url: "/tools/seo-tools/keyword-density-n-gram-analyzer",
    },
    {
      id: "social-media-share-card-simulator",
      title: "Social Media Share Card Simulator",
      short_description: "Simulate and preview how your links appear across Twitter/X, Facebook, LinkedIn, Discord, and Slack.",
      slug: "social-media-share-card-simulator",
      category_slug: "seo-tools",
      badge: "new",
      tags: ["open-graph", "twitter-card", "social-media", "facebook-og", "seo"],
      views: 4800,
      users_count: 3250,
      rating: 4.97,
      tool_url: "/tools/seo-tools/social-media-share-card-simulator",
    },
    {
      id: "http-security-cache-headers-analyzer",
      title: "HTTP Security & Cache Headers Analyzer",
      short_description: "Audit HTTP response headers, security ratings (A+ to F), and caching policies with config generators.",
      slug: "http-security-cache-headers-analyzer",
      category_slug: "seo-tools",
      badge: "new",
      tags: ["http-headers", "security-headers", "hsts", "csp", "cache-control", "seo"],
      views: 4100,
      users_count: 2780,
      rating: 4.93,
      tool_url: "/tools/seo-tools/http-security-cache-headers-analyzer",
    },
    {
      id: "hreflang-and-canonical-tag-generator",
      title: "Hreflang & Canonical Tag Generator",
      short_description: "Build multi-language hreflang tags, self-referential canonicals, and XML sitemaps with ISO language codes.",
      slug: "hreflang-and-canonical-tag-generator",
      category_slug: "seo-tools",
      badge: "new",
      tags: ["hreflang", "canonical", "international-seo", "multi-language", "seo"],
      views: 3900,
      users_count: 2650,
      rating: 4.92,
      tool_url: "/tools/seo-tools/hreflang-and-canonical-tag-generator",
    },
    {
      id: "keyword-research-tool",
      title: "Keyword Research & Intent Finder",
      short_description: "Discover hundreds of Google autocomplete keywords, search questions, buyer intent, and topic clusters for free.",
      slug: "keyword-research",
      category_slug: "seo-tools",
      badge: "popular",
      tags: ["keyword-research", "seo", "google-suggest", "search-intent", "long-tail"],
      views: 5200,
      users_count: 3840,
      rating: 4.98,
      tool_url: "/seo/tools/keyword-research",
    },
  ],
};

export async function fetchToolsByCategory(category: string): Promise<{
  category: CategoryPage | null;
  tools: ToolItem[];
}> {
  let fetchedTools: ToolItem[] = [];
  let categoryPage: CategoryPage | null = null;

  try {
    const res = await api.get<{
      success: boolean;
      message: string;
      data: { category: CategoryPage | null; tools: ToolItem[] };
    }>(`/tools?category=${category}`);

    categoryPage = res.data?.category ?? null;
    fetchedTools = (res.data?.tools || []).map((tool: ToolItem) => ({
      ...tool,
      users_count: toNumber(tool.users_count),
      views: toNumber(tool.views),
      rating: toNumber(tool.rating),
    }));
  } catch (err) {
    console.warn(`[fetchToolsByCategory] API unavailable for ${category}, using fallback data.`, err);
  }

  // Merge in client-side registered tools if they are not already returned by backend
  const fallbackList = FALLBACK_CATEGORY_TOOLS[category] || [];
  fallbackList.forEach((fbTool) => {
    if (!fetchedTools.some((t) => t.slug === fbTool.slug)) {
      fetchedTools.push(fbTool);
    }
  });

  return {
    category: categoryPage,
    tools: fetchedTools,
  };
}
