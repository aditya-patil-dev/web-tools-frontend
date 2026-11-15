import Hero from "@/components/public/Hero/Hero";
import RecentAndTrending from "@/components/public/RecentAndTrending/RecentAndTrending";
import PromotedServicesShowcase from "@/components/public/PromotedServices/PromotedServicesShowcase";
import MicroPlayground from "@/components/public/MicroPlayground/MicroPlayground";
import RoleExplorer from "@/components/public/RoleExplorer/RoleExplorer";
import PopularTools from "@/components/public/PopularTools/PopularTools";
import PrivacyProof from "@/components/public/PrivacyProof/PrivacyProof";
import FinalCTA from "@/components/public/FinalCTA/FinalCTA";
import SEOContent from "@/components/public/SEOContent/SEOContent";
import { generateStaticPageMetadata } from "@/config/seo.config";
import { fetchStaticSeo } from "@/lib/api-calls/seo.server";
import { fetchHomePageData } from "@/lib/page-data/home-page.data";
import SectionEngine from "@/components/section-engine/SectionEngine";
import { homePageConfig } from "@/components/section-engine/example-config";
import "@/components/section-engine/section-engine.css";
import "@/styles/home-modern.css";

export async function generateMetadata() {
    const apiData = await fetchStaticSeo("home");
    return generateStaticPageMetadata("home", apiData || undefined);
}

export default async function Home() {
    // Fetch all component data from API
    const pageData = await fetchHomePageData();

    return (
        <>
            {/* 1. Full-screen sliding trending tools ticker on top of website */}
            <RecentAndTrending />

            {/* 2. Hero Section (Unified Command Omnibar + Synchronized Studio) */}
            <Hero />

            {/* 3. Promoted Services Showcase ("Like Carousel but not carousel") */}
            <PromotedServicesShowcase />

            {/* 4. Micro Playground Interactive Simulator */}
            <MicroPlayground />

            {/* 5. Role Explorer */}
            <RoleExplorer />

            {/* 6. Popular Tools Directory */}
            <PopularTools />

            {/* 7. Privacy Proof */}
            <PrivacyProof />

            {/* 8. Final CTA & SEO Content */}
            <FinalCTA config={pageData.finalCta} />
            <SEOContent config={pageData.seoContent} />
        </>
    );
}
