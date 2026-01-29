"use client";

import { useEffect, useState } from "react";
import { Application } from "@/types/application";

export default function RcicCasesPage() {
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("current_application");
    if (raw) {
      setApplication(JSON.parse(raw));
    }
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8">
        RCIC · 待审核案件
      </h1>

      {!application && (
        <div className="text-slate-500">
          暂无待审核案件
        </div>
      )}

      {application && (
        <div className="border rounded-xl bg-white p-6 flex justify-between items-center">
          <div>
            <div className="font-medium">
              案件编号：{application.id}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              类型：学签（IMM 1294）
            </div>
            <div className="text-sm text-slate-500 mt-1">
              状态：{application.status}
            </div>
          </div>

          <a
            href={`/rcic/case/${application.id}`}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
          >
            开始审核
          </a>
        </div>
      )}
    </main>
  );
}
