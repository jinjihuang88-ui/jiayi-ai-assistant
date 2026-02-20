"use client";

import ChatHeader from "@/components/ChatHeader";
import ChatBox from "@/components/ChatBox";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 推广页：AI 咨询合并在同一页，风格与 /chat 一致。
 * 用于以后推广，不替代 /chat；网站其它功能与数据库不变。
 */
export default function ConsultPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <ChatHeader />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Left: Info Section - 2 columns */}
            <div className={`lg:col-span-2 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                AI 助理在线
              </div>

              {/* Heading */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  AI 加拿大移民咨询
                </span>
              </h1>
              <p className="text-lg text-slate-500 mb-6">
                学签、工签、访客签证、EE移民、省提名 · AI 智能咨询
              </p>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed mb-6">
                基于加拿大移民局（IRCC）官方数据的智能咨询，覆盖学签、工签、访客签证、Express Entry、省提名等路径与条件，帮助您理解可行方向。
              </p>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {[
                  { title: "官方数据驱动", desc: "基于 IRCC 官方公开信息" },
                  { title: "即时对话", desc: "实时 AI 智能回复" },
                  { title: "隐私优先", desc: "不收集敏感个人信息" },
                  { title: "不替代专业判断", desc: "Does not replace professional judgment." },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
                    <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold flex-shrink-0">{i + 1}</span>
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-sm text-slate-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary CTA */}
              <div className="p-5 rounded-xl bg-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-medium text-slate-800">想先了解整体可能性？</span>
                </div>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  去做免费 AI 评估
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right: Chat Box - 3 columns */}
            <div className={`lg:col-span-3 transition-all duration-700 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <ChatBox />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
