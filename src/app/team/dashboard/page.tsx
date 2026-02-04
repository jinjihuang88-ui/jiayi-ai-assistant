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

export default function TeamDashboardPage() {
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
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">团队成员后台</h1>
              <p className="text-sm text-slate-400">团队协作管理系统</p>
            </div>
          </div>

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
          <p className="text-slate-400 mt-1">您的团队成员工作台</p>
        </div>

        {/* Info Card */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">账户信息</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">姓名</div>
              <div className="text-white font-medium">{member?.name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">邮箱</div>
              <div className="text-white font-medium">{member?.email}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">角色</div>
              <div className="text-white font-medium">
                <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  {roleMap[member?.role || ""] || member?.role}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">状态</div>
              <div className="text-white font-medium">
                <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                  ✓ 已激活
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-white mb-2">功能开发中</h3>
          <p className="text-slate-400">
            案件管理、消息系统等功能即将上线
          </p>
        </div>
      </div>
    </main>
  );
}
