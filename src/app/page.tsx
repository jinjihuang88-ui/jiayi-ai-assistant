"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="bg-slate-50 text-slate-900">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo + Brand */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo.png"
                alt="加移AI助理 Logo"
                className="h-10 w-10 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="font-semibold text-lg tracking-tight">
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                加移AI助理
              </span>
              <span className="ml-2 text-sm font-normal text-slate-400">
                MaplePath AI
              </span>
            </div>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {[
              { href: "/assessment", label: "免费评估", icon: "📊" },
              { href: "/chat", label: "AI 咨询", icon: "💬" },
              { href: "/applications", label: "我的申请", icon: "📋" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative text-slate-600 hover:text-slate-900 transition-colors duration-200 py-2 group"
              >
                <span className="flex items-center gap-1.5">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.icon}</span>
                  {item.label}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <a
              href="/rcic/cases"
              className="text-red-600 font-medium hover:text-red-700 transition-colors duration-200 flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              RCIC 后台
            </a>
          </nav>

          {/* CTA */}
          <a
            href="/applications"
            className="ml-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-medium 
                       hover:from-red-700 hover:to-red-600 transition-all duration-300 
                       shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 
                       hover:-translate-y-0.5 active:translate-y-0"
          >
            开始办理申请
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-orange-500" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-white">
          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm">基于加拿大官方数据</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl">
              <span className="block">AI-Powered</span>
              <span className="block mt-2 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent">
                Immigration Assistant
              </span>
            </h1>

            <p className="text-xl text-white/90 mt-6 max-w-2xl leading-relaxed">
              覆盖加拿大 <span className="font-semibold">留学 · 旅游 · 移民</span> 的 AI 路径评估与申请平台
            </p>

            <p className="text-base text-white/70 mt-3 max-w-2xl">
              从 AI 评估 → 官方表格 → 持牌移民顾问审核，全流程在线完成
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/applications"
                className="group px-8 py-4 rounded-xl bg-white text-red-600 font-semibold 
                           hover:bg-white/95 transition-all duration-300 
                           shadow-2xl shadow-black/20 hover:shadow-3xl
                           hover:-translate-y-1 active:translate-y-0
                           flex items-center gap-2"
              >
                开始办理申请
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/assessment"
                className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-medium 
                           hover:bg-white/10 hover:border-white/50 transition-all duration-300
                           backdrop-blur-sm"
              >
                免费 AI 移民评估
              </a>
              <a
                href="/chat"
                className="px-8 py-4 rounded-xl border-2 border-white/30 text-white font-medium 
                           hover:bg-white/10 hover:border-white/50 transition-all duration-300
                           backdrop-blur-sm flex items-center gap-2"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                AI 咨询
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className={`mt-20 grid grid-cols-3 gap-8 max-w-2xl transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {[
              { value: "10,000+", label: "用户信任" },
              { value: "98%", label: "满意度" },
              { value: "24/7", label: "AI 服务" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Services Section - NEW */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              我们的服务
            </h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
              覆盖留学、旅游、移民全方位签证申请服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 学签 */}
            <a href="/applications/study-permit" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
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
                <div className="mt-4 text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* 访客签证 - NEW */}
            <a href="/applications/visitor-visa" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                {/* NEW Badge */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  NEW
                </div>
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
                <div className="mt-4 text-green-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  立即申请 <span>→</span>
                </div>
              </div>
            </a>

            {/* 工签 */}
            <div className="group cursor-not-allowed">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 
                              opacity-70 relative">
                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-400 text-white text-xs font-bold rounded-full">
                  即将推出
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl">💼</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">工作签证</h3>
                <p className="text-slate-600 text-sm mb-4">Work Permit</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• PGWP 毕业工签</li>
                  <li>• LMIA 雇主担保</li>
                  <li>• 开放式工签</li>
                </ul>
              </div>
            </div>

            {/* 移民 */}
            <div className="group cursor-not-allowed">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 
                              opacity-70 relative">
                <div className="absolute top-4 right-4 px-2 py-1 bg-slate-400 text-white text-xs font-bold rounded-full">
                  即将推出
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl">🍁</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">永久居民</h3>
                <p className="text-slate-600 text-sm mb-4">Permanent Residence</p>
                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• Express Entry 快速通道</li>
                  <li>• 省提名 PNP</li>
                  <li>• 家庭团聚</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visitor Visa Highlight Section - NEW */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <span className="text-lg">✈️</span>
                <span className="text-sm font-medium">新功能上线</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                加拿大访客签证<br />在线申请
              </h2>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">
                无论是旅游观光、探亲访友还是商务出行，我们的 AI 助手都能帮您轻松完成签证申请。
                支持普通访客签证和超级签证（Super Visa）申请。
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: "🏖️", label: "旅游观光" },
                  { icon: "👨‍👩‍👧‍👦", label: "探亲访友" },
                  { icon: "💼", label: "商务访问" },
                  { icon: "⭐", label: "超级签证" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              <a
                href="/applications/visitor-visa"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-green-600 font-semibold 
                           hover:bg-white/95 transition-all duration-300 shadow-2xl hover:-translate-y-1"
              >
                立即申请访客签证
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <h3 className="text-xl font-semibold mb-6">为什么选择我们申请访客签证？</h3>
                <div className="space-y-4">
                  {[
                    { title: "AI 智能填表", desc: "自动引导填写 IMM 5257 表格，避免遗漏" },
                    { title: "即时 AI 咨询", desc: "遇到问题随时询问 AI 助手" },
                    { title: "RCIC 专家审核", desc: "持牌移民顾问把关，提高通过率" },
                    { title: "材料清单指导", desc: "根据您的情况生成个性化材料清单" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-white/70">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            为什么选择我们？
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
            结合 AI 技术与专业移民顾问，为您提供高效、可靠的移民服务
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "🏛️",
              title: "Official Data Sources",
              titleCn: "官方数据驱动",
              desc: "分析基于加拿大移民官网（IRCC）与官方劳工数据",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: "👨‍⚖️",
              title: "Human-in-the-loop",
              titleCn: "专家把关审核",
              desc: "关键节点由持牌移民顾问（RCIC）审核确认",
              color: "from-purple-500 to-pink-500",
            },
            {
              icon: "🤖",
              title: "AI-Driven Workflow",
              titleCn: "智能流程引导",
              desc: "AI 降低门槛，专家把关结果，高效又可靠",
              color: "from-orange-500 to-red-500",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl bg-white border border-slate-200 p-8 
                         shadow-sm hover:shadow-xl transition-all duration-500
                         hover:-translate-y-2"
            >
              {/* Gradient Border on Hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`} />
              
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="font-bold text-lg text-slate-900 mb-1">{item.title}</div>
              <div className="text-sm text-red-600 font-medium mb-3">{item.titleCn}</div>
              <div className="text-sm text-slate-600 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              三步开启移民之旅
            </h2>
            <p className="text-slate-600 mt-4">
              简单、透明、高效的移民申请流程
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-red-300 via-red-500 to-red-300" />

            {[
              {
                step: "01",
                title: "AI 智能评估",
                desc: "回答几个简单问题，AI 分析您的移民可行性",
                icon: "📊",
              },
              {
                step: "02",
                title: "在线填写申请",
                desc: "AI 引导填写官方表格，自动检查完整性",
                icon: "📝",
              },
              {
                step: "03",
                title: "RCIC 专家审核",
                desc: "持牌移民顾问审核确认，确保申请质量",
                icon: "✅",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold flex items-center justify-center mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            准备好开始您的加拿大之旅了吗？
          </h2>
          <p className="text-slate-600 mb-10 text-lg">
            立即开始免费评估，了解最适合您的移民路径
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/assessment"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold 
                         hover:from-red-700 hover:to-red-600 transition-all duration-300 
                         shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30
                         hover:-translate-y-1"
            >
              免费开始评估
            </a>
            <a
              href="/chat"
              className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold 
                         hover:border-red-500 hover:text-red-600 transition-all duration-300"
            >
              咨询 AI 助理
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
                <div>
                  <div className="font-bold text-lg">加移AI助理</div>
                  <div className="text-sm text-slate-400">MaplePath AI</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                基于加拿大官方数据的 AI 移民助理平台，结合人工智能与专业移民顾问，
                为您提供高效、可靠的移民服务。
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/assessment" className="hover:text-white transition-colors">免费评估</a></li>
                <li><a href="/chat" className="hover:text-white transition-colors">AI 咨询</a></li>
                <li><a href="/applications" className="hover:text-white transition-colors">我的申请</a></li>
                <li><a href="/applications/visitor-visa" className="hover:text-white transition-colors">访客签证申请</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>support@maplepath.ai</li>
                <li>周一至周五 9:00-18:00</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} 加移AI助理 · MaplePath AI · AI 辅助信息平台，不构成移民或法律建议
          </div>
        </div>
      </footer>
    </main>
  );
}
