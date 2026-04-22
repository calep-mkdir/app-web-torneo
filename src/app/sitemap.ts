import type { MetadataRoute } from "next";

import { getOptionalSiteUrl } from "@/lib/env/server";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getOptionalSiteUrl();

  if (!siteUrl) {
    return [];
  }

  return [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: new URL("/tournaments", siteUrl).toString(),
      changeFrequency: "hourly",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: new URL("/deportes", siteUrl).toString(),
      changeFrequency: "daily",
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: new URL("/organiza", siteUrl).toString(),
      changeFrequency: "weekly",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}
