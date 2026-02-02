"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "verify">("input");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/member");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 发送注册验证码
  const handleSendRegisterCode = async () => {
    if (!email) {
      setError("请输入邮箱地址");
      return;
    }

    if (!password || password.length < 6) {
      setError("密码至少6位");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-register-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("verify");
        setCountdown(60);
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

  // 验证注册
  const handleVerifyRegister = async () => {
    if (!code || code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, code }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/member");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("注册失败，请稍后重试");
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

        {/* Login/Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          {/* Mode Tabs */}
          {step === "input" && (
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === "login"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === "register"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                注册
              </button>
            </div>
          )}

          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">
            {step === "verify"
              ? "验证邮箱"
              : mode === "login"
              ? "欢迎回来"
              : "创建账号"}
          </h1>
          <p className="text-slate-500 text-center mb-8">
            {step === "verify"
              ? `验证码已发送至 ${email}`
              : mode === "login"
              ? "使用邮箱和密码登录"
              : "填写信息完成注册"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Dev Code Display */}
          {devCode && step === "verify" && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm">
              <span className="font-medium">开发模式：</span> 验证码是{" "}
              <span className="font-mono font-bold">{devCode}</span>
            </div>
          )}

          {step === "input" ? (
            <div className="space-y-4">
              {/* Email Input */}
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
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "至少6位" : "输入密码"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && mode === "login" && handlePasswordLogin()}
                />
              </div>

              {/* Confirm Password (Register Only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleSendRegisterCode()}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={mode === "login" ? handlePasswordLogin : handleSendRegisterCode}
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold
                           hover:from-red-700 hover:to-red-600 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-red-500/25"
              >
                {loading
                  ? mode === "login"
                    ? "登录中..."
                    : "发送中..."
                  : mode === "login"
                  ? "登录"
                  : "获取验证码"}
              </button>
            </div>
          ) : (
            /* Verification Code Input */
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
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyRegister()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerifyRegister}
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold
                           hover:from-red-700 hover:to-red-600 transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-red-500/25"
              >
                {loading ? "验证中..." : "完成注册"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep("input");
                    setCode("");
                    setDevCode("");
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ← 返回
                </button>
                <button
                  onClick={handleSendRegisterCode}
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
            <a href="#" className="text-red-600 hover:underline">
              服务条款
            </a>
            {" 和 "}
            <a href="#" className="text-red-600 hover:underline">
              隐私政策
            </a>
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
