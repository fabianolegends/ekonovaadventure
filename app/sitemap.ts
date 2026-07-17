import type { MetadataRoute } from "next";
import { trips } from "./data/trips";

const baseUrl = "https://www.ekonovaadv.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/hiking`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/bike`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sobre`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contato`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const routePaths = Array.from(
    new Set(
      trips
        .map((trip) => trip.href || `/roteiros/${trip.slug}`)
        .filter((path) => path.startsWith("/roteiros/")),
    ),
  );

  const routePages: MetadataRoute.Sitemap = routePaths.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...routePages];
}
