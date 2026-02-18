"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { GlassCard } from "./components/GlassCard";
import { StatusIndicator } from "./components/StatusIndicator";
import { RiskGauge } from "./components/RiskGauge";
import { RadarChart, type RadarSeries } from "./components/RadarChart";
import { PromoChatFab } from "./components/PromoChatFab";
import { downloadReportPdf } from "./lib/generateReportPdf";

const GOALS = [
  { id: "study", label: "学签", labelEn: "Study Permit" },
  { id: "work", label: "工签", labelEn: "Work Permit" },
  { id: "visitor", label: "访客签证", labelEn: "Visitor Visa" },
  { id: "ee", label: "Express Entry", labelEn: "Express Entry" },
  { id: "pnp", label: "省提名", labelEn: "Provincial Nominee" },
];

const EDUCATION_OPTIONS = [
  { id: "high_school", label: "高中", labelEn: "High School", score: 15 },
  { id: "college", label: "大专", labelEn: "College", score: 35 },
  { id: "bachelor", label: "本科", labelEn: "Bachelor", score: 55 },
  { id: "master", label: "硕士", labelEn: "Master", score: 75 },
  { id: "phd", label: "博士", labelEn: "PhD", score: 95 },
];

const WORK_YEARS_OPTIONS = [
  { id: "0", label: "不足1年", labelEn: "<1 year", value: 0 },
  { id: "1", label: "1–3年", labelEn: "1–3 years", value: 1 },
  { id: "3", label: "3–5年", labelEn: "3–5 years", value: 3 },
  { id: "5", label: "5年以上", labelEn: "5+ years", value: 5 },
];

const STUDY_LEVEL_OPTIONS = [
  { id: "college", label: "大专/学院", labelEn: "College", score: 40 },
  { id: "bachelor", label: "本科", labelEn: "Bachelor", score: 60 },
  { id: "master", label: "硕士", labelEn: "Master", score: 80 },
  { id: "phd", label: "博士", labelEn: "PhD", score: 95 },
];

const VISIT_PURPOSE_OPTIONS = [
  { id: "tourism", label: "旅游", labelEn: "Tourism", score: 50 },
  { id: "family", label: "探亲", labelEn: "Family Visit", score: 65 },
  { id: "business", label: "商务", labelEn: "Business", score: 70 },
];

type Step = 1 | 2 | 3 | 4;

const DISCLAIMER_ZH = "本评估仅供参考，不构成法律或移民建议；请咨询持牌顾问(RCIC)获取正式意见。";
const DISCLAIMER_EN = "This assessment is for reference only and does not constitute legal or immigration advice; consult an RCIC for formal advice.";

const RECOMMENDATIONS_BY_GOAL: Record<string, { zh: string[]; en: string[] }> = {
  study: {
    zh: [
      "建议尽早准备资金证明与学习计划(Study Plan)，以匹配学签与院校要求。",
      "语言成绩达到 CLB 5–7 可提升学签通过率，部分硕士/博士项目要求更高。",
      DISCLAIMER_ZH,
    ],
    en: [
      "Prepare proof of funds and study plan early to meet study permit and institution requirements.",
      "Language at CLB 5–7 improves approval; some master/PhD programs require higher scores.",
      DISCLAIMER_EN,
    ],
  },
  work: {
    zh: [
      "工签通常需雇主支持(LMIA 或豁免情形)；建议先确认岗位与 NOC 匹配。",
      "工作年限与语言成绩有助于封闭工签及后续移民路径。",
      DISCLAIMER_ZH,
    ],
    en: [
      "Work permits usually require employer support (LMIA or exemption); confirm NOC match.",
      "Work experience and language scores help for work permits and future immigration.",
      DISCLAIMER_EN,
    ],
  },
  visitor: {
    zh: [
      "建议准备充足资金证明与国内约束材料(工作、家庭)，以证明如期回国。",
      "访问目的明确(旅游/探亲/商务)与良好出入境记录有助于通过。",
      DISCLAIMER_ZH,
    ],
    en: [
      "Prepare proof of funds and ties to home country (job, family) to show intent to return.",
      "Clear visit purpose and good travel history support visitor visa approval.",
      DISCLAIMER_EN,
    ],
  },
  ee: {
    zh: [
      "Express Entry 依 CRS 打分；语言(CLB 7+)、学历、年龄、工作年限是主要因素。",
      "法语加分或省提名可显著提高邀请概率；建议针对性提升短板。",
      DISCLAIMER_ZH,
    ],
    en: [
      "Express Entry is CRS-based; language (CLB 7+), education, age, work experience matter most.",
      "French bonus or provincial nomination can greatly improve invitation chances.",
      DISCLAIMER_EN,
    ],
  },
  pnp: {
    zh: [
      "省提名各省要求不同，建议先确定目标省份与项目(技术、雇主、留学等)。",
      "语言、学历、雇主 offer 与省内经历通常为关键；满足最低要求后尽早入池。",
      DISCLAIMER_ZH,
    ],
    en: [
      "PNP requirements vary by province; identify target province and stream first.",
      "Language, education, job offer and provincial ties are key; enter pool once eligible.",
      DISCLAIMER_EN,
    ],
  },
};

