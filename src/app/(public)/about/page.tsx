import AboutPage from "./AboutPage-with-config";
import { generateStaticPageMetadata } from "@/config/seo.config";
import { fetchStaticSeo } from "@/lib/api-calls/seo.server";

export async function generateMetadata() {
    const apiData = await fetchStaticSeo("about");

    return generateStaticPageMetadata("about", apiData || undefined);
}

export default function Page() {
    return <AboutPage />;
}