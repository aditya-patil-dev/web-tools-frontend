import { Metadata } from "next";
import AllToolsClient from "./AllToolsClient";
import { fetchStaticSeo } from "@/lib/api-calls/seo.server";
import { generateStaticPageMetadata } from "@/config/seo.config";

export async function generateMetadata(): Promise<Metadata> {
    const apiData = await fetchStaticSeo("tools");
    return generateStaticPageMetadata("tools", apiData || undefined);
}

export default function AllToolsPage() {
    return (
        <div className="tools-page-container">
            <AllToolsClient />
        </div>
    );
}