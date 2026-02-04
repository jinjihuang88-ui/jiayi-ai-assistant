"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  userType: "rcic" | "team_member";
  role?: string;
}

interface Conversation {
  id: string;
  otherUser: User;
  lastMessageAt: string;
  lastMessageContent: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content?: string;
  messageType: string;
  fileUrl?: string;
  fileName?: string;
  senderId: string;
  senderType: string;
  createdAt: string;
}

export default function InternalChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMembers, setAllMembers] = useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchAllMembers();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      setSelectedMember(null);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedMember) {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [selectedMember]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/internal/conversations");
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("获取对话列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMembers = async () => {
    try {
      const res = await fetch("/api/internal/members");
      const data = await res.json();

      if (data.success) {
        setAllMembers(data.members);
      }
    } catch (error) {
      console.error("获取成员列表失败:", error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/internal/messages?conversationId=${conversationId}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("获取消息失败:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const receiver = selectedConversation?.otherUser || selectedMember;
    if (!receiver) return;

    setSending(true);
    try {
      const res = await fetch("/api/internal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: receiver.id,
          receiverType: receiver.userType,
          content: newMessage,
          messageType: "text",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
        fetchConversations(); // 更新对话列表
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const receiver = selectedConversation?.otherUser || selectedMember;
    if (!receiver) return;

    setUploading(true);
    try {
      // 先上传文件
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        alert(uploadData.message || "文件上传失败");
        return;
      }

      // 发送消息
      const messageType = file.type.startsWith("image/") ? "image" : "file";

      const res = await fetch("/api/internal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: receiver.id,
          receiverType: receiver.userType,
          messageType,
          fileUrl: uploadData.file.url,
          fileName: uploadData.file.name,
          fileSize: uploadData.file.size,
          fileMimeType: uploadData.file.type,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        fetchConversations();
      }
    } catch (error) {
      console.error("上传文件失败:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const currentChatUser = selectedConversation?.otherUser || selectedMember;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* 左侧对话列表 */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-white">内部通讯</h2>
              <p className="text-sm text-slate-400 mt-1">团队成员聊天</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition-colors"
              title="返回控制台"
            >
              ← 返回
            </button>
          </div>
          <button
            onClick={() => setShowMemberList(!showMemberList)}
            className="mt-3 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
          >
            + 新建对话
          </button>
        </div>

        {showMemberList && (
          <div className="p-4 bg-slate-700/50 border-b border-slate-700">
            <h3 className="text-sm font-medium text-white mb-2">选择成员</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member);
                    setShowMemberList(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-600 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{member.name}</p>
                    <p className="text-xs text-slate-400 truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-slate-400">暂无对话</p>
              <p className="text-sm text-slate-500 mt-2">点击"新建对话"开始聊天</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id
                    ? "bg-slate-700"
                    : "hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {conv.otherUser.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white truncate">
                        {conv.otherUser.name}
                      </h3>
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate mt-1">
                      {conv.lastMessageContent}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右侧消息区域 */}
      <div className="flex-1 flex flex-col">
        {currentChatUser ? (
          <>
            {/* 消息头部 */}
            <div className="p-4 bg-slate-800 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {currentChatUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    {currentChatUser.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {currentChatUser.role}
                  </p>
                </div>
              </div>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.senderId !== currentChatUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        isMine
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {msg.messageType === "text" && <p>{msg.content}</p>}
                      {msg.messageType === "file" && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 underline"
                        >
                          <span>📎</span>
                          <span>{msg.fileName}</span>
                        </a>
                      )}
                      {msg.messageType === "image" && (
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName}
                          className="max-w-full rounded"
                        />
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 消息输入框 */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-800 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
                  title="上传文件或图片"
                >
                  {uploading ? "⏳" : "📎"}
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-slate-400">选择一个对话或成员开始聊天</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
