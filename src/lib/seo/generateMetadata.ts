import { Metadata } from "next";
import { SITE_CONFIG } from "./seo.config";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  image?: string;
}

export function generateSEO({
  title,
  description,
  keywords,
  canonical,
  image,
}: SEOProps): Metadata {
  const metaTitle = title
    ? `${title} | ${SITE_CONFIG.siteName}`
    : SITE_CONFIG.defaultTitle;

  const metaDescription = description || SITE_CONFIG.defaultDescription;

  const url = canonical
    ? `${SITE_CONFIG.siteUrl}${canonical}`
    : SITE_CONFIG.siteUrl;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords || SITE_CONFIG.defaultKeywords,

    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_CONFIG.siteName,
      images: [
        {
          url: image || `${SITE_CONFIG.siteUrl}/default-og.png`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      creator: SITE_CONFIG.twitterHandle,
    },

    alternates: {
      canonical: url,
    },
  };
}
