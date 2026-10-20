import { Metadata } from "next";

/* ==============================
   Base Site Configuration
================================= */

export const siteConfig = {
  name: "FusionTools - Free Online Tools",
  shortName: "FusionTools",
  description:
    "Free online tools for image conversion, PDF editing, text formatting, and more. All tools run in your browser with complete privacy.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://fusiontools.in",
  ogImage:
    "https://ik.imagekit.io/7w8ikjsre/logos/ba45e1e8-9be3-4904-b3bf-4e116b228c0f.png",
  twitterHandle: "@fusiontools",
  twitterCreator: "@fusiontools",
  keywords: [
    "online tools",
    "free tools",
    "image converter",
    "pdf tools",
    "developer tools",
    "seo tools",
    "text tools",
    "browser tools",
    "privacy focused tools",
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
    title: "FusionTools – 100% Free Online Image, PDF & Developer Tools",
    description:
      "Discover 30+ free, secure online web tools. Compress images, merge PDFs, format JSON, decode JWTs, and generate SEO tags with zero server uploads and 100% privacy.",
    keywords: [
      "free online tools",
      "web tools",
      "image converter",
      "pdf tools",
      "developer tools",
      "seo tools",
      "privacy tools",
      "in browser tools",
      "fusiontools",
    ],
    url: "/",
    ogImage: "/images/home-og.jpg",
  },

  tools: {
    title: "All Web Tools Directory | Free Image, PDF, Dev & SEO Utilities",
    description:
      "Explore our complete catalog of 34+ free online web tools. Fast, secure utilities for image processing, PDF management, code formatting, and search engine optimization.",
    keywords: [
      "all web tools",
      "free online tools directory",
      "developer utilities",
      "pdf editor online",
      "image tools suite",
      "seo tag generators",
      "free utility toolbox",
    ],
    url: "/tools",
    ogImage: "/images/tools-og.jpg",
  },

  about: {
    title: "About FusionTools – Our Mission for Private & Free Web Tools",
    description:
      "Learn how FusionTools provides fast, zero-upload, client-side web tools for developers, designers, and creators worldwide. 100% privacy and zero paywalls.",
    keywords: [
      "about fusiontools",
      "private online tools",
      "client-side web tools",
      "free tools mission",
      "safe web utilities",
    ],
    url: "/about",
    ogImage: "/images/about-og.jpg",
  },

  pricing: {
    title: "Pricing – Free & Premium Plans | FusionTools",
    description:
      "Explore FusionTools plans. Enjoy generous free access or upgrade for high-capacity batch processing and team workflows.",
    keywords: ["pricing", "plans", "premium tools", "fusiontools pricing"],
    url: "/pricing",
    ogImage: "/images/pricing-og.jpg",
  },

  contact: {
    title: "Contact Us – Get in Touch with FusionTools Support",
    description:
      "Have questions, feature suggestions, or feedback? Get in touch with the FusionTools development team.",
    keywords: ["contact", "support", "help", "fusiontools support"],
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
  },
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
