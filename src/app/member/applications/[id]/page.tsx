"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  comment: string | null;
  changedBy: string | null;
  changedAt: string;
}

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Application {
  id: string;
  type: string;
  typeName: string;
  status: string;
  formData: Record<string, any>;
  rcicId: string | null;
  rcicName: string | null;
  rcicComment: string | null;
  rcicReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  statusHistory: StatusHistory[];
  messages: Message[];
  documents: Document[];
}

const statusMap: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  draft: { label: "草稿", color: "text-gray-600", bgColor: "bg-gray-100", description: "申请尚未提交，您可以继续编辑" },
  submitted: { label: "已提交", color: "text-blue-600", bgColor: "bg-blue-100", description: "申请已提交，等待顾问审核" },
  under_review: { label: "审核中", color: "text-yellow-600", bgColor: "bg-yellow-100", description: "顾问正在审核您的申请" },
  needs_revision: { label: "需修改", color: "text-orange-600", bgColor: "bg-orange-100", description: "请根据顾问反馈修改申请" },
  approved: { label: "已通过", color: "text-green-600", bgColor: "bg-green-100", description: "申请已通过审核" },
  rejected: { label: "已拒绝", color: "text-red-600", bgColor: "bg-red-100", description: "申请未通过审核" },
};

const typeIconMap: Record<string, { icon: string; color: string }> = {
  "study-permit": { icon: "🎓", color: "from-blue-500 to-cyan-500" },
  study_permit: { icon: "🎓", color: "from-blue-500 to-cyan-500" },
  "visitor-visa": { icon: "✈️", color: "from-green-500 to-emerald-500" },
  visitor_visa: { icon: "✈️", color: "from-green-500 to-emerald-500" },
  "work-permit": { icon: "💼", color: "from-purple-500 to-pink-500" },
  work_permit: { icon: "💼", color: "from-purple-500 to-pink-500" },
  "express-entry": { icon: "🚀", color: "from-indigo-500 to-blue-500" },
  express_entry: { icon: "🚀", color: "from-indigo-500 to-blue-500" },
  "provincial-nominee": { icon: "🏛️", color: "from-orange-500 to-red-500" },
  provincial_nominee: { icon: "🏛️", color: "from-orange-500 to-red-500" },
};

/** 申请类型在 URL 中为短横线（如 visitor-visa），DB 中为下划线（visitor_visa） */
function applicationTypeToPath(type: string): string {
  return type.replace(/_/g, "-");
}

