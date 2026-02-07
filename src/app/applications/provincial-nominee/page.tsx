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
          message: `我正在填写加拿大省提名项目(PNP)申请表格（IMM 0008/IMM 5669/IMM 5406/省级表格），关于"${fieldLabel}"这个字段，${fieldHint ? `官方提示是：${fieldHint}。` : ""}我的问题是：${question}`,
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
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-4">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <button
            onClick={askAI}
            disabled={isLoading || !question.trim()}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-700 hover:to-orange-600 transition-all"
          >
            {isLoading ? "AI 正在思考..." : "询问 AI"}
          </button>
          
          {answer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 flex items-center justify-center text-white text-xs">AI</span>
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
          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
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
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
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
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
          className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function ProvincialNomineeApplicationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 17;
  
  const stepTitles = [
    "省提名信息",
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
    "军事服务 (IMM 5669)",
    "地址历史 (IMM 5669)",
    "家庭信息 (IMM 5406)",
    "声明与签名",
  ];

  const [formData, setFormData] = useState<Record<string, string>>({
    // Provincial Nomination Specific
    pnpProvince: "",
    pnpStream: "",
    pnpCertificateNumber: "",
    pnpIssueDate: "",
    pnpExpiryDate: "",
    pnpCategory: "",
    pnpJobOffer: "",
    pnpEmployerName: "",
    pnpEmployerAddress: "",
    pnpJobTitle: "",
    pnpNocCode: "",
    pnpWageOffered: "",
    pnpWorkLocation: "",
    
    // IMM 0008 - Application Details
    languageCorrespondence: "",
    languageInterview: "",
    interpreterRequired: "",
    intendedProvince: "",
    intendedCity: "",
    
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
    
    // IMM 5669 - Membership and Association
    hasMemberships: "",
    org1From: "",
    org1To: "",
    org1Name: "",
    org1Type: "",
    org1Position: "",
    org1CityCountry: "",
    
    // IMM 5669 - Military Service
    hasMilitaryService: "",
    military1Country: "",
    military1From: "",
    military1To: "",
    military1Branch: "",
    military1Rank: "",
    military1Combat: "",
    military1EndReason: "",
    
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
    
    // IMM 5406 - Family Information
    fatherFamilyName: "",
    fatherGivenNames: "",
    fatherDateOfBirth: "",
    fatherCityOfBirth: "",
    fatherCountryOfBirth: "",
    fatherDateOfDeath: "",
    fatherCurrentAddress: "",
    fatherMaritalStatus: "",
    fatherInCanada: "",
    motherFamilyNameAtBirth: "",
    motherGivenNames: "",
    motherDateOfBirth: "",
    motherCityOfBirth: "",
    motherCountryOfBirth: "",
    motherDateOfDeath: "",
    motherCurrentAddress: "",
    motherMaritalStatus: "",
    motherInCanada: "",
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
    hasSiblings: "",
    sibling1FamilyName: "",
    sibling1GivenNames: "",
    sibling1Relationship: "",
    sibling1DateOfBirth: "",
    sibling1CountryOfBirth: "",
    sibling1MaritalStatus: "",
    sibling1CurrentAddress: "",
    sibling1InCanada: "",
    
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
      type: "provincial-nominee",
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
          type: "provincial-nominee",
          title: "省提名项目申请",
          applicationData: application,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = `/applications/provincial-nominee/review?id=${application.id}&caseId=${data.caseId}`;
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
    window.location.href = `/applications/provincial-nominee/review?id=${application.id}`;
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

  const pnpStreamOptions: Record<string, { value: string; label: string }[]> = {
    ON: [
      { value: "oinp-hcp", label: "人力资本优先类 Human Capital Priorities" },
      { value: "oinp-skilled-trades", label: "技工类 Skilled Trades" },
      { value: "oinp-french-speaking", label: "法语技术工人 French-Speaking Skilled Worker" },
      { value: "oinp-masters", label: "硕士毕业生 Masters Graduate" },
      { value: "oinp-phd", label: "博士毕业生 PhD Graduate" },
      { value: "oinp-employer-job-offer", label: "雇主担保 Employer Job Offer" },
      { value: "oinp-international-student", label: "国际学生 International Student" },
      { value: "oinp-in-demand-skills", label: "紧缺技能 In-Demand Skills" },
    ],
    BC: [
      { value: "bcpnp-skilled-worker", label: "技术工人 Skilled Worker" },
      { value: "bcpnp-healthcare", label: "医疗保健专业人员 Healthcare Professional" },
      { value: "bcpnp-international-graduate", label: "国际毕业生 International Graduate" },
      { value: "bcpnp-international-post-graduate", label: "国际研究生 International Post-Graduate" },
      { value: "bcpnp-entry-level", label: "入门级和半熟练工人 Entry Level and Semi-Skilled" },
      { value: "bcpnp-entrepreneur", label: "企业家移民 Entrepreneur Immigration" },
    ],
    AB: [
      { value: "aaip-alberta-opportunity", label: "阿尔伯塔机会类 Alberta Opportunity Stream" },
      { value: "aaip-alberta-express-entry", label: "阿尔伯塔快速通道 Alberta Express Entry" },
      { value: "aaip-rural-renewal", label: "农村更新类 Rural Renewal Stream" },
      { value: "aaip-graduate-entrepreneur", label: "毕业生企业家 Graduate Entrepreneur Stream" },
      { value: "aaip-farm-stream", label: "农场类 Farm Stream" },
    ],
    SK: [
      { value: "sinp-international-skilled-worker", label: "国际技术工人 International Skilled Worker" },
      { value: "sinp-employment-offer", label: "雇主担保 Employment Offer" },
      { value: "sinp-occupation-in-demand", label: "紧缺职业 Occupation In-Demand" },
      { value: "sinp-express-entry", label: "快速通道 Express Entry" },
      { value: "sinp-hard-to-fill", label: "难以填补技能试点 Hard-to-Fill Skills Pilot" },
      { value: "sinp-health-talent", label: "医疗人才 Health Talent" },
      { value: "sinp-tech-talent", label: "科技人才 Tech Talent" },
      { value: "sinp-entrepreneur", label: "企业家 Entrepreneur" },
      { value: "sinp-farm", label: "农场主 Farm Owner/Operator" },
    ],
    MB: [
      { value: "mpnp-skilled-worker-overseas", label: "海外技术工人 Skilled Worker Overseas" },
      { value: "mpnp-skilled-worker-in-manitoba", label: "曼省技术工人 Skilled Worker in Manitoba" },
      { value: "mpnp-international-education", label: "国际教育 International Education Stream" },
      { value: "mpnp-business-investor", label: "商业投资 Business Investor Stream" },
    ],
    NS: [
      { value: "nsnp-nova-scotia-experience", label: "新斯科舍经验类 Nova Scotia Experience" },
      { value: "nsnp-skilled-worker", label: "技术工人 Skilled Worker" },
      { value: "nsnp-labour-market-priorities", label: "劳动力市场优先 Labour Market Priorities" },
      { value: "nsnp-physician", label: "医生 Physician" },
      { value: "nsnp-entrepreneur", label: "企业家 Entrepreneur" },
      { value: "nsnp-international-graduate-entrepreneur", label: "国际毕业生企业家 International Graduate Entrepreneur" },
    ],
    NB: [
      { value: "nbpnp-skilled-worker-with-employer-support", label: "雇主支持技术工人 Skilled Worker with Employer Support" },
      { value: "nbpnp-express-entry", label: "快速通道 Express Entry Labour Market" },
      { value: "nbpnp-post-graduate-entrepreneurial", label: "研究生企业家 Post-Graduate Entrepreneurial" },
      { value: "nbpnp-entrepreneurial", label: "企业家 Entrepreneurial Stream" },
      { value: "nbpnp-strategic-initiative", label: "战略倡议 Strategic Initiative" },
    ],
    PE: [
      { value: "peipnp-labour-impact", label: "劳动力影响类 Labour Impact" },
      { value: "peipnp-express-entry", label: "快速通道 Express Entry" },
      { value: "peipnp-business-impact", label: "商业影响类 Business Impact" },
    ],
    NL: [
      { value: "nlpnp-express-entry-skilled-worker", label: "快速通道技术工人 Express Entry Skilled Worker" },
      { value: "nlpnp-skilled-worker", label: "技术工人 Skilled Worker" },
      { value: "nlpnp-international-graduate", label: "国际毕业生 International Graduate" },
      { value: "nlpnp-international-graduate-entrepreneur", label: "国际毕业生企业家 International Graduate Entrepreneur" },
      { value: "nlpnp-international-entrepreneur", label: "国际企业家 International Entrepreneur" },
    ],
    YT: [
      { value: "ynp-skilled-worker", label: "技术工人 Skilled Worker" },
      { value: "ynp-critical-impact-worker", label: "关键影响工人 Critical Impact Worker" },
      { value: "ynp-business-nominee", label: "商业提名 Business Nominee" },
      { value: "ynp-express-entry", label: "快速通道 Express Entry" },
    ],
    NT: [
      { value: "ntnp-employer-driven", label: "雇主驱动 Employer Driven" },
      { value: "ntnp-express-entry", label: "快速通道 Express Entry" },
      { value: "ntnp-business", label: "商业 Business Stream" },
      { value: "ntnp-francophone", label: "法语 Francophone Stream" },
    ],
    NU: [
      { value: "nunp-employer-driven", label: "雇主驱动 Employer Driven" },
    ],
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-orange-800 mb-2">省提名信息 (Provincial Nomination Details)</h3>
              <p className="text-sm text-orange-700">请填写您的省提名证书信息。您必须先获得省提名才能提交联邦申请。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="提名省份 / Nominating Province"
                name="pnpProvince"
                type="select"
                value={formData.pnpProvince}
                onChange={handleFieldChange}
                required
                options={provinceOptions}
                hint="选择向您发出省提名的省份"
              />
              
              {formData.pnpProvince && pnpStreamOptions[formData.pnpProvince] && (
                <FormField
                  label="提名类别 / Nomination Stream"
                  name="pnpStream"
                  type="select"
                  value={formData.pnpStream}
                  onChange={handleFieldChange}
                  required
                  options={pnpStreamOptions[formData.pnpProvince]}
                  hint="选择您获得提名的具体类别"
                />
              )}
              
              <FormField
                label="提名证书编号 / Certificate Number"
                name="pnpCertificateNumber"
                type="text"
                value={formData.pnpCertificateNumber}
                onChange={handleFieldChange}
                required
                placeholder="如证书所示"
                hint="省提名证书上的编号"
              />
              
              <FormField
                label="证书签发日期 / Certificate Issue Date"
                name="pnpIssueDate"
                type="date"
                value={formData.pnpIssueDate}
                onChange={handleFieldChange}
                required
              />
              
              <FormField
                label="证书到期日期 / Certificate Expiry Date"
                name="pnpExpiryDate"
                type="date"
                value={formData.pnpExpiryDate}
                onChange={handleFieldChange}
                required
                hint="省提名证书通常有效期为6个月"
              />
              
              <FormField
                label="提名类别 / Nomination Category"
                name="pnpCategory"
                type="select"
                value={formData.pnpCategory}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "skilled-worker", label: "技术工人 Skilled Worker" },
                  { value: "international-graduate", label: "国际毕业生 International Graduate" },
                  { value: "semi-skilled", label: "半技术工人 Semi-Skilled Worker" },
                  { value: "business", label: "商业/企业家 Business/Entrepreneur" },
                  { value: "family", label: "家庭类 Family" },
                  { value: "other", label: "其他 Other" },
                ]}
              />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">工作邀请信息 (如适用) / Job Offer Information (if applicable)</h4>
              <FormField
                label="是否有工作邀请 / Do you have a job offer?"
                name="pnpJobOffer"
                type="select"
                value={formData.pnpJobOffer}
                onChange={handleFieldChange}
                required
                options={[
                  { value: "yes", label: "是 Yes" },
                  { value: "no", label: "否 No" },
                ]}
              />
              
              {formData.pnpJobOffer === "yes" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <FormField
                    label="雇主名称 / Employer Name"
                    name="pnpEmployerName"
                    type="text"
                    value={formData.pnpEmployerName}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="雇主地址 / Employer Address"
                    name="pnpEmployerAddress"
                    type="text"
                    value={formData.pnpEmployerAddress}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="职位名称 / Job Title"
                    name="pnpJobTitle"
                    type="text"
                    value={formData.pnpJobTitle}
                    onChange={handleFieldChange}
                    required
                  />
                  
                  <FormField
                    label="NOC代码 / NOC Code"
                    name="pnpNocCode"
                    type="text"
                    value={formData.pnpNocCode}
                    onChange={handleFieldChange}
                    required
                    placeholder="例如：21231"
                  />
                  
                  <FormField
                    label="提供的工资 / Wage Offered"
                    name="pnpWageOffered"
                    type="text"
                    value={formData.pnpWageOffered}
                    onChange={handleFieldChange}
                    required
                    placeholder="例如：$75,000/year"
                  />
                  
                  <FormField
                    label="工作地点 / Work Location"
                    name="pnpWorkLocation"
                    type="text"
                    value={formData.pnpWorkLocation}
                    onChange={handleFieldChange}
                    required
                    placeholder="城市, 省份"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
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
              />
              
              <FormField
                label="计划居住省份 / Province/Territory"
                name="intendedProvince"
                type="select"
                value={formData.intendedProvince || formData.pnpProvince}
                onChange={handleFieldChange}
                required
                options={provinceOptions}
                hint="通常应与省提名省份一致"
              />
              
              <FormField
                label="计划居住城市 / City/Town"
                name="intendedCity"
                type="text"
                value={formData.intendedCity}
                onChange={handleFieldChange}
                required
                placeholder="例如：Toronto"
              />
            </div>
          </div>
        );

      case 3:
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
              />
              
              <FormField
                label="名 / Given Name(s)"
                name="givenNames"
                type="text"
                value={formData.givenNames}
                onChange={handleFieldChange}
                required
                placeholder="如护照所示"
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
              />
              
              <FormField
                label="出生城市 / City/Town of Birth"
                name="cityOfBirth"
                type="text"
                value={formData.cityOfBirth}
                onChange={handleFieldChange}
                required
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
              
              <FormField
                label="当前居住国 / Current Country of Residence"
                name="currentCountryOfResidence"
                type="select"
                value={formData.currentCountryOfResidence}
                onChange={handleFieldChange}
                required
                options={countryOptions}
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
              />
              
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
        );

      // Steps 4-16 follow similar patterns to Express Entry
      // For brevity, I'll include key steps and simplify others
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 联系方式 (Contact Information)</h3>
              <p className="text-sm text-red-700">请填写您的邮寄地址和联系电话。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="邮政信箱 / P.O. Box" name="poBox" type="text" value={formData.poBox} onChange={handleFieldChange} />
              <FormField label="公寓/单元号 / Apt/Unit" name="aptUnit" type="text" value={formData.aptUnit} onChange={handleFieldChange} />
              <FormField label="街道号码 / Street Number" name="streetNumber" type="text" value={formData.streetNumber} onChange={handleFieldChange} required />
              <FormField label="街道名称 / Street Name" name="streetName" type="text" value={formData.streetName} onChange={handleFieldChange} required />
              <FormField label="城市 / City/Town" name="city" type="text" value={formData.city} onChange={handleFieldChange} required />
              <FormField label="国家 / Country" name="country" type="select" value={formData.country} onChange={handleFieldChange} required options={countryOptions} />
              <FormField label="省/州 / Province/State" name="provinceState" type="text" value={formData.provinceState} onChange={handleFieldChange} required />
              <FormField label="邮政编码 / Postal Code" name="postalCode" type="text" value={formData.postalCode} onChange={handleFieldChange} required />
              <FormField label="电子邮箱 / Email Address" name="email" type="email" value={formData.email} onChange={handleFieldChange} required />
              <FormField label="电话类型 / Phone Type" name="phoneType" type="select" value={formData.phoneType} onChange={handleFieldChange} required options={[{ value: "home", label: "住宅 Home" }, { value: "cellular", label: "手机 Cellular" }, { value: "business", label: "工作 Business" }]} />
              <FormField label="国家代码 / Country Code" name="phoneCountryCode" type="text" value={formData.phoneCountryCode} onChange={handleFieldChange} required placeholder="例如：86" />
              <FormField label="电话号码 / Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleFieldChange} required />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 护照信息 (Passport)</h3>
              <p className="text-sm text-red-700">请填写您当前有效护照的信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="护照号码 / Passport Number" name="passportNumber" type="text" value={formData.passportNumber} onChange={handleFieldChange} required />
              <FormField label="签发国家 / Country of Issue" name="passportCountry" type="select" value={formData.passportCountry} onChange={handleFieldChange} required options={countryOptions} />
              <FormField label="签发日期 / Issue Date" name="passportIssueDate" type="date" value={formData.passportIssueDate} onChange={handleFieldChange} required />
              <FormField label="到期日期 / Expiry Date" name="passportExpiryDate" type="date" value={formData.passportExpiryDate} onChange={handleFieldChange} required />
              <FormField label="台湾护照带身份证号 / Taiwan passport with ID?" name="taiwanPassportWithId" type="select" value={formData.taiwanPassportWithId} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }, { value: "na", label: "不适用 N/A" }]} />
              <FormField label="以色列护照 / Israeli passport?" name="israeliPassport" type="select" value={formData.israeliPassport} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 身份证件 (National Identity Document)</h3>
              <p className="text-sm text-red-700">如果您有国民身份证，请填写相关信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="是否有国民身份证 / Do you have a national ID?" name="hasNationalId" type="select" value={formData.hasNationalId} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
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
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 教育与职业 (Education/Occupation)</h3>
              <p className="text-sm text-red-700">请填写您的最高学历和职业信息。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="最高学历 / Highest Level of Education" name="highestEducation" type="select" value={formData.highestEducation} onChange={handleFieldChange} required options={educationOptions} />
              <FormField label="受教育年数 / Total Years of Study" name="yearsOfStudy" type="number" value={formData.yearsOfStudy} onChange={handleFieldChange} required placeholder="例如：16" />
              <FormField label="当前职业 / Current Occupation" name="currentOccupation" type="text" value={formData.currentOccupation} onChange={handleFieldChange} required />
              <FormField label="计划职业 / Intended Occupation" name="intendedOccupation" type="text" value={formData.intendedOccupation} onChange={handleFieldChange} required />
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 语言能力 (Language Details)</h3>
              <p className="text-sm text-red-700">请填写您的语言能力和语言测试成绩。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="母语 / Native Language" name="nativeLanguage" type="select" value={formData.nativeLanguage} onChange={handleFieldChange} required options={[{ value: "chinese", label: "中文 Chinese" }, { value: "english", label: "英语 English" }, { value: "french", label: "法语 French" }, { value: "other", label: "其他 Other" }]} />
              <FormField label="英语流利程度 / English Fluency" name="englishFluency" type="select" value={formData.englishFluency} onChange={handleFieldChange} required options={[{ value: "native", label: "母语 Native" }, { value: "fluent", label: "流利 Fluent" }, { value: "moderate", label: "中等 Moderate" }, { value: "basic", label: "基础 Basic" }, { value: "none", label: "不会 None" }]} />
              <FormField label="法语流利程度 / French Fluency" name="frenchFluency" type="select" value={formData.frenchFluency} onChange={handleFieldChange} required options={[{ value: "native", label: "母语 Native" }, { value: "fluent", label: "流利 Fluent" }, { value: "moderate", label: "中等 Moderate" }, { value: "basic", label: "基础 Basic" }, { value: "none", label: "不会 None" }]} />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">英语测试成绩 / English Test Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="测试类型 / Test Type" name="englishTestType" type="select" value={formData.englishTestType} onChange={handleFieldChange} options={[{ value: "", label: "无 None" }, { value: "ielts", label: "IELTS General Training" }, { value: "celpip", label: "CELPIP General" }, { value: "pte", label: "PTE Core" }]} />
                {formData.englishTestType && (
                  <>
                    <FormField label="测试日期 / Test Date" name="englishTestDate" type="date" value={formData.englishTestDate} onChange={handleFieldChange} required />
                    <FormField label="听力 / Listening" name="englishListening" type="text" value={formData.englishListening} onChange={handleFieldChange} required />
                    <FormField label="阅读 / Reading" name="englishReading" type="text" value={formData.englishReading} onChange={handleFieldChange} required />
                    <FormField label="写作 / Writing" name="englishWriting" type="text" value={formData.englishWriting} onChange={handleFieldChange} required />
                    <FormField label="口语 / Speaking" name="englishSpeaking" type="text" value={formData.englishSpeaking} onChange={handleFieldChange} required />
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">IMM 0008 - 随行家属 (Dependants)</h3>
              <p className="text-sm text-red-700">请填写将与您一同移民的家属信息。</p>
            </div>
            
            <FormField label="是否有随行家属 / Do you have dependants?" name="hasDependants" type="select" value={formData.hasDependants} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
            
            {formData.hasDependants === "yes" && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">家属1 / Dependant 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="关系 / Relationship" name="dependant1Relationship" type="select" value={formData.dependant1Relationship} onChange={handleFieldChange} required options={[{ value: "spouse", label: "配偶 Spouse" }, { value: "commonLawPartner", label: "同居伴侣 Common-law Partner" }, { value: "dependentChild", label: "受抚养子女 Dependent Child" }]} />
                  <FormField label="姓 / Family Name" name="dependant1FamilyName" type="text" value={formData.dependant1FamilyName} onChange={handleFieldChange} required />
                  <FormField label="名 / Given Name(s)" name="dependant1GivenNames" type="text" value={formData.dependant1GivenNames} onChange={handleFieldChange} required />
                  <FormField label="性别 / Sex" name="dependant1Sex" type="select" value={formData.dependant1Sex} onChange={handleFieldChange} required options={[{ value: "F", label: "女 Female" }, { value: "M", label: "男 Male" }, { value: "X", label: "其他 X" }]} />
                  <FormField label="出生日期 / Date of Birth" name="dependant1DateOfBirth" type="date" value={formData.dependant1DateOfBirth} onChange={handleFieldChange} required />
                  <FormField label="出生国家 / Country of Birth" name="dependant1CountryOfBirth" type="select" value={formData.dependant1CountryOfBirth} onChange={handleFieldChange} required options={countryOptions} />
                  <FormField label="国籍 / Citizenship" name="dependant1Citizenship" type="select" value={formData.dependant1Citizenship} onChange={handleFieldChange} required options={countryOptions} />
                  <FormField label="婚姻状况 / Marital Status" name="dependant1MaritalStatus" type="select" value={formData.dependant1MaritalStatus} onChange={handleFieldChange} required options={maritalStatusOptions} />
                  <FormField label="是否随行 / Accompanying?" name="dependant1Accompanying" type="select" value={formData.dependant1Accompanying} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
                </div>
              </div>
            )}
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 背景问题 (Background Questions)</h3>
              <p className="text-sm text-amber-700">请如实回答以下背景问题。</p>
            </div>
            
            <div className="space-y-4">
              {[
                { key: "criminalConviction", label: "是否有犯罪记录？/ Criminal conviction?" },
                { key: "currentlyCharged", label: "是否正在被起诉？/ Currently charged?" },
                { key: "previousRefugee", label: "是否曾申请难民？/ Previous refugee claim?" },
                { key: "previousRefusal", label: "是否曾被拒签？/ Previous refusal?" },
                { key: "previousDeportation", label: "是否曾被驱逐？/ Previous deportation?" },
                { key: "warCrimes", label: "是否参与过战争罪？/ War crimes?" },
                { key: "armedStruggle", label: "是否参与过武装斗争？/ Armed struggle?" },
                { key: "associatedWithViolence", label: "是否与暴力组织有关联？/ Associated with violence?" },
                { key: "criminalOrganization", label: "是否是犯罪组织成员？/ Criminal organization?" },
                { key: "detained", label: "是否曾被拘留？/ Ever detained?" },
                { key: "healthCondition", label: "是否有健康问题？/ Health condition?" },
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
          </div>
        );

      case 11:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 教育历史 (Education History)</h3>
              <p className="text-sm text-amber-700">请填写您的教育经历。</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <FormField label="小学年数 / Elementary" name="elementaryYears" type="number" value={formData.elementaryYears} onChange={handleFieldChange} required />
              <FormField label="中学年数 / Secondary" name="secondaryYears" type="number" value={formData.secondaryYears} onChange={handleFieldChange} required />
              <FormField label="大学年数 / University" name="universityYears" type="number" value={formData.universityYears} onChange={handleFieldChange} required />
              <FormField label="职校年数 / Trade School" name="tradeSchoolYears" type="number" value={formData.tradeSchoolYears} onChange={handleFieldChange} />
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">教育经历1 / Education 1</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="开始 / From" name="edu1From" type="text" value={formData.edu1From} onChange={handleFieldChange} required placeholder="YYYY-MM" />
                <FormField label="结束 / To" name="edu1To" type="text" value={formData.edu1To} onChange={handleFieldChange} required placeholder="YYYY-MM" />
                <FormField label="学校 / Institution" name="edu1Institution" type="text" value={formData.edu1Institution} onChange={handleFieldChange} required />
                <FormField label="地点 / City, Country" name="edu1CityCountry" type="text" value={formData.edu1CityCountry} onChange={handleFieldChange} required />
                <FormField label="证书 / Certificate" name="edu1Certificate" type="text" value={formData.edu1Certificate} onChange={handleFieldChange} required />
                <FormField label="专业 / Field of Study" name="edu1FieldOfStudy" type="text" value={formData.edu1FieldOfStudy} onChange={handleFieldChange} required />
              </div>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 个人历史 (Personal History)</h3>
              <p className="text-sm text-amber-700">请填写过去10年的个人历史，不能有任何时间空白。</p>
            </div>
            
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">历史记录 {num} / History {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="开始 / From" name={`history${num}From`} type="text" value={formData[`history${num}From`]} onChange={handleFieldChange} required={num <= 2} placeholder="YYYY-MM" />
                  <FormField label="结束 / To" name={`history${num}To`} type="text" value={formData[`history${num}To`]} onChange={handleFieldChange} required={num <= 2} placeholder="YYYY-MM or Present" />
                  <FormField label="活动 / Activity" name={`history${num}Activity`} type="select" value={formData[`history${num}Activity`]} onChange={handleFieldChange} required={num <= 2} options={[{ value: "", label: "请选择" }, { value: "employed", label: "就业 Employed" }, { value: "selfEmployed", label: "自雇 Self-employed" }, { value: "unemployed", label: "失业 Unemployed" }, { value: "student", label: "学生 Student" }, { value: "retired", label: "退休 Retired" }, { value: "other", label: "其他 Other" }]} />
                  <FormField label="地点 / City, Country" name={`history${num}CityCountry`} type="text" value={formData[`history${num}CityCountry`]} onChange={handleFieldChange} required={num <= 2} />
                  <FormField label="身份 / Status" name={`history${num}Status`} type="select" value={formData[`history${num}Status`]} onChange={handleFieldChange} required={num <= 2} options={[{ value: "", label: "请选择" }, { value: "citizen", label: "公民 Citizen" }, { value: "permanentResident", label: "永久居民 PR" }, { value: "workVisa", label: "工签 Work Visa" }, { value: "studentVisa", label: "学签 Student Visa" }, { value: "visitor", label: "访客 Visitor" }, { value: "other", label: "其他 Other" }]} />
                  <FormField label="雇主/学校 / Employer/School" name={`history${num}Employer`} type="text" value={formData[`history${num}Employer`]} onChange={handleFieldChange} required={num <= 2} />
                </div>
              </div>
            ))}
          </div>
        );

      case 13:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 组织会员 (Membership)</h3>
              <p className="text-sm text-amber-700">请列出您曾参加的所有组织。</p>
            </div>
            
            <FormField label="是否有组织会员经历 / Have you been a member of any organizations?" name="hasMemberships" type="select" value={formData.hasMemberships} onChange={handleFieldChange} required options={[{ value: "no", label: "否 No" }, { value: "yes", label: "是 Yes" }]} />
            
            {formData.hasMemberships === "yes" && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">组织1 / Organization 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="开始 / From" name="org1From" type="text" value={formData.org1From} onChange={handleFieldChange} required placeholder="YYYY-MM" />
                  <FormField label="结束 / To" name="org1To" type="text" value={formData.org1To} onChange={handleFieldChange} required placeholder="YYYY-MM or Present" />
                  <FormField label="名称 / Name" name="org1Name" type="text" value={formData.org1Name} onChange={handleFieldChange} required />
                  <FormField label="类型 / Type" name="org1Type" type="select" value={formData.org1Type} onChange={handleFieldChange} required options={[{ value: "professional", label: "专业协会 Professional" }, { value: "tradeUnion", label: "工会 Trade Union" }, { value: "political", label: "政治 Political" }, { value: "social", label: "社会 Social" }, { value: "student", label: "学生 Student" }, { value: "other", label: "其他 Other" }]} />
                  <FormField label="职位 / Position" name="org1Position" type="text" value={formData.org1Position} onChange={handleFieldChange} required />
                  <FormField label="地点 / City, Country" name="org1CityCountry" type="text" value={formData.org1CityCountry} onChange={handleFieldChange} required />
                </div>
              </div>
            )}
          </div>
        );

      case 14:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 军事服务 (Military Service)</h3>
              <p className="text-sm text-amber-700">请填写您的军事服务经历。</p>
            </div>
            
            <FormField label="是否有军事服务经历 / Have you served in the military?" name="hasMilitaryService" type="select" value={formData.hasMilitaryService} onChange={handleFieldChange} required options={[{ value: "no", label: "否 No" }, { value: "yes", label: "是 Yes" }]} />
            
            {formData.hasMilitaryService === "yes" && (
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">军事服务1 / Military Service 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="国家 / Country" name="military1Country" type="select" value={formData.military1Country} onChange={handleFieldChange} required options={countryOptions} />
                  <FormField label="开始 / From" name="military1From" type="text" value={formData.military1From} onChange={handleFieldChange} required placeholder="YYYY-MM" />
                  <FormField label="结束 / To" name="military1To" type="text" value={formData.military1To} onChange={handleFieldChange} required placeholder="YYYY-MM" />
                  <FormField label="分支 / Branch" name="military1Branch" type="text" value={formData.military1Branch} onChange={handleFieldChange} required />
                  <FormField label="军衔 / Rank" name="military1Rank" type="text" value={formData.military1Rank} onChange={handleFieldChange} required />
                  <FormField label="实战 / Combat" name="military1Combat" type="text" value={formData.military1Combat} onChange={handleFieldChange} placeholder="None 或详情" />
                  <FormField label="结束原因 / End Reason" name="military1EndReason" type="text" value={formData.military1EndReason} onChange={handleFieldChange} required />
                </div>
              </div>
            )}
          </div>
        );

      case 15:
        return (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-800 mb-2">IMM 5669 - 地址历史 (Address History)</h3>
              <p className="text-sm text-amber-700">请列出过去10年的所有居住地址。</p>
            </div>
            
            {[1, 2].map((num) => (
              <div key={num} className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">地址 {num} / Address {num}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="开始 / From" name={`addr${num}From`} type="text" value={formData[`addr${num}From`]} onChange={handleFieldChange} required={num === 1} placeholder="YYYY-MM" />
                  <FormField label="结束 / To" name={`addr${num}To`} type="text" value={formData[`addr${num}To`]} onChange={handleFieldChange} required={num === 1} placeholder="YYYY-MM or Present" />
                  <FormField label="街道 / Street" name={`addr${num}Street`} type="text" value={formData[`addr${num}Street`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="城市 / City" name={`addr${num}City`} type="text" value={formData[`addr${num}City`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="省份 / Province" name={`addr${num}Province`} type="text" value={formData[`addr${num}Province`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="邮编 / Postal Code" name={`addr${num}PostalCode`} type="text" value={formData[`addr${num}PostalCode`]} onChange={handleFieldChange} required={num === 1} />
                  <FormField label="国家 / Country" name={`addr${num}Country`} type="select" value={formData[`addr${num}Country`]} onChange={handleFieldChange} required={num === 1} options={countryOptions} />
                </div>
              </div>
            ))}
          </div>
        );

      case 16:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">IMM 5406 - 家庭信息 (Family Information)</h3>
              <p className="text-sm text-green-700">请填写您的父母、子女和兄弟姐妹信息。</p>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">父亲信息 / Father</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="姓 / Family Name" name="fatherFamilyName" type="text" value={formData.fatherFamilyName} onChange={handleFieldChange} required />
                <FormField label="名 / Given Name(s)" name="fatherGivenNames" type="text" value={formData.fatherGivenNames} onChange={handleFieldChange} required />
                <FormField label="出生日期 / Date of Birth" name="fatherDateOfBirth" type="date" value={formData.fatherDateOfBirth} onChange={handleFieldChange} required />
                <FormField label="出生国家 / Country of Birth" name="fatherCountryOfBirth" type="select" value={formData.fatherCountryOfBirth} onChange={handleFieldChange} required options={countryOptions} />
                <FormField label="现居地址 / Current Address" name="fatherCurrentAddress" type="text" value={formData.fatherCurrentAddress} onChange={handleFieldChange} required placeholder="地址或 Deceased" />
                <FormField label="婚姻状况 / Marital Status" name="fatherMaritalStatus" type="select" value={formData.fatherMaritalStatus} onChange={handleFieldChange} required options={maritalStatusOptions} />
                <FormField label="是否在加拿大 / In Canada?" name="fatherInCanada" type="select" value={formData.fatherInCanada} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">母亲信息 / Mother</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="出生时姓 / Family Name at Birth" name="motherFamilyNameAtBirth" type="text" value={formData.motherFamilyNameAtBirth} onChange={handleFieldChange} required />
                <FormField label="名 / Given Name(s)" name="motherGivenNames" type="text" value={formData.motherGivenNames} onChange={handleFieldChange} required />
                <FormField label="出生日期 / Date of Birth" name="motherDateOfBirth" type="date" value={formData.motherDateOfBirth} onChange={handleFieldChange} required />
                <FormField label="出生国家 / Country of Birth" name="motherCountryOfBirth" type="select" value={formData.motherCountryOfBirth} onChange={handleFieldChange} required options={countryOptions} />
                <FormField label="现居地址 / Current Address" name="motherCurrentAddress" type="text" value={formData.motherCurrentAddress} onChange={handleFieldChange} required placeholder="地址或 Deceased" />
                <FormField label="婚姻状况 / Marital Status" name="motherMaritalStatus" type="select" value={formData.motherMaritalStatus} onChange={handleFieldChange} required options={maritalStatusOptions} />
                <FormField label="是否在加拿大 / In Canada?" name="motherInCanada" type="select" value={formData.motherInCanada} onChange={handleFieldChange} required options={[{ value: "yes", label: "是 Yes" }, { value: "no", label: "否 No" }]} />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <FormField label="是否有子女 / Do you have children?" name="hasChildren" type="select" value={formData.hasChildren} onChange={handleFieldChange} required options={[{ value: "no", label: "否 No" }, { value: "yes", label: "是 Yes" }]} />
            </div>
            
            <div className="border-t pt-6">
              <FormField label="是否有兄弟姐妹 / Do you have siblings?" name="hasSiblings" type="select" value={formData.hasSiblings} onChange={handleFieldChange} required options={[{ value: "no", label: "否 No" }, { value: "yes", label: "是 Yes" }]} />
            </div>
          </div>
        );

      case 17:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">声明与签名 (Declaration and Signature)</h3>
              <p className="text-sm text-gray-700">请仔细阅读声明并确认您提供的信息真实准确。</p>
            </div>
            
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-gray-900">申请人声明 / Applicant Declaration</h4>
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            省提名项目 PNP
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            省提名永久居民申请
          </h1>
          <p className="text-gray-600">
            省提名信息 + IMM 0008 + IMM 5669 + IMM 5406
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

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg font-medium
                         hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">省提名</p>
                <p className="text-sm text-gray-500">PNP Certificate</p>
              </div>
            </div>
          </div>
          
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
