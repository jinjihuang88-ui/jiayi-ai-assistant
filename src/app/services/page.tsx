"use client";

import Link from "next/link";
import { useState } from "react";

export default function ServicesPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="bg-white text-slate-900 min-h-screen">
      {/* Header - 与首页/关于一致 */}
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow-lg">
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <Link href="/" className="hidden lg:flex items-center gap-3 shrink-0">
              <img src="/logo.png" alt="加移 Logo" className="h-10 w-10 rounded-lg shadow-md" />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white">加移</span>
                <span className="text-xs text-white/50 font-light">Powered by MapleBridge</span>
              </div>
            </Link>
            <Link href="/" className="lg:hidden flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="加移" className="h-9 w-9 rounded-lg" />
              <span className="font-bold text-white">加移</span>
            </Link>
          </div>
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-5 md:gap-7 text-[15px] font-medium shrink-0">
            <Link href="/" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>首页</span><span className="text-[10px] md:text-xs opacity-60 font-normal">Home</span></Link>
            <Link href="/ircc-news" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>IRCC信息</span><span className="text-[10px] md:text-xs opacity-60 font-normal">IRCC News</span></Link>
            <Link href="/auth/login?redirect=/member/consultants" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>找顾问</span><span className="text-[10px] md:text-xs opacity-60 font-normal">Find Consultants</span></Link>
            <Link href="/services" className="text-white font-medium py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>服务</span><span className="text-[10px] md:text-xs opacity-60 font-normal">Services</span></Link>
            <Link href="/about" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>关于我们</span><span className="text-[10px] md:text-xs opacity-60 font-normal">About</span></Link>
          </nav>
          <div className="flex items-center justify-end gap-2 md:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden p-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="打开菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/auth/login" className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 text-sm font-medium">会员登录</Link>
              <Link href="/rcic/login" className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 text-sm font-medium">顾问登录 / 注册</Link>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700/50 bg-[#1E293B] px-6 py-4 flex flex-col gap-2">
            <Link href="/" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>首页</Link>
            <Link href="/ircc-news" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>IRCC信息</Link>
            <Link href="/auth/login?redirect=/member/consultants" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>找顾问</Link>
            <Link href="/services" className="text-white font-medium py-2" onClick={() => setMenuOpen(false)}>服务</Link>
            <Link href="/about" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>关于我们</Link>
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <Link href="/auth/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm" onClick={() => setMenuOpen(false)}>会员登录</Link>
              <Link href="/rcic/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm" onClick={() => setMenuOpen(false)}>顾问登录 / 注册</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
            加拿大移民与签证服务
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-6">
            学签、工签、访客签证、EE移民、省提名 · Services
          </p>
          <p className="text-xl md:text-2xl text-slate-700 mb-2">
            为移民与签证决策提供结构化技术支持
          </p>
          <p className="text-lg text-slate-500 mb-10">
            Technology for Immigration & Visa Decision-Making
          </p>
          <p className="text-slate-600 mb-1">
            jiayi 为加拿大移民、学签、工签、访客签证等申请提供信息整理与持牌顾问实践管理支持。
          </p>
          <p className="text-sm text-slate-500 mb-1">
            jiayi provides software infrastructure for information organization and professional practice management.
          </p>
          <p className="text-slate-600 mb-1">
            平台不提供移民或法律服务。
          </p>
          <p className="text-sm text-slate-500">
            The platform does not provide immigration or legal services.
          </p>
        </div>
      </section>

      {/* 01 - AI 信息整理系统 */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8 md:gap-12">
            <div className="shrink-0 text-slate-300 font-mono text-2xl md:text-3xl tracking-tight">
              01
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                AI 信息整理系统
              </h2>
              <p className="text-slate-500 mb-8">AI Structured Intake</p>
              <p className="text-slate-600 font-medium mb-2">功能说明</p>
              <p className="text-sm text-slate-500 mb-6">Function overview</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                用于整理申请人提交的信息，并生成结构化摘要。
              </p>
              <p className="text-slate-500 mb-4 text-sm leading-relaxed">
                Organizes applicant-submitted information and produces structured summaries.
              </p>
              <p className="text-slate-600 font-medium mb-3">核心能力</p>
              <p className="text-sm text-slate-500 mb-4">Core capabilities</p>
              <ul className="text-slate-600 space-y-2 text-sm mb-8">
                <li>· 基础信息采集与整理</li>
                <li>· 风险提示标记</li>
                <li>· 路径参考信息结构化</li>
                <li>· AI 生成辅助摘要</li>
              </ul>
              <ul className="text-slate-500 space-y-2 text-xs mb-6">
                <li>· Basic information collection and organization</li>
                <li>· Risk indicator tagging</li>
                <li>· Structured path reference information</li>
                <li>· AI-assisted summary generation</li>
              </ul>
              <p className="text-sm text-slate-500 border-l-2 border-slate-200 pl-4">
                该模块仅用于信息整理，不构成法律建议或资格判断。
              </p>
              <p className="text-xs text-slate-400 mt-2 border-l-2 border-slate-200 pl-4">
                This module is for information organization only; it does not constitute legal advice or eligibility determination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 02 - 专业实践管理系统 */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8 md:gap-12">
            <div className="shrink-0 text-slate-300 font-mono text-2xl md:text-3xl tracking-tight">
              02
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                专业实践管理系统
              </h2>
              <p className="text-slate-500 mb-8">Practice Management Infrastructure</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                面向持牌移民顾问的实践管理工具。
              </p>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                Practice management tools for licensed immigration consultants.
              </p>
              <p className="text-slate-600 font-medium mb-3">核心能力</p>
              <p className="text-sm text-slate-500 mb-4">Core capabilities</p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>· 客户资料管理</li>
                <li>· AI 辅助信息审阅</li>
                <li>· 案件流程追踪</li>
                <li>· 文档版本管理</li>
                <li>· 操作日志留存</li>
              </ul>
              <ul className="text-slate-500 space-y-2 text-xs mb-8">
                <li>· Client profile management</li>
                <li>· AI-assisted information review</li>
                <li>· Case workflow tracking</li>
                <li>· Document version control</li>
                <li>· Operation log retention</li>
              </ul>
              <p className="text-sm text-slate-500 border-l-2 border-slate-200 pl-4">
                该系统为专业人士提供工具支持，不干预执业判断。
              </p>
              <p className="text-xs text-slate-400 mt-2 border-l-2 border-slate-200 pl-4">
                The system provides tooling for professionals and does not substitute for professional judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 - 数据与系统安全 */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8 md:gap-12">
            <div className="shrink-0 text-slate-300 font-mono text-2xl md:text-3xl tracking-tight">
              03
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                数据与系统安全
              </h2>
              <p className="text-slate-500 mb-8">Secure Infrastructure</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                平台采用标准化数据安全架构。
              </p>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                The platform uses a standardized data security architecture.
              </p>
              <p className="text-slate-600 font-medium mb-3">安全措施</p>
              <p className="text-sm text-slate-500 mb-4">Security measures</p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>· 数据加密传输</li>
                <li>· 权限分级访问控制</li>
                <li>· 云端安全存储</li>
                <li>· 操作记录与审计机制</li>
              </ul>
              <ul className="text-slate-500 space-y-2 text-xs mb-8">
                <li>· Data encrypted in transit</li>
                <li>· Role-based access control</li>
                <li>· Secure cloud storage</li>
                <li>· Operation logging and audit</li>
              </ul>
              <p className="text-sm text-slate-500 border-l-2 border-slate-200 pl-4">
                客户数据归使用系统的专业人士管理。
              </p>
              <p className="text-xs text-slate-400 mt-2 border-l-2 border-slate-200 pl-4">
                Client data is managed by the professionals who use the system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 - 专业咨询支持环境 */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8 md:gap-12">
            <div className="shrink-0 text-slate-300 font-mono text-2xl md:text-3xl tracking-tight">
              04
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                专业咨询支持环境
              </h2>
              <p className="text-slate-500 mb-8">Professional Engagement Environment</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                平台为申请人与持牌顾问提供结构化咨询环境。
              </p>
              <p className="text-slate-500 mb-6 text-sm leading-relaxed">
                The platform provides a structured engagement environment for applicants and licensed consultants.
              </p>
              <p className="text-slate-600 font-medium mb-3">平台边界</p>
              <p className="text-sm text-slate-500 mb-4">Platform boundaries</p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>· 不代表申请人</li>
                <li>· 不收取移民服务费用</li>
                <li>· 不签署移民服务合同</li>
                <li>· 不保证申请结果</li>
              </ul>
              <ul className="text-slate-500 space-y-2 text-xs mb-8">
                <li>· Does not represent applicants</li>
                <li>· Does not charge for immigration services</li>
                <li>· Does not sign immigration service contracts</li>
                <li>· Does not guarantee application outcomes</li>
              </ul>
              <p className="text-sm text-slate-500 border-l-2 border-slate-200 pl-4">
                所有专业服务由持牌顾问独立提供。
              </p>
              <p className="text-xs text-slate-400 mt-2 border-l-2 border-slate-200 pl-4">
                All professional services are provided independently by licensed consultants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - 科技公司风格声明 */}
      <footer className="py-16 bg-[#1E293B] text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-slate-300 mb-2">
            jiayi 由 MapleBridge Technologies Inc. 开发并运营。
          </p>
          <p className="text-sm text-slate-400">
            jiayi is developed and operated by MapleBridge Technologies Inc.
          </p>
          <p className="text-slate-300 mt-4 mb-2">
            平台仅提供软件基础设施，不提供移民或法律服务。
          </p>
          <p className="text-sm text-slate-400">
            The platform provides software infrastructure only; it does not provide immigration or legal services.
          </p>
        </div>
      </footer>
    </main>
  );
}
