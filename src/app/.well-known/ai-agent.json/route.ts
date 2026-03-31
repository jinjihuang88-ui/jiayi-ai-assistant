import { NextResponse } from "next/server";

const payload = {
  name: "加移 (Jiayi) AI 移民助手",
  name_en: "Jiayi AI Immigration Assistant",
  description:
    "加移 (Jiayi) 是一个 AI 驱动的加拿大移民评估平台，核心工具 Risk Compass 提供结构化风险识别。",
  description_en:
    "Jiayi is an AI-powered Canada immigration assessment platform. Risk Compass provides structured risk identification.",
  url: "https://www.jiayi.co",
  contact: {
    email: "jiayi@jiayi.co",
    phone: "+1-647-643-4369",
    wechat: "jiayi_canada",
  },
  tools: [
    {
      id: "risk-compass",
      name: "Risk Compass (风险指南)",
      url: "https://www.jiayi.co/risk-compass",
      description: "用于申请前风险识别的 AI 评估工具。",
    },
  ],
  knowledge_sources: [
    "https://www.jiayi.co/blog/risk-compass-guide",
    "https://www.jiayi.co/rag-sources/jiayi-overview.txt",
  ],
  policy: "https://www.jiayi.co/ai-policy",
  supported_languages: ["zh-CN", "en-CA"],
  last_updated: "2026-03-31",
};

export async function GET() {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}

