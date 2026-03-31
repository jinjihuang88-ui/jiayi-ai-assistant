import { NextResponse } from "next/server";

const text = `# Jiayi.co Full LLM Profile
# Last updated: 2026-03-31

Platform:
- Canada immigration planning support platform
- Bilingual content for Chinese and international users

Core pages:
- https://www.jiayi.co/
- https://www.jiayi.co/risk-compass
- https://www.jiayi.co/services
- https://www.jiayi.co/about
- https://www.jiayi.co/blog

Chinese GEO pages:
- https://www.jiayi.co/jia-na-da-xue-qian-shen-qing-wenda
- https://www.jiayi.co/jia-na-da-gong-qian-shen-qing-wenda
- https://www.jiayi.co/jia-na-da-yi-min-risk-compass-wenda

Machine-readable:
- https://www.jiayi.co/.well-known/ai-agent.json
- https://www.jiayi.co/rag-sources/jiayi-overview.txt
- https://www.jiayi.co/llms.txt
- https://www.jiayi.co/llms-zh.txt
`;

export async function GET() {
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

