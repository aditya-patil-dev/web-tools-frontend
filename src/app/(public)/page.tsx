import Hero from "@/components/public/Hero/Hero";
import PopularTools from "@/components/public/PopularTools/PopularTools";
import WhyChooseUs from "@/components/public/whychooseus/WhyChooseUs";
import HowItWorks from "@/components/public/HowItWorks/HowItWorks";
import FinalCTA from "@/components/public/FinalCTA/FinalCTA";
import SEOContent from "@/components/public/SEOContent/SEOContent";
import { generateStaticPageMetadata } from "@/config/seo.config";
import { fetchStaticSeo } from "@/lib/api-calls/seo.server";
import { fetchHomePageData } from "@/lib/page-data/home-page.data";

export async function generateMetadata() {
    const apiData = await fetchStaticSeo("home");
    return generateStaticPageMetadata("home", apiData || undefined);
}

export default async function Home() {
    // Fetch all component data from API
    const pageData = await fetchHomePageData();

    return (
        <>
            <Hero config={pageData.hero} />
            <PopularTools config={pageData.popularTools} />
            <WhyChooseUs config={pageData.whyChooseUs} />
            <HowItWorks config={pageData.howItWorks} />
            <FinalCTA config={pageData.finalCta} />
            <SEOContent config={pageData.seoContent} />
        </>
    );
}