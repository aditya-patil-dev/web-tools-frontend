import Hero from "@/components/public/Hero/Hero";
import RecentAndTrending from "@/components/public/RecentAndTrending/RecentAndTrending";
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
            <Hero />
            <RecentAndTrending />
            <MicroPlayground />
            <RoleExplorer />
            <PopularTools />
            {/* <SectionEngine config={homePageConfig} /> */}
            <PrivacyProof />
            <FinalCTA config={pageData.finalCta} />
            <SEOContent config={pageData.seoContent} />
        </>
    );
}
