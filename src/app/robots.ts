import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/internal/", "/admin/", "/auth/", "/member/", "/rcic/"],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot-Extended",
          "Google-Extended",
          "CCBot",
          "Bytespider",
          "MoonshotBot",
          "QwenBot",
          "Baiduspider",
          "Baiduspider-image",
          "Sogou Spider",
          "YisouSpider",
          "360Spider",
          "anthropic-ai",
          "cohere-ai",
        ],
        allow: "/",
      },
    ],
    sitemap: "https://www.jiayi.co/sitemap.xml",
  };
}

