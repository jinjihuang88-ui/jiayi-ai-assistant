"use client";

import { useState } from "react";

type Lang = "zh" | "en";

export default function ConsultantStandardsPage() {
  const [lang, setLang] = useState<Lang>("zh");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white font-medium hover:text-white/80">
            ← 返回首页
          </a>
          <div className="flex rounded-lg overflow-hidden border border-white/20">
            <button
              type="button"
              onClick={() => setLang("zh")}
              className={`px-4 py-2 text-sm font-medium ${lang === "zh" ? "bg-white text-slate-900" : "text-white/80 hover:text-white"}`}
            >
              中文
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-4 py-2 text-sm font-medium ${lang === "en" ? "bg-white text-slate-900" : "text-white/80 hover:text-white"}`}
            >
              English
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {lang === "zh" ? (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-10 md:px-12 md:py-14">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">加移（Jiayi）顾问审核规范</h1>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">一、审核背景与目标</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  为维护加移（Jiayi）SaaS 管理系统的专业性，确保向中国用户提供的加拿大移民、留学及签证服务符合监管要求（如 CICC 监管及中国网络合规要求），特制定本规范。
                </p>
                <p className="text-slate-700 font-medium mb-2">核心目标：</p>
                <ul className="space-y-2 text-slate-600 list-disc ml-4">
                  <li><strong className="text-slate-800">合规性：</strong>严格区分持牌与非持牌执业边界，防止非法执业。</li>
                  <li><strong className="text-slate-800">透明度：</strong>让用户清晰识别顾问资质，建立信任。</li>
                  <li><strong className="text-slate-800">安全性：</strong>通过实名与视频认证，确保“人证合一”。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">二、顾问分级管理体系（核心）</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  平台根据资质对顾问进行分级，并从技术层面限制其操作权限：
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-800 w-20">等级</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">身份定义</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">核心权限</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">平台展示标识</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-800">A 类</td>
                        <td className="py-3 px-4">加拿大持牌移民顾问（RCIC/RISIA）或执业律师</td>
                        <td className="py-3 px-4">提供全流程移民法律建议、代办申请、签字递交</td>
                        <td className="py-3 px-4">「持牌验证」勋章 + 执照号公开</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-800">B 类</td>
                        <td className="py-3 px-4">留学/签证顾问（非移民持牌）</td>
                        <td className="py-3 px-4">仅限留学申请、访问签咨询、基础材料辅助</td>
                        <td className="py-3 px-4">「实名验证」标识（标注非持牌）</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-slate-800">C 类</td>
                        <td className="py-3 px-4">文案/辅助人员（文书、翻译）</td>
                        <td className="py-3 px-4">仅限后台协作、文书整理，不可独立接单</td>
                        <td className="py-3 px-4">不在搜索结果展示</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">三、强制性审核流程</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">1. 基础身份核验（所有级别）</h3>
                    <ul className="space-y-1 text-slate-600 list-disc ml-4">
                      <li><strong className="text-slate-800">实名认证：</strong>提交有效身份证件（身份证/护照）扫描件。</li>
                      <li><strong className="text-slate-800">真人验证：</strong>通过平台 App 进行真人视频认证或实时录制视频，确保非冒名顶替。</li>
                      <li><strong className="text-slate-800">联系方式：</strong>验证工作邮箱及常用电话。</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">2. 专业资质审核（A 类特有）</h3>
                    <ul className="space-y-1 text-slate-600 list-disc ml-4">
                      <li><strong className="text-slate-800">执照核验：</strong>提交 CICC 执照或省律师协会执照。</li>
                      <li><strong className="text-slate-800">动态复核：</strong>平台每 6 个月自动/人工对接 CICC 官网查询执照状态（Active/Revoked）。</li>
                      <li><strong className="text-slate-800">机构备案：</strong>若代表机构入驻，需提供机构商业登记证明。</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">四、平台红线与合规要求（零容忍）</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">禁止虚假承诺：</strong>严禁在个人主页或咨询中使用“100%成功”、“保证获批”等字眼。</li>
                  <li><strong className="text-slate-800">禁止材料造假：</strong>严禁教唆、协助用户伪造任何申请材料。</li>
                  <li><strong className="text-slate-800">禁止私下交易：</strong>为保障用户资金安全，所有通过平台建立的关系必须在平台内完成交易，否则平台不予提供支付担保和纠纷调解。</li>
                  <li><strong className="text-slate-800">禁止超范围执业：</strong>B/C 类顾问若发现提供移民法律建议或冒充持牌顾问，将永久封号。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">五、动态监控与激励机制</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">评分权重：</strong>合规记录（0 投诉）占顾问搜索排名权重的 40%。</li>
                  <li><strong className="text-slate-800">抽检制度：</strong>平台合规团队会定期对 AI 辅助填表系统中的脱敏日志进行抽检，确保顾问服务流程规范。</li>
                  <li><strong className="text-slate-800">电子协议强制化：</strong>每一笔订单必须关联平台标准的三方服务协议（用户-顾问-平台）。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">六、网站展示规范</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">顾问主页：</strong>必须强制显示“资质等级”和“服务范围”。</li>
                  <li><strong className="text-slate-800">风险提示：</strong>在用户选择 B 类顾问时，系统自动弹出：“该顾问非加拿大持牌移民顾问，仅可提供留学/签证咨询服务，不具备提供移民法律建议的资质。”</li>
                </ul>
              </section>

              <p className="text-slate-600 italic border-t border-slate-200 pt-6">
                本规范由加移合规部负责解释并监督执行。
              </p>
            </div>
          </article>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-10 md:px-12 md:py-14">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Jiayi Consultant Review Standards</h1>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Background and Objectives</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  These standards are established to maintain the professionalism of the Jiayi SaaS management system and to ensure that immigration, study, and visa services provided to users comply with applicable regulations (including CICC oversight and applicable compliance requirements).
                </p>
                <p className="text-slate-700 font-medium mb-2">Core objectives:</p>
                <ul className="space-y-2 text-slate-600 list-disc ml-4">
                  <li><strong className="text-slate-800">Compliance:</strong> Clearly distinguish licensed from unlicensed practice and prevent unauthorized practice.</li>
                  <li><strong className="text-slate-800">Transparency:</strong> Enable users to clearly identify consultant qualifications and build trust.</li>
                  <li><strong className="text-slate-800">Security:</strong> Use identity and video verification to ensure the person and credentials match.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">2. Tiered Consultant System</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  The platform tiers consultants by qualification and technically limits their permissions:
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-800 w-24">Tier</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Definition</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Core Permissions</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Platform Display</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-800">Tier A</td>
                        <td className="py-3 px-4">Licensed Canadian immigration consultant (RCIC/RISIA) or practising lawyer</td>
                        <td className="py-3 px-4">Full-scope immigration legal advice, application representation, signing and submission</td>
                        <td className="py-3 px-4">“Licensed verified” badge + licence number shown</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-800">Tier B</td>
                        <td className="py-3 px-4">Study/visa consultant (not licensed for immigration)</td>
                        <td className="py-3 px-4">Study permits, visitor visa advice, and basic document support only</td>
                        <td className="py-3 px-4">“Identity verified” label (marked as non-licensed)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-slate-800">Tier C</td>
                        <td className="py-3 px-4">Document/administrative support (e.g. drafting, translation)</td>
                        <td className="py-3 px-4">Back-office support and document preparation only; may not take clients independently</td>
                        <td className="py-3 px-4">Not shown in search results</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">3. Mandatory Review Process</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">3.1 Basic identity verification (all tiers)</h3>
                    <ul className="space-y-1 text-slate-600 list-disc ml-4">
                      <li><strong className="text-slate-800">Identity:</strong> Submit a valid ID (national ID or passport) scan.</li>
                      <li><strong className="text-slate-800">Live verification:</strong> Complete in-app live video verification or recorded video to prevent impersonation.</li>
                      <li><strong className="text-slate-800">Contact:</strong> Verify work email and primary phone number.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 mb-2">3.2 Professional credential review (Tier A only)</h3>
                    <ul className="space-y-1 text-slate-600 list-disc ml-4">
                      <li><strong className="text-slate-800">Licence:</strong> Submit CICC or provincial law society licence.</li>
                      <li><strong className="text-slate-800">Ongoing check:</strong> Platform checks CICC (or equivalent) every 6 months for status (Active/Revoked).</li>
                      <li><strong className="text-slate-800">Organization:</strong> If representing an organization, provide business registration proof.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">4. Platform Red Lines (Zero Tolerance)</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">No false promises:</strong> Prohibited language includes “100% success” or “guaranteed approval” on profiles or in consultations.</li>
                  <li><strong className="text-slate-800">No document fraud:</strong> Consultants must not encourage or assist users to forge any application materials.</li>
                  <li><strong className="text-slate-800">No off-platform deals:</strong> To protect users, all relationships formed through the platform must transact on the platform; otherwise the platform will not provide payment protection or dispute mediation.</li>
                  <li><strong className="text-slate-800">No scope overreach:</strong> Tier B/C consultants who provide immigration legal advice or pose as licensed consultants will be permanently banned.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">5. Monitoring and Incentives</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">Ranking weight:</strong> A clean compliance record (zero complaints) accounts for 40% of consultant search ranking weight.</li>
                  <li><strong className="text-slate-800">Audits:</strong> The compliance team periodically audits de-identified logs from the AI-assisted form system to ensure proper service flow.</li>
                  <li><strong className="text-slate-800">Agreements:</strong> Every order must be linked to the platform’s standard tripartite service agreement (user–consultant–platform).</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">6. Website Display Standards</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">Consultant profile:</strong> Must clearly display “qualification tier” and “scope of service.”</li>
                  <li><strong className="text-slate-800">Risk notice:</strong> When a user selects a Tier B consultant, the system must display: “This consultant is not a licensed Canadian immigration consultant and may only provide study/visa consulting services; they are not qualified to provide immigration legal advice.”</li>
                </ul>
              </section>

              <p className="text-slate-600 italic border-t border-slate-200 pt-6">
                These standards are interpreted and enforced by the Jiayi Compliance function.
              </p>
            </div>
          </article>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
          <a href="/" className="text-red-600 hover:text-red-700 font-medium">返回首页</a>
          <span className="mx-2">·</span>
          <a href="/privacy" className="text-slate-600 hover:text-slate-800">隐私政策</a>
          <span className="mx-2">·</span>
          <a href="/terms" className="text-slate-600 hover:text-slate-800">服务条款</a>
          <span className="mx-2">·</span>
          <span>© {new Date().getFullYear()} 加移（Jiayi）· MapleBridge Technologies Inc.</span>
        </div>
      </footer>
    </main>
  );
}
