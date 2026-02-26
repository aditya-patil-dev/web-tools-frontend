const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface SeoResponse {
    success: boolean;
    data: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string[];
        canonical_url?: string;
        noindex?: boolean;
        og_image?: string;
    };
}

export async function fetchStaticSeo(pageKey: string) {
    try {
        const res = await fetch(`${BASE_URL}/seo/static/${pageKey}`, {
            // next: { revalidate: 3600 },
        });

        if (!res.ok) return null;

        const json: SeoResponse = await res.json();
        return json.data;
    } catch (error) {
        console.error("SEO Fetch Error:", error);
        return null;
    }
}