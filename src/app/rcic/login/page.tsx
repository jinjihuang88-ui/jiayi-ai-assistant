"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RCICLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState("");

  // 页面加载时初始化数据库
  useEffect(() => {
    fetch("/api/init").catch(() => {});
  }, []);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("请输入邮箱");
      return;
    }

    setLoading(true);
    setError("");
    setDevCode("");

    try {
      const res = await fetch("/api/rcic/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, step: "send_code" }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("code");
        // 显示验证码（临时方案）
        if (data.devCode) {
          setDevCode(data.devCode);
          setCode(data.devCode);
        }
        // 开始倒计时
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || "发送验证码失败");
        if (data.debug) {
          console.error("Debug info:", data.debug);
        }
      }
    } catch (err) {
      console.error("Send code error:", err);
      setError("发送验证码失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!code.trim()) {
      setError("请输入验证码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rcic/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, step: "verify" }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/rcic/dashboard");
      } else {
        setError(data.message || "登录失败");
        if (data.debug) {
          console.error("Debug info:", data.debug);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("登录失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 mb-4">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RCIC 顾问后台</h1>
          <p className="text-slate-400 mt-2">移民顾问专用管理系统</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {step === "email" ? "顾问登录" : "输入验证码"}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* 验证码提示 */}
          {devCode && step === "code" && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <span className="font-medium">验证码：</span>
              <span className="font-mono font-bold ml-2">{devCode}</span>
              <span className="text-xs ml-2 text-slate-400">（已自动填入）</span>
            </div>
          )}

          {step === "email" ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册邮箱"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                />
              </div>

              {/* 测试账号提示 */}
              <div className="mb-4 p-3 rounded-lg bg-slate-700/50 border border-slate-600 text-sm">
                <div className="text-slate-400 mb-2">测试账号：</div>
                <div className="space-y-1 text-slate-300">
                  <div>• rcic@example.com（张顾问）</div>
                  <div>• consultant@example.com（李移民）</div>
                </div>
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "发送中..." : "获取验证码"}
              </button>
            </>
          ) : (
            <>
              <div className="mb-2 text-sm text-slate-400">
                验证码已发送至 <span className="text-emerald-400">{email}</span>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-center text-2xl tracking-widest"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
              >
                {loading ? "登录中..." : "登录"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setDevCode("");
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ← 返回修改邮箱
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || loading}
                  className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>仅限持牌移民顾问 (RCIC) 使用</p>
          <a href="/" className="text-emerald-400 hover:text-emerald-300 mt-2 inline-block">
            返回首页
          </a>
        </div>
      </div>
    </main>
  );
}
