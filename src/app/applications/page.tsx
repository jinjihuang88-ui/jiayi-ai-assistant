// app/applications/page.tsx

export default function ApplicationsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8">我的申请</h1>

      <div className="space-y-6">
        {/* Study Permit */}
        <div className="border rounded-xl bg-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">学签申请（Study Permit）</h2>
            <p className="text-sm text-slate-500 mt-1">
              官方表格 IMM 1294 · AI 引导填写
            </p>
          </div>
          <a
            href="/applications/study-permit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            开始 / 继续填写
          </a>
        </div>

        {/* EE Placeholder */}
        <div className="border rounded-xl bg-slate-50 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">
              EE 技术移民（即将开放）
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              快速评估 + CRS 预估
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-slate-300 text-white text-sm cursor-not-allowed"
          >
            即将上线
          </button>
        </div>
      </div>
    </main>
  );
}
