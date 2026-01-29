export default function Home() {
  return (
    <main className="bg-slate-50 text-slate-900">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="加移AI助理 Logo"
              className="h-8 w-8"
            />
            <div className="font-semibold text-base tracking-tight">
              加移AI助理
              <span className="ml-2 text-sm font-normal text-slate-500">
                MaplePath AI
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="/assessment" className="hover:text-slate-900">
              免费评估
            </a>
            <a href="/chat" className="hover:text-slate-900">
              AI 咨询
            </a>
            <a
              href="/applications"
              className="hover:text-slate-900 font-medium"
            >
              我的申请
            </a>
            <a
              href="/rcic/cases"
              className="hover:text-slate-900 text-blue-600 font-medium"
            >
              RCIC 后台
            </a>
          </nav>

          {/* CTA */}
          <a
            href="/applications"
            className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            开始办理申请
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-6 py-32 text-white">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight max-w-3xl">
            AI-Powered Immigration Assistant
            <br />
            Built on Official Canadian Data
          </h1>

          <p className="text-slate-200 mt-4">
            覆盖加拿大 留学 · 就业 · 移民 的 AI 路径评估与申请平台
          </p>

          <p className="text-sm text-slate-100 mt-2">
            从 AI 评估 → 官方表格 → 持牌移民顾问审核，全流程在线完成
          </p>

          <div className="mt-12 flex gap-4">
            <a
              href="/applications"
              className="px-6 py-3 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition"
            >
              开始办理申请
            </a>
            <a
              href="/assessment"
              className="px-6 py-3 rounded-lg border border-white/40 hover:bg-white/10 transition"
            >
              免费 AI 移民评估
            </a>
            <a
              href="/chat"
              className="px-6 py-3 rounded-lg border border-white/40 hover:bg-white/10 transition"
            >
              AI 咨询
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Official Data Sources",
              desc: "分析基于加拿大移民官网（IRCC）与官方劳工数据",
            },
            {
              title: "Human-in-the-loop",
              desc: "关键节点由持牌移民顾问（RCIC）审核确认",
            },
            {
              title: "AI-Driven Workflow",
              desc: "AI 降低门槛，专家把关结果",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl bg-white border border-slate-200 p-8 shadow-sm"
            >
              <div className="font-semibold mb-2">{item.title}</div>
              <div className="text-sm text-slate-600">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-slate-500">
          © 加移AI助理 · MaplePath AI  
          <br />
          AI 辅助信息平台，不构成移民或法律建议
        </div>
      </footer>
    </main>
  );
}
