'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在验证您的邮箱...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('验证链接无效');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/rcic/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('邮箱验证成功！您的申请已提交审核，请等待管理员审核通过。');
      } else {
        setStatus('error');
        setMessage(data.message || '验证失败，请重试');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('验证过程中发生错误，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
            )}
            {status === 'success' && (
              <div className="rounded-full bg-green-100 p-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-full bg-red-100 p-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {status === 'loading' && '验证中...'}
            {status === 'success' && '验证成功！'}
            {status === 'error' && '验证失败'}
          </h1>

          {/* Message */}
          <p className="text-center text-gray-600 mb-8">
            {message}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' && (
              <>
                <p className="text-sm text-center text-gray-500 mb-4">
                  我们会在 1-3 个工作日内完成审核，审核通过后会发送邮件通知您。
                </p>
                <Link
                  href="/rcic/login"
                  className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  前往登录
                </Link>
              </>
            )}
            {status === 'error' && (
              <Link
                href="/rcic/register"
                className="block w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                重新注册
              </Link>
            )}
            <Link
              href="/"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
