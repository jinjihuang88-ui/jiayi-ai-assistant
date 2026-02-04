"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  profile: {
    familyName: string | null;
    givenName: string | null;
  } | null;
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const displayName = user?.profile?.givenName || user?.name || user?.email?.split("@")[0] || "";

  const handleApplyClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!user) {
      e.preventDefault();
      window.location.href = `/auth/login?redirect=${encodeURIComponent(href)}`;
    }
  };

  return (
    <main className="bg-white text-slate-900">
      {/* Top Nav - 专业导航栏 */}
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-12 py-4 flex items-center justify-between">
          
          {/* Logo + Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="加移 Logo"
                className="h-10 w-10 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300"
              />
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-lg tracking-tight text-white">
                加移<span className="text-white/70 text-base ml-1 font-normal">(Jiayi)</span>
              </div>
              <div className="text-xs text-white/50 font-light">
                Powered by MapleBridge
              </div>
            </div>
          </a>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
            <a
              href="/"
              className="text-white hover:text-white/80 transition-colors duration-200 py-2"
            >
              首页
            </a>
            <a
              href="/consultants"
              className="text-white/80 hover:text-white transition-colors duration-200 py-2"
            >
              找顾问
            </a>
            <a
              href="/services"
              className="text-white/80 hover:text-white transition-colors duration-200 py-2"
            >
              服务
            </a>
            <a
              href="/about"
              className="text-white/80 hover:text-white transition-colors duration-200 py-2"
            >
              关于我们
            </a>
          </nav>

          {/* Right Side - Auth & CTA */}
          <div className="flex items-center gap-3">
            {isCheckingAuth ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : user ? (
              /* 已登录状态 */
              <a
                href="/member"
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white hidden lg:inline">
                  {displayName}
                </span>
              </a>
            ) : (
              /* 未登录状态 */
              <a
                href="/auth/login"
                className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
              >
                登录
              </a>
            )}
            <a
              href="/assessment"
              className="px-5 py-2.5 rounded-lg bg-[#C62828] text-white text-sm font-semibold 
                         hover:bg-[#B71C1C] transition-all duration-200 
                         shadow-md hover:shadow-lg"
            >
              免费AI初评
            </a>
          </div>
        </div>
      </header>

      {/* Hero - 白色/浅灰背景，移除大面积红色 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            
            {/* 主标题 */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 mb-4">
              加移 · 加拿大移民顾问平台
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-6">
              让选择回到你手里
            </h2>

            {/* 副标题 - 红色强调 */}
            <p className="text-lg md:text-xl text-[#C62828] font-semibold mb-2">
              透明比价 · 顾问审核 · 平台担保
            </p>
            <p className="text-base md:text-lg text-slate-600 mb-10 max-w-3xl mx-auto">
              连接中国用户与加拿大移民、留学、签证顾问
            </p>

            {/* CTA按钮组 */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a
                href="/assessment"
                className="px-8 py-4 rounded-xl bg-[#C62828] text-white font-semibold text-lg
                           hover:bg-[#B71C1C] transition-all duration-300 
                           shadow-lg shadow-red-500/25 hover:shadow-xl
                           hover:-translate-y-1 active:translate-y-0"
              >
                免费AI移民初评
              </a>
              <a
                href="/applications"
                className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-lg
                           hover:border-[#C62828] hover:text-[#C62828] transition-all duration-300"
              >
                找顾问
              </a>
            </div>

            {/* 信任补充 */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>不承诺100%成功</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>不强推方案</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>所有顾问均经过平台审核</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - 为什么选择加移 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              为什么越来越多用户选择加移？
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 透明 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#C62828] flex items-center justify-center mb-6 text-white text-3xl">
                🔍
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">透明</h3>
              <ul className="text-slate-600 space-y-2">
                <li>• 顾问资质公开</li>
                <li>• 服务价格清晰</li>
                <li>• 流程节点可追踪</li>
              </ul>
            </div>

            {/* 安全 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#1E293B] flex items-center justify-center mb-6 text-white text-3xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">安全</h3>
              <ul className="text-slate-600 space-y-2">
                <li>• 平台担保支付</li>
                <li>• 分阶段放款</li>
                <li>• 全程记录可追溯</li>
              </ul>
            </div>

            {/* 智能 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#C62828] flex items-center justify-center mb-6 text-white text-3xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">智能</h3>
              <ul className="text-slate-600 space-y-2">
                <li>• AI初步评估可行性</li>
                <li>• 智能匹配顾问</li>
                <li>• 文书与材料智能检查</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4步流程 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              从评估到递交，只需4步
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "AI初评",
                desc: "填写基本信息，快速了解你的可行性与路径",
                icon: "📊",
              },
              {
                step: "2",
                title: "对比顾问",
                desc: "按经验、价格、评价，自主选择适合你的顾问",
                icon: "👥",
              },
              {
                step: "3",
                title: "平台担保下单",
                desc: "分阶段付款，服务未完成，资金不放行",
                icon: "🛡️",
              },
              {
                step: "4",
                title: "递交&跟进",
                desc: "流程节点清晰，进度实时可查",
                icon: "✅",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C62828] text-white font-bold flex items-center justify-center mb-4 text-lg">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features - 核心功能 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              核心功能
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI移民初评 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI移民初评</h3>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                不是"成功率承诺"，而是理性评估
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 基于真实政策与历史案例</li>
                <li>• 给出路径建议与风险提示</li>
                <li>• 帮你判断"值不值得继续"</li>
              </ul>
              <a href="/assessment" className="text-[#C62828] font-medium text-sm hover:underline">
                立即评估 →
              </a>
            </div>

            {/* 顾问对比与选择 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-3">顾问对比与选择</h3>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                你决定找谁，而不是被推给谁
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 顾问背景清晰展示</li>
                <li>• 成功案例与评价可查</li>
                <li>• 价格与服务范围透明</li>
              </ul>
              <a href="/applications" className="text-[#C62828] font-medium text-sm hover:underline">
                找顾问 →
              </a>
            </div>

            {/* 平台担保与流程管理 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-3">平台担保与流程管理</h3>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                钱和流程，都在你可控范围内
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 资金平台托管</li>
                <li>• 关键节点确认后放款</li>
                <li>• 所有沟通与文件留痕</li>
              </ul>
              <a href="/applications" className="text-[#C62828] font-medium text-sm hover:underline">
                了解更多 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - 保留现有服务展示 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              我们的服务
            </h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
              覆盖留学、旅游、工签、移民全方位签证申请服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 学签 */}
            <a href="/applications/study-permit" onClick={(e) => handleApplyClick(e, '/applications/study-permit')} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">学习签证</h3>
                <p className="text-slate-600 text-sm mb-4">Study Permit (IMM 1294)</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• 留学生签证申请</li>
                  <li>• AI 智能填表引导</li>
                  <li>• RCIC 专家审核</li>
                </ul>
                <div className="mt-4 text-[#C62828] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* 访客签证 */}
            <a href="/applications/visitor-visa" onClick={(e) => handleApplyClick(e, '/applications/visitor-visa')} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✈️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">访客签证</h3>
                <p className="text-slate-600 text-sm mb-4">Visitor Visa (IMM 5257)</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• 旅游 / 探亲 / 商务</li>
                  <li>• 超级签证 Super Visa</li>
                  <li>• 全程 AI 辅助填写</li>
                </ul>
                <div className="mt-4 text-[#C62828] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* 工签 */}
            <a href="/applications/work-permit" onClick={(e) => handleApplyClick(e, '/applications/work-permit')} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">工作签证</h3>
                <p className="text-slate-600 text-sm mb-4">Work Permit (IMM 1295)</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• 开放式工签</li>
                  <li>• 雇主指定工签</li>
                  <li>• LMIA 指导</li>
                </ul>
                <div className="mt-4 text-[#C62828] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* EE 技术移民 */}
            <a href="/applications/express-entry" onClick={(e) => handleApplyClick(e, '/applications/express-entry')} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">EE 技术移民</h3>
                <p className="text-slate-600 text-sm mb-4">Express Entry (IMM 0008)</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• 联邦技术移民 FSW</li>
                  <li>• 加拿大经验类 CEC</li>
                  <li>• 联邦技工类 FST</li>
                </ul>
                <div className="mt-4 text-[#C62828] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* 省提名 */}
            <a href="/applications/provincial-nominee" onClick={(e) => handleApplyClick(e, '/applications/provincial-nominee')} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">省提名项目</h3>
                <p className="text-slate-600 text-sm mb-4">PNP (IMM 0008)</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• 各省移民项目</li>
                  <li>• 省份匹配分析</li>
                  <li>• 职业条件评估</li>
                </ul>
                <div className="mt-4 text-[#C62828] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* 更多服务 */}
            <a href="/applications" className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-slate-400 to-gray-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">查看全部</h3>
                <p className="text-slate-600 text-sm text-center">浏览所有可用的申请类型</p>
                <div className="mt-4 text-[#C62828] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  查看更多 <span>→</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 双入口分流 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 我是用户 */}
            <div className="border-2 border-slate-200 rounded-2xl p-12 hover:border-[#C62828] transition-all duration-300">
              <div className="text-6xl mb-6 text-center">👤</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">我是用户</h3>
              <p className="text-slate-600 mb-6 text-center">我想移民/留学/办理签证</p>
              <ul className="text-slate-600 space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>免费AI评估</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>安全下单</span>
                </li>
              </ul>
              <a
                href="/assessment"
                className="block w-full px-6 py-3 rounded-xl bg-[#C62828] text-white font-semibold text-center
                           hover:bg-[#B71C1C] transition-all duration-300 shadow-lg"
              >
                开始评估 →
              </a>
            </div>

            {/* 我是顾问 */}
            <div className="border-2 border-slate-200 rounded-2xl p-12 hover:border-[#1E293B] transition-all duration-300">
              <div className="text-6xl mb-6 text-center">👨‍💼</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">我是顾问</h3>
              <p className="text-slate-600 mb-6 text-center">我提供移民/留学/签证服务</p>
              <ul className="text-slate-600 space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>获取中国客户</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>建立个人专业主页</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>使用平台工具提升效率</span>
                </li>
              </ul>
              <a
                href="/rcic/cases"
                className="block w-full px-6 py-3 rounded-xl bg-[#1E293B] text-white font-semibold text-center
                           hover:bg-[#0F172A] transition-all duration-300 shadow-lg"
              >
                顾问入驻 →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Safety - 合规与边界 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              清晰的边界，是对用户最好的保护
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200">
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>平台仅提供信息撮合与流程支持</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>具体移民建议由顾问提供并承担责任</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>不承诺结果，不参与材料造假</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>顾问按资质与服务范围分级管理</span>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
              加移由 MapleBridge 提供技术与平台支持
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            不确定要不要移民？
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            先做一次理性的评估。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/assessment"
              className="px-8 py-4 rounded-xl bg-[#C62828] text-white font-semibold text-lg
                         hover:bg-[#B71C1C] transition-all duration-300 
                         shadow-lg shadow-red-500/25 hover:shadow-xl
                         hover:-translate-y-1"
            >
              免费AI移民初评
            </a>
            <a
              href="/applications"
              className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-lg
                         hover:border-[#C62828] hover:text-[#C62828] transition-all duration-300"
            >
              浏览顾问
            </a>
          </div>
        </div>
      </section>

      {/* Footer - 使用Slate Blue背景 */}
      <footer className="bg-[#1E293B] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
                <div>
                  <div className="font-bold text-lg">加移 (Jiayi)</div>
                  <div className="text-sm text-white/60">Powered by MapleBridge</div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                一个让中国用户透明、安全地连接加拿大移民与留学顾问的平台。
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">平台规则</a></li>
                <li><a href="#" className="hover:text-white transition-colors">顾问审核规范</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>微信 / 小红书</li>
                <li>邮箱: support@jiayi.co</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
            © {new Date().getFullYear()} 加移（Jiayi）· Powered by MapleBridge · AI 辅助信息平台，不构成移民或法律建议
          </div>
        </div>
      </footer>
    </main>
  );
}
