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
          message: `我正在填写加拿大Express Entry技术移民申请表格（IMM 0008/IMM 5669/IMM 5406），关于"${fieldLabel}"这个字段，${fieldHint ? `官方提示是：${fieldHint}。` : ""}我的问题是：${question}`,
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
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <button
            onClick={askAI}
            disabled={isLoading || !question.trim()}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-red-600 transition-all"
          >
            {isLoading ? "AI 正在思考..." : "询问 AI"}
          </button>
          
          {answer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center text-white text-xs">AI</span>
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
          className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
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
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
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
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
          className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

function ExpressEntryApplicationPageContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const applicationsBackHref = from ? `/applications?from=${encodeURIComponent(from)}` : "/applications";
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 18;
  
  const stepTitles = [
    "申请详情 (IMM 0008)",
    "个人信息 (IMM 0008)",
    "联系方式 (IMM 0008)",
    "护照信息 (IMM 0008)",
    "身份证件 (IMM 0008)",
    "教育与职业 (IMM 0008)",
    "语言能力 (IMM 0008)",
    "随行家属 (IMM 0008)",
    "背景问题 (IMM 5669)",
    "教育历史 (IMM 5669)",
    "个人历史 (IMM 5669)",
    "组织会员 (IMM 5669)",
    "政府职位 (IMM 5669)",
    "军事服务 (IMM 5669)",
    "地址历史 (IMM 5669)",
    "家庭信息 (IMM 5406)",
    "EE特有信息",
    "声明与签名",
  ];

  const [formData, setFormData] = useState<Record<string, string>>({
    // IMM 0008 - Application Details
    languageCorrespondence: "",
    languageInterview: "",
    interpreterRequired: "",
    intendedProvince: "",
    intendedCity: "",
    csqReceived: "",
    csqNumber: "",
    csqApplicationDate: "",
    
    // IMM 0008 - Personal Details
    familyName: "",
    givenNames: "",
    usedOtherName: "",
    otherFamilyName: "",
    otherGivenNames: "",
    sex: "",
    eyeColour: "",
    height: "",
    dateOfBirth: "",
    cityOfBirth: "",
    countryOfBirth: "",
    citizenship: "",
    secondCitizenship: "",
    currentCountryOfResidence: "",
    immigrationStatus: "",
    statusFromDate: "",
    statusToDate: "",
    previousCountry1: "",
    previousCountryStatus1: "",
    previousCountryFrom1: "",
    previousCountryTo1: "",
    previousCountry2: "",
    previousCountryStatus2: "",
    previousCountryFrom2: "",
    previousCountryTo2: "",
    maritalStatus: "",
    marriageDate: "",
    spouseFamilyName: "",
    spouseGivenNames: "",
    
    // IMM 0008 - Contact Information
    poBox: "",
    aptUnit: "",
    streetNumber: "",
    streetName: "",
    city: "",
    country: "",
    provinceState: "",
    postalCode: "",
    sameAsMailingAddress: "",
    resPoBox: "",
    resAptUnit: "",
    resStreetNumber: "",
    resStreetName: "",
    resCity: "",
    resCountry: "",
    resProvinceState: "",
    resPostalCode: "",
    email: "",
    phoneType: "",
    phoneCountryCode: "",
    phoneNumber: "",
    phoneExtension: "",
    altPhoneType: "",
    altPhoneCountryCode: "",
    altPhoneNumber: "",
    altPhoneExtension: "",
    
    // IMM 0008 - Passport
    passportNumber: "",
    passportCountry: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    taiwanPassportWithId: "",
    israeliPassport: "",
    
    // IMM 0008 - National Identity Document
    hasNationalId: "",
    nationalIdNumber: "",
    nationalIdCountry: "",
    nationalIdIssueDate: "",
    nationalIdExpiryDate: "",
    
    // IMM 0008 - Education/Occupation Details
    highestEducation: "",
    yearsOfStudy: "",
    currentOccupation: "",
    intendedOccupation: "",
    
    // IMM 0008 - Language Details
    nativeLanguage: "",
    englishFluency: "",
    frenchFluency: "",
    englishTestType: "",
    englishTestDate: "",
    englishListening: "",
    englishReading: "",
    englishWriting: "",
    englishSpeaking: "",
    frenchTestType: "",
    frenchTestDate: "",
    frenchListening: "",
    frenchReading: "",
    frenchWriting: "",
    frenchSpeaking: "",
    
    // IMM 0008 - Dependants
    hasDependants: "",
    dependant1Relationship: "",
    dependant1FamilyName: "",
    dependant1GivenNames: "",
    dependant1Sex: "",
    dependant1DateOfBirth: "",
    dependant1CountryOfBirth: "",
    dependant1Citizenship: "",
    dependant1MaritalStatus: "",
    dependant1Accompanying: "",
    dependant2Relationship: "",
    dependant2FamilyName: "",
    dependant2GivenNames: "",
    dependant2Sex: "",
    dependant2DateOfBirth: "",
    dependant2CountryOfBirth: "",
    dependant2Citizenship: "",
    dependant2MaritalStatus: "",
    dependant2Accompanying: "",
    
    // IMM 5669 - Background Questions
    criminalConviction: "",
    criminalConvictionDetails: "",
    currentlyCharged: "",
    currentlyChargedDetails: "",
    previousRefugee: "",
    previousRefugeeDetails: "",
    previousRefusal: "",
    previousRefusalDetails: "",
    previousDeportation: "",
    previousDeportationDetails: "",
    warCrimes: "",
    warCrimesDetails: "",
    armedStruggle: "",
    armedStruggleDetails: "",
    associatedWithViolence: "",
    associatedWithViolenceDetails: "",
    criminalOrganization: "",
    criminalOrganizationDetails: "",
    detained: "",
    detainedDetails: "",
    healthCondition: "",
    healthConditionDetails: "",
    
    // IMM 5669 - Education History
    elementaryYears: "",
    secondaryYears: "",
    universityYears: "",
    tradeSchoolYears: "",
    edu1From: "",
    edu1To: "",
    edu1Institution: "",
    edu1CityCountry: "",
    edu1Certificate: "",
    edu1FieldOfStudy: "",
    edu2From: "",
    edu2To: "",
    edu2Institution: "",
    edu2CityCountry: "",
    edu2Certificate: "",
    edu2FieldOfStudy: "",
    edu3From: "",
    edu3To: "",
    edu3Institution: "",
    edu3CityCountry: "",
    edu3Certificate: "",
    edu3FieldOfStudy: "",
    
    // IMM 5669 - Personal History (Past 10 years)
    history1From: "",
    history1To: "",
    history1Activity: "",
    history1CityCountry: "",
    history1Status: "",
    history1Employer: "",
    history2From: "",
    history2To: "",
    history2Activity: "",
    history2CityCountry: "",
    history2Status: "",
    history2Employer: "",
    history3From: "",
    history3To: "",
    history3Activity: "",
    history3CityCountry: "",
    history3Status: "",
    history3Employer: "",
    history4From: "",
    history4To: "",
    history4Activity: "",
    history4CityCountry: "",
    history4Status: "",
    history4Employer: "",
    history5From: "",
    history5To: "",
    history5Activity: "",
    history5CityCountry: "",
    history5Status: "",
    history5Employer: "",
    
    // IMM 5669 - Membership and Association
    hasMemberships: "",
    org1From: "",
    org1To: "",
    org1Name: "",
    org1Type: "",
    org1Position: "",
    org1CityCountry: "",
    org2From: "",
    org2To: "",
    org2Name: "",
    org2Type: "",
    org2Position: "",
    org2CityCountry: "",
    
    // IMM 5669 - Government Positions
    hasGovtPositions: "",
    govt1From: "",
    govt1To: "",
    govt1Jurisdiction: "",
    govt1Department: "",
    govt1Position: "",
    govt2From: "",
    govt2To: "",
    govt2Jurisdiction: "",
    govt2Department: "",
    govt2Position: "",
    
    // IMM 5669 - Military Service
    hasMilitaryService: "",
    military1Country: "",
    military1From: "",
    military1To: "",
    military1Branch: "",
    military1Rank: "",
    military1Combat: "",
    military1EndReason: "",
    military2Country: "",
    military2From: "",
    military2To: "",
    military2Branch: "",
    military2Rank: "",
    military2Combat: "",
    military2EndReason: "",
    
    // IMM 5669 - Address History (Past 10 years)
    addr1From: "",
    addr1To: "",
    addr1Street: "",
    addr1City: "",
    addr1Province: "",
    addr1PostalCode: "",
    addr1Country: "",
    addr2From: "",
    addr2To: "",
    addr2Street: "",
    addr2City: "",
    addr2Province: "",
    addr2PostalCode: "",
    addr2Country: "",
    addr3From: "",
    addr3To: "",
    addr3Street: "",
    addr3City: "",
    addr3Province: "",
    addr3PostalCode: "",
    addr3Country: "",
    
    // IMM 5406 - Family Information
    // Father
    fatherFamilyName: "",
    fatherGivenNames: "",
    fatherDateOfBirth: "",
    fatherCityOfBirth: "",
    fatherCountryOfBirth: "",
    fatherDateOfDeath: "",
    fatherCurrentAddress: "",
    fatherMaritalStatus: "",
    fatherInCanada: "",
    // Mother
    motherFamilyNameAtBirth: "",
    motherGivenNames: "",
    motherDateOfBirth: "",
    motherCityOfBirth: "",
    motherCountryOfBirth: "",
    motherDateOfDeath: "",
    motherCurrentAddress: "",
    motherMaritalStatus: "",
    motherInCanada: "",
    // Spouse (if different from IMM 0008)
    spouseDateOfBirth: "",
    spouseCountryOfBirth: "",
    spouseCurrentAddress: "",
    spouseMaritalStatus: "",
    spouseInCanada: "",
    spouseAccompanying: "",
    presentAtMarriage: "",
    spousePresentAtMarriage: "",
    // Children
    hasChildren: "",
    child1FamilyName: "",
    child1GivenNames: "",
    child1Relationship: "",
    child1DateOfBirth: "",
    child1CountryOfBirth: "",
    child1MaritalStatus: "",
    child1CurrentAddress: "",
    child1InCanada: "",
    child1Accompanying: "",
    child2FamilyName: "",
    child2GivenNames: "",
    child2Relationship: "",
    child2DateOfBirth: "",
    child2CountryOfBirth: "",
    child2MaritalStatus: "",
    child2CurrentAddress: "",
    child2InCanada: "",
    child2Accompanying: "",
    // Siblings
    hasSiblings: "",
    sibling1FamilyName: "",
    sibling1GivenNames: "",
    sibling1Relationship: "",
    sibling1DateOfBirth: "",
    sibling1CountryOfBirth: "",
    sibling1MaritalStatus: "",
    sibling1CurrentAddress: "",
    sibling1InCanada: "",
    sibling2FamilyName: "",
    sibling2GivenNames: "",
    sibling2Relationship: "",
    sibling2DateOfBirth: "",
    sibling2CountryOfBirth: "",
    sibling2MaritalStatus: "",
    sibling2CurrentAddress: "",
    sibling2InCanada: "",
    
    // Express Entry Specific
    eeProgram: "",
    eeProfileNumber: "",
    eeValidationCode: "",
    itaDate: "",
    nocCode: "",
    nocTitle: "",
    yearsOfExperience: "",
    ecaOrganization: "",
    ecaNumber: "",
    ecaDate: "",
    ecaEquivalent: "",
    hasProvincialNomination: "",
    pnpProvince: "",
    pnpCertificateNumber: "",
    pnpDate: "",
    hasJobOffer: "",
    jobOfferEmployer: "",
    jobOfferPosition: "",
    jobOfferNoc: "",
    jobOfferLmiaNumber: "",
    settlementFunds: "",
    settlementFundsCurrency: "",
    
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
      type: "express-entry",
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
          type: "express-entry",
          title: "快速通道申请",
          applicationData: application,
        }),
      });
      const data = await res.json();
      if (data.success) {
        let url = `/applications/express-entry/review?id=${application.id}&caseId=${data.caseId}`;
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
    let url = `/applications/express-entry/review?id=${application.id}`;
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

  const educationOptions = [
    { value: "none", label: "无正规教育 No formal education" },
    { value: "secondary", label: "高中 Secondary/High school" },
    { value: "oneYearPost", label: "一年制大专 One-year post-secondary" },
    { value: "twoYearPost", label: "两年制大专 Two-year post-secondary" },
    { value: "bachelors", label: "学士学位 Bachelor's degree" },
    { value: "twoOrMoreDegrees", label: "两个或以上学位 Two or more degrees" },
    { value: "masters", label: "硕士学位 Master's degree" },
    { value: "doctoral", label: "博士学位 Doctoral degree" },
  ];

  const languageTestOptions = [
    { value: "ielts", label: "IELTS (雅思)" },
    { value: "celpip", label: "CELPIP (思培)" },
    { value: "tef", label: "TEF Canada" },
    { value: "tcf", label: "TCF Canada" },
    { value: "pte", label: "PTE Core" },
  ];

  const eeProgramOptions = [
    { value: "fswp", label: "联邦技术移民 Federal Skilled Worker Program (FSWP)" },
    { value: "fstp", label: "联邦技工移民 Federal Skilled Trades Program (FSTP)" },
    { value: "cec", label: "加拿大经验类移民 Canadian Experience Class (CEC)" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 申请详情 (Application Details)</h3>
              <p className="text-sm text-red-700">请填写您的语言偏好和计划居住地信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="通信语言偏好 / Language preference for correspondence"
                name="languageCorrespondence"
                type="select"
                value={formData.languageCorrespondence}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "english", label: "英语 English" },
                  { value: "french", label: "法语 French" },
                ]}
                hint="选择您希望IRCC与您通信时使用的语言"
              />
              
              <FormField
                label="面试语言偏好 / Language preference for interview"
                name="languageInterview"
                type="select"
                value={formData.languageInterview}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "english", label: "英语 English" },
                  { value: "french", label: "法语 French" },
                  { value: "other", label: "其他 Other" },
                ]}
                hint="选择您希望面试时使用的语言"
              />
              
              <FormField
                label="是否需要翻译 / Interpreter required"
                name="interpreterRequired"
                type="select"
                value={formData.interpreterRequired}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
                hint="如果您的面试语言不是英语或法语，请选择'是'"
              />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">计划居住地 / Where do you plan to live in Canada?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="计划居住省份 / Province/Territory"
                  name="intendedProvince"
                  type="select"
                  value={formData.intendedProvince}
                  onChange={handleFieldChange}
                  required
                  options={provinceOptions}
                  hint="选择您计划在加拿大居住的省份或地区"
                />
                
                <FormField
                  label="计划居住城市 / City/Town"
                  name="intendedCity"
                  type="text"
                  value={formData.intendedCity}
                  onChange={handleFieldChange}
                  placeholder="例如：Toronto"
                  hint="输入您计划居住的城市"
                />
              </div>
            </div>
            
            {formData.intendedProvince === "QC" && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">魁北克选择证书 (CSQ) 信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    label="是否已获得CSQ / Have you received your CSQ?"
                    name="csqReceived"
                    type="select"
                    value={formData.csqReceived}
                    onChange={handleFieldChange}
                    required
                    options={[
                      { value: "yes", label: "是 Yes" },
                      { value: "no", label: "否 No" },
                    ]}
                    hint="如果您计划居住在魁北克，需要获得魁北克选择证书"
                  />
                  
                  {formData.csqReceived === "yes" && (
                    <FormField
                      label="CSQ编号 / CSQ Number"
                      name="csqNumber"
                      type="text"
                      value={formData.csqNumber}
                      onChange={handleFieldChange}
                      required
                      placeholder="输入您的CSQ编号"
                    />
                  )}
                  
                  {formData.csqReceived === "no" && (
                    <FormField
                      label="CSQ申请日期 / CSQ Application Date"
                      name="csqApplicationDate"
                      type="date"
                      value={formData.csqApplicationDate}
                      onChange={handleFieldChange}
                      hint="如果尚未申请，请先申请CSQ"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 个人信息 (Personal Details)</h3>
              <p className="text-sm text-red-700">请填写您的个人基本信息，确保与护照信息一致。</p>
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
                hint="请填写与护照完全一致的姓氏"
              />
              
              <FormField
                label="名 / Given Name(s)"
                name="givenNames"
                type="text"
                value={formData.givenNames}
                onChange={handleFieldChange}
                required
                placeholder="如护照所示"
                hint="请填写与护照完全一致的名字，不要使用缩写"
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
                hint="包括婚前姓名、别名等"
              />
              
              {formData.usedOtherName === "yes" && (
                <>
                  <FormField
                    label="曾用姓 / Other Family Name"
                    name="otherFamilyName"
                    type="text"
                    value={formData.otherFamilyName}
                    onChange={handleFieldChange}
                    placeholder="曾用姓氏"
                  />
                  <FormField
                    label="曾用名 / Other Given Name(s)"
                    name="otherGivenNames"
                    type="text"
                    value={formData.otherGivenNames}
                    onChange={handleFieldChange}
                    placeholder="曾用名字"
                  />
                </>
              )}
              
              <FormField
                label="性别 / Sex"
                name="sex"
                type="select"
                value={formData.sex}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "F", label: "女 Female" },
                  { value: "M", label: "男 Male" },
                  { value: "X", label: "其他 Another gender (X)" },
                ]}
                hint="如选择X，可能需要填写额外表格"
              />
              
              <FormField
                label="眼睛颜色 / Eye Colour"
                name="eyeColour"
                type="select"
                value={formData.eyeColour}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "black", label: "黑色 Black" },
                  { value: "brown", label: "棕色 Brown" },
                  { value: "blue", label: "蓝色 Blue" },
                  { value: "green", label: "绿色 Green" },
                  { value: "hazel", label: "淡褐色 Hazel" },
                  { value: "grey", label: "灰色 Grey" },
                  { value: "other", label: "其他 Other" },
                ]}
              />
              
              <FormField
                label="身高 (厘米) / Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleFieldChange}
                required
                placeholder="例如：175"
              />
              
              <FormField
                label="出生日期 / Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleFieldChange}
                required
                hint="格式：年-月-日"
              />
              
              <FormField
                label="出生城市 / City/Town of Birth"
                name="cityOfBirth"
                type="text"
                value={formData.cityOfBirth}
                onChange={handleFieldChange}
                required
                placeholder="如护照所示"
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
                label="国籍 / Citizenship"
                name="citizenship"
                type="select"
                value={formData.citizenship}
                onChange={handleFieldChange}
                required
                options={countryOptions}
              />
              
              <FormField
                label="第二国籍 (如有) / Second Citizenship"
                name="secondCitizenship"
                type="select"
                value={formData.secondCitizenship}
                onChange={handleFieldChange}
                options={[{ value: "", label: "无 None" }, ...countryOptions]}
              />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">当前居住国信息 / Current Country of Residence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="当前居住国 / Current Country of Residence"
                  name="currentCountryOfResidence"
                  type="select"
                  value={formData.currentCountryOfResidence}
                  onChange={handleFieldChange}
                  required
                  options={countryOptions}
                  hint="您目前合法居住的国家"
                />
                
                <FormField
                  label="移民身份 / Immigration Status"
                  name="immigrationStatus"
                  type="select"
                  value={formData.immigrationStatus}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "citizen", label: "公民 Citizen" },
                    { value: "permanentResident", label: "永久居民 Permanent Resident" },
                    { value: "student", label: "学生 Student" },
                    { value: "worker", label: "工人 Worker" },
                    { value: "visitor", label: "访客 Visitor" },
                    { value: "refugee", label: "难民 Refugee" },
                    { value: "other", label: "其他 Other" },
                  ]}
                />
                
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
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">过去居住国 (居住超过6个月) / Previous Countries of Residence</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="国家1 / Country 1"
                  name="previousCountry1"
                  type="select"
                  value={formData.previousCountry1}
                  onChange={handleFieldChange}
                  options={[{ value: "", label: "无 None" }, ...countryOptions]}
                />
                
                {formData.previousCountry1 && (
                  <>
                    <FormField
                      label="身份 / Status"
                      name="previousCountryStatus1"
                      type="select"
                      value={formData.previousCountryStatus1}
                      onChange={handleFieldChange}
                      options={[
                        { value: "citizen", label: "公民 Citizen" },
                        { value: "permanentResident", label: "永久居民 Permanent Resident" },
                        { value: "student", label: "学生 Student" },
                        { value: "worker", label: "工人 Worker" },
                        { value: "visitor", label: "访客 Visitor" },
                        { value: "other", label: "其他 Other" },
                      ]}
                    />
                    <FormField
                      label="开始日期 / From"
                      name="previousCountryFrom1"
                      type="date"
                      value={formData.previousCountryFrom1}
                      onChange={handleFieldChange}
                    />
                    <FormField
                      label="结束日期 / To"
                      name="previousCountryTo1"
                      type="date"
                      value={formData.previousCountryTo1}
                      onChange={handleFieldChange}
                    />
                  </>
                )}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">婚姻状况 / Marital Status</h4>
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
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 联系方式 (Contact Information)</h3>
              <p className="text-sm text-red-700">请填写您的邮寄地址、居住地址和联系电话。</p>
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">邮寄地址 / Current Mailing Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="邮政信箱 / P.O. Box"
                  name="poBox"
                  type="text"
                  value={formData.poBox}
                  onChange={handleFieldChange}
                  placeholder="如有"
                  hint="如果没有邮政信箱，必须填写街道地址"
                />
                
                <FormField
                  label="公寓/单元号 / Apt/Unit"
                  name="aptUnit"
                  type="text"
                  value={formData.aptUnit}
                  onChange={handleFieldChange}
                  placeholder="如有"
                />
                
                <FormField
                  label="街道号码 / Street Number"
                  name="streetNumber"
                  type="text"
                  value={formData.streetNumber}
                  onChange={handleFieldChange}
                  required={!formData.poBox}
                  placeholder="例如：123"
                />
                
                <FormField
                  label="街道名称 / Street Name"
                  name="streetName"
                  type="text"
                  value={formData.streetName}
                  onChange={handleFieldChange}
                  required={!formData.poBox}
                  placeholder="例如：Main Street"
                />
                
                <FormField
                  label="城市 / City/Town"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="国家 / Country"
                  name="country"
                  type="select"
                  value={formData.country}
                  onChange={handleFieldChange}
                  required
                  options={countryOptions}
                />
                
                <FormField
                  label="省/州 / Province/State"
                  name="provinceState"
                  type="text"
                  value={formData.provinceState}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="邮政编码 / Postal Code"
                  name="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={handleFieldChange}
                  required
                />
              </div>
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">居住地址 / Residential Address</h4>
              <FormField
                label="居住地址与邮寄地址相同 / Same as mailing address"
                name="sameAsMailingAddress"
                type="select"
                value={formData.sameAsMailingAddress}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
              
              {formData.sameAsMailingAddress === "no" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    label="公寓/单元号 / Apt/Unit"
                    name="resAptUnit"
                    type="text"
                    value={formData.resAptUnit}
                    onChange={handleFieldChange}
                  />
                  
                  <FormField
                    label="街道号码 / Street Number"
                    name="resStreetNumber"
                    type="text"
                    value={formData.resStreetNumber}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="街道名称 / Street Name"
                    name="resStreetName"
                    type="text"
                    value={formData.resStreetName}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="城市 / City/Town"
                    name="resCity"
                    type="text"
                    value={formData.resCity}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="国家 / Country"
                    name="resCountry"
                    type="select"
                    value={formData.resCountry}
                    onChange={handleFieldChange}
                    required
                    options={countryOptions}
                  />
                  
                  <FormField
                    label="省/州 / Province/State"
                    name="resProvinceState"
                    type="text"
                    value={formData.resProvinceState}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="邮政编码 / Postal Code"
                    name="resPostalCode"
                    type="text"
                    value={formData.resPostalCode}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">联系方式 / Contact Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="电子邮箱 / Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  required
                  placeholder="example@email.com"
                  hint="IRCC将通过此邮箱与您联系"
                />
                
                <FormField
                  label="电话类型 / Phone Type"
                  name="phoneType"
                  type="select"
                  value={formData.phoneType}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "home", label: "住宅 Home" },
                    { value: "cellular", label: "手机 Cellular" },
                    { value: "business", label: "工作 Business" },
                  ]}
                />
                
                <FormField
                  label="国家代码 / Country Code"
                  name="phoneCountryCode"
                  type="text"
                  value={formData.phoneCountryCode}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：86"
                />
                
                <FormField
                  label="电话号码 / Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：13812345678"
                />
                
                <FormField
                  label="分机号 / Extension"
                  name="phoneExtension"
                  type="text"
                  value={formData.phoneExtension}
                  onChange={handleFieldChange}
                  placeholder="如有"
                />
                
                <FormField
                  label="备用电话类型 / Alternate Phone Type"
                  name="altPhoneType"
                  type="select"
                  value={formData.altPhoneType}
                  onChange={handleFieldChange}
                  options={[
                    { value: "", label: "无 None" },
                    { value: "home", label: "住宅 Home" },
                    { value: "cellular", label: "手机 Cellular" },
                    { value: "business", label: "工作 Business" },
                  ]}
                />
                
                {formData.altPhoneType && (
                  <>
                    <FormField
                      label="备用电话国家代码 / Alt Country Code"
                      name="altPhoneCountryCode"
                      type="text"
                      value={formData.altPhoneCountryCode}
                      onChange={handleFieldChange}
                    />
                    <FormField
                      label="备用电话号码 / Alt Phone Number"
                      name="altPhoneNumber"
                      type="tel"
                      value={formData.altPhoneNumber}
                      onChange={handleFieldChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 护照信息 (Passport)</h3>
              <p className="text-sm text-red-700">请填写您当前有效护照的信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="护照号码 / Passport Number"
                name="passportNumber"
                type="text"
                value={formData.passportNumber}
                onChange={handleFieldChange}
                required
                placeholder="如护照所示"
              />
              
              <FormField
                label="签发国家 / Country of Issue"
                name="passportCountry"
                type="select"
                value={formData.passportCountry}
                onChange={handleFieldChange}
                required
                options={countryOptions}
              />
              
              <FormField
                label="签发日期 / Issue Date"
                name="passportIssueDate"
                type="date"
                value={formData.passportIssueDate}
                onChange={handleFieldChange}
                required
              />
              
              <FormField
                label="到期日期 / Expiry Date"
                name="passportExpiryDate"
                type="date"
                value={formData.passportExpiryDate}
                onChange={handleFieldChange}
                required
                hint="护照应在计划入境日期后至少6个月内有效"
              />
              
              <FormField
                label="是否为带身份证号的台湾护照 / Taiwan passport with personal ID number?"
                name="taiwanPassportWithId"
                type="select"
                value={formData.taiwanPassportWithId}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                  { value: "na", label: "不适用 N/A" },
                ]}
              />
              
              <FormField
                label="是否为以色列护照 / Israeli passport?"
                name="israeliPassport"
                type="select"
                value={formData.israeliPassport}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 国民身份证件 (National Identity Document)</h3>
              <p className="text-sm text-red-700">如果您有国民身份证，请填写相关信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="是否有国民身份证 / Do you have a national identity document?"
                name="hasNationalId"
                type="select"
                value={formData.hasNationalId}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
                hint="例如中国身份证、美国绿卡等"
              />
              
              {formData.hasNationalId === "yes" && (
                <>
                  <FormField
                    label="证件号码 / Document Number"
                    name="nationalIdNumber"
                    type="text"
                    value={formData.nationalIdNumber}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="签发国家 / Country of Issue"
                    name="nationalIdCountry"
                    type="select"
                    value={formData.nationalIdCountry}
                    onChange={handleFieldChange}
                    required
                    options={countryOptions}
                  />
                  
                  <FormField
                    label="签发日期 / Issue Date"
                    name="nationalIdIssueDate"
                    type="date"
                    value={formData.nationalIdIssueDate}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="到期日期 / Expiry Date"
                    name="nationalIdExpiryDate"
                    type="date"
                    value={formData.nationalIdExpiryDate}
                    onChange={handleFieldChange}
                    hint="如果没有到期日期，可留空"
                  />
                </>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 教育与职业 (Education/Occupation Details)</h3>
              <p className="text-sm text-red-700">请填写您的最高学历和职业信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="最高学历 / Highest Level of Education"
                name="highestEducation"
                type="select"
                value={formData.highestEducation}
                onChange={handleFieldChange}
                required
                options={educationOptions}
                hint="选择您已完成的最高学历"
              />
              
              <FormField
                label="受教育年数 / Total Years of Study"
                name="yearsOfStudy"
                type="number"
                value={formData.yearsOfStudy}
                onChange={handleFieldChange}
                required
                placeholder="例如：16"
                hint="从小学开始计算的总受教育年数"
              />
              
              <FormField
                label="当前职业 / Current Occupation"
                name="currentOccupation"
                type="text"
                value={formData.currentOccupation}
                onChange={handleFieldChange}
                required
                placeholder="例如：Software Engineer"
                hint="请用英文填写您当前的职业"
              />
              
              <FormField
                label="计划在加拿大从事的职业 / Intended Occupation in Canada"
                name="intendedOccupation"
                type="text"
                value={formData.intendedOccupation}
                onChange={handleFieldChange}
                required
                placeholder="例如：Software Engineer"
                hint="您计划在加拿大从事的职业"
              />
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 语言能力 (Language Details)</h3>
              <p className="text-sm text-red-700">请填写您的语言能力和语言测试成绩。语言成绩是EE打分的重要因素。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="母语 / Native Language"
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
                  { value: "arabic", label: "阿拉伯语 Arabic" },
                  { value: "other", label: "其他 Other" },
                ]}
              />
              
              <FormField
                label="英语流利程度 / English Fluency"
                name="englishFluency"
                type="select"
                value={formData.englishFluency}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "native", label: "母语 Native" },
                  { value: "fluent", label: "流利 Fluent" },
                  { value: "moderate", label: "中等 Moderate" },
                  { value: "basic", label: "基础 Basic" },
                  { value: "none", label: "不会 None" },
                ]}
              />
              
              <FormField
                label="法语流利程度 / French Fluency"
                name="frenchFluency"
                type="select"
                value={formData.frenchFluency}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "native", label: "母语 Native" },
                  { value: "fluent", label: "流利 Fluent" },
                  { value: "moderate", label: "中等 Moderate" },
                  { value: "basic", label: "基础 Basic" },
                  { value: "none", label: "不会 None" },
                ]}
              />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">英语测试成绩 / English Language Test Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="测试类型 / Test Type"
                  name="englishTestType"
                  type="select"
                  value={formData.englishTestType}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "", label: "请选择" },
                    { value: "ielts", label: "IELTS General Training" },
                    { value: "celpip", label: "CELPIP General" },
                    { value: "pte", label: "PTE Core" },
                  ]}
                  hint="Express Entry只接受IELTS General Training、CELPIP General或PTE Core"
                />
                
                <FormField
                  label="测试日期 / Test Date"
                  name="englishTestDate"
                  type="date"
                  value={formData.englishTestDate}
                  onChange={handleFieldChange}
                  required
                  hint="成绩必须在2年内有效"
                />
                
                <FormField
                  label="听力分数 / Listening Score"
                  name="englishListening"
                  type="text"
                  value={formData.englishListening}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：8.0"
                />
                
                <FormField
                  label="阅读分数 / Reading Score"
                  name="englishReading"
                  type="text"
                  value={formData.englishReading}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：7.5"
                />
                
                <FormField
                  label="写作分数 / Writing Score"
                  name="englishWriting"
                  type="text"
                  value={formData.englishWriting}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：7.0"
                />
                
                <FormField
                  label="口语分数 / Speaking Score"
                  name="englishSpeaking"
                  type="text"
                  value={formData.englishSpeaking}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：7.5"
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">法语测试成绩 (如有) / French Language Test Results (if applicable)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="测试类型 / Test Type"
                  name="frenchTestType"
                  type="select"
                  value={formData.frenchTestType}
                  onChange={handleFieldChange}
                  options={[
                    { value: "", label: "无 None" },
                    { value: "tef", label: "TEF Canada" },
                    { value: "tcf", label: "TCF Canada" },
                  ]}
                  hint="如果您有法语成绩，可以获得额外加分"
                />
                
                {formData.frenchTestType && (
                  <>
                    <FormField
                      label="测试日期 / Test Date"
                      name="frenchTestDate"
                      type="date"
                      value={formData.frenchTestDate}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="听力分数 / Listening Score"
                      name="frenchListening"
                      type="text"
                      value={formData.frenchListening}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="阅读分数 / Reading Score"
                      name="frenchReading"
                      type="text"
                      value={formData.frenchReading}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="写作分数 / Writing Score"
                      name="frenchWriting"
                      type="text"
                      value={formData.frenchWriting}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="口语分数 / Speaking Score"
                      name="frenchSpeaking"
                      type="text"
                      value={formData.frenchSpeaking}
                      onChange={handleFieldChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 随行家属 (Dependants)</h3>
              <p className="text-sm text-red-700">请填写将与您一同移民的家属信息。</p>
            </div>
            
            <FormField
              label="是否有随行家属 / Do you have dependants?"
              name="hasDependants"
              type="select"
              value={formData.hasDependants}
              onChange={handleFieldChange}
              required
              options={[
                { value: "yes", label: "是 Yes" },
                { value: "no", label: "否 No" },
              ]}
              hint="包括配偶和22岁以下未婚子女"
            />
            
            {formData.hasDependants === "yes" && (
              <>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">家属1 / Dependant 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="关系 / Relationship"
                      name="dependant1Relationship"
                      type="select"
                      value={formData.dependant1Relationship}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "spouse", label: "配偶 Spouse" },
                        { value: "commonLawPartner", label: "同居伴侣 Common-law Partner" },
                        { value: "dependentChild", label: "受抚养子女 Dependent Child" },
                      ]}
                    />
                    
                    <FormField
                      label="姓 / Family Name"
                      name="dependant1FamilyName"
                      type="text"
                      value={formData.dependant1FamilyName}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="名 / Given Name(s)"
                      name="dependant1GivenNames"
                      type="text"
                      value={formData.dependant1GivenNames}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="性别 / Sex"
                      name="dependant1Sex"
                      type="select"
                      value={formData.dependant1Sex}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "F", label: "女 Female" },
                        { value: "M", label: "男 Male" },
                        { value: "X", label: "其他 Another gender (X)" },
                      ]}
                    />
                    
                    <FormField
                      label="出生日期 / Date of Birth"
                      name="dependant1DateOfBirth"
                      type="date"
                      value={formData.dependant1DateOfBirth}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="出生国家 / Country of Birth"
                      name="dependant1CountryOfBirth"
                      type="select"
                      value={formData.dependant1CountryOfBirth}
                      onChange={handleFieldChange}
                      required
                      options={countryOptions}
                    />
                    
                    <FormField
                      label="国籍 / Citizenship"
                      name="dependant1Citizenship"
                      type="select"
                      value={formData.dependant1Citizenship}
                      onChange={handleFieldChange}
                      required
                      options={countryOptions}
                    />
                    
                    <FormField
                      label="婚姻状况 / Marital Status"
                      name="dependant1MaritalStatus"
                      type="select"
                      value={formData.dependant1MaritalStatus}
                      onChange={handleFieldChange}
                      required
                      options={maritalStatusOptions}
                    />
                    
                    <FormField
                      label="是否随行 / Accompanying?"
                      name="dependant1Accompanying"
                      type="select"
                      value={formData.dependant1Accompanying}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "yes", label: "是 Yes" },
                        { value: "no", label: "否 No" },
                      ]}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">家属2 (如有) / Dependant 2 (if applicable)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="关系 / Relationship"
                      name="dependant2Relationship"
                      type="select"
                      value={formData.dependant2Relationship}
                      onChange={handleFieldChange}
                      options={[
                        { value: "", label: "无 None" },
                        { value: "spouse", label: "配偶 Spouse" },
                        { value: "commonLawPartner", label: "同居伴侣 Common-law Partner" },
                        { value: "dependentChild", label: "受抚养子女 Dependent Child" },
                      ]}
                    />
                    
                    {formData.dependant2Relationship && (
                      <>
                        <FormField
                          label="姓 / Family Name"
                          name="dependant2FamilyName"
                          type="text"
                          value={formData.dependant2FamilyName}
                          onChange={handleFieldChange}
                        />
                        
                        <FormField
                          label="名 / Given Name(s)"
                          name="dependant2GivenNames"
                          type="text"
                          value={formData.dependant2GivenNames}
                          onChange={handleFieldChange}
                        />
                        
                        <FormField
                          label="性别 / Sex"
                          name="dependant2Sex"
                          type="select"
                          value={formData.dependant2Sex}
                          onChange={handleFieldChange}
                          options={[
                            { value: "F", label: "女 Female" },
                            { value: "M", label: "男 Male" },
                            { value: "X", label: "其他 Another gender (X)" },
                          ]}
                        />
                        
                        <FormField
                          label="出生日期 / Date of Birth"
                          name="dependant2DateOfBirth"
                          type="date"
                          value={formData.dependant2DateOfBirth}
                          onChange={handleFieldChange}
                        />
                        
                        <FormField
                          label="出生国家 / Country of Birth"
                          name="dependant2CountryOfBirth"
                          type="select"
                          value={formData.dependant2CountryOfBirth}
                          onChange={handleFieldChange}
                          options={countryOptions}
                        />
                        
                        <FormField
                          label="国籍 / Citizenship"
                          name="dependant2Citizenship"
                          type="select"
                          value={formData.dependant2Citizenship}
                          onChange={handleFieldChange}
                          options={countryOptions}
                        />
                        
                        <FormField
                          label="婚姻状况 / Marital Status"
                          name="dependant2MaritalStatus"
                          type="select"
                          value={formData.dependant2MaritalStatus}
                          onChange={handleFieldChange}
                          options={maritalStatusOptions}
                        />
                        
                        <FormField
                          label="是否随行 / Accompanying?"
                          name="dependant2Accompanying"
                          type="select"
                          value={formData.dependant2Accompanying}
                          onChange={handleFieldChange}
                          options={[
                            { value: "yes", label: "是 Yes" },
                            { value: "no", label: "否 No" },
                          ]}
                        />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 背景问题 (Background Questions)</h3>
              <p className="text-sm text-amber-700">请如实回答以下背景问题。如果任何问题回答"是"，请提供详细说明。</p>
            </div>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <FormField
                  label="a) 是否在加拿大有未被赦免的犯罪记录？/ Have you ever been convicted of a crime in Canada for which a pardon has not been granted?"
                  name="criminalConviction"
                  type="select"
                  value={formData.criminalConviction}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.criminalConviction === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="criminalConvictionDetails"
                    type="textarea"
                    value={formData.criminalConvictionDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="b) 是否正在被起诉或有犯罪指控？/ Are you currently charged with, on trial for, or subject to any criminal proceedings?"
                  name="currentlyCharged"
                  type="select"
                  value={formData.currentlyCharged}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.currentlyCharged === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="currentlyChargedDetails"
                    type="textarea"
                    value={formData.currentlyChargedDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="c) 是否曾申请过难民保护？/ Have you ever made a claim for refugee protection?"
                  name="previousRefugee"
                  type="select"
                  value={formData.previousRefugee}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.previousRefugee === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="previousRefugeeDetails"
                    type="textarea"
                    value={formData.previousRefugeeDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="d) 是否曾被拒绝难民身份、移民签证或临时签证？/ Have you ever been refused refugee status, immigration visa or temporary visa?"
                  name="previousRefusal"
                  type="select"
                  value={formData.previousRefusal}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.previousRefusal === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="previousRefusalDetails"
                    type="textarea"
                    value={formData.previousRefusalDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="e) 是否曾被拒绝入境或被驱逐出任何国家？/ Have you ever been refused admission to or ordered to leave any country?"
                  name="previousDeportation"
                  type="select"
                  value={formData.previousDeportation}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.previousDeportation === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="previousDeportationDetails"
                    type="textarea"
                    value={formData.previousDeportationDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="f) 是否参与过种族灭绝、战争罪或反人类罪？/ Have you ever been involved in genocide, war crimes or crimes against humanity?"
                  name="warCrimes"
                  type="select"
                  value={formData.warCrimes}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.warCrimes === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="warCrimesDetails"
                    type="textarea"
                    value={formData.warCrimesDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="g) 是否使用、计划或倡导使用武装斗争或暴力？/ Have you ever used, planned or advocated the use of armed struggle or violence?"
                  name="armedStruggle"
                  type="select"
                  value={formData.armedStruggle}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.armedStruggle === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="armedStruggleDetails"
                    type="textarea"
                    value={formData.armedStruggleDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="h) 是否与使用武装斗争或暴力的组织有关联？/ Have you ever been associated with a group that uses armed struggle or violence?"
                  name="associatedWithViolence"
                  type="select"
                  value={formData.associatedWithViolence}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.associatedWithViolence === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="associatedWithViolenceDetails"
                    type="textarea"
                    value={formData.associatedWithViolenceDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="i) 是否是参与犯罪活动的组织成员？/ Have you ever been a member of an organization engaged in criminal activity?"
                  name="criminalOrganization"
                  type="select"
                  value={formData.criminalOrganization}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.criminalOrganization === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="criminalOrganizationDetails"
                    type="textarea"
                    value={formData.criminalOrganizationDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="j) 是否曾被拘留、监禁或入狱？/ Have you ever been detained, incarcerated or put in jail?"
                  name="detained"
                  type="select"
                  value={formData.detained}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.detained === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="detainedDetails"
                    type="textarea"
                    value={formData.detainedDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <FormField
                  label="k) 是否有严重的身体或精神疾病？/ Do you have any serious disease or physical or mental disorder?"
                  name="healthCondition"
                  type="select"
                  value={formData.healthCondition}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "no", label: "否 No" },
                    { value: "yes", label: "是 Yes" },
                  ]}
                />
                {formData.healthCondition === "yes" && (
                  <FormField
                    label="详细说明 / Details"
                    name="healthConditionDetails"
                    type="textarea"
                    value={formData.healthConditionDetails}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 教育历史 (Education History)</h3>
              <p className="text-sm text-amber-700">请填写您的教育经历，包括中学及以上教育。</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <FormField
                label="小学年数 / Elementary Years"
                name="elementaryYears"
                type="number"
                value={formData.elementaryYears}
                onChange={handleFieldChange}
                required
                placeholder="例如：6"
              />
              
              <FormField
                label="中学年数 / Secondary Years"
                name="secondaryYears"
                type="number"
                value={formData.secondaryYears}
                onChange={handleFieldChange}
                required
                placeholder="例如：6"
              />
              
              <FormField
                label="大学年数 / University Years"
                name="universityYears"
                type="number"
                value={formData.universityYears}
                onChange={handleFieldChange}
                required
                placeholder="例如：4"
              />
              
              <FormField
                label="职业学校年数 / Trade School Years"
                name="tradeSchoolYears"
                type="number"
                value={formData.tradeSchoolYears}
                onChange={handleFieldChange}
                placeholder="例如：0"
              />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">教育经历1 / Education 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="开始日期 / From (YYYY-MM)"
                  name="edu1From"
                  type="text"
                  value={formData.edu1From}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：2010-09"
                />
                
                <FormField
                  label="结束日期 / To (YYYY-MM)"
                  name="edu1To"
                  type="text"
                  value={formData.edu1To}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：2014-06"
                />
                
                <FormField
                  label="学校名称 / Name of Institution"
                  name="edu1Institution"
                  type="text"
                  value={formData.edu1Institution}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：Peking University"
                />
                
                <FormField
                  label="城市和国家 / City and Country"
                  name="edu1CityCountry"
                  type="text"
                  value={formData.edu1CityCountry}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：Beijing, China"
                />
                
                <FormField
                  label="证书/文凭类型 / Type of Certificate or Diploma"
                  name="edu1Certificate"
                  type="text"
                  value={formData.edu1Certificate}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：Bachelor's Degree"
                />
                
                <FormField
                  label="专业领域 / Field of Study"
                  name="edu1FieldOfStudy"
                  type="text"
                  value={formData.edu1FieldOfStudy}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：Computer Science"
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">教育经历2 (如有) / Education 2 (if applicable)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="开始日期 / From (YYYY-MM)"
                  name="edu2From"
                  type="text"
                  value={formData.edu2From}
                  onChange={handleFieldChange}
                  placeholder="例如：2014-09"
                />
                
                <FormField
                  label="结束日期 / To (YYYY-MM)"
                  name="edu2To"
                  type="text"
                  value={formData.edu2To}
                  onChange={handleFieldChange}
                  placeholder="例如：2016-06"
                />
                
                <FormField
                  label="学校名称 / Name of Institution"
                  name="edu2Institution"
                  type="text"
                  value={formData.edu2Institution}
                  onChange={handleFieldChange}
                  placeholder="例如：University of Toronto"
                />
                
                <FormField
                  label="城市和国家 / City and Country"
                  name="edu2CityCountry"
                  type="text"
                  value={formData.edu2CityCountry}
                  onChange={handleFieldChange}
                  placeholder="例如：Toronto, Canada"
                />
                
                <FormField
                  label="证书/文凭类型 / Type of Certificate or Diploma"
                  name="edu2Certificate"
                  type="text"
                  value={formData.edu2Certificate}
                  onChange={handleFieldChange}
                  placeholder="例如：Master's Degree"
                />
                
                <FormField
                  label="专业领域 / Field of Study"
                  name="edu2FieldOfStudy"
                  type="text"
                  value={formData.edu2FieldOfStudy}
                  onChange={handleFieldChange}
                  placeholder="例如：Software Engineering"
                />
              </div>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 个人历史 (Personal History)</h3>
              <p className="text-sm text-amber-700">请填写过去10年的个人历史，包括工作、学习、失业等。<strong>不能有任何时间空白。</strong></p>
            </div>
            
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">历史记录 {num} / History {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="开始日期 / From (YYYY-MM)"
                    name={`history${num}From`}
                    type="text"
                    value={formData[`history${num}From`]}
                    onChange={handleFieldChange}
                    required={num <= 2}
                    placeholder="例如：2020-01"
                  />
                  
                  <FormField
                    label="结束日期 / To (YYYY-MM)"
                    name={`history${num}To`}
                    type="text"
                    value={formData[`history${num}To`]}
                    onChange={handleFieldChange}
                    required={num <= 2}
                    placeholder="例如：2023-12 或 Present"
                  />
                  
                  <FormField
                    label="活动类型 / Activity"
                    name={`history${num}Activity`}
                    type="select"
                    value={formData[`history${num}Activity`]}
                    onChange={handleFieldChange}
                    required={num <= 2}
                    options={[
                      { value: "", label: "请选择" },
                      { value: "employed", label: "就业 Employed" },
                      { value: "selfEmployed", label: "自雇 Self-employed" },
                      { value: "unemployed", label: "失业 Unemployed" },
                      { value: "student", label: "学生 Student" },
                      { value: "retired", label: "退休 Retired" },
                      { value: "homemaker", label: "家庭主妇/夫 Homemaker" },
                      { value: "travelling", label: "旅行 Travelling" },
                      { value: "other", label: "其他 Other" },
                    ]}
                  />
                  
                  <FormField
                    label="城市和国家 / City and Country"
                    name={`history${num}CityCountry`}
                    type="text"
                    value={formData[`history${num}CityCountry`]}
                    onChange={handleFieldChange}
                    required={num <= 2}
                    placeholder="例如：Shanghai, China"
                  />
                  
                  <FormField
                    label="在该国身份 / Status in Country"
                    name={`history${num}Status`}
                    type="select"
                    value={formData[`history${num}Status`]}
                    onChange={handleFieldChange}
                    required={num <= 2}
                    options={[
                      { value: "", label: "请选择" },
                      { value: "citizen", label: "公民 Citizen" },
                      { value: "permanentResident", label: "永久居民 Permanent Resident" },
                      { value: "workVisa", label: "工作签证 Work Visa" },
                      { value: "studentVisa", label: "学生签证 Student Visa" },
                      { value: "visitorVisa", label: "访客签证 Visitor Visa" },
                      { value: "other", label: "其他 Other" },
                    ]}
                  />
                  
                  <FormField
                    label="公司/雇主/学校名称 / Name of Company, Employer, School"
                    name={`history${num}Employer`}
                    type="text"
                    value={formData[`history${num}Employer`]}
                    onChange={handleFieldChange}
                    required={num <= 2}
                    placeholder="例如：ABC Technology Co., Ltd."
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 12:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 组织会员 (Membership and Association with Organizations)</h3>
              <p className="text-sm text-amber-700">请列出您曾参加或关联的所有组织，包括政治、社会、青年、学生组织、工会和专业协会。</p>
            </div>
            
            <FormField
              label="是否有组织会员经历 / Have you been a member of any organizations?"
              name="hasMemberships"
              type="select"
              value={formData.hasMemberships}
              onChange={handleFieldChange}
              required
              options={[
                { value: "no", label: "否 No - 填写 NONE" },
                { value: "yes", label: "是 Yes" },
              ]}
            />
            
            {formData.hasMemberships === "yes" && (
              <>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">组织1 / Organization 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="开始日期 / From (YYYY-MM)"
                      name="org1From"
                      type="text"
                      value={formData.org1From}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：2015-01"
                    />
                    
                    <FormField
                      label="结束日期 / To (YYYY-MM)"
                      name="org1To"
                      type="text"
                      value={formData.org1To}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：2020-12 或 Present"
                    />
                    
                    <FormField
                      label="组织名称 / Name of Organization"
                      name="org1Name"
                      type="text"
                      value={formData.org1Name}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：IEEE"
                    />
                    
                    <FormField
                      label="组织类型 / Type of Organization"
                      name="org1Type"
                      type="select"
                      value={formData.org1Type}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "professional", label: "专业协会 Professional Association" },
                        { value: "tradeUnion", label: "工会 Trade Union" },
                        { value: "political", label: "政治组织 Political Organization" },
                        { value: "social", label: "社会组织 Social Organization" },
                        { value: "youth", label: "青年组织 Youth Organization" },
                        { value: "student", label: "学生组织 Student Organization" },
                        { value: "religious", label: "宗教组织 Religious Organization" },
                        { value: "other", label: "其他 Other" },
                      ]}
                    />
                    
                    <FormField
                      label="职位/活动 / Activities and/or Positions Held"
                      name="org1Position"
                      type="text"
                      value={formData.org1Position}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：Member"
                    />
                    
                    <FormField
                      label="城市和国家 / City and Country"
                      name="org1CityCountry"
                      type="text"
                      value={formData.org1CityCountry}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：Beijing, China"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">组织2 (如有) / Organization 2 (if applicable)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="开始日期 / From (YYYY-MM)"
                      name="org2From"
                      type="text"
                      value={formData.org2From}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="结束日期 / To (YYYY-MM)"
                      name="org2To"
                      type="text"
                      value={formData.org2To}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="组织名称 / Name of Organization"
                      name="org2Name"
                      type="text"
                      value={formData.org2Name}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="组织类型 / Type of Organization"
                      name="org2Type"
                      type="select"
                      value={formData.org2Type}
                      onChange={handleFieldChange}
                      options={[
                        { value: "", label: "请选择" },
                        { value: "professional", label: "专业协会 Professional Association" },
                        { value: "tradeUnion", label: "工会 Trade Union" },
                        { value: "political", label: "政治组织 Political Organization" },
                        { value: "social", label: "社会组织 Social Organization" },
                        { value: "youth", label: "青年组织 Youth Organization" },
                        { value: "student", label: "学生组织 Student Organization" },
                        { value: "religious", label: "宗教组织 Religious Organization" },
                        { value: "other", label: "其他 Other" },
                      ]}
                    />
                    
                    <FormField
                      label="职位/活动 / Activities and/or Positions Held"
                      name="org2Position"
                      type="text"
                      value={formData.org2Position}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="城市和国家 / City and Country"
                      name="org2CityCountry"
                      type="text"
                      value={formData.org2CityCountry}
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 13:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 政府职位 (Government Positions)</h3>
              <p className="text-sm text-amber-700">请列出您曾担任的所有政府职位，包括公务员、法官、警察、安全组织员工等。</p>
            </div>
            
            <FormField
              label="是否曾担任政府职位 / Have you ever held any government positions?"
              name="hasGovtPositions"
              type="select"
              value={formData.hasGovtPositions}
              onChange={handleFieldChange}
              required
              options={[
                { value: "no", label: "否 No - 填写 NONE" },
                { value: "yes", label: "是 Yes" },
              ]}
            />
            
            {formData.hasGovtPositions === "yes" && (
              <>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">政府职位1 / Government Position 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="开始日期 / From (YYYY-MM)"
                      name="govt1From"
                      type="text"
                      value={formData.govt1From}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="结束日期 / To (YYYY-MM)"
                      name="govt1To"
                      type="text"
                      value={formData.govt1To}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="国家和管辖级别 / Country and Level of Jurisdiction"
                      name="govt1Jurisdiction"
                      type="text"
                      value={formData.govt1Jurisdiction}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：China, National"
                      hint="国家、地区或市政级别"
                    />
                    
                    <FormField
                      label="部门/分支 / Department/Branch"
                      name="govt1Department"
                      type="text"
                      value={formData.govt1Department}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：Ministry of Education"
                    />
                    
                    <FormField
                      label="职位/活动 / Activities and/or Positions Held"
                      name="govt1Position"
                      type="text"
                      value={formData.govt1Position}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：Civil Servant"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">政府职位2 (如有) / Government Position 2 (if applicable)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="开始日期 / From (YYYY-MM)"
                      name="govt2From"
                      type="text"
                      value={formData.govt2From}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="结束日期 / To (YYYY-MM)"
                      name="govt2To"
                      type="text"
                      value={formData.govt2To}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="国家和管辖级别 / Country and Level of Jurisdiction"
                      name="govt2Jurisdiction"
                      type="text"
                      value={formData.govt2Jurisdiction}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="部门/分支 / Department/Branch"
                      name="govt2Department"
                      type="text"
                      value={formData.govt2Department}
                      onChange={handleFieldChange}
                    />
                    
                    <FormField
                      label="职位/活动 / Activities and/or Positions Held"
                      name="govt2Position"
                      type="text"
                      value={formData.govt2Position}
                      onChange={handleFieldChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 14:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 军事服务 (Military and/or Paramilitary Service)</h3>
              <p className="text-sm text-amber-700">请填写您的军事或准军事服务经历。<strong>不能有任何时间空白。</strong></p>
            </div>
            
            <FormField
              label="是否有军事服务经历 / Have you ever served in the military or paramilitary?"
              name="hasMilitaryService"
              type="select"
              value={formData.hasMilitaryService}
              onChange={handleFieldChange}
              required
              options={[
                { value: "no", label: "否 No - 填写 NONE" },
                { value: "yes", label: "是 Yes" },
              ]}
            />
            
            {formData.hasMilitaryService === "yes" && (
              <>
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">军事服务1 / Military Service 1</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="国家 / Name of Country"
                      name="military1Country"
                      type="select"
                      value={formData.military1Country}
                      onChange={handleFieldChange}
                      required
                      options={countryOptions}
                    />
                    
                    <FormField
                      label="开始日期 / From (YYYY-MM)"
                      name="military1From"
                      type="text"
                      value={formData.military1From}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="结束日期 / To (YYYY-MM)"
                      name="military1To"
                      type="text"
                      value={formData.military1To}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="服役分支、部队编号和指挥官姓名 / Branch of Service, Unit Numbers and Commanding Officers"
                      name="military1Branch"
                      type="text"
                      value={formData.military1Branch}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="军衔 / Rank(s)"
                      name="military1Rank"
                      type="text"
                      value={formData.military1Rank}
                      onChange={handleFieldChange}
                      required
                    />
                    
                    <FormField
                      label="实战日期和地点 / Dates and Places of Any Active Combat"
                      name="military1Combat"
                      type="text"
                      value={formData.military1Combat}
                      onChange={handleFieldChange}
                      placeholder="如无填写 None"
                    />
                    
                    <FormField
                      label="服役结束原因 / Reason for End of Service"
                      name="military1EndReason"
                      type="text"
                      value={formData.military1EndReason}
                      onChange={handleFieldChange}
                      required
                      placeholder="例如：Completed mandatory service"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 15:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 地址历史 (Address History)</h3>
              <p className="text-sm text-amber-700">请列出过去10年或18岁以来的所有居住地址。不要使用邮政信箱地址。</p>
            </div>
            
            {[1, 2, 3].map((num) => (
              <div key={num} className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">地址 {num} / Address {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="开始日期 / From (YYYY-MM)"
                    name={`addr${num}From`}
                    type="text"
                    value={formData[`addr${num}From`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                    placeholder="例如：2020-01"
                  />
                  
                  <FormField
                    label="结束日期 / To (YYYY-MM)"
                    name={`addr${num}To`}
                    type="text"
                    value={formData[`addr${num}To`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                    placeholder="例如：Present"
                  />
                  
                  <FormField
                    label="街道和门牌号 / Street and Number"
                    name={`addr${num}Street`}
                    type="text"
                    value={formData[`addr${num}Street`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                    placeholder="例如：123 Main Street, Apt 456"
                  />
                  
                  <FormField
                    label="城市 / City or Town"
                    name={`addr${num}City`}
                    type="text"
                    value={formData[`addr${num}City`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                  />
                  
                  <FormField
                    label="省/州/区 / Province, State or District"
                    name={`addr${num}Province`}
                    type="text"
                    value={formData[`addr${num}Province`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                  />
                  
                  <FormField
                    label="邮政编码 / Postal Code/Zip Code"
                    name={`addr${num}PostalCode`}
                    type="text"
                    value={formData[`addr${num}PostalCode`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                  />
                  
                  <FormField
                    label="国家 / Country"
                    name={`addr${num}Country`}
                    type="select"
                    value={formData[`addr${num}Country`]}
                    onChange={handleFieldChange}
                    required={num === 1}
                    options={countryOptions}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 16:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">IMM 5406 - 家庭信息 (Additional Family Information)</h3>
              <p className="text-sm text-green-700">请填写您的父母、子女和兄弟姐妹信息。</p>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">父亲信息 / Father&apos;s Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="姓 / Family Name"
                  name="fatherFamilyName"
                  type="text"
                  value={formData.fatherFamilyName}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="名 / Given Name(s)"
                  name="fatherGivenNames"
                  type="text"
                  value={formData.fatherGivenNames}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="出生日期 / Date of Birth"
                  name="fatherDateOfBirth"
                  type="date"
                  value={formData.fatherDateOfBirth}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="出生城市 / City of Birth"
                  name="fatherCityOfBirth"
                  type="text"
                  value={formData.fatherCityOfBirth}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="出生国家 / Country of Birth"
                  name="fatherCountryOfBirth"
                  type="select"
                  value={formData.fatherCountryOfBirth}
                  onChange={handleFieldChange}
                  required
                  options={countryOptions}
                />
                
                <FormField
                  label="死亡日期 (如已故) / Date of Death (if deceased)"
                  name="fatherDateOfDeath"
                  type="date"
                  value={formData.fatherDateOfDeath}
                  onChange={handleFieldChange}
                />
                
                <FormField
                  label="现居地址 / Current Address"
                  name="fatherCurrentAddress"
                  type="text"
                  value={formData.fatherCurrentAddress}
                  onChange={handleFieldChange}
                  required
                  placeholder="完整地址或 Deceased"
                />
                
                <FormField
                  label="婚姻状况 / Marital Status"
                  name="fatherMaritalStatus"
                  type="select"
                  value={formData.fatherMaritalStatus}
                  onChange={handleFieldChange}
                  required
                  options={maritalStatusOptions}
                />
                
                <FormField
                  label="是否在加拿大 / Present in Canada?"
                  name="fatherInCanada"
                  type="select"
                  value={formData.fatherInCanada}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "yes", label: "是 Yes" },
                    { value: "no", label: "否 No" },
                  ]}
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">母亲信息 / Mother&apos;s Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="出生时的姓 / Family Name at Birth"
                  name="motherFamilyNameAtBirth"
                  type="text"
                  value={formData.motherFamilyNameAtBirth}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="名 / Given Name(s)"
                  name="motherGivenNames"
                  type="text"
                  value={formData.motherGivenNames}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="出生日期 / Date of Birth"
                  name="motherDateOfBirth"
                  type="date"
                  value={formData.motherDateOfBirth}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="出生城市 / City of Birth"
                  name="motherCityOfBirth"
                  type="text"
                  value={formData.motherCityOfBirth}
                  onChange={handleFieldChange}
                  required
                />
                
                <FormField
                  label="出生国家 / Country of Birth"
                  name="motherCountryOfBirth"
                  type="select"
                  value={formData.motherCountryOfBirth}
                  onChange={handleFieldChange}
                  required
                  options={countryOptions}
                />
                
                <FormField
                  label="死亡日期 (如已故) / Date of Death (if deceased)"
                  name="motherDateOfDeath"
                  type="date"
                  value={formData.motherDateOfDeath}
                  onChange={handleFieldChange}
                />
                
                <FormField
                  label="现居地址 / Current Address"
                  name="motherCurrentAddress"
                  type="text"
                  value={formData.motherCurrentAddress}
                  onChange={handleFieldChange}
                  required
                  placeholder="完整地址或 Deceased"
                />
                
                <FormField
                  label="婚姻状况 / Marital Status"
                  name="motherMaritalStatus"
                  type="select"
                  value={formData.motherMaritalStatus}
                  onChange={handleFieldChange}
                  required
                  options={maritalStatusOptions}
                />
                
                <FormField
                  label="是否在加拿大 / Present in Canada?"

                  name="motherInCanada"
                  type="select"
                  value={formData.motherInCanada}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "yes", label: "是 Yes" },
                    { value: "no", label: "否 No" },
                  ]}
                />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">子女信息 / Children Information</h4>
              <FormField
                label="是否有子女 / Do you have children?"
                name="hasChildren"
                type="select"
                value={formData.hasChildren}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "no", label: "否 No" },
                  { value: "yes", label: "是 Yes" },
                ]}
              />
              
              {formData.hasChildren === "yes" && (
                <>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h5 className="col-span-full font-medium text-gray-700">子女1 / Child 1</h5>
                    <FormField
                      label="姓 / Family Name"
                      name="child1FamilyName"
                      type="text"
                      value={formData.child1FamilyName}
                      onChange={handleFieldChange}
                      required
                    />
                    <FormField
                      label="名 / Given Name(s)"
                      name="child1GivenNames"
                      type="text"
                      value={formData.child1GivenNames}
                      onChange={handleFieldChange}
                      required
                    />
                    <FormField
                      label="关系 / Relationship"
                      name="child1Relationship"
                      type="select"
                      value={formData.child1Relationship}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "son", label: "儿子 Son" },
                        { value: "daughter", label: "女儿 Daughter" },
                        { value: "stepson", label: "继子 Stepson" },
                        { value: "stepdaughter", label: "继女 Stepdaughter" },
                      ]}
                    />
                    <FormField
                      label="出生日期 / Date of Birth"
                      name="child1DateOfBirth"
                      type="date"
                      value={formData.child1DateOfBirth}
                      onChange={handleFieldChange}
                      required
                    />
                    <FormField
                      label="出生国家 / Country of Birth"
                      name="child1CountryOfBirth"
                      type="select"
                      value={formData.child1CountryOfBirth}
                      onChange={handleFieldChange}
                      required
                      options={countryOptions}
                    />
                    <FormField
                      label="婚姻状况 / Marital Status"
                      name="child1MaritalStatus"
                      type="select"
                      value={formData.child1MaritalStatus}
                      onChange={handleFieldChange}
                      required
                      options={maritalStatusOptions}
                    />
                    <FormField
                      label="现居地址 / Current Address"
                      name="child1CurrentAddress"
                      type="text"
                      value={formData.child1CurrentAddress}
                      onChange={handleFieldChange}
                      required
                    />
                    <FormField
                      label="是否在加拿大 / Present in Canada?"
                      name="child1InCanada"
                      type="select"
                      value={formData.child1InCanada}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "yes", label: "是 Yes" },
                        { value: "no", label: "否 No" },
                      ]}
                    />
                    <FormField
                      label="是否随行 / Accompanying?"
                      name="child1Accompanying"
                      type="select"
                      value={formData.child1Accompanying}
                      onChange={handleFieldChange}
                      required
                      options={[
                        { value: "yes", label: "是 Yes" },
                        { value: "no", label: "否 No" },
                      ]}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">兄弟姐妹信息 / Siblings Information</h4>
              <FormField
                label="是否有兄弟姐妹 / Do you have siblings?"
                name="hasSiblings"
                type="select"
                value={formData.hasSiblings}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "no", label: "否 No" },
                  { value: "yes", label: "是 Yes" },
                ]}
              />
              
              {formData.hasSiblings === "yes" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <h5 className="col-span-full font-medium text-gray-700">兄弟姐妹1 / Sibling 1</h5>
                  <FormField
                    label="姓 / Family Name"
                    name="sibling1FamilyName"
                    type="text"
                    value={formData.sibling1FamilyName}
                    onChange={handleFieldChange}
                    required
                  />
                  <FormField
                    label="名 / Given Name(s)"
                    name="sibling1GivenNames"
                    type="text"
                    value={formData.sibling1GivenNames}
                    onChange={handleFieldChange}
                    required
                  />
                  <FormField
                    label="关系 / Relationship"
                    name="sibling1Relationship"
                    type="select"
                    value={formData.sibling1Relationship}
                    onChange={handleFieldChange}
                    required
                    options={[
                      { value: "brother", label: "兄弟 Brother" },
                      { value: "sister", label: "姐妹 Sister" },
                      { value: "halfBrother", label: "同父异母/同母异父兄弟 Half-brother" },
                      { value: "halfSister", label: "同父异母/同母异父姐妹 Half-sister" },
                      { value: "stepBrother", label: "继兄弟 Stepbrother" },
                      { value: "stepSister", label: "继姐妹 Stepsister" },
                    ]}
                  />
                  <FormField
                    label="出生日期 / Date of Birth"
                    name="sibling1DateOfBirth"
                    type="date"
                    value={formData.sibling1DateOfBirth}
                    onChange={handleFieldChange}
                    required
                  />
                  <FormField
                    label="出生国家 / Country of Birth"
                    name="sibling1CountryOfBirth"
                    type="select"
                    value={formData.sibling1CountryOfBirth}
                    onChange={handleFieldChange}
                    required
                    options={countryOptions}
                  />
                  <FormField
                    label="婚姻状况 / Marital Status"
                    name="sibling1MaritalStatus"
                    type="select"
                    value={formData.sibling1MaritalStatus}
                    onChange={handleFieldChange}
                    required
                    options={maritalStatusOptions}
                  />
                  <FormField
                    label="现居地址 / Current Address"
                    name="sibling1CurrentAddress"
                    type="text"
                    value={formData.sibling1CurrentAddress}
                    onChange={handleFieldChange}
                    required
                  />
                  <FormField
                    label="是否在加拿大 / Present in Canada?"
                    name="sibling1InCanada"
                    type="select"
                    value={formData.sibling1InCanada}
                    onChange={handleFieldChange}
                    required
                    options={[
                      { value: "yes", label: "是 Yes" },
                      { value: "no", label: "否 No" },
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 17:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-800 mb-2">Express Entry 特有信息</h3>
              <p className="text-sm text-purple-700">请填写Express Entry系统相关的特有信息，包括EE档案、学历认证、省提名和工作邀请等。</p>
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">Express Entry 档案信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="EE项目类别 / Express Entry Program"
                  name="eeProgram"
                  type="select"
                  value={formData.eeProgram}
                  onChange={handleFieldChange}
                  required
                  options={eeProgramOptions}
                  hint="选择您申请的Express Entry项目类别"
                />
                
                <FormField
                  label="EE档案编号 / Profile Number"
                  name="eeProfileNumber"
                  type="text"
                  value={formData.eeProfileNumber}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：E000123456"
                  hint="您在EE系统中的档案编号"
                />
                
                <FormField
                  label="验证码 / Validation Code"
                  name="eeValidationCode"
                  type="text"
                  value={formData.eeValidationCode}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：A1B2C3D4E5F6"
                  hint="收到ITA后的验证码"
                />
                
                <FormField
                  label="ITA收到日期 / Date ITA Received"
                  name="itaDate"
                  type="date"
                  value={formData.itaDate}
                  onChange={handleFieldChange}
                  required
                  hint="收到申请邀请(ITA)的日期"
                />
              </div>
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">职业信息 / Occupation Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="NOC代码 / NOC Code"
                  name="nocCode"
                  type="text"
                  value={formData.nocCode}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：21231"
                  hint="您主要职业的NOC 2021代码"
                />
                
                <FormField
                  label="职业名称 / NOC Title"
                  name="nocTitle"
                  type="text"
                  value={formData.nocTitle}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：Software developers and programmers"
                />
                
                <FormField
                  label="相关工作经验年数 / Years of Experience"
                  name="yearsOfExperience"
                  type="select"
                  value={formData.yearsOfExperience}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "1", label: "1年 1 year" },
                    { value: "2", label: "2年 2 years" },
                    { value: "3", label: "3年 3 years" },
                    { value: "4", label: "4年 4 years" },
                    { value: "5", label: "5年 5 years" },
                    { value: "6+", label: "6年或以上 6+ years" },
                  ]}
                  hint="过去10年内的相关工作经验"
                />
              </div>
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">学历认证 (ECA) / Educational Credential Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="ECA机构 / ECA Organization"
                  name="ecaOrganization"
                  type="select"
                  value={formData.ecaOrganization}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "wes", label: "WES (World Education Services)" },
                    { value: "iqas", label: "IQAS (International Qualifications Assessment Service)" },
                    { value: "ces", label: "CES (Comparative Education Service)" },
                    { value: "mcc", label: "MCC (Medical Council of Canada)" },
                    { value: "pebc", label: "PEBC (Pharmacy Examining Board of Canada)" },
                    { value: "other", label: "其他 Other" },
                  ]}
                  hint="进行学历认证的机构"
                />
                
                <FormField
                  label="ECA参考编号 / ECA Reference Number"
                  name="ecaNumber"
                  type="text"
                  value={formData.ecaNumber}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：WES1234567"
                />
                
                <FormField
                  label="ECA日期 / ECA Date"
                  name="ecaDate"
                  type="date"
                  value={formData.ecaDate}
                  onChange={handleFieldChange}
                  required
                  hint="ECA报告日期，必须在5年内有效"
                />
                
                <FormField
                  label="加拿大等效学历 / Canadian Equivalent"
                  name="ecaEquivalent"
                  type="select"
                  value={formData.ecaEquivalent}
                  onChange={handleFieldChange}
                  required
                  options={educationOptions}
                  hint="ECA认证的加拿大等效学历"
                />
              </div>
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">省提名 (PNP) / Provincial Nomination</h4>
              <FormField
                label="是否有省提名 / Do you have a provincial nomination?"
                name="hasProvincialNomination"
                type="select"
                value={formData.hasProvincialNomination}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "no", label: "否 No" },
                  { value: "yes", label: "是 Yes" },
                ]}
                hint="省提名可获得600分加分"
              />
              
              {formData.hasProvincialNomination === "yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    label="提名省份 / Nominating Province"
                    name="pnpProvince"
                    type="select"
                    value={formData.pnpProvince}
                    onChange={handleFieldChange}
                    required
                    options={provinceOptions}
                  />
                  
                  <FormField
                    label="提名证书编号 / Certificate Number"
                    name="pnpCertificateNumber"
                    type="text"
                    value={formData.pnpCertificateNumber}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="提名日期 / Nomination Date"
                    name="pnpDate"
                    type="date"
                    value={formData.pnpDate}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="border-b pb-6">
              <h4 className="font-medium text-gray-900 mb-4">工作邀请 / Job Offer</h4>
              <FormField
                label="是否有有效工作邀请 / Do you have a valid job offer?"
                name="hasJobOffer"
                type="select"
                value={formData.hasJobOffer}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "no", label: "否 No" },
                  { value: "yes", label: "是 Yes" },
                ]}
                hint="需要LMIA支持的工作邀请可获得加分"
              />
              
              {formData.hasJobOffer === "yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    label="雇主名称 / Employer Name"
                    name="jobOfferEmployer"
                    type="text"
                    value={formData.jobOfferEmployer}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="职位名称 / Position Title"
                    name="jobOfferPosition"
                    type="text"
                    value={formData.jobOfferPosition}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="职位NOC代码 / Position NOC Code"
                    name="jobOfferNoc"
                    type="text"
                    value={formData.jobOfferNoc}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="LMIA编号 / LMIA Number"
                    name="jobOfferLmiaNumber"
                    type="text"
                    value={formData.jobOfferLmiaNumber}
                    onChange={handleFieldChange}
                    required
                    hint="如果工作邀请需要LMIA"
                  />
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">安家资金 / Settlement Funds</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="可用资金金额 / Amount of Funds Available"
                  name="settlementFunds"
                  type="number"
                  value={formData.settlementFunds}
                  onChange={handleFieldChange}
                  required
                  placeholder="例如：20000"
                  hint="您必须证明有足够的资金在加拿大安家"
                />
                
                <FormField
                  label="货币 / Currency"
                  name="settlementFundsCurrency"
                  type="select"
                  value={formData.settlementFundsCurrency}
                  onChange={handleFieldChange}
                  required
                  options={[
                    { value: "CAD", label: "加元 CAD" },
                    { value: "USD", label: "美元 USD" },
                    { value: "CNY", label: "人民币 CNY" },
                    { value: "EUR", label: "欧元 EUR" },
                    { value: "GBP", label: "英镑 GBP" },
                  ]}
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>最低资金要求 (2024年):</strong><br />
                  1人: CAD $14,690 | 2人: CAD $18,288 | 3人: CAD $22,483<br />
                  4人: CAD $27,297 | 5人: CAD $30,690 | 6人: CAD $34,917<br />
                  7人: CAD $38,875 | 每增加1人: CAD $3,958
                </p>
              </div>
            </div>
          </div>
        );

      case 18:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">声明与签名 (Declaration and Signature)</h3>
              <p className="text-sm text-gray-700">请仔细阅读声明并确认您提供的信息真实准确。</p>
            </div>
            
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-gray-900">申请人声明 / Applicant Declaration</h4>
              
              <div className="text-sm text-gray-600 space-y-3">
                <p>I declare that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>I have read and understood all the questions on this application form.</li>
                  <li>The information I have given is true, complete and correct.</li>
                  <li>I understand that misrepresentation is an offence under section 127 of the Immigration and Refugee Protection Act and may result in a finding of inadmissibility to Canada or removal from Canada.</li>
                  <li>I understand that my personal information is collected under the authority of the Immigration and Refugee Protection Act to determine my eligibility for permanent residence in Canada.</li>
                  <li>I consent to the collection, use and disclosure of my personal information as described in this application.</li>
                </ul>
                
                <p className="mt-4">我声明：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>我已阅读并理解本申请表上的所有问题。</li>
                  <li>我提供的信息真实、完整、正确。</li>
                  <li>我理解根据《移民和难民保护法》第127条，虚假陈述是一种违法行为，可能导致被认定为不可入境加拿大或被驱逐出加拿大。</li>
                  <li>我理解根据《移民和难民保护法》收集我的个人信息，以确定我是否有资格成为加拿大永久居民。</li>
                  <li>我同意按照本申请中所述收集、使用和披露我的个人信息。</li>
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="我已阅读并同意以上声明 / I have read and agree to the above declaration"
                name="declarationAgree"
                type="select"
                value={formData.declarationAgree}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是，我同意 Yes, I agree" },
                ]}
              />
              
              <FormField
                label="签名日期 / Date of Signature"
                name="signatureDate"
                type="date"
                value={formData.signatureDate}
                onChange={handleFieldChange}
                required
              />
              
              <FormField
                label="申请人签名 (输入全名) / Applicant Signature (Type Full Name)"
                name="applicantSignature"
                type="text"
                value={formData.applicantSignature}
                onChange={handleFieldChange}
                required
                placeholder="请输入您的全名作为电子签名"
                hint="输入您的全名作为电子签名"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href={applicationsBackHref} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回申请列表
          </a>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Express Entry 技术移民
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Express Entry 永久居民申请
          </h1>
          <p className="text-gray-600">
            IMM 0008 + IMM 5669 + IMM 5406 + EE特有信息
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
                  type: "express-entry",
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
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-medium
                         hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/30"
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

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">IMM 0008</p>
                <p className="text-sm text-gray-500">通用申请表</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">IMM 5669</p>
                <p className="text-sm text-gray-500">背景声明表</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">IMM 5406</p>
                <p className="text-sm text-gray-500">家庭信息表</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpressEntryApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50"><div className="text-center text-gray-600">加载中...</div></div>}>
      <ExpressEntryApplicationPageContent />
    </Suspense>
  );
}
