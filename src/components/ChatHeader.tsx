import Link from "next/link";

export default function ChatHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="加移AI助理"
            className="h-8 w-8"
          />
          <div className="font-semibold text-sm tracking-tight">
            加移AI助理
            <span className="ml-2 text-xs font-normal text-slate-500">
              AI Immigration Consultation
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden md:block text-slate-500">
            咨询模式 · Official Data Powered
          </div>

          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900"
          >
            返回首页
          </Link>
        </div>
      </div>
    </header>
  );
}
