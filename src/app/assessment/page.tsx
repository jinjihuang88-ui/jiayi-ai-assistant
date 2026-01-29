"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    question: "你目前居住在哪个国家？",
    options: ["中国", "加拿大", "其他国家"],
  },
  {
    question: "你的年龄范围是？",
    options: ["18–29", "30–39", "40–49", "50+"],
  },
  {
    question: "你的最高学历是？",
    options: ["高中", "大专", "本科", "硕士及以上"],
  },
  {
    question: "你最近的主要职业是？",
    options: ["IT / 技术", "金融 / 商科", "技工 / 蓝领", "其他"],
  },
  {
    question: "你是否已有英语或法语成绩？",
    options: ["有", "暂时没有", "不确定"],
  },
];

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

 const router = useRouter();

function select(option: string) {
  const next = [...answers];
  next[step] = option;
  setAnswers(next);

  if (step < steps.length - 1) {
    setStep(step + 1);
  } else {
    // 最后一步，跳转到 report
    const encoded = encodeURIComponent(JSON.stringify(next));
    router.push(`/report?data=${encoded}`);
  }
}


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      
      <div className="w-full max-w-xl bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/20 p-10">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Step {step + 1} of {steps.length}
          </div>
        </div>

        {/* Question */}
        <h1 className="text-2xl font-semibold text-slate-900 mb-8 leading-snug">
          {current.question}
        </h1>

        {/* Options */}
        <div className="space-y-3">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => select(opt)}
              className="
                w-full px-4 py-3 rounded-lg border border-slate-300
                text-left text-slate-800
                hover:border-blue-600 hover:bg-blue-50
                focus:outline-none focus:ring-2 focus:ring-blue-500
                transition
              "
            >
              {opt}
            </button>
          ))}
        </div>

        {/* AI feedback */}
        <div className="mt-10 text-sm text-slate-500">
          🤖 AI 正在根据加拿大官方数据实时分析你的情况
        </div>
      </div>
    </main>
  );
}
