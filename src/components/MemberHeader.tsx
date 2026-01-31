"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  profile?: {
    givenName: string | null;
  } | null;
}

export default function MemberHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        // 获取未读通知数
        const notifRes = await fetch("/api/member/notifications?limit=1");
        const notifData = await notifRes.json();
        if (notifData.success) {
          setUnreadNotifications(notifData.unreadCount);
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
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

  const displayName = user?.profile?.givenName || user?.name || user?.email?.split("@")[0] || "用户";

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/auth/login"
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          登录
        </a>
        <a
          href="/auth/login"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-medium hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25"
        >
          免费注册
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <a
        href="/member/notifications"
        className="relative p-2 text-slate-500 hover:text-slate-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadNotifications > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadNotifications > 9 ? "9+" : unreadNotifications}
          </span>
        )}
      </a>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden md:inline">{displayName}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <a
                href="/member"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                会员中心
              </a>
              <a
                href="/member/applications"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                我的申请
              </a>
              <a
                href="/member/messages"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                消息
              </a>
              <a
                href="/member/profile"
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                个人资料
              </a>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                退出登录
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
