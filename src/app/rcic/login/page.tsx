"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ConsultantLevel = "A" | "B" | "C";

export default function RCICLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "verify" | "profile">("input");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");

  // 注册信息
  const [consultantLevel, setConsultantLevel] = useState<ConsultantLevel>("A");
  const [nameCn, setNameCn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [rcicNumber, setRcicNumber] = useState("");
  const [organization, setOrganization] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [serviceScope, setServiceScope] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);

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
      const res = await fetch("/api/rcic/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/rcic/dashboard");
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
      const res = await fetch("/api/rcic/auth/send-register-code", {
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

  // 验证邮箱
  const handleVerifyEmail = async () => {
    if (!code || code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rcic/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("profile");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("验证失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 完成注册
  const handleCompleteRegistration = async () => {
    // 基础验证
    if (!nameCn || !nameEn || !phone || !country || !city) {
      setError("请填写所有基础信息");
      return;
    }

    // A类顾问验证
    if (consultantLevel === "A") {
      if (!rcicNumber || !verificationLink) {
        setError("A类顾问必须提供RCIC编号和验证链接");
        return;
      }
    }

    // B类顾问验证
    if (consultantLevel === "B") {
      if (!yearsOfExperience || !serviceScope) {
        setError("B类顾问必须提供从业年限和服务范围说明");
        return;
      }
    }

    if (!idDocument) {
      setError("请上传身份证件");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 上传身份证件
      const formData = new FormData();
      formData.append("file", idDocument);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        setError("文件上传失败");
        return;
      }

      // 提交注册信息
      const res = await fetch("/api/rcic/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          code,
          consultantLevel,
          nameCn,
          nameEn,
          phone,
          country,
          city,
          rcicNumber: consultantLevel === "A" ? rcicNumber : undefined,
          organization: consultantLevel === "A" ? organization : undefined,
          verificationLink: consultantLevel === "A" ? verificationLink : undefined,
          yearsOfExperience: consultantLevel === "B" ? yearsOfExperience : undefined,
          serviceScope: consultantLevel === "B" ? serviceScope : undefined,
          idDocumentUrl: uploadData.url,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("注册申请已提交，请等待人工审核（1-3个工作日）");
        router.push("/rcic/login");
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 mb-4">
            <span className="text-3xl">🏛️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RCIC 顾问后台</h1>
          <p className="text-slate-400 mt-2">移民顾问专用管理系统</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-8">
          {/* Mode Tabs */}
          {step === "input" && (
            <div className="flex gap-2 mb-6 p-1 bg-slate-700/50 rounded-xl">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === "login"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  mode === "register"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                注册
              </button>
            </div>
          )}

          <h2 className="text-xl font-semibold text-white mb-2 text-center">
            {step === "verify"
              ? "验证邮箱"
              : step === "profile"
              ? "完善资料"
              : mode === "login"
              ? "顾问登录"
              : "顾问注册"}
          </h2>
          <p className="text-slate-400 text-center mb-6 text-sm">
            {step === "verify"
              ? `验证码已发送至 ${email}`
              : step === "profile"
              ? "请填写顾问资质信息"
              : mode === "login"
              ? "使用邮箱和密码登录"
              : "填写信息完成注册"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Dev Code Display */}
          {devCode && step === "verify" && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              <span className="font-medium">开发模式：</span> 验证码是{" "}
              <span className="font-mono font-bold">{devCode}</span>
            </div>
          )}

          {step === "input" ? (
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "至少6位" : "输入密码"}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && mode === "login" && handlePasswordLogin()}
                />
              </div>

              {/* Confirm Password (Register Only) */}
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleSendRegisterCode()}
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={mode === "login" ? handlePasswordLogin : handleSendRegisterCode}
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          ) : step === "verify" ? (
            /* Verification Code Input */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  6位验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-center text-2xl font-mono tracking-widest"
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyEmail()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerifyEmail}
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "验证中..." : "下一步"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep("input");
                    setCode("");
                    setDevCode("");
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ← 返回
                </button>
                <button
                  onClick={handleSendRegisterCode}
                  disabled={countdown > 0 || loading}
                  className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-500"
                >
                  {countdown > 0 ? `${countdown}秒后重发` : "重新发送"}
                </button>
              </div>
            </div>
          ) : (
            /* Profile Form */
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Consultant Level Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  顾问等级 <span className="text-red-400">*</span>
                </label>
                <select
                  value={consultantLevel}
                  onChange={(e) => setConsultantLevel(e.target.value as ConsultantLevel)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                >
                  <option value="A">A类：持牌顾问/律师（可提供全流程移民服务）</option>
                  <option value="B">B类：留学/签证顾问（可提供留学/访签服务）</option>
                  <option value="C">C类：文案/辅助人员（不可独立接单）</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  {consultantLevel === "A" && "需提供RCIC执照编号和验证链接"}
                  {consultantLevel === "B" && "需提供从业年限和服务范围说明"}
                  {consultantLevel === "C" && "只能作为A/B类顾问的协作人员"}
                </p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    中文姓名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameCn}
                    onChange={(e) => setNameCn(e.target.value)}
                    placeholder="张三"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    英文姓名 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Zhang San"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  联系电话 <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    居住国家 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Canada"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    城市 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Toronto"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* A类顾问专属字段 */}
              {consultantLevel === "A" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      RCIC执照编号 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={rcicNumber}
                      onChange={(e) => setRcicNumber(e.target.value)}
                      placeholder="R123456"
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      执业机构（选填）
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="ABC Immigration Services"
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      执照验证链接 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={verificationLink}
                      onChange={(e) => setVerificationLink(e.target.value)}
                      placeholder="https://college-ic.ca/protecting-the-public/find-an-immigration-consultant"
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* B类顾问专属字段 */}
              {consultantLevel === "B" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      从业年限 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      placeholder="5年留学咨询经验"
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      服务范围说明 <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={serviceScope}
                      onChange={(e) => setServiceScope(e.target.value)}
                      placeholder="仅提供留学申请、访客签证咨询服务，不涉及移民法律建议"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </>
              )}

              {/* ID Document Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  身份证件（护照或身份证） <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCompleteRegistration}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "提交中..." : "提交注册申请"}
              </button>

              <p className="text-xs text-slate-400 text-center">
                提交后将进入人工审核，1-3个工作日内完成审核
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>仅限移民顾问使用</p>
          <a href="/" className="text-emerald-400 hover:text-emerald-300 mt-2 inline-block">
            返回首页
          </a>
        </div>
      </div>
    </main>
  );
}
