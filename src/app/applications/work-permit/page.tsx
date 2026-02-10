"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
          message: `我正在填写加拿大工签申请表格（IMM 1295），关于"${fieldLabel}"这个字段，${fieldHint ? `官方提示是：${fieldHint}。` : ""}我的问题是：${question}`,
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
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
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-600 transition-all"
          >
            {isLoading ? "AI 正在思考..." : "询问 AI"}
          </button>
          
          {answer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white text-xs">AI</span>
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

// 带AI帮助按钮的表单字段组件
function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  hint,
  options,
  rows,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "date" | "select" | "textarea" | "number";
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}) {
  const [showAIHelp, setShowAIHelp] = useState(false);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowAIHelp(true)}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          AI帮助
        </button>
      </div>
      
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          required={required}
        >
          <option value="">请选择</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={rows || 3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />
      )}
      
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      
      <AIHelpModal
        isOpen={showAIHelp}
        onClose={() => setShowAIHelp(false)}
        fieldLabel={label}
        fieldHint={hint}
      />
    </div>
  );
}

// 步骤指示器组件
function StepIndicator({ currentStep, totalSteps, stepTitles }: { currentStep: number; totalSteps: number; stepTitles: string[] }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          步骤 {currentStep} / {totalSteps}
        </span>
        <span className="text-sm text-gray-500">{stepTitles[currentStep - 1]}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

function WorkPermitApplicationPageContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const applicationsBackHref = from ? `/applications?from=${encodeURIComponent(from)}` : "/applications";
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 12;
  
  const stepTitles = [
    "工签类型",
    "个人信息",
    "居住信息",
    "婚姻状况",
    "语言能力",
    "护照信息",
    "身份证件",
    "联系方式",
    "工作详情",
    "教育背景",
    "工作经历",
    "背景问题与签名",
  ];

  const [formData, setFormData] = useState<Record<string, string>>({
    // Work Permit Type
    workPermitType: "",
    lmiaNumber: "",
    lmiaExemptCode: "",
    
    // UCI and Language
    uci: "",
    preferredLanguage: "",
    
    // Personal Details
    familyName: "",
    givenNames: "",
    usedOtherName: "",
    otherFamilyName: "",
    otherGivenNames: "",
    sex: "",
    dateOfBirth: "",
    cityOfBirth: "",
    countryOfBirth: "",
    citizenship: "",
    
    // Current Residence
    currentCountryOfResidence: "",
    immigrationStatus: "",
    statusOther: "",
    statusFromDate: "",
    statusToDate: "",
    
    // Past 5 years residence
    livedInOtherCountry: "",
    otherCountry1: "",
    otherCountryStatus1: "",
    otherCountryStatusOther1: "",
    otherCountryFrom1: "",
    otherCountryTo1: "",
    otherCountry2: "",
    otherCountryStatus2: "",
    otherCountryFrom2: "",
    otherCountryTo2: "",
    
    // Applying from
    applyingFromResidence: "",
    applyingFromCountry: "",
    applyingFromStatus: "",
    applyingFromStatusOther: "",
    applyingFromFrom: "",
    applyingFromTo: "",
    
    // Marital Status
    maritalStatus: "",
    marriageDate: "",
    spouseFamilyName: "",
    spouseGivenNames: "",
    previouslyMarried: "",
    prevSpouseFamilyName: "",
    prevSpouseGivenNames: "",
    prevSpouseDateOfBirth: "",
    prevRelationshipType: "",
    prevRelationshipFrom: "",
    prevRelationshipTo: "",
    
    // Languages
    nativeLanguage: "",
    languageAbility: "",
    languageTestTaken: "",
    languageTestType: "",
    languageTestDate: "",
    languageTestListening: "",
    languageTestReading: "",
    languageTestWriting: "",
    languageTestSpeaking: "",
    
    // Passport
    passportNumber: "",
    passportCountry: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    taiwanPassportWithId: "",
    israeliPassport: "",
    
    // National Identity Document
    hasNationalId: "",
    nationalIdNumber: "",
    nationalIdCountry: "",
    nationalIdIssueDate: "",
    nationalIdExpiryDate: "",
    
    // US PR Card
    hasUsPrCard: "",
    usPrCardNumber: "",
    usPrCardExpiryDate: "",
    
    // Contact Information - Mailing Address
    poBox: "",
    aptUnit: "",
    streetNumber: "",
    streetName: "",
    city: "",
    country: "",
    provinceState: "",
    postalCode: "",
    
    // Residential Address
    sameAsMailingAddress: "",
    resAptUnit: "",
    resStreetNumber: "",
    resStreetName: "",
    resCity: "",
    resCountry: "",
    resProvinceState: "",
    resPostalCode: "",
    
    // Phone
    phoneType: "",
    phoneCountryCode: "",
    phoneNumber: "",
    phoneExtension: "",
    altPhoneType: "",
    altPhoneCountryCode: "",
    altPhoneNumber: "",
    faxCountryCode: "",
    faxNumber: "",
    email: "",
    
    // Details of Intended Work in Canada
    employerName: "",
    employerStreetNumber: "",
    employerStreetName: "",
    employerCity: "",
    employerProvince: "",
    employerPostalCode: "",
    employerCountry: "",
    intendedWorkLocation: "",
    occupation: "",
    nocCode: "",
    employmentStartDate: "",
    employmentEndDate: "",
    wageAmount: "",
    wageFrequency: "",
    
    // Education
    highestEducation: "",
    
    // Employment History
    currentOccupation: "",
    intendedOccupation: "",
    employment1From: "",
    employment1To: "",
    employment1Occupation: "",
    employment1Employer: "",
    employment1CityCountry: "",
    employment1Present: "",
    employment2From: "",
    employment2To: "",
    employment2Occupation: "",
    employment2Employer: "",
    employment2CityCountry: "",
    employment2Present: "",
    employment3From: "",
    employment3To: "",
    employment3Occupation: "",
    employment3Employer: "",
    employment3CityCountry: "",
    employment3Present: "",
    
    // Background Information
    refusedVisaCanada: "",
    refusedVisaCanadaDetails: "",
    refusedVisaOther: "",
    refusedVisaOtherDetails: "",
    criminalConviction: "",
    criminalConvictionDetails: "",
    militaryService: "",
    militaryServiceDetails: "",
    politicalOrganization: "",
    politicalOrganizationDetails: "",
    tuberculosis: "",
    tuberculosisDetails: "",
    tbContact: "",
    tbContactDetails: "",
    healthCondition: "",
    healthConditionDetails: "",
    
    // Declaration
    declarationAgree: "",
    signatureDate: "",
    applicantSignature: "",
  });

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    const application: Application = {
      id: Date.now().toString(),
      type: "work-permit",
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData,
    };
    localStorage.setItem(`application_${application.id}`, JSON.stringify(application));
    try {
      const res = await fetch("/api/member/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "work-permit",
          title: "工签申请",
          applicationData: application,
        }),
      });
      const data = await res.json();
      if (data.success) {
        let url = `/applications/work-permit/review?id=${application.id}&caseId=${data.caseId}`;
        if (from) url += `&from=${encodeURIComponent(from)}`;
        window.location.href = url;
        return;
      }
      if (res.status === 400) {
        alert(data.message || "请先选择顾问后再提交");
        window.location.href = "/member/consultants";
        return;
      }
    } catch (_) {
      alert("提交失败，请稍后重试");
      return;
    }
    let url = `/applications/work-permit/review?id=${application.id}`;
    if (from) url += `&from=${encodeURIComponent(from)}`;
    window.location.href = url;
  };

  const countryOptions = [
    { value: "CN", label: "中国 China" },
    { value: "HK", label: "中国香港 Hong Kong" },
    { value: "TW", label: "中国台湾 Taiwan" },
    { value: "US", label: "美国 United States" },
    { value: "CA", label: "加拿大 Canada" },
    { value: "GB", label: "英国 United Kingdom" },
    { value: "AU", label: "澳大利亚 Australia" },
    { value: "JP", label: "日本 Japan" },
    { value: "KR", label: "韩国 South Korea" },
    { value: "SG", label: "新加坡 Singapore" },
    { value: "IN", label: "印度 India" },
    { value: "PH", label: "菲律宾 Philippines" },
    { value: "MX", label: "墨西哥 Mexico" },
    { value: "BR", label: "巴西 Brazil" },
    { value: "FR", label: "法国 France" },
    { value: "DE", label: "德国 Germany" },
    { value: "OTHER", label: "其他 Other" },
  ];

  const provinceOptions = [
    { value: "AB", label: "阿尔伯塔 Alberta" },
    { value: "BC", label: "不列颠哥伦比亚 British Columbia" },
    { value: "MB", label: "曼尼托巴 Manitoba" },
    { value: "NB", label: "新不伦瑞克 New Brunswick" },
    { value: "NL", label: "纽芬兰与拉布拉多 Newfoundland and Labrador" },
    { value: "NS", label: "新斯科舍 Nova Scotia" },
    { value: "NT", label: "西北地区 Northwest Territories" },
    { value: "NU", label: "努纳武特 Nunavut" },
    { value: "ON", label: "安大略 Ontario" },
    { value: "PE", label: "爱德华王子岛 Prince Edward Island" },
    { value: "QC", label: "魁北克 Quebec" },
    { value: "SK", label: "萨斯喀彻温 Saskatchewan" },
    { value: "YT", label: "育空 Yukon" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "单身 Single" },
    { value: "married", label: "已婚 Married" },
    { value: "commonLaw", label: "同居伴侣 Common-law" },
    { value: "divorced", label: "离婚 Divorced" },
    { value: "legallySeparated", label: "合法分居 Legally Separated" },
    { value: "widowed", label: "丧偶 Widowed" },
    { value: "annulledMarriage", label: "婚姻无效 Annulled Marriage" },
  ];

  const immigrationStatusOptions = [
    { value: "citizen", label: "公民 Citizen" },
    { value: "permanentResident", label: "永久居民 Permanent Resident" },
    { value: "visitor", label: "访客 Visitor" },
    { value: "worker", label: "工人 Worker" },
    { value: "student", label: "学生 Student" },
    { value: "protectedPerson", label: "受保护人员 Protected Person" },
    { value: "refugeeClaimant", label: "难民申请人 Refugee Claimant" },
    { value: "other", label: "其他 Other" },
  ];

  const educationOptions = [
    { value: "none", label: "无正规教育 None" },
    { value: "secondary", label: "高中或以下 Secondary (high school) or less" },
    { value: "trade", label: "技工/学徒证书 Trade/Apprenticeship certificate" },
    { value: "nonUniversity", label: "非大学证书/文凭 Non-university certificate/diploma" },
    { value: "someUniversity", label: "大学肄业 Some university (no degree)" },
    { value: "bachelors", label: "学士学位 Bachelor's degree" },
    { value: "postGradNoDegree", label: "研究生肄业 Post-graduate (no degree)" },
    { value: "masters", label: "硕士学位 Master's degree" },
    { value: "doctorate", label: "博士学位 Doctorate/PhD" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">工签类型 (Work Permit Type)</h3>
              <p className="text-sm text-blue-700">请选择您申请的工签类型并填写相关信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="UCI (唯一客户标识) / Unique Client Identifier"
                name="uci"
                type="text"
                value={formData.uci}
                onChange={handleFieldChange}
                placeholder="如已知，请填写"
                hint="如果这是您第一次与IRCC打交道，您不会有UCI"
              />
              
              <FormField
                label="首选服务语言 / Preferred Language of Service"
                name="preferredLanguage"
                type="select"
                value={formData.preferredLanguage}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "english", label: "英语 English" },
                  { value: "french", label: "法语 French" },
                ]}
              />
              
              <FormField
                label="工签类型 / Type of Work Permit"
                name="workPermitType"
                type="select"
                value={formData.workPermitType}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "open", label: "开放式工签 Open Work Permit" },
                  { value: "employerSpecific", label: "雇主指定工签 Employer-Specific Work Permit" },
                ]}
                hint="开放式工签允许为任何雇主工作，雇主指定工签只能为特定雇主工作"
              />
              
              {formData.workPermitType === "employerSpecific" && (
                <>
                  <FormField
                    label="LMIA编号 / LMIA Number"
                    name="lmiaNumber"
                    type="text"
                    value={formData.lmiaNumber}
                    onChange={handleFieldChange}
                    placeholder="如适用"
                    hint="劳动力市场影响评估编号"
                  />
                  
                  <FormField
                    label="LMIA豁免代码 / LMIA Exempt Code"
                    name="lmiaExemptCode"
                    type="text"
                    value={formData.lmiaExemptCode}
                    onChange={handleFieldChange}
                    placeholder="如适用"
                    hint="如果您的工签不需要LMIA，请填写豁免代码"
                  />
                </>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">个人信息 (Personal Details)</h3>
              <p className="text-sm text-blue-700">请填写您的个人基本信息，确保与护照信息一致。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="姓 / Family Name (Surname)"
                name="familyName"
                type="text"
                value={formData.familyName}
                onChange={handleFieldChange}
                required
                placeholder="如护照所示"
                hint="如护照上没有姓，请在此处填写所有名字"
              />
              
              <FormField
                label="名 / Given Name(s)"
                name="givenNames"
                type="text"
                value={formData.givenNames}
                onChange={handleFieldChange}
                required
                placeholder="如护照所示"
                hint="如护照上没有名字，请留空"
              />
              
              <FormField
                label="是否曾用其他名字 / Have you ever used any other name?"
                name="usedOtherName"
                type="select"
                value={formData.usedOtherName}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
                hint="包括出生名、婚前姓、婚后姓、昵称等"
              />
              
              {formData.usedOtherName === "yes" && (
                <>
                  <FormField
                    label="曾用姓 / Other Family Name"
                    name="otherFamilyName"
                    type="text"
                    value={formData.otherFamilyName}
                    onChange={handleFieldChange}
                  />
                  <FormField
                    label="曾用名 / Other Given Name(s)"
                    name="otherGivenNames"
                    type="text"
                    value={formData.otherGivenNames}
                    onChange={handleFieldChange}
                  />
                </>
              )}
              
              <FormField
                label="性别 / Gender"
                name="sex"
                type="select"
                value={formData.sex}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "F", label: "女 Female" },
                  { value: "M", label: "男 Male" },
                  { value: "U", label: "未知 Unknown" },
                  { value: "X", label: "其他 Another gender (X)" },
                ]}
              />
              
              <FormField
                label="出生日期 / Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleFieldChange}
                required
              />
              
              <FormField
                label="出生城市 / City/Town of Birth"
                name="cityOfBirth"
                type="text"
                value={formData.cityOfBirth}
                onChange={handleFieldChange}
                required
                hint="如护照上有显示，请按护照填写"
              />
              
              <FormField
                label="出生国家 / Country of Birth"
                name="countryOfBirth"
                type="select"
                value={formData.countryOfBirth}
                onChange={handleFieldChange}
                required
                options={countryOptions}
              />
              
              <FormField
                label="国籍 / Country of Citizenship"
                name="citizenship"
                type="select"
                value={formData.citizenship}
                onChange={handleFieldChange}
                required
                options={countryOptions}
                hint="选择签发您此次旅行使用的护照的国家"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">居住信息 (Residence Information)</h3>
              <p className="text-sm text-blue-700">请填写您当前的居住国家和过去5年的居住历史。</p>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">当前居住国 / Current Country of Residence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="居住国家 / Country of Residence"
                  name="currentCountryOfResidence"
                  type="select"
                  value={formData.currentCountryOfResidence}
                  onChange={handleFieldChange}
                  required
                  options={countryOptions}
                  hint="您合法居住的国家"
                />
                
                <FormField
                  label="移民身份 / Immigration Status"
                  name="immigrationStatus"
                  type="select"
                  value={formData.immigrationStatus}
                  onChange={handleFieldChange}
                  required
                  options={immigrationStatusOptions}
                />
                
                {formData.immigrationStatus === "other" && (
                  <FormField
                    label="其他身份说明 / Other Status"
                    name="statusOther"
                    type="text"
                    value={formData.statusOther}
                    onChange={handleFieldChange}
                    required
                  />
                )}
                
                <FormField
                  label="身份开始日期 / Status From Date"
                  name="statusFromDate"
                  type="date"
                  value={formData.statusFromDate}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="身份结束日期 / Status To Date"
                  name="statusToDate"
                  type="date"
                  value={formData.statusToDate}
                  onChange={handleFieldChange}
                  hint="如果是当前身份，可留空"
                />
              </div>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">过去5年居住历史 / Past 5 Years Residence</h4>
              <FormField
                label="过去5年是否在其他国家居住超过6个月？/ Have you lived in any other country for more than 6 months in the past 5 years?"
                name="livedInOtherCountry"
                type="select"
                value={formData.livedInOtherCountry}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
              
              {formData.livedInOtherCountry === "yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="国家 / Country" name="otherCountry1" type="select" value={formData.otherCountry1} onChange={handleFieldChange} required options={countryOptions} />
                  <FormField label="身份 / Status" name="otherCountryStatus1" type="select" value={formData.otherCountryStatus1} onChange={handleFieldChange} required options={immigrationStatusOptions} />
                  <FormField label="开始日期 / From" name="otherCountryFrom1" type="date" value={formData.otherCountryFrom1} onChange={handleFieldChange} required />
                  <FormField label="结束日期 / To" name="otherCountryTo1" type="date" value={formData.otherCountryTo1} onChange={handleFieldChange} required />
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">申请国家 / Applying From</h4>
              <FormField
                label="是否从居住国申请？/ Are you applying from your country of residence?"
                name="applyingFromResidence"
                type="select"
                value={formData.applyingFromResidence}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
              
              {formData.applyingFromResidence === "no" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="申请国家 / Country Applying From" name="applyingFromCountry" type="select" value={formData.applyingFromCountry} onChange={handleFieldChange} required options={countryOptions} />
                  <FormField label="身份 / Status" name="applyingFromStatus" type="select" value={formData.applyingFromStatus} onChange={handleFieldChange} required options={immigrationStatusOptions} />
                  <FormField label="开始日期 / From" name="applyingFromFrom" type="date" value={formData.applyingFromFrom} onChange={handleFieldChange} required />
                  <FormField label="结束日期 / To" name="applyingFromTo" type="date" value={formData.applyingFromTo} onChange={handleFieldChange} required />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">婚姻状况 (Marital Status)</h3>
              <p className="text-sm text-blue-700">请填写您当前的婚姻状况和配偶信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="婚姻状况 / Marital Status"
                name="maritalStatus"
                type="select"
                value={formData.maritalStatus}
                onChange={handleFieldChange}
                required
                options={maritalStatusOptions}
              />
              
              {(formData.maritalStatus === "married" || formData.maritalStatus === "commonLaw") && (
                <>
                  <FormField
                    label="结婚/同居日期 / Date of Marriage/Common-law"
                    name="marriageDate"
                    type="date"
                    value={formData.marriageDate}
                    onChange={handleFieldChange}
                    required
                  />
                  <FormField
                    label="配偶姓 / Spouse Family Name"
                    name="spouseFamilyName"
                    type="text"
                    value={formData.spouseFamilyName}
                    onChange={handleFieldChange}
                    required
                  />
                  <FormField
                    label="配偶名 / Spouse Given Name(s)"
                    name="spouseGivenNames"
                    type="text"
                    value={formData.spouseGivenNames}
                    onChange={handleFieldChange}
                    required
                  />
                </>
              )}
              
              <FormField
                label="是否曾经结婚或同居？/ Have you ever been married or in a common-law relationship?"
                name="previouslyMarried"
                type="select"
                value={formData.previouslyMarried}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
              
              {formData.previouslyMarried === "yes" && (
                <>
                  <FormField label="前配偶姓 / Previous Spouse Family Name" name="prevSpouseFamilyName" type="text" value={formData.prevSpouseFamilyName} onChange={handleFieldChange} required />
                  <FormField label="前配偶名 / Previous Spouse Given Name(s)" name="prevSpouseGivenNames" type="text" value={formData.prevSpouseGivenNames} onChange={handleFieldChange} required />
                  <FormField label="前配偶出生日期 / Previous Spouse Date of Birth" name="prevSpouseDateOfBirth" type="date" value={formData.prevSpouseDateOfBirth} onChange={handleFieldChange} required />
                  <FormField label="关系类型 / Type of Relationship" name="prevRelationshipType" type="select" value={formData.prevRelationshipType} onChange={handleFieldChange} required options={[{ value: "married", label: "已婚 Married" }, { value: "commonLaw", label: "同居 Common-law" }]} />
                  <FormField label="关系开始日期 / From" name="prevRelationshipFrom" type="date" value={formData.prevRelationshipFrom} onChange={handleFieldChange} required />
                  <FormField label="关系结束日期 / To" name="prevRelationshipTo" type="date" value={formData.prevRelationshipTo} onChange={handleFieldChange} required />
                </>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">语言能力 (Languages)</h3>
              <p className="text-sm text-blue-700">请填写您的母语和语言能力信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="母语 / Native Language (Mother Tongue)"
                name="nativeLanguage"
                type="select"
                value={formData.nativeLanguage}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "chinese", label: "中文 Chinese" },
                  { value: "english", label: "英语 English" },
                  { value: "french", label: "法语 French" },
                  { value: "spanish", label: "西班牙语 Spanish" },
                  { value: "hindi", label: "印地语 Hindi" },
                  { value: "tagalog", label: "他加禄语 Tagalog" },
                  { value: "other", label: "其他 Other" },
                ]}
              />
              
              <FormField
                label="英语/法语能力 / English/French Ability"
                name="languageAbility"
                type="select"
                value={formData.languageAbility}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "both", label: "两者都会 Both" },
                  { value: "english", label: "仅英语 English only" },
                  { value: "french", label: "仅法语 French only" },
                  { value: "neither", label: "都不会 Neither" },
                ]}
                hint="如果母语不是英语或法语，请选择您最可能使用的语言"
              />
              
              <FormField
                label="是否参加过语言测试？/ Have you taken a language test?"
                name="languageTestTaken"
                type="select"
                value={formData.languageTestTaken}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
              
              {formData.languageTestTaken === "yes" && (
                <>
                  <FormField
                    label="测试类型 / Test Type"
                    name="languageTestType"
                    type="select"
                    value={formData.languageTestType}
                    onChange={handleFieldChange}
                    required
                    options={[
                      { value: "ielts", label: "IELTS" },
                      { value: "celpip", label: "CELPIP" },
                      { value: "tef", label: "TEF Canada" },
                      { value: "tcf", label: "TCF Canada" },
                      { value: "pte", label: "PTE Core" },
                      { value: "other", label: "其他 Other" },
                    ]}
                  />
                  <FormField label="测试日期 / Test Date" name="languageTestDate" type="date" value={formData.languageTestDate} onChange={handleFieldChange} required />
                  <FormField label="听力 / Listening" name="languageTestListening" type="text" value={formData.languageTestListening} onChange={handleFieldChange} required />
                  <FormField label="阅读 / Reading" name="languageTestReading" type="text" value={formData.languageTestReading} onChange={handleFieldChange} required />
                  <FormField label="写作 / Writing" name="languageTestWriting" type="text" value={formData.languageTestWriting} onChange={handleFieldChange} required />
                  <FormField label="口语 / Speaking" name="languageTestSpeaking" type="text" value={formData.languageTestSpeaking} onChange={handleFieldChange} required />
                </>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">护照信息 (Passport)</h3>
              <p className="text-sm text-blue-700">请填写您当前有效护照的信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="护照号码 / Passport Number" name="passportNumber" type="text" value={formData.passportNumber} onChange={handleFieldChange} required />
              <FormField label="签发国家 / Country of Issue" name="passportCountry" type="select" value={formData.passportCountry} onChange={handleFieldChange} required options={countryOptions} />
              <FormField label="签发日期 / Issue Date" name="passportIssueDate" type="date" value={formData.passportIssueDate} onChange={handleFieldChange} required />
              <FormField label="到期日期 / Expiry Date" name="passportExpiryDate" type="date" value={formData.passportExpiryDate} onChange={handleFieldChange} required />
              <FormField label="台湾护照带身份证号 / Taiwan passport with personal ID number?" name="taiwanPassportWithId" type="select" value={formData.taiwanPassportWithId} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }, { value: "na", label: "不适用 N/A" }]} />
              <FormField label="以色列护照 / Israeli passport?" name="israeliPassport" type="select" value={formData.israeliPassport} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">身份证件 (Identity Documents)</h3>
              <p className="text-sm text-blue-700">请填写您的国民身份证和美国绿卡信息（如适用）。</p>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">国民身份证 / National Identity Document</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="是否有国民身份证 / Do you have a national identity document?" name="hasNationalId" type="select" value={formData.hasNationalId} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
                {formData.hasNationalId === "yes" && (
                  <>
                    <FormField label="证件号码 / Document Number" name="nationalIdNumber" type="text" value={formData.nationalIdNumber} onChange={handleFieldChange} required />
                    <FormField label="签发国家 / Country of Issue" name="nationalIdCountry" type="select" value={formData.nationalIdCountry} onChange={handleFieldChange} required options={countryOptions} />
                    <FormField label="签发日期 / Issue Date" name="nationalIdIssueDate" type="date" value={formData.nationalIdIssueDate} onChange={handleFieldChange} required />
                    <FormField label="到期日期 / Expiry Date" name="nationalIdExpiryDate" type="date" value={formData.nationalIdExpiryDate} onChange={handleFieldChange} />
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">美国永久居民卡 / US PR Card</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="是否有美国绿卡 / Do you have a US PR Card?" name="hasUsPrCard" type="select" value={formData.hasUsPrCard} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
                {formData.hasUsPrCard === "yes" && (
                  <>
                    <FormField label="卡号 / Card Number" name="usPrCardNumber" type="text" value={formData.usPrCardNumber} onChange={handleFieldChange} required />
                    <FormField label="到期日期 / Expiry Date" name="usPrCardExpiryDate" type="date" value={formData.usPrCardExpiryDate} onChange={handleFieldChange} required />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">联系方式 (Contact Information)</h3>
              <p className="text-sm text-blue-700">请填写您的邮寄地址和联系电话。</p>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">邮寄地址 / Mailing Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="邮政信箱 / P.O. Box" name="poBox" type="text" value={formData.poBox} onChange={handleFieldChange} />
                <FormField label="公寓/单元号 / Apt/Unit" name="aptUnit" type="text" value={formData.aptUnit} onChange={handleFieldChange} />
                <FormField label="街道号码 / Street Number" name="streetNumber" type="text" value={formData.streetNumber} onChange={handleFieldChange} required />
                <FormField label="街道名称 / Street Name" name="streetName" type="text" value={formData.streetName} onChange={handleFieldChange} required />
                <FormField label="城市 / City/Town" name="city" type="text" value={formData.city} onChange={handleFieldChange} required />
                <FormField label="国家 / Country" name="country" type="select" value={formData.country} onChange={handleFieldChange} required options={countryOptions} />
                <FormField label="省/州 / Province/State" name="provinceState" type="text" value={formData.provinceState} onChange={handleFieldChange} required />
                <FormField label="邮政编码 / Postal Code" name="postalCode" type="text" value={formData.postalCode} onChange={handleFieldChange} required />
              </div>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">居住地址 / Residential Address</h4>
              <FormField label="与邮寄地址相同 / Same as mailing address?" name="sameAsMailingAddress" type="select" value={formData.sameAsMailingAddress} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
              {formData.sameAsMailingAddress === "no" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField label="公寓/单元号 / Apt/Unit" name="resAptUnit" type="text" value={formData.resAptUnit} onChange={handleFieldChange} />
                  <FormField label="街道号码 / Street Number" name="resStreetNumber" type="text" value={formData.resStreetNumber} onChange={handleFieldChange} required />
                  <FormField label="街道名称 / Street Name" name="resStreetName" type="text" value={formData.resStreetName} onChange={handleFieldChange} required />
                  <FormField label="城市 / City" name="resCity" type="text" value={formData.resCity} onChange={handleFieldChange} required />
                  <FormField label="国家 / Country" name="resCountry" type="select" value={formData.resCountry} onChange={handleFieldChange} required options={countryOptions} />
                  <FormField label="省/州 / Province/State" name="resProvinceState" type="text" value={formData.resProvinceState} onChange={handleFieldChange} required />
                  <FormField label="邮政编码 / Postal Code" name="resPostalCode" type="text" value={formData.resPostalCode} onChange={handleFieldChange} required />
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">联系电话 / Phone Numbers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="电话类型 / Phone Type" name="phoneType" type="select" value={formData.phoneType} onChange={handleFieldChange} required options={[{ value: "home", label: "住宅 Home" }, { value: "cellular", label: "手机 Cellular" }, { value: "business", label: "工作 Business" }]} />
                <FormField label="国家代码 / Country Code" name="phoneCountryCode" type="text" value={formData.phoneCountryCode} onChange={handleFieldChange} required placeholder="例如：86" />
                <FormField label="电话号码 / Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleFieldChange} required />
                <FormField label="分机 / Extension" name="phoneExtension" type="text" value={formData.phoneExtension} onChange={handleFieldChange} />
                <FormField label="电子邮箱 / Email Address" name="email" type="email" value={formData.email} onChange={handleFieldChange} required />
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">工作详情 (Details of Intended Work in Canada)</h3>
              <p className="text-sm text-blue-700">请填写您在加拿大的预期工作详情。</p>
            </div>
            
            <div className="border-b pb-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">雇主信息 / Employer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="雇主名称 / Employer Name" name="employerName" type="text" value={formData.employerName} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} />
                <FormField label="街道号码 / Street Number" name="employerStreetNumber" type="text" value={formData.employerStreetNumber} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} />
                <FormField label="街道名称 / Street Name" name="employerStreetName" type="text" value={formData.employerStreetName} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} />
                <FormField label="城市 / City" name="employerCity" type="text" value={formData.employerCity} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} />
                <FormField label="省份 / Province" name="employerProvince" type="select" value={formData.employerProvince} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} options={provinceOptions} />
                <FormField label="邮政编码 / Postal Code" name="employerPostalCode" type="text" value={formData.employerPostalCode} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} />
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">工作详情 / Job Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="预期工作地点 / Intended Work Location" name="intendedWorkLocation" type="text" value={formData.intendedWorkLocation} onChange={handleFieldChange} required placeholder="城市, 省份" />
                <FormField label="职业/职位 / Occupation/Job Title" name="occupation" type="text" value={formData.occupation} onChange={handleFieldChange} required />
                <FormField label="NOC代码 / NOC Code" name="nocCode" type="text" value={formData.nocCode} onChange={handleFieldChange} placeholder="例如：21231" hint="加拿大国家职业分类代码" />
                <FormField label="工作开始日期 / Employment Start Date" name="employmentStartDate" type="date" value={formData.employmentStartDate} onChange={handleFieldChange} required />
                <FormField label="工作结束日期 / Employment End Date" name="employmentEndDate" type="date" value={formData.employmentEndDate} onChange={handleFieldChange} required />
                <FormField label="工资金额 / Wage Amount" name="wageAmount" type="text" value={formData.wageAmount} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} placeholder="例如：50000" />
                <FormField label="工资频率 / Wage Frequency" name="wageFrequency" type="select" value={formData.wageFrequency} onChange={handleFieldChange} required={formData.workPermitType === "employerSpecific"} options={[{ value: "hourly", label: "每小时 Hourly" }, { value: "weekly", label: "每周 Weekly" }, { value: "biweekly", label: "双周 Bi-weekly" }, { value: "monthly", label: "每月 Monthly" }, { value: "annually", label: "每年 Annually" }]} />
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">教育背景 (Education)</h3>
              <p className="text-sm text-blue-700">请填写您的最高学历。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="最高学历 / Highest Level of Education Completed"
                name="highestEducation"
                type="select"
                value={formData.highestEducation}
                onChange={handleFieldChange}
                required
                options={educationOptions}
              />
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">工作经历 (Employment History)</h3>
              <p className="text-sm text-blue-700">请填写您过去10年的工作经历。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormField label="当前职业 / Current Occupation" name="currentOccupation" type="text" value={formData.currentOccupation} onChange={handleFieldChange} required />
              <FormField label="计划在加拿大从事的职业 / Intended Occupation in Canada" name="intendedOccupation" type="text" value={formData.intendedOccupation} onChange={handleFieldChange} required />
            </div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">工作经历 {num} / Employment {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="开始日期 / From" name={`employment${num}From`} type="text" value={formData[`employment${num}From`]} onChange={handleFieldChange} required={num === 1} placeholder="YYYY-MM" />
                  <FormField label="结束日期 / To" name={`employment${num}To`} type="text" value={formData[`employment${num}To`]} onChange={handleFieldChange} required={num === 1} placeholder="YYYY-MM or Present" />
                  <FormField label="职业 / Occupation" name={`employment${num}Occupation`} type="text" value={formData[`employment${num}Occupation`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="雇主名称 / Employer Name" name={`employment${num}Employer`} type="text" value={formData[`employment${num}Employer`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="城市/国家 / City/Country" name={`employment${num}CityCountry`} type="text" value={formData[`employment${num}CityCountry`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="是否为当前工作 / Present Job?" name={`employment${num}Present`} type="select" value={formData[`employment${num}Present`]} onChange={handleFieldChange} options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
                </div>
              </div>
            ))}
          </div>
        );

      case 12:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">背景问题与签名 (Background Information & Signature)</h3>
              <p className="text-sm text-blue-700">请如实回答以下背景问题并签名确认。</p>
            </div>
            
            <div className="space-y-4">
              {[
                { key: "refusedVisaCanada", label: "是否曾被加拿大拒签？/ Have you ever been refused a visa or permit, or denied entry to Canada?" },
                { key: "refusedVisaOther", label: "是否曾被其他国家拒签？/ Have you ever been refused a visa or permit, or denied entry to any other country?" },
                { key: "criminalConviction", label: "是否有犯罪记录？/ Have you ever been criminally charged, convicted or arrested?" },
                { key: "militaryService", label: "是否曾服兵役？/ Have you ever served in the military, militia or civil defence?" },
                { key: "politicalOrganization", label: "是否曾参与政治/社会组织？/ Have you ever been associated with any political, social, youth or student organization?" },
                { key: "tuberculosis", label: "是否曾被诊断患有肺结核？/ Have you ever been diagnosed with tuberculosis?" },
                { key: "tbContact", label: "是否曾与肺结核患者密切接触？/ Have you had close contact with a person with tuberculosis?" },
                { key: "healthCondition", label: "是否有需要治疗的身体或精神疾病？/ Do you have a physical or mental disorder that requires treatment?" },
              ].map((item) => (
                <div key={item.key} className="border rounded-lg p-4">
                  <FormField
                    label={item.label}
                    name={item.key}
                    type="select"
                    value={formData[item.key]}
                    onChange={handleFieldChange}
                    required
                    options={[{ value: "no", label: "否 No" }, { value: "yes", label: "是 Yes" }]}
                  />
                  {formData[item.key] === "yes" && (
                    <FormField
                      label="详细说明 / Details"
                      name={`${item.key}Details`}
                      type="textarea"
                      value={formData[`${item.key}Details`]}
                      onChange={handleFieldChange}
                      required
                      rows={3}
                    />
                  )}
                </div>
              ))}
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">声明与签名 / Declaration and Signature</h4>
              <div className="bg-white border rounded-lg p-6 space-y-4 mb-6">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>I declare that the information I have given is true, complete and correct.</p>
                  <p>我声明我提供的信息真实、完整、正确。</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="我同意以上声明 / I agree to the declaration" name="declarationAgree" type="select" value={formData.declarationAgree} onChange={handleFieldChange} required options={[{ value: "yes", label: "是，我同意 Yes, I agree" }]} />
                <FormField label="签名日期 / Date of Signature" name="signatureDate" type="date" value={formData.signatureDate} onChange={handleFieldChange} required />
                <FormField label="申请人签名 / Applicant Signature (Full Name)" name="applicantSignature" type="text" value={formData.applicantSignature} onChange={handleFieldChange} required placeholder="请输入全名作为电子签名" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href={applicationsBackHref} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回申请列表
          </a>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            工签申请 Work Permit
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            工作许可证申请
          </h1>
          <p className="text-gray-600">
            IMM 1295 - Application for Work Permit Made Outside of Canada
          </p>
        </div>

        {/* Progress */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} stepTitles={stepTitles} />

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>

            <button
              onClick={() => {
                const draft = {
                  id: Date.now().toString(),
                  type: "work-permit",
                  status: "draft" as const,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  formData,
                };
                localStorage.setItem(`application_${draft.id}`, JSON.stringify(draft));
                alert("草稿已保存！");
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              💾 保存草稿
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium
                         hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium
                         hover:from-green-700 hover:to-green-600 transition-all shadow-lg shadow-green-500/30"
              >
                提交申请
              </button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">IMM 1295</p>
              <p className="text-sm text-gray-500">境外工签申请表</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkPermitApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50"><div className="text-center text-gray-600">加载中...</div></div>}>
      <WorkPermitApplicationPageContent />
    </Suspense>
  );
}
