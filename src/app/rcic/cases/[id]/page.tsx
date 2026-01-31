"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

interface RCIC {
  id: string;
  name: string;
  licenseNo: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  profile: any;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

interface Message {
  id: string;
  content: string;
  messageType: string;
  senderType: string;
  senderName: string | null;
  createdAt: string;
  attachments: Attachment[];
}

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  comment: string | null;
  changedBy: string | null;
  changedAt: string;
}

interface Application {
  id: string;
  type: string;
  typeName: string;
  status: string;
  formData: string;
  rcicId: string | null;
  rcicName: string | null;
  rcicComment: string | null;
  rcicReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  user: User;
  documents: Document[];
  messages: Message[];
  statusHistory: StatusHistory[];
}

interface FieldReview {
  status: "ok" | "fix";
  comment: string;
}

export default function RCICCaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [rcic, setRcic] = useState<RCIC | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldReviews, setFieldReviews] = useState<Record<string, FieldReview>>({});
  const [finalComment, setFinalComment] = useState("");
  const [activeTab, setActiveTab] = useState<"review" | "documents" | "messages">("review");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (rcic && id) {
      fetchApplication();
    }
  }, [rcic, id]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/rcic/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/rcic/login");
        return;
      }

      setRcic(data.rcic);
    } catch (error) {
      router.push("/rcic/login");
    }
  };

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/rcic/cases/${id}`);
      const data = await res.json();

      if (data.success) {
        setApplication(data.application);

        // 解析已有的审核数据
        const formData = JSON.parse(data.application.formData || "{}");
        if (formData._rcicReviews) {
          setFieldReviews(formData._rcicReviews);
        }
        if (data.application.rcicComment) {
          setFinalComment(data.application.rcicComment);
        }
      } else {
        alert(data.message);
        router.push("/rcic/cases");
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFieldReview = (key: string, status: "ok" | "fix", comment: string) => {
    setFieldReviews((prev) => ({
      ...prev,
      [key]: { status, comment },
    }));
  };

  const handleSaveReview = async () => {
    if (!application) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/rcic/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "under_review",
          fieldReviews,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("审核进度已保存");
        setApplication(data.application);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitConclusion = async (result: "needs_revision" | "approved") => {
    if (!application) return;

    if (!finalComment.trim()) {
      alert("请填写审核意见");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/rcic/cases/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: result,
          comment: finalComment,
          fieldReviews,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(result === "approved" ? "审核已通过" : "已通知用户修改");
        router.push("/rcic/cases");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("提交失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !application) return;

    setSendingMessage(true);
    try {
      const res = await fetch("/api/rcic/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          content: newMessage.trim(),
          messageType: "text",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setApplication((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, data.message],
              }
            : null
        );
        setNewMessage("");
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("发送失败");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/rcic/auth/logout", { method: "POST" });
    router.push("/rcic/login");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "草稿", color: "bg-slate-500" },
    submitted: { label: "待审核", color: "bg-yellow-500" },
    under_review: { label: "审核中", color: "bg-blue-500" },
    needs_revision: { label: "需修改", color: "bg-orange-500" },
    approved: { label: "已通过", color: "bg-green-500" },
    rejected: { label: "已拒绝", color: "bg-red-500" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-4xl mb-4">📭</div>
          <p>案件不存在</p>
          <a href="/rcic/cases" className="text-emerald-400 mt-4 inline-block">
            返回案件列表
          </a>
        </div>
      </div>
    );
  }

  const formData = JSON.parse(application.formData || "{}");
  const formFields = Object.entries(formData).filter(([key]) => !key.startsWith("_"));

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/rcic/cases" className="text-slate-400 hover:text-white transition-colors">
              ← 返回
            </a>
            <div>
              <h1 className="font-semibold text-white">{application.typeName}</h1>
              <p className="text-sm text-slate-400">案件编号: {application.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm text-white ${statusMap[application.status]?.color || "bg-slate-500"}`}>
              {statusMap[application.status]?.label || application.status}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1">
              {[
                { key: "review", label: "表单审核", icon: "📋" },
                { key: "documents", label: `文件附件 (${application.documents.length})`, icon: "📎" },
                { key: "messages", label: `消息 (${application.messages.length})`, icon: "💬" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Review Tab */}
            {activeTab === "review" && (
              <div className="space-y-4">
                {formFields.length === 0 ? (
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center text-slate-500">
                    暂无表单数据
                  </div>
                ) : (
                  formFields.map(([key, value]) => {
                    const review = fieldReviews[key];
                    return (
                      <div
                        key={key}
                        className={`bg-slate-800/50 rounded-xl border p-5 space-y-3 ${
                          review?.status === "ok"
                            ? "border-green-500/50"
                            : review?.status === "fix"
                            ? "border-orange-500/50"
                            : "border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-white">{key}</div>
                            <div className="text-sm text-slate-400 mt-1">
                              用户填写：{String(value) || "（未填写）"}
                            </div>
                          </div>
                          {review && (
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                review.status === "ok"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-orange-500/20 text-orange-400"
                              }`}
                            >
                              {review.status === "ok" ? "✓ 通过" : "⚠ 需修改"}
                            </span>
                          )}
                        </div>

                        <textarea
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
                          rows={2}
                          placeholder="RCIC 批注（给用户的修改建议）"
                          value={review?.comment || ""}
                          onChange={(e) =>
                            updateFieldReview(key, review?.status || "fix", e.target.value)
                          }
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateFieldReview(key, "ok", review?.comment || "")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              review?.status === "ok"
                                ? "bg-green-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            ✓ 通过
                          </button>
                          <button
                            onClick={() => updateFieldReview(key, "fix", review?.comment || "")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              review?.status === "fix"
                                ? "bg-orange-600 text-white"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            ⚠ 需修改
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Save Progress */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveReview}
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "保存中..." : "保存审核进度"}
                  </button>
                </div>

                {/* Final Conclusion */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 space-y-4">
                  <h3 className="font-semibold text-white">审核结论</h3>
                  <textarea
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
                    rows={4}
                    placeholder="RCIC 官方审核意见（展示给用户）"
                    value={finalComment}
                    onChange={(e) => setFinalComment(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleSubmitConclusion("needs_revision")}
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      需要用户修改
                    </button>
                    <button
                      onClick={() => handleSubmitConclusion("approved")}
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      审核通过
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                {application.documents.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="text-4xl mb-4">📎</div>
                    <p>暂无上传文件</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {application.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xl">
                          {doc.mimeType.includes("pdf") ? "📄" : doc.mimeType.includes("image") ? "🖼️" : "📎"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{doc.name}</div>
                          <div className="text-sm text-slate-400">
                            {doc.type} · {formatFileSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString("zh-CN")}
                          </div>
                        </div>
                        <span className="text-emerald-400 text-sm">下载</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {application.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <div className="text-4xl mb-4">💬</div>
                      <p>暂无消息</p>
                    </div>
                  ) : (
                    <>
                      {application.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderType === "rcic" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                              msg.senderType === "rcic"
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                                : "bg-slate-700 text-white"
                            }`}
                          >
                            {msg.senderType !== "rcic" && (
                              <div className="text-xs font-medium mb-1 text-emerald-400">
                                {msg.senderName || "用户"}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {msg.attachments.map((att) => (
                                  <a
                                    key={att.id}
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                  >
                                    <span>{att.fileType === "image" ? "🖼️" : "📎"}</span>
                                    <span className="text-sm truncate">{att.fileName}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                            <div className="text-xs mt-1 opacity-70">
                              {new Date(msg.createdAt).toLocaleString("zh-CN")}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {sendingMessage ? "..." : "发送"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - User Info */}
          <div className="space-y-6">
            {/* User Card */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">申请人信息</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-medium text-lg">
                  {application.user.name?.[0] || application.user.email[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-white">{application.user.name || "未设置姓名"}</div>
                  <div className="text-sm text-slate-400">{application.user.email}</div>
                </div>
              </div>
              {application.user.phone && (
                <div className="text-sm text-slate-400 mb-2">
                  📞 {application.user.phone}
                </div>
              )}
              <a
                href={`/rcic/messages?applicationId=${application.id}`}
                className="block w-full text-center px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors mt-4"
              >
                发送消息
              </a>
            </div>

            {/* Status History */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">状态历史</h3>
              {application.statusHistory.length === 0 ? (
                <p className="text-sm text-slate-500">暂无记录</p>
              ) : (
                <div className="space-y-3">
                  {application.statusHistory.slice(0, 5).map((history) => (
                    <div key={history.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                      <div>
                        <div className="text-sm text-white">
                          {statusMap[history.toStatus]?.label || history.toStatus}
                        </div>
                        {history.comment && (
                          <div className="text-xs text-slate-400 mt-0.5">{history.comment}</div>
                        )}
                        <div className="text-xs text-slate-500 mt-0.5">
                          {new Date(history.changedAt).toLocaleString("zh-CN")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
              <h3 className="font-semibold text-white mb-4">申请统计</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{formFields.length}</div>
                  <div className="text-xs text-slate-400">表单字段</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{application.documents.length}</div>
                  <div className="text-xs text-slate-400">上传文件</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{application.messages.length}</div>
                  <div className="text-xs text-slate-400">消息数量</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {Object.values(fieldReviews).filter((r) => r.status === "ok").length}
                  </div>
                  <div className="text-xs text-slate-400">已审核通过</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
