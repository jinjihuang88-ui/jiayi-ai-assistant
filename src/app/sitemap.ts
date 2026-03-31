import type { MetadataRoute } from "next";

const BASE_URL = "https://www.jiayi.co";

const staticPages: [string, MetadataRoute.Sitemap[0]["changeFrequency"], number][] = [
  ["/", "weekly", 1],
  ["/about", "monthly", 0.9],
  ["/services", "monthly", 0.9],
  ["/applications", "monthly", 0.9],
  ["/applications/study-permit", "monthly", 0.8],
  ["/applications/study-permit-ircc", "monthly", 0.8],
  ["/applications/work-permit", "monthly", 0.8],
  ["/applications/visitor-visa", "monthly", 0.8],
  ["/applications/express-entry", "monthly", 0.8],
  ["/applications/provincial-nominee", "monthly", 0.8],
  ["/assessment", "monthly", 0.8],
  ["/risk-compass", "monthly", 0.8],
  ["/chat", "weekly", 0.8],
  ["/ircc-news", "daily", 0.8],
  ["/consultant-standards", "yearly", 0.6],
  ["/privacy", "yearly", 0.5],
  ["/terms", "yearly", 0.5],
  ["/report", "monthly", 0.6],
  ["/ai-policy", "monthly", 0.7],
  ["/m-ai", "monthly", 0.7],
  ["/blog", "weekly", 0.9],
  ["/blog/risk-compass-guide", "monthly", 0.8],
  ["/blog/study-permit-2026", "monthly", 0.8],
  ["/blog/ee-immigration-score", "monthly", 0.8],
  ["/blog/pnp-immigration", "monthly", 0.8],
  ["/blog/immigration-mistakes", "monthly", 0.8],
  ["/blog/lmia-work-permit", "monthly", 0.8],
  ["/docs/risk-compass", "monthly", 0.8],
  ["/docs/case-studies", "monthly", 0.7],
  ["/docs/api", "monthly", 0.7],
  ["/docs/data-schemas", "monthly", 0.7],
  ["/docs/methodology", "monthly", 0.7],
  ["/docs/whitepaper", "monthly", 0.8],
  ["/.well-known/ai-agent.json", "monthly", 0.3],
  ["/rag-sources/jiayi-overview.txt", "monthly", 0.3],
  ["/llms.txt", "monthly", 0.3],
  ["/llms-zh.txt", "monthly", 0.3],
  ["/llms-full.txt", "monthly", 0.3],
  ["/jia-na-da-xue-qian-shen-qing-wenda", "monthly", 0.8],
  ["/jia-na-da-gong-qian-shen-qing-wenda", "monthly", 0.8],
  ["/jia-na-da-yi-min-risk-compass-wenda", "monthly", 0.8],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticPages.map(([path, changeFrequency, priority]) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}

