import { fetchPageComponents } from "@/lib/api-calls/page-components.api";
import type { NavbarData } from "@/features/online-store/sections/navbar";
import type { FooterData } from "@/features/online-store/sections/footer";

export interface LayoutData {
    navbar: NavbarData | undefined;
    footer: FooterData | undefined;
}

export async function fetchLayoutData(): Promise<LayoutData> {
    try {
        const components = await fetchPageComponents("home");
        const map = new Map(
            components.map((c) => [c.component_type, c.component_data])
        );
        return {
            navbar: (map.get("navbar") as NavbarData) || undefined,
            footer: (map.get("footer") as FooterData) || undefined,
        };
    } catch {
        return { navbar: undefined, footer: undefined };
    }
}