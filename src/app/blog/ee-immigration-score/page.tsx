import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '加拿大EE移民分数持续走高，普通人还有机会吗？ - 加移jiayi',
  description: 'Express Entry分数线持续走高，普通申请人还有哪些移民路径？省提名、LMIA工签、留学移民等多种选择详解。',
  keywords: '加拿大移民,Express Entry,EE分数,省提名,LMIA,留学移民,移民路径',
};

export default function EEImmigrationScorePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/blog"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← 返回博客
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          加拿大EE移民分数持续走高，普通人还有机会吗？
        </h1>

        {/* Meta */}
        <div className="flex items-center text-gray-600 text-sm mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mr-4">
            移民政策
          </span>
          <time>2026-02-17</time>
        </div>

        {/* Featured Image */}
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src="/blog-images/forum_post_ee_banner.png"
            alt="加拿大EE移民分数分析"
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            最近很多朋友都在焦虑，加拿大联邦技术移民Express Entry（EE）的分数线简直是"高攀不起"，感觉移民路越来越窄了。作为一个在移民圈里摸爬滚打多年的"老油条"，我想和大家聊聊，现在的形势下，我们普通申请人到底还有没有机会？
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            EE分数为什么这么高？
          </h2>

          <p className="text-gray-700 leading-relaxed">
            简单来说，就是"人多坑少"。疫情后，加拿大积压了大量申请，同时又提高了移民目标，导致申请人数暴增。但高分段的申请人也越来越多，竞争自然就激烈了。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            普通人还有哪些路可以走？
          </h2>

          <p className="text-gray-700 leading-relaxed">
            EE分数暂时够不着，千万别灰心，加拿大的移民体系是多元化的，条条大路通罗马！
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
            1. 省提名（PNP）：你的专属"绿色通道"
          </h3>

          <p className="text-gray-700 leading-relaxed">
            这是目前最主流、也是最适合大多数人的方式。加拿大每个省都有自己的省提名项目，很多项目的要求都比EE低。比如：
          </p>

          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>安省（Ontario）：</strong> 有雇主担保、硕士/博士毕业生等项目，选择非常多。</li>
            <li><strong>BC省（British Columbia）：</strong> 科技、医疗等行业有人才缺口，相关专业的同学可以重点关注。</li>
            <li><strong>阿省（Alberta）：</strong> 旅游、酒店等行业有专门的移民通道。</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mt-4">
            <strong>关键点：</strong> 找到与你背景匹配的省份和项目是成功的关键。你需要花时间研究各省的政策，或者找专业人士评估。
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
            2. LMIA工签：曲线救国，先工作后移民
          </h3>

          <p className="text-gray-700 leading-relaxed">
            如果能找到一个加拿大雇主愿意为你申请LMIA（劳动力市场影响评估），你就可以先拿到工签来加拿大工作，积累本地工作经验。这不仅能让你在EE系统中获得宝贵的加分，很多省提名项目也对有本地工作经验的申请人情有独钟。
          </p>

          <p className="text-gray-700 leading-relaxed">
            <strong>关键点：</strong> 找到靠谱的雇主是难点，需要利用好各种招聘网站和人脉资源。
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
            3. 留学移民：最稳妥的"长线投资"
          </h3>

          <p className="text-gray-700 leading-relaxed">
            对于年龄较小、学习能力强的朋友，来加拿大读一个College或Master课程，毕业后拿工签，再申请移民，是一条非常稳妥的路径。读书期间不仅能提升语言和专业能力，还能提前适应加拿大的生活。
          </p>

          <p className="text-gray-700 leading-relaxed">
            <strong>关键点：</strong> 选择一个就业前景好、且有移民优势的专业至关重要。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            如何知道自己适合哪条路？
          </h2>

          <p className="text-gray-700 leading-relaxed">
            说了这么多，你可能还是有点懵。每个人的情况都不同，背景、专业、工作经验、语言能力都决定了最适合你的路径。
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="text-gray-700 leading-relaxed">
              这里给大家推荐一个AI小工具：<strong>加移jiayi.co</strong>
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              这是一个专门做加拿大移民信息管理的SaaS平台，他们有一个免费的AI评估功能，可以根据你的背景信息，智能分析你的移民可行性，并给出路径建议和风险提示。最重要的是，它不会像某些中介一样给你"画大饼"，承诺100%成功，而是客观地帮你分析"值不值得继续"。
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              大家可以去 <a href="https://www.jiayi.co" className="text-blue-600 hover:underline font-medium">www.jiayi.co</a> 免费测一下，对自己有个清晰的认知，再做决定。平台本身不提供移民服务，但可以连接到持牌的移民顾问（RCIC），信息是公开透明的。
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            写在最后
          </h2>

          <p className="text-gray-700 leading-relaxed">
            移民是一场信息战，也是一场持久战。分数高只是暂时的，机会永远留给有准备的人。希望大家都能找到最适合自己的路，成功上岸！
          </p>

          <p className="text-gray-700 leading-relaxed mt-4">
            如果觉得内容有用，欢迎大家点赞、收藏、转发！有任何问题也欢迎在评论区交流。
          </p>

          <p className="text-sm text-gray-500 mt-8 italic">
            （免责声明：本文仅为信息分享，不构成任何移民建议。具体申请请咨询持牌移民顾问。）
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            想了解您的移民可行性？
          </h3>
          <p className="text-gray-600 mb-6">
            使用我们的AI评估工具，获取专业的移民路径分析和建议
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            免费AI评估
          </Link>
        </div>

        {/* Related Posts */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">相关文章</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog/pnp-immigration" className="group">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  省提名移民到底是什么？
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  了解加拿大省提名项目的优势和申请要点
                </p>
              </div>
            </Link>
            <Link href="/blog/lmia-work-permit" className="group">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  LMIA工签到底是什么？
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  详解LMIA工签申请流程和注意事项
                </p>
              </div>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
