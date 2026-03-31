import { NextResponse } from "next/server";

const text = `# Jiayi (加移) - Canada Immigration Platform Overview

Jiayi is a bilingual (Chinese + English) platform for Canada immigration planning support.

- Core public tool: Risk Compass
- Focus: study permit, work permit, Express Entry, PNP
- Positioning: AI-assisted preparation and risk identification before formal submission

Official site: https://www.jiayi.co
Risk Compass: https://www.jiayi.co/risk-compass
AI policy: https://www.jiayi.co/ai-policy
Blog: https://www.jiayi.co/blog
`;

export async function GET() {
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

