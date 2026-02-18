"use client";

import { useState } from "react";
import { PromoChat } from "./PromoChat";

function RobotIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* 头部 */}
      <rect x="10" y="6" width="28" height="26" rx="6" fill="currentColor" opacity="0.9" />
      {/* 天线 */}
      <line x1="24" y1="6" x2="24" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="2" r="2" fill="currentColor" />
      {/* 左眼 */}
      <rect x="14" y="14" width="6" height="6" rx="1" fill="#0a0a0a" />
      <rect x="15" y="15" width="2" height="2" rx="0.5" fill="#00FF88" />
      {/* 右眼 */}
      <rect x="28" y="14" width="6" height="6" rx="1" fill="#0a0a0a" />
      <rect x="29" y="15" width="2" height="2" rx="0.5" fill="#00FF88" />
      {/* 嘴/扬声器 */}
      <rect x="18" y="26" width="12" height="4" rx="1" fill="#0a0a0a" />
      <line x1="20" y1="28" x2="28" y2="28" stroke="#00FF88" strokeWidth="0.5" opacity="0.8" />
    </svg>
  );
}

export function PromoChatFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 右下角浮动按钮 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 border-[#00FF88]/60 bg-black shadow-[0_0_24px_rgba(0,255,136,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_32px_rgba(0,255,136,0.5)] focus:outline-none focus:ring-2 focus:ring-[#00FF88] touch-manipulation"
        style={{ color: "#00FF88" }}
        aria-label={open ? "关闭 AI 顾问" : "打开 AI 顾问"}
      >
        <RobotIcon className="h-8 w-8" />
      </button>

      {/* 展开的聊天面板 */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[99] bg-black/50"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed bottom-16 right-4 left-4 sm:left-auto sm:right-6 sm:w-[min(400px,calc(100vw-48px))] z-[100] flex w-auto flex-col overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-[0_0_40px_rgba(0,255,136,0.15)]"
            style={{ maxHeight: "min(560px, 70vh)" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3" style={{ borderColor: "rgba(0,255,136,0.2)" }}>
              <span className="font-semibold" style={{ color: "#00FF88" }}>
                AI 顾问
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="关闭"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <PromoChat embedded />
            </div>
          </div>
        </>
      )}
    </>
  );
}
