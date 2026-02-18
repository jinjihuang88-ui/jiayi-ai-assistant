"use client";

import { useState, useCallback } from "react";
import StatusIndicator from "./components/StatusIndicator";
import GlassCard from "./components/GlassCard";
import RiskGauge from "./components/RiskGauge";
import RadarChart from "./components/RadarChart";

/* ── Types ── */
type Goal = "pr" | "work" | "study" | null;
type IELTSRange = "below5" | "5to6" | "6to7" | "7plus" | null;

interface FormData {
  goal: Goal;
  age: number;
  budget: number;
  ielts: IELTSRange;
}

interface AssessmentResult {
  overallScore: number;
  dimensions: { label: string; labelCn: string; value: number }[];
  recommendations: string[];
}

/* ── Risk Calculation ── */
function computeRisk(data: FormData): AssessmentResult {
  const { goal, age, budget, ielts } = data;

  // Financial dimension (lower budget = higher risk)
  let financial = 50;
  if (goal === "study") {
    financial = budget >= 40000 ? 25 : budget >= 20000 ? 45 : 75;
  } else if (goal === "work") {
    financial = budget >= 20000 ? 20 : budget >= 10000 ? 40 : 65;
  } else {
    financial = budget >= 60000 ? 20 : budget >= 30000 ? 40 : 70;
  }

  // Language dimension
  let language = 50;
  if (ielts === "7plus") language = 15;
  else if (ielts === "6to7") language = 35;
  else if (ielts === "5to6") language = 60;
  else language = 85;

  // Policy dimension (age/goal alignment)
  let policy = 40;
  if (goal === "study") {
    policy = age < 25 ? 20 : age < 35 ? 40 : 70;
  } else if (goal === "work") {
    policy = age < 35 ? 25 : age < 45 ? 40 : 60;
  } else {
    // PR
    policy = age < 30 ? 20 : age < 40 ? 35 : age < 50 ? 55 : 75;
  }

  // Employer dimension (estimated)
  let employer = 45;
  if (goal === "work") {
    employer = budget >= 20000 ? 30 : 55;
  } else if (goal === "pr") {
    employer = age < 35 ? 35 : 50;
  } else {
    employer = 30;
  }

  // Background dimension (estimated baseline)
  const background = 25;

  const dims = [
    { label: "FINANCIAL", labelCn: "财务", value: financial },
    { label: "LANGUAGE", labelCn: "语言", value: language },
    { label: "POLICY", labelCn: "政策", value: policy },
    { label: "EMPLOYER", labelCn: "雇主", value: employer },
    { label: "BACKGROUND", labelCn: "背景", value: background },
  ];

  const overall = Math.round(
    dims.reduce((sum, d) => sum + d.value, 0) / dims.length
  );

  const recommendations: string[] = [];
  if (language > 50)
    recommendations.push(
      "IELTS/CELPIP score improvement recommended before application submission."
    );
  if (financial > 50)
    recommendations.push(
      "Financial profile below threshold. Consider increasing proof of funds."
    );
  if (policy > 50)
    recommendations.push(
      "Age-policy alignment suboptimal. Consult RCIC for alternative pathways."
    );
  if (overall <= 35)
    recommendations.push(
      "Profile shows strong indicators. Proceed with application preparation."
    );
  if (recommendations.length === 0)
    recommendations.push(
      "Moderate risk profile detected. Professional consultation advised."
    );

  return { overallScore: overall, dimensions: dims, recommendations };
}

/* ── Budget Formatter ── */
function formatBudget(v: number) {
  return `CAD $${v.toLocaleString()}`;
}

const GOAL_OPTIONS: { value: Goal; label: string; labelCn: string; desc: string }[] = [
  { value: "pr", label: "PR", labelCn: "永久居民", desc: "Permanent Residence via Express Entry / PNP" },
  { value: "work", label: "WORK", labelCn: "工作签证", desc: "Work Permit / LMIA / Open Work Permit" },
  { value: "study", label: "STUDY", labelCn: "学习签证", desc: "Study Permit / Student Direct Stream" },
];

