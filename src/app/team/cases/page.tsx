"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string;
  role: string;
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
  };
  _count: { messages: number };
  assignedToMe?: boolean;
  rcicReviewedAt?: string | null;
}

interface Stats {
  pending: number;
  underReview: number;
  needsRevision: number;
  approved: number;
}

export default function TeamCasesPage() {
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (member) {
      fetchCases();
    }
  }, [currentFilter, assignedToMeOnly, member]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/team/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/team/login");
        return;
      }

      setMember(data.member);
    } catch (error) {
      router.push("/team/login");
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilter !== "all") {
        params.set("status", currentFilter);
      }
      if (assignedToMeOnly) {
        params.set("assignedToMe", "1");
      }

      const res = await fetch(`/api/team/cases?${params}`);
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
    await fetch("/api/team/auth/logout", { method: "POST" });
    router.push("/team/login");
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    submitted: { label: "待审核", color: "bg-yellow-500" },
    under_review: { label: "审核中", color: "bg-blue-500" },
    needs_revision: { label: "需修改", color: "bg-orange-500" },
    approved: { label: "已通过", color: "bg-green-500" },
    rejected: { label: "已拒绝", color: "bg-red-500" },
  };

  const typeIconMap: Record<string, string> = {
    "study-permit": "🎓",
    "visitor-visa": "✈️",
    "work-permit": "💼",
    "express-entry": "🚀",
    "provincial-nominee": "🏛️",
  };

  const filters = [
    { value: "all", label: "全部", count: (stats?.pending || 0) + (stats?.underReview || 0) + (stats?.needsRevision || 0) + (stats?.approved || 0) },
    { value: "submitted", label: "待审核", count: stats?.pending || 0 },
    { value: "under_review", label: "审核中", count: stats?.underReview || 0 },
    { value: "needs_revision", label: "需修改", count: stats?.needsRevision || 0 },
    { value: "approved", label: "已通过", count: stats?.approved || 0 },
  ];

  if (loading && !member) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              返回首页
            </a>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <h1 className="font-semibold text-white">团队成员后台</h1>
                <p className="text-sm text-slate-400">团队协作管理系统</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/team/dashboard" className="text-slate-400 hover:text-white transition-colors">仪表板</a>
            <a href="/team/cases" className="text-purple-400 font-medium">案件管理</a>
            <a href="/team/messages" className="text-slate-400 hover:text-white transition-colors">消息</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{member?.name}</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white text-sm transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">案件管理</h2>
          <p className="text-slate-400 mt-1">查看和管理所有案件</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              assignedToMeOnly ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            我负责跟进
          </button>
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setCurrentFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                currentFilter === filter.value
                  ? "bg-purple-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Cases List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-slate-400">暂无案件</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="divide-y divide-slate-700">
              {applications.map((app) => (
                <a
                  key={app.id}
                  href={`/team/cases/${app.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-2xl">
                    {typeIconMap[app.type] || "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{app.typeName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusMap[app.status]?.color || "bg-slate-500"}`}>
                        {statusMap[app.status]?.label || app.status}
                      </span>
                      {app.assignedToMe && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/80 text-white">我跟进</span>
                      )}
                      {app.rcicReviewedAt && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/80 text-white">资料已审核</span>
                      )}
                      {app._count.messages > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                          {app._count.messages} 条新消息
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {app.user.name || app.user.email} · 提交于 {new Date(app.submittedAt).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                  <div className="text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
