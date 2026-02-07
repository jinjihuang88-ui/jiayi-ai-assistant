"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  type: string;
  typeName: string;
  status: string;
  rcicName: string | null;
  rcicComment: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  messageCount: number;
  documentCount: number;
}

const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: "草稿", color: "text-gray-600", bgColor: "bg-gray-100" },
  submitted: { label: "已提交", color: "text-blue-600", bgColor: "bg-blue-100" },
  under_review: { label: "审核中", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  needs_revision: { label: "需修改", color: "text-orange-600", bgColor: "bg-orange-100" },
  approved: { label: "已通过", color: "text-green-600", bgColor: "bg-green-100" },
  rejected: { label: "已拒绝", color: "text-red-600", bgColor: "bg-red-100" },
};

const typeIconMap: Record<string, { icon: string; color: string; name: string }> = {
  "study-permit": { icon: "🎓", color: "from-blue-500 to-cyan-500", name: "学习签证" },
  "visitor-visa": { icon: "✈️", color: "from-green-500 to-emerald-500", name: "访客签证" },
  "work-permit": { icon: "💼", color: "from-purple-500 to-pink-500", name: "工作签证" },
  "express-entry": { icon: "🚀", color: "from-indigo-500 to-blue-500", name: "EE技术移民" },
  "provincial-nominee": { icon: "🏛️", color: "from-orange-500 to-red-500", name: "省提名项目" },
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/member/applications?${params}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
      }

      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个草稿吗？")) return;

    try {
      const res = await fetch(`/api/member/applications/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setApplications(applications.filter((app) => app.id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("删除失败");
    }
  };

  const filterOptions = [
    { value: "all", label: "全部" },
    { value: "draft", label: "草稿" },
    { value: "submitted", label: "已提交" },
    { value: "under_review", label: "审核中" },
    { value: "needs_revision", label: "需修改" },
    { value: "approved", label: "已通过" },
    { value: "rejected", label: "已拒绝" },
  ];

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
            <a href="/member/applications" className="text-red-600 font-medium">我的申请</a>
            <a href="/member/messages" className="text-slate-600 hover:text-slate-900">消息</a>
            <a href="/member/notifications" className="text-slate-600 hover:text-slate-900">通知</a>
          </nav>

          <a href="/member/profile" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-medium">
              U
            </div>
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">我的申请</h1>
            <p className="text-slate-600">管理您的所有移民申请</p>
          </div>
          <a
            href="/applications"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25"
          >
            + 新建申请
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? "bg-red-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">暂无申请</h2>
            <p className="text-slate-500 mb-6">
              {filter === "all" ? "您还没有任何申请记录" : `没有${filterOptions.find((o) => o.value === filter)?.label}的申请`}
            </p>
            <a
              href="/applications"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
            >
              开始新申请
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const typeInfo = typeIconMap[app.type] || { icon: "📄", color: "from-gray-500 to-gray-600", name: app.typeName };
              const statusInfo = statusMap[app.status] || statusMap.draft;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${typeInfo.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {typeInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{app.typeName}</h3>
                          <p className="text-sm text-slate-500">
                            申请编号：{app.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span>创建于 {new Date(app.createdAt).toLocaleDateString("zh-CN")}</span>
                        <span>更新于 {new Date(app.updatedAt).toLocaleDateString("zh-CN")}</span>
                        {app.submittedAt && (
                          <span>提交于 {new Date(app.submittedAt).toLocaleDateString("zh-CN")}</span>
                        )}
                        {app.messageCount > 0 && (
                          <span className="flex items-center gap-1">
                            💬 {app.messageCount} 条消息
                          </span>
                        )}
                      </div>

                      {/* RCIC Comment */}
                      {app.rcicComment && (
                        <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <div className="text-sm font-medium text-yellow-800 mb-1">
                            顾问反馈 {app.rcicName && `(${app.rcicName})`}
                          </div>
                          <div className="text-sm text-yellow-700">{app.rcicComment}</div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`/member/applications/${app.id}`}
                          className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                        >
                          查看详情
                        </a>
                        {["draft", "needs_revision"].includes(app.status) && (
                          <a
                            href={`/applications/${app.type}?id=${app.id}`}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                          >
                            {app.status === "draft" ? "继续填写" : "修改申请"}
                          </a>
                        )}
                        {app.status === "draft" && (
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
                          >
                            删除
                          </button>
                        )}
                        {["submitted", "under_review", "needs_revision"].includes(app.status) && (
                          <a
                            href={`/member/messages?applicationId=${app.id}`}
                            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                          >
                            联系顾问
                          </a>
                        )}
                      </div>
                    </div>
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
