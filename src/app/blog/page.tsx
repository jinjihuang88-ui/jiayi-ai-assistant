import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: '博客 - 加移jiayi | 加拿大移民资讯',
  description: '加拿大移民、学签、工签最新资讯和政策解读，帮助您了解移民路径和申请技巧。',
  keywords: '加拿大移民,Express Entry,省提名,学签,工签,LMIA,移民资讯',
};

const blogPosts = [
  {
    id: 'risk-compass-guide',
    title: '如何使用 Risk Compass AI 工具评估您的加拿大移民风险？',
    excerpt: 'Risk Compass 是加移(Jiayi)推出的 AI 驱动评估工具，帮助申请人精准识别加拿大签证和移民申请中的潜在风险，并提供专业的应对策略。',
    image: '/blog-images/forum_post_study_permit_banner.png',
    date: '2026-02-24',
    category: 'AI 评估工具',
  },
  {
    id: 'ee-immigration-score',
    title: '加拿大EE移民分数持续走高，普通人还有机会吗？',
    excerpt: '最近很多朋友都在焦虑，加拿大联邦技术移民Express Entry（EE）的分数线简直是"高攀不起"。作为一个在移民圈里摸爬滚打多年的"老油条"，我想和大家聊聊，现在的形势下，我们普通申请人到底还有没有机会？',
    image: '/blog-images/forum_post_ee_banner.png',
    date: '2026-02-17',
    category: '移民政策',
  },
  {
    id: 'study-permit-2026',
    title: '2026年加拿大学签新政来了！留学生该如何应对？',
    excerpt: '最近加拿大移民局（IRCC）公布了2026年学签的一系列新政策，在留学生圈里炸开了锅。有人说"门槛变高了"，有人说"更规范了"，还有人担心"会不会影响我的申请"？',
    image: '/blog-images/forum_post_study_permit_banner.png',
    date: '2026-02-17',
    category: '学签政策',
  },
  {
    id: 'pnp-immigration',
    title: '省提名移民到底是什么？为什么说它是"普通人"的最佳选择？',
    excerpt: '很多想移民加拿大的朋友，第一反应都是去查Express Entry（EE）的分数线，然后发现分数高得离谱，瞬间觉得移民无望。但其实，加拿大的移民体系远比你想象的要灵活，省提名（PNP）就是一条非常适合普通人的"绿色通道"。',
    image: '/blog-images/forum_post_pnp_banner.png',
    date: '2026-02-17',
    category: '省提名',
  },
  {
    id: 'immigration-mistakes',
    title: '加拿大移民申请，这5个坑千万别踩！',
    excerpt: '移民加拿大是很多人的梦想，但申请过程中有太多"坑"了！今天给大家总结一下最常见的5个错误，希望大家能避开这些雷区，少走弯路！',
    image: '/blog-images/xiaohongshu_post_mistakes_img.png',
    date: '2026-02-17',
    category: '申请技巧',
  },
  {
    id: 'lmia-work-permit',
    title: 'LMIA工签到底是什么？普通人能申请吗？',
    excerpt: '最近很多朋友问我："LMIA工签到底是什么？我能不能申请？"今天就来给大家科普一下！LMIA全称是Labour Market Impact Assessment（劳动力市场影响评估），简单来说，就是加拿大政府评估"这个岗位是不是真的招不到本地人，必须要雇外国人"。',
    image: '/blog-images/xiaohongshu_post_lmia_img.png',
    date: '2026-02-17',
    category: '工签政策',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">加移博客</h1>
              <p className="mt-2 text-gray-600">加拿大移民资讯与政策解读</p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <Link href={`/blog/${post.id}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                      {post.category}
                    </span>
                    <time className="text-sm text-gray-500">{post.date}</time>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 text-blue-600 font-medium text-sm hover:underline">
                    阅读全文 →
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            想了解您的移民可行性？
          </h2>
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 加移（Jiayi）· Powered by MapleBridge</p>
            <p className="mt-2">
              免责声明：本博客内容仅供参考，不构成移民或法律建议。具体申请请咨询持牌移民顾问。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
