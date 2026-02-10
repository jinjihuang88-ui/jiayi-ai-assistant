"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ReportContent() {
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  function downloadPDF() {
    window.print();
  }

  const raw = searchParams.get("data");

  let answers: string[] = [];

  try {
    if (raw) {
      answers = JSON.parse(decodeURIComponent(raw));
    }
  } catch {
    answers = [];
  }

  const hasIT = answers.includes("IT / 技术");
  const noLanguage = answers.includes("暂时没有");
  const hasHighEducation = answers.includes("硕士及以上") || answers.includes("本科");
  const isYoung = answers.includes("18–29") || answers.includes("30–39");

  // Calculate a simple score
  let score = 50;
  if (hasIT) score += 15;
  if (hasHighEducation) score += 15;
  if (isYoung) score += 10;
  if (!noLanguage) score += 10;

  const getScoreColor = () => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-orange-500";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "优秀";
    if (score >= 60) return "良好";
    return "需提升";
  };

  return (
    <>
      {/* PDF Cover Page */}
      <div className="hidden print:block min-h-screen flex items-center justify-center">
        <div className="text-center px-10">
          <img
            src="/logo.png"
            alt="Logo"
            className="mx-auto mb-8 w-20 h-20"
          />
          <h1 className="text-4xl font-semibold mb-4">
            AI Immigration Assessment Report
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Powered by Official Canadian Data
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <div>加移AI助理 · MapleBridge</div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Page Break */}
      <div className="hidden print:block" style={{ pageBreakAfter: "always" }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              返回首页
            </a>
            <a href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-lg" />
              <span className="font-semibold text-slate-900">加移AI助理</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载 PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className={`mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              评估完成
            </span>
            <span>·</span>
            <span>{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AI 移民评估报告
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            基于加拿大官方公开数据的智能分析，为您提供个性化的移民路径参考
          </p>
        </div>

        {/* Score Card */}
        <div className={`mb-12 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className={`bg-gradient-to-r ${getScoreColor()} p-8 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm mb-1">综合评估得分</div>
                  <div className="text-5xl font-bold">{score}</div>
                  <div className="text-white/80 mt-1">{getScoreLabel()}</div>
                </div>
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50">
              <div className="text-sm text-slate-600">
                🤖 本评分基于您提供的信息自动生成，仅供参考，不构成移民或法律建议。
              </div>
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <section className={`mb-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">您的基本情况</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {answers.map((a, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                  {['🌍', '🎂', '🎓', '💼', '🗣️'][i] || '📋'}
                </div>
                <span className="text-slate-700 font-medium">{a}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Analysis Section */}
        <section className={`mb-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🔍</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">AI 初步分析</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <p className="text-slate-700 leading-relaxed">
              根据您提供的信息，AI 判断您当前具备
              <span className="font-semibold text-green-600"> 初步移民可行性 </span>，
              但仍需要结合语言、职业匹配度等因素进一步优化。
            </p>

            {hasIT && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <span className="text-2xl">💻</span>
                <div>
                  <div className="font-semibold text-green-800">技术背景优势</div>
                  <p className="text-green-700 text-sm mt-1">
                    您的职业背景属于加拿大长期需求领域，在技术移民（Express Entry）和部分省提名项目中具有潜在优势。
                  </p>
                </div>
              </div>
            )}

            {noLanguage && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold text-amber-800">语言成绩待补充</div>
                  <p className="text-amber-700 text-sm mt-1">
                    目前尚未提供语言成绩，语言能力将是影响成功率的关键变量，建议优先规划英语或法语考试。
                  </p>
                </div>
              </div>
            )}

            {hasHighEducation && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-2xl">🎓</span>
                <div>
                  <div className="font-semibold text-blue-800">学历优势</div>
                  <p className="text-blue-700 text-sm mt-1">
                    您的学历背景在 CRS 评分系统中具有加分优势，有助于提高 Express Entry 邀请概率。
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Suggested Paths */}
        <section className={`mb-12 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <span className="text-xl">🛤️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">推荐移民路径</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xl">
                  🚀
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Express Entry</h3>
                  <p className="text-sm text-slate-500">技术移民</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                适用于具备学历、语言和职业背景的申请人，是最快速的移民通道之一。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">推荐度高</span>
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">6-12个月</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl">
                  🏛️
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Provincial Nominee</h3>
                  <p className="text-sm text-slate-500">省提名项目</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-4">
                若职业符合特定省份需求，可显著提高成功概率，获得额外 600 分加分。
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">值得关注</span>
                <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">12-18个月</span>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className={`mb-12 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">建议下一步</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <ul className="space-y-4">
              {[
                { icon: "🗣️", text: "准备语言考试（雅思/思培），目标 CLB 7 以上" },
                { icon: "📄", text: "整理学历和工作经历文件，准备 ECA 学历认证" },
                { icon: "💬", text: "使用 AI 咨询深入了解具体项目要求" },
                { icon: "👨‍⚖️", text: "考虑咨询持牌移民顾问（RCIC）获取专业建议" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-slate-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">准备好开始您的移民之旅了吗？</h3>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto">
              使用我们的 AI 助理获取更详细的指导，或开始填写正式申请表格
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/chat"
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
              >
                💬 咨询 AI 助理
              </a>
              <a
                href="/applications"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-colors"
              >
                📋 开始申请
              </a>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>
            本报告由 AI 自动生成，仅供参考，不构成移民或法律建议。
            <br />
            具体申请请以加拿大移民局（IRCC）官方信息为准。
          </p>
        </div>
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600">正在加载报告...</p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Suspense fallback={<LoadingFallback />}>
        <ReportContent />
      </Suspense>
    </main>
  );
}
