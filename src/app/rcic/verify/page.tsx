// 服务端验证：点击邮件链接一次请求完成，国内可访问
import Link from 'next/link';
import { verifyRCICEmailToken } from '@/lib/verify-rcic-email';

type SearchParams = Promise<{ token?: string }>;

export default async function RCICVerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="rounded-full bg-red-100 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">验证链接无效</h1>
            <p className="text-center text-gray-600 mb-8">请使用邮件中的完整链接。</p>
            <div className="space-y-3">
              <Link href="/rcic/register" className="block w-full py-3 px-4 bg-purple-600 text-white text-center rounded-lg font-medium">
                重新注册
              </Link>
              <Link href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const result = await verifyRCICEmailToken(token);

  if (result.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="rounded-full bg-green-100 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">验证成功！</h1>
            <p className="text-center text-gray-600 mb-6">{result.message}</p>
            <p className="text-sm text-center text-gray-500 mb-4">
              我们会在 1-3 个工作日内完成审核，审核通过后会发送邮件通知您。
            </p>
            <div className="space-y-3">
              <Link href="/rcic/login" className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-lg font-medium">
                前往登录
              </Link>
              <Link href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">验证失败</h1>
          <p className="text-center text-gray-600 mb-8">{result.error}</p>
          <div className="space-y-3">
            <Link href="/rcic/register" className="block w-full py-3 px-4 bg-purple-600 text-white text-center rounded-lg font-medium">
              重新注册
            </Link>
            <Link href="/" className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
