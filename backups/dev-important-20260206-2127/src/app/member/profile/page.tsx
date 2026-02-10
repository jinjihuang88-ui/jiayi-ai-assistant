"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  familyName: string;
  givenName: string;
  gender: string;
  dateOfBirth: string;
  countryOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "passport" | "settings">("basic");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/member/profile");
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
      }

      setUser(data.user);
      setProfile(data.profile || {});
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.name,
          phone: user?.phone,
          profile,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "资料保存成功" });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "保存失败，请稍后重试" });
    } finally {
      setSaving(false);
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

  const displayName = profile.givenName || user?.name || user?.email?.split("@")[0] || "用户";

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
            <a href="/member" className="text-slate-600 hover:text-slate-900">会员中心</a>
            <a href="/member/applications" className="text-slate-600 hover:text-slate-900">我的申请</a>
            <a href="/member/messages" className="text-slate-600 hover:text-slate-900">消息</a>
            <a href="/member/notifications" className="text-slate-600 hover:text-slate-900">通知</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/member/profile" className="flex items-center gap-2 text-sm text-red-600 font-medium">
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">个人资料</h1>
          <p className="text-slate-600">管理您的个人信息和偏好设置</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{displayName}</h2>
                <p className="text-slate-500">{user?.email}</p>
                <p className="text-sm text-slate-400 mt-1">
                  注册于 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-CN") : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {[
              { id: "basic", label: "基本信息" },
              { id: "contact", label: "联系地址" },
              { id: "passport", label: "护照信息" },
              { id: "settings", label: "通知设置" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "basic" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">姓 (Family Name)</label>
                  <input
                    type="text"
                    value={profile.familyName || ""}
                    onChange={(e) => setProfile({ ...profile, familyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：ZHANG"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">名 (Given Name)</label>
                  <input
                    type="text"
                    value={profile.givenName || ""}
                    onChange={(e) => setProfile({ ...profile, givenName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：SAN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">性别</label>
                  <select
                    value={profile.gender || ""}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="male">男 (Male)</option>
                    <option value="female">女 (Female)</option>
                    <option value="other">其他 (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">出生日期</label>
                  <input
                    type="date"
                    value={profile.dateOfBirth || ""}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">出生国家</label>
                  <input
                    type="text"
                    value={profile.countryOfBirth || ""}
                    onChange={(e) => setProfile({ ...profile, countryOfBirth: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：China"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">国籍</label>
                  <input
                    type="text"
                    value={profile.nationality || ""}
                    onChange={(e) => setProfile({ ...profile, nationality: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：Chinese"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">手机号码</label>
                  <input
                    type="tel"
                    value={user?.phone || ""}
                    onChange={(e) => setUser(user ? { ...user, phone: e.target.value } : null)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：+86 138 0000 0000"
                  />
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">详细地址</label>
                  <input
                    type="text"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="街道地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">城市</label>
                  <input
                    type="text"
                    value={profile.city || ""}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：Beijing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">省/州</label>
                  <input
                    type="text"
                    value={profile.province || ""}
                    onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：Beijing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">邮政编码</label>
                  <input
                    type="text"
                    value={profile.postalCode || ""}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">国家</label>
                  <input
                    type="text"
                    value={profile.country || ""}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：China"
                  />
                </div>
              </div>
            )}

            {activeTab === "passport" && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">护照号码</label>
                  <input
                    type="text"
                    value={profile.passportNumber || ""}
                    onChange={(e) => setProfile({ ...profile, passportNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="护照号码"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">签发国家</label>
                  <input
                    type="text"
                    value={profile.passportCountry || ""}
                    onChange={(e) => setProfile({ ...profile, passportCountry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="如：China"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">有效期至</label>
                  <input
                    type="date"
                    value={profile.passportExpiry || ""}
                    onChange={(e) => setProfile({ ...profile, passportExpiry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <h4 className="font-medium text-slate-900">邮件通知</h4>
                    <p className="text-sm text-slate-500">接收申请状态更新和顾问消息的邮件通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.emailNotifications !== false}
                      onChange={(e) => setProfile({ ...profile, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <h4 className="font-medium text-slate-900">短信通知</h4>
                    <p className="text-sm text-slate-500">接收重要通知的短信提醒</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.smsNotifications === true}
                      onChange={(e) => setProfile({ ...profile, smsNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="p-6 border-t border-slate-100 flex justify-end gap-4">
            <button
              onClick={() => fetchProfile()}
              className="px-6 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存更改"}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">危险操作</h3>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">退出登录</h4>
              <p className="text-sm text-slate-500">退出当前账号</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
