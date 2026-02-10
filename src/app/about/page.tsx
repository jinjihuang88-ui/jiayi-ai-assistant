"use client";

import Link from "next/link";
import { useState } from "react";

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="bg-white text-slate-900 min-h-screen">
      {/* Header - 与首页一致，小屏显示菜单按钮 */}
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow-lg">
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          {/* 左侧：返回首页 + Logo + 加移，尽量靠左 */}
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
          {/* 中间：仅导航链接，居中；每项中文在左、英文在右 */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-6 md:gap-8 text-[15px] font-medium">
            <Link href="/" className="text-white/80 hover:text-white transition-colors py-2 flex items-center gap-1.5"><span>首页</span><span className="text-xs opacity-60">Home</span></Link>
            <Link href="/auth/login?redirect=/member/consultants" className="text-white/80 hover:text-white transition-colors py-2 flex items-center gap-1.5"><span>找顾问</span><span className="text-xs opacity-60">Find Consultants</span></Link>
            <Link href="/services" className="text-white/80 hover:text-white transition-colors py-2 flex items-center gap-1.5"><span>服务</span><span className="text-xs opacity-60">Services</span></Link>
            <Link href="/about" className="text-white font-medium py-2 flex items-center gap-1.5"><span>关于我们</span><span className="text-xs opacity-60">About</span></Link>
          </nav>
          {/* 右侧：会员登录、顾问登录，尽量靠右 */}
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
        {/* 小屏下拉菜单 */}
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700/50 bg-[#1E293B] px-6 py-4 flex flex-col gap-2">
            <Link href="/" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>首页</Link>
            <Link href="/auth/login?redirect=/member/consultants" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>找顾问</Link>
            <Link href="/services" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>服务</Link>
            <Link href="/about" className="text-white font-medium py-2" onClick={() => setMenuOpen(false)}>关于我们</Link>
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <Link href="/auth/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm" onClick={() => setMenuOpen(false)}>会员登录</Link>
              <Link href="/rcic/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm" onClick={() => setMenuOpen(false)}>顾问登录 / 注册</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero: 保留图片 */}
      <section className="relative w-full min-h-[45vh] bg-[#0f172a] flex items-center justify-center overflow-hidden">
        <img
          src="/about/hero-compass.png"
          alt="jiayi.co — AI Infrastructure for Licensed Immigration Professionals"
          className="w-full h-full min-h-[45vh] object-cover object-center block"
          fetchPriority="high"
        />
      </section>

      {/* Hero 标题区 — 极简留白 */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B1F3B] mb-2 tracking-tight">
            加移 · SaaS 加拿大移民信息与专业服务管理系统
          </h1>
          <p className="text-xl text-[#1F2937]/80">
            jiayi · SaaS Canadian Immigration Information & Professional Services Management System
          </p>
        </div>
      </section>

      {/* 第一段 — 公司简介（两栏：左中文 右 English） */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#0B1F3B] mb-10">公司简介</h2>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div className="space-y-4 text-[#1F2937] leading-relaxed">
              <p>jiayi 是由加拿大科技公司开发并运营的专业 SaaS 平台，提供面向移民决策与实践管理的技术基础设施。</p>
              <p className="font-medium">我们致力于为：</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>有移民意向的个人用户提供结构化信息整理工具</li>
                <li>持牌移民顾问提供专业实践管理系统</li>
              </ul>
              <p>平台不提供移民咨询或法律服务。所有专业服务均由受监管的持牌顾问独立提供。</p>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>jiayi is a professional SaaS platform developed and operated by a Canadian technology company, providing infrastructure to support immigration decision-making and practice management.</p>
              <p className="font-medium">The platform is designed for:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Individuals seeking structured intake support during immigration exploration</li>
                <li>Licensed immigration consultants seeking professional practice tools</li>
              </ul>
              <p>The platform does not provide immigration or legal services. All professional services are independently provided by regulated licensed consultants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 第二段 — 我们构建的基础设施 */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#0B1F3B] mb-12">我们构建的基础设施是什么</h2>
          <div className="space-y-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-[#3B82F6]" aria-hidden />
                <h3 className="text-xl font-semibold text-[#1F2937]">AI 信息整理系统</h3>
              </div>
              <p className="text-sm text-slate-500 mb-2">AI-Assisted Intake</p>
              <p className="text-[#1F2937] mb-4">用于收集申请人提交的信息并进行结构化整理，为后续专业评估做准备。</p>
              <p className="text-slate-600 text-sm mb-4">Helps organize information provided by individuals seeking immigration assessment and prepares it for professional review.</p>
              <ul className="text-[#1F2937] text-sm space-y-2">
                <li>· 结构化客户输入</li>
                <li>· 风险提示标记</li>
                <li>· 自动摘要生成</li>
              </ul>
              <ul className="text-slate-500 text-xs mt-1 space-y-1">
                <li>· Structured client input</li>
                <li>· Risk indicator flags</li>
                <li>· Automated summary generation</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-[#3B82F6]" aria-hidden />
                <h3 className="text-xl font-semibold text-[#1F2937]">顾问实践管理系统</h3>
              </div>
              <p className="text-sm text-slate-500 mb-2">Practice Management for Consultants</p>
              <p className="text-[#1F2937] mb-4">为持牌顾问提供高效、合规的实践管理工具：</p>
              <p className="text-slate-600 text-sm mb-4">Professional-grade tools that support licensed consultants in managing their practice.</p>
              <ul className="text-[#1F2937] text-sm space-y-2">
                <li>· 客户档案管理</li>
                <li>· 流程与案件追踪</li>
                <li>· 文档版本控制</li>
                <li>· 操作日志留存与审计</li>
              </ul>
              <ul className="text-slate-500 text-xs mt-1 space-y-1">
                <li>· Client profile management</li>
                <li>· Case tracking and workflow</li>
                <li>· Document version control</li>
                <li>· Activity audit trails</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-px bg-[#3B82F6]" aria-hidden />
                <h3 className="text-xl font-semibold text-[#1F2937]">安全与数据控制</h3>
              </div>
              <p className="text-sm text-slate-500 mb-2">Secure Data and Access Control</p>
              <p className="text-[#1F2937] mb-4">我们的平台采用企业级安全架构：</p>
              <p className="text-slate-600 text-sm mb-4">We utilize enterprise-level security infrastructure.</p>
              <ul className="text-[#1F2937] text-sm space-y-2">
                <li>· 数据加密传输</li>
                <li>· 权限分级控制</li>
                <li>· 安全云端存储</li>
                <li>· 审计日志记录</li>
              </ul>
              <ul className="text-slate-500 text-xs mt-1 space-y-1">
                <li>· Encrypted data transmission</li>
                <li>· Role-based access control</li>
                <li>· Secure cloud storage</li>
                <li>· Audit logging</li>
              </ul>
              <p className="text-[#1F2937] text-sm mt-4">所有数据归使用系统的用户和顾问所有与管理。</p>
              <p className="text-slate-500 text-xs mt-1">Data is owned and managed by the professional or individual who enters it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 第三段 — 技术边界与责任声明（灰色背景） */}
      <section className="py-16 md:py-24 bg-slate-200/60">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#0B1F3B] mb-8">技术边界与责任声明</h2>
          <p className="text-sm text-slate-500 mb-6">jiayi makes the following role boundary clear:</p>
          <div className="grid md:grid-cols-2 gap-10">
            <ul className="text-[#1F2937] space-y-3 text-sm">
              <li>· jiayi 明确界定平台角色：</li>
              <li>· 不代表申请人与顾问中任意一方</li>
              <li>· 不参与资金托管或交易安排</li>
              <li>· 不签署移民服务合同</li>
              <li>· 不对申请结果做出承诺或保证</li>
              <li>· 平台仅提供技术系统与工具支持。专业服务责任由持牌顾问承担。</li>
            </ul>
            <ul className="text-slate-600 space-y-3 text-sm">
              <li>· The platform does not represent applicants or consultants</li>
              <li>· It does not engage in payment processing or escrow arrangements</li>
              <li>· It does not enter into immigration service contracts</li>
              <li>· It does not guarantee immigration outcomes</li>
              <li>· The platform provides software tools only. Professional liability rests solely with the licensed consultant.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 第四段 — 我们的价值与定位 */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-[#0B1F3B] mb-8">我们的价值与定位</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-4 text-[#1F2937] leading-relaxed text-sm">
              <p>现代移民决策涉及大量结构化信息与流程管理需求。jiayi 的目标是：</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>提供清晰的信息整理基础</li>
                <li>提升顾问实践效率</li>
                <li>为双边用户提供安全合规的系统环境</li>
              </ul>
              <p className="font-medium">我们认为：</p>
              <p>专业判断应由专业人士负责，技术应当提升效率，而不是替代判断。</p>
            </div>
            <div className="space-y-4 text-slate-600 leading-relaxed text-sm">
              <p>Modern immigration decision-making requires structured information intake and efficient practice workflows. jiayi aims to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide clear information infrastructure</li>
                <li>Improve practice efficiency for professionals</li>
                <li>Offer a secure, compliant system for all users</li>
              </ul>
              <p className="font-medium">We believe that:</p>
              <p>Professional judgment should remain with regulated professionals, and technology should enhance efficiency, not replace judgment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 公司信息底栏 */}
      <section className="py-12 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <p className="text-[#1F2937] text-sm">jiayi 由 MapleBridge Technologies Inc. 开发并运营。</p>
          <p className="text-slate-500 text-xs">jiayi is developed and operated by MapleBridge Technologies Inc.</p>
          <p className="text-[#1F2937] text-sm">平台仅提供软件基础设施支持，不提供移民或法律服务。</p>
          <p className="text-slate-500 text-xs">The platform offers software infrastructure only and does not provide immigration or legal services.</p>
        </div>
      </section>

      {/* Footer — 品牌色 #0B1F3B */}
      <footer className="bg-[#0B1F3B] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
                <div>
                  <div className="font-bold text-lg">加移 (Jiayi)</div>
                  <div className="text-sm text-white/60">Powered by MapleBridge</div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                jiayi 由 MapleBridge Technologies Inc. 开发并运营。平台仅提供软件基础设施，不提供移民或法律服务。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">关于 MapleBridge</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">平台规则</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>邮箱: support@jiayi.co</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
            © {new Date().getFullYear()} 加移（Jiayi）· Powered by MapleBridge Technologies Inc.
          </div>
        </div>
      </footer>
    </main>
  );
}
