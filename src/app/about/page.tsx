"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="bg-white text-slate-900 min-h-screen">
      {/* Header - 与首页一致 */}
      <header className="sticky top-0 z-50 bg-[#1E293B] border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="加移 Logo" className="h-10 w-10 rounded-lg shadow-md" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">加移</span>
              <span className="text-xs text-white/50 font-light">Powered by MapleBridge</span>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
            <Link href="/" className="text-white/80 hover:text-white transition-colors py-2">首页</Link>
            <Link href="/auth/login?redirect=/member/consultants" className="text-white/80 hover:text-white transition-colors py-2">找顾问</Link>
            <Link href="/services" className="text-white/80 hover:text-white transition-colors py-2">服务</Link>
            <Link href="/about" className="text-white font-medium py-2">关于我们</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 text-sm font-medium">会员登录</Link>
            <Link href="/rcic/login" className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:bg-white/10 text-sm font-medium">顾问登录 / 注册</Link>
          </div>
        </div>
      </header>

      {/* 主视觉：Logo 图 + 开篇 */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-12 flex justify-center">
            <img
              src="/about/logo.png"
              alt="加移 Jiayi · Powered by MapleBridge"
              className="max-w-[280px] w-full h-auto object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            我们为什么做了 jiayi.co
          </h1>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            jiayi.co 的诞生，并不是因为我们一开始就想做一个“移民平台”。<br />
            相反，它来自很多次很相似的对话。
          </p>
          <p className="mt-6 text-slate-600 leading-relaxed">
            有人在决定移民前，反复咨询不同的移民顾问；<br />
            有人已经交了费用，却越来越不确定这是不是一条对的路；<br />
            也有人在失败之后才发现——自己并不是条件不够，而是一开始就走错了路径。
          </p>
          <p className="mt-6 text-slate-700 font-medium">
            这些人有一个共同点：他们在做决定之前，其实并没有一个真正“中立”的判断空间。
          </p>
        </div>
      </section>

      {/* Hero 图：世界地图 + 最难的不是信息 */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl mb-12">
            <img
              src="/about/hero.png"
              alt="jiayi.co — Many people believe that the hardest part of immigration is information. So we created jiayi.co."
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              移民这件事，最难的从来不是信息
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              在今天，关于移民的信息并不少。项目、政策、分数、案例，几乎随处可见。<br />
              真正困难的是另一件事：我适不适合？这一步值不值得开始？如果失败，风险到底在谁身上？
            </p>
            <p className="text-slate-600 leading-relaxed">
              这些问题，往往很少有人愿意正面回答。不是因为不重要，而是因为——它们并不利于“促成交易”。
            </p>
          </div>
        </div>
      </section>

      {/* 不对等的开始 */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            我们见过太多“不对等的开始”
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            在传统的移民咨询流程中，事情通常是这样发生的：
          </p>
          <ul className="space-y-3 text-slate-600 list-disc pl-6 mb-6">
            <li>用户在并不完全确定的情况下，先支付了费用</li>
            <li>顾问开始服务，但结果高度不确定</li>
            <li>一旦失败，时间和金钱成本几乎全部由用户承担</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mb-4">
            久而久之，移民变成了一件风险高度集中在一方的事情。
          </p>
          <p className="text-slate-700 font-medium">
            我们开始反复思考一个问题：如果一件事失败的代价如此之高，那它是否应该在开始前，被更认真地判断一次？
          </p>
        </div>
      </section>

      {/* jiayi.co 的想法 + 三步骤流程图 */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            jiayi.co 的想法，其实很简单
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            我们并不想解决“怎么更快移民”，而是想解决一个更基础的问题：<br />
            <span className="font-medium text-slate-800">怎样才能避免不该发生的移民开始？</span>
          </p>
          <p className="text-slate-600 leading-relaxed mb-12">
            于是，jiayi.co 的基本逻辑慢慢成型了。
          </p>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg mb-12 bg-white">
            <img
              src="/about/process.png"
              alt="AI Initial Assessment → Fund Custody → Immigration Consultant Service"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* 先 AI 初评 */}
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-12 mb-4">
            我们先从「AI 初评」开始
          </h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            在 jiayi.co，AI 初评并不是用来给出结论的“裁判”，而更像是一次移民前的体检。它不会承诺成功，也不会推荐具体项目，它做的只有一件事：
          </p>
          <ul className="space-y-2 text-slate-600 list-disc pl-6 mb-6">
            <li>帮你识别明显不匹配的路径</li>
            <li>提醒你当前条件下的高风险点</li>
            <li>在你付出任何费用之前，让你先冷静下来看看全局</li>
          </ul>
          <p className="text-slate-600 leading-relaxed">
            如果初评结果显示风险过高，我们不会进入顾问阶段。这不是拒绝谁，而是希望不要从一个明显不合理的起点开始。
          </p>
        </div>
      </section>

      {/* 安全/信任图 + 资金托管 */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white p-6 flex items-center justify-center min-h-[280px]">
              <img
                src="/about/security.png"
                alt="AI · Security & Trust"
                className="max-w-full h-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                然后，我们重新设计了「交易方式」
              </h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                在 jiayi.co，我们采用资金托管机制。这意味着，在结果尚未达成之前，服务费用并不会直接支付给移民顾问。只有在约定的阶段性或最终结果实现后，资金才会完成结算。
              </p>
              <p className="text-slate-600 leading-relaxed">
                我们这样做，并不是因为“不信任顾问”，而是因为我们相信：当风险被更公平地分配，服务本身才会真正对齐结果。移民失败可以发生，但失败不应该只由一方承担。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* jiayi.co 扮演什么角色 */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            jiayi.co 在其中扮演什么角色？
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            我们不是中介，也不是裁判。更准确地说，jiayi.co 希望成为一个规则更清晰的连接者：
          </p>
          <ul className="space-y-3 text-slate-600 list-disc pl-6 mb-6">
            <li>在用户和移民顾问之间</li>
            <li>在期待与现实之间</li>
            <li>在开始之前，而不是结束之后</li>
          </ul>
          <p className="text-slate-700 font-medium">
            我们希望每一次开始，都建立在相对清楚、相对理性的判断之上。
          </p>
        </div>
      </section>

      {/* 为什么我们选择慢慢来 */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            为什么我们选择慢慢来？
          </h2>
          <p className="text-slate-600 leading-relaxed">
            因为我们知道，移民不是一个可以“试试看”的决定。它关系到时间、金钱、职业路径，甚至家庭选择。所以在 jiayi.co，我们宁愿在开始前多问几个问题，也不愿意在结果出来后再谈遗憾。
          </p>
        </div>
      </section>

      {/* 写在最后 + CTA */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
            写在最后
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            如果你正在考虑移民，也许你不需要马上做决定。你可能更需要的是一个地方，能让你在没有压力、没有销售推动的情况下，把这件事想清楚。
          </p>
          <p className="text-slate-600 leading-relaxed mb-6">
            jiayi.co 正是基于这样的想法而存在。我们不急着让你开始，只希望当你真正开始时，那是一条你理解、也愿意承担的路。
          </p>
          <p className="text-slate-600 leading-relaxed mb-10">
            如果你愿意，这里也欢迎那些认同结果导向、愿意为专业负责的移民顾问。因为我们始终相信：好的开始，应该对所有人都公平。
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-8 border-t border-slate-200">
            <Link
              href="/assessment"
              className="px-8 py-4 rounded-xl bg-[#C62828] text-white font-semibold text-lg hover:bg-[#B71C1C] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              免费 AI 移民初评
            </Link>
            <Link
              href="/auth/login?redirect=/member/consultants"
              className="px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-semibold text-lg hover:border-[#C62828] hover:text-[#C62828] transition-all"
            >
              浏览顾问
            </Link>
          </div>
        </div>
      </section>

      {/* English version — text only, no images */}
      <section className="py-16 md:py-20 bg-slate-100 border-t-2 border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 id="english" className="text-2xl md:text-3xl font-bold text-slate-800 mb-10">
            In English
          </h2>

          <div className="space-y-10 text-slate-700 leading-relaxed">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Why we built jiayi.co</h3>
              <p>jiayi.co was not born from a plan to build “an immigration platform.” It came from many similar conversations. Some people consulted one immigration consultant after another before deciding; others had already paid fees but grew less and less sure they were on the right path; still others only realized after failing that the issue was not their qualifications but having taken the wrong path from the start. What they had in common: before making a decision, they did not have a truly neutral space to judge.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The hardest part of immigration is not information</h3>
              <p>Today there is no shortage of information on immigration—programs, policies, points, cases are everywhere. What is actually hard is something else: Am I suitable? Is this step worth starting? If it fails, who really bears the risk? These questions are rarely answered head-on—not because they don’t matter, but because they don’t help “close the deal.”</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">We have seen too many unequal beginnings</h3>
              <p>In the traditional immigration consulting flow, things usually go like this: the user pays before being fully certain; the consultant starts service with highly uncertain outcomes; if it fails, time and money fall largely on the user. Over time, immigration becomes something where risk is heavily concentrated on one side. We kept asking: if the cost of failure is so high, shouldn’t it be judged more seriously before starting?</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">The idea behind jiayi.co is simple</h3>
              <p>We are not trying to solve “how to immigrate faster.” We are trying to solve a more basic question: how to prevent immigration journeys that should not have started. So the basic logic of jiayi.co took shape.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">We start with AI initial assessment</h3>
              <p>At jiayi.co, the AI initial assessment is not a “referee” that gives a verdict. It is more like a pre-immigration check-up. It does not promise success or recommend specific programs. It does one thing: help you spot clearly mismatched paths, flag high-risk points in your current situation, and let you step back and see the full picture before paying anything. If the assessment shows risk too high, we do not move to the consultant stage—not to reject anyone, but to avoid starting from an obviously unreasonable place.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Then we redesigned how payment works</h3>
              <p>At jiayi.co we use a fund custody mechanism. Until agreed milestones or the final outcome are met, fees are not paid directly to the immigration consultant; only then is the amount released. We do this not because we “don’t trust consultants,” but because we believe that when risk is shared more fairly, the service itself aligns with results. Immigration can still fail, but failure should not be borne by one side alone.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">What role does jiayi.co play?</h3>
              <p>We are not an intermediary or a judge. More accurately, jiayi.co aims to be a connector with clearer rules: between users and immigration consultants, between expectations and reality, and before the start—not only after the end. We want every start to be based on relatively clear, relatively rational judgment.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Why we take it slow</h3>
              <p>Because we know immigration is not a “let’s try and see” decision. It involves time, money, career path, and even family. So at jiayi.co we would rather ask a few more questions before starting than talk about regret after the outcome.</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">In closing</h3>
              <p>If you are considering immigration, you may not need to decide right away. You may need a place where you can think it through without pressure or sales push. jiayi.co exists for that. We are not in a rush for you to start; we only hope that when you do start, it is a path you understand and are willing to take. We also welcome immigration consultants who care about results and take responsibility for their expertise—because we believe a good start should be fair for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - 与首页一致 */}
      <footer className="bg-[#1E293B] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
                <div>
                  <div className="font-bold text-lg">加移 (Jiayi)</div>
                  <div className="text-sm text-white/60">Powered by MapleBridge</div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-md">
                一个让中国用户透明、安全地连接加拿大移民与留学顾问的平台。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link href="/about" className="hover:text-white transition-colors">关于 jiayi.co</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">平台规则</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>邮箱: support@jiayi.co</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
            © {new Date().getFullYear()} 加移（Jiayi）· Powered by MapleBridge
          </div>
        </div>
      </footer>
    </main>
  );
}
