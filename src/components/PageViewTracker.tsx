"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const TRACK_PATHS = ["/", "/risk-compass"];

/** 访问首页或 risk-compass 时上报一次，用于管理后台「页面点击率」 */
export function PageViewTracker() {
  const pathname = usePathname();
  const sent = useRef(false);

  useEffect(() => {
    if (!pathname || !TRACK_PATHS.includes(pathname) || sent.current) return;
    sent.current = true;
    fetch("/api/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
