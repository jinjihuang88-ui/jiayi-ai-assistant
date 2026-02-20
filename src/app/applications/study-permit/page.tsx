"use client";

import { useState, useRef, useEffect, Suspense } from "react";
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
          message: `我正在填写加拿大学签申请表格 IMM 1294，关于"${fieldLabel}"这个字段，${fieldHint ? `官方提示是：${fieldHint}。` : ""}我的问题是：${question}`,
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
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-4">
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
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-700 hover:to-orange-600 transition-all"
          >
            {isLoading ? "AI 正在思考..." : "询问 AI"}
          </button>
          
          {answer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-white text-xs">AI</span>
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

function StudyPermitPageContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const applicationsBackHref = from ? `/applications?from=${encodeURIComponent(from)}` : "/applications";
  const [currentStep, setCurrentStep] = useState(0);
  const [aiHelpField, setAiHelpField] = useState<{label: string; hint?: string} | null>(null);
  const [application, setApplication] = useState<Application>({
    id: "SP-" + Date.now(),
    type: "study_permit",
    status: "draft",
    fields: [
      // ===== 第1步：基本信息 =====
      { key: "uci", label: "UCI 号码 (首次申请留空)", value: "", section: 0 },
      { key: "service_language", label: "服务语言偏好", value: "English", section: 0 },
      
      // ===== 第2步：个人信息 =====
      { key: "family_name", label: "姓 Family Name", value: "", section: 1, aiHint: "需与护照完全一致，使用拼音大写" },
      { key: "given_name", label: "名 Given Name(s)", value: "", section: 1, aiHint: "需与护照完全一致，使用拼音大写" },
      { key: "used_other_name", label: "是否曾用其他姓名 Used Other Name", value: "", section: 1 },
      { key: "other_name_details", label: "其他姓名详情 Other Name Details", value: "", section: 1, aiHint: "如选是，请填写曾用名及使用时间" },
      { key: "sex", label: "性别 Sex", value: "", section: 1 },
      { key: "date_of_birth", label: "出生日期 Date of Birth", value: "", section: 1, aiHint: "格式：YYYY-MM-DD" },
      { key: "country_of_birth", label: "出生国家 Country of Birth", value: "", section: 1 },
      { key: "city_of_birth", label: "出生城市 City of Birth", value: "", section: 1 },
      { key: "citizenship", label: "国籍 Country of Citizenship", value: "", section: 1 },
      { key: "other_citizenship", label: "是否有其他国籍 Other Citizenship", value: "", section: 1 },
      { key: "other_citizenship_country", label: "其他国籍国家 Other Citizenship Country", value: "", section: 1, aiHint: "如有其他国籍请填写" },
      { key: "marital_status", label: "婚姻状况 Marital Status", value: "", section: 1, aiHint: "Single/Married/Common-law/Divorced/Widowed" },
      
      // ===== 第3步：护照信息 =====
      { key: "passport_number", label: "护照号码 Passport Number", value: "", section: 2, aiHint: "需与护照完全一致" },
      { key: "passport_country", label: "护照签发国 Country of Issue", value: "", section: 2 },
      { key: "passport_issue_date", label: "护照签发日期 Issue Date", value: "", section: 2, aiHint: "格式：YYYY-MM-DD" },
      { key: "passport_expiry_date", label: "护照有效期 Expiry Date", value: "", section: 2, aiHint: "格式：YYYY-MM-DD，建议有效期超过学习结束日期" },
      { key: "taiwan_id", label: "台湾身份证号 (如适用)", value: "", section: 2 },
      { key: "national_id", label: "国民身份证号 National ID (如适用)", value: "", section: 2 },
      { key: "us_pr_card", label: "美国绿卡号 US PR Card (如适用)", value: "", section: 2 },
      
      // ===== 第4步：联系方式 =====
      { key: "current_country", label: "现居住国家 Country of Residence", value: "", section: 3 },
      { key: "immigration_status", label: "在现居住国的身份 Immigration Status", value: "", section: 3, aiHint: "如：Citizen/Permanent Resident/Student/Worker/Visitor" },
      { key: "immigration_status_date", label: "身份获得日期 Status Valid From", value: "", section: 3, aiHint: "格式：YYYY-MM-DD" },
      { key: "immigration_status_expiry", label: "身份到期日期 Status Valid Until", value: "", section: 3, aiHint: "格式：YYYY-MM-DD，如为公民可填 N/A" },
      { key: "current_address", label: "现居住地址 Current Address", value: "", section: 3, aiHint: "包括街道、城市、省份、邮编、国家" },
      { key: "mailing_address_same", label: "邮寄地址是否相同 Mailing Address Same", value: "", section: 3 },
      { key: "mailing_address", label: "邮寄地址 Mailing Address", value: "", section: 3, aiHint: "如与现居住地址相同，填写 Same as above" },
      { key: "phone_type", label: "电话类型 Phone Type", value: "", section: 3 },
      { key: "phone_number", label: "电话号码 Phone Number", value: "", section: 3, aiHint: "包含国家代码，如 +86" },
      { key: "alt_phone_number", label: "备用电话 Alternative Phone", value: "", section: 3 },
      { key: "fax_number", label: "传真号码 Fax Number (如有)", value: "", section: 3 },
      { key: "email", label: "电子邮箱 Email", value: "", section: 3, aiHint: "用于接收 IRCC 通知，请确保可正常接收" },
      
      // ===== 第5步：学习计划 =====
      { key: "dli_name", label: "学校名称 DLI Name", value: "", section: 4, aiHint: "必须是加拿大指定学习机构 (DLI)" },
      { key: "dli_number", label: "DLI 编号 DLI Number", value: "", section: 4, aiHint: "可在 IRCC 官网查询学校的 DLI 编号" },
      { key: "dli_address", label: "学校地址 DLI Address", value: "", section: 4 },
      { key: "student_id", label: "学生号 Student ID (如有)", value: "", section: 4 },
      { key: "program_name", label: "专业/项目名称 Program Name", value: "", section: 4 },
      { key: "study_level", label: "学习层次 Level of Study", value: "", section: 4, aiHint: "如：Bachelor/Master/PhD/Diploma/Certificate" },
      { key: "study_field", label: "学习领域 Field of Study", value: "", section: 4 },
      { key: "study_start_date", label: "开学日期 Start Date", value: "", section: 4, aiHint: "格式：YYYY-MM-DD" },
      { key: "study_end_date", label: "预计毕业日期 End Date", value: "", section: 4, aiHint: "格式：YYYY-MM-DD" },
      { key: "study_province", label: "学习省份 Province of Study", value: "", section: 4 },
      { key: "tuition_fee", label: "学费 Tuition Fee (CAD)", value: "", section: 4, aiHint: "填写每年学费金额" },
      { key: "room_board", label: "食宿费 Room & Board (CAD)", value: "", section: 4, aiHint: "填写每年食宿费用" },
      { key: "other_expenses", label: "其他费用 Other Expenses (CAD)", value: "", section: 4, aiHint: "如书本费、保险费等" },
      { key: "pal_number", label: "省级证明信编号 PAL Number", value: "", section: 4, aiHint: "Provincial Attestation Letter 编号" },
      { key: "has_caq", label: "是否有魁北克CAQ (如在魁省学习)", value: "", section: 4 },
      
      // ===== 第6步：资金证明 =====
      { key: "funds_available", label: "可用资金总额 Total Funds (CAD)", value: "", section: 5, aiHint: "需覆盖学费+生活费，建议至少第一年费用" },
      { key: "funds_source", label: "资金来源 Source of Funds", value: "", section: 5, aiHint: "如：个人存款/父母资助/奖学金/贷款" },
      { key: "funds_from_self", label: "个人资金 Personal Funds (CAD)", value: "", section: 5 },
      { key: "funds_from_family", label: "家庭资助 Family Support (CAD)", value: "", section: 5 },
      { key: "funds_from_scholarship", label: "奖学金 Scholarship (CAD)", value: "", section: 5 },
      { key: "funds_from_loan", label: "贷款 Loan (CAD)", value: "", section: 5 },
      { key: "funds_from_other", label: "其他来源 Other Sources (CAD)", value: "", section: 5 },
      { key: "has_gic", label: "是否有GIC Has GIC", value: "", section: 5 },
      { key: "gic_amount", label: "GIC金额 GIC Amount (CAD)", value: "", section: 5, aiHint: "如有GIC请填写金额" },
      { key: "funds_details", label: "资金详情说明", value: "", section: 5, aiHint: "详细说明资金来源和金额分配" },
      
      // ===== 第7步：教育背景 =====
      { key: "highest_education", label: "最高学历 Highest Education", value: "", section: 6, aiHint: "如：High School/Bachelor/Master" },
      { key: "education_history", label: "教育经历 Education History", value: "", section: 6, aiHint: "列出高中以后所有学习经历，包括学校名称、地址、时间、专业、学位" },
      
      // ===== 第8步：工作经历 =====
      { key: "current_occupation", label: "当前职业状态 Current Occupation", value: "", section: 7, aiHint: "如：Student/Employed/Self-employed/Unemployed" },
      { key: "intended_occupation", label: "计划职业 Intended Occupation", value: "", section: 7, aiHint: "毕业后计划从事的职业" },
      { key: "employment_history", label: "工作经历 Employment History", value: "", section: 7, aiHint: "列出最近10年工作经历，包括公司名称、地址、职位、时间。无工作经验填 N/A" },
      
      // ===== 第9步：背景信息 =====
      { key: "travel_history", label: "旅行史 Travel History", value: "", section: 8, aiHint: "列出过去10年出境记录，包括国家、时间和目的" },
      { key: "previous_canada_visit", label: "是否曾访问加拿大 Previous Canada Visit", value: "", section: 8 },
      { key: "canada_visit_details", label: "加拿大访问详情 Canada Visit Details", value: "", section: 8, aiHint: "如选是，请说明时间、目的和停留时长" },
      { key: "previous_study_work_canada", label: "是否曾在加拿大学习/工作 Previous Study/Work in Canada", value: "", section: 8 },
      { key: "refusal_history", label: "拒签史 Refusal History", value: "", section: 8, aiHint: "如有任何国家的拒签经历请详细说明，无则填 No" },
      { key: "removal_order", label: "是否曾被遣返/驱逐 Removal Order", value: "", section: 8 },
      { key: "criminal_record", label: "犯罪记录 Criminal Record", value: "", section: 8, aiHint: "如无犯罪记录填 No" },
      { key: "military_service", label: "是否有军队服役经历 Military Service", value: "", section: 8 },
      { key: "military_details", label: "军队服役详情 Military Service Details", value: "", section: 8, aiHint: "如有请说明国家、军种、时间、军衔" },
      { key: "political_association", label: "是否有政治组织关联 Political Association", value: "", section: 8 },
      { key: "medical_condition", label: "健康状况 Medical Condition", value: "", section: 8, aiHint: "如有重大疾病请说明，无则填 Good health" },
      { key: "medical_exam_done", label: "是否已完成体检 Medical Exam Done", value: "", section: 8 },
      { key: "medical_exam_date", label: "体检日期 Medical Exam Date", value: "", section: 8, aiHint: "格式：YYYY-MM-DD" },
      
      // ===== 第10步：家庭信息 =====
      { key: "spouse_name", label: "配偶姓名 Spouse Name", value: "", section: 9 },
      { key: "spouse_dob", label: "配偶出生日期 Spouse DOB", value: "", section: 9, aiHint: "格式：YYYY-MM-DD" },
      { key: "spouse_citizenship", label: "配偶国籍 Spouse Citizenship", value: "", section: 9 },
      { key: "spouse_address", label: "配偶地址 Spouse Address", value: "", section: 9 },
      { key: "spouse_occupation", label: "配偶职业 Spouse Occupation", value: "", section: 9 },
      { key: "spouse_accompany", label: "配偶是否随行 Spouse Accompanying", value: "", section: 9 },
      { key: "marriage_date", label: "结婚日期 Marriage Date", value: "", section: 9, aiHint: "格式：YYYY-MM-DD" },
      { key: "children_count", label: "子女数量 Number of Children", value: "", section: 9 },
      { key: "children_details", label: "子女信息 Children Details", value: "", section: 9, aiHint: "包括姓名、出生日期、国籍、是否随行" },
      { key: "mother_name", label: "母亲姓名 Mother's Name", value: "", section: 9 },
      { key: "mother_dob", label: "母亲出生日期 Mother's DOB", value: "", section: 9 },
      { key: "mother_birthplace", label: "母亲出生地 Mother's Birthplace", value: "", section: 9 },
      { key: "mother_status", label: "母亲状态 Mother's Status", value: "", section: 9, aiHint: "如：Living/Deceased" },
      { key: "father_name", label: "父亲姓名 Father's Name", value: "", section: 9 },
      { key: "father_dob", label: "父亲出生日期 Father's DOB", value: "", section: 9 },
      { key: "father_birthplace", label: "父亲出生地 Father's Birthplace", value: "", section: 9 },
      { key: "father_status", label: "父亲状态 Father's Status", value: "", section: 9, aiHint: "如：Living/Deceased" },
      { key: "family_in_canada", label: "加拿大亲属 Family in Canada", value: "", section: 9, aiHint: "如有在加拿大的亲属请说明关系、姓名、身份，无则填 None" },
      
      // ===== 第11步：代理人信息 =====
      { key: "has_representative", label: "是否有代理人 Has Representative", value: "", section: 10 },
      { key: "representative_type", label: "代理人类型 Representative Type", value: "", section: 10, aiHint: "如：Immigration Consultant/Lawyer/Family Member/Friend" },
      { key: "representative_name", label: "代理人姓名 Representative Name", value: "", section: 10 },
      { key: "representative_rcic", label: "代理人RCIC编号 RCIC Number", value: "", section: 10, aiHint: "如为持牌顾问请填写" },
      { key: "representative_contact", label: "代理人联系方式 Representative Contact", value: "", section: 10 },
      { key: "paid_representative", label: "是否付费代理 Paid Representative", value: "", section: 10 },
    ],
  });

  const steps = [
    { title: "基本信息" },
    { title: "个人信息" },
    { title: "护照信息" },
    { title: "联系方式" },
    { title: "学习计划" },
    { title: "资金证明" },
    { title: "教育背景" },
    { title: "工作经历" },
    { title: "背景信息" },
    { title: "家庭信息" },
    { title: "代理人" },
  ];

  const currentFields = application.fields?.filter(f => f.section === currentStep) || [];

  function updateField(key: string, value: string) {
    setApplication((prev) => ({
      ...prev,
      fields: prev.fields?.map((f) =>
        f.key === key ? { ...f, value } : f
      ),
    }));
  }

  const optionalFields = ["uci", "student_id", "taiwan_id", "national_id", "us_pr_card", "alt_phone_number", "fax_number", 
    "other_name_details", "other_citizenship_country", "mailing_address", "gic_amount", "canada_visit_details", 
    "military_details", "medical_exam_date", "spouse_name", "spouse_dob", "spouse_citizenship", "spouse_address", 
    "spouse_occupation", "spouse_accompany", "marriage_date", "children_details", "representative_name", 
    "representative_rcic", "representative_contact"];

  const isStepComplete = () => {
    return currentFields.every(f => f.value.trim() !== "" || optionalFields.includes(f.key));
  };

  const renderField = (field: any) => {
    // 下拉选择框字段
    if (field.key === "sex") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Male">Male 男</option>
          <option value="Female">Female 女</option>
          <option value="Another gender">Another gender 其他</option>
        </select>
      );
    }
    
    if (field.key === "marital_status") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Single">Single 单身</option>
          <option value="Married">Married 已婚</option>
          <option value="Common-law">Common-law 同居</option>
          <option value="Divorced">Divorced 离异</option>
          <option value="Widowed">Widowed 丧偶</option>
          <option value="Separated">Separated 分居</option>
          <option value="Annulled Marriage">Annulled Marriage 婚姻无效</option>
        </select>
      );
    }
    
    if (field.key === "service_language") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="English">English 英语</option>
          <option value="French">French 法语</option>
        </select>
      );
    }
    
    if (field.key === "study_level") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Primary">Primary 小学</option>
          <option value="Secondary">Secondary 中学</option>
          <option value="Post-secondary - Certificate/Diploma">Certificate/Diploma 证书/文凭</option>
          <option value="Post-secondary - Bachelor's degree">Bachelor 本科</option>
          <option value="Post-secondary - Master's degree">Master 硕士</option>
          <option value="Post-secondary - Doctorate">Doctorate 博士</option>
          <option value="Other">Other 其他</option>
        </select>
      );
    }
    
    if (field.key === "current_occupation") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Student">Student 学生</option>
          <option value="Employed">Employed 在职</option>
          <option value="Self-employed">Self-employed 自雇</option>
          <option value="Unemployed">Unemployed 待业</option>
          <option value="Retired">Retired 退休</option>
          <option value="Homemaker">Homemaker 家庭主妇/夫</option>
        </select>
      );
    }

    if (field.key === "highest_education") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="None">None 无</option>
          <option value="Primary School">Primary School 小学</option>
          <option value="Secondary School">Secondary School 中学</option>
          <option value="Trade/Apprenticeship">Trade/Apprenticeship 职业培训</option>
          <option value="Non-university Certificate/Diploma">Non-university Certificate/Diploma 非大学证书/文凭</option>
          <option value="Bachelor's Degree">Bachelor's Degree 本科</option>
          <option value="Master's Degree">Master's Degree 硕士</option>
          <option value="Doctorate (PhD)">Doctorate (PhD) 博士</option>
        </select>
      );
    }

    if (field.key === "immigration_status") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Citizen">Citizen 公民</option>
          <option value="Permanent Resident">Permanent Resident 永久居民</option>
          <option value="Student">Student 学生</option>
          <option value="Worker">Worker 工作者</option>
          <option value="Visitor">Visitor 访客</option>
          <option value="Refugee">Refugee 难民</option>
          <option value="Other">Other 其他</option>
        </select>
      );
    }

    if (field.key === "phone_type") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Home">Home 家庭电话</option>
          <option value="Cell">Cell 手机</option>
          <option value="Business">Business 工作电话</option>
        </select>
      );
    }

    if (field.key === "representative_type") {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Immigration Consultant">Immigration Consultant 移民顾问</option>
          <option value="Lawyer">Lawyer 律师</option>
          <option value="Family Member">Family Member 家庭成员</option>
          <option value="Friend">Friend 朋友</option>
          <option value="Other">Other 其他</option>
        </select>
      );
    }

    // Yes/No 选择框
    const yesNoFields = ["used_other_name", "other_citizenship", "mailing_address_same", "has_gic", "has_caq",
      "previous_canada_visit", "previous_study_work_canada", "removal_order", "criminal_record", "military_service",
      "political_association", "medical_exam_done", "spouse_accompany", "has_representative", "paid_representative",
      "mother_status", "father_status"];
    
    if (yesNoFields.includes(field.key)) {
      return (
        <select
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        >
          <option value="">请选择</option>
          <option value="Yes">Yes 是</option>
          <option value="No">No 否</option>
          {(field.key === "mother_status" || field.key === "father_status") && (
            <>
              <option value="Living">Living 在世</option>
              <option value="Deceased">Deceased 已故</option>
            </>
          )}
        </select>
      );
    }

    // 多行文本框
    if (field.key.includes("history") || field.key.includes("details") || field.key.includes("address")) {
      return (
        <textarea
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          rows={4}
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.aiHint || `请输入${field.label}`}
        />
      );
    }

    // 日期输入框
    if (field.key.includes("date") || field.key.includes("dob") || field.key.includes("expiry")) {
      return (
        <input
          type="date"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
        />
      );
    }

    // 邮箱输入框
    if (field.key === "email") {
      return (
        <input
          type="email"
          className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          value={field.value}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.aiHint || `请输入${field.label}`}
        />
      );
    }

    // 默认文本输入框
    return (
      <input
        type="text"
        className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        value={field.value}
        onChange={(e) => updateField(field.key, e.target.value)}
        placeholder={field.aiHint || `请输入${field.label}`}
      />
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-lg" />
            <span className="font-semibold text-red-600">加移AI助理</span>
          </a>
          <a href={applicationsBackHref} className="text-slate-600 hover:text-slate-900">
            ← 返回申请列表
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">学签申请 Study Permit (IMM 1294)</h1>
          <p className="text-slate-600 mt-2">基于 IRCC 官方表格 · 完整版 · 共 {application.fields?.length || 0} 个字段</p>
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
                    ? "bg-red-600 text-white shadow-lg" 
                    : index < currentStep
                      ? "bg-green-100 text-green-700"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</span>
                <span>{step.title}</span>
                {index < currentStep && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold flex-shrink-0">{currentStep + 1}</span>
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
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
            
            <button
              onClick={() => {
                localStorage.setItem("current_application", JSON.stringify({ ...application, status: "draft" }));
                alert("草稿已保存！");
              }}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all"
            >
              保存草稿
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-medium
                           hover:from-red-700 hover:to-orange-600 transition-all shadow-lg"
              >
                下一步 →
              </button>
            ) : (
              <button
                onClick={async () => {
                  const payload = { ...application, status: "submitted" as const };
                  localStorage.setItem("current_application", JSON.stringify(payload));
                  try {
                    const res = await fetch("/api/member/applications/submit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "study-permit",
                        title: "学签申请",
                        applicationData: payload,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      let url = `/applications/study-permit/review?caseId=${data.caseId}`;
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
                  let url = "/applications/study-permit/review";
                  if (from) url += `?from=${encodeURIComponent(from)}`;
                  window.location.href = url;
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
          onClick={() => setAiHelpField({ label: "学签申请", hint: "关于 IMM 1294 表格的任何问题" })}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-orange-500 
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

export default function StudyPermitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50"><div className="text-center text-slate-600">加载中...</div></div>}>
      <StudyPermitPageContent />
    </Suspense>
  );
}
