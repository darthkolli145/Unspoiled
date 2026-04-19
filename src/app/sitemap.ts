import type { MetadataRoute } from "next";

import { getBans } from "@/lib/harvest-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://unspoiled.app";
  const states = Array.from(new Set(getBans().map((b) => b.stateId.toLowerCase())));

  return [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/dashboard`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/state`, changeFrequency: "weekly", priority: 0.9 },
    ...states.map((state) => ({
      url: `${baseUrl}/state/${state}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
