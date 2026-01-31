"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState(""); // 开发模式显示验证码

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!email) {
      setError("请输入邮箱地址");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("code");
        setCountdown(60);
        // 开发模式显示验证码
        if (data.devCode) {
          setDevCode(data.devCode);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("发送失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 验证登录
  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (data.success) {
        // 登录成功，跳转到会员中心
        router.push("/member");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("验证失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-xl shadow-lg" />
            <div className="text-left">
              <div className="text-xl font-bold text-slate-900">加移AI助理</div>
              <div className="text-sm text-slate-500">MaplePath AI</div>
            </div>
          </a>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            {step === "email" ? "登录 / 注册" : "输入验证码"}
          </h1>
          <p className="text-slate-500 text-center mb-8">
            {step === "email"
              ? "使用邮箱验证码快速登录，无需密码"
              : `验证码已发送至 ${email}`}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Dev Code Display */}
          {devCode && step === "code" && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
              <span className="font-medium">开发模式：</span> 验证码是 <span className="font-mono font-bold">{devCode}</span>
            </div>
          )}

          {step === "email" ? (
            /* Email Input */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                />
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading || !email}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold
                           hover:from-red-700 hover:to-red-600 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-red-500/25"
              >
                {loading ? "发送中..." : "获取验证码"}
              </button>
            </div>
          ) : (
            /* Code Input */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  6位验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-center text-2xl font-mono tracking-widest"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold
                           hover:from-red-700 hover:to-red-600 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-red-500/25"
              >
                {loading ? "验证中..." : "登录"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setDevCode("");
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ← 更换邮箱
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || loading}
                  className="text-red-600 hover:text-red-700 disabled:text-slate-400"
                >
                  {countdown > 0 ? `${countdown}秒后重发` : "重新发送"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>登录即表示您同意我们的</p>
          <p>
            <a href="#" className="text-red-600 hover:underline">服务条款</a>
            {" 和 "}
            <a href="#" className="text-red-600 hover:underline">隐私政策</a>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-slate-500 hover:text-slate-700">
            ← 返回首页
          </a>
        </div>
      </div>
    </main>
  );
}
