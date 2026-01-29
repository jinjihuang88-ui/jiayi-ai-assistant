"use client";

import { useState } from "react";
import { Application } from "@/types/application";

// AI 咨询弹窗组件
function AIHelpModal({ 
  isOpen, 
  onClose, 
  fieldLabel, 
  fieldHint 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  fieldLabel: string;
  fieldHint?: string;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `我正在填写加拿大访客签证申请表格 IMM 5257，关于"${fieldLabel}"这个字段，${fieldHint ? `官方提示是：${fieldHint}。` : ""}我的问题是：${question}`,
        }),
      });
      const data = await response.json();
      setAnswer(data.reply || "抱歉，暂时无法获取回答，请稍后重试。");
    } catch {
      setAnswer("网络错误，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">AI 填表助手</h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1">关于：{fieldLabel}</p>
        </div>
        
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {fieldHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <span className="font-medium">官方提示：</span>{fieldHint}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">您的问题</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：这个字段应该怎么填？需要注意什么？"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <button
            onClick={askAI}
            disabled={isLoading || !question.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-cyan-600 transition-all"
          >
            {isLoading ? "AI 正在思考..." : "询问 AI"}
          </button>
          
          {answer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs">AI</span>
                <span className="font-medium text-gray-700">AI 回答</span>
              </div>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VisitorVisaPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiHelpField, setAiHelpField] = useState<{label: string; hint?: string} | null>(null);
  const [application, setApplication] = useState<Application>({
    id: "VV-" + Date.now(),
    type: "visitor_visa",
    status: "draft",
    fields: [
      // ===== 第1步：基本信息 =====
      { key: "uci", label: "UCI 号码 (首次申请留空)", value: "", section: 0 },
      { key: "service_language", label: "服务语言偏好", value: "English", section: 0 },
      { key: "visa_type", label: "签证类型 Type of Visa", value: "", section: 0, aiHint: "旅游/探亲/商务/超级签证" },
      
      // ===== 第2步：个人信息 =====
      { key: "family_name", label: "姓 Family Name", value: "", section: 1, aiHint: "需与护照完全一致，使用拼音大写" },
      { key: "given_name", label: "名 Given Name(s)", value: "", section: 1, aiHint: "需与护照完全一致，使用拼音大写" },
      { key: "sex", label: "性别 Sex", value: "", section: 1 },
      { key: "date_of_birth", label: "出生日期 Date of Birth", value: "", section: 1, aiHint: "格式：YYYY-MM-DD" },
      { key: "country_of_birth", label: "出生国家 Country of Birth", value: "", section: 1 },
      { key: "city_of_birth", label: "出生城市 City of Birth", value: "", section: 1 },
      { key: "citizenship", label: "国籍 Country of Citizenship", value: "", section: 1 },
      { key: "marital_status", label: "婚姻状况 Marital Status", value: "", section: 1, aiHint: "Single/Married/Common-law/Divorced/Widowed" },
      
      // ===== 第3步：护照信息 =====
      { key: "passport_number", label: "护照号码 Passport Number", value: "", section: 2, aiHint: "需与护照完全一致" },
      { key: "passport_country", label: "护照签发国 Country of Issue", value: "", section: 2 },
      { key: "passport_issue_date", label: "护照签发日期 Issue Date", value: "", section: 2, aiHint: "格式：YYYY-MM-DD" },
      { key: "passport_expiry_date", label: "护照有效期 Expiry Date", value: "", section: 2, aiHint: "格式：YYYY-MM-DD，建议有效期超过计划离开加拿大日期至少6个月" },
      
      // ===== 第4步：联系方式 =====
      { key: "current_address", label: "现居住地址 Current Address", value: "", section: 3, aiHint: "包括街道、城市、省份、邮编、国家" },
      { key: "mailing_address", label: "邮寄地址 Mailing Address", value: "", section: 3, aiHint: "如与现居住地址相同，填写 Same as above" },
      { key: "phone_number", label: "电话号码 Phone Number", value: "", section: 3, aiHint: "包含国家代码，如 +86" },
      { key: "email", label: "电子邮箱 Email", value: "", section: 3, aiHint: "用于接收 IRCC 通知，请确保可正常接收" },
      
      // ===== 第5步：访问计划 =====
      { key: "purpose_of_visit", label: "访问目的 Purpose of Visit", value: "", section: 4, aiHint: "如：旅游观光/探亲访友/商务会议" },
      { key: "visit_start_date", label: "计划入境日期 Planned Entry Date", value: "", section: 4, aiHint: "格式：YYYY-MM-DD" },
      { key: "visit_end_date", label: "计划离境日期 Planned Departure Date", value: "", section: 4, aiHint: "格式：YYYY-MM-DD" },
      { key: "visit_duration", label: "预计停留时间 Length of Stay", value: "", section: 4, aiHint: "如：14 days / 1 month" },
      { key: "funds_for_trip", label: "旅行资金 Funds for Trip (CAD)", value: "", section: 4, aiHint: "用于支付在加拿大期间的费用" },
      { key: "canada_address", label: "加拿大住址 Address in Canada", value: "", section: 4, aiHint: "酒店地址或亲友住址" },
      
      // ===== 第6步：邀请人/联系人信息 =====
      { key: "contact_name", label: "加拿大联系人姓名 Contact Name", value: "", section: 5, aiHint: "如无联系人填 N/A" },
      { key: "contact_relationship", label: "与联系人关系 Relationship", value: "", section: 5, aiHint: "如：朋友/亲属/商业伙伴" },
      { key: "contact_address", label: "联系人地址 Contact Address", value: "", section: 5 },
      { key: "contact_phone", label: "联系人电话 Contact Phone", value: "", section: 5 },
      
      // ===== 第7步：资金证明 =====
      { key: "funds_available", label: "可用资金总额 Total Funds Available", value: "", section: 6, aiHint: "银行存款、投资等" },
      { key: "funds_source", label: "资金来源 Source of Funds", value: "", section: 6, aiHint: "如：工资收入/退休金/存款/子女资助" },
      { key: "monthly_income", label: "月收入 Monthly Income", value: "", section: 6 },
      
      // ===== 第8步：工作/职业信息 =====
      { key: "current_occupation", label: "当前职业 Current Occupation", value: "", section: 7, aiHint: "如：Employed/Self-employed/Retired/Student" },
      { key: "employer_name", label: "雇主名称 Employer Name", value: "", section: 7, aiHint: "如退休或无业填 N/A" },
      { key: "employer_address", label: "雇主地址 Employer Address", value: "", section: 7 },
      { key: "job_title", label: "职位 Job Title", value: "", section: 7 },
      { key: "employment_start_date", label: "入职日期 Employment Start Date", value: "", section: 7 },
      
      // ===== 第9步：背景信息 =====
      { key: "travel_history", label: "旅行史 Travel History", value: "", section: 8, aiHint: "列出过去10年出境记录，特别是发达国家旅行记录" },
      { key: "previous_canada_visit", label: "以往加拿大访问记录", value: "", section: 8, aiHint: "如有请详细说明日期和目的，无则填 No" },
      { key: "refusal_history", label: "拒签史 Refusal History", value: "", section: 8, aiHint: "如有拒签经历请详细说明，无则填 No" },
      { key: "criminal_record", label: "犯罪记录 Criminal Record", value: "", section: 8, aiHint: "如无犯罪记录填 No" },
      { key: "medical_condition", label: "健康状况 Medical Condition", value: "", section: 8, aiHint: "如有重大疾病请说明，无则填 Good health" },
      { key: "family_in_canada", label: "加拿大亲属 Family in Canada", value: "", section: 8, aiHint: "如有在加拿大的亲属请说明关系和身份" },
    ],
  });

  const steps = [
    { title: "基本信息", icon: "📋" },
    { title: "个人信息", icon: "👤" },
    { title: "护照信息", icon: "🛂" },
    { title: "联系方式", icon: "📞" },
    { title: "访问计划", icon: "✈️" },
    { title: "邀请人信息", icon: "🤝" },
    { title: "资金证明", icon: "💰" },
    { title: "职业信息", icon: "💼" },
    { title: "背景信息", icon: "📝" },
  ];

  const currentFields = application.fields.filter(f => f.section === currentStep);

  function updateField(key: string, value: string) {
    setApplication((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f.key === key ? { ...f, value } : f
      ),
    }));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
            <span className="font-semibold text-red-600">加移AI助理</span>
          </a>
          <a href="/applications" className="text-slate-600 hover:text-slate-900">
            ← 返回申请列表
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">访客签证申请 Visitor Visa (IMM 5257)</h1>
          <p className="text-slate-600 mt-2">适用于旅游、探亲、商务访问 · 基于 IRCC 官方表格</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentStep === index 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : index < currentStep
                      ? "bg-green-100 text-green-700"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span>{step.icon}</span>
                <span>{step.title}</span>
                {index < currentStep && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <span className="text-3xl">{steps[currentStep].icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                第 {currentStep + 1} 步：{steps[currentStep].title}
              </h2>
              <p className="text-sm text-slate-500">请填写以下信息，点击 ? 按钮可获取 AI 帮助</p>
            </div>
          </div>

          <div className="space-y-6">
            {currentFields.map((field) => (
              <div key={field.key} className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-medium text-slate-700">
                    {field.label}
                    {field.key !== "uci" && !field.key.includes("contact") && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <button
                    onClick={() => setAiHelpField({ label: field.label, hint: field.aiHint })}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI 帮助
                  </button>
                </div>
                
                {field.key.includes("history") || field.key.includes("address") || field.key === "purpose_of_visit" ? (
                  <textarea
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={4}
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.aiHint || `请输入${field.label}`}
                  />
                ) : field.key === "sex" ? (
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="Male">Male 男</option>
                    <option value="Female">Female 女</option>
                    <option value="Another gender">Another gender 其他</option>
                  </select>
                ) : field.key === "marital_status" ? (
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="Single">Single 单身</option>
                    <option value="Married">Married 已婚</option>
                    <option value="Common-law">Common-law 同居</option>
                    <option value="Divorced">Divorced 离异</option>
                    <option value="Widowed">Widowed 丧偶</option>
                  </select>
                ) : field.key === "service_language" ? (
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    <option value="English">English 英语</option>
                    <option value="French">French 法语</option>
                  </select>
                ) : field.key === "visa_type" ? (
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="Tourism">Tourism 旅游观光</option>
                    <option value="Family Visit">Family Visit 探亲访友</option>
                    <option value="Business">Business 商务访问</option>
                    <option value="Super Visa">Super Visa 超级签证</option>
                  </select>
                ) : field.key === "current_occupation" ? (
                  <select
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="Employed">Employed 在职</option>
                    <option value="Self-employed">Self-employed 自雇</option>
                    <option value="Retired">Retired 退休</option>
                    <option value="Student">Student 学生</option>
                    <option value="Homemaker">Homemaker 家庭主妇/夫</option>
                    <option value="Unemployed">Unemployed 待业</option>
                  </select>
                ) : (
                  <input
                    type={field.key.includes("date") ? "date" : field.key === "email" ? "email" : "text"}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={field.value}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.aiHint || `请输入${field.label}`}
                  />
                )}
                
                {field.aiHint && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {field.aiHint}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium
                         disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              ← 上一步
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium
                           hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg"
              >
                下一步 →
              </button>
            ) : (
              <button
                onClick={() => {
                  localStorage.setItem(
                    "current_application",
                    JSON.stringify({ ...application, status: "submitted" })
                  );
                  window.location.href = "/applications/visitor-visa/review";
                }}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-medium
                           hover:from-green-700 hover:to-green-600 transition-all shadow-lg"
              >
                提交给 RCIC 审核 ✓
              </button>
            )}
          </div>
        </div>

        {/* AI Help Floating Button */}
        <button
          onClick={() => setAiHelpField({ label: "访客签证申请", hint: "关于 IMM 5257 表格的任何问题" })}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 
                     text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* AI Help Modal */}
      <AIHelpModal
        isOpen={aiHelpField !== null}
        onClose={() => setAiHelpField(null)}
        fieldLabel={aiHelpField?.label || ""}
        fieldHint={aiHelpField?.hint}
      />
    </main>
  );
}
