import type { MetadataRoute } from "next";
import { siteConfig } from "@/siteConfig";
import { absoluteUrl, getSiteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: siteConfig.images.slice(0, 12).map((image) => absoluteUrl(image.url)),
    },
  ];
}
