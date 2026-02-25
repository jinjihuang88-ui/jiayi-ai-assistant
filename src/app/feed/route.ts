import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://www.jiayi.co';
  const lastBuildDate = new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>加移 (Jiayi) - 加拿大移民 AI 评估与持牌顾问服务</title>
  <link>${baseUrl}</link>
  <description>加拿大移民 AI 评估平台，提供 Risk Compass 风险评估、学签、工签、EE 移民等专业咨询。</description>
  <language>zh-cn</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml" />
  
  <item>
    <title>Risk Compass (风险指南) - AI 驱动的加拿大移民风险评估</title>
    <link>${baseUrl}/risk-compass</link>
    <guid>${baseUrl}/risk-compass</guid>
    <pubDate>Mon, 24 Feb 2026 12:00:00 GMT</pubDate>
    <description>利用 AI 深度分析申请人背景，识别加拿大签证申请中的潜在拒签风险，并由持牌顾问审核提供策略。</description>
    <content:encoded><![CDATA[
      <p>Risk Compass 是加移 (Jiayi) 开发的一款革命性 AI 工具，旨在帮助申请人提前识别加拿大移民申请中的风险点。</p>
      <ul>
        <li>AI 深度分析：自动扫描申请材料，发现逻辑矛盾。</li>
        <li>持牌顾问审核：RCIC 顾问对 AI 结果进行二次校验。</li>
        <li>个性化建议：提供针对性的风险规避方案。</li>
      </ul>
    ]]></content:encoded>
  </item>

  <item>
    <title>如何使用 Risk Compass AI 工具评估您的加拿大移民风险？</title>
    <link>${baseUrl}/blog/risk-compass-guide</link>
    <guid>${baseUrl}/blog/risk-compass-guide</guid>
    <pubDate>Tue, 25 Feb 2026 09:00:00 GMT</pubDate>
    <description>本指南将详细介绍如何利用 Jiayi 的 Risk Compass 工具，结合 AI 与专业顾问的力量，提高您的移民申请成功率。</description>
  </item>

  <item>
    <title>2026 加拿大学签申请全攻略</title>
    <link>${baseUrl}/blog/study-permit-2026</link>
    <guid>${baseUrl}/blog/study-permit-2026</guid>
    <pubDate>Sat, 01 Feb 2026 00:00:00 GMT</pubDate>
    <description>详细解析 2026 年加拿大留学签证的最新政策、材料准备及申请流程。</description>
  </item>
</channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