/** 从 API 返回的 formData（即整份 applicationData）中抽出用于「表单内容」展示的键值列表，与各申请页提交结构一致 */
function getFormDisplayEntries(formData: Record<string, any>): { key: string; label: string; value: string }[] {
  if (!formData || typeof formData !== "object") return [];
  if (Array.isArray(formData.fields)) {
    return formData.fields.map((f: { key: string; label?: string; value?: string }) => ({
      key: f.key,
      label: f.label || f.key,
      value: f.value != null ? String(f.value) : "",
    }));
  }
  if (formData.formData && typeof formData.formData === "object" && !Array.isArray(formData.formData)) {
    return Object.entries(formData.formData).map(([key, value]) => ({
      key,
      label: key,
      value: value != null && typeof value === "object" && !Array.isArray(value) ? JSON.stringify(value) : String(value ?? ""),
    }));
  }
  const meta = new Set(["id", "type", "status", "createdAt", "updatedAt"]);
  return Object.entries(formData)
    .filter(([k]) => !meta.has(k))
    .map(([key, value]) => ({
      key,
      label: key,
      value: value != null && typeof value === "object" ? JSON.stringify(value) : String(value ?? ""),
    }));
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "form" | "timeline" | "messages">("overview");

  useEffect(() => {
    fetchApplication();
  }, [params.id]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/member/applications/${params.id}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
        if (res.status === 404) {
          router.push("/member/applications");
          return;
        }
      }

      setApplication(data.application);
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
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

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">申请不存在</h2>
          <a href="/member/applications" className="text-red-600 hover:underline">
            返回申请列表
          </a>
        </div>
      </div>
    );
  }

  const typeInfo = typeIconMap[application.type] || { icon: "📄", color: "from-gray-500 to-gray-600" };
  const statusInfo = statusMap[application.status] || statusMap.draft;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/member/applications" className="text-slate-500 hover:text-slate-700">
              ← 返回
            </a>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-slate-900 font-medium">{application.typeName}</span>
          </div>

          <div className="flex items-center gap-3">
            {["draft", "needs_revision"].includes(application.status) && (
              <a
                href={`/applications/${applicationTypeToPath(application.type)}?id=${application.id}`}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                {application.status === "draft" ? "继续填写" : "修改申请"}
              </a>
            )}
            <a
              href={`/member/messages?applicationId=${application.id}`}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              联系顾问
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Application Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${typeInfo.color} flex items-center justify-center text-3xl`}>
              {typeInfo.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{application.typeName}</h1>
                  <p className="text-slate-500">申请编号：{application.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>
              <p className="mt-2 text-slate-600">{statusInfo.description}</p>
            </div>
          </div>
        </div>

        {/* RCIC Feedback */}
        {application.rcicComment && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">👨‍⚖️</div>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  顾问反馈 {application.rcicName && `- ${application.rcicName}`}
                </h3>
                {application.rcicReviewedAt && (
                  <p className="text-sm text-yellow-600 mb-2">
                    {new Date(application.rcicReviewedAt).toLocaleString("zh-CN")}
                  </p>
                )}
                <p className="text-yellow-700">{application.rcicComment}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-slate-200 w-fit">
          {[
            { id: "overview", label: "概览" },
            { id: "form", label: "表单内容" },
            { id: "timeline", label: "状态历史" },
            { id: "messages", label: `消息 (${application.messages.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">基本信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">申请类型</span>
                  <span className="text-slate-900">{application.typeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">创建时间</span>
                  <span className="text-slate-900">{new Date(application.createdAt).toLocaleString("zh-CN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">最后更新</span>
                  <span className="text-slate-900">{new Date(application.updatedAt).toLocaleString("zh-CN")}</span>
                </div>
                {application.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">提交时间</span>
                    <span className="text-slate-900">{new Date(application.submittedAt).toLocaleString("zh-CN")}</span>
                  </div>
                )}
                {application.rcicName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">审核顾问</span>
                    <span className="text-slate-900">{application.rcicName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                {["draft", "needs_revision"].includes(application.status) && (
                  <a
                    href={`/applications/${applicationTypeToPath(application.type)}?id=${application.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    <span className="text-xl">✏️</span>
                    <span>{application.status === "draft" ? "继续填写申请" : "修改申请内容"}</span>
                  </a>
                )}
                <a
                  href={`/member/messages?applicationId=${application.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50"
                >
                  <span className="text-xl">💬</span>
                  <span>与顾问沟通</span>
                </a>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 w-full text-left"
                >
                  <span className="text-xl">🖨️</span>
                  <span>打印申请</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "form" && (() => {
          const entries = getFormDisplayEntries(application.formData);
          return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">表单内容</h3>
              {entries.length === 0 ? (
                <p className="text-slate-500">暂无表单数据</p>
              ) : (
                <div className="space-y-4">
                  {entries.map(({ key, label, value }) => (
                    <div key={key} className="border-b border-slate-100 pb-3">
                      <div className="text-sm text-slate-500 mb-1">{label}</div>
                      <div className="text-slate-900">{value || "-"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === "timeline" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">状态历史</h3>
            <div className="space-y-4">
              {application.statusHistory.map((history, index) => {
                const toStatusInfo = statusMap[history.toStatus] || statusMap.draft;
                return (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${toStatusInfo.bgColor} border-2 ${toStatusInfo.color.replace("text-", "border-")}`} />
                      {index < application.statusHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${toStatusInfo.color}`}>{toStatusInfo.label}</span>
                        <span className="text-sm text-slate-400">
                          {new Date(history.changedAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      {history.comment && (
                        <p className="text-sm text-slate-600 mt-1">{history.comment}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">消息记录</h3>
              <a
                href={`/member/messages?applicationId=${application.id}`}
                className="text-sm text-red-600 hover:text-red-700"
              >
                查看全部 →
              </a>
            </div>
            {application.messages.length === 0 ? (
              <p className="text-slate-500">暂无消息</p>
            ) : (
              <div className="space-y-4">
                {application.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.senderType === "user" ? "bg-red-50 ml-8" : "bg-slate-50 mr-8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {msg.senderType === "user" ? "我" : msg.senderName || "顾问"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-slate-700">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
