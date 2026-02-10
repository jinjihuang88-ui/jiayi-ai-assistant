// src/app/auth/login/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: 'user', // 默认为普通用户
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 登录成功，跳转到会员中心
        router.push('/member');
      } else {
        setStatus('error');
        setMessage(data.error || '登录失败');
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('error');
      setMessage('登录过程中发生错误');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">登录</h2>
          <p className="text-gray-600">欢迎回到嘉怡移民助手</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              disabled={status === 'loading'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="请输入密码"
              disabled={status === 'loading'}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                记住我
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              忘记密码？
            </Link>
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? '登录中...' : '登录'}
          </button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              还没有账户？{' '}
              <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-medium">
                用户注册
              </Link>
              {' / '}
              <Link href="/auth/rcic/register" className="text-purple-600 hover:text-purple-700 font-medium">
                顾问注册
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/auth/resend-verification" className="text-purple-600 hover:text-purple-700 font-medium">
                重新发送验证邮件
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              <Link href="/" className="text-gray-500 hover:text-gray-700 font-medium">
                返回首页
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
