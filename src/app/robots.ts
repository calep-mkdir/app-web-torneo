import type { MetadataRoute } from "next";

import { getOptionalSiteUrl } from "@/lib/env/server";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getOptionalSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"],
      },
    ],
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).toString() : undefined,
  };
}
