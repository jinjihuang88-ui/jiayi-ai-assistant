"use client";

import { ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm " +
        "shadow-[0_0_30px_-5px_rgba(0,255,136,0.08)] " +
        className
      }
    >
      {children}
    </div>
  );
}
