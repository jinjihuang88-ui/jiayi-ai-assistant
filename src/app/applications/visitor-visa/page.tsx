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
      { key: "uci", label: "UCI 号码 (首次申请留空)", value: "", section: 0, aiHint: "Universal Client Identification Number，8-10位数字，首次申请无需填写" },
      { key: "service_language", label: "服务语言偏好 I want service in", value: "English", section: 0 },
      { key: "visa_type", label: "签证类型 Visa Requested", value: "", section: 0, aiHint: "Visitor Visa 访客签证 / Transit Visa 过境签证" },
      
      // ===== 第2步：个人信息 =====
      { key: "family_name", label: "姓 Family Name", value: "", section: 1, aiHint: "需与护照完全一致，使用拼音大写。如护照上无姓，请将所有名字填在此处" },
      { key: "given_name", label: "名 Given Name(s)", value: "", section: 1, aiHint: "需与护照完全一致，使用拼音大写。如护照上无名，请留空" },
      { key: "used_other_name", label: "是否曾用其他姓名 Used Other Name", value: "", section: 1, aiHint: "包括曾用名、婚前姓、昵称等" },
      { key: "other_family_name", label: "其他姓氏 Other Family Name", value: "", section: 1, aiHint: "如选是，请填写曾用姓氏" },
      { key: "other_given_name", label: "其他名字 Other Given Name(s)", value: "", section: 1, aiHint: "如选是，请填写曾用名字" },
      { key: "sex", label: "性别 Sex", value: "", section: 1 },
      { key: "date_of_birth", label: "出生日期 Date of Birth", value: "", section: 1, aiHint: "格式：YYYY-MM-DD，需与护照一致" },
      { key: "city_of_birth", label: "出生城市 City/Town of Birth", value: "", section: 1, aiHint: "需与护照一致" },
      { key: "country_of_birth", label: "出生国家 Country of Birth", value: "", section: 1, aiHint: "需与护照一致" },
      { key: "citizenship", label: "国籍 Citizenship", value: "", section: 1, aiHint: "需与护照一致，如有多国籍选择此次旅行使用的护照国籍" },
      
      // ===== 第3步：居住信息 =====
      { key: "residence_country", label: "现居住国家 Current Country of Residence", value: "", section: 2, aiHint: "您目前合法居住的国家" },
      { key: "residence_status", label: "居住身份 Immigration Status", value: "", section: 2, aiHint: "在现居住国的身份状态" },
      { key: "residence_status_other", label: "其他身份说明 Other Status Details", value: "", section: 2, aiHint: "如选择Other，请说明具体身份" },
      { key: "residence_from", label: "居住开始日期 From", value: "", section: 2, aiHint: "格式：YYYY-MM-DD" },
      { key: "residence_to", label: "居住结束日期 To", value: "", section: 2, aiHint: "格式：YYYY-MM-DD，如仍居住可填当前日期或留空" },
      { key: "lived_other_country", label: "过去5年是否在其他国家居住超过6个月", value: "", section: 2, aiHint: "除国籍国和现居住国外" },
      { key: "previous_country", label: "曾居住国家 Previous Country", value: "", section: 2, aiHint: "如选是，填写曾居住国家" },
      { key: "previous_status", label: "曾居住身份 Previous Status", value: "", section: 2, aiHint: "在该国的身份状态" },
      { key: "previous_from", label: "曾居住开始日期 Previous From", value: "", section: 2, aiHint: "格式：YYYY-MM-DD" },
      { key: "previous_to", label: "曾居住结束日期 Previous To", value: "", section: 2, aiHint: "格式：YYYY-MM-DD" },
      { key: "applying_from_residence", label: "是否从居住国申请 Applying from Country of Residence", value: "", section: 2, aiHint: "如果您在第三国申请，选择No" },
      { key: "applying_country", label: "申请国家 Country Where Applying", value: "", section: 2, aiHint: "如不是从居住国申请，填写申请所在国" },
      { key: "applying_status", label: "申请国身份 Status in Applying Country", value: "", section: 2, aiHint: "在申请国的身份状态" },
      
      // ===== 第4步：婚姻状况 =====
      { key: "marital_status", label: "婚姻状况 Marital Status", value: "", section: 3, aiHint: "当前婚姻状况" },
      { key: "marriage_date", label: "结婚/同居日期 Date of Marriage/Common-law", value: "", section: 3, aiHint: "格式：YYYY-MM-DD，如已婚或同居需填写" },
      { key: "spouse_family_name", label: "配偶姓 Spouse Family Name", value: "", section: 3, aiHint: "如已婚或同居需填写" },
      { key: "spouse_given_name", label: "配偶名 Spouse Given Name(s)", value: "", section: 3, aiHint: "如已婚或同居需填写" },
      { key: "previously_married", label: "是否曾经结婚或同居 Previously Married/Common-law", value: "", section: 3 },
      { key: "prev_spouse_family_name", label: "前配偶姓 Previous Spouse Family Name", value: "", section: 3 },
      { key: "prev_spouse_given_name", label: "前配偶名 Previous Spouse Given Name(s)", value: "", section: 3 },
      { key: "prev_spouse_dob", label: "前配偶出生日期 Previous Spouse DOB", value: "", section: 3, aiHint: "格式：YYYY-MM-DD" },
      { key: "prev_relationship_type", label: "前关系类型 Previous Relationship Type", value: "", section: 3 },
      { key: "prev_relationship_from", label: "前关系开始日期 Previous Relationship From", value: "", section: 3 },
      { key: "prev_relationship_to", label: "前关系结束日期 Previous Relationship To", value: "", section: 3 },
      
      // ===== 第5步：语言能力 =====
      { key: "native_language", label: "母语 Native Language/Mother Tongue", value: "", section: 4, aiHint: "您的第一语言" },
      { key: "can_communicate_en_fr", label: "能否用英语或法语交流 Communicate in English/French", value: "", section: 4 },
      { key: "language_preference", label: "最熟练的语言 Language Most at Ease", value: "", section: 4, aiHint: "English/French/Neither" },
      { key: "language_test_taken", label: "是否参加过语言测试 Language Test Taken", value: "", section: 4, aiHint: "是否参加过指定机构的语言测试" },
      
      // ===== 第6步：护照信息 =====
      { key: "passport_number", label: "护照号码 Passport Number", value: "", section: 5, aiHint: "需与护照完全一致" },
      { key: "passport_country", label: "护照签发国 Country of Issue", value: "", section: 5 },
      { key: "passport_issue_date", label: "护照签发日期 Issue Date", value: "", section: 5, aiHint: "格式：YYYY-MM-DD" },
      { key: "passport_expiry_date", label: "护照有效期 Expiry Date", value: "", section: 5, aiHint: "格式：YYYY-MM-DD，建议有效期超过计划离开加拿大日期至少6个月" },
      { key: "taiwan_passport_with_id", label: "是否使用含身份证号的台湾护照", value: "", section: 5, aiHint: "台湾外交部签发的含个人身份证号的护照" },
      { key: "israeli_passport", label: "是否使用以色列国民护照", value: "", section: 5 },
      
      // ===== 第7步：身份证件 =====
      { key: "has_national_id", label: "是否有国民身份证 National Identity Document", value: "", section: 6 },
      { key: "national_id_number", label: "身份证号码 Document Number", value: "", section: 6 },
      { key: "national_id_country", label: "身份证签发国 Country of Issue", value: "", section: 6 },
      { key: "national_id_issue_date", label: "身份证签发日期 Issue Date", value: "", section: 6, aiHint: "格式：YYYY-MM-DD" },
      { key: "national_id_expiry_date", label: "身份证有效期 Expiry Date", value: "", section: 6, aiHint: "格式：YYYY-MM-DD" },
      { key: "has_us_pr_card", label: "是否持有美国绿卡 US PR Card", value: "", section: 6 },
      { key: "us_pr_card_number", label: "绿卡号码 US PR Card Number", value: "", section: 6 },
      { key: "us_pr_card_expiry", label: "绿卡有效期 US PR Card Expiry", value: "", section: 6, aiHint: "格式：YYYY-MM-DD" },
      
      // ===== 第8步：联系方式 =====
      { key: "mailing_po_box", label: "邮政信箱 P.O. Box", value: "", section: 7 },
      { key: "mailing_apt_unit", label: "公寓/单元号 Apt/Unit", value: "", section: 7 },
      { key: "mailing_street_no", label: "街道号 Street No.", value: "", section: 7 },
      { key: "mailing_street_name", label: "街道名 Street Name", value: "", section: 7 },
      { key: "mailing_city", label: "城市 City/Town", value: "", section: 7 },
      { key: "mailing_country", label: "国家 Country", value: "", section: 7 },
      { key: "mailing_province", label: "省/州 Province/State", value: "", section: 7 },
      { key: "mailing_postal_code", label: "邮编 Postal Code", value: "", section: 7 },
      { key: "mailing_district", label: "区 District", value: "", section: 7 },
      { key: "residential_same", label: "居住地址与邮寄地址相同", value: "", section: 7 },
      { key: "residential_apt_unit", label: "居住公寓/单元号 Residential Apt/Unit", value: "", section: 7 },
      { key: "residential_street_no", label: "居住街道号 Residential Street No.", value: "", section: 7 },
      { key: "residential_street_name", label: "居住街道名 Residential Street Name", value: "", section: 7 },
      { key: "residential_city", label: "居住城市 Residential City", value: "", section: 7 },
      { key: "residential_country", label: "居住国家 Residential Country", value: "", section: 7 },
      { key: "residential_province", label: "居住省/州 Residential Province", value: "", section: 7 },
      { key: "residential_postal_code", label: "居住邮编 Residential Postal Code", value: "", section: 7 },
      { key: "phone_type", label: "电话类型 Phone Type", value: "", section: 7, aiHint: "Cell/Home/Business" },
      { key: "phone_country_code", label: "电话国家代码 Country Code", value: "", section: 7, aiHint: "如中国 +86" },
      { key: "phone_number", label: "电话号码 Phone Number", value: "", section: 7 },
      { key: "phone_ext", label: "分机号 Extension", value: "", section: 7 },
      { key: "alt_phone_type", label: "备用电话类型 Alt Phone Type", value: "", section: 7 },
      { key: "alt_phone_country_code", label: "备用电话国家代码 Alt Country Code", value: "", section: 7 },
      { key: "alt_phone_number", label: "备用电话号码 Alt Phone Number", value: "", section: 7 },
      { key: "fax_number", label: "传真号码 Fax Number", value: "", section: 7 },
      { key: "email", label: "电子邮箱 Email", value: "", section: 7, aiHint: "用于接收 IRCC 通知，请确保可正常接收" },
      
      // ===== 第9步：访问计划 =====
      { key: "purpose_of_visit", label: "访问目的 Purpose of Visit", value: "", section: 8, aiHint: "如：Tourism/Family Visit/Business/Study/Work/Other" },
      { key: "purpose_other", label: "其他目的说明 Other Purpose Details", value: "", section: 8 },
      { key: "visit_from_date", label: "计划入境日期 From Date", value: "", section: 8, aiHint: "格式：YYYY-MM-DD" },
      { key: "visit_to_date", label: "计划离境日期 To Date", value: "", section: 8, aiHint: "格式：YYYY-MM-DD" },
      { key: "funds_available", label: "可用资金 Funds Available (CAD)", value: "", section: 8, aiHint: "在加拿大期间可用的资金总额" },
      { key: "contact1_name", label: "联系人1姓名 Contact 1 Name", value: "", section: 8, aiHint: "将在加拿大访问的人员或机构" },
      { key: "contact1_relationship", label: "联系人1关系 Contact 1 Relationship", value: "", section: 8, aiHint: "与您的关系，如：Friend/Relative/Business Partner/School" },
      { key: "contact1_address", label: "联系人1地址 Contact 1 Address in Canada", value: "", section: 8 },
      { key: "contact2_name", label: "联系人2姓名 Contact 2 Name", value: "", section: 8 },
      { key: "contact2_relationship", label: "联系人2关系 Contact 2 Relationship", value: "", section: 8 },
      { key: "contact2_address", label: "联系人2地址 Contact 2 Address in Canada", value: "", section: 8 },
      
      // ===== 第10步：教育背景 =====
      { key: "has_post_secondary", label: "是否有高等教育经历 Post-Secondary Education", value: "", section: 9, aiHint: "大学、学院或学徒培训" },
      { key: "education_from", label: "教育开始日期 Education From", value: "", section: 9, aiHint: "格式：YYYY-MM" },
      { key: "education_to", label: "教育结束日期 Education To", value: "", section: 9, aiHint: "格式：YYYY-MM" },
      { key: "education_field", label: "学习领域 Field of Study", value: "", section: 9 },
      { key: "education_school", label: "学校名称 School/Facility Name", value: "", section: 9 },
      { key: "education_city", label: "学校城市 City/Town", value: "", section: 9 },
      { key: "education_country", label: "学校国家 Country", value: "", section: 9 },
      { key: "education_province", label: "学校省/州 Province/State", value: "", section: 9 },
      
      // ===== 第11步：工作经历 =====
      { key: "employment1_from", label: "工作1开始日期 Employment 1 From", value: "", section: 10, aiHint: "格式：YYYY-MM，填写过去10年工作经历" },
      { key: "employment1_to", label: "工作1结束日期 Employment 1 To", value: "", section: 10, aiHint: "格式：YYYY-MM，当前工作可填Present" },
      { key: "employment1_occupation", label: "工作1职业 Occupation", value: "", section: 10, aiHint: "当前职业/活动，如退休填Retired，学生填Student" },
      { key: "employment1_company", label: "工作1公司 Company/Employer", value: "", section: 10 },
      { key: "employment1_city", label: "工作1城市 City/Town", value: "", section: 10 },
      { key: "employment1_country", label: "工作1国家 Country", value: "", section: 10 },
      { key: "employment1_province", label: "工作1省/州 Province/State", value: "", section: 10 },
      { key: "employment2_from", label: "工作2开始日期 Employment 2 From", value: "", section: 10 },
      { key: "employment2_to", label: "工作2结束日期 Employment 2 To", value: "", section: 10 },
      { key: "employment2_occupation", label: "工作2职业 Occupation", value: "", section: 10 },
      { key: "employment2_company", label: "工作2公司 Company/Employer", value: "", section: 10 },
      { key: "employment2_city", label: "工作2城市 City/Town", value: "", section: 10 },
      { key: "employment2_country", label: "工作2国家 Country", value: "", section: 10 },
      { key: "employment3_from", label: "工作3开始日期 Employment 3 From", value: "", section: 10 },
      { key: "employment3_to", label: "工作3结束日期 Employment 3 To", value: "", section: 10 },
      { key: "employment3_occupation", label: "工作3职业 Occupation", value: "", section: 10 },
      { key: "employment3_company", label: "工作3公司 Company/Employer", value: "", section: 10 },
      { key: "employment3_city", label: "工作3城市 City/Town", value: "", section: 10 },
      { key: "employment3_country", label: "工作3国家 Country", value: "", section: 10 },
      
      // ===== 第12步：背景信息 =====
      { key: "tuberculosis_contact", label: "过去两年是否接触过肺结核患者 Tuberculosis Contact", value: "", section: 11, aiHint: "您或家人是否曾患肺结核或与肺结核患者密切接触" },
      { key: "medical_condition", label: "是否有需要医疗服务的疾病 Medical Condition", value: "", section: 11, aiHint: "是否有需要在加拿大期间接受社会或健康服务的身体或精神疾病" },
      { key: "medical_details", label: "健康状况详情 Medical Details", value: "", section: 11, aiHint: "如上述问题回答是，请提供详情" },
      { key: "overstayed_canada", label: "是否曾在加拿大逾期停留/未经授权学习或工作", value: "", section: 11 },
      { key: "visa_refused", label: "是否曾被拒签或拒绝入境 Visa Refused/Denied Entry", value: "", section: 11, aiHint: "是否曾被任何国家拒签、拒绝入境或要求离开" },
      { key: "previous_canada_application", label: "是否曾申请进入或留在加拿大 Previous Canada Application", value: "", section: 11 },
      { key: "refusal_details", label: "拒签详情 Refusal Details", value: "", section: 11, aiHint: "如有拒签经历请详细说明国家、时间、原因" },
      { key: "previous_canada_details", label: "以往加拿大申请详情 Previous Canada Application Details", value: "", section: 11 },
      { key: "criminal_record", label: "是否有犯罪记录 Criminal Record", value: "", section: 11, aiHint: "是否曾被逮捕、指控或定罪任何刑事犯罪" },
      { key: "criminal_details", label: "犯罪记录详情 Criminal Details", value: "", section: 11, aiHint: "如有请详细说明" },
      { key: "military_service", label: "是否有军队/安全服务经历 Military/Security Service", value: "", section: 11, aiHint: "是否曾在军队、民兵、民防单位或安全组织/警察部队服役" },
      { key: "military_details", label: "军事服役详情 Military Service Details", value: "", section: 11, aiHint: "如有请说明服役日期和国家" },
      { key: "political_association", label: "是否有政治组织关联 Political Association", value: "", section: 11, aiHint: "是否曾是或关联任何从事暴力活动的政治组织" },
      { key: "witnessed_ill_treatment", label: "是否曾目睹或参与虐待行为 Witnessed Ill Treatment", value: "", section: 11, aiHint: "是否曾目睹或参与虐待囚犯、平民或亵渎宗教建筑" },
      
      // ===== 第13步：签名声明 =====
      { key: "consent_to_contact", label: "是否同意未来被联系 Consent to Contact", value: "", section: 12, aiHint: "是否同意IRCC或其授权机构在未来联系您" },
      { key: "declaration_agree", label: "声明确认 Declaration", value: "", section: 12, aiHint: "我声明本申请中所有问题的回答均真实完整" },
      { key: "signature_date", label: "签名日期 Signature Date", value: "", section: 12, aiHint: "格式：YYYY-MM-DD" },
    ],
  });

  const steps = [
    { title: "基本信息", icon: "📋" },
    { title: "个人信息", icon: "👤" },
    { title: "居住信息", icon: "🏠" },
    { title: "婚姻状况", icon: "💑" },
    { title: "语言能力", icon: "🗣️" },
    { title: "护照信息", icon: "🛂" },
    { title: "身份证件", icon: "🪪" },
    { title: "联系方式", icon: "📞" },
    { title: "访问计划", icon: "✈️" },
    { title: "教育背景", icon: "🎓" },
    { title: "工作经历", icon: "💼" },
    { title: "背景信息", icon: "📝" },
    { title: "签名声明", icon: "✍️" },
  ];

  const currentFields = (application.fields || []).filter(f => f.section === currentStep);

  // 可选字段列表
  const optionalFields = [
    "uci", "other_family_name", "other_given_name", "residence_status_other", "residence_to",
    "previous_country", "previous_status", "previous_from", "previous_to",
    "applying_country", "applying_status", "marriage_date", "spouse_family_name", "spouse_given_name",
    "prev_spouse_family_name", "prev_spouse_given_name", "prev_spouse_dob", "prev_relationship_type",
    "prev_relationship_from", "prev_relationship_to", "mailing_po_box", "mailing_apt_unit", "mailing_district",
    "residential_apt_unit", "phone_ext", "alt_phone_type", "alt_phone_country_code", "alt_phone_number",
    "fax_number", "purpose_other", "contact2_name", "contact2_relationship", "contact2_address",
    "education_from", "education_to", "education_field", "education_school", "education_city",
    "education_country", "education_province", "employment2_from", "employment2_to", "employment2_occupation",
    "employment2_company", "employment2_city", "employment2_country", "employment3_from", "employment3_to",
    "employment3_occupation", "employment3_company", "employment3_city", "employment3_country",
    "medical_details", "refusal_details", "previous_canada_details", "criminal_details", "military_details",
    "national_id_number", "national_id_country", "national_id_issue_date", "national_id_expiry_date",
    "us_pr_card_number", "us_pr_card_expiry"
  ];

  function updateField(key: string, value: string) {
    setApplication((prev) => ({
      ...prev,
      fields: (prev.fields || []).map((f) =>
        f.key === key ? { ...f, value } : f
      ),
    }));
  }

  const renderField = (field: { key: string; label: string; value: string; aiHint?: string }) => {
    // Yes/No 选择框
    const yesNoFields = [
      "used_other_name", "lived_other_country", "applying_from_residence", "previously_married",
      "language_test_taken", "taiwan_passport_with_id", "israeli_passport", "has_national_id",
      "has_us_pr_card", "residential_same", "has_post_secondary", "tuberculosis_contact",
      "medical_condition", "overstayed_canada", "visa_refused", "previous_canada_application",
      "criminal_record", "military_service", "political_association", "witnessed_ill_treatment",
      "consent_to_contact", "declaration_agree"
    ];
    
    if (yesNoFields.includes(field.key)) {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="No">No 否</option>
          <option value="Yes">Yes 是</option>
        </select>
      );
    }

    // 性别选择
    if (field.key === "sex") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Female">Female 女</option>
          <option value="Male">Male 男</option>
          <option value="Unknown">Unknown 未知</option>
          <option value="Another gender">Another gender 其他</option>
        </select>
      );
    }

    // 婚姻状况选择
    if (field.key === "marital_status") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Single">Single 单身</option>
          <option value="Married">Married 已婚</option>
          <option value="Common-Law">Common-Law 同居</option>
          <option value="Divorced">Divorced 离异</option>
          <option value="Separated">Separated 分居</option>
          <option value="Widowed">Widowed 丧偶</option>
          <option value="Annulled Marriage">Annulled Marriage 婚姻无效</option>
        </select>
      );
    }

    // 服务语言选择
    if (field.key === "service_language") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="English">English 英语</option>
          <option value="French">French 法语</option>
        </select>
      );
    }

    // 签证类型选择
    if (field.key === "visa_type") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Visitor Visa">Visitor Visa 访客签证</option>
          <option value="Transit Visa">Transit Visa 过境签证</option>
        </select>
      );
    }

    // 居住身份选择
    if (field.key === "residence_status" || field.key === "previous_status" || field.key === "applying_status") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Citizen">Citizen 公民</option>
          <option value="Permanent Resident">Permanent Resident 永久居民</option>
          <option value="Visitor">Visitor 访客</option>
          <option value="Worker">Worker 工作者</option>
          <option value="Student">Student 学生</option>
          <option value="Protected Person">Protected Person 受保护人士</option>
          <option value="Refugee Claimant">Refugee Claimant 难民申请人</option>
          <option value="Other">Other 其他</option>
        </select>
      );
    }

    // 前关系类型选择
    if (field.key === "prev_relationship_type") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Married">Married 已婚</option>
          <option value="Common-Law">Common-Law 同居</option>
        </select>
      );
    }

    // 语言能力选择
    if (field.key === "can_communicate_en_fr") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="English">English 英语</option>
          <option value="French">French 法语</option>
          <option value="Both">Both 两者都会</option>
          <option value="Neither">Neither 都不会</option>
        </select>
      );
    }

    // 语言偏好选择
    if (field.key === "language_preference") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="English">English 英语</option>
          <option value="French">French 法语</option>
          <option value="Neither">Neither 都不是</option>
        </select>
      );
    }

    // 电话类型选择
    if (field.key === "phone_type" || field.key === "alt_phone_type") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Cell">Cell 手机</option>
          <option value="Home">Home 家庭电话</option>
          <option value="Business">Business 工作电话</option>
        </select>
      );
    }

    // 访问目的选择
    if (field.key === "purpose_of_visit") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Tourism">Tourism 旅游观光</option>
          <option value="Family Visit">Family Visit 探亲访友</option>
          <option value="Business">Business 商务访问</option>
          <option value="Short-term Studies">Short-term Studies 短期学习</option>
          <option value="Returning Student">Returning Student 返校学生</option>
          <option value="Returning Worker">Returning Worker 返工人员</option>
          <option value="Super Visa">Super Visa 超级签证</option>
          <option value="Medical">Medical 医疗</option>
          <option value="Other">Other 其他</option>
        </select>
      );
    }

    // 多行文本框
    const textareaFields = [
      "medical_details", "refusal_details", "previous_canada_details", "criminal_details",
      "military_details", "contact1_address", "contact2_address", "purpose_other"
    ];
    
    if (textareaFields.includes(field.key)) {
      return (
        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={3}
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.aiHint || `请输入${field.label}`}
        />
      );
    }

    // 日期输入
    const dateFields = [
      "date_of_birth", "residence_from", "residence_to", "previous_from", "previous_to",
      "marriage_date", "prev_spouse_dob", "prev_relationship_from", "prev_relationship_to",
      "passport_issue_date", "passport_expiry_date", "national_id_issue_date", "national_id_expiry_date",
      "us_pr_card_expiry", "visit_from_date", "visit_to_date", "signature_date"
    ];
    
    if (dateFields.includes(field.key)) {
      return (
        <input
          type="date"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        />
      );
    }

    // 年月输入
    const monthFields = [
      "education_from", "education_to", "employment1_from", "employment1_to",
      "employment2_from", "employment2_to", "employment3_from", "employment3_to"
    ];
    
    if (monthFields.includes(field.key)) {
      return (
        <input
          type="month"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        />
      );
    }

    // 邮箱输入
    if (field.key === "email") {
      return (
        <input
          type="email"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.aiHint || `请输入${field.label}`}
        />
      );
    }

    // 默认文本输入
    return (
      <input
        type="text"
        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        value={field.value}
        onChange={(e) => updateField(field.key, e.target.value)}
        placeholder={field.aiHint || `请输入${field.label}`}
      />
    );
  };

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
          <p className="text-slate-600 mt-2">适用于旅游、探亲、商务访问 · 基于 IRCC 官方表格 (2023年9月版)</p>
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
                    {!optionalFields.includes(field.key) && (
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
                
                {renderField(field)}
                
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
