"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Application } from "@/types/application";

// 字段分组配置
const fieldGroups = [
  {
    title: "工签类型 (Work Permit Type)",
    color: "blue",
    fields: [
      { key: "uci", label: "UCI" },
      { key: "preferredLanguage", label: "首选服务语言" },
      { key: "workPermitType", label: "工签类型" },
      { key: "lmiaNumber", label: "LMIA编号" },
      { key: "lmiaExemptCode", label: "LMIA豁免代码" },
    ],
  },
  {
    title: "个人信息 (Personal Details)",
    color: "blue",
    fields: [
      { key: "familyName", label: "姓" },
      { key: "givenNames", label: "名" },
      { key: "usedOtherName", label: "是否曾用其他名字" },
      { key: "otherFamilyName", label: "曾用姓" },
      { key: "otherGivenNames", label: "曾用名" },
      { key: "sex", label: "性别" },
      { key: "dateOfBirth", label: "出生日期" },
      { key: "cityOfBirth", label: "出生城市" },
      { key: "countryOfBirth", label: "出生国家" },
      { key: "citizenship", label: "国籍" },
    ],
  },
  {
    title: "居住信息 (Residence Information)",
    color: "blue",
    fields: [
      { key: "currentCountryOfResidence", label: "当前居住国" },
      { key: "immigrationStatus", label: "移民身份" },
      { key: "statusOther", label: "其他身份说明" },
      { key: "statusFromDate", label: "身份开始日期" },
      { key: "statusToDate", label: "身份结束日期" },
      { key: "livedInOtherCountry", label: "过去5年居住其他国家" },
      { key: "otherCountry1", label: "其他国家1" },
      { key: "otherCountryStatus1", label: "身份1" },
      { key: "otherCountryFrom1", label: "开始日期1" },
      { key: "otherCountryTo1", label: "结束日期1" },
      { key: "applyingFromResidence", label: "从居住国申请" },
      { key: "applyingFromCountry", label: "申请国家" },
      { key: "applyingFromStatus", label: "申请国身份" },
    ],
  },
  {
    title: "婚姻状况 (Marital Status)",
    color: "blue",
    fields: [
      { key: "maritalStatus", label: "婚姻状况" },
      { key: "marriageDate", label: "结婚日期" },
      { key: "spouseFamilyName", label: "配偶姓" },
      { key: "spouseGivenNames", label: "配偶名" },
      { key: "previouslyMarried", label: "曾经结婚" },
      { key: "prevSpouseFamilyName", label: "前配偶姓" },
      { key: "prevSpouseGivenNames", label: "前配偶名" },
      { key: "prevSpouseDateOfBirth", label: "前配偶出生日期" },
      { key: "prevRelationshipType", label: "关系类型" },
      { key: "prevRelationshipFrom", label: "关系开始" },
      { key: "prevRelationshipTo", label: "关系结束" },
    ],
  },
  {
    title: "语言能力 (Languages)",
    color: "blue",
    fields: [
      { key: "nativeLanguage", label: "母语" },
      { key: "languageAbility", label: "英法语能力" },
      { key: "languageTestTaken", label: "是否参加语言测试" },
      { key: "languageTestType", label: "测试类型" },
      { key: "languageTestDate", label: "测试日期" },
      { key: "languageTestListening", label: "听力" },
      { key: "languageTestReading", label: "阅读" },
      { key: "languageTestWriting", label: "写作" },
      { key: "languageTestSpeaking", label: "口语" },
    ],
  },
  {
    title: "护照信息 (Passport)",
    color: "blue",
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
    title: "身份证件 (Identity Documents)",
    color: "blue",
    fields: [
      { key: "hasNationalId", label: "是否有国民身份证" },
      { key: "nationalIdNumber", label: "证件号码" },
      { key: "nationalIdCountry", label: "签发国家" },
      { key: "nationalIdIssueDate", label: "签发日期" },
      { key: "nationalIdExpiryDate", label: "到期日期" },
      { key: "hasUsPrCard", label: "是否有美国绿卡" },
      { key: "usPrCardNumber", label: "绿卡号码" },
      { key: "usPrCardExpiryDate", label: "绿卡到期日期" },
    ],
  },
  {
    title: "联系方式 (Contact Information)",
    color: "blue",
    fields: [
      { key: "poBox", label: "邮政信箱" },
      { key: "aptUnit", label: "公寓/单元号" },
      { key: "streetNumber", label: "街道号码" },
      { key: "streetName", label: "街道名称" },
      { key: "city", label: "城市" },
      { key: "country", label: "国家" },
      { key: "provinceState", label: "省/州" },
      { key: "postalCode", label: "邮政编码" },
      { key: "sameAsMailingAddress", label: "居住地址同邮寄地址" },
      { key: "phoneType", label: "电话类型" },
      { key: "phoneCountryCode", label: "国家代码" },
      { key: "phoneNumber", label: "电话号码" },
      { key: "email", label: "电子邮箱" },
    ],
  },
  {
    title: "工作详情 (Details of Intended Work)",
    color: "green",
    fields: [
      { key: "employerName", label: "雇主名称" },
      { key: "employerStreetNumber", label: "雇主街道号码" },
      { key: "employerStreetName", label: "雇主街道名称" },
      { key: "employerCity", label: "雇主城市" },
      { key: "employerProvince", label: "雇主省份" },
      { key: "employerPostalCode", label: "雇主邮编" },
      { key: "intendedWorkLocation", label: "预期工作地点" },
      { key: "occupation", label: "职业/职位" },
      { key: "nocCode", label: "NOC代码" },
      { key: "employmentStartDate", label: "工作开始日期" },
      { key: "employmentEndDate", label: "工作结束日期" },
      { key: "wageAmount", label: "工资金额" },
      { key: "wageFrequency", label: "工资频率" },
    ],
  },
  {
    title: "教育背景 (Education)",
    color: "purple",
    fields: [
      { key: "highestEducation", label: "最高学历" },
    ],
  },
  {
    title: "工作经历 (Employment History)",
    color: "purple",
    fields: [
      { key: "currentOccupation", label: "当前职业" },
      { key: "intendedOccupation", label: "计划职业" },
      { key: "employment1From", label: "工作1开始" },
      { key: "employment1To", label: "工作1结束" },
      { key: "employment1Occupation", label: "工作1职业" },
      { key: "employment1Employer", label: "工作1雇主" },
      { key: "employment1CityCountry", label: "工作1地点" },
      { key: "employment2From", label: "工作2开始" },
      { key: "employment2To", label: "工作2结束" },
      { key: "employment2Occupation", label: "工作2职业" },
      { key: "employment2Employer", label: "工作2雇主" },
      { key: "employment2CityCountry", label: "工作2地点" },
    ],
  },
  {
    title: "背景问题 (Background Information)",
    color: "amber",
    fields: [
      { key: "refusedVisaCanada", label: "加拿大拒签" },
      { key: "refusedVisaCanadaDetails", label: "加拿大拒签详情" },
      { key: "refusedVisaOther", label: "其他国家拒签" },
      { key: "refusedVisaOtherDetails", label: "其他国家拒签详情" },
      { key: "criminalConviction", label: "犯罪记录" },
      { key: "criminalConvictionDetails", label: "犯罪记录详情" },
      { key: "militaryService", label: "军事服务" },
      { key: "militaryServiceDetails", label: "军事服务详情" },
      { key: "politicalOrganization", label: "政治组织" },
      { key: "politicalOrganizationDetails", label: "政治组织详情" },
      { key: "tuberculosis", label: "肺结核" },
      { key: "tbContact", label: "肺结核接触" },
      { key: "healthCondition", label: "健康状况" },
    ],
  },
  {
    title: "声明与签名 (Declaration)",
    color: "gray",
    fields: [
      { key: "declarationAgree", label: "同意声明" },
      { key: "signatureDate", label: "签名日期" },
      { key: "applicantSignature", label: "申请人签名" },
    ],
  },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" },
  green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-800" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
  gray: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-800" },
};

function WorkPermitReviewContent() {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载申请信息...</p>
        </div>
      </div>
    );
  }

  const formData = application.formData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
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
            工签申请审核
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
            onClick={() => (window.location.href = "/applications/work-permit")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium
                     hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
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

export default function WorkPermitReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <WorkPermitReviewContent />
    </Suspense>
  );
}
