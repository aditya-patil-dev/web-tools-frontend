import { MetadataRoute } from "next";

const SITE_URL = process.env.FRONTEND_URL || "https://nextgenaitools.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  //   Later this will come from API
  //   const res = await fetch(`${process.env.API_URL}/tools?status=active`, {
  //     cache: "no-store",
  //   });
  //   const tools = await res.json();

  const tools = [
    {
      category: "image-tools",
      slug: "jpg-to-pdf-converter",
      updatedAt: new Date(),
    },
    {
      category: "image-tools",
      slug: "png-to-jpg",
      updatedAt: new Date(),
    },
  ];

  const toolUrls = tools.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.category}/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...toolUrls,
  ];
}
