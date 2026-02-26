import Hero from "@/components/public/Hero/Hero";
import PopularTools from "@/components/public/PopularTools/PopularTools";
import WhyChooseUs from "@/components/public/whychooseus/WhyChooseUs";
import HowItWorks from "@/components/public/HowItWorks/HowItWorks";
import FinalCTA from "@/components/public/FinalCTA/FinalCTA";
import SEOContent from "@/components/public/SEOContent/SEOContent";
import { generateSEO } from "@/lib/seo/generateMetadata";
import { PAGE_SEO } from "@/lib/seo/seo.config";

export const metadata = generateSEO({
    ...PAGE_SEO.home,
    canonical: "/",
});

export default function Home() {
    return (
        <>
            <Hero />
            <PopularTools />
            <WhyChooseUs />
            <HowItWorks />
            <FinalCTA />
            <SEOContent />
        </>
    );
}
