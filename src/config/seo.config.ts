import { Metadata } from "next";

/* ==============================
   Base Site Configuration
================================= */

export const siteConfig = {
    name: "ToolBox - Free Online Toolssss",
    shortName: "FusionTools",
    description:
        "Free online tools for image conversion, PDF editing, text formatting, and more. All tools run in your browser with complete privacy.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
    ogImage: "/images/og-image.jpg",
    twitterHandle: "@yourtoolbox",
    twitterCreator: "@yourtoolbox",
    keywords: [
        "online tools",
        "free tools",
        "image converter",
        "pdf tools",
        "text tools",
        "developer tools",
    ],
};

/* ==============================
   Default Metadata (Root Layout)
================================= */

export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.shortName}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        creator: siteConfig.twitterCreator,
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};

/* ==============================
   Static Pages SEO
================================= */

export const pagesSEO = {
    home: {
        title: "Free Online Tools - Image, PDF, Text & Developer Tools",
        description:
            "100+ free online tools for image conversion, PDF editing, text formatting, SEO optimization, and developer utilities.",
        keywords: [
            "online tools",
            "free tools",
            "image converter",
            "pdf editor",
            "text formatter",
        ],
        url: "/",
        ogImage: "/images/home-og.jpg",
    },

    about: {
        title: "About Us - Our Mission & Story",
        description:
            "Learn about ToolBox and our mission to provide free, privacy-focused online tools.",
        keywords: ["about us", "our mission", "privacy tools"],
        url: "/about",
        ogImage: "/images/about-og.jpg",
    },

    pricing: {
        title: "Pricing - Free & Premium Plans",
        description:
            "Choose the perfect plan. Start free or upgrade to Premium for advanced features.",
        keywords: ["pricing", "plans", "premium tools"],
        url: "/pricing",
        ogImage: "/images/pricing-og.jpg",
    },

    contact: {
        title: "Contact Us - Get in Touch",
        description:
            "Have questions or feedback? Contact our support team.",
        keywords: ["contact", "support", "help"],
        url: "/contact",
        ogImage: "/images/contact-og.jpg",
    },
};

/* ==============================
   Generate Metadata For Static Pages
   (Future API-ready)
================================= */

export function generateStaticPageMetadata(
    page: keyof typeof pagesSEO,
    apiData?: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string[];
        canonical_url?: string;
        noindex?: boolean;
        og_image?: string;
    }
): Metadata {
    const fallback = pagesSEO[page];

    const title = apiData?.meta_title || fallback.title;
    const description = apiData?.meta_description || fallback.description;
    const keywords = apiData?.meta_keywords || fallback.keywords;
    const canonicalUrl =
        apiData?.canonical_url || `${siteConfig.url}${fallback.url}`;

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: "website",
            images: [
                {
                    url: apiData?.og_image || fallback.ogImage || siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: !apiData?.noindex,
            follow: !apiData?.noindex,
        },
    };
}