"use client";

import ChatHeader from "@/components/ChatHeader";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Coze Chat SDK */}
      <Script
        src="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-ignore
          new window.CozeWebSDK.WebChatClient({
            config: {
              type: "bot",
              bot_id: "7598385173373190195",
            },
            auth: {
              type: "token",
              onRefreshToken: async () => {
                const res = await fetch("/api/coze-token");
                const data = await res.json();
                return data.token;
              },
            },
            ui: {
              asstBtn: {
                isNeed: true,
              },
              base: {
                lang: "zh-CN",
              },
            },
          });
        }}
      />

      <ChatHeader />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-transparent opacity-50" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />

          <div className="relative max-w-5xl mx-auto px-6 py-20">
            {/* Badge */}
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                AI 助理在线
              </div>
            </div>

            {/* Heading */}
            <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  AI 加拿大移民咨询
                </span>
                <span className="block text-2xl md:text-3xl text-slate-500 mt-4 font-normal">
                  AI-Powered Canadian Immigration Consultation
                </span>
              </h1>
            </div>

            {/* Intro */}
            <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="mt-8 text-xl text-slate-600 max-w-2xl leading-relaxed">
                基于加拿大移民局（IRCC）官方公开数据的智能咨询服务，
                帮助你理解可行路径、关键条件以及下一步方向。
              </p>

              <p className="mt-3 text-sm text-slate-500 max-w-2xl leading-relaxed">
                An AI-assisted consultation built on official Canadian public data,
                designed to help you understand viable pathways, key requirements, and next steps.
              </p>
            </div>

            {/* Quick Start Button */}
            <div className={`mt-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button 
                onClick={() => {
                  // Trigger Coze chat button if available
                  const cozeBtn = document.querySelector('[class*="coze"]') as HTMLElement;
                  if (cozeBtn) cozeBtn.click();
                }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold text-lg
                           hover:from-red-700 hover:to-orange-600 transition-all duration-300
                           shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/30
                           hover:-translate-y-1 active:translate-y-0
                           flex items-center gap-3"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                开始 AI 咨询
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <p className="mt-3 text-sm text-slate-500">
                或使用右下角的浮窗按钮
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className={`text-center mb-12 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">为什么选择 AI 咨询？</h2>
            <p className="text-slate-600">智能、高效、隐私优先的移民咨询体验</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "官方数据驱动",
                titleEn: "Official Data–Driven",
                desc: "分析基于 IRCC 及加拿大官方劳工系统的公开信息。",
                descEn: "Analysis based on publicly available data from IRCC and official Canadian labour sources.",
                icon: "🏛️",
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "轻量咨询方式",
                titleEn: "Focused, Step-by-Step",
                desc: "不使用冗长问卷，根据你的问题逐步判断。",
                descEn: "No lengthy forms. Each conversation focuses on one key question at a time.",
                icon: "💬",
                color: "from-purple-500 to-pink-500",
              },
              {
                title: "隐私优先设计",
                titleEn: "Privacy-First Design",
                desc: "不要求上传证件或不必要的个人敏感信息。",
                descEn: "No document uploads or unnecessary personal data required.",
                icon: "🔒",
                color: "from-green-500 to-emerald-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${500 + i * 100}ms` }}
              >
                <div className="group rounded-2xl bg-white border border-slate-200 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="font-bold text-lg text-slate-900 mb-1">{item.title}</div>
                  <div className="text-xs text-red-600 font-medium mb-3">{item.titleEn}</div>
                  <div className="text-sm text-slate-600 leading-relaxed">{item.desc}</div>
                  <div className="text-xs text-slate-400 mt-2 leading-relaxed">{item.descEn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Card */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          <div className={`transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-10 text-white overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold text-xl">AI 咨询已就绪</span>
                  </div>
                  <p className="text-slate-300 mb-2">
                    请使用右下角的 AI 咨询按钮开始对话
                  </p>
                  <p className="text-sm text-slate-400">
                    The AI consultant is ready. Use the chat button in the bottom-right corner to begin.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-300 leading-relaxed">
                    基于加拿大官方公开数据
                    <br />
                    注重隐私与信息安全
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Powered by official Canadian public data
                    <br />
                    Privacy-first by design
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className={`transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-slate-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <p className="text-slate-700 font-medium">想先了解整体可能性？</p>
                  <p className="text-sm text-slate-500">Want a broader overview first?</p>
                </div>
              </div>
              <Link
                href="/assessment"
                className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-medium 
                           hover:border-red-500 hover:text-red-600 transition-all duration-300
                           flex items-center gap-2"
              >
                去做免费 AI 评估
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
