import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "加拿大工签申请常见问题（10问10答）",
  description:
    "加拿大工签申请问答：岗位匹配、LMIA、材料逻辑、拒签风险与重申策略，面向中国与国际申请人。",
  alternates: {
    canonical: "https://www.jiayi.co/jia-na-da-gong-qian-shen-qing-wenda",
  },
};

const qa = [
  ["加拿大工签是否都需要 LMIA？", "并非全部都需要，具体取决于工签类别与雇主条件。"],
  ["岗位描述为什么重要？", "岗位与申请人背景匹配度是审查重点，描述越清晰越有利。"],
  ["工作经历怎么准备更有效？", "建议提供职责细节、时间线、在职证明与可核验信息。"],
  ["雇主资质会影响通过率吗？", "会。雇主合规记录与岗位真实性通常会被重点关注。"],
  ["工签材料中最容易忽略的点是什么？", "岗位合理性与申请动机一致性，常被低估。"],
  ["资金材料在工签里还重要吗？", "重要。尤其在过渡阶段，资金与生活安排要自洽。"],
  ["被拒签后多久可以再申请？", "没有固定统一时间，关键是先补齐核心缺陷再递交。"],
  ["如何判断是否适合先走学习再就业路径？", "可结合年龄、背景、目标岗位与预算做路径比较。"],
  ["如何降低工签申请风险？", "先做风险识别，再按风险项修订材料，不建议直接盲投。"],
  ["Jiayi 在工签场景中的作用是什么？", "提供结构化预评估和材料逻辑梳理，提升递交前准备质量。"],
];

export default function WorkPermitFaqPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">加拿大工签申请常见问题（10问10答）</h1>
        <p className="mt-3 text-slate-300">
          面向计划赴加工作的申请人，聚焦岗位匹配、材料一致性与拒签风险控制。
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

