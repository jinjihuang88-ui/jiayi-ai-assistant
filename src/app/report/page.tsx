"use client";

import { useSearchParams } from "next/navigation";

export default function ReportPage() {
  const searchParams = useSearchParams();

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

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
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
      <div>加移AI助理 · MaplePath AI</div>
      <div>{new Date().toLocaleDateString()}</div>
    </div>
  </div>
</div>

{/* Page Break */}
<div className="hidden print:block" style={{ pageBreakAfter: "always" }} />

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Title */}
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          AI 移民评估报告
        </h1>
<p className="text-sm text-slate-500 mb-6">
  本平台提供基于官方公开数据的路径参考，
  覆盖留学、就业与移民相关方向，
  用于帮助用户理解不同选择的长期可能性。
</p>

        <p className="text-sm text-slate-500 mb-12">
          基于加拿大官方最新数据 · 自动生成 · 仅供参考
        </p>

        {/* Callout */}
        <div className="mb-10 rounded-lg bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-700">
          🤖 本报告由 AI 基于你提供的信息生成，用于帮助你理解可能的移民方向，
          并不构成法律或移民建议。
        </div>

        {/* Section: Profile */}
        <section className="mb-14">
          <h2 className="text-lg font-medium mb-4">你的基本情况</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {answers.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-400">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-12 border-slate-200" />

        {/* Section: Analysis */}
        <section className="mb-14">
          <h2 className="text-lg font-medium mb-4">AI 初步分析</h2>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              根据你提供的信息，AI 判断你当前具备
              <span className="font-medium"> 初步移民可行性 </span>，
              但仍需要结合语言、职业匹配度等因素进一步优化。
            </p>

            {hasIT && (
              <p>
                你的职业背景属于
                <span className="font-medium"> 加拿大长期需求领域 </span>，
                在技术移民（Express Entry）和部分省提名项目中具有潜在优势。
              </p>
            )}

            {noLanguage && (
              <p>
                目前尚未提供语言成绩，
                <span className="font-medium"> 语言能力将是影响成功率的关键变量 </span>，
                建议优先规划英语或法语考试。
              </p>
            )}
          </div>
        </section>

        <hr className="my-12 border-slate-200" />

        {/* Section: Suggested Paths */}
        <section className="mb-14">
          <h2 className="text-lg font-medium mb-4">可能适合关注的方向</h2>

          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-md bg-white border px-4 py-3">
              <strong>Express Entry（技术移民）</strong>
              <div className="text-slate-600 mt-1">
                适用于具备学历、语言和职业背景的申请人。
              </div>
            </div>

            <div className="rounded-md bg-white border px-4 py-3">
              <strong>Provincial Nominee Program（省提名）</strong>
              <div className="text-slate-600 mt-1">
                若职业符合特定省份需求，可显著提高成功概率。
              </div>
            </div>
          </div>
        </section>

        <hr className="my-12 border-slate-200" />

        {/* Section: Next Steps */}
        <section className="mb-16">
<hr className="my-12 border-slate-200" />

{/* Section: Official Data Sources */}
<section className="mb-16">
  <h2 className="text-lg font-medium mb-4">
    官方数据来源说明
  </h2>

  <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
    <p>
      本评估报告基于公开可访问的加拿大官方数据源生成，
      用于帮助用户理解当前政策环境与潜在路径。
    </p>

    <ul className="list-disc list-inside space-y-1">
      <li>
        加拿大移民、难民及公民部（IRCC）官网公开信息
      </li>
      <li>
        加拿大官方职业分类（NOC）与劳工市场数据
      </li>
    </ul>

    <p className="text-slate-500">
      注：移民政策与职业需求可能随时间调整，
      本报告内容基于生成当日的公开信息，
      不构成移民或法律建议。
    </p>
  </div>
</section>

          <h2 className="text-lg font-medium mb-4">建议的下一步</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
            <li>规划语言考试（IELTS / CELPIP / TEF）</li>
            <li>确认是否需要学历认证（ECA）</li>
            <li>持续关注官方政策与职业需求变化</li>
          </ol>
        </section>

        {/* Actions */}
       <div className="flex gap-4 print:hidden">
  <button
    onClick={downloadPDF}
    className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm"
  >
    Download PDF
  </button>

  <a
    href="/assessment"
    className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm"
  >
    重新评估
  </a>

  <a
  href={`/chat?data=${encodeURIComponent(JSON.stringify(answers))}`}
  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
>
  咨询 AI 助理
</a>

</div>


      </div>
    </main>
  );
}
