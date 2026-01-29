"use client";

import { useState } from "react";
import { Application } from "@/types/application";

export default function StudyPermitPage() {
  const [application, setApplication] = useState<Application>({
    id: "SP-" + Date.now(),
    type: "study_permit",
    status: "draft",
    fields: [
      // ===== Personal =====
      { key: "full_name", label: "护照姓名 Full name", value: "", aiHint: "需与护照完全一致" },
      { key: "date_of_birth", label: "出生日期 Date of birth", value: "" },
      { key: "place_of_birth", label: "出生地 Place of birth", value: "" },
      { key: "marital_status", label: "婚姻状况 Marital status", value: "" },

      // ===== Passport =====
      { key: "passport_number", label: "护照号码 Passport number", value: "" },
      { key: "passport_expiry", label: "护照有效期 Passport expiry date", value: "" },

      // ===== Education =====
      { key: "education_history", label: "教育经历 Education history", value: "", aiHint: "需覆盖高中以后所有学习经历" },

      // ===== Employment =====
      { key: "employment_history", label: "工作经历 Employment history", value: "", aiHint: "无工作请填写 N/A" },

      // ===== Study Plan =====
      { key: "study_plan", label: "学习计划 Study plan", value: "", aiHint: "解释为何选择该专业及回国规划" },

      // ===== Funds =====
      { key: "funds", label: "资金说明 Proof of funds", value: "", aiHint: "说明学费、生活费及资金来源" },

      // ===== Background =====
      { key: "travel_history", label: "旅行史 Travel history", value: "" },
      { key: "refusal_history", label: "拒签史 Refusal history", value: "" },
    ],
  });

  function updateField(key: string, value: string) {
    setApplication((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.key === key ? { ...f, value } : f
      ),
    }));
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-2xl font-semibold">学签申请（IMM 1294）</h1>

      {application.fields.map((field) => (
        <div key={field.key}>
          <label className="block font-medium mb-1">{field.label}</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            rows={field.key.includes("history") || field.key.includes("plan") ? 4 : 1}
            value={field.value}
            onChange={(e) => updateField(field.key, e.target.value)}
          />
          {field.aiHint && (
            <div className="text-xs text-amber-600 mt-1">
              AI 提示：{field.aiHint}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => {
          localStorage.setItem(
            "current_application",
            JSON.stringify({ ...application, status: "submitted" })
          );
          window.location.href = "/applications/study-permit/review";
        }}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        提交给 RCIC 审核
      </button>
    </main>
  );
}
