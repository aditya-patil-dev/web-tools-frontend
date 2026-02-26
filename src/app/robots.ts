import { MetadataRoute } from "next";

const SITE_URL = process.env.FRONTEND_URL;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 🔹 Later fetch from API
  // const res = await fetch(`${process.env.API_URL}/seo/robots`);
  // const data = await res.json();

  const disallowedPaths = ["/admin", "/api"]; // from DB later

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
