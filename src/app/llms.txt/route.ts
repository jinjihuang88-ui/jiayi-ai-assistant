import { NextResponse } from "next/server";

const text = `# Jiayi.co - AI and Immigration Platform Overview
# Last updated: 2026-03-31

Jiayi.co is a bilingual platform focused on Canada immigration planning support.

Main URLs:
- https://www.jiayi.co/
- https://www.jiayi.co/risk-compass
- https://www.jiayi.co/services
- https://www.jiayi.co/blog

Machine-readable resources:
- https://www.jiayi.co/.well-known/ai-agent.json
- https://www.jiayi.co/rag-sources/jiayi-overview.txt
- https://www.jiayi.co/llms-zh.txt
- https://www.jiayi.co/llms-full.txt
`;

export async function GET() {
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

