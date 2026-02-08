// page.tsx - About page with SEO metadata
import type { Metadata } from "next";
import AboutPage from "./AboutPage-with-config";
import { ABOUT_CONFIG } from "./AboutPage-config";

// Generate metadata from config
export const metadata: Metadata = {
    title: ABOUT_CONFIG.seo.title,
    description: ABOUT_CONFIG.seo.description,
    keywords: ABOUT_CONFIG.seo.keywords,
    openGraph: {
        title: ABOUT_CONFIG.seo.title,
        description: ABOUT_CONFIG.seo.description,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: ABOUT_CONFIG.seo.title,
        description: ABOUT_CONFIG.seo.description,
    },
};

export default function Page() {
    return <AboutPage />;
}