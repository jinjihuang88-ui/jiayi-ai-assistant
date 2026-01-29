"use client";

import { useEffect, useState } from "react";
import { Application } from "@/types/application";

export default function RcicCasesPage() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("current_application");
    if (raw) {
      setApplication(JSON.parse(raw));
    }
    setIsLoaded(true);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return { color: "bg-yellow-100 text-yellow-700", label: "待审核", icon: "⏳" };
      case "needs_revision":
        return { color: "bg-red-100 text-red-700", label: "需修改", icon: "⚠️" };
      case "approved":
        return { color: "bg-green-100 text-green-700", label: "已通过", icon: "✅" };
      default:
        return { color: "bg-slate-100 text-slate-700", label: "草稿", icon: "📝" };
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-lg" />
            <div>
              <span className="font-semibold text-white">加移AI助理</span>
              <span className="ml-2 px-2 py-0.5 rounded text-xs bg-red-600 text-white">RCIC</span>
            </div>
          </a>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              在线
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className={`mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
              👨‍⚖️
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">RCIC 审核后台</h1>
              <p className="text-slate-400">持牌移民顾问案件管理系统</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: "待审核", value: application ? "1" : "0", color: "from-yellow-500 to-orange-500", icon: "⏳" },
            { label: "需修改", value: "0", color: "from-red-500 to-pink-500", icon: "⚠️" },
            { label: "已通过", value: "0", color: "from-green-500 to-emerald-500", icon: "✅" },
            { label: "总计", value: application ? "1" : "0", color: "from-blue-500 to-cyan-500", icon: "📊" },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Cases List */}
        <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">待审核案件</h2>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors">
                刷新
              </button>
            </div>
          </div>

          {!application ? (
            <div className="bg-slate-800/30 backdrop-blur rounded-2xl border border-slate-700/50 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-4xl mx-auto mb-4">
                📭
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无待审核案件</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                当用户提交申请后，案件将显示在这里等待您的审核
              </p>
            </div>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                      🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">学签申请</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(application.status).color}`}>
                          {getStatusBadge(application.status).icon} {getStatusBadge(application.status).label}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">IMM 1294 · Study Permit Application</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {application.id}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {application.fields?.length || 0} 个字段
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/rcic/cases/${application.id}`}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium 
                               hover:from-red-600 hover:to-orange-600 transition-all duration-300
                               shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30
                               flex items-center gap-2"
                  >
                    开始审核
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>审核进度</span>
                  <span>0%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`mt-8 grid grid-cols-3 gap-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { icon: "📋", title: "审核指南", desc: "查看审核标准与流程" },
            { icon: "📚", title: "政策更新", desc: "最新移民政策变化" },
            { icon: "💬", title: "客户沟通", desc: "与申请人在线沟通" },
          ].map((action, i) => (
            <div 
              key={i} 
              className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-700/50 p-4 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <h4 className="font-medium text-white mb-1">{action.title}</h4>
              <p className="text-sm text-slate-400">{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
