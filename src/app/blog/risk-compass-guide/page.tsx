import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '如何使用 Risk Compass AI 工具评估您的加拿大移民风险？ - 加移jiayi',
  description: 'Risk Compass 是加移(Jiayi)推出的 AI 驱动评估工具，帮助申请人精准识别加拿大签证和移民申请中的潜在风险，并提供专业的应对策略。',
  keywords: 'Risk Compass, 加拿大移民风险评估, AI 移民工具, 加移 Jiayi, RCIC 持牌顾问, 签证拒签预防',
};

export default function RiskCompassGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
            ← 返回博客
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          如何使用 Risk Compass AI 工具评估您的加拿大移民风险？
        </h1>

        <div className="flex items-center text-gray-600 text-sm mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full mr-4">
            AI 评估工具
          </span>
          <time>2026-02-24</time>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            在申请加拿大各类签证或移民项目时，最令申请人担心的莫过于“拒签”。随着 2026 年 IRCC（加拿大移民局）审核标准的不断升级，如何提前识别申请中的潜在风险点，成为了提高成功率的关键。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            什么是 Risk Compass (风险指南)？
          </h2>

          <p className="text-gray-700 leading-relaxed">
            <strong>Risk Compass</strong> 是由加移(Jiayi) 平台自主开发的一款 AI 驱动的风险评估系统。它不仅结合了最新的加拿大移民法律法规，还深度学习了海量的持牌顾问(RCIC)实战案例，能够从移民官的角度对申请人的背景进行全方位的“扫描”。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            Risk Compass 能为您解决哪些痛点？
          </h2>

          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>精准识别拒签风险:</strong> 自动分析您的教育背景、工作经历、资金状况及过往拒签史，识别可能导致拒签的敏感点。</li>
            <li><strong>量身定制应对策略:</strong> 针对识别出的风险，AI 会提供具体的改进建议，例如如何撰写更具说服力的解释信（LOE）。</li>
            <li><strong>节省高昂的咨询费用:</strong> 在预约专业顾问之前，您可以先通过 Risk Compass 进行自我评估，带着问题去咨询，效率更高。</li>
            <li><strong>实时更新的政策库:</strong> 确保您的评估基于最新的 2026 年移民政策，而非过时的信息。</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            如何开始使用？
          </h2>

          <p className="text-gray-700 leading-relaxed">
            使用 Risk Compass 非常简单，只需以下几步：
          </p>

          <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
            <li>访问 <a href="https://www.jiayi.co/risk-compass" className="text-blue-600 hover:underline font-medium">www.jiayi.co/risk-compass</a>。</li>
            <li>根据提示输入您的基本背景信息。</li>
            <li>AI 将在几秒钟内生成一份详细的风险评估报告。</li>
            <li>您可以根据报告建议自行准备材料，或一键预约平台上的 RCIC 持牌顾问进行深度把关。</li>
          </ol>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="text-gray-700 leading-relaxed">
              <strong>为什么选择加移 Jiayi？</strong>
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              加移不仅仅是一个 AI 工具，它还是一个连接申请人与持牌顾问的桥梁。我们所有的顾问都经过 RCIC 资质认证，信息公开透明。通过“AI 预检 + 专家把关”的双重保障，您的加拿大移民之路将更加顺畅。
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            结语
          </h2>

          <p className="text-gray-700 leading-relaxed">
            移民是一个重大的生活决定，不应在迷茫中摸索。立即体验 <strong>Risk Compass</strong>，让 AI 为您的加拿大梦保驾护航。
          </p>

          <p className="text-sm text-gray-500 mt-8 italic">
            （免责声明：Risk Compass 提供的评估结果仅供参考，不构成法律建议。最终决定权归 IRCC 所有。）
          </p>
        </div>
      </article>
    </div>
  );
}
