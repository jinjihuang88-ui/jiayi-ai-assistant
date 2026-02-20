"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/member/documents");
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401) {
          router.push("/auth/login");
          return;
        }
      }

      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 上传文件到Cloudinary
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (uploadData.success) {
          // 保存文档记录到数据库
          const saveRes = await fetch("/api/member/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              url: uploadData.url,
              type: file.type,
              size: file.size,
            }),
          });

          const saveData = await saveRes.json();
          if (!saveData.success) {
            console.error('Save document failed:', saveData.message);
          }
        }

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      showToast("文档上传成功！", "success");
      fetchDocuments();
    } catch (error) {
      console.error("Upload error:", error);
      showToast("上传失败，请重试", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ""; // 重置input
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个文档吗？")) return;

    try {
      const res = await fetch(`/api/member/documents/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setDocuments(documents.filter((doc) => doc.id !== id));
        showToast("删除成功", "success");
      } else {
        showToast(data.message || "删除失败", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("删除失败，请重试", "error");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "图";
    if (type.includes("pdf")) return "PDF";
    if (type.includes("word") || type.includes("document")) return "文档";
    if (type.includes("excel") || type.includes("spreadsheet")) return "表";
    return "附";
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">文档管理</h1>
          <p className="text-slate-600">上传申请相关的文档和图片，移民顾问可以查看和下载</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8 mb-8 text-center hover:border-blue-500 transition-colors">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-600 font-bold text-xl">传</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">上传文档</h3>
          <p className="text-sm text-slate-500 mb-4">
            支持 PDF、Word、Excel、图片等格式，单个文件最大 10MB
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 cursor-pointer">
            <span>选择文件</span>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-600 mt-2">上传中... {uploadProgress.toFixed(0)}%</p>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">我的文档</h2>
            <p className="text-sm text-slate-500 mt-1">共 {documents.length} 个文档</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">加载中...</div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500 font-bold text-xl">无</div>
              <p>还没有上传任何文档</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getFileIcon(doc.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{doc.name}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {formatFileSize(doc.size)} · 上传于 {new Date(doc.createdAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100"
                      >
                        查看
                      </a>
                      <a
                        href={doc.url}
                        download={doc.name}
                        className="px-4 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100"
                      >
                        下载
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">温馨提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 建议上传清晰的扫描件或照片，确保文字清晰可读</li>
            <li>• 常用文档包括：护照、身份证、学历证明、工作证明、银行流水等</li>
            <li>• 上传的文档会被加密存储，只有您和您的移民顾问可以查看</li>
            <li>• 如需删除文档，请联系您的移民顾问确认后再操作</li>
          </ul>
        </div>
      </div>

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
