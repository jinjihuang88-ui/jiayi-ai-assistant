"use client";

import { useState } from "react";

type Lang = "zh" | "en";

export default function TermsPage() {
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
              <p className="text-sm text-slate-500 mb-2">最后更新日期：2026年2月9日</p>
              <h1 className="text-3xl font-bold text-slate-900 mb-8">加移（Jiayi）服务条款</h1>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">1. 接受条款</h2>
                <p className="text-slate-600 leading-relaxed">
                  欢迎使用加移（www.jiayi.co）。加移是由 MapleBridge Technologies Inc.（以下简称“本公司”）提供的 SaaS 移民管理系统。通过访问或使用本平台，即表示您已阅读、理解并同意受本协议所有条款的约束。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">2. 平台定位与角色</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">技术平台：</strong>加移是一个 SaaS 基础设施平台，提供信息整理、AI 辅助评估、顾问匹配及案件管理工具。</li>
                  <li><strong className="text-slate-800">非法律服务方：</strong>加移平台本身不提供任何形式的移民法律意见、法律代表或移民代理服务。所有的专业评估和法律建议均由平台入驻的独立持牌顾问（如 RCIC）提供。</li>
                  <li><strong className="text-slate-800">不保证成功：</strong>移民申请受各国政策及官方审批影响，平台及 AI 系统不承诺任何申请的成功率。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">3. 用户账号</h2>
                <ul className="space-y-2 text-slate-600">
                  <li><strong className="text-slate-800">真实性：</strong>用户应提供真实、准确的信息进行注册。</li>
                  <li><strong className="text-slate-800">安全性：</strong>您负责维护账号和密码的安全。任何通过您的账号进行的操作均视为您的行为。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">4. 顾问服务与责任</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">独立性：</strong>入驻顾问是独立的服务提供者，非本公司雇员。</li>
                  <li><strong className="text-slate-800">服务协议：</strong>当您通过平台聘请顾问时，您将与该顾问建立直接的服务关系。平台会自动生成三方协议以明确各方权责。</li>
                  <li><strong className="text-slate-800">责任切分：</strong>因顾问提供的专业意见或服务质量产生的纠纷，由顾问自行承担责任。本公司作为平台方，将提供必要的调解支持和支付担保。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">5. AI 服务使用规范</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">参考性质：</strong>AI 生成的评估报告和建议仅供参考，不构成最终的法律依据。</li>
                  <li><strong className="text-slate-800">禁止造假：</strong>严禁利用平台工具（包括 AI 辅助填表）伪造、篡改任何官方申请材料。一经发现，平台有权立即封禁账号并向相关监管机构报告。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">6. 费用与支付</h2>
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">收费模式：</strong>平台可能收取订阅费、工具使用费或交易佣金。具体收费标准以页面展示为准。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">7. 知识产权</h2>
                <p className="text-slate-600 leading-relaxed">
                  本平台的所有内容（包括软件、算法、界面设计、文字、图片等）均属于本公司或其许可方所有。未经授权，不得擅自抓取、复制或反向工程。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">8. 免责声明</h2>
                <p className="text-slate-600 leading-relaxed mb-3">
                  在法律允许的最大范围内，本公司不对以下情况承担责任：
                </p>
                <ul className="list-disc ml-4 space-y-1 text-slate-600">
                  <li>因政府政策变动导致的申请失败。</li>
                  <li>因不可抗力导致的系统中断。</li>
                  <li>用户与顾问之间的私下交易行为。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">9. 法律适用与争议解决</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  本协议受加拿大不列颠哥伦比亚省法律管辖。若发生争议，双方应首先友好协商；协商不成，应提交至本公司所在地有管辖权的法院或仲裁机构。
                </p>
                <p className="text-slate-700 font-medium">
                  如果您不同意本条款，请立即停止使用本系统。
                </p>
              </section>
            </div>
          </article>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-10 md:px-12 md:py-14">
              <p className="text-sm text-slate-500 mb-2">Last updated: February 9, 2026</p>
              <h1 className="text-3xl font-bold text-slate-900 mb-8">Jiayi Terms of Service</h1>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  Welcome to Jiayi (www.jiayi.co). Jiayi is a SaaS immigration management system provided by MapleBridge Technologies Inc. (“the Company”). By accessing or using the platform, you confirm that you have read, understood, and agree to be bound by these terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">2. Platform Role</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">Technology platform:</strong> Jiayi is a SaaS infrastructure platform providing information organization, AI-assisted assessment, consultant matching, and case management tools.</li>
                  <li><strong className="text-slate-800">Not a legal service provider:</strong> The platform does not provide immigration legal advice, legal representation, or immigration agency services. All professional assessments and legal advice are provided by independent licensed consultants (e.g. RCICs) on the platform.</li>
                  <li><strong className="text-slate-800">No success guarantee:</strong> Immigration outcomes depend on government policies and official decisions. The platform and AI do not guarantee any application success.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">3. User Accounts</h2>
                <ul className="space-y-2 text-slate-600">
                  <li><strong className="text-slate-800">Accuracy:</strong> You must provide true and accurate information when registering.</li>
                  <li><strong className="text-slate-800">Security:</strong> You are responsible for keeping your account and password secure. Any activity under your account is deemed to be your own.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">4. Consultant Services and Liability</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">Independence:</strong> Consultants on the platform are independent service providers, not employees of the Company.</li>
                  <li><strong className="text-slate-800">Service agreement:</strong> When you engage a consultant through the platform, you enter a direct service relationship with that consultant. The platform may generate a tripartite agreement to clarify the rights and obligations of each party.</li>
                  <li><strong className="text-slate-800">Liability:</strong> Disputes arising from a consultant’s advice or service quality are the responsibility of the consultant. The Company, as the platform operator, will provide mediation support and payment safeguards where appropriate.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">5. Use of AI Services</h2>
                <ul className="space-y-3 text-slate-600">
                  <li><strong className="text-slate-800">For reference only:</strong> AI-generated assessments and suggestions are for reference only and do not constitute final legal authority.</li>
                  <li><strong className="text-slate-800">No forgery:</strong> You must not use the platform (including AI-assisted forms) to forge or alter any official application materials. Violations may result in immediate account suspension and reporting to relevant authorities.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">6. Fees and Payment</h2>
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Pricing:</strong> The platform may charge subscription fees, tool usage fees, or transaction commissions. Specific fees are as displayed on the relevant pages.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">7. Intellectual Property</h2>
                <p className="text-slate-600 leading-relaxed">
                  All content on the platform (including software, algorithms, interface design, text, and images) is owned by the Company or its licensors. You may not scrape, copy, or reverse-engineer any part of the platform without authorization.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">8. Disclaimer</h2>
                <p className="text-slate-600 leading-relaxed mb-3">
                  To the fullest extent permitted by law, the Company is not liable for:
                </p>
                <ul className="list-disc ml-4 space-y-1 text-slate-600">
                  <li>Application failures due to changes in government policy.</li>
                  <li>System interruptions due to force majeure.</li>
                  <li>Private transactions between users and consultants.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">9. Governing Law and Dispute Resolution</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  These terms are governed by the laws of British Columbia, Canada. Any dispute shall first be resolved through good-faith negotiation; if that fails, the dispute shall be submitted to a court or arbitral body with jurisdiction in the Company’s place of business.
                </p>
                <p className="text-slate-700 font-medium">
                  If you do not agree to these terms, please stop using the system immediately.
                </p>
              </section>
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
          <a href="/consultant-standards" className="text-slate-600 hover:text-slate-800">顾问审核规范</a>
          <span className="mx-2">·</span>
          <span>© {new Date().getFullYear()} 加移（Jiayi）· MapleBridge Technologies Inc.</span>
        </div>
      </footer>
    </main>
  );
}
