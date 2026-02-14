"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const steps = [
  {
    question: "你目前居住在哪个国家？",
    questionEn: "Where do you currently reside?",
    icon: "🌍",
    options: [
      { label: "中国", icon: "🇨🇳" },
      { label: "加拿大", icon: "🇨🇦" },
      { label: "其他国家", icon: "🌐" },
    ],
  },
  {
    question: "你的年龄范围是？",
    questionEn: "What is your age range?",
    icon: "🎂",
    options: [
      { label: "18–29", icon: "👶" },
      { label: "30–39", icon: "👨" },
      { label: "40–49", icon: "👨‍🦳" },
      { label: "50+", icon: "👴" },
    ],
  },
  {
    question: "你的最高学历是？",
    questionEn: "What is your highest education level?",
    icon: "🎓",
    options: [
      { label: "高中", icon: "📚" },
      { label: "大专", icon: "📖" },
      { label: "本科", icon: "🎓" },
      { label: "硕士及以上", icon: "🏆" },
    ],
  },
  {
    question: "你最近的主要职业是？",
    questionEn: "What is your primary occupation?",
    icon: "💼",
    options: [
      { label: "IT / 技术", icon: "💻" },
      { label: "金融 / 商科", icon: "📊" },
      { label: "技工 / 蓝领", icon: "🔧" },
      { label: "其他", icon: "📋" },
    ],
  },
  {
    question: "你是否已有英语或法语成绩？",
    questionEn: "Do you have English or French test scores?",
    icon: "🗣️",
    options: [
      { label: "有", icon: "✅" },
      { label: "暂时没有", icon: "⏳" },
      { label: "不确定", icon: "❓" },
    ],
  },
];

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const current = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const router = useRouter();

  function select(option: string) {
    setSelectedOption(option);
    setIsAnimating(true);
    
    const next = [...answers];
    next[step] = option;
    setAnswers(next);

    setTimeout(() => {
      if (step < steps.length - 1) {
        setStep(step + 1);
        setSelectedOption(null);
        setIsAnimating(false);
      } else {
        const encoded = encodeURIComponent(JSON.stringify(next));
        router.push(`/report?data=${encoded}`);
      }
    }, 400);
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />
      </div>

      {/* Back to home */}
      <a 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm">返回首页</span>
      </a>

      <div className="w-full max-w-xl relative z-10">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10 transform transition-all duration-500">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                {current.icon}
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">问题 {step + 1}/{steps.length}</div>
                <div className="text-sm font-medium text-slate-700">加拿大移民评估 · 学签/工签/EE</div>
              </div>
            </div>
            {step > 0 && (
              <button 
                onClick={goBack}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Question */}
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-98' : 'opacity-100 scale-100'}`}>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">
              {current.question}
            </h1>
            <p className="text-sm text-slate-500 mb-8">
              {current.questionEn}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {current.options.map((opt, index) => (
                <button
                  key={opt.label}
                  onClick={() => select(opt.label)}
                  disabled={isAnimating}
                  className={`
                    w-full px-5 py-4 rounded-xl border-2 
                    text-left flex items-center gap-4
                    transition-all duration-300 ease-out
                    transform hover:scale-[1.02] active:scale-[0.98]
                    ${selectedOption === opt.label 
                      ? 'border-red-500 bg-red-50 shadow-lg shadow-red-500/20' 
                      : 'border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                    }
                    ${isAnimating && selectedOption !== opt.label ? 'opacity-50' : 'opacity-100'}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-slate-800 font-medium">{opt.label}</span>
                  <svg 
                    className={`w-5 h-5 ml-auto transition-all duration-300 ${selectedOption === opt.label ? 'text-red-500 opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* AI Status */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs">AI</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="font-medium text-slate-700">AI 正在实时分析</div>
                <div className="text-xs">基于加拿大官方移民数据</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="mt-6 text-center text-white/50 text-sm">
          您的信息将被安全处理，仅用于评估分析
        </div>
      </div>
    </main>
  );
}
