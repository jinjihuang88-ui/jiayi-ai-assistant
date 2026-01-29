import Link from "next/link";

export default function ChatHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="加移AI助理"
              className="h-10 w-10 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="font-semibold text-base tracking-tight bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              加移AI助理
            </div>
            <div className="text-xs text-slate-500">
              AI Immigration Consultation
            </div>
          </div>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>咨询模式</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500">Official Data Powered</span>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>
    </header>
  );
}