function getRecommendationsForGoal(goal: string | null): { zh: string; en: string }[] {
  if (!goal || !RECOMMENDATIONS_BY_GOAL[goal]) {
    return [
      { zh: "建议根据所选目标准备相应材料并咨询持牌顾问(RCIC)。", en: "Prepare materials for your goal and consult an RCIC for advice." },
      { zh: DISCLAIMER_ZH, en: DISCLAIMER_EN },
    ];
  }
  const r = RECOMMENDATIONS_BY_GOAL[goal];
  return r.zh.map((zh, i) => ({ zh, en: r.en[i] }));
}

export default function RiskCompassPage() {
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState<string | null>(null);
  const [age, setAge] = useState(28);
  const [budget, setBudget] = useState(15);
  const [ielts, setIelts] = useState(6.0);
  const [education, setEducation] = useState<string>("bachelor");
  const [workYears, setWorkYears] = useState<string>("3");
  const [hasFrench, setHasFrench] = useState(false);
  const [hasJobOffer, setHasJobOffer] = useState(false);
  const [hasCanadaExperience, setHasCanadaExperience] = useState(false);
  const [intendedStudyLevel, setIntendedStudyLevel] = useState<string>("master");
  const [hasCanadaStudyBefore, setHasCanadaStudyBefore] = useState(false);
  const [visitPurpose, setVisitPurpose] = useState<string>("tourism");
  const [hasStableIncome, setHasStableIncome] = useState(true);
  const [previousCanadaVisit, setPreviousCanadaVisit] = useState(false);
  const [hasCanadaWorkBefore, setHasCanadaWorkBefore] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const compassSectionRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (step === 1 && goal) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setShowResult(true);
  };

  const handleBack = () => {
    if (showResult) setShowResult(false);
    else if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const canNext = step === 1 ? goal : true;

  const educationScore = EDUCATION_OPTIONS.find((e) => e.id === education)?.score ?? 50;
  const workYearsVal = WORK_YEARS_OPTIONS.find((w) => w.id === workYears)?.value ?? 1;
  const studyLevelScore = STUDY_LEVEL_OPTIONS.find((s) => s.id === intendedStudyLevel)?.score ?? 60;
  const visitPurposeScore = VISIT_PURPOSE_OPTIONS.find((v) => v.id === visitPurpose)?.score ?? 50;

  const riskScoreByGoal = (): number => {
    if (!goal) return 50;
    if (goal === "study") {
      return 100 - (budget / 30) * 25 - (ielts - 4) * 6 - (age >= 18 && age <= 35 ? 10 : age <= 45 ? 5 : 0)
        - educationScore * 0.1 - (hasCanadaStudyBefore ? 8 : 0) - Math.min(20, (studyLevelScore - 40) / 3);
    }
    if (goal === "work") {
      return 100 - (hasJobOffer ? 25 : 0) - workYearsVal * 4 - (ielts - 4) * 5 - (age <= 45 ? 8 : 3)
        - (hasCanadaWorkBefore ? 10 : 0) - (budget / 30) * 5;
    }
    if (goal === "visitor") {
      return 100 - (budget / 20) * 15 - (hasStableIncome ? 20 : 0) - visitPurposeScore * 0.2
        - (previousCanadaVisit ? 12 : 0) - (age >= 25 && age <= 55 ? 10 : 0);
    }
    if (goal === "ee" || goal === "pnp") {
      return 100 - (age / 50) * 15 - (ielts - 4) * 6 - educationScore * 0.12 - workYearsVal * 2
        - (hasFrench ? 8 : 0) - (hasCanadaExperience ? 8 : 0) - (hasJobOffer ? 5 : 0)
        - (budget / 30) * 5 + (goal === "ee" ? 5 : 3);
    }
    return 50;
  };

  const riskScore = Math.round(riskScoreByGoal());
  const clampedRisk = Math.min(95, Math.max(10, riskScore));
  const status: "low" | "medium" | "high" | "critical" =
    clampedRisk <= 33 ? "low" : clampedRisk <= 66 ? "medium" : clampedRisk <= 85 ? "high" : "critical";

  const goalLabel = goal ? GOALS.find((g) => g.id === goal)! : { label: "", labelEn: "" };
  const educationLabel = EDUCATION_OPTIONS.find((e) => e.id === education) || EDUCATION_OPTIONS[2];
  const workYearsLabel = WORK_YEARS_OPTIONS.find((w) => w.id === workYears) || WORK_YEARS_OPTIONS[1];
  const studyLevelLabel = STUDY_LEVEL_OPTIONS.find((s) => s.id === intendedStudyLevel) || STUDY_LEVEL_OPTIONS[1];
  const visitPurposeLabel = VISIT_PURPOSE_OPTIONS.find((v) => v.id === visitPurpose) || VISIT_PURPOSE_OPTIONS[0];

  const radarDataByGoal = (): RadarSeries[] => {
    if (!goal) return [];
    if (goal === "study") {
      return [
        { label: "资金准备", value: Math.min(100, 20 + budget * 2.5) },
        { label: "语言", value: Math.min(100, (ielts - 4) * 22) },
        { label: "学习计划", value: Math.min(100, 40 + studyLevelScore * 0.5 + (educationScore >= 55 ? 15 : 0)) },
        { label: "年龄适配", value: age >= 18 && age <= 35 ? 85 : age <= 45 ? 65 : 40 },
        { label: "背景", value: Math.min(100, educationScore * 0.5 + (hasCanadaStudyBefore ? 35 : 0)) },
      ];
    }
    if (goal === "work") {
      return [
        { label: "雇主支持", value: hasJobOffer ? 85 : 35 },
        { label: "工作年限", value: Math.min(100, 20 + workYearsVal * 18) },
        { label: "语言", value: Math.min(100, (ielts - 4) * 22) },
        { label: "年龄", value: Math.max(20, 80 - age) },
        { label: "背景", value: Math.min(100, 40 + workYearsVal * 10 + (hasCanadaWorkBefore ? 25 : 0)) },
      ];
    }
    if (goal === "visitor") {
      return [
        { label: "资金", value: Math.min(100, 25 + budget * 2.2) },
        { label: "国内约束", value: hasStableIncome ? 80 : 35 },
        { label: "访问目的", value: visitPurposeScore },
        { label: "访问史", value: previousCanadaVisit ? 75 : 45 },
        { label: "年龄", value: age >= 25 && age <= 55 ? 70 : 50 },
      ];
    }
    if (goal === "ee" || goal === "pnp") {
      return [
        { label: "语言", value: Math.min(100, (ielts - 4) * 20 + (hasFrench ? 18 : 0)) },
        { label: "学历", value: educationScore },
        { label: "工作经历", value: Math.min(100, 25 + workYearsVal * 15) },
        { label: "年龄", value: Math.max(20, 85 - age * 1.2) },
        { label: "背景", value: Math.min(100, 40 + (hasCanadaExperience ? 30 : 0) + (hasJobOffer ? 15 : 0)) },
      ];
    }
    return [];
  };

  const radarData = radarDataByGoal().length ? radarDataByGoal() : [
    { label: "财务", value: 50 },
    { label: "语言", value: 50 },
    { label: "政策", value: 50 },
    { label: "雇主", value: 50 },
    { label: "背景", value: 50 },
  ];

  const statusLabels: Record<string, { zh: string; en: string }> = {
    low: { zh: "低风险", en: "Low Risk" },
    medium: { zh: "中风险", en: "Medium Risk" },
    high: { zh: "较高风险", en: "High Risk" },
    critical: { zh: "高风险", en: "Critical Risk" },
  };

  const handleDownloadPdf = () => {
    downloadReportPdf({
      goal: goal || "",
      goalLabel: goalLabel.label,
      goalLabelEn: goalLabel.labelEn,
      age,
      budget,
      ielts,
      educationLabel: educationLabel.label,
      educationLabelEn: educationLabel.labelEn,
      workYearsLabel: workYearsLabel.label,
      workYearsLabelEn: workYearsLabel.labelEn,
      hasFrench,
      hasJobOffer,
      hasCanadaExperience,
      intendedStudyLevel: goal === "study" ? studyLevelLabel?.label : undefined,
      intendedStudyLevelEn: goal === "study" ? studyLevelLabel?.labelEn : undefined,
      hasCanadaStudyBefore: goal === "study" ? hasCanadaStudyBefore : undefined,
      visitPurpose: goal === "visitor" ? visitPurposeLabel?.label : undefined,
      visitPurposeEn: goal === "visitor" ? visitPurposeLabel?.labelEn : undefined,
      hasStableIncome: goal === "visitor" ? hasStableIncome : undefined,
      previousCanadaVisit: goal === "visitor" ? previousCanadaVisit : undefined,
      hasCanadaWorkBefore: goal === "work" ? hasCanadaWorkBefore : undefined,
      riskScore: clampedRisk,
      statusLabel: statusLabels[status].zh,
      statusLabelEn: statusLabels[status].en,
      radar: radarData.map((r) => ({ label: r.label, labelEn: r.label, value: Math.round(r.value) })),
      recommendations: getRecommendationsForGoal(goal),
    });
  };

  const scrollToCompass = () => {
    compassSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono">
      <PromoChatFab />
      <header className="border-b border-white/10 bg-black/90 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-white/70 hover:text-[#00FF88] transition-colors text-sm"
          >
            ← 进入网站首页 Enter Jiayi
          </Link>
          <span className="text-[#00FF88] text-sm tracking-widest">
            JIAYI · RISK COMPASS & AI
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Promo hero: two cards - AI 顾问 | 风险指南针 */}
        <section className="mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
            加移 · 风险指南针与 AI 顾问
          </h1>
          <p className="text-white/50 text-sm text-center mb-10">
            Jiayi · Risk Compass & AI Consultant · 推广页
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="p-6 flex flex-col">
              <h2 className="text-lg font-semibold mb-2" style={{ color: "#00FF88" }}>
                AI 顾问 / AI Consultant
              </h2>
              <p className="text-white/70 text-sm mb-4 flex-1">
                与 AI 对话，获取学签、工签、移民路径的初步整理与信息建议。仅供参考，不替代持牌顾问。
                <span className="block mt-2 text-white/50 text-xs">
                  Chat with AI for study/work/immigration path overview. For reference only; not a substitute for an RCIC.
                </span>
              </p>
              <p className="text-[#00FF88]/90 text-xs mt-2">
                点击页面右下角 AI 机器人图标打开对话 · Click the AI icon at bottom-right to chat
              </p>
            </GlassCard>
            <GlassCard className="p-6 flex flex-col">
              <h2 className="text-lg text-[#00FF88] font-semibold mb-2">
                风险指南针 / Risk Compass
              </h2>
              <p className="text-white/70 text-sm mb-4 flex-1">
                选择目标、填写年龄与预算及语言成绩，获取风险概览与五维评估。结果仅供参考。
                <span className="block mt-2 text-white/50 text-xs">
                  Select goal, age, budget and IELTS to get a risk overview and five-dimension assessment. Results are for reference only.
                </span>
              </p>
              <button
                type="button"
                onClick={scrollToCompass}
                className="w-full text-center px-4 py-3 rounded-lg bg-[#00FF88]/20 border border-[#00FF88]/50 text-[#00FF88] font-semibold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all text-sm"
              >
                使用风险指南针 Use Risk Compass
              </button>
            </GlassCard>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl border border-white/30 text-white/80 hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              进入加移网站首页 Enter Jiayi Homepage
            </Link>
          </div>
        </section>

        {/* Risk Compass wizard + results */}
        <section ref={compassSectionRef}>
          {!showResult ? (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  风险指南针 / Risk Compass
                </h2>
                <p className="text-white/50 text-sm">
                  选择目标 · 年龄与预算 · 语言成绩 · 获取风险概览 / Select goal, age & budget, language score
                </p>
              </div>

              <div className="flex justify-center gap-2 mb-10">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step >= s ? "bg-[#00FF88] shadow-[0_0_8px_#00FF88]" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <GlassCard className="p-8 md:p-10">
                {step === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg text-[#00FF88] font-semibold">
                      第一步 Step 1：选择目标 Select Goal
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {GOALS.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGoal(g.id)}
                          className={`px-4 py-3 rounded-lg border text-left transition-all ${
                            goal === g.id
                              ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]"
                              : "border-white/20 hover:border-white/40 text-white/80"
                          }`}
                        >
                          <span className="block font-medium">{g.label}</span>
                          <span className="text-xs opacity-70">{g.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <h3 className="text-lg text-[#00FF88] font-semibold">
                      第二步 Step 2：年龄与预算 Age & Budget
                    </h3>
                    <div>
                      <div className="flex justify-between text-sm text-white/70 mb-2">
                        <span>年龄 Age</span>
                        <span className="text-[#00D4FF]">{age}</span>
                      </div>
                      <input
                        type="range"
                        min="18"
                        max="55"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="risk-compass-slider w-full"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-white/70 mb-2">
                        <span>预算 Budget (万加元 CAD 10k)</span>
                        <span className="text-[#00D4FF]">{budget}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="risk-compass-slider w-full"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg text-[#00FF88] font-semibold">
                      第三步 Step 3：语言 Language
                    </h3>
                    <div>
                      <div className="flex justify-between text-sm text-white/70 mb-2">
                        <span>IELTS 总分 Overall</span>
                        <span className="text-[#00D4FF]">{ielts}</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="9"
                        step="0.5"
                        value={ielts}
                        onChange={(e) => setIelts(Number(e.target.value))}
                        className="risk-compass-slider w-full"
                      />
                    </div>
                    {(goal === "ee" || goal === "pnp") && (
                      <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                        <span className="text-sm text-white/80">有法语成绩 TEF/TCF French</span>
                        <button
                          type="button"
                          onClick={() => setHasFrench((v) => !v)}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                            hasFrench ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"
                          }`}
                        >
                          {hasFrench ? "有 Yes" : "无 No"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg text-[#00FF88] font-semibold">
                      第四步 Step 4：{goal === "study" ? "学签相关" : goal === "work" ? "工签相关" : goal === "visitor" ? "访客相关" : "学历与经历"} / Goal-specific
                    </h3>

                    {goal === "study" && (
                      <>
                        <div>
                          <p className="text-sm text-white/70 mb-2">当前最高学历 Current Education</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {EDUCATION_OPTIONS.map((e) => (
                              <button key={e.id} type="button" onClick={() => setEducation(e.id)}
                                className={`px-3 py-2 rounded-lg border text-left text-sm transition-all ${education === e.id ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]" : "border-white/20 hover:border-white/40 text-white/80"}`}>
                                {e.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-white/70 mb-2">计划就读层次 Intended Level</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {STUDY_LEVEL_OPTIONS.map((s) => (
                              <button key={s.id} type="button" onClick={() => setIntendedStudyLevel(s.id)}
                                className={`px-3 py-2 rounded-lg border text-center text-sm transition-all ${intendedStudyLevel === s.id ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]" : "border-white/20 hover:border-white/40 text-white/80"}`}>
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                          <span className="text-sm text-white/80">曾有加拿大学习经历 Canada Study Before</span>
                          <button type="button" onClick={() => setHasCanadaStudyBefore((v) => !v)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${hasCanadaStudyBefore ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                            {hasCanadaStudyBefore ? "有 Yes" : "无 No"}
                          </button>
                        </div>
                      </>
                    )}

                    {goal === "work" && (
                      <>
                        <div>
                          <p className="text-sm text-white/70 mb-2">相关工作经验 Related Work Experience</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {WORK_YEARS_OPTIONS.map((w) => (
                              <button key={w.id} type="button" onClick={() => setWorkYears(w.id)}
                                className={`px-3 py-2 rounded-lg border text-center text-sm transition-all ${workYears === w.id ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]" : "border-white/20 hover:border-white/40 text-white/80"}`}>
                                {w.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                            <span className="text-sm text-white/80">加拿大雇主 offer Job Offer</span>
                            <button type="button" onClick={() => setHasJobOffer((v) => !v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${hasJobOffer ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                              {hasJobOffer ? "有 Yes" : "无 No"}
                            </button>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                            <span className="text-sm text-white/80">曾有加拿大工作经历 Canada Work Before</span>
                            <button type="button" onClick={() => setHasCanadaWorkBefore((v) => !v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${hasCanadaWorkBefore ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                              {hasCanadaWorkBefore ? "有 Yes" : "无 No"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {goal === "visitor" && (
                      <>
                        <div>
                          <p className="text-sm text-white/70 mb-2">访问目的 Purpose of Visit</p>
                          <div className="grid grid-cols-3 gap-2">
                            {VISIT_PURPOSE_OPTIONS.map((v) => (
                              <button key={v.id} type="button" onClick={() => setVisitPurpose(v.id)}
                                className={`px-3 py-2 rounded-lg border text-center text-sm transition-all ${visitPurpose === v.id ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]" : "border-white/20 hover:border-white/40 text-white/80"}`}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                            <span className="text-sm text-white/80">有稳定收入/工作 Stable Income / Job</span>
                            <button type="button" onClick={() => setHasStableIncome((v) => !v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${hasStableIncome ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                              {hasStableIncome ? "有 Yes" : "无 No"}
                            </button>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                            <span className="text-sm text-white/80">曾访问过加拿大 Previous Canada Visit</span>
                            <button type="button" onClick={() => setPreviousCanadaVisit((v) => !v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${previousCanadaVisit ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                              {previousCanadaVisit ? "有 Yes" : "无 No"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {(goal === "ee" || goal === "pnp") && (
                      <>
                        <div>
                          <p className="text-sm text-white/70 mb-2">最高学历 Highest Education</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {EDUCATION_OPTIONS.map((e) => (
                              <button key={e.id} type="button" onClick={() => setEducation(e.id)}
                                className={`px-3 py-2 rounded-lg border text-left text-sm transition-all ${education === e.id ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]" : "border-white/20 hover:border-white/40 text-white/80"}`}>
                                {e.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-white/70 mb-2">相关工作经验 Work Experience</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {WORK_YEARS_OPTIONS.map((w) => (
                              <button key={w.id} type="button" onClick={() => setWorkYears(w.id)}
                                className={`px-3 py-2 rounded-lg border text-center text-sm transition-all ${workYears === w.id ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]" : "border-white/20 hover:border-white/40 text-white/80"}`}>
                                {w.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                            <span className="text-sm text-white/80">加拿大雇主 offer Job Offer</span>
                            <button type="button" onClick={() => setHasJobOffer((v) => !v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${hasJobOffer ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                              {hasJobOffer ? "有 Yes" : "无 No"}
                            </button>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-white/20 px-4 py-3">
                            <span className="text-sm text-white/80">加拿大学习/工作/访问经历 Canada Experience</span>
                            <button type="button" onClick={() => setHasCanadaExperience((v) => !v)}
                              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${hasCanadaExperience ? "bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/50" : "bg-white/5 text-white/60 border border-white/20"}`}>
                              {hasCanadaExperience ? "有 Yes" : "无 No"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-5 py-2 rounded-lg border border-white/30 text-white/80 hover:bg-white/10 transition-colors text-sm"
                  >
                    上一步 Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canNext}
                    className="px-6 py-2 rounded-lg bg-[#00FF88] text-black font-semibold hover:shadow-[0_0_20px_#00FF88] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    {step === 4 ? "生成报告 Generate Report" : "下一步 Next"}
                  </button>
                </div>
              </GlassCard>
            </>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  风险概览 Risk Overview
                </h2>
                <StatusIndicator status={status} />
              </div>

              <GlassCard className="p-8 flex flex-col items-center">
                <RiskGauge value={clampedRisk} size={220} />
              </GlassCard>

              <GlassCard className="p-8 flex flex-col items-center">
                <p className="text-white/60 text-sm mb-4">五维评估 Five Dimensions</p>
                <RadarChart data={radarData} size={280} />
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-[#00FF88] font-semibold mb-4">系统建议 Recommendations</h3>
                <ul className="space-y-3 text-white/80 text-sm">
                  {getRecommendationsForGoal(goal).map((rec, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#00FF88] shrink-0">•</span>
                      <span>
                        {rec.zh}
                        <span className="block text-white/50 text-xs mt-0.5">{rec.en}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* 评估依据与数据来源 */}
              <GlassCard className="p-6">
                <h3 className="text-[#00FF88] font-semibold mb-3">
                  评估依据与数据来源 / Assessment Basis & Data Sources
                </h3>
                <div className="space-y-4 text-white/80 text-sm">
                  <div>
                    <p className="font-medium text-white/90 mb-1">综合风险指数如何得出 How the overall risk score is calculated</p>
                    <p className="text-white/70">
                      <strong>学签、工签、访客、EE、省提名采用不同评估参数与权重。</strong>学签侧重资金准备、语言、学习计划与年龄；工签侧重雇主支持、工作年限与加拿大工作经历；访客侧重资金、国内约束(稳定收入)、访问目的与访问史；EE/省提名侧重年龄、学历、语言(含法语)、工作年限与加拿大经历。各目标均参照 IRCC 及常见项目与平台 AI 顾问知识库，非移民局官方算法。
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Study, work, visitor, EE and PNP use different parameters and weights. All reference IRCC-style criteria and platform knowledge base; not an official IRCC algorithm.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-white/90 mb-1">五维评估（按目标不同维度名称与计算不同）Five dimensions – goal-specific</p>
                    <ul className="list-disc list-inside space-y-1 text-white/70">
                      <li><strong className="text-white/90">学签：</strong>资金准备、语言、学习计划、年龄适配、背景(学历/加国学习经历)。</li>
                      <li><strong className="text-white/90">工签：</strong>雇主支持、工作年限、语言、年龄、背景(加国工作经历)。</li>
                      <li><strong className="text-white/90">访客：</strong>资金、国内约束、访问目的、访问史、年龄。</li>
                      <li><strong className="text-white/90">EE/省提名：</strong>语言、学历、工作经历、年龄、背景(加拿大经历/雇主 offer)。</li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <p className="font-medium text-white/90 mb-1">数据来源说明 Data source disclaimer</p>
                    <p className="text-white/70">
                      本评估参数与权重参照加拿大移民局(IRCC)及各省官网公开的常见项目条件、以及加移 AI 顾问知识库中的学签/工签/EE/省提名等一般性要求整理，非官方打分或审批算法，结果仅供参考。具体分数与政策以 IRCC 及各省官网为准。
                    </p>
                    <p className="text-white/50 text-xs mt-1">
                      Parameters and weights reference IRCC and provincial program criteria and Jiayi AI knowledge base. Not an official scoring or decision algorithm. For official requirements, refer to IRCC and provincial government websites.
                    </p>
                  </div>
                </div>
              </GlassCard>

              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-8 py-4 rounded-xl bg-[#00FF88]/20 border-2 border-[#00FF88] text-[#00FF88] font-semibold hover:shadow-[0_0_24px_rgba(0,255,136,0.4)] transition-all"
                >
                  下载 PDF 报告 Download PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowResult(false)}
                  className="text-white/50 hover:text-white/80 text-sm"
                >
                  重新评估 Re-assess
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Legal & risk disclaimer - 法律风险提示 */}
        <footer className="mt-20 pt-10 border-t border-white/10">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm">
            <h3 className="font-semibold text-amber-400 mb-3">
              法律与风险提示 / Legal & Risk Disclaimer
            </h3>
            <p className="text-white/80 mb-3">
              本页面及风险指南针、AI 顾问工具由加移(Jiayi)平台提供，仅供信息参考与自我评估使用，不构成任何法律、移民或专业建议。移民与签证申请结果取决于个案情况及移民局裁量，平台不对使用本页面或工具所产生的任何决定或后果承担责任。如需正式法律或移民建议，请咨询加拿大持牌移民顾问(RCIC)或律师。
            </p>
            <p className="text-white/50 text-xs">
              This page and the Risk Compass and AI Consultant tools are provided by Jiayi for informational and self-assessment purposes only. They do not constitute legal, immigration, or professional advice. Immigration and visa outcomes depend on individual cases and officer discretion. Jiayi is not responsible for any decisions or outcomes arising from the use of this page or tools. For formal legal or immigration advice, please consult a licensed Canadian immigration consultant (RCIC) or lawyer.
            </p>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-white/50 hover:text-[#00FF88] text-sm transition-colors"
            >
              进入加移网站首页 Enter Jiayi Homepage
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
