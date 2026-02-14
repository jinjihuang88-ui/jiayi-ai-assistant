import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const FEED_URL =
  "https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&publishedDate%3E%3D2021-07-23&pick=50&format=atom&atomtitle=Immigration%2C%20Refugees%20and%20Citizenship%20Canada";

type Entry = {
  titleEn: string;
  titleZh: string;
  contentEn: string;
  contentZh: string;
  link: string;
  published: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MYMEMORY_CHUNK = 450;

/** MyMemory 免费翻译（无需 key），单次约 500 字内 */
async function translateMyMemoryChunk(text: string): Promise<string> {
  if (!text || text.length > MYMEMORY_CHUNK) return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`
    );
    if (!res.ok) return text;
    const data = (await res.json()) as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText;
    return translated && translated !== text ? translated : text;
  } catch {
    return text;
  }
}

/** 长文分块用 MyMemory 翻译后拼接 */
async function translateMyMemory(text: string): Promise<string> {
  if (!text) return text;
  if (text.length <= MYMEMORY_CHUNK) return translateMyMemoryChunk(text);
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += MYMEMORY_CHUNK) {
    const chunk = text.slice(i, i + MYMEMORY_CHUNK);
    parts.push(await translateMyMemoryChunk(chunk));
  }
  return parts.join("");
}

async function translate(text: string): Promise<string> {
  if (!text || text.length > 5000) return text;
  const apiKey = process.env.LIBRE_TRANSLATE_API_KEY;
  const url = process.env.LIBRE_TRANSLATE_URL || "https://libretranslate.com";
  // 未配置 key 时直接用 MyMemory，避免公共 LibreTranslate 返回原文
  if (!apiKey) {
    return translateMyMemory(text.slice(0, 2000));
  }
  try {
    const res = await fetch(`${url}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text.slice(0, 5000),
        source: "en",
        target: "zh",
        format: "text",
        api_key: apiKey,
      }),
    });
    if (!res.ok) return await translateMyMemory(text.slice(0, 2000));
    const data = (await res.json()) as { translatedText?: string };
    const out = data.translatedText || text;
    if (out === text) return await translateMyMemory(text.slice(0, 2000));
    return out;
  } catch {
    return await translateMyMemory(text.slice(0, 2000));
  }
}

export async function GET() {
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Jiayi-IRCC-News/1.0 (https://www.jiayi.co)" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch IRCC feed", status: res.status },
        { status: 502 }
      );
    }
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const doc = parser.parse(xml);
    const feed = doc?.feed ?? doc?.rss?.channel;
    if (!feed) {
      return NextResponse.json({ items: [], error: "Invalid feed" }, { status: 200 });
    }
    const rawEntries = feed.entry ?? [];
    const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];
    const items: Entry[] = [];
    const maxItems = 20;
    for (let i = 0; i < Math.min(entries.length, maxItems); i++) {
      const e = entries[i];
      const titleEn =
        (typeof e.title === "string" ? e.title : e.title?.["#text"] ?? e.title?.["#cdata-section"] ?? "") || "Untitled";
      const linkObj = Array.isArray(e.link) ? e.link[0] : e.link;
      const link =
        (typeof linkObj === "object" && linkObj?.["@_href"]) ||
        (typeof e.link === "object" && e.link?.["@_href"]) ||
        "";
      const contentRaw =
        e.content?.["#text"] ?? e.content?.["#cdata-section"] ?? e.summary?.["#text"] ?? e.summary?.["#cdata-section"] ?? "";
      const contentEn = stripHtml(contentRaw).slice(0, 2000) || titleEn;
      const published =
        e.published ?? e.updated ?? e["dc:date"] ?? new Date().toISOString();
      let titleZh = titleEn;
      let contentZh = contentEn;
      try {
        titleZh = await translate(titleEn);
        contentZh = await translate(contentEn.slice(0, 1500));
      } catch {
        // keep English if translate fails
      }
      items.push({
        titleEn,
        titleZh,
        contentEn,
        contentZh,
        link,
        published,
      });
    }
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[ircc-news]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
