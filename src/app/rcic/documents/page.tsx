"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  caseId: string;
  caseType: string;
  caseTitle: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface RCIC {
  id: string;
  name: string;
  licenseNo: string | null;
}

function RCICDocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const caseId = searchParams.get("caseId");

  const [rcic, setRcic] = useState<RCIC | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchRCICInfo();
    fetchDocuments();
  }, [userId, caseId]);

  const fetchRCICInfo = async () => {
    try {
      const res = await fetch("/api/rcic/auth/me");
      const data = await res.json();

      if (!data.success) {
        router.push("/rcic/login");
        return;
      }

      setRcic(data.rcic);
    } catch (error) {
      console.error("Error fetching RCIC info:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (caseId) params.set("caseId", caseId);

      const res = await fetch(`/api/rcic/documents?${params}`);
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/rcic/login");
          return;
        }
        alert(data.message);
        return;
      }

      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("获取文档列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/rcic/auth/logout", { method: "POST" });
    router.push("/rcic/login");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
    return "📎";
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === "all") return true;
    if (filter === "images") return doc.type.startsWith("image/");
    if (filter === "documents") return !doc.type.startsWith("image/");
    return true;
  });

  // 按案件分组
  const documentsByCase = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.caseId]) {
      acc[doc.caseId] = {
        caseId: doc.caseId,
        caseType: doc.caseType,
        caseTitle: doc.caseTitle,
        user: doc.user,
        documents: [],
      };
    }
    acc[doc.caseId].documents.push(doc);
    return acc;
  }, {} as Record<string, any>);

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">RCIC 顾问后台</h1>
              <p className="text-sm text-slate-400">移民顾问管理系统</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="/rcic/dashboard" className="text-slate-400 hover:text-white transition-colors">
              仪表板
            </a>
            <a href="/rcic/cases" className="text-slate-400 hover:text-white transition-colors">
              案件管理
            </a>
            <a href="/rcic/messages" className="text-slate-400 hover:text-white transition-colors">
              消息
            </a>
            <a href="/rcic/documents" className="text-emerald-400 font-medium">
              文档管理
            </a>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">用户文档</h1>
          <p className="text-slate-400">查看和下载用户上传的申请文档</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            全部 ({documents.length})
          </button>
          <button
            onClick={() => setFilter("images")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "images"
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            图片 ({documents.filter((d) => d.type.startsWith("image/")).length})
          </button>
          <button
            onClick={() => setFilter("documents")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "documents"
                ? "bg-emerald-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            文档 ({documents.filter((d) => !d.type.startsWith("image/")).length})
          </button>
        </div>

        {/* Documents by Case */}
        {loading ? (
          <div className="text-center py-12 text-slate-400">加载中...</div>
        ) : Object.keys(documentsByCase).length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-slate-400">暂无文档</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(documentsByCase).map((group: any) => (
              <div
                key={group.caseId}
                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
              >
                {/* Case Header */}
                <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{group.caseTitle || "未命名案件"}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        用户: {group.user.name || group.user.email} · 案件ID: {group.caseId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="text-sm text-slate-400">{group.documents.length} 个文档</div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="divide-y divide-slate-700">
                  {group.documents.map((doc: Document) => (
                    <div key={doc.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{getFileIcon(doc.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{doc.name}</div>
                          <div className="text-sm text-slate-400 mt-1">
                            {formatFileSize(doc.size)} · 上传于{" "}
                            {new Date(doc.createdAt).toLocaleString("zh-CN")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                          >
                            查看
                          </a>
                          <a
                            href={doc.url}
                            download={doc.name}
                            className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
                          >
                            下载
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <h3 className="font-semibold text-emerald-400 mb-2">💡 温馨提示</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• 这里显示的是用户通过消息功能上传的所有文档</li>
            <li>• 您可以直接在线查看图片和PDF文档</li>
            <li>• 点击"下载"按钮可以将文档保存到本地</li>
            <li>• 文档按案件分组显示，方便您管理和查找</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function RCICDocumentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    }>
      <RCICDocumentsContent />
    </Suspense>
  );
}