const IELTS_OPTIONS: { value: IELTSRange; label: string; band: string }[] = [
  { value: "below5", label: "Below 5.0", band: "< 5.0" },
  { value: "5to6", label: "5.0 - 5.9", band: "5.0-5.9" },
  { value: "6to7", label: "6.0 - 6.9", band: "6.0-6.9" },
  { value: "7plus", label: "7.0+", band: "7.0+" },
];

/* ── Page Component ── */
export default function RiskCompassPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    goal: null,
    age: 28,
    budget: 30000,
    ielts: null,
  });
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canProceed = useCallback(() => {
    if (currentStep === 0) return formData.goal !== null;
    if (currentStep === 1) return true;
    if (currentStep === 2) return formData.ielts !== null;
    return false;
  }, [currentStep, formData]);

  function nextStep() {
    if (currentStep < 2) {
      setCurrentStep((s) => s + 1);
    } else {
      runAnalysis();
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  function runAnalysis() {
    setIsAnalyzing(true);
    // Simulate processing
    setTimeout(() => {
      const r = computeRisk(formData);
      setResult(r);
      setIsAnalyzing(false);
      setCurrentStep(3);
    }, 2200);
  }

  function reset() {
    setCurrentStep(0);
    setFormData({ goal: null, age: 28, budget: 30000, ielts: null });
    setResult(null);
  }

  return (
    <main className="min-h-screen bg-[#000000] text-[#e0e0e8] selection:bg-[#00AAFF]/20 selection:text-[#00AAFF]">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00AAFF 1px, transparent 1px), linear-gradient(90deg, #00AAFF 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00AAFF]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-[#1a1a3e]/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg border border-[#00AAFF]/30 flex items-center justify-center bg-[#00AAFF]/5 group-hover:border-[#00AAFF]/60 transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00AAFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div>
                <span className="font-mono text-sm font-bold tracking-widest text-[#e0e0e8]">
                  Jiayi.co
                </span>
                <span className="block text-[10px] font-mono text-[#555588] tracking-wider">
                  RISK COMPASS v2.0
                </span>
              </div>
            </a>
          </div>
          <StatusIndicator />
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-[#e0e0e8] mb-2">
            Immigration Risk Assessment
          </h1>
          <p className="text-sm font-mono text-[#555588] tracking-wider">
            DIAGNOSTIC TOOL // POWERED BY JIAYI ANALYTICS ENGINE
          </p>
        </div>

        {/* Progress bar */}
        {currentStep < 3 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {["SELECT GOAL", "AGE & BUDGET", "LANGUAGE"].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                      i < currentStep
                        ? "border-[#00FF88] bg-[#00FF88]/10 text-[#00FF88]"
                        : i === currentStep
                          ? "border-[#00AAFF] bg-[#00AAFF]/10 text-[#00AAFF] shadow-[0_0_10px_rgba(0,170,255,0.3)]"
                          : "border-[#333355] text-[#333355]"
                    }`}
                  >
                    {i < currentStep ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono tracking-wider hidden md:inline ${
                      i === currentStep ? "text-[#00AAFF]" : i < currentStep ? "text-[#00FF88]" : "text-[#333355]"
                    }`}
                  >
                    {label}
                  </span>
                  {i < 2 && (
                    <div
                      className={`hidden md:block w-16 lg:w-24 h-px mx-2 ${
                        i < currentStep ? "bg-[#00FF88]/40" : "bg-[#1a1a3e]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 0 && (
          <GlassCard className="p-8 md:p-10">
            <div className="mb-6">
              <p className="text-xs font-mono text-[#00AAFF] tracking-widest mb-1">
                STEP 01
              </p>
              <h2 className="text-xl font-bold font-mono text-[#e0e0e8]">
                Select Immigration Goal
              </h2>
              <p className="text-sm font-mono text-[#555588] mt-1">
                Choose your primary immigration pathway
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setFormData((d) => ({ ...d, goal: opt.value }))
                  }
                  className={`relative p-6 rounded-xl border-2 text-left transition-all duration-300 group ${
                    formData.goal === opt.value
                      ? "border-[#00AAFF] bg-[#00AAFF]/5 shadow-[0_0_20px_rgba(0,170,255,0.15)]"
                      : "border-[#1a1a3e] hover:border-[#333366] bg-[#050510]"
                  }`}
                >
                  <span
                    className={`block text-2xl font-mono font-bold mb-2 transition-colors ${
                      formData.goal === opt.value
                        ? "text-[#00AAFF]"
                        : "text-[#444466] group-hover:text-[#7777aa]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="block text-sm font-mono text-[#888899] mb-1">
                    {opt.labelCn}
                  </span>
                  <span className="block text-xs font-mono text-[#555566] leading-relaxed">
                    {opt.desc}
                  </span>
                  {formData.goal === opt.value && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#00AAFF] flex items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#000"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </GlassCard>
        )}

        {currentStep === 1 && (
          <GlassCard className="p-8 md:p-10">
            <div className="mb-8">
              <p className="text-xs font-mono text-[#00AAFF] tracking-widest mb-1">
                STEP 02
              </p>
              <h2 className="text-xl font-bold font-mono text-[#e0e0e8]">
                Age & Budget
              </h2>
              <p className="text-sm font-mono text-[#555588] mt-1">
                Input your age and available budget
              </p>
            </div>

            {/* Age */}
            <div className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <label className="text-xs font-mono text-[#888899] tracking-wider">
                  AGE
                </label>
                <span className="text-2xl font-mono font-bold text-[#00AAFF]">
                  {formData.age}
                </span>
              </div>
              <input
                type="range"
                min={18}
                max={65}
                value={formData.age}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, age: +e.target.value }))
                }
                className="risk-slider w-full"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#444466] mt-2">
                <span>18</span>
                <span>30</span>
                <span>45</span>
                <span>65</span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-baseline justify-between mb-4">
                <label className="text-xs font-mono text-[#888899] tracking-wider">
                  AVAILABLE BUDGET
                </label>
                <span className="text-2xl font-mono font-bold text-[#00FF88]">
                  {formatBudget(formData.budget)}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={formData.budget}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, budget: +e.target.value }))
                }
                className="risk-slider risk-slider-green w-full"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#444466] mt-2">
                <span>$5K</span>
                <span>$50K</span>
                <span>$100K</span>
                <span>$200K</span>
              </div>
            </div>
          </GlassCard>
        )}

        {currentStep === 2 && (
          <GlassCard className="p-8 md:p-10">
            <div className="mb-6">
              <p className="text-xs font-mono text-[#00AAFF] tracking-widest mb-1">
                STEP 03
              </p>
              <h2 className="text-xl font-bold font-mono text-[#e0e0e8]">
                IELTS Score
              </h2>
              <p className="text-sm font-mono text-[#555588] mt-1">
                Select your overall IELTS band score
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {IELTS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setFormData((d) => ({ ...d, ielts: opt.value }))
                  }
                  className={`p-5 rounded-xl border-2 text-center transition-all duration-300 ${
                    formData.ielts === opt.value
                      ? "border-[#00AAFF] bg-[#00AAFF]/5 shadow-[0_0_20px_rgba(0,170,255,0.15)]"
                      : "border-[#1a1a3e] hover:border-[#333366] bg-[#050510]"
                  }`}
                >
                  <span
                    className={`block text-xl font-mono font-bold mb-1 ${
                      formData.ielts === opt.value
                        ? "text-[#00AAFF]"
                        : "text-[#666688]"
                    }`}
                  >
                    {opt.band}
                  </span>
                  <span className="block text-xs font-mono text-[#555566]">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Analyzing state */}
        {isAnalyzing && (
          <GlassCard className="p-12 text-center">
            <div className="inline-block mb-6">
              <div className="w-16 h-16 rounded-full border-2 border-[#00AAFF]/30 border-t-[#00AAFF] animate-spin" />
            </div>
            <p className="text-lg font-mono text-[#00AAFF] mb-2">
              ANALYZING RISK PROFILE
            </p>
            <p className="text-xs font-mono text-[#555588] animate-pulse">
              Cross-referencing IRCC policy matrix... Calculating dimensional
              risk scores...
            </p>
          </GlassCard>
        )}

        {/* Result */}
        {currentStep === 3 && result && (
          <div className="space-y-8 animate-fade-in">
            {/* Overall risk gauge */}
            <GlassCard className="p-8 md:p-10">
              <div className="text-center mb-6">
                <p className="text-xs font-mono text-[#00AAFF] tracking-widest mb-1">
                  ANALYSIS COMPLETE
                </p>
                <h2 className="text-xl font-bold font-mono text-[#e0e0e8]">
                  Risk Assessment Result
                </h2>
              </div>
              <RiskGauge
                score={result.overallScore}
                label="COMPOSITE IMMIGRATION RISK INDEX"
              />
            </GlassCard>

            {/* Radar chart */}
            <GlassCard className="p-8 md:p-10">
              <div className="text-center mb-4">
                <h3 className="text-sm font-mono font-bold text-[#00AAFF] tracking-widest">
                  DIMENSIONAL ANALYSIS
                </h3>
                <p className="text-xs font-mono text-[#555588] mt-1">
                  5-axis risk decomposition
                </p>
              </div>
              <RadarChart dimensions={result.dimensions} />
            </GlassCard>

            {/* Recommendations */}
            <GlassCard className="p-8 md:p-10">
              <h3 className="text-sm font-mono font-bold text-[#00AAFF] tracking-widest mb-4">
                SYSTEM RECOMMENDATIONS
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#050510] border border-[#1a1a3e]"
                  >
                    <span className="text-[#FFB800] font-mono text-xs mt-0.5">
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    <p className="text-sm font-mono text-[#aaaacc] leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="relative px-8 py-4 rounded-xl bg-[#00AAFF]/10 border border-[#00AAFF]/40 text-[#00AAFF] font-mono font-bold text-sm tracking-wider hover:bg-[#00AAFF]/20 hover:shadow-[0_0_30px_rgba(0,170,255,0.2)] transition-all duration-300"
              >
                <span className="absolute inset-0 rounded-xl animate-pulse bg-[#00AAFF]/5 pointer-events-none" />
                DOWNLOAD PDF REPORT
              </button>
              <a
                href="/chat"
                className="px-8 py-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] font-mono font-bold text-sm tracking-wider hover:bg-[#00FF88]/20 transition-all duration-300 text-center"
              >
                CONSULT AI ADVISOR
              </a>
              <button
                onClick={reset}
                className="px-8 py-4 rounded-xl border border-[#333355] text-[#555588] font-mono font-bold text-sm tracking-wider hover:border-[#555577] hover:text-[#7777aa] transition-all duration-300"
              >
                RESET ASSESSMENT
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {currentStep < 3 && !isAnalyzing && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-xl border font-mono text-sm tracking-wider transition-all duration-300 ${
                currentStep === 0
                  ? "border-[#1a1a2e] text-[#333344] cursor-not-allowed"
                  : "border-[#333355] text-[#888899] hover:border-[#555577] hover:text-[#aaaacc]"
              }`}
            >
              BACK
            </button>
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-xl font-mono text-sm font-bold tracking-wider transition-all duration-300 ${
                canProceed()
                  ? "bg-[#00AAFF]/10 border border-[#00AAFF]/40 text-[#00AAFF] hover:bg-[#00AAFF]/20 hover:shadow-[0_0_20px_rgba(0,170,255,0.2)]"
                  : "bg-[#0a0a1a] border border-[#1a1a2e] text-[#333344] cursor-not-allowed"
              }`}
            >
              {currentStep === 2 ? "RUN ANALYSIS" : "NEXT"}
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center pb-8">
          <p className="text-[10px] font-mono text-[#333355] tracking-wider">
            JIAYI RISK COMPASS v2.0 // FOR REFERENCE ONLY // NOT LEGAL ADVICE
          </p>
          <p className="text-[10px] font-mono text-[#222244] mt-1">
            This tool does not provide immigration or legal services. Consult a
            licensed RCIC for professional advice.
          </p>
        </footer>
      </div>
    </main>
  );
}
