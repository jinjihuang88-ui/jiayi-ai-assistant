"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RCIC {
  id: string;
  email: string;
  name: string;
  licenseNo: string;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function TeamManagementPage() {
  const router = useRouter();
  const [rcic, setRcic] = useState<RCIC | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");

  // 表单状态
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "operator",
  });
  const [submitting, setSubmitting] = useState(false);

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
      await fetchTeamMembers();
    } catch (error) {
      console.error("Auth check failed:", error);
      setLoading(false);
      router.push("/rcic/login");
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/rcic/team/list");
      const data = await res.json();

      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error("获取团队成员失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/rcic/auth/logout", { method: "POST" });
    router.push("/rcic/login");
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/rcic/team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        showToast("团队成员添加成功！", "success");
        setShowAddForm(false);
        
        // 显示临时密码模态框
        if (data.tempPassword) {
          setTempPassword(data.tempPassword);
          setNewMemberEmail(formData.email);
        }
        
        setFormData({ email: "", name: "", role: "operator" });
        fetchTeamMembers();
      } else {
        showToast(data.error || "添加失败", "error");
      }
    } catch (error) {
      showToast("网络错误", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (memberId: string) => {
    try {
      const res = await fetch(`/api/rcic/team/${memberId}/toggle`, {
        method: "PUT",
      });

      const data = await res.json();

      if (data.success) {
        showToast("状态更新成功", "success");
        fetchTeamMembers();
      } else {
        showToast(data.error || "更新失败", "error");
      }
    } catch (error) {
      showToast("网络错误", "error");
    }
  };

  const roleMap: Record<string, string> = {
    operator: "操作员",
    copywriter: "文案",
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
      {/* 临时密码模态框 */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">钥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">成员添加成功！</h3>
              <p className="text-slate-400">请将以下临时密码发送给团队成员</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">邮箱地址</label>
                <div className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                  {newMemberEmail}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">临时密码</label>
                <div className="relative">
                  <div className="px-4 py-3 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-400 font-mono text-lg text-center select-all">
                    {tempPassword}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tempPassword);
                      showToast("已复制到剪贴板", "success");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm transition-colors"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-amber-500 text-xl font-bold">!</span>
                <div className="flex-1">
                  <p className="text-amber-400 text-sm font-medium mb-1">重要提示</p>
                  <p className="text-amber-300/80 text-xs">
                    请立即记录此密码，关闭后将无法再次查看。建议通过安全渠道（如邮件或加密聊天）发送给团队成员。
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setTempPassword(null);
                setNewMemberEmail("");
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              我已记录，关闭
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 border-emerald-400/50"
                : "bg-gradient-to-r from-red-500/90 to-pink-500/90 border-red-400/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {toast.type === "success" ? "成功" : "失败"}
              </span>
              <span className="text-white font-medium">{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              返回首页
            </a>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-slate-600 font-bold">团队</span>
              </div>
              <div>
                <h1 className="font-semibold text-white">团队管理</h1>
                <p className="text-sm text-slate-400">管理您的团队成员</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="/rcic/dashboard"
              className="text-slate-400 hover:text-white transition-colors"
            >
              仪表板
            </a>
            <a
              href="/rcic/cases"
              className="text-slate-400 hover:text-white transition-colors"
            >
              案件管理
            </a>
            <a
              href="/rcic/messages"
              className="text-slate-400 hover:text-white transition-colors"
            >
              消息
            </a>
            <a href="/rcic/team" className="text-emerald-400 font-medium">
              团队管理
            </a>
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
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">团队成员</h2>
            <p className="text-slate-400 mt-1">
              共 {members.length} 名成员
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            {showAddForm ? "取消" : "+ 添加成员"}
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">添加团队成员</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  邮箱地址 *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="member@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="张三"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  角色
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="operator">操作员</option>
                  <option value="copywriter">文案</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "添加中..." : "确认添加"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Members List */}
        {members.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-600 font-bold text-xl">团</div>
            <p className="text-slate-400">暂无团队成员</p>
            <p className="text-sm text-slate-500 mt-2">点击"添加成员"按钮开始添加</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      成员信息
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      角色
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      状态
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      最后登录
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{member.name}</div>
                          <div className="text-sm text-slate-400">{member.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {roleMap[member.role] || member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              member.isActive ? "bg-green-500" : "bg-slate-500"
                            }`}
                          />
                          <span className="text-sm text-slate-300">
                            {member.isActive ? "启用" : "禁用"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleDateString("zh-CN")
                          : "从未登录"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(member.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            member.isActive
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          }`}
                        >
                          {member.isActive ? "禁用" : "启用"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
