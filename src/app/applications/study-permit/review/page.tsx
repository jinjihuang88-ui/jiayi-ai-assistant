"use client";

import { useEffect, useState } from "react";
import { Application } from "@/types/application";

export default function StudyPermitReviewPage() {
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("current_application");
    if (raw) {
      setApplication(JSON.parse(raw));
    }
  }, []);

  if (!application) {
    return <main className="max-w-3xl mx-auto px-6 py-12">未找到申请记录</main>;
  }

  const { status, fields, rcicConclusion } = application;

  // 只找出被 RCIC 标记为需要修改的字段
  const fieldsNeedFix = (fields || []).filter(
    (f) => f.review?.status === "fix"
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-2xl font-semibold">学签申请 · 审核进度</h1>

      {/* ① 审核状态 */}
      {status === "submitted" && (
        <div className="p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
          已提交给持牌移民顾问（RCIC），请耐心等待审核。
        </div>
      )}

      {status === "approved" && (
        <div className="p-4 rounded-lg bg-green-50 text-green-700 text-sm">
          🎉 RCIC 已审核通过，可进入下一步正式递交阶段。
        </div>
      )}

      {status === "needs_revision" && (
        <div className="p-4 rounded-lg bg-amber-50 text-amber-700 text-sm">
          RCIC 认为以下信息需要你补充或修改：
        </div>
      )}

      {/* ② 需要修改的字段（仅在 needs_revision 显示） */}
      {status === "needs_revision" && fieldsNeedFix.length > 0 && (
        <section className="space-y-4">
          {fieldsNeedFix.map((field) => (
            <div
              key={field.key}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="font-medium">
                {field.label}
              </div>

              <div className="text-sm text-slate-700 mt-1">
                你当前填写：{field.value || "（未填写）"}
              </div>

              {field.review?.comment && (
                <div className="mt-2 text-sm text-red-600">
                  ❗ RCIC 意见：<br />
                  {field.review.comment}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ③ RCIC 总结意见 */}
      {rcicConclusion && (
        <section className="border-t pt-6">
          <h2 className="font-medium mb-2">RCIC 总体意见</h2>
          <p className="text-sm text-slate-700">
            {rcicConclusion.comment}
          </p>
        </section>
      )}
    </main>
  );
}
