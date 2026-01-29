"use client";

import { useEffect, useState } from "react";
import { Application } from "@/types/application";

export default function VisitorVisaReviewPage() {
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("current_application");
    if (stored) {
      setApplication(JSON.parse(stored));
    }
  }, []);

  if (!application) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
            <span className="font-semibold text-red-600">加移AI助理</span>
          </a>
          <a href="/applications" className="text-slate-600 hover:text-slate-900">
            ← 返回申请列表
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">申请已提交</h1>
              <p className="text-slate-600">您的访客签证申请已提交给 RCIC 审核</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600">申请编号</span>
              <span className="font-mono font-semibold text-blue-600">{application.id}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-600">申请类型</span>
              <span className="font-semibold">访客签证 (IMM 5257)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">当前状态</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                等待 RCIC 审核
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-semibold text-slate-900 mb-4">接下来会发生什么？</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">1</div>
                <p className="text-slate-600">RCIC 持牌顾问将在 1-2 个工作日内审核您的申请</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">2</div>
                <p className="text-slate-600">如有需要修改的地方，顾问会通过邮件联系您</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">3</div>
                <p className="text-slate-600">审核通过后，我们将协助您提交正式申请</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">申请信息摘要</h2>
          <div className="space-y-4">
            {application.fields.map((field) => (
              <div key={field.key} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-600">{field.label}</span>
                <span className="font-medium text-slate-900 max-w-[60%] text-right">
                  {field.value || <span className="text-slate-400">未填写</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
