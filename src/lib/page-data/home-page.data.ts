import { fetchPageComponents } from "@/lib/api-calls/page-components.api";
import { HeroConfig, DEFAULT_HERO_CONFIG } from "@/components/public/Hero/hero.config";

export interface HomePageData {
    hero: HeroConfig | undefined;
    popularTools: any;
    whyChooseUs: any;
    howItWorks: any;
    finalCta: any;
    seoContent: any;
}

/**
 * Fetch all home page component data from API
 * Returns undefined for components not found (will use component defaults)
 */
export async function fetchHomePageData(): Promise<HomePageData> {
    try {
        const components = await fetchPageComponents("home");

        // Map components by type
        const componentsMap = new Map(
            components.map((comp) => [comp.component_type, comp.component_data])
        );

        return {
            hero: (componentsMap.get("hero") as HeroConfig) || undefined,
            popularTools: componentsMap.get("popular-tools") || undefined,
            whyChooseUs: componentsMap.get("why-choose-us") || undefined,
            howItWorks: componentsMap.get("how-it-works") || undefined,
            finalCta: componentsMap.get("final-cta") || undefined,
            seoContent: componentsMap.get("seo-content") || undefined,
        };
    } catch (error) {
        console.error("Error fetching home page data:", error);

        // Return undefined for all if API fails - components will use defaults
        return {
            hero: undefined,
            popularTools: undefined,
            whyChooseUs: undefined,
            howItWorks: undefined,
            finalCta: undefined,
            seoContent: undefined,
        };
    }
}