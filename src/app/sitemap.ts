import { MetadataRoute } from "next";

const SITE_URL = process.env.FRONTEND_URL || "https://fusiontools.in";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/* ─────────────────────────────────────────
   Static pages — update this list whenever
   you add a new static route to the site.
───────────────────────────────────────── */
const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${SITE_URL}/tools`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${SITE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${SITE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${SITE_URL}/privacy-policy`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    url: `${SITE_URL}/terms-of-service`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

/* ─────────────────────────────────────────
   Fetch all tools + categories from API.
   Returns empty arrays on any failure so
   the sitemap still renders static pages.
───────────────────────────────────────── */
async function fetchSitemapData(): Promise<{
  tools: { category_slug: string; slug: string; updated_at?: string }[];
  categories: { slug: string }[];
}> {
  if (!API_URL) {
    console.warn(
      "[sitemap] NEXT_PUBLIC_API_BASE_URL is not set — skipping dynamic pages",
    );
    return { tools: [], categories: [] };
  }

  try {
    const res = await fetch(`${API_URL}/tools/all`, {
      // Always fresh — never serve a cached sitemap with stale tool list
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      // Abort after 5s so sitemap generation doesn't hang on slow API
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(
        `[sitemap] API returned ${res.status} — skipping dynamic pages`,
      );
      return { tools: [], categories: [] };
    }

    const json = await res.json();
    const data = json?.data ?? json;

    return {
      tools: Array.isArray(data?.tools) ? data.tools : [],
      categories: Array.isArray(data?.categories) ? data.categories : [],
    };
  } catch (err) {
    console.error("[sitemap] Failed to fetch tools from API:", err);
    return { tools: [], categories: [] };
  }
}

/* ─────────────────────────────────────────
   Main sitemap export
   Next.js calls this on every request
   (cache: no-store above ensures freshness)
───────────────────────────────────────── */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { tools, categories } = await fetchSitemapData();

  /* ── Category pages — /tools/[category] ── */
  const categoryUrls: MetadataRoute.Sitemap = categories
    .filter((c) => c?.slug)
    .map((c) => ({
      url: `${SITE_URL}/tools/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  /* ── Tool pages — /tools/[category]/[slug] ── */
  const toolUrls: MetadataRoute.Sitemap = tools
    .filter((t) => t?.category_slug && t?.slug)
    .map((t) => ({
      url: `${SITE_URL}/tools/${t.category_slug}/${t.slug}`,
      lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...STATIC_PAGES, ...categoryUrls, ...toolUrls];
}
