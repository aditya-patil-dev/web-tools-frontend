import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchToolPageServer } from "@/lib/api-calls/tools.api";
import ToolPageClient from "./ToolPageClient";

interface PageProps {
    params: Promise<{ category: string; slug: string }>;
}

// Generate comprehensive SEO metadata for individual tool pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category, slug } = await params;

    try {
        const tool = await fetchToolPageServer(category, slug);

        if (!tool) {
            return {
                title: `${slug.replace(/-/g, " ")} Tool`,
                description: "Free online tool",
            };
        }

        // Get base URL from environment variable
        const baseUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusiontools.in/";

        // Use tool-specific SEO fields with smart fallbacks
        const title = tool.meta_title || tool.page_title || tool.title;
        const description = tool.meta_description || tool.short_description || `Use ${tool.title} - Free online tool`;
        const keywords = tool.meta_keywords || tool.tags || [];
        const canonical = tool.canonical_url || `${baseUrl}/tools/${category}/${slug}`;

        // Build structured data (JSON-LD) for rich snippets
        const structuredData = tool.schema_markup || generateDefaultStructuredData(tool, category, slug, baseUrl);

        return {
            title,
            description,
            keywords,

            // Open Graph
            openGraph: {
                title,
                description,
                url: canonical,
                type: "website",
                siteName: "YourSiteName",
                images: tool.image_url ? [
                    {
                        url: tool.image_url,
                        width: 1200,
                        height: 630,
                        alt: title,
                    }
                ] : [],
            },

            // Twitter Card
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: tool.image_url ? [tool.image_url] : [],
            },

            // Canonical URL
            alternates: {
                canonical,
            },

            // Robots
            robots: {
                index: !tool.noindex,
                follow: !tool.noindex,
                googleBot: {
                    index: !tool.noindex,
                    follow: !tool.noindex,
                },
            },

            // Additional meta tags
            other: {
                // Structured data (JSON-LD)
                "application-ld+json": JSON.stringify(structuredData),
            },
        };
    } catch (error) {
        console.error("Error generating tool page metadata:", error);
        return {
            title: `${slug.replace(/-/g, " ")} Tool`,
            description: "Free online tool",
        };
    }
}

// Generate default structured data if not provided
function generateDefaultStructuredData(tool: any, category: string, slug: string, baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.title,
        "description": tool.short_description || tool.page_intro,
        "url": `${baseUrl}/tools/${category}/${slug}`,
        "applicationCategory": "WebApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
        },
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "aggregateRating": tool.rating ? {
            "@type": "AggregateRating",
            "ratingValue": tool.rating,
            "ratingCount": tool.users_count || 1,
            "bestRating": "5",
            "worstRating": "1",
        } : undefined,
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/UseAction",
            "userInteractionCount": tool.users_count || 0,
        },
        // Add FAQ schema if FAQs exist
        ...(tool.faqs && tool.faqs.length > 0 ? {
            "mainEntity": tool.faqs.map((faq: any) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                }
            }))
        } : {}),
    };
}

export default async function Page({ params }: PageProps) {
    const { category, slug } = await params;

    const tool = await fetchToolPageServer(category, slug);

    if (!tool) return notFound();

    return (
        <ToolPageClient
            tool={tool}
            category={category}
            slug={slug}
        />
    );
}