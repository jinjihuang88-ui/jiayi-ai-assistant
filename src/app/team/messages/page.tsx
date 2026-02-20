"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CallModal from "@/components/CallModal";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  rcicId: string;
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
  attachments: Attachment[] | { url?: string; name?: string; fileName?: string }[];
}

function TeamMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get("contactId");

  const [member, setMember] = useState<TeamMember | null>(null);
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
    if (member) {
      fetchContacts();
    }
  }, [member]);

  useEffect(() => {
    if (selectedContactId) {
      fetchMessages(selectedContactId);
    } else {
      setMessages([]);
      setPrimaryCaseId(null);
    }
  }, [selectedContactId]);

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
        const res = await fetch(`/api/team/messages?contactId=${encodeURIComponent(selectedContactId)}`);
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
      const res = await fetch("/api/team/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/team/login");
        return;
      }

      setMember(data.member);
    } catch (error) {
      router.push("/team/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/team/messages/contacts");
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await fetch(`/api/team/messages?contactId=${encodeURIComponent(contactId)}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages || []);
        setPrimaryCaseId(data.primaryCaseId ?? null);

        if (data.primaryCaseId) {
          await fetch("/api/team/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caseId: data.primaryCaseId }),
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
    if (!newMessage.trim() || sending || !selectedContactId) return;

    setSending(true);
    try {
      const res = await fetch("/api/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContactId,
          caseId: primaryCaseId,
          content: newMessage,
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

      const res = await fetch("/api/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selectedContactId,
          caseId: primaryCaseId,
          content: type === "image" ? "发送了一张图片" : `发送了文件: ${file.name}`,
          fileUrl: uploadData.url,
          fileName: uploadData.filename,
          fileType: uploadData.mimeType,
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
    await fetch("/api/team/auth/logout", { method: "POST" });
    router.push("/team/login");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "昨天";
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  const selectedContact = contacts.find((c) => c.contactId === selectedContactId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">聊</span>
              </div>
              <div>
                <h1 className="font-semibold text-white">消息中心</h1>
                <p className="text-sm text-slate-400">与用户沟通</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/team/dashboard" className="text-slate-400 hover:text-white transition-colors">仪表板</a>
            <a href="/team/cases" className="text-slate-400 hover:text-white transition-colors">案件管理</a>
            <a href="/team/messages" className="text-purple-400 font-medium">消息</a>
            <a href="/internal/chat" className="text-slate-400 hover:text-white transition-colors">内部通讯</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">{member?.name}</div>
              <div className="text-xs text-slate-400">{member?.role}</div>
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

      <div className="flex h-[calc(100vh-73px)]">
        {/* 会员联系人列表 */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold text-white">消息</h2>
            <p className="text-sm text-slate-400 mt-1">与会员沟通 · 共 {contacts.length} 人</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-400 font-bold">聊</div>
                <p className="text-slate-400 text-sm">暂无联系人</p>
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.contactId}
                  onClick={() => setSelectedContactId(c.contactId)}
                  className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                    selectedContactId === c.contactId ? "bg-slate-700" : "hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {c.avatar ? (
                      <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium">{c.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{c.name}</div>
                      <div className="text-sm text-slate-400 truncate">{c.email}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {selectedContactId && selectedContact ? (
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

              {/* 对话头部 */}
              <div className="p-4 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-3">
                  {selectedContact.avatar ? (
                    <img src={selectedContact.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-medium">{selectedContact.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-white">{selectedContact.name}</h3>
                    <p className="text-sm text-slate-400">{selectedContact.email}</p>
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                  const atts = Array.isArray(msg.attachments) ? msg.attachments : [];
                  const firstAtt = atts[0];
                  const isRcic = msg.senderType === "rcic";
                  return (
                  <div
                    key={msg.id}
                    className={`flex ${isRcic ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        isRcic
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {firstAtt?.url ? (
                        /\.(jpg|jpeg|png|gif|webp)/i.test(firstAtt.url) ? (
                          <img
                            src={firstAtt.url}
                            alt="图片"
                            className="max-w-full rounded-lg"
                          />
                        ) : (
                          <a
                            href={firstAtt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 underline"
                          >
                            <span>PDF</span>
                            <span>{(firstAtt as { fileName?: string; name?: string }).fileName ?? (firstAtt as { fileName?: string; name?: string }).name ?? "文件"}</span>
                          </a>
                        )
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <p className="text-xs mt-2 opacity-70">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex items-center gap-3">
                  {/* 视频/语音通话 */}
                  <button
                    onClick={() => setCallModal({ type: "video" })}
                    className="p-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50 transition-colors"
                    title="视频通话"
                  >
                    视频
                  </button>
                  <button
                    onClick={() => setCallModal({ type: "voice" })}
                    className="p-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50 transition-colors"
                    title="语音通话"
                  >
                    语音
                  </button>
                  {/* 文件上传按钮 */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUploadMenu(!showUploadMenu)}
                      disabled={uploading}
                      className="p-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50 transition-colors"
                      title="上传文件"
                    >
                      {uploading ? "..." : "附"}
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

                  {/* 消息输入框 */}
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="输入消息..."
                    disabled={sending || uploading}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />

                  {/* 发送按钮 */}
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending || uploading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? "发送中..." : "发送"}
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {/* 视频/语音通话弹窗 */}
          {callModal && primaryCaseId && (
            <CallModal
              caseId={primaryCaseId}
              type={callModal.type}
              role="team"
              roomId={callModal.roomId}
              onClose={() => setCallModal(null)}
            />
          )}

          {!selectedContactId || !selectedContact ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400 font-bold text-xl">聊</div>
                <p className="text-slate-400">选择左侧会员开始聊天</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function TeamMessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TeamMessagesContent />
    </Suspense>
  );
}
