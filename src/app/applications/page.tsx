"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const applications = [
  {
    id: "study-permit",
    title: "学签申请",
    titleEn: "Study Permit",
    desc: "官方表格 IMM 1294 · AI 引导填写",
    icon: "🎓",
    color: "from-blue-500 to-cyan-500",
    status: "available",
    href: "/applications/study-permit",
    features: ["AI 智能填写", "实时校验", "RCIC 审核"],
  },
  {
    id: "visitor-visa",
    title: "访客签证",
    titleEn: "Visitor Visa",
    desc: "官方表格 IMM 5257 · 旅游/探亲/商务",
    icon: "✈️",
    color: "from-green-500 to-emerald-500",
    status: "available",
    href: "/applications/visitor-visa",
    features: ["旅游签证", "探亲签证", "超级签证"],
  },
  {
    id: "express-entry",
    title: "EE 技术移民",
    titleEn: "Express Entry",
    desc: "官方表格 IMM 0008/5669/5406 · FSW/CEC/FST",
    icon: "🚀",
    color: "from-purple-500 to-pink-500",
    status: "available",
    href: "/applications/express-entry",
    features: ["联邦技术移民", "加拿大经验类", "联邦技工类"],
    isNew: true,
  },
  {
    id: "pnp",
    title: "省提名项目",
    titleEn: "Provincial Nominee",
    desc: "官方表格 IMM 0008/5669/5406 · 各省移民项目",
    icon: "🏛️",
    color: "from-orange-500 to-red-500",
    status: "available",
    href: "/applications/provincial-nominee",
    features: ["省份匹配", "职业分析", "条件评估"],
    isNew: true,
  },
  {
    id: "work-permit",
    title: "工签申请",
    titleEn: "Work Permit",
    desc: "官方表格 IMM 1295 · LMIA/开放工签",
    icon: "💼",
    color: "from-indigo-500 to-purple-500",
    status: "available",
    href: "/applications/work-permit",
    features: ["开放式工签", "雇主指定工签", "LMIA 指导"],
    isNew: true,
  },
];

function backConfig(from: string | null) {
  if (from === "member") return { href: "/member", label: "返回会员中心" };
  if (from === "rcic") return { href: "/rcic/dashboard", label: "返回顾问后台" };
  if (from === "team") return { href: "/team/dashboard", label: "返回团队后台" };
  return { href: "/", label: "返回首页" };
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const [isLoaded, setIsLoaded] = useState(false);
  const back = backConfig(from);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const appendFrom = (path: string) => {
    if (!from) return path;
    return path + (path.includes("?") ? "&" : "?") + "from=" + encodeURIComponent(from);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={back.href} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {back.label}
            </a>
            <a href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-lg" />
              <span className="font-semibold text-slate-900">加移AI助理</span>
            </a>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/assessment" className="text-slate-600 hover:text-slate-900 transition-colors">免费评估</a>
            <a href="/chat" className="text-slate-600 hover:text-slate-900 transition-colors">AI 咨询</a>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className={`mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">我的申请</h1>
          <p className="text-lg text-slate-600">
            选择您需要办理的移民申请类型，AI 将全程引导您完成
          </p>
        </div>

        {/* Applications Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {applications.map((app, index) => (
            <div
              key={app.id}
              className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div 
                className={`
                  relative bg-white rounded-2xl border overflow-hidden
                  transition-all duration-300 group
                  ${app.status === 'available' 
                    ? 'border-slate-200 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer' 
                    : 'border-slate-100 opacity-75'
                  }
                `}
              >
                {/* Status Badge */}
                {app.status === 'coming' && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">
                    即将上线
                  </div>
                )}
                {app.status === 'available' && !app.isNew && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    可用
                  </div>
                )}
                {app.isNew && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold">
                    NEW
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${app.color}`} />

                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {app.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-slate-900">{app.title}</h2>
                      <p className="text-sm text-slate-500">{app.titleEn}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 mb-4">{app.desc}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {app.features.map((feature, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  {app.status === 'available' ? (
                    <a
                      href={appendFrom(app.href)}
                      className={`
                        w-full py-3 rounded-xl bg-gradient-to-r ${app.color} text-white font-semibold
                        flex items-center justify-center gap-2
                        hover:shadow-lg transition-all duration-300
                      `}
                    >
                      开始 / 继续填写
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-medium cursor-not-allowed"
                    >
                      敬请期待
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className={`mt-12 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">不确定选择哪个？</h3>
                <p className="text-sm text-slate-600">AI 助理可以帮您分析最适合的移民路径</p>
              </div>
            </div>
            <a
              href="/chat"
              className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:border-red-500 hover:text-red-600 transition-all duration-300 flex items-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              咨询 AI 助理
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-red-500" />
      </main>
    }>
      <ApplicationsContent />
    </Suspense>
  );
}
