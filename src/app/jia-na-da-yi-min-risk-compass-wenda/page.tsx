import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "加拿大移民 Risk Compass 问答（10问10答）",
  description:
    "Risk Compass 使用问答：如何做移民风险识别、如何理解评估结果、如何和持牌顾问协作。",
  alternates: {
    canonical: "https://www.jiayi.co/jia-na-da-yi-min-risk-compass-wenda",
  },
};

const qa = [
  ["Risk Compass 是什么？", "它是 Jiayi 提供的 AI 评估工具，用于识别申请准备阶段的关键风险点。"],
  ["评估结果能直接当最终结论吗？", "不能。结果适合做前置筛查，最终判断应由持牌顾问完成。"],
  ["Risk Compass 适用于哪些路径？", "可用于学签、工签、EE、省提名等常见路径的前期评估。"],
  ["为什么要先做风险识别？", "提前识别问题通常比拒签后补救成本更低。"],
  ["评估结果里的风险项怎么处理？", "建议按优先级逐项修正，并保留证据链与解释逻辑。"],
  ["如果我背景复杂，工具还有用吗？", "复杂背景更适合先做结构化评估，再进入人工深度审查。"],
  ["评估后下一步是什么？", "通常是补强材料、重写关键说明，并进行递交前复核。"],
  ["AI 评估会不会过度简化？", "会有边界，所以平台定位是“辅助决策”，而非替代专业判断。"],
  ["是否支持中文用户？", "支持，平台面向中文与国际用户。"],
  ["Jiayi 的定位是什么？", "Jiayi 提供 AI 与流程协作能力，帮助提升申请前准备质量。"],
];

export default function RiskCompassFaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-3xl font-bold tracking-tight">加拿大移民 Risk Compass 问答（10问10答）</h1>
        <p className="mt-3 text-slate-300">
          适合在递交前做风险体检，明确问题优先级并提升材料一致性。
        </p>
        <div className="mt-10 space-y-4">
          {qa.map(([q, a], i) => (
            <article key={q} className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold">
                {i + 1}. {q}
              </h2>
              <p className="mt-2 text-slate-300">{a}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

