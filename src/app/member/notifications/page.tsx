"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIconMap: Record<string, { icon: string; color: string; bgColor: string }> = {
  status_change: { icon: "", color: "text-blue-600", bgColor: "bg-blue-100" },
  message: { icon: "", color: "text-green-600", bgColor: "bg-green-100" },
  reminder: { icon: "", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  system: { icon: "", color: "text-gray-600", bgColor: "bg-gray-100" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === "unread") params.set("unreadOnly", "true");

      const res = await fetch(`/api/member/notifications?${params}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (ids?: string[]) => {
    try {
      await fetch("/api/member/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids ? { notificationIds: ids } : { all: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (id?: string) => {
    try {
      const params = new URLSearchParams();
      if (id) {
        params.set("id", id);
      } else {
        params.set("all", "true");
      }

      await fetch(`/api/member/notifications?${params}`, {
        method: "DELETE",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead([notification.id]);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/member" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              返回会员中心
            </a>
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg shadow-md" />
              <span className="font-semibold text-lg text-slate-900">加移AI助理</span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/member" className="text-slate-600 hover:text-slate-900">会员中心</a>
            <a href="/member/applications" className="text-slate-600 hover:text-slate-900">我的申请</a>
            <a href="/member/messages" className="text-slate-600 hover:text-slate-900">消息</a>
            <a href="/member/notifications" className="text-red-600 font-medium">通知</a>
          </nav>

          <a href="/member/profile" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium">
              U
            </div>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">通知中心</h1>
            <p className="text-slate-600">
              {unreadCount > 0 ? `您有 ${unreadCount} 条未读通知` : "暂无未读通知"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => handleMarkAsRead()}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                全部已读
              </button>
            )}
            {notifications.some((n) => n.isRead) && (
              <button
                onClick={() => handleDelete()}
                className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
              >
                清除已读
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-red-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "unread"
                ? "bg-red-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}
          >
            未读 {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500 text-2xl font-bold">通</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">暂无通知</h2>
            <p className="text-slate-500">
              {filter === "unread" ? "没有未读通知" : "您还没有收到任何通知"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {notifications.map((notification) => {
              const typeInfo = typeIconMap[notification.type] || typeIconMap.system;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !notification.isRead ? "bg-red-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${typeInfo.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                      {typeInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          )}
                          <span className="text-xs text-slate-400">
                            {new Date(notification.createdAt).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      {notification.link && (
                        <span className="text-sm text-red-600 mt-2 inline-block">
                          查看详情 →
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
