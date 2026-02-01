"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Application } from "@/types/application";

// 字段分组配置
const fieldGroups = [
  {
    title: "申请详情 (IMM 0008)",
    color: "red",
    fields: [
      { key: "languageCorrespondence", label: "通信语言偏好" },
      { key: "languageInterview", label: "面试语言偏好" },
      { key: "interpreterRequired", label: "是否需要翻译" },
      { key: "intendedProvince", label: "计划居住省份" },
      { key: "intendedCity", label: "计划居住城市" },
      { key: "csqReceived", label: "是否已获得CSQ" },
      { key: "csqNumber", label: "CSQ编号" },
      { key: "csqApplicationDate", label: "CSQ申请日期" },
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
      { key: "cityOfBirth", label: "出生城市" },
      { key: "countryOfBirth", label: "出生国家" },
      { key: "citizenship", label: "国籍" },
      { key: "secondCitizenship", label: "第二国籍" },
      { key: "currentCountryOfResidence", label: "当前居住国" },
      { key: "immigrationStatus", label: "移民身份" },
      { key: "statusFromDate", label: "身份开始日期" },
      { key: "statusToDate", label: "身份结束日期" },
      { key: "maritalStatus", label: "婚姻状况" },
      { key: "marriageDate", label: "结婚日期" },
      { key: "spouseFamilyName", label: "配偶姓" },
      { key: "spouseGivenNames", label: "配偶名" },
    ],
  },
  {
    title: "联系方式 (IMM 0008)",
    color: "red",
    fields: [
      { key: "poBox", label: "邮政信箱" },
      { key: "aptUnit", label: "公寓/单元号" },
      { key: "streetNumber", label: "街道号码" },
      { key: "streetName", label: "街道名称" },
      { key: "city", label: "城市" },
      { key: "country", label: "国家" },
      { key: "provinceState", label: "省/州" },
      { key: "postalCode", label: "邮政编码" },
      { key: "email", label: "电子邮箱" },
      { key: "phoneType", label: "电话类型" },
      { key: "phoneCountryCode", label: "国家代码" },
      { key: "phoneNumber", label: "电话号码" },
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
      { key: "taiwanPassportWithId", label: "台湾护照带身份证号" },
      { key: "israeliPassport", label: "以色列护照" },
    ],
  },
  {
    title: "身份证件 (IMM 0008)",
    color: "red",
    fields: [
      { key: "hasNationalId", label: "是否有国民身份证" },
      { key: "nationalIdNumber", label: "证件号码" },
      { key: "nationalIdCountry", label: "签发国家" },
      { key: "nationalIdIssueDate", label: "签发日期" },
      { key: "nationalIdExpiryDate", label: "到期日期" },
    ],
  },
  {
    title: "教育与职业 (IMM 0008)",
    color: "red",
    fields: [
      { key: "highestEducation", label: "最高学历" },
      { key: "yearsOfStudy", label: "受教育年数" },
      { key: "currentOccupation", label: "当前职业" },
      { key: "intendedOccupation", label: "计划职业" },
    ],
  },
  {
    title: "语言能力 (IMM 0008)",
    color: "red",
    fields: [
      { key: "nativeLanguage", label: "母语" },
      { key: "englishFluency", label: "英语流利程度" },
      { key: "frenchFluency", label: "法语流利程度" },
      { key: "englishTestType", label: "英语测试类型" },
      { key: "englishTestDate", label: "英语测试日期" },
      { key: "englishListening", label: "英语听力" },
      { key: "englishReading", label: "英语阅读" },
      { key: "englishWriting", label: "英语写作" },
      { key: "englishSpeaking", label: "英语口语" },
      { key: "frenchTestType", label: "法语测试类型" },
      { key: "frenchTestDate", label: "法语测试日期" },
      { key: "frenchListening", label: "法语听力" },
      { key: "frenchReading", label: "法语阅读" },
      { key: "frenchWriting", label: "法语写作" },
      { key: "frenchSpeaking", label: "法语口语" },
    ],
  },
  {
    title: "随行家属 (IMM 0008)",
    color: "red",
    fields: [
      { key: "hasDependants", label: "是否有随行家属" },
      { key: "dependant1Relationship", label: "家属1关系" },
      { key: "dependant1FamilyName", label: "家属1姓" },
      { key: "dependant1GivenNames", label: "家属1名" },
      { key: "dependant1Sex", label: "家属1性别" },
      { key: "dependant1DateOfBirth", label: "家属1出生日期" },
      { key: "dependant1CountryOfBirth", label: "家属1出生国家" },
      { key: "dependant1Citizenship", label: "家属1国籍" },
      { key: "dependant1MaritalStatus", label: "家属1婚姻状况" },
      { key: "dependant1Accompanying", label: "家属1是否随行" },
    ],
  },
  {
    title: "背景问题 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "criminalConviction", label: "犯罪记录" },
      { key: "criminalConvictionDetails", label: "犯罪记录详情" },
      { key: "currentlyCharged", label: "当前被起诉" },
      { key: "previousRefugee", label: "曾申请难民" },
      { key: "previousRefusal", label: "曾被拒签" },
      { key: "previousDeportation", label: "曾被驱逐" },
      { key: "warCrimes", label: "战争罪" },
      { key: "armedStruggle", label: "武装斗争" },
      { key: "associatedWithViolence", label: "与暴力组织关联" },
      { key: "criminalOrganization", label: "犯罪组织成员" },
      { key: "detained", label: "曾被拘留" },
      { key: "healthCondition", label: "健康状况" },
    ],
  },
  {
    title: "教育历史 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "elementaryYears", label: "小学年数" },
      { key: "secondaryYears", label: "中学年数" },
      { key: "universityYears", label: "大学年数" },
      { key: "tradeSchoolYears", label: "职业学校年数" },
      { key: "edu1From", label: "教育1开始" },
      { key: "edu1To", label: "教育1结束" },
      { key: "edu1Institution", label: "教育1学校" },
      { key: "edu1CityCountry", label: "教育1地点" },
      { key: "edu1Certificate", label: "教育1证书" },
      { key: "edu1FieldOfStudy", label: "教育1专业" },
    ],
  },
  {
    title: "个人历史 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "history1From", label: "历史1开始" },
      { key: "history1To", label: "历史1结束" },
      { key: "history1Activity", label: "历史1活动" },
      { key: "history1CityCountry", label: "历史1地点" },
      { key: "history1Status", label: "历史1身份" },
      { key: "history1Employer", label: "历史1雇主" },
      { key: "history2From", label: "历史2开始" },
      { key: "history2To", label: "历史2结束" },
      { key: "history2Activity", label: "历史2活动" },
      { key: "history2CityCountry", label: "历史2地点" },
      { key: "history2Status", label: "历史2身份" },
      { key: "history2Employer", label: "历史2雇主" },
    ],
  },
  {
    title: "组织会员 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "hasMemberships", label: "是否有组织会员" },
      { key: "org1From", label: "组织1开始" },
      { key: "org1To", label: "组织1结束" },
      { key: "org1Name", label: "组织1名称" },
      { key: "org1Type", label: "组织1类型" },
      { key: "org1Position", label: "组织1职位" },
      { key: "org1CityCountry", label: "组织1地点" },
    ],
  },
  {
    title: "政府职位 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "hasGovtPositions", label: "是否有政府职位" },
      { key: "govt1From", label: "职位1开始" },
      { key: "govt1To", label: "职位1结束" },
      { key: "govt1Jurisdiction", label: "职位1管辖" },
      { key: "govt1Department", label: "职位1部门" },
      { key: "govt1Position", label: "职位1名称" },
    ],
  },
  {
    title: "军事服务 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "hasMilitaryService", label: "是否有军事服务" },
      { key: "military1Country", label: "军事1国家" },
      { key: "military1From", label: "军事1开始" },
      { key: "military1To", label: "军事1结束" },
      { key: "military1Branch", label: "军事1分支" },
      { key: "military1Rank", label: "军事1军衔" },
      { key: "military1Combat", label: "军事1实战" },
      { key: "military1EndReason", label: "军事1结束原因" },
    ],
  },
  {
    title: "地址历史 (IMM 5669)",
    color: "amber",
    fields: [
      { key: "addr1From", label: "地址1开始" },
      { key: "addr1To", label: "地址1结束" },
      { key: "addr1Street", label: "地址1街道" },
      { key: "addr1City", label: "地址1城市" },
      { key: "addr1Province", label: "地址1省份" },
      { key: "addr1PostalCode", label: "地址1邮编" },
      { key: "addr1Country", label: "地址1国家" },
    ],
  },
  {
    title: "家庭信息 (IMM 5406)",
    color: "green",
    fields: [
      { key: "fatherFamilyName", label: "父亲姓" },
      { key: "fatherGivenNames", label: "父亲名" },
      { key: "fatherDateOfBirth", label: "父亲出生日期" },
      { key: "fatherCountryOfBirth", label: "父亲出生国家" },
      { key: "fatherCurrentAddress", label: "父亲现居地址" },
      { key: "fatherMaritalStatus", label: "父亲婚姻状况" },
      { key: "fatherInCanada", label: "父亲是否在加拿大" },
      { key: "motherFamilyNameAtBirth", label: "母亲出生时姓" },
      { key: "motherGivenNames", label: "母亲名" },
      { key: "motherDateOfBirth", label: "母亲出生日期" },
      { key: "motherCountryOfBirth", label: "母亲出生国家" },
      { key: "motherCurrentAddress", label: "母亲现居地址" },
      { key: "motherMaritalStatus", label: "母亲婚姻状况" },
      { key: "motherInCanada", label: "母亲是否在加拿大" },
      { key: "hasChildren", label: "是否有子女" },
      { key: "hasSiblings", label: "是否有兄弟姐妹" },
    ],
  },
  {
    title: "Express Entry 特有信息",
    color: "purple",
    fields: [
      { key: "eeProgram", label: "EE项目类别" },
      { key: "eeProfileNumber", label: "EE档案编号" },
      { key: "eeValidationCode", label: "验证码" },
      { key: "itaDate", label: "ITA收到日期" },
      { key: "nocCode", label: "NOC代码" },
      { key: "nocTitle", label: "职业名称" },
      { key: "yearsOfExperience", label: "工作经验年数" },
      { key: "ecaOrganization", label: "ECA机构" },
      { key: "ecaNumber", label: "ECA编号" },
      { key: "ecaDate", label: "ECA日期" },
      { key: "ecaEquivalent", label: "加拿大等效学历" },
      { key: "hasProvincialNomination", label: "是否有省提名" },
      { key: "pnpProvince", label: "提名省份" },
      { key: "pnpCertificateNumber", label: "提名证书编号" },
      { key: "pnpDate", label: "提名日期" },
      { key: "hasJobOffer", label: "是否有工作邀请" },
      { key: "jobOfferEmployer", label: "雇主名称" },
      { key: "jobOfferPosition", label: "职位名称" },
      { key: "jobOfferNoc", label: "职位NOC代码" },
      { key: "jobOfferLmiaNumber", label: "LMIA编号" },
      { key: "settlementFunds", label: "安家资金" },
      { key: "settlementFundsCurrency", label: "货币" },
    ],
  },
  {
    title: "声明与签名",
    color: "gray",
    fields: [
      { key: "declarationAgree", label: "同意声明" },
      { key: "signatureDate", label: "签名日期" },
      { key: "applicantSignature", label: "申请人签名" },
    ],
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800" },
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载申请信息...</p>
        </div>
      </div>
    );
  }

  const formData = application.formData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
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
            Express Entry 申请审核
          </h1>
          <p className="text-gray-600">
            申请编号: {application.id}
          </p>
        </div>

        {/* Form Data Groups */}
        <div className="space-y-6">
          {fieldGroups.map((group, groupIndex) => {
            const colors = colorClasses[group.color] || colorClasses.gray;
            const hasData = group.fields.some(
              (field) => formData[field.key] && formData[field.key].trim() !== ""
            );

            if (!hasData) return null;

            return (
              <div
                key={groupIndex}
                className={`${colors.bg} ${colors.border} border rounded-xl overflow-hidden`}
              >
                <div className={`px-6 py-4 ${colors.border} border-b`}>
                  <h2 className={`font-semibold ${colors.text}`}>{group.title}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.fields.map((field, fieldIndex) => {
                      const value = formData[field.key];
                      if (!value || value.trim() === "") return null;

                      return (
                        <div key={fieldIndex} className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">{field.label}</p>
                          <p className="text-gray-900 font-medium">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium
                     hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            打印申请
          </button>
          
          <button
            onClick={() => (window.location.href = "/applications/express-entry")}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-medium
                     hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            修改申请
          </button>
          
          <button
            onClick={() => (window.location.href = "/applications")}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium
                     hover:from-green-700 hover:to-green-600 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExpressEntryReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
