"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CaseDetail {
  id: string;
  type: string;
  status: string;
  title: string;
  assignedTeamMemberId: string | null;
  rcicReviewedAt: string | null;
  user: { name: string | null; email: string };
  _count: { messages: number };
}

export default function TeamCaseDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/team/cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.case) {
          const c = data.case;
          setCaseDetail({
            id: c.id,
            type: c.type || "",
            status: c.status || "",
            title: c.title || "",
            assignedTeamMemberId: c.assignedTeamMemberId ?? null,
            rcicReviewedAt: c.rcicReviewedAt ?? null,
            user: c.user || { name: null, email: "" },
            _count: c._count || { messages: 0 },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkReviewed = async () => {
    if (!id) return;
    setReviewing(true);
    try {
      const res = await fetch(`/api/team/cases/${id}/review`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const r = await fetch(`/api/team/cases/${id}`);
        const j = await r.json();
        if (j.success && j.case) setCaseDetail({ ...j.case });
      }
    } finally {
      setReviewing(false);
    }
  };

  if (loading || !id) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <a
          href="/team/cases"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6"
        >
          ← 返回案件列表
        </a>
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
          <h1 className="text-xl font-semibold text-white mb-2">
            {caseDetail?.title || `案件 ${id.slice(0, 8)}`}
          </h1>
          <p className="text-sm text-slate-400 mb-4">
            用户：{caseDetail?.user?.name || caseDetail?.user?.email} ·{" "}
            {caseDetail?._count?.messages ?? 0} 条消息
          </p>
          <div className="flex items-center gap-4">
            {caseDetail?.rcicReviewedAt ? (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm">
                ✓ 持牌顾问已审核 ·{" "}
                {new Date(caseDetail.rcicReviewedAt).toLocaleString("zh-CN")}
              </span>
            ) : (
              <button
                onClick={handleMarkReviewed}
                disabled={reviewing}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-50"
              >
                {reviewing ? "提交中…" : "标记为已审核"}
              </button>
            )}
            <a href="/team/messages" className="text-sm text-purple-400 hover:text-purple-300">
              去消息沟通 →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
