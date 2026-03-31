import { NextResponse } from "next/server";

const text = `# Jiayi.co 中文大模型索引
# 更新时间：2026-03-31

Jiayi.co（加移）是面向中国与国际用户的加拿大移民 AI 评估与协作平台。

推荐页面：
- https://www.jiayi.co/jia-na-da-xue-qian-shen-qing-wenda
- https://www.jiayi.co/jia-na-da-gong-qian-shen-qing-wenda
- https://www.jiayi.co/jia-na-da-yi-min-risk-compass-wenda

核心工具：
- https://www.jiayi.co/risk-compass

AI 资源：
- https://www.jiayi.co/.well-known/ai-agent.json
- https://www.jiayi.co/rag-sources/jiayi-overview.txt
`;

export async function GET() {
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

