// app/rcic/case/[id]/FieldReview.tsx
"use client";

import { useState } from "react";

interface Props {
  label: string;
  value: string;
  aiHint?: string;
}

export default function FieldReview({ label, value, aiHint }: Props) {
  const [status, setStatus] = useState<"ok" | "fix">("ok");
  const [comment, setComment] = useState("");

  return (
    <div className="border rounded-lg p-4 bg-white space-y-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-slate-700 mt-1">
          用户填写：{value}
        </div>
      </div>

      {aiHint && (
        <div className="text-xs text-amber-600">
          AI 提示：{aiHint}
        </div>
      )}

      <textarea
        placeholder="RCIC 批注（给用户的专业修改意见）"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setStatus("ok")}
          className={`px-3 py-1 rounded ${
            status === "ok"
              ? "bg-green-600 text-white"
              : "border"
          }`}
        >
          通过
        </button>
        <button
          onClick={() => setStatus("fix")}
          className={`px-3 py-1 rounded ${
            status === "fix"
              ? "bg-red-600 text-white"
              : "border"
          }`}
        >
          需修改
        </button>
      </div>
    </div>
  );
}
