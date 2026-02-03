"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  profile: {
    familyName: string | null;
    givenName: string | null;
  } | null;
}

interface Application {
  id: string;
  type: string;
  typeName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "草稿", color: "text-gray-600", bgColor: "bg-gray-100" },
  submitted: { label: "已提交", color: "text-blue-600", bgColor: "bg-blue-100" },
  under_review: { label: "审核中", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  needs_revision: { label: "需修改", color: "text-orange-600", bgColor: "bg-orange-100" },
  approved: { label: "已通过", color: "text-green-600", bgColor: "bg-green-100" },
  rejected: { label: "已拒绝", color: "text-red-600", bgColor: "bg-red-100" },
};

const typeIconMap: Record<string, { icon: string; color: string }> = {
  "study-permit": { icon: "🎓", color: "from-blue-500 to-cyan-500" },
  "visitor-visa": { icon: "✈️", color: "from-green-500 to-emerald-500" },
  "work-permit": { icon: "💼", color: "from-purple-500 to-pink-500" },
  "express-entry": { icon: "🚀", color: "from-indigo-500 to-blue-500" },
  "provincial-nominee": { icon: "🏛️", color: "from-orange-500 to-red-500" },
};

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 获取用户信息
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();

      if (!userData.success) {
        router.push("/auth/login");
        return;
      }

      setUser(userData.user);

      // 获取申请列表
      const appsRes = await fetch("/api/member/applications");
      const appsData = await appsRes.json();
      if (appsData.success) {
        setApplications(appsData.applications);
      }

      // 获取通知
      const notifRes = await fetch("/api/member/notifications?limit=5");
      const notifData = await notifRes.json();
      if (notifData.success) {
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  const displayName = user?.profile?.givenName || user?.name || user?.email?.split("@")[0] || "用户";

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg shadow-md" />
            <span className="font-semibold text-lg text-slate-900">加移AI助理</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/member" className="text-red-600 font-medium">会员中心</a>
            <a href="/member/applications" className="text-slate-600 hover:text-slate-900">我的申请</a>
            <a href="/member/messages" className="text-slate-600 hover:text-slate-900">消息</a>
            <a href="/member/notifications" className="text-slate-600 hover:text-slate-900 relative">
              通知
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/member/profile" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline">{displayName}</span>
            </a>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-red-600"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            欢迎回来，{displayName}！
          </h1>
          <p className="text-slate-600">
            在这里管理您的移民申请，查看进度，与顾问沟通
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "全部申请", value: applications.length, icon: "📋", color: "from-blue-500 to-cyan-500" },
            { label: "进行中", value: applications.filter(a => ["submitted", "under_review"].includes(a.status)).length, icon: "⏳", color: "from-yellow-500 to-orange-500" },
            { label: "已通过", value: applications.filter(a => a.status === "approved").length, icon: "✅", color: "from-green-500 to-emerald-500" },
            { label: "未读通知", value: unreadCount, icon: "🔔", color: "from-red-500 to-pink-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-lg`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Applications */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">最近申请</h2>
                <a href="/member/applications" className="text-sm text-red-600 hover:text-red-700">
                  查看全部 →
                </a>
              </div>
              
              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-slate-500 mb-4">您还没有任何申请</p>
                  <a
                    href="/applications"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                  >
                    开始新申请
                  </a>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map((app) => {
                    const typeInfo = typeIconMap[app.type] || { icon: "📄", color: "from-gray-500 to-gray-600" };
                    const statusInfo = statusMap[app.status] || statusMap.draft;
                    
                    return (
                      <a
                        key={app.id}
                        href={`/member/applications/${app.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${typeInfo.color} flex items-center justify-center text-xl`}>
                          {typeInfo.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900">{app.typeName}</div>
                          <div className="text-sm text-slate-500">
                            更新于 {new Date(app.updatedAt).toLocaleDateString("zh-CN")}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h2 className="font-semibold text-slate-900 mb-4">快速操作</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "学习签证", href: "/applications/study-permit", icon: "🎓", color: "from-blue-500 to-cyan-500" },
                  { label: "访客签证", href: "/applications/visitor-visa", icon: "✈️", color: "from-green-500 to-emerald-500" },
                  { label: "工作签证", href: "/applications/work-permit", icon: "💼", color: "from-purple-500 to-pink-500" },
                  { label: "技术移民", href: "/applications/express-entry", icon: "🚀", color: "from-indigo-500 to-blue-500" },
                ].map((action, i) => (
                  <a
                    key={i}
                    href={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-sm text-slate-700">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">最新通知</h2>
                <a href="/member/notifications" className="text-sm text-red-600 hover:text-red-700">
                  全部 →
                </a>
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  暂无通知
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 ${!notif.isRead ? "bg-red-50/50" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {notif.type === "status_change" ? "📋" : notif.type === "message" ? "💬" : "🔔"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 text-sm">{notif.title}</div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.content}</div>
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString("zh-CN")}
                          </div>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Help Card */}
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl p-6 text-white">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">需要帮助？</h3>
              <p className="text-sm text-white/80 mb-4">
                我们的AI助手和持牌移民顾问随时为您服务
              </p>
              <a
                href="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-red-600 text-sm font-medium hover:bg-white/90"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                咨询AI助手
              </a>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-3">完善个人资料</h3>
              <p className="text-sm text-slate-500 mb-4">
                完善资料可以加快申请填写速度
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full" style={{ width: "30%" }} />
              </div>
              <a
                href="/member/profile"
                className="text-sm text-red-600 hover:text-red-700"
              >
                去完善 →
              </a>
            </div>

            {/* Document Management */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h3 className="font-semibold text-slate-900 mb-3">📁 文档管理</h3>
              <p className="text-sm text-slate-500 mb-4">
                上传申请相关的文档和图片，移民顾问可以查看和下载
              </p>
              <a
                href="/member/documents"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium hover:from-blue-600 hover:to-blue-700 w-full justify-center"
              >
                📄 管理文档
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
