"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export default function TeamMessagesPage() {
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
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
    } catch (error) {
      router.push("/team/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/team/auth/logout", { method: "POST" });
    router.push("/team/login");
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
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">团队成员后台</h1>
              <p className="text-sm text-slate-400">团队协作管理系统</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/team/dashboard" className="text-slate-400 hover:text-white transition-colors">仪表板</a>
            <a href="/team/cases" className="text-slate-400 hover:text-white transition-colors">案件管理</a>
            <a href="/team/messages" className="text-purple-400 font-medium">消息</a>
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
          <h2 className="text-2xl font-bold text-white">消息中心</h2>
          <p className="text-slate-400 mt-1">查看和回复用户消息</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">消息功能开发中</h3>
          <p className="text-slate-400">
            您可以通过案件详情页面查看和回复用户消息
          </p>
          <a
            href="/team/cases"
            className="inline-block mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            前往案件管理
          </a>
        </div>
      </div>
    </main>
  );
}
