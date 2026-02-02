"use client";

import { useEffect, useState } from "react";
import { Application, ApplicationField } from "@/types/application";

export default function RcicCaseDetail() {
  const [application, setApplication] = useState<Application | null>(null);

  // 读取 Application
  useEffect(() => {
    const raw = localStorage.getItem("current_application");
    if (raw) {
      setApplication(JSON.parse(raw));
    }
  }, []);

  // 更新字段 review
  function updateReview(
    key: string,
    status: "ok" | "fix",
    comment: string
  ) {
    if (!application) return;

    const updated: Application = {
      ...application,
      fields: application.fields.map((f) =>
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
      {application.fields.map((field: ApplicationField) => (
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
