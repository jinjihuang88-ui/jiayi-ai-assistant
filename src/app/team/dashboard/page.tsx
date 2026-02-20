"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  rcicId: string;
  isActive: boolean;
}

interface Stats {
  pending: number;
  underReview: number;
  needsRevision: number;
  approved: number;
}

export default function TeamDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/team/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/team/login");
        return;
      }

      setMember(data.member);
      fetchStats();
    } catch (error) {
      router.push("/team/login");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/team/cases?limit=5");
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/team/auth/logout", { method: "POST" });
    router.push("/team/login");
  };

  const roleMap: Record<string, string> = {
    operator: "操作员",
    copywriter: "文案",
  };

  if (loading) {
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
                <span className="text-white font-bold">团</span>
              </div>
              <div>
                <h1 className="font-semibold text-white">团队成员后台</h1>
                <p className="text-sm text-slate-400">团队协作管理系统</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/team/dashboard" className="text-purple-400 font-medium">仪表板</a>
            <a href="/team/cases" className="text-slate-400 hover:text-white transition-colors">案件管理</a>
            <a href="/team/messages" className="text-slate-400 hover:text-white transition-colors">消息</a>
            <a href="/internal/chat" className="text-slate-400 hover:text-white transition-colors">内部通讯</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{member?.name}</div>
              <div className="text-xs text-slate-400">{roleMap[member?.role || ""] || member?.role}</div>
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
          <h2 className="text-2xl font-bold text-white">欢迎回来，{member?.name}</h2>
          <p className="text-slate-400 mt-1">以下是您的工作概览</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-500 text-lg font-bold">待</span>
              </div>
              <span className="text-slate-400 text-sm">待审核</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.pending || 0}</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-500 text-lg font-bold">审</span>
              </div>
              <span className="text-slate-400 text-sm">审核中</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.underReview || 0}</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-500 text-lg font-bold">改</span>
              </div>
              <span className="text-slate-400 text-sm">需修改</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.needsRevision || 0}</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 text-lg font-bold">过</span>
              </div>
              <span className="text-slate-400 text-sm">已通过</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.approved || 0}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/team/cases?status=submitted"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-purple-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold mb-4">
              审
            </div>
            <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
              审核新申请
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              查看并审核用户提交的新申请
            </p>
          </a>

          <a
            href="/team/messages"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-purple-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold mb-4">
              聊
            </div>
            <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
              回复消息
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              查看并回复用户的咨询消息
            </p>
          </a>

          <a
            href="/team/cases?status=needs_revision"
            className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-purple-500/50 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl mb-4">
              改
            </div>
            <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
              跟进修改
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              查看用户修改后重新提交的申请
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}
