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
                siteName: "Fusion Tools",
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

        };
    } catch (error) {
        console.error("Error generating tool page metadata:", error);
        return {
            title: `${slug.replace(/-/g, " ")} Tool`,
            description: "Free online tool",
        };
    }
}

// ── Structured Data Builders ────────────────────────────────────────────────

/**
 * Build the full JSON-LD `@graph` array.
 * Keeps SoftwareApplication, FAQPage and BreadcrumbList as separate entities
 * so Google can parse each rich-result type independently.
 */
function buildStructuredData(
    tool: any,
    category: string,
    slug: string,
    baseUrl: string,
) {
    // If the tool already has custom schema_markup from the CMS, use it as-is
    if (tool.schema_markup) return tool.schema_markup;

    const toolUrl = `${baseUrl}/tools/${category}/${slug}`;
    const graph: Record<string, unknown>[] = [];

    // ── 1. SoftwareApplication ──────────────────────────────────────────────
    const app: Record<string, unknown> = {
        "@type": "SoftwareApplication",
        "name": tool.title,
        "description": tool.short_description || tool.page_intro,
        "url": toolUrl,
        "applicationCategory": "WebApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
        },
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
    };

    if (tool.rating) {
        app.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": tool.rating,
            "ratingCount": tool.users_count || 1,
            "bestRating": "5",
            "worstRating": "1",
        };
    }

    if (tool.users_count) {
        app.interactionStatistic = {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/UseAction",
            "userInteractionCount": tool.users_count,
        };
    }

    graph.push(app);

    // ── 2. FAQPage (separate entity) ────────────────────────────────────────
    if (tool.faqs && tool.faqs.length > 0) {
        graph.push({
            "@type": "FAQPage",
            "mainEntity": tool.faqs.map((faq: any) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                },
            })),
        });
    }

    // ── 3. BreadcrumbList ────────────────────────────────────────────────────
    const categoryName = category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    graph.push({
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl,
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Tools",
                "item": `${baseUrl}/tools`,
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": categoryName,
                "item": `${baseUrl}/tools/${category}`,
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": tool.title,
                "item": toolUrl,
            },
        ],
    });

    return {
        "@context": "https://schema.org",
        "@graph": graph,
    };
}

export default async function Page({ params }: PageProps) {
    const { category, slug } = await params;

    const tool = await fetchToolPageServer(category, slug);

    if (!tool) return notFound();

    // Build structured data for injection as a proper <script> tag
    const baseUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "https://fusiontools.in/";
    const structuredData = buildStructuredData(tool, category, slug, baseUrl);

    return (
        <>
            {/* JSON-LD Structured Data — must be a <script> tag, NOT metadata.other */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <ToolPageClient
                tool={tool}
                category={category}
                slug={slug}
            />
        </>
    );
}