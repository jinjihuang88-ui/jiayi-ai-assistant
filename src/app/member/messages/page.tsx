"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Application {
  id: string;
  type: string;
  typeName: string;
}

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string | null;
  isRead: boolean;
  createdAt: string;
  application: Application | null;
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<string | null>(applicationId);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchApplications();
    fetchMessages();
  }, [selectedApp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/member/applications");
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedApp) params.set("applicationId", selectedApp);

      const res = await fetch(`/api/member/messages?${params}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
      }

      setMessages(data.messages?.reverse() || []);

      // 标记为已读
      if (selectedApp) {
        await fetch("/api/member/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: selectedApp }),
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

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/member/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp,
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

  const typeIconMap: Record<string, string> = {
    "study-permit": "🎓",
    "visitor-visa": "✈️",
    "work-permit": "💼",
    "express-entry": "🚀",
    "provincial-nominee": "🏛️",
  };

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
          {/* Sidebar - Application List */}
          <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">消息</h2>
              <p className="text-sm text-slate-500">与移民顾问沟通</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* All Messages */}
              <button
                onClick={() => setSelectedApp(null)}
                className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  !selectedApp ? "bg-red-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                    💬
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">全部消息</div>
                    <div className="text-sm text-slate-500">查看所有对话</div>
                  </div>
                </div>
              </button>

              {/* Application Conversations */}
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={`w-full p-4 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedApp === app.id ? "bg-red-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                      {typeIconMap[app.type] || "📄"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{app.typeName}</div>
                      <div className="text-sm text-slate-500 truncate">
                        #{app.id.slice(0, 8).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {applications.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">
                  暂无申请
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                {selectedApp
                  ? applications.find((a) => a.id === selectedApp)?.typeName || "对话"
                  : "全部消息"}
              </h3>
              <p className="text-sm text-slate-500">
                {selectedApp
                  ? `申请编号: ${selectedApp.slice(0, 8).toUpperCase()}`
                  : "选择一个申请开始对话"}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <div className="text-4xl mb-4">💬</div>
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
              <div className="flex gap-3">
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
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-medium hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "发送中..." : "发送"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                我们的移民顾问会尽快回复您的消息
              </p>
            </div>
          </div>
        </div>
      </div>
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
