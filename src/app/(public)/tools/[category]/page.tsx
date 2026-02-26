import { Metadata } from "next";
import ToolsClient from "./ToolsClient";
import { fetchToolsByCategory } from "../tools.config";

type Props = {
    params: Promise<{ category: string }>; // Changed to Promise
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params; // Await the params

    try {
        const data = await fetchToolsByCategory(category);
        const categoryPage = data.category;

        if (!categoryPage) {
            return {
                title: `${category.replace(/-/g, " ")} Tools`,
                description: "Browse our collection of free online tools.",
            };
        }

        return {
            title: categoryPage.meta_title || categoryPage.page_title,
            description: categoryPage.meta_description || categoryPage.page_description,
            keywords: categoryPage.meta_keywords || [],
            openGraph: {
                title: categoryPage.meta_title || categoryPage.page_title,
                description: categoryPage.meta_description || categoryPage.page_description,
                url: categoryPage.canonical_url || `https://yourdomain.com/tools/${category}`,
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: categoryPage.meta_title || categoryPage.page_title,
                description: categoryPage.meta_description || categoryPage.page_description,
            },
            alternates: {
                canonical: categoryPage.canonical_url || `https://yourdomain.com/tools/${category}`,
            },
            robots: {
                index: !categoryPage.noindex,
                follow: !categoryPage.noindex,
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: `${category.replace(/-/g, " ")} Tools`,
            description: "Browse our collection of free online tools.",
        };
    }
}

export default function Page() {
    return <ToolsClient />;
}