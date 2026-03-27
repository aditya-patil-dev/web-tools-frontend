import type { PageComponentDTO } from "@/lib/api-calls/page-components.api";
import type { NavbarData } from "@/features/online-store/sections/navbar";
import type { FooterData } from "@/features/online-store/sections/footer";

export interface LayoutData {
    navbar: NavbarData | undefined;
    footer: FooterData | undefined;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetches layout data (navbar, footer) with aggressive caching.
 * Revalidates every 3600s (1 hour) to avoid unnecessary DB calls on every request.
 */
export async function fetchLayoutData(): Promise<LayoutData> {
    try {
        const res = await fetch(`${API_BASE}/page-components/page/home`, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) throw new Error("Failed to fetch layout data");

        const json = (await res.json()) as { success: boolean; data: PageComponentDTO[] };
        if (!json.success || !json.data) return { navbar: undefined, footer: undefined };

        const map = new Map(json.data.map((c) => [c.component_type, c.component_data]));

        return {
            navbar: (map.get("navbar") as NavbarData) || undefined,
            footer: (map.get("footer") as FooterData) || undefined,
        };
    } catch (error) {
        console.error("fetchLayoutData error:", error);
        return { navbar: undefined, footer: undefined };
    }
}