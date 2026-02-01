"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Application } from "@/types/application";

// 字段分组配置
const fieldGroups = [
  {
    title: "省提名信息 (Provincial Nomination)",
    color: "orange",
    fields: [
      { key: "pnpProvince", label: "提名省份" },
      { key: "pnpStream", label: "提名类别" },
      { key: "pnpCertificateNumber", label: "证书编号" },
      { key: "pnpIssueDate", label: "签发日期" },
      { key: "pnpExpiryDate", label: "到期日期" },
      { key: "pnpCategory", label: "提名类别" },
      { key: "pnpJobOffer", label: "是否有工作邀请" },
      { key: "pnpEmployerName", label: "雇主名称" },
      { key: "pnpEmployerAddress", label: "雇主地址" },
      { key: "pnpJobTitle", label: "职位名称" },
      { key: "pnpNocCode", label: "NOC代码" },
      { key: "pnpWageOffered", label: "提供的工资" },
      { key: "pnpWorkLocation", label: "工作地点" },
    ],
  },
  {
    title: "申请详情 (IMM 0008)",
    color: "red",
    fields: [
      { key: "languageCorrespondence", label: "通信语言偏好" },
      { key: "languageInterview", label: "面试语言偏好" },
      { key: "interpreterRequired", label: "是否需要翻译" },
      { key: "intendedProvince", label: "计划居住省份" },
      { key: "intendedCity", label: "计划居住城市" },
    ],
  },
  {
    title: "个人信息 (IMM 0008)",
    color: "red",
    fields: [
      { key: "familyName", label: "姓" },
      { key: "givenNames", label: "名" },
      { key: "usedOtherName", label: "是否曾用其他名字" },
      { key: "otherFamilyName", label: "曾用姓" },
      { key: "otherGivenNames", label: "曾用名" },
      { key: "sex", label: "性别" },
      { key: "eyeColour", label: "眼睛颜色" },
      { key: "height", label: "身高" },
      { key: "dateOfBirth", label: "出生日期" },
      { key: "placeOfBirth", label: "出生地点" },
      { key: "countryOfBirth", label: "出生国家" },
      { key: "citizenship", label: "国籍" },
      { key: "secondCitizenship", label: "第二国籍" },
      { key: "currentCountry", label: "现居国家" },
      { key: "immigrationStatus", label: "移民身份" },
      { key: "statusFromDate", label: "身份起始日期" },
      { key: "statusToDate", label: "身份到期日期" },
      { key: "previousCountry", label: "之前居住国家" },
      { key: "previousStatus", label: "之前身份" },
      { key: "previousFromDate", label: "之前身份起始" },
      { key: "previousToDate", label: "之前身份到期" },
      { key: "maritalStatus", label: "婚姻状况" },
      { key: "marriageDate", label: "结婚日期" },
      { key: "spouseName", label: "配偶姓名" },
    ],
  },
  {
    title: "联系信息 (IMM 0008)",
    color: "red",
    fields: [
      { key: "currentAddress", label: "现居地址" },
      { key: "currentCity", label: "城市" },
      { key: "currentProvince", label: "省/州" },
      { key: "currentPostalCode", label: "邮编" },
      { key: "currentCountryAddress", label: "国家" },
      { key: "mailingAddress", label: "邮寄地址" },
      { key: "mailingCity", label: "邮寄城市" },
      { key: "mailingProvince", label: "邮寄省/州" },
      { key: "mailingPostalCode", label: "邮寄邮编" },
      { key: "mailingCountry", label: "邮寄国家" },
      { key: "phoneNumber", label: "电话号码" },
      { key: "altPhoneNumber", label: "备用电话" },
      { key: "email", label: "电子邮箱" },
    ],
  },
  {
    title: "护照信息 (IMM 0008)",
    color: "red",
    fields: [
      { key: "passportNumber", label: "护照号码" },
      { key: "passportCountry", label: "签发国家" },
      { key: "passportIssueDate", label: "签发日期" },
      { key: "passportExpiryDate", label: "到期日期" },
      { key: "taiwanIdNumber", label: "台湾身份证号" },
      { key: "israelIdNumber", label: "以色列身份证号" },
      { key: "usPrCardNumber", label: "美国绿卡号" },
    ],
  },
  {
    title: "教育背景 (IMM 0008)",
    color: "red",
    fields: [
      { key: "educationLevel", label: "最高学历" },
      { key: "educationYears", label: "受教育年数" },
      { key: "educationHistory", label: "教育经历详情" },
    ],
  },
  {
    title: "语言能力 (IMM 0008)",
    color: "red",
    fields: [
      { key: "nativeLanguage", label: "母语" },
      { key: "englishFluency", label: "英语流利程度" },
      { key: "frenchFluency", label: "法语流利程度" },
      { key: "languageTest", label: "语言考试类型" },
      { key: "languageTestDate", label: "考试日期" },
      { key: "listeningScore", label: "听力分数" },
      { key: "readingScore", label: "阅读分数" },
      { key: "writingScore", label: "写作分数" },
      { key: "speakingScore", label: "口语分数" },
    ],
  },
  {
    title: "工作经历 (IMM 0008)",
    color: "red",
    fields: [
      { key: "currentOccupation", label: "当前职业" },
      { key: "intendedOccupation", label: "计划职业" },
      { key: "employmentHistory", label: "工作经历详情" },
    ],
  },
  {
    title: "背景声明 (IMM 0008)",
    color: "red",
    fields: [
      { key: "medicalCondition", label: "是否有健康问题" },
      { key: "criminalRecord", label: "是否有犯罪记录" },
      { key: "previousRefusal", label: "是否曾被拒签" },
      { key: "previousDeportation", label: "是否曾被驱逐" },
      { key: "militaryService", label: "是否有军队服役" },
      { key: "governmentPosition", label: "是否担任过政府职务" },
    ],
  },
  {
    title: "家庭成员 (IMM 5406)",
    color: "blue",
    fields: [
      { key: "spouseFamilyName", label: "配偶姓" },
      { key: "spouseGivenNames", label: "配偶名" },
      { key: "spouseDob", label: "配偶出生日期" },
      { key: "spouseBirthplace", label: "配偶出生地" },
      { key: "spouseRelationship", label: "与配偶关系" },
      { key: "spouseAccompanying", label: "配偶是否随行" },
      { key: "spouseAddress", label: "配偶地址" },
      { key: "childrenInfo", label: "子女信息" },
      { key: "motherName", label: "母亲姓名" },
      { key: "motherDob", label: "母亲出生日期" },
      { key: "motherBirthplace", label: "母亲出生地" },
      { key: "motherStatus", label: "母亲状态" },
      { key: "motherAddress", label: "母亲地址" },
      { key: "fatherName", label: "父亲姓名" },
      { key: "fatherDob", label: "父亲出生日期" },
      { key: "fatherBirthplace", label: "父亲出生地" },
      { key: "fatherStatus", label: "父亲状态" },
      { key: "fatherAddress", label: "父亲地址" },
      { key: "siblingsInfo", label: "兄弟姐妹信息" },
    ],
  },
  {
    title: "旅行历史 (Schedule A)",
    color: "purple",
    fields: [
      { key: "travelHistory", label: "过去10年旅行记录" },
      { key: "addressHistory", label: "过去10年地址记录" },
      { key: "educationDetails", label: "教育详情" },
      { key: "employmentDetails", label: "工作详情" },
      { key: "membershipOrganizations", label: "组织成员身份" },
      { key: "governmentPositions", label: "政府职位详情" },
      { key: "militaryDetails", label: "军队服役详情" },
    ],
  },
  {
    title: "资金证明 (IMM 5690)",
    color: "green",
    fields: [
      { key: "settlementFunds", label: "安家资金总额" },
      { key: "bankBalance", label: "银行存款" },
      { key: "investments", label: "投资" },
      { key: "property", label: "房产" },
      { key: "otherAssets", label: "其他资产" },
      { key: "debts", label: "负债" },
      { key: "netWorth", label: "净资产" },
      { key: "fundsSource", label: "资金来源说明" },
    ],
  },
  {
    title: "代理人信息 (IMM 5476)",
    color: "amber",
    fields: [
      { key: "hasRepresentative", label: "是否有代理人" },
      { key: "representativeType", label: "代理人类型" },
      { key: "representativeName", label: "代理人姓名" },
      { key: "representativeCompany", label: "代理公司" },
      { key: "representativeRcicNumber", label: "RCIC编号" },
      { key: "representativePhone", label: "代理人电话" },
      { key: "representativeEmail", label: "代理人邮箱" },
      { key: "representativeAddress", label: "代理人地址" },
    ],
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800" },
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800" },
};

function ReviewContent() {
  const searchParams = useSearchParams();
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const saved = localStorage.getItem(`application_${id}`);
      if (saved) {
        setApplication(JSON.parse(saved));
      }
    }
  }, [searchParams]);

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载申请信息...</p>
        </div>
      </div>
    );
  }

  const formData = application.formData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            申请已提交
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            省提名项目申请审核
          </h1>
          <p className="text-gray-600">
            申请编号: {application.id}
          </p>
        </div>

        {/* Form Data Groups */}
        <div className="space-y-6">
          {fieldGroups.map((group, groupIndex) => {
            const colors = colorClasses[group.color] || colorClasses.gray;
            const filledFields = group.fields.filter(f => formData[f.key]);
            
            if (filledFields.length === 0) return null;

            return (
              <div key={groupIndex} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${colors.border}`}>
                  <h2 className={`font-semibold ${colors.text}`}>{group.title}</h2>
                </div>
                <div className="px-6 py-4 bg-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filledFields.map((field) => (
                      <div key={field.key} className="flex flex-col">
                        <span className="text-sm text-gray-500">{field.label}</span>
                        <span className="font-medium text-gray-900">{formData[field.key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/applications/provincial-nominee"
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            返回修改
          </a>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            打印申请
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProvincialNomineeReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
