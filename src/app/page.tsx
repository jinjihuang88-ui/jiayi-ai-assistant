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
                加移
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
              首页 <span className="text-xs ml-1 opacity-60">Home</span>
            </a>
            <a
              href="/consultants"
              className="text-white/80 hover:text-white transition-colors duration-200 py-2"
            >
              找顾问 <span className="text-xs ml-1 opacity-60">Find Consultants</span>
            </a>
            <a
              href="/services"
              className="text-white/80 hover:text-white transition-colors duration-200 py-2"
            >
              服务 <span className="text-xs ml-1 opacity-60">Services</span>
            </a>
            <a
              href="/about"
              className="text-white/80 hover:text-white transition-colors duration-200 py-2"
            >
              关于我们 <span className="text-xs ml-1 opacity-60">About</span>
            </a>
          </nav>

          {/* Right Side - 仅保留会员登录、顾问登录 */}
          <div className="flex items-center gap-3">
            {isCheckingAuth ? (
              <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
            ) : user ? (
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
              <>
                <a
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
                >
                  会员登录
                </a>
                <a
                  href="/rcic/login"
                  className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 transition-all duration-200 text-sm font-medium"
                >
                  顾问登录 / 注册
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero - 白色/浅灰背景，移除大面积红色 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            
            {/* 主标题 */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 mb-2">
              加移 · 加拿大移民顾问平台
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-4">
              Jiayi · Canadian Immigration Consultant Platform
            </p>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-2">
              让选择回到你手里
            </h2>
            <p className="text-lg md:text-xl text-slate-500 mb-6">
              Put the Choice Back in Your Hands
            </p>

            {/* 副标题 - 红色强调 */}
            <p className="text-lg md:text-xl text-[#C62828] font-semibold mb-1">
              透明比价 · 顾问审核 · 平台担保
            </p>
            <p className="text-sm md:text-base text-[#C62828]/70 mb-2">
              Transparent Pricing · Verified Consultants · Platform Guarantee
            </p>
            
            <p className="text-base md:text-lg text-slate-600 mb-1 max-w-3xl mx-auto">
              连接中国用户与加拿大移民、留学、签证顾问
            </p>
            <p className="text-sm md:text-base text-slate-500 mb-10 max-w-3xl mx-auto">
              Connecting Chinese Users with Canadian Immigration, Study, and Visa Consultants
            </p>

            {/* CTA：AI初评、AI顾问、找顾问 */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a
                href="/assessment"
                className="px-8 py-4 rounded-xl bg-[#C62828] text-white font-semibold text-lg
                           hover:bg-[#B71C1C] transition-all duration-300 
                           shadow-lg shadow-red-500/25 hover:shadow-xl
                           hover:-translate-y-1 active:translate-y-0"
              >
                AI初评
              </a>
              <a
                href="/chat"
                className="px-8 py-4 rounded-xl bg-slate-800 text-white font-semibold text-lg
                           hover:bg-slate-700 transition-all duration-300 
                           shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                AI顾问
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
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-600">不承诺100%成功</span>
                </div>
                <span className="text-xs text-slate-400">No 100% Success Guarantee</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-600">不强推方案</span>
                </div>
                <span className="text-xs text-slate-400">No Pushy Sales</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-600">所有顾问均经过平台审核</span>
                </div>
                <span className="text-xs text-slate-400">All Consultants Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - 为什么选择加移 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              为什么越来越多用户选择加移？
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              Why More Users Choose Jiayi?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 透明 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#C62828] flex items-center justify-center mb-6 text-white text-3xl">
                🔍
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">透明</h3>
              <p className="text-sm text-slate-500 mb-4">Transparent</p>
              <ul className="text-slate-600 space-y-2 text-sm">
                <li>• 顾问资质公开 <span className="text-xs text-slate-400">Public Consultant Credentials</span></li>
                <li>• 服务价格清晰 <span className="text-xs text-slate-400">Clear Service Pricing</span></li>
                <li>• 流程节点可追踪 <span className="text-xs text-slate-400">Trackable Process Milestones</span></li>
              </ul>
            </div>

            {/* 安全 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#1E293B] flex items-center justify-center mb-6 text-white text-3xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">安全</h3>
              <p className="text-sm text-slate-500 mb-4">Secure</p>
              <ul className="text-slate-600 space-y-2 text-sm">
                <li>• 平台担保支付 <span className="text-xs text-slate-400">Platform-Guaranteed Payment</span></li>
                <li>• 分阶段放款 <span className="text-xs text-slate-400">Milestone-Based Release</span></li>
                <li>• 全程记录可追溯 <span className="text-xs text-slate-400">Full Record Traceability</span></li>
              </ul>
            </div>

            {/* 智能 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#C62828] flex items-center justify-center mb-6 text-white text-3xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">智能</h3>
              <p className="text-sm text-slate-500 mb-4">Intelligent</p>
              <ul className="text-slate-600 space-y-2 text-sm">
                <li>• AI初步评估可行性 <span className="text-xs text-slate-400">AI Feasibility Assessment</span></li>
                <li>• 智能匹配顾问 <span className="text-xs text-slate-400">Smart Consultant Matching</span></li>
                <li>• 文书与材料智能检查 <span className="text-xs text-slate-400">AI-Powered Document Review</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 5步流程 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              只需5步
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              从评估到递交 · From Assessment to Submission
            </p>
          </div>

          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              {
                step: "1",
                title: "AI移民评估报告",
                titleEn: "AI Assessment Report",
                desc: "填写基本信息，获取可行性评估报告",
                descEn: "Fill in basic info for feasibility report",
                icon: "📊",
              },
              {
                step: "2",
                title: "咨询AI助理",
                titleEn: "AI Consultation",
                desc: "与 AI 对话，进一步了解政策与路径",
                descEn: "Chat with AI for policy and path guidance",
                icon: "💬",
              },
              {
                step: "3",
                title: "对比顾问",
                titleEn: "Compare Consultants",
                desc: "按经验、价格、评价，自主选择适合你的顾问",
                descEn: "Choose by experience, price, and reviews",
                icon: "👥",
              },
              {
                step: "4",
                title: "平台担保下单",
                titleEn: "Guaranteed Payment",
                desc: "分阶段付款，服务未完成，资金不放行",
                descEn: "Milestone payments, funds held until completion",
                icon: "🛡️",
              },
              {
                step: "5",
                title: "递交 & 跟进",
                titleEn: "Submit & Track",
                desc: "用户自己填表递交，流程节点清晰，进度实时可查",
                descEn: "User submits by filling forms; clear milestones, real-time tracking",
                icon: "✅",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C62828] text-white font-bold flex items-center justify-center mb-4 text-lg">
                  {item.step}
                </div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{item.titleEn}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-1">{item.desc}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{item.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features - 核心功能 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              核心功能
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              Core Features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 1. AI移民评估报告 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-1">AI移民评估报告</h3>
              <p className="text-sm text-slate-500 mb-3">AI Immigration Assessment</p>
              <p className="text-slate-600 mb-1 text-sm leading-relaxed">
                第一步：理性评估，不是“成功率承诺”
              </p>
              <p className="text-slate-400 mb-4 text-xs leading-relaxed">
                Step 1: Rational assessment
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 基于真实政策与历史案例 <span className="text-xs text-slate-400">Based on real policies</span></li>
                <li>• 给出路径建议与风险提示 <span className="text-xs text-slate-400">Path suggestions & risks</span></li>
                <li>• 帮你判断“值不值得继续” <span className="text-xs text-slate-400">Worth continuing?</span></li>
              </ul>
              <a href="/assessment" className="text-[#C62828] font-medium text-sm hover:underline">
                立即评估 →
              </a>
            </div>

            {/* 2. 咨询AI助理（扣子智能体） */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-1">咨询AI助理</h3>
              <p className="text-sm text-slate-500 mb-3">AI Consultation (Coze)</p>
              <p className="text-slate-600 mb-1 text-sm leading-relaxed">
                第二步：与 AI 对话，进一步了解政策与路径
              </p>
              <p className="text-slate-400 mb-4 text-xs leading-relaxed">
                Step 2: Chat with AI for guidance
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 基于 IRCC 官方数据 <span className="text-xs text-slate-400">IRCC-based</span></li>
                <li>• 即时问答、智能回复 <span className="text-xs text-slate-400">Instant Q&A</span></li>
                <li>• 再咨询真正的顾问 <span className="text-xs text-slate-400">Then consult real consultants</span></li>
              </ul>
              <a href="/chat" className="text-[#C62828] font-medium text-sm hover:underline">
                去咨询AI →
              </a>
            </div>

            {/* 3. 顾问对比与选择（咨询真正的顾问） */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-1">顾问对比与选择</h3>
              <p className="text-sm text-slate-500 mb-3">Consultant Comparison</p>
              <p className="text-slate-600 mb-1 text-sm leading-relaxed">
                第三步：咨询真正的顾问，你决定找谁
              </p>
              <p className="text-slate-400 mb-4 text-xs leading-relaxed">
                You choose, not assigned
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 顾问背景清晰展示 <span className="text-xs text-slate-400">Clear backgrounds</span></li>
                <li>• 成功案例与评价可查 <span className="text-xs text-slate-400">Cases & reviews</span></li>
                <li>• 价格与服务范围透明 <span className="text-xs text-slate-400">Transparent pricing</span></li>
              </ul>
              <a href="/applications" className="text-[#C62828] font-medium text-sm hover:underline">
                找顾问 →
              </a>
            </div>

            {/* 平台担保与流程管理 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-1">平台担保与流程管理</h3>
              <p className="text-sm text-slate-500 mb-3">Platform Guarantee & Process Management</p>
              <p className="text-slate-600 mb-1 text-sm leading-relaxed">
                钱和流程，都在你可控范围内
              </p>
              <p className="text-slate-400 mb-4 text-xs leading-relaxed">
                Money and process under your control
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 资金平台托管 <span className="text-xs text-slate-400">Funds held by platform</span></li>
                <li>• 关键节点确认后放款 <span className="text-xs text-slate-400">Release after milestones</span></li>
                <li>• 所有沟通与文件留痕 <span className="text-xs text-slate-400">All records traceable</span></li>
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              我们的服务
            </h2>
            <p className="text-lg md:text-xl text-slate-600 mb-2">
              Our Services
            </p>
            <p className="text-slate-600 max-w-2xl mx-auto">
              覆盖留学、旅游、工签、移民全方位签证申请服务
            </p>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              Comprehensive visa services for study, travel, work, and immigration
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">我是用户</h3>
              <p className="text-sm text-slate-500 mb-4 text-center">I'm a User</p>
              <p className="text-slate-600 mb-1 text-center">我想移民/留学/办理签证</p>
              <p className="text-sm text-slate-400 mb-6 text-center">Immigration / Study / Visa</p>
              <ul className="text-slate-600 space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span>免费AI评估</span>
                    <p className="text-xs text-slate-400">Free AI Assessment</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span>安全下单</span>
                    <p className="text-xs text-slate-400">Secure Payment</p>
                  </div>
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">我是顾问</h3>
              <p className="text-sm text-slate-500 mb-4 text-center">I'm a Consultant</p>
              <p className="text-slate-600 mb-1 text-center">我提供移民/留学/签证服务</p>
              <p className="text-sm text-slate-400 mb-6 text-center">Immigration / Study / Visa Services</p>
              <ul className="text-slate-600 space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span>获取中国客户</span>
                    <p className="text-xs text-slate-400">Access Chinese Clients</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span>建立个人专业主页</span>
                    <p className="text-xs text-slate-400">Build Professional Profile</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <span>使用平台工具提升效率</span>
                    <p className="text-xs text-slate-400">Use Platform Tools</p>
                  </div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              清晰的边界，是对用户最好的保护
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              Clear Boundaries, Best Protection
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200">
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span>平台仅提供信息撒合与流程支持</span>
                  <p className="text-sm text-slate-400 mt-1">Platform provides matching & process support only</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span>具体移民建议由顾问提供并承担责任</span>
                  <p className="text-sm text-slate-400 mt-1">Consultants provide advice and bear responsibility</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span>不承诺结果，不参与材料造假</span>
                  <p className="text-sm text-slate-400 mt-1">No result guarantee, no document fraud</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-[#C62828] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span>顾问按资质与服务范围分级管理</span>
                  <p className="text-sm text-slate-400 mt-1">Consultants managed by qualification & scope</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-600">加移由 MapleBridge 提供技术与平台支持</p>
              <p className="text-xs text-slate-400 mt-1">Jiayi powered by MapleBridge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            不确定要不要移民？
          </h2>
          <p className="text-lg md:text-xl text-slate-500 mb-4">
            Not Sure About Immigration?
          </p>
          <p className="text-xl text-slate-600 mb-2">
            先做一次理性的评估。
          </p>
          <p className="text-lg text-slate-400 mb-10">
            Start with a rational assessment.
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
