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
  const [menuOpen, setMenuOpen] = useState(false);

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

  /** 找顾问：须经会员登录后进入会员中心找顾问 */
  const consultantLink = user ? "/member/consultants" : `/auth/login?redirect=${encodeURIComponent("/member/consultants")}`;

  /** 自助填写官方表格：须经会员登录后进入会员中心申请列表 */
  const formFillLink = user ? "/member/applications" : `/auth/login?redirect=${encodeURIComponent("/member/applications")}`;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "加移 Jiayi",
    url: "https://www.jiayi.co",
    logo: "https://www.jiayi.co/logo.png",
    description:
      "加移（Jiayi）加拿大移民与持牌顾问服务平台，提供学签、工签、访客签证、EE移民、省提名等移民评估与签证申请支持、顾问匹配与案件管理。",
    email: "support@jiayi.co",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@jiayi.co",
        availableLanguage: ["zh-CN", "en-CA"],
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "加移 Jiayi 加拿大移民学签工签顾问平台",
    url: "https://www.jiayi.co",
    description: "加拿大移民、留学、学签、工签、访客签证、Express Entry、省提名专业评估与持牌移民顾问(RCIC)服务。",
  };

  /** 风险指南针：结构化数据供搜索引擎/富媒体摘要与 AI 调用 */
  const riskCompassToolJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "风险指南针 Risk Compass",
    applicationCategory: "WebApplication",
    url: "https://www.jiayi.co/risk-compass",
    description: "此工具可提供实时的移民评估服务。选择学签、工签、访客签证、Express Entry 或省提名等目标，输入年龄、预算、雅思等条件，获取五维风险概览与可行性参考。",
    offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
  };

  return (
    <main className="bg-white text-slate-900">
      <script
        type="application/ld+json"
        // 仅供搜索引擎使用，不影响前端布局
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, websiteJsonLd, riskCompassToolJsonLd]),
        }}
      />
      {/* Top Nav - 专业导航栏 */}
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow-lg">
        <div className="relative w-full max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          {/* 左侧：首页仅 Logo + 加移，无「返回首页」 */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="/" className="flex items-center gap-3 group shrink-0">
              <img src="/logo.png" alt="加移 Logo" className="h-10 w-10 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300" />
              <div className="flex flex-col">
                <div className="font-bold text-lg tracking-tight text-white">加移</div>
                <div className="text-xs text-white/50 font-light">Powered by MapleBridge</div>
              </div>
            </a>
          </div>

          {/* 中间：导航链接，每项上下排列中文+英文，不换行防重叠 */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center gap-5 md:gap-7 text-[15px] font-medium shrink-0">
            <a href="/" className="text-white hover:text-white/80 transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>首页</span><span className="text-[10px] md:text-xs opacity-60 font-normal">Home</span></a>
            <a href="/ircc-news" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>IRCC信息</span><span className="text-[10px] md:text-xs opacity-60 font-normal">IRCC News</span></a>
            <a href={consultantLink} className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>找顾问</span><span className="text-[10px] md:text-xs opacity-60 font-normal">Find Consultants</span></a>
            <a href="/services" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>服务</span><span className="text-[10px] md:text-xs opacity-60 font-normal">Services</span></a>
            <a href="/about" className="text-white/80 hover:text-white transition-colors py-2 flex flex-col items-center gap-0 whitespace-nowrap"><span>关于我们</span><span className="text-[10px] md:text-xs opacity-60 font-normal">About</span></a>
          </nav>

          {/* 右侧：会员登录、顾问登录，尽量靠右 */}
          <div className="flex items-center justify-end gap-3 shrink-0">
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

          {/* 右侧：登录 / 用户 */}
          <div className="hidden lg:flex items-center gap-3 shrink-0 min-w-0 justify-end">
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
                  会员登录 / 注册
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
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-slate-700/50 bg-[#1E293B] px-6 py-4 flex flex-col gap-2">
            <a href="/" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>首页</a>
            <a href="/ircc-news" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>IRCC信息</a>
            <a href={consultantLink} className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>找顾问</a>
            <a href="/services" className="text-white/90 hover:text-white py-2" onClick={() => setMenuOpen(false)}>服务</a>
            <a href="/about" className="text-white font-medium py-2" onClick={() => setMenuOpen(false)}>关于我们</a>
            {user ? (
              <a href="/member" className="text-white/90 hover:text-white py-2 pt-2 border-t border-white/10" onClick={() => setMenuOpen(false)}>会员中心</a>
            ) : (
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <a href="/auth/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm" onClick={() => setMenuOpen(false)}>会员登录 / 注册</a>
                <a href="/rcic/login" className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm" onClick={() => setMenuOpen(false)}>顾问登录 / 注册</a>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero - 左功能右图片：AI 咨询主视觉，描述问题 + 开始对话 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0 items-stretch">
                {/* 左侧：文案与功能 */}
                <div className="px-6 py-8 md:px-10 md:py-10 flex flex-col">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600 mb-4 w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    与 AI 移民顾问对话 · 免费开始
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                    与 AI 移民顾问对话，在线咨询
                  </h1>
                  <p className="text-base md:text-lg text-slate-600 mb-2">
                    Talk to an AI immigration consultant online now
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    描述您的问题，与 AI 对话获取学签、工签、移民路径的初步建议 · 持牌顾问(RCIC)平台。
                  </p>

                  {/* 主入口卡片：描述问题 + 开始对话 */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 md:p-6 mb-5">
                    <p className="text-slate-600 text-sm mb-3">
                      与 AI 一对一对话，直到您满意。学签、工签、访客签证、Express Entry、省提名等均可咨询。
                    </p>
                    <p className="text-slate-500 text-xs mb-4">
                      Chat with AI for path overview. No retainers. Then connect with a licensed consultant when you’re ready.
                    </p>
                    <a
                      href="/chat"
                      className="block w-full py-4 px-6 rounded-xl bg-[#C62828] text-white font-semibold text-center text-lg hover:bg-[#B71C1C] transition-colors shadow-lg"
                    >
                      开始对话 Start chat
                    </a>
                    <p className="text-xs text-slate-400 mt-3 text-center">
                      点击后进入 AI 顾问对话页 · 平台不提供移民或法律服务，仅供参考
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-start gap-3 text-xs md:text-sm text-slate-600 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      不承诺 100% 成功
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      不强推方案
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      顾问均经平台审核
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-slate-500">
                    想找真人顾问？
                    <a href={consultantLink} className="text-[#C62828] font-medium hover:underline ml-1">
                      去 找顾问 →
                    </a>
                  </p>
                </div>

                {/* 右侧：首页展示图片 */}
                <div className="relative min-h-[220px] md:min-h-[320px] bg-slate-900">
                  <img
                    src="/home-right.png"
                    alt="加移 AI 移民顾问在线咨询示意图"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-slate-900/40 via-slate-900/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get - 仿律师站 */}
      <section className="py-12 md:py-16 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
            What you get 您将获得
          </h2>
          <ul className="grid md:grid-cols-2 gap-6 text-slate-700">
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <div>
                <strong>与 AI 持续对话</strong>
                <p className="text-sm text-slate-500">Chat with AI until you’re satisfied. 学签、工签、移民路径均可问。</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <div>
                <strong>无需预付、无最低消费</strong>
                <p className="text-sm text-slate-500">No retainers or upfront fees. 先对话再决定是否找顾问。</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <div>
                <strong>为您和家庭</strong>
                <p className="text-sm text-slate-500">一人咨询，全家参考。Share the insights with your family.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500 font-bold">✓</span>
              <div>
                <strong>随时需要随时用</strong>
                <p className="text-sm text-slate-500">AI 在线，持牌顾问平台对接。When you need it most.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Trust Section - 为什么选择加移 */}
      <section className="py-20 bg-slate-50">
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
              <div className="w-16 h-16 rounded-xl bg-[#C62828] flex items-center justify-center mb-6 text-white text-2xl font-bold">1</div>
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
              <div className="w-16 h-16 rounded-xl bg-[#1E293B] flex items-center justify-center mb-6 text-white text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">安全</h3>
              <p className="text-sm text-slate-500 mb-4">Secure</p>
              <ul className="text-slate-600 space-y-2 text-sm">
                <li>• 数据加密传输 <span className="text-xs text-slate-400">Data encrypted in transit</span></li>
                <li>• 权限分级访问控制 <span className="text-xs text-slate-400">Role-based access control</span></li>
                <li>• 操作记录留存与审计 <span className="text-xs text-slate-400">Operation logs and audit trail</span></li>
                <li>• 安全云端数据存储 <span className="text-xs text-slate-400">Secure cloud data storage</span></li>
              </ul>
            </div>

            {/* 智能 */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-[#C62828] flex items-center justify-center mb-6 text-white text-2xl font-bold">3</div>
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

      {/* How It Works - 五步流程 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              五个步骤开始专业咨询
            </h2>
            <p className="text-lg md:text-xl text-slate-600">
              From Structured Intake to Professional Engagement
            </p>
          </div>

          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[
              {
                step: "1",
                title: "AI 信息整理",
                titleEn: "Structured AI Intake",
                desc: "填写基础信息，生成结构化摘要。",
                descEn: "Fill in basic info, get a structured summary.",
                icon: "",
              },
              {
                step: "2",
                title: "风险提示与路径分析",
                titleEn: "Risk Indicators & Path Overview",
                desc: "识别潜在风险与可能路径。",
                descEn: "Identify risks and possible paths.",
                icon: "",
              },
              {
                step: "3",
                title: "预约专业咨询",
                titleEn: "Engage a Licensed Consultant",
                desc: "通过平台预约持牌顾问进行咨询。",
                descEn: "Book a licensed consultant through the platform.",
                extra: "查看顾问资料",
                extraEn: "View Licensed Profiles",
                icon: "",
              },
              {
                step: "4",
                title: "专业评估与方案制定",
                titleEn: "Professional Review",
                desc: "持牌顾问独立提供评估与建议。",
                descEn: "Licensed consultant provides independent assessment and advice.",
                icon: "",
              },
              {
                step: "5",
                title: "申请与进度管理",
                titleEn: "Application Management",
                desc: "顾问与客户在系统中管理流程与记录。",
                descEn: "Consultant and client manage process and records in the system.",
                icon: "",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C62828] text-white font-bold flex items-center justify-center mb-4 text-lg">
                  {item.step}
                </div>
                {item.icon ? <div className="text-3xl mb-3">{item.icon}</div> : null}
                <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{item.titleEn}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-1">{item.desc}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-1">{item.descEn}</p>
                {"extra" in item && item.extra && (
                  <>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">{item.extra}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.extraEn}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What can the experts do - 仿律师站 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              移民与签证专家能为您做什么？
            </h2>
            <p className="text-lg text-slate-600">
              What can the immigration experts do for you?
            </p>
            <p className="text-sm text-slate-500 mt-2 max-w-2xl mx-auto">
              保护您的权益、理清下一步、确保材料准确、对接持牌顾问，随时为您服务。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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
              <a href={consultantLink} className="text-[#C62828] font-medium text-sm hover:underline">
                找顾问 →
              </a>
            </div>

            {/* 4. 自助填写官方表格 */}
            <div className="border border-slate-200 rounded-2xl p-8 hover:border-[#C62828] transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-1">自助填写官方表格</h3>
              <p className="text-sm text-slate-500 mb-3">Self-Service Official Forms</p>
              <p className="text-slate-600 mb-2 text-sm leading-relaxed">
                基于加拿大 IRCC 官方提供的表格格式，定期更新最新的表格内容，自助和 AI 协助填写，材料只面向指定的顾问，数据加密安全可靠，节约 50% 的移民成本。
              </p>
              <ul className="text-slate-600 space-y-2 text-sm mb-6">
                <li>• 基于 IRCC 官方表格、定期更新 <span className="text-xs text-slate-400">IRCC forms, regularly updated</span></li>
                <li>• 自助 + AI 协助填写，材料仅对指定顾问可见 <span className="text-xs text-slate-400">Self + AI fill, consultant-only access</span></li>
                <li>• 数据加密安全可靠，节约约 50% 成本 <span className="text-xs text-slate-400">Encrypted & secure, ~50% cost savings</span></li>
              </ul>
              <a href={formFillLink} className="text-[#C62828] font-medium text-sm hover:underline">
                去填写 →
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
            <a href={consultantLink} className="group">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center justify-center">
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
          <div className="grid md:grid-cols-2 gap-8 md:items-stretch">
            {/* 我是用户 */}
            <div className="border-2 border-slate-200 rounded-2xl p-12 hover:border-[#C62828] transition-all duration-300 flex flex-col">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">我是用户</h3>
                <p className="text-sm text-slate-500 mb-4 text-center">I'm a User</p>
                <p className="text-slate-600 mb-1 text-center">我想移民/留学/办理签证</p>
                <p className="text-sm text-slate-400 mb-6 text-center">Immigration / Study / Visa</p>
                <ul className="text-slate-600 space-y-3 mb-6">
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
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>梳理个人背景与条件</span>
                      <p className="text-xs text-slate-400">Sort out personal background and conditions</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>识别潜在风险因素</span>
                      <p className="text-xs text-slate-400">Identify potential risk factors</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>为后续专业咨询做好准备</span>
                      <p className="text-xs text-slate-400">Prepare for subsequent professional consultation</p>
                    </div>
                  </li>
                </ul>
                <p className="text-xs text-slate-500 mb-8">
                  AI 系统仅用于信息整理与风险提示。平台不提供法律意见。
                  <span className="block mt-1 text-slate-400">The AI system is for information organization and risk reminders only. The platform does not provide legal advice.</span>
                </p>
              </div>
              <a
                href="/assessment"
                className="block w-full px-6 py-3 rounded-xl bg-[#C62828] text-white font-semibold text-center
                           hover:bg-[#B71C1C] transition-all duration-300 shadow-lg flex-shrink-0"
              >
                开始评估 →
              </a>
            </div>

            {/* 我是顾问 */}
            <div className="border-2 border-slate-200 rounded-2xl p-12 hover:border-[#1E293B] transition-all duration-300 flex flex-col">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">我是顾问</h3>
                <p className="text-sm text-slate-500 mb-4 text-center">I'm a Consultant</p>
                <p className="text-slate-600 mb-1 text-center">我提供移民/留学/签证服务</p>
                <p className="text-sm text-slate-400 mb-6 text-center">Immigration / Study / Visa Services</p>
                <ul className="text-slate-600 space-y-3 mb-6">
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
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>专业实践管理系统</span>
                      <p className="text-xs text-slate-400">Professional practice management system</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>AI 辅助信息审阅</span>
                      <p className="text-xs text-slate-400">AI-assisted information review</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>客户接案流程管理</span>
                      <p className="text-xs text-slate-400">Client intake & case workflow management</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>安全文档管理</span>
                      <p className="text-xs text-slate-400">Secure document management</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>案件进度与运营可视化</span>
                      <p className="text-xs text-slate-400">Case progress & operations visibility</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span>专为受监管专业环境设计</span>
                      <p className="text-xs text-slate-400">Designed for regulated professional environments</p>
                    </div>
                  </li>
                </ul>
              </div>
              <a
                href="/rcic/cases"
                className="block w-full px-6 py-3 rounded-xl bg-[#1E293B] text-white font-semibold text-center
                           hover:bg-[#0F172A] transition-all duration-300 shadow-lg flex-shrink-0"
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

      {/* Final CTA - B2B */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xl md:text-2xl text-slate-700 mb-2">
            Built for regulated professionals seeking structured practice infrastructure.
          </p>
          <p className="text-lg font-semibold text-slate-900 mb-6">
            Request a demo to learn more.
          </p>
          <p className="text-lg text-slate-600 mb-2">
            专为希望建立结构化管理体系的持牌专业人士打造。
          </p>
          <p className="text-base text-slate-500 mb-10">
            了解 jiayi 如何提升您的实践效率。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/rcic/login"
              className="px-8 py-4 rounded-xl bg-[#1E293B] text-white font-semibold text-lg
                         hover:bg-slate-800 transition-all duration-300 
                         shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Join as Consultant（顾问入驻）
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
                </div>
              </div>
              <div className="text-white/70 text-sm leading-relaxed max-w-md space-y-2 mt-2">
                <p>jiayi 由加拿大科技公司 MapleBridge Technologies Inc. 运营。</p>
                <p>我们专注于为受监管专业行业构建软件基础设施。</p>
                <p>我们构建系统。</p>
                <p>专业人士提供服务。</p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">
                <a href="/about" className="hover:text-white transition-colors">关于我们</a>
              </h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">平台规则</a></li>
                <li><a href="/consultant-standards" className="hover:text-white transition-colors">顾问审核规范</a></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">服务条款</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  微信 / 小红书：
                  <a
                    href="https://www.xiaohongshu.com/user/profile/695e834f0000000014014e39"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    AI_Canada_DIY
                  </a>
                </li>
                <li>邮箱: support@jiayi.co</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 space-y-3">
            <p className="text-center text-sm text-white/60 leading-relaxed max-w-2xl mx-auto">
              jiayi is operated by MapleBridge Technologies Inc., a Canadian technology company.
              The platform provides software infrastructure only and does not offer immigration or legal services.
            </p>
            <p className="text-center text-sm text-white/50">
              © {new Date().getFullYear()} 加移（Jiayi）· Powered by MapleBridge · AI 辅助信息平台，不构成移民或法律建议
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
