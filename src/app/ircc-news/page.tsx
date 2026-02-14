"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  titleEn: string;
  titleZh: string;
  contentEn: string;
  contentZh: string;
  link: string;
  published: string;
};

export default function IrccNewsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ircc-news")
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.items) setItems(data.items);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">返回首页</span>
          </Link>
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="加移" className="h-10 w-10 rounded-lg" />
            <span className="font-bold text-lg text-white">加移</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">IRCC 信息</h1>
          <p className="text-slate-600">Immigration, Refugees and Citizenship Canada · 加拿大移民、难民和公民部最新动态</p>
          <p className="text-sm text-slate-500 mt-2">数据来自加拿大政府开放 API，约每小时更新</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-2 border-[#C62828] border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-6 text-center">
            {error}，请稍后重试或返回首页。
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl bg-slate-100 text-slate-600 p-10 text-center">暂无新闻条目</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="space-y-6">
            {items.map((item, i) => (
              <article
                key={i}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid md:grid-cols-2 gap-0 divide-x divide-slate-200">
                  <div className="p-6 md:p-8">
                    <div className="text-xs text-slate-400 mb-2">{formatDate(item.published)}</div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3 leading-snug">{item.titleEn}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.contentEn}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-sm text-[#C62828] hover:underline"
                      >
                        阅读原文 →
                      </a>
                    )}
                  </div>
                  <div className="p-6 md:p-8 bg-slate-50/50">
                    <div className="text-xs text-slate-400 mb-2">中文</div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-3 leading-snug">{item.titleZh}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.contentZh}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
