import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '加拿大移民申请，这5个坑千万别踩！ - 加移jiayi',
  description: '总结加拿大移民申请中最常见的5个错误，包括材料造假、信息不一致、错过截止日期等，帮助申请人避开雷区，提高成功率。',
  keywords: '加拿大移民, 移民申请, 申请错误, 避坑指南, 移民材料, 拒签原因',
};

export default function ImmigrationMistakesPage() {
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
          加拿大移民申请，这5个坑千万别踩！
        </h1>

        <div className="flex items-center text-gray-600 text-sm mb-8">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mr-4">
            申请技巧
          </span>
          <time>2026-02-17</time>
        </div>

        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src="/blog-images/xiaohongshu_post_mistakes_img.png"
            alt="加拿大移民申请常见错误"
            fill
            className="object-cover"
          />
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 leading-relaxed">
            移民加拿大是很多人的梦想，但申请过程中有太多“坑”了！今天给大家总结一下最常见的5个错误，希望大家能避开这些雷区，少走弯路！
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. 材料造假或夸大
          </h2>
          <p className="text-gray-700 leading-relaxed">
            这是最严重的错误，没有之一！一旦被发现，不仅申请会被拒，还可能面临5年内禁止入境的惩罚。千万不要抱有侥幸心理，伪造工作经验、学历、语言成绩等。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. 信息前后不一致
          </h2>
          <p className="text-gray-700 leading-relaxed">
            比如，这次申请填写的居住地址和上次申请旅游签证时填的不一样；或者工作经历的描述和推荐信里的有出入。这些小细节都可能让移民官对你的诚信产生怀疑。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. 错过截止日期
          </h2>
          <p className="text-gray-700 leading-relaxed">
            无论是补料、体检，还是递交申请，都有严格的时间限制。一旦错过，申请就可能被直接终止。一定要把所有重要的日期都记在日历上，提前准备。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. “移民倾向”处理不当
          </h2>
          <p className="text-gray-700 leading-relaxed">
            在申请学签或旅游签时，既要表达对加拿大的向往，又不能让移民官觉得你来了就不想走。这个“度”的把握很重要，需要有理有据地阐述你的访问目的和回国计划。
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. 盲目DIY，不咨询专业人士
          </h2>
          <p className="text-gray-700 leading-relaxed">
            虽然DIY可以省钱，但移民政策复杂多变，自己研究很容易出错。在关键问题上，花点钱咨询持牌移民顾问（RCIC）是非常值得的，可以帮你避免很多不必要的麻烦。
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="text-gray-700 leading-relaxed">
              担心自己踩坑？可以让 **加移jiayi.co** 平台上的持牌顾问帮你把关。
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              这是一个连接申请人和持牌顾问的SaaS平台，信息透明，价格公道。你可以先用AI工具免费评估，对自己的情况有个了解，再决定是否需要专业服务。
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              免费评估入口：<a href="https://www.jiayi.co" className="text-blue-600 hover:underline font-medium">www.jiayi.co</a>
            </p>
          </div>

          <p className="text-sm text-gray-500 mt-8 italic">
            （免责声明：本文仅为信息分享，不构成任何移民建议。具体申请请咨询持牌移民顾问。）
          </p>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">相关文章</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog/study-permit-2026" className="group">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  2026年加拿大学签新政来了！
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  了解学签申请的最新要求和注意事项
                </p>
              </div>
            </Link>
            <Link href="/blog/pnp-immigration" className="group">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  省提名移民到底是什么？
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  详解加拿大省提名项目的优势和申请要点
                </p>
              </div>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
