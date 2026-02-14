import type { MetadataRoute } from "next";

const BASE_URL = "https://www.jiayi.co";

/** 静态页面配置：path, changeFrequency, priority */
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
  ["/chat", "weekly", 0.8],
  ["/ircc-news", "daily", 0.8],
  ["/consultant-standards", "yearly", 0.6],
  ["/privacy", "yearly", 0.5],
  ["/terms", "yearly", 0.5],
  ["/report", "monthly", 0.6],
  ["/auth/login", "yearly", 0.5],
  ["/auth/register", "yearly", 0.5],
  ["/auth/verify", "yearly", 0.4],
  ["/auth/resend-verification", "yearly", 0.4],
  ["/auth/rcic/register", "yearly", 0.5],
  ["/member/consultants", "weekly", 0.7],
  ["/member/applications", "weekly", 0.6],
  ["/rcic/login", "yearly", 0.4],
  ["/rcic/register", "yearly", 0.5],
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

