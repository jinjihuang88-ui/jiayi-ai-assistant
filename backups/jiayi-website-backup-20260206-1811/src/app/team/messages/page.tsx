"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

interface Application {
  id: string;
  type: string;
  title: string;
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
  isRead: boolean;
  createdAt: string;
  user: User;
  application: Application | null;
  attachments: Attachment[];
}

interface Conversation {
  caseId: string;
  case: Application;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

function TeamMessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseIdParam = searchParams.get("caseId");

  const [member, setMember] = useState<TeamMember | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(caseIdParam);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (member) {
      fetchConversations();
    }
  }, [member]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

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

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/team/conversations");
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (caseId: string) => {
    try {
      const res = await fetch(`/api/team/messages?caseId=${caseId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
        // 标记为已读
        await fetch("/api/team/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: caseId }),
        });
        // 刷新对话列表
        fetchConversations();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !selectedConversation) return;

    setSending(true);
    try {
      const res = await fetch("/api/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedConversation,
          content: newMessage,
          messageType: "text",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
        fetchConversations();
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
    if (!file || !selectedConversation) return;

    setUploading(true);
    setShowUploadMenu(false);

    try {
      // 上传文件
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        alert(uploadData.message);
        return;
      }

      // 发送带附件的消息
      const res = await fetch("/api/team/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedConversation,
          content: type === "image" ? "发送了一张图片" : `发送了文件: ${file.name}`,
          messageType: type,
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
        fetchConversations();
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

  const selectedConv = conversations.find((c) => c.caseId === selectedConversation);

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
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">消息中心</h1>
              <p className="text-sm text-slate-400">与用户沟通</p>
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
        {/* 对话列表 */}
        <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="font-semibold text-white">对话列表</h2>
            <p className="text-sm text-slate-400 mt-1">共 {conversations.length} 个对话</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-slate-400 text-sm">暂无对话</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.caseId}
                  onClick={() => setSelectedConversation(conv.caseId)}
                  className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                    selectedConversation === conv.caseId
                      ? "bg-slate-700"
                      : "hover:bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">
                        {conv.user.name?.[0] || conv.user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white truncate">
                          {conv.user.name || conv.user.email}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate">
                        {conv.lastMessage.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatTime(conv.lastMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 flex flex-col bg-slate-900">
          {selectedConversation && selectedConv ? (
            <>
              {/* 对话头部 */}
              <div className="p-4 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {selectedConv.user.name?.[0] || selectedConv.user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">
                      {selectedConv.user.name || selectedConv.user.email}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {selectedConv.case.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === "team_member" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl ${
                        msg.senderType === "team_member"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-slate-800 text-white"
                      }`}
                    >
                      {msg.messageType === "image" && msg.attachments.length > 0 ? (
                        <img
                          src={msg.attachments[0].url}
                          alt="图片"
                          className="max-w-full rounded-lg"
                        />
                      ) : msg.messageType === "file" && msg.attachments.length > 0 ? (
                        <a
                          href={msg.attachments[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 underline"
                        >
                          <span>📄</span>
                          <span>{msg.attachments[0].fileName}</span>
                        </a>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <p className="text-xs mt-2 opacity-70">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-slate-700 bg-slate-800">
                <div className="flex items-center gap-3">
                  {/* 文件上传按钮 */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUploadMenu(!showUploadMenu)}
                      disabled={uploading}
                      className="p-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50 transition-colors"
                      title="上传文件"
                    >
                      {uploading ? "⏳" : "📎"}
                    </button>

                    {showUploadMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-slate-700 rounded-xl shadow-lg border border-slate-600 overflow-hidden">
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 w-full text-left text-white"
                        >
                          <span className="text-lg">🖼️</span>
                          <span className="text-sm">发送图片</span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-600 w-full text-left text-white"
                        >
                          <span className="text-lg">📎</span>
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
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-slate-400">选择一个对话开始聊天</p>
              </div>
            </div>
          )}
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
