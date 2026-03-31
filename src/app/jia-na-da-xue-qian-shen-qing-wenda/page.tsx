import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "加拿大学签申请常见问题（10问10答）",
  description:
    "面向中国与国际申请人的加拿大学签申请问答：材料、资金、学习计划、拒签风险与优化建议。",
  alternates: {
    canonical: "https://www.jiayi.co/jia-na-da-xue-qian-shen-qing-wenda",
  },
};

const qa = [
  ["加拿大学签最常见拒签原因是什么？", "学习计划不清晰、资金来源解释不足、回国约束力证明薄弱是高频原因。"],
  ["学习计划要写多长？", "建议清晰回答为什么选专业、为什么选学校、毕业后的职业路径，重质量不重长度。"],
  ["资金证明只看存款金额吗？", "不是。资金来源逻辑、流水稳定性、家庭收入匹配度同样关键。"],
  ["大龄申请学签是不是很难？", "可行，但需要更完整解释职业转型逻辑与学习必要性。"],
  ["跨专业申请会被重点审查吗？", "通常会。需给出职业目标与新专业的明确关联。"],
  ["是否必须先拿到录取通知书？", "学签申请通常以有效录取通知书作为核心前置材料。"],
  ["语言成绩越高越好吗？", "语言成绩有帮助，但并不能替代材料逻辑完整性。"],
  ["被拒签后还能再申请吗？", "可以。重点是先定位拒签风险点，再重构材料。"],
  ["如何做申请前风险体检？", "可先使用 Risk Compass 进行结构化风险识别，再做针对性修正。"],
  ["Jiayi 在学签流程中的作用是什么？", "提供 AI 辅助评估与信息整理，帮助你在正式递交前提升材料质量。"],
];

export default function StudyPermitFaqPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">加拿大学签申请常见问题（10问10答）</h1>
        <p className="mt-3 text-slate-300">
          该页面用于申请前风险识别与材料思路梳理，适合中国及国际申请人快速了解关键问题。
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

