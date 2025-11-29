import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/auth/", "/api/", "/group/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

