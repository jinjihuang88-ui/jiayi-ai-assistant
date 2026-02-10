"use client";

import { useState } from "react";

type Lang = "zh" | "en";

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("zh");

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
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
              <p className="text-sm text-slate-500 mb-2">版本生效日期：2026年2月9日</p>
              <h1 className="text-3xl font-bold text-slate-900 mb-6">加移（Jiayi）隐私政策</h1>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">引言</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  加移（以下简称“我们”或“平台”）由 MapleBridge Technologies Inc. 运营。我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全可靠。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最小必要原则、确保安全原则、主体参与原则、公开透明原则等。
                </p>
                <p className="text-slate-600 leading-relaxed">
                  本隐私政策适用于加移网站（www.jiayi.co）、移动端应用（APP）及相关 SaaS 服务。请在使用我们的产品或服务前，仔细阅读并了解本《隐私政策》。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">一、我们如何收集和使用您的个人信息</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  我们将根据合法、正当、必要的原则，仅收集实现产品功能所必需的信息。
                </p>
                <ul className="space-y-4 text-slate-600">
                  <li>
                    <strong className="text-slate-800">1. 账号注册与登录</strong>
                    <ul className="mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>基本信息：</strong>当您注册成为用户时，您需要提供手机号码或电子邮箱以创建账号。</li>
                      <li><strong>顾问入驻：</strong>如果您作为顾问入驻，我们需要收集您的真实姓名、身份证件信息（护照/身份证）、联系方式、居住地、真人视频认证信息以及执业执照（如 RCIC 编号）。</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-slate-800">2. 移民评估与 AI 服务</strong>
                    <ul className="mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>背景信息：</strong>为了提供 AI 初步评估报告，您可能需要主动填写您的年龄、教育背景、工作经历、语言成绩、资产状况、家庭成员情况等信息。</li>
                      <li><strong>对话信息：</strong>您与 AI 助理的沟通记录将被保存，用于为您提供连续的咨询服务及优化 AI 算法。</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-slate-800">3. 顾问匹配与服务</strong>
                    <ul className="mt-2 ml-4 space-y-1 list-disc">
                      <li><strong>需求信息：</strong>当您预约顾问时，我们会收集您的意向项目、预算、时间表等。</li>
                      <li><strong>文档管理：</strong>您在系统中上传的官方申请表格（如 IMM 系列）、证明材料（学历证明、财产证明等）将通过加密存储。这些材料仅对您指定的顾问可见，平台工作人员无权查看具体内容，除非获得您的明确授权。</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-slate-800">4. 支付与交易</strong>
                    <p className="mt-1 ml-4">当您购买平台服务或向顾问支付费用时，我们会收集您的交易记录、支付状态。我们不直接存储您的银行卡信息，支付由第三方合规支付机构处理。</p>
                  </li>
                  <li>
                    <strong className="text-slate-800">5. 设备权限调用（仅限 App 端）</strong>
                    <p className="mt-1 ml-4 mb-2">为确保 App 正常运行，我们可能会申请以下权限：</p>
                    <ul className="ml-4 space-y-1 list-disc">
                      <li><strong>相机/相册：</strong>用于上传证件照片、头像或真人视频认证。</li>
                      <li><strong>存储权限：</strong>用于下载申请表格或保存评估报告。</li>
                      <li><strong>通知权限：</strong>用于推送案件进度提醒、顾问回复通知。我们不会默认开启权限，仅在您触发相关功能时申请，您有权随时关闭。</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">二、我们如何共享、转让、公开披露您的个人信息</h2>
                <ul className="space-y-3 text-slate-600 list-disc ml-4">
                  <li><strong className="text-slate-800">共享：</strong>我们不会与任何公司、组织和个人共享您的个人信息，但以下情况除外：在获取明确同意的情况下共享；与顾问共享：根据您的选择，将您的背景信息和申请材料共享给您指定的持牌顾问；第三方服务商：为实现支付、实名认证等功能，我们可能会接入第三方 SDK（如支付 SDK、云存储 SDK）。</li>
                  <li><strong className="text-slate-800">转让与披露：</strong>除非法律法规要求或发生合并、收购等情况，我们不会转让或公开披露您的个人信息。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">三、我们如何保护和保存您的个人信息</h2>
                <ul className="space-y-2 text-slate-600 list-disc ml-4">
                  <li><strong className="text-slate-800">安全措施：</strong>我们采用 SSL 协议加密及 HTTPS 传输加密技术，并对敏感数据进行去标识化或脱敏处理。</li>
                  <li><strong className="text-slate-800">保存期限：</strong>我们仅在实现目的所必需的最短时间内保留您的信息。</li>
                  <li><strong className="text-slate-800">境内外存储：</strong>作为加拿大公司运营的平台，您的数据可能存储于境外安全服务器。我们将严格遵守相关法律关于数据出境的安全评估要求。</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">四、您的权利</h2>
                <p className="text-slate-600 leading-relaxed">
                  您有权访问、更正、删除您的个人信息，或注销您的账号。您可以通过平台设置页面或联系 support@jiayi.co 行使上述权利。
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">五、政策更新</h2>
                <p className="text-slate-600 leading-relaxed">
                  我们可能会适时修改本政策。对于重大变更，我们会通过弹窗或站内信的方式提醒您。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">六、如何联系我们</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  如果您对本隐私政策有任何疑问、意见或建议，通过以下方式与我们联系：
                </p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <p className="text-slate-700"><strong>邮箱：</strong>support@jiayi.co</p>
                  <p className="text-slate-700 mt-2"><strong>运营方：</strong>MapleBridge Technologies Inc.</p>
                </div>
              </section>
            </div>
          </article>
        ) : (
          <article className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-8 py-10 md:px-12 md:py-14">
              <p className="text-sm text-slate-500 mb-2">Effective date: February 9, 2026</p>
              <h1 className="text-3xl font-bold text-slate-900 mb-6">Jiayi Privacy Policy</h1>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Introduction</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Jiayi (“we,” “our,” or the “Platform”) is operated by MapleBridge Technologies Inc. We understand the importance of your personal information and are committed to keeping it secure. We uphold your trust by following principles such as: accountability, purpose specification, consent, data minimization, security, individual participation, and transparency.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  This Privacy Policy applies to the Jiayi website (www.jiayi.co), mobile applications, and related SaaS services. Please read this policy carefully before using our products or services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">1. How We Collect and Use Your Information</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  We collect only the information that is lawful, justified, and necessary for our services.
                </p>
                <ul className="space-y-4 text-slate-600">
                  <li>
                    <strong className="text-slate-800">Account registration and login:</strong> We may collect your phone number or email to create an account. If you join as a consultant, we may collect your name, ID documents (passport/ID), contact details, residence, video verification, and professional license (e.g. RCIC number).
                  </li>
                  <li>
                    <strong className="text-slate-800">Immigration assessment and AI services:</strong> For AI assessment reports, you may provide age, education, work history, language scores, assets, and family details. Conversations with the AI assistant may be stored to provide continuous service and improve our algorithms.
                  </li>
                  <li>
                    <strong className="text-slate-800">Consultant matching and services:</strong> When you book a consultant, we may collect your project type, budget, and schedule. Documents you upload (e.g. IMM forms, certificates) are stored securely and are visible only to your chosen consultant unless you give further consent.
                  </li>
                  <li>
                    <strong className="text-slate-800">Payments:</strong> We collect transaction and payment status. We do not store your card details; payments are processed by compliant third-party providers.
                  </li>
                  <li>
                    <strong className="text-slate-800">Device permissions (App only):</strong> We may request camera/photo library (for IDs and verification), storage (for forms and reports), and notifications (for case updates). Permissions are requested only when relevant; you can revoke them at any time.
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">2. Sharing, Transfer, and Disclosure</h2>
                <p className="text-slate-600 leading-relaxed mb-2">
                  We do not share your personal information with companies, organizations, or individuals except: with your consent; with your chosen licensed consultant(s) for your case; or with third-party service providers (e.g. payment or cloud SDKs) necessary for our services.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We do not transfer or publicly disclose your information unless required by law or in connection with a merger or acquisition.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">3. Protection and Retention</h2>
                <p className="text-slate-600 leading-relaxed mb-2">
                  We use SSL/HTTPS and de-identification or anonymization where appropriate. We retain your information only as long as necessary. As a Canadian-operated platform, data may be stored on secure servers outside your jurisdiction; we comply with applicable data export requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">4. Your Rights</h2>
                <p className="text-slate-600 leading-relaxed">
                  You may access, correct, or delete your personal information, or close your account, via the platform settings or by contacting support@jiayi.co.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">5. Policy Updates</h2>
                <p className="text-slate-600 leading-relaxed">
                  We may update this policy from time to time. For material changes, we will notify you via pop-up or in-app message.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4">6. Contact Us</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  For questions, comments, or suggestions about this Privacy Policy:
                </p>
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <p className="text-slate-700"><strong>Email:</strong> support@jiayi.co</p>
                  <p className="text-slate-700 mt-2"><strong>Operator:</strong> MapleBridge Technologies Inc.</p>
                </div>
              </section>
            </div>
          </article>
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-500">
          <a href="/" className="text-red-600 hover:text-red-700 font-medium">返回首页</a>
          <span className="mx-2">·</span>
          <a href="/terms" className="text-slate-600 hover:text-slate-800">服务条款</a>
          <span className="mx-2">·</span>
          <a href="/consultant-standards" className="text-slate-600 hover:text-slate-800">顾问审核规范</a>
          <span className="mx-2">·</span>
          <span>© {new Date().getFullYear()} 加移（Jiayi）· MapleBridge Technologies Inc.</span>
        </div>
      </footer>
    </main>
  );
}
