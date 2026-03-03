// src/services/settings.public.service.ts
// Server-side only — used in layout.tsx and generateMetadata()
// No auth required (public read endpoint)

export type SiteSettings = {
  id: string;
  site_name: string;
  site_tagline: string | null;
  site_url: string | null;
  site_description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  google_search_console: string | null;
  bing_webmaster: string | null;
  facebook_pixel_id: string | null;
  hotjar_site_id: string | null;
  maintenance_mode: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SettingsResponse = {
  success: boolean;
  message: string;
  data: SiteSettings;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetch site settings on the server side.
 * Cached for 1 hour — revalidate on demand via revalidateTag('site-settings')
 * if you add ISR later.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch(`${BASE_URL}/settings`, {
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    console.log("[SiteSettings]", json.data); // ← add this
    return json.success ? json.data : null;
  } catch (err) {
    console.error("[SiteSettings] fetch failed:", err); // ← and this
    return null;
  }
}
