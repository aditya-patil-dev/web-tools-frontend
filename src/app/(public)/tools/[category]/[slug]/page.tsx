import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchToolPage } from "@/lib/api-calls/tools.api";
import ToolPageClient from "./ToolPageClient";

type Props = {
    params: Promise<{ category: string; slug: string }>; // Changed to Promise
};

// Generate metadata for SEO (Server Component only)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, slug } = await params; // Await the params

    try {
        const tool = await fetchToolPage(category, slug);

        if (!tool) {
            return {
                title: "Tool Not Found",
                description: "The requested tool could not be found.",
            };
        }

        return {
            title: tool.meta_title || tool.page_title || tool.title,
            description: tool.meta_description || tool.page_intro || tool.short_description || "Free online tool",
            keywords: tool.meta_keywords || tool.tags || [],
            openGraph: {
                title: tool.meta_title || tool.page_title || tool.title,
                description: tool.meta_description || tool.page_intro || tool.short_description || "",
                url: tool.canonical_url || `https://yourdomain.com/tools/${category}/${slug}`,
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: tool.meta_title || tool.page_title || tool.title,
                description: tool.meta_description || tool.page_intro || tool.short_description || "",
            },
            alternates: {
                canonical: tool.canonical_url || `https://yourdomain.com/tools/${category}/${slug}`,
            },
            robots: {
                index: !tool.noindex,
                follow: !tool.noindex,
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: "Tool Not Found",
            description: "The requested tool could not be found.",
        };
    }
}

// Server Component - fetches data and passes to Client Component
export default async function Page({ params }: Props) {
    const { category, slug } = await params; // Await the params

    let tool;
    try {
        tool = await fetchToolPage(category, slug);
    } catch (error) {
        console.error("Error loading tool:", error);
        return notFound();
    }

    if (!tool) {
        return notFound();
    }

    return <ToolPageClient tool={tool} category={category} slug={slug} />;
}