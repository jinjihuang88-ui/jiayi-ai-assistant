"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RCIC {
  id: string;
  email: string;
  name: string;
  licenseNo: string;
  avatar: string | null;
}

interface Stats {
  pending: number;
  underReview: number;
  needsRevision: number;
  approved: number;
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
  _count: {
    messages: number;
  };
}

export default function RCICDashboardPage() {
  const router = useRouter();
  const [rcic, setRcic] = useState<RCIC | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCases, setRecentCases] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/rcic/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/rcic/login");
        return;
      }

      setRcic(data.rcic);
      fetchDashboardData();
    } catch (error) {
      router.push("/rcic/login");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/rcic/cases?limit=5");
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setRecentCases(data.applications);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/rcic/auth/logout", { method: "POST" });
    router.push("/rcic/login");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">RCIC 顾问后台</h1>
              <p className="text-sm text-slate-400">移民顾问管理系统</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/rcic/dashboard" className="text-emerald-400 font-medium">仪表板</a>
            <a href="/rcic/cases" className="text-slate-400 hover:text-white transition-colors">案件管理</a>
            <a href="/rcic/messages" className="text-slate-400 hover:text-white transition-colors">消息</a>
            <a href="/rcic/team" className="text-slate-400 hover:text-white transition-colors">团队管理</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{rcic?.name}</div>
              <div className="text-xs text-slate-400">RCIC #{rcic?.licenseNo}</div>
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
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">欢迎回来，{rcic?.name}</h2>
          <p className="text-slate-400 mt-1">以下是您的工作概览</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 text-xl">📋</span>
              </div>
              <span className="text-slate-400 text-sm">待审核</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.pending || 0}</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-500 text-xl">🔍</span>
              </div>
              <span className="text-slate-400 text-sm">审核中</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.underReview || 0}</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-500 text-xl">✏️</span>
              </div>
              <span className="text-slate-400 text-sm">需修改</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.needsRevision || 0}</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 text-xl">✅</span>
              </div>
              <span className="text-slate-400 text-sm">已通过</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.approved || 0}</div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">最近案件</h3>
            <a
              href="/rcic/cases"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              查看全部 →
            </a>
          </div>

          {recentCases.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="text-4xl mb-4">📭</div>
              <p>暂无待处理案件</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {recentCases.map((app) => (
                <a
                  key={app.id}
                  href={`/rcic/cases/${app.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-2xl">
                    {typeIconMap[app.type] || "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{app.typeName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusMap[app.status]?.color || "bg-slate-500"}`}>
                        {statusMap[app.status]?.label || app.status}
                      </span>
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
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <a
            href="/rcic/cases?status=submitted"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl mb-4">
              📋
            </div>
            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
              审核新申请
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              查看并审核用户提交的新申请
            </p>
          </a>

          <a
            href="/rcic/messages"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mb-4">
              💬
            </div>
            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
              回复消息
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              查看并回复用户的咨询消息
            </p>
          </a>

          <a
            href="/rcic/cases?status=needs_revision"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl mb-4">
              ✏️
            </div>
            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
              跟进修改
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              查看用户修改后重新提交的申请
            </p>
          </a>

          <a
            href="/rcic/team"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mb-4">
              👥
            </div>
            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
              团队管理
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              管理您的团队成员和权限
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}
