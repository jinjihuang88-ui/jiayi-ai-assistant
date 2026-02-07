"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Application, ApplicationField } from "@/types/application";

interface CaseDetail {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string | null;
  assignedTeamMemberId: string | null;
  rcicReviewedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null; phone: string | null };
  assignedTeamMember: { id: string; name: string; email: string; role: string } | null;
  _count: { messages: number };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function RcicCaseDetail() {
  const params = useParams();
  const router = useRouter();
  const caseId = typeof params?.id === "string" ? params.id : null;
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (caseId) {
      fetch(`/api/rcic/cases/${caseId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.case) {
            setCaseDetail(data.case);
            setTeamMembers(data.teamMembers || []);
          }
        })
        .catch(() => {});
    }
  }, [caseId]);

  useEffect(() => {
    if (!caseId || caseDetail) return;
    const raw = localStorage.getItem("current_application");
    if (raw) {
      try {
        setApplication(JSON.parse(raw));
      } catch (_) {}
    }
  }, [caseId, caseDetail]);

  const handleAssign = async (memberId: string | null) => {
    if (!caseId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/rcic/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTeamMemberId: memberId || null }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = await fetch(`/api/rcic/cases/${caseId}`).then((r) => r.json());
        if (updated.success) setCaseDetail(updated.case);
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (!caseId) return;
    setReviewing(true);
    try {
      const res = await fetch(`/api/rcic/cases/${caseId}/review`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const updated = await fetch(`/api/rcic/cases/${caseId}`).then((r) => r.json());
        if (updated.success) setCaseDetail(updated.case);
      }
    } finally {
      setReviewing(false);
    }
  };

  // 更新字段 review
  function updateReview(
    key: string,
    status: "ok" | "fix",
    comment: string
  ) {
    if (!application) return;

    const updated: Application = {
      ...application,
      fields: application.fields?.map((f) =>
        f.key === key
          ? {
              ...f,
              review: { status, comment },
            }
          : f
      ),
    };

    setApplication(updated);
    localStorage.setItem("current_application", JSON.stringify(updated));
  }

  // 提交 RCIC 审核结论
  function submitConclusion(result: "needs_revision" | "approved", comment: string) {
    if (!application) return;

    const updated: Application = {
      ...application,
      status: result,
      rcicConclusion: {
        result:
          result === "approved"
            ? "审核通过"
            : "需要用户修改",
        comment,
      },
    };

    localStorage.setItem("current_application", JSON.stringify(updated));
    alert("审核结果已保存");
  }

  if (caseDetail) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <a href="/rcic/cases" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
            ← 返回案件列表
          </a>
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 mb-6">
            <h1 className="text-xl font-semibold text-white mb-1">{caseDetail.title || `案件 ${caseDetail.id.slice(0, 8)}`}</h1>
            <p className="text-xs text-slate-500 mb-2">案件 = 签合同收费后形成，由顾问跟踪至确定结束。案内含跟进、消息、文件与资料审核。</p>
            <p className="text-sm text-slate-400 mb-4">
              用户：{caseDetail.user.name || caseDetail.user.email} · {caseDetail._count.messages} 条消息
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-xs text-slate-500 block mb-1">指派跟进人</label>
                <select
                  value={caseDetail.assignedTeamMemberId ?? ""}
                  onChange={(e) => handleAssign(e.target.value || null)}
                  disabled={assigning}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm min-w-[180px]"
                >
                  <option value="">未指派</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}（{m.role || "操作员"}）</option>
                  ))}
                </select>
              </div>
              <div>
                {caseDetail.rcicReviewedAt ? (
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm">
                    ✓ 用户申请资料已审核（持牌顾问）· {new Date(caseDetail.rcicReviewedAt).toLocaleString("zh-CN")}
                  </span>
                ) : (
                  <button
                    onClick={handleMarkReviewed}
                    disabled={reviewing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {reviewing ? "提交中…" : "用户申请资料已审核"}
                  </button>
                )}
              </div>
              <a
                href="/rcic/messages"
                className="text-sm text-emerald-400 hover:text-emerald-300"
              >
                去消息沟通 →
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!application) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        未找到案件
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <header>
        <h1 className="text-2xl font-semibold">
          RCIC 审核 · 案件 {application.id}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          学签申请（IMM 1294）
        </p>
      </header>

      {/* 字段审核 */}
      {application.fields?.map((field: ApplicationField) => (
        <div
          key={field.key}
          className="border rounded-lg p-4 bg-white space-y-3"
        >
          <div className="font-medium">
            {field.label}
          </div>

          <div className="text-sm text-slate-700">
            用户填写：{field.value || "（未填写）"}
          </div>

          {field.aiHint && (
            <div className="text-xs text-amber-600">
              AI 提示：{field.aiHint}
            </div>
          )}

          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={3}
            placeholder="RCIC 批注（给用户的修改建议）"
            defaultValue={field.review?.comment || ""}
            onBlur={(e) =>
              updateReview(
                field.key,
                field.review?.status || "fix",
                e.target.value
              )
            }
          />

          <div className="flex gap-2 text-sm">
            <button
              onClick={() =>
                updateReview(
                  field.key,
                  "ok",
                  field.review?.comment || ""
                )
              }
              className={`px-3 py-1 rounded ${
                field.review?.status === "ok"
                  ? "bg-green-600 text-white"
                  : "border"
              }`}
            >
              通过
            </button>

            <button
              onClick={() =>
                updateReview(
                  field.key,
                  "fix",
                  field.review?.comment || ""
                )
              }
              className={`px-3 py-1 rounded ${
                field.review?.status === "fix"
                  ? "bg-red-600 text-white"
                  : "border"
              }`}
            >
              需修改
            </button>
          </div>
        </div>
      ))}

      {/* RCIC 总结论 */}
      <section className="border-t pt-8 space-y-4">
        <h2 className="font-medium text-lg">
          审核结论
        </h2>

        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm"
          rows={4}
          placeholder="RCIC 官方审核意见（展示给用户）"
          defaultValue={application.rcicConclusion?.comment || ""}
          id="finalComment"
        />

        <div className="flex gap-4">
          <button
            onClick={() =>
              submitConclusion(
                "needs_revision",
                (document.getElementById(
                  "finalComment"
                ) as HTMLTextAreaElement).value
              )
            }
            className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm"
          >
            需要用户修改
          </button>

          <button
            onClick={() =>
              submitConclusion(
                "approved",
                (document.getElementById(
                  "finalComment"
                ) as HTMLTextAreaElement).value
              )
            }
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm"
          >
            审核通过
          </button>
        </div>
      </section>
    </main>
  );
}
