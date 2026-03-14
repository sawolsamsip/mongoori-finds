import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/cart", "/checkout", "/api/"],
      },
    ],
    sitemap: "https://finds.mongoori.com/sitemap.xml",
    host: "https://finds.mongoori.com",
  };
}
