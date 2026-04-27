import Hero from "@/components/public/Hero/Hero";
import PopularTools from "@/components/public/PopularTools/PopularTools";
import FinalCTA from "@/components/public/FinalCTA/FinalCTA";
import SEOContent from "@/components/public/SEOContent/SEOContent";
import { generateStaticPageMetadata } from "@/config/seo.config";
import { fetchStaticSeo } from "@/lib/api-calls/seo.server";
import { fetchHomePageData } from "@/lib/page-data/home-page.data";
import SectionEngine from '@/components/section-engine/SectionEngine';
import { homePageConfig } from '@/components/section-engine/example-config';
import '@/components/section-engine/section-engine.css'

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
            <PopularTools />
            <SectionEngine config={homePageConfig} />
            <FinalCTA config={pageData.finalCta} />
            <SEOContent config={pageData.seoContent} />
        </>
    );
}