"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface RCIC {
  id: string;
  name: string;
  licenseNo: string;
}

interface Application {
  id: string;
  type: string;
  typeName: string;
  status: string;
  submittedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
  };
  documents: any[];
  _count: {
    messages: number;
  };
}

interface Stats {
  pending: number;
  underReview: number;
  needsRevision: number;
  approved: number;
}

function RCICCasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [rcic, setRcic] = useState<RCIC | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState(statusFilter || "all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    checkAuth();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (rcic) {
      fetchCases();
    }
  }, [currentFilter, rcic]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/rcic/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/rcic/login");
        return;
      }

      setRcic(data.rcic);
    } catch (error) {
      router.push("/rcic/login");
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilter !== "all") {
        params.set("status", currentFilter);
      }

      const res = await fetch(`/api/rcic/cases?${params}`);
      const data = await res.json();

      if (data.success) {
        setApplications(data.applications);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/rcic/auth/logout", { method: "POST" });
    router.push("/rcic/login");
  };

  const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
    submitted: { label: "待审核", color: "text-yellow-400", bgColor: "bg-yellow-500" },
    under_review: { label: "审核中", color: "text-blue-400", bgColor: "bg-blue-500" },
    needs_revision: { label: "需修改", color: "text-orange-400", bgColor: "bg-orange-500" },
    approved: { label: "已通过", color: "text-green-400", bgColor: "bg-green-500" },
    rejected: { label: "已拒绝", color: "text-red-400", bgColor: "bg-red-500" },
  };

  const typeIconMap: Record<string, string> = {
    "study-permit": "",
    "visitor-visa": "",
    "work-permit": "",
    "express-entry": "",
    "provincial-nominee": "",
  };

  const filters = [
    { key: "all", label: "全部", count: (stats?.pending || 0) + (stats?.underReview || 0) + (stats?.needsRevision || 0) },
    { key: "submitted", label: "待审核", count: stats?.pending || 0 },
    { key: "under_review", label: "审核中", count: stats?.underReview || 0 },
    { key: "needs_revision", label: "需修改", count: stats?.needsRevision || 0 },
    { key: "approved", label: "已通过", count: stats?.approved || 0 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              返回首页
            </a>
            <a href="/rcic/dashboard" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-lg" />
              <div>
                <span className="font-semibold text-white">加移AI助理</span>
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-emerald-600 text-white">RCIC</span>
              </div>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/rcic/dashboard" className="text-slate-400 hover:text-white transition-colors">仪表板</a>
            <a href="/rcic/cases" className="text-emerald-400 font-medium">案件管理</a>
            <a href="/rcic/messages" className="text-slate-400 hover:text-white transition-colors">消息</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {rcic?.name}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
              案
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">案件管理</h1>
              <p className="text-slate-400">查看和审核用户提交的移民申请</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: "待审核", value: stats?.pending || 0, color: "from-yellow-500 to-orange-500", icon: "待" },
            { label: "审核中", value: stats?.underReview || 0, color: "from-blue-500 to-cyan-500", icon: "审" },
            { label: "需修改", value: stats?.needsRevision || 0, color: "from-orange-500 to-red-500", icon: "改" },
            { label: "已通过", value: stats?.approved || 0, color: "from-green-500 to-emerald-500", icon: "过" },
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

        {/* Filters */}
        <div className={`flex gap-2 mb-6 overflow-x-auto pb-2 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setCurrentFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                currentFilter === filter.key
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {filter.label}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Cases List */}
        <div className={`bg-slate-800/30 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-2xl font-bold mx-auto mb-4">
                无
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">暂无案件</h3>
              <p className="text-slate-400 max-w-md mx-auto">
                当用户提交申请后，案件将显示在这里等待您的审核
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {applications.map((app) => (
                <a
                  key={app.id}
                  href={`/rcic/cases/${app.id}`}
                  className="flex items-center gap-4 p-5 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-2xl">
                    {typeIconMap[app.type] || app.typeName?.charAt(0) || "申"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white">{app.typeName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusMap[app.status]?.bgColor || "bg-slate-500"}`}>
                        {statusMap[app.status]?.label || app.status}
                      </span>
                      {app._count.messages > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white animate-pulse">
                          {app._count.messages} 条新消息
                        </span>
                      )}
                      {app.documents.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-600 text-slate-300">
                          附 {app.documents.length} 个附件
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">
                      <span className="font-medium text-slate-300">{app.user.name || "未设置姓名"}</span>
                      <span className="mx-2">·</span>
                      <span>{app.user.email}</span>
                      {app.user.phone && (
                        <>
                          <span className="mx-2">·</span>
                          <span>{app.user.phone}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      申请编号: {app.id.slice(0, 8).toUpperCase()} · 提交于 {new Date(app.submittedAt).toLocaleString("zh-CN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-sm font-medium">
                      查看详情
                    </span>
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RCICCasesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载案件列表...</p>
        </div>
      </div>
    }>
      <RCICCasesContent />
    </Suspense>
  );
}
