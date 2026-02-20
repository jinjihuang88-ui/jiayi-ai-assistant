"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CallModal from "@/components/CallModal";

interface Contact {
  contactId: string;
  name: string;
  type: "rcic" | "team_member";
  typeLabel: string;
  caseIds: string[];
  avatar?: string | null;
  isOnline?: boolean;
}

interface Consultant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profilePhoto?: string;
  consultantType: string;
  organization?: string;
  isOnline: boolean;
  lastActiveAt?: string;
}

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string | null;
  isRead: boolean;
  createdAt: string;
  application?: { id: string } | null;
  attachments?: string | null;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contracted, setContracted] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [primaryCaseId, setPrimaryCaseId] = useState<string | null>(null);
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [assignedTeamMemberName, setAssignedTeamMemberName] = useState<string | null>(null);
  const [rcicReviewedAt, setRcicReviewedAt] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [callModal, setCallModal] = useState<{ type: "video" | "voice" } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const cid = searchParams.get("contactId");
    if (cid) setSelectedContactId(cid);
  }, [searchParams]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedContactId]);

  // 轮询新消息：每 5 秒静默拉取，有新消息才更新（不显示 loading）
  useEffect(() => {
    if (!selectedContactId) return;
    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/member/messages?contactId=${encodeURIComponent(selectedContactId)}`);
        const data = await res.json();
        if (data.success && data.messages) {
          const incoming = (data.messages as Message[]).reverse();
          setMessages((prev) => {
            if (incoming.length !== prev.length || (incoming.length > 0 && prev.length > 0 && incoming[incoming.length - 1].id !== prev[prev.length - 1].id)) {
              return incoming;
            }
            return prev;
          });
        }
      } catch {
        // 静默忽略轮询错误
      }
    };
    const timer = setInterval(pollMessages, 5000);
    return () => clearInterval(timer);
  }, [selectedContactId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/member/messages/contacts");
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
        setContracted(!!data.contracted);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleCancelContract = async () => {
    if (!contracted || !confirm("确定要取消与当前顾问的合约吗？取消后可重新选择顾问。")) return;
    try {
      const res = await fetch("/api/member/cancel-contract", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "合约已取消", "success");
        await fetchContacts();
      } else {
        showToast(data.message || "取消失败", "error");
      }
    } catch (e) {
      showToast("取消合约失败", "error");
    }
  };

  const fetchMessages = async () => {
    if (!selectedContactId) {
      setMessages([]);
      setConsultant(null);
      setPrimaryCaseId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/member/messages?contactId=${encodeURIComponent(selectedContactId)}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
      }

      setMessages(data.messages?.reverse() || []);
      setConsultant(data.consultant || null);
      setAssignedTeamMemberName(data.assignedTeamMemberName ?? null);
      setRcicReviewedAt(data.rcicReviewedAt ?? null);
      setPrimaryCaseId(data.primaryCaseId ?? null);

      if (data.primaryCaseId) {
        await fetch("/api/member/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: data.primaryCaseId }),
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!selectedContactId || ((!newMessage.trim() && selectedFiles.length === 0) || sending)) return;

    setSending(true);
    setUploading(true);
    
    try {
      let attachments = null;

      // 如果有文件，先上传
      if (selectedFiles.length > 0) {
        const uploadedFiles = [];
        
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            uploadedFiles.push({
              name: file.name,
              url: uploadData.url,
              type: file.type,
              size: file.size,
            });
          }
        }

        if (uploadedFiles.length > 0) {
          attachments = JSON.stringify(uploadedFiles);
        }
      }

      const res = await fetch("/api/member/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContactId,
          applicationId: primaryCaseId,
          content: newMessage.trim() || "发送了文件",
          attachments,
        }),
      });

      const data = await res.json();
      console.log('[Send Message] Response:', data);
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorMsg = data.details || data.error || data.message || '发送失败';
        console.error('[Send Message] Error:', errorMsg);
        alert('发送消息失败：' + errorMsg);
        showToast(errorMsg, "error");
      }
    } catch (error) {
      console.error('[Send Message] Exception:', error);
      alert('发送消息异常：' + (error instanceof Error ? error.message : String(error)));
      showToast("发送失败", "error");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const selectedContact = contacts.find((c) => c.contactId === selectedContactId);

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
            <a href="/member/messages" className="text-red-600 font-medium">消息</a>
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
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar - 联系人（顾问/文案/操作员） */}
          <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">消息</h2>
              <p className="text-sm text-slate-500">与顾问、文案或操作员沟通</p>
              {contracted && (
                <button
                  type="button"
                  onClick={handleCancelContract}
                  className="mt-2 text-xs text-amber-600 hover:text-amber-700 underline"
                >
                  取消合约后可更换顾问
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {contacts.map((c) => (
                <button
                  key={c.contactId}
                  onClick={() => setSelectedContactId(c.contactId)}
                  className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedContactId === c.contactId ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {c.avatar ? (
                      <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{c.name}</div>
                      <div className="text-sm text-slate-500 truncate">{c.typeLabel}</div>
                    </div>
                  </div>
                </button>
              ))}

              {contacts.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  暂无联系人，有案件分配后会出现
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100">
              {selectedContact ? (
                <div className="flex items-center gap-3">
                  {selectedContact.avatar ? (
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-lg">
                      {selectedContact.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
                      {selectedContact.name}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {selectedContact.typeLabel}
                      </span>
                    </h3>
                    {consultant && (
                      <p className="text-sm text-slate-600 mt-0.5">
                        您的持牌顾问：{consultant.name}
                      </p>
                    )}
                    {assignedTeamMemberName && (
                      <p className="text-sm text-slate-500">
                        当前由顾问团队（{assignedTeamMemberName}）为您跟进
                      </p>
                    )}
                    {rcicReviewedAt && (
                      <p className="text-sm text-green-600 font-medium mt-0.5">
                        您提交的申请资料已由持牌顾问审核
                      </p>
                    )}
                    {consultant && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {consultant.organization || consultant.email}
                        {consultant.isOnline ? ' • 在线' : ' • 离线'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-slate-900">消息</h3>
                  <p className="text-sm text-slate-500">选择左侧联系人开始对话</p>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center mb-4 text-slate-600 font-bold text-xl">聊</div>
                  <p>暂无消息</p>
                  <p className="text-sm">发送消息开始与顾问沟通</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          msg.senderType === "user"
                            ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                            : "bg-slate-100 text-slate-900"
                        }`}
                      >
                        {msg.senderType !== "user" && (
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {msg.senderName || "顾问"}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* 附件显示与下载按钮 */}
                        {msg.attachments && (() => {
                          try {
                            const attachments = JSON.parse(msg.attachments);
                            return (
                              <div className="mt-2 space-y-2">
                                {attachments.map((file: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2 rounded-lg ${
                                      msg.senderType === "user"
                                        ? "bg-white/20 hover:bg-white/30"
                                        : "bg-white hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="text-lg">
                                      {file.type?.startsWith("image/") ? "图" : "PDF"}
                                    </span>
                                    <span className="text-sm truncate flex-1">{file.name}</span>
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={file.name}
                                      className="shrink-0 text-xs font-medium px-2 py-1 rounded bg-white/50 hover:bg-white/70"
                                    >
                                      下载
                                    </a>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch (e) {
                            return null;
                          }
                        })()}
                        
                        <div
                          className={`text-xs mt-1 ${
                            msg.senderType === "user" ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleString("zh-CN")}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100">
              {/* 文件预览 */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm"
                    >
                      <span>{file.type.startsWith("image/") ? "图" : "PDF"}</span>
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✖️
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-3">
                {/* 视频/语音通话 */}
                {primaryCaseId && (
                  <>
                    <button
                      onClick={() => setCallModal({ type: "video" })}
                      className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      title="视频通话"
                    >
                      视频
                    </button>
                    <button
                      onClick={() => setCallModal({ type: "voice" })}
                      className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      title="语音通话"
                    >
                      语音
                    </button>
                  </>
                )}
                {/* 文件上传按钮 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  title="上传文件"
                >
                  附
                </button>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "上传中..." : sending ? "发送中..." : "发送"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                我们的移民顾问会尽快回复您的消息
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 视频/语音通话弹窗 */}
      {callModal && primaryCaseId && (
        <CallModal
          caseId={primaryCaseId}
          type={callModal.type}
          role="member"
          onClose={() => setCallModal(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            }`}
          >
            <span className="text-2xl">
              {toast.type === 'success' ? '成功' : '失败'}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载消息中...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
