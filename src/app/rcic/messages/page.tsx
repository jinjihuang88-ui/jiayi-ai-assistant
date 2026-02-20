"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CallModal from "@/components/CallModal";

interface RCIC {
  id: string;
  name: string;
  licenseNo: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

interface Contact {
  contactId: string;
  name: string;
  email: string;
  avatar?: string | null;
  caseIds: string[];
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
  messageType?: string;
  senderType: string;
  senderName?: string | null;
  isRead?: boolean;
  createdAt: string;
  user?: User;
  application?: { id: string } | null;
  attachments: Attachment[];
}

function RCICMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get("contactId");

  const [rcic, setRcic] = useState<RCIC | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(contactIdParam);
  const [primaryCaseId, setPrimaryCaseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [callModal, setCallModal] = useState<{ type: "video" | "voice"; roomId?: string | null } | null>(null);
  const [incomingRooms, setIncomingRooms] = useState<{ roomId: string; type: "video" | "voice" }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const cid = searchParams.get("contactId");
    if (cid) setSelectedContactId(cid);
  }, [searchParams]);

  useEffect(() => {
    if (rcic) {
      fetchContacts();
    }
  }, [rcic]);

  useEffect(() => {
    if (selectedContactId) {
      fetchMessages(selectedContactId);
    } else {
      setMessages([]);
      setPrimaryCaseId(null);
    }
  }, [selectedContactId]);

  // 轮询来电
  useEffect(() => {
    if (!primaryCaseId) return;
    const poll = () => {
      fetch(`/api/call/rooms?caseId=${primaryCaseId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.rooms?.length) {
            setIncomingRooms(
              data.rooms.map((r: { roomId: string; type: string }) => ({
                roomId: r.roomId,
                type: r.type === "voice" ? "voice" : "video",
              }))
            );
          } else {
            setIncomingRooms([]);
          }
        })
        .catch(() => setIncomingRooms([]));
    };
    poll();
    const t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [primaryCaseId]);

  // 轮询新消息：每 5 秒静默拉取，有新消息才更新
  useEffect(() => {
    if (!selectedContactId) return;
    const pollMessages = async () => {
      try {
        const res = await fetch(`/api/rcic/messages?contactId=${encodeURIComponent(selectedContactId)}`);
        const data = await res.json();
        if (data.success && data.messages) {
          const incoming = data.messages as Message[];
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

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/rcic/messages/contacts");
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await fetch(`/api/rcic/messages?contactId=${encodeURIComponent(contactId)}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages || []);
        setPrimaryCaseId(data.primaryCaseId ?? null);

        if (data.primaryCaseId) {
          await fetch("/api/rcic/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applicationId: data.primaryCaseId }),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContactId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/rcic/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContactId,
          caseId: primaryCaseId,
          content: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("发送失败");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (file: File, type: "image" | "file") => {
    if (!file || !selectedContactId) return;

    setUploading(true);
    setShowUploadMenu(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        alert(uploadData.message);
        return;
      }

      const res = await fetch("/api/rcic/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContactId,
          caseId: primaryCaseId,
          content: type === "image" ? "发送了一张图片" : `发送了文件: ${file.name}`,
          attachments: [{
            fileName: uploadData.filename,
            url: uploadData.url,
            fileSize: uploadData.fileSize,
            mimeType: uploadData.mimeType,
          }],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("上传失败");
    } finally {
      setUploading(false);
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

  const renderAttachment = (attachment: Attachment) => {
    if (attachment.fileType === "image") {
      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2"
        >
          <img
            src={attachment.url}
            alt={attachment.fileName}
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
          />
        </a>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          {attachment.mimeType.includes("pdf") ? "PDF" : "附"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{attachment.fileName}</div>
          <div className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</div>
        </div>
      </a>
    );
  };

  const selectedContact = contacts.find((c) => c.contactId === selectedContactId);

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              返回首页
            </a>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">RCIC</span>
              </div>
              <div>
                <h1 className="font-semibold text-white">RCIC 顾问后台</h1>
                <p className="text-sm text-slate-400">移民顾问管理系统</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/rcic/dashboard" className="text-slate-400 hover:text-white transition-colors">仪表板</a>
            <a href="/rcic/cases" className="text-slate-400 hover:text-white transition-colors">案件管理</a>
            <a href="/rcic/messages" className="text-emerald-400 font-medium">消息</a>
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
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar - 会员联系人 */}
          <div className="w-80 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="font-semibold text-white">消息</h2>
              <p className="text-sm text-slate-400">与会员沟通</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  暂无联系人
                </div>
              ) : (
                contacts.map((c) => (
                  <button
                    key={c.contactId}
                    onClick={() => setSelectedContactId(c.contactId)}
                    className={`w-full p-4 text-left border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                      selectedContactId === c.contactId ? "bg-emerald-900/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {c.avatar ? (
                        <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg text-white">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{c.name}</div>
                        <div className="text-sm text-slate-400 truncate">{c.email}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col">
            {!selectedContactId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400 font-bold text-xl">聊</div>
                <p>选择左侧会员开始沟通</p>
              </div>
            ) : (
              <>
                {/* 来电提示 */}
                {incomingRooms.length > 0 && (
                  <div className="p-4 border-b border-slate-700 bg-amber-900/20 flex items-center justify-between gap-4">
                    <span className="text-amber-400 text-sm">
                      用户发起{incomingRooms[0].type === "video" ? "视频" : "语音"}通话
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCallModal({ type: incomingRooms[0].type, roomId: incomingRooms[0].roomId });
                          setIncomingRooms([]);
                        }}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500"
                      >
                        接听
                      </button>
                      <button
                        onClick={() => setIncomingRooms([])}
                        className="px-4 py-2 rounded-lg bg-slate-600 text-slate-300 text-sm hover:bg-slate-500"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedContact?.name || selectedContact?.email}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {selectedContact?.email}
                    </p>
                  </div>
                  {primaryCaseId && (
                    <a
                      href={`/rcic/cases/${primaryCaseId}`}
                      className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-sm hover:bg-emerald-600/30 transition-colors"
                    >
                      查看案件
                    </a>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400 font-bold text-xl">聊</div>
                      <p>暂无消息</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
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
                                会员
                              </div>
                            )}
                            {msg.messageType === "text" && (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div>
                                {msg.attachments.map((att) => (
                                  <div key={att.id}>{renderAttachment(att)}</div>
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

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-3 items-end">
                    {/* 视频/语音通话 */}
                    <button
                      onClick={() => setCallModal({ type: "video" })}
                      className="p-3 rounded-xl border border-slate-600 hover:bg-slate-700 transition-colors"
                      title="视频通话"
                    >
                      <span className="text-slate-400 text-sm">视频</span>
                    </button>
                    <button
                      onClick={() => setCallModal({ type: "voice" })}
                      className="p-3 rounded-xl border border-slate-600 hover:bg-slate-700 transition-colors"
                      title="语音通话"
                    >
                      <span className="text-slate-400 text-sm">语音</span>
                    </button>
                    {/* Upload Button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowUploadMenu(!showUploadMenu)}
                        disabled={uploading}
                        className="p-3 rounded-xl border border-slate-600 hover:bg-slate-700 transition-colors disabled:opacity-50"
                      >
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        )}
                      </button>

                      {showUploadMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-slate-700 rounded-xl shadow-lg border border-slate-600 overflow-hidden">
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 w-full text-left text-white"
                          >
                            <span className="text-sm font-bold">图</span>
                            <span className="text-sm">发送图片</span>
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 w-full text-left text-white"
                          >
                            <span className="text-sm font-bold">附</span>
                            <span className="text-sm">发送文件</span>
                          </button>
                        </div>
                      )}

                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "image");
                          e.target.value = "";
                        }}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "file");
                          e.target.value = "";
                        }}
                      />
                    </div>

                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? "发送中..." : "发送"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 视频/语音通话弹窗 */}
      {callModal && primaryCaseId && (
        <CallModal
          caseId={primaryCaseId}
          type={callModal.type}
          role="rcic"
          roomId={callModal.roomId}
          onClose={() => setCallModal(null)}
        />
      )}
    </main>
  );
}

export default function RCICMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载消息中...</p>
        </div>
      </div>
    }>
      <RCICMessagesContent />
    </Suspense>
  );
}
