"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      alert("请输入邮箱");
      return;
    }

    setLoading(true);

    try {
      // 免登录模式：直接创建临时会话
      const response = await fetch("/api/auth/test-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        alert("登录成功！（测试模式）");
        router.push("/member");
      } else {
        alert(data.message || "登录失败");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">用户登录</h1>
          <p className="text-gray-600">测试模式 - 免登录</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入任意邮箱即可登录"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              测试模式：输入任意邮箱即可直接登录，无需验证
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "登录中..." : "立即登录（测试）"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>测试模式说明：</p>
          <ul className="mt-2 text-left space-y-1">
            <li>• 无需注册，输入任意邮箱即可登录</li>
            <li>• 系统会自动创建测试账号</li>
            <li>• 仅用于功能测试</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
