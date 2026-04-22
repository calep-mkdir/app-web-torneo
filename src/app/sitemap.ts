import type { MetadataRoute } from "next";

import { getOptionalSiteUrl } from "@/lib/env/server";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getOptionalSiteUrl();

  if (!siteUrl) {
    return [];
  }

  return [
    {
      url: new URL("/tournaments", siteUrl).toString(),
      changeFrequency: "hourly",
      lastModified: new Date(),
      priority: 1,
    },
  ];
}
