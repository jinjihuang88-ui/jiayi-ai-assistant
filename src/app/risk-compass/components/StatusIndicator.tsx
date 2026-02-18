"use client";

type Status = "low" | "medium" | "high" | "critical";

const statusConfig: Record<
  Status,
  { label: string; labelEn: string; color: string; glow: string; bg: string }
> = {
  low: {
    label: "低风险",
    labelEn: "Low Risk",
    color: "text-[#00FF88]",
    glow: "shadow-[0_0_12px_#00FF88]",
    bg: "bg-[#00FF88]/20",
  },
  medium: {
    label: "中风险",
    labelEn: "Medium Risk",
    color: "text-[#00D4FF]",
    glow: "shadow-[0_0_12px_#00D4FF]",
    bg: "bg-[#00D4FF]/20",
  },
  high: {
    label: "较高风险",
    labelEn: "High Risk",
    color: "text-[#FFB800]",
    glow: "shadow-[0_0_12px_#FFB800]",
    bg: "bg-[#FFB800]/20",
  },
  critical: {
    label: "高风险",
    labelEn: "Critical Risk",
    color: "text-[#FF3366]",
    glow: "shadow-[0_0_12px_#FF3366]",
    bg: "bg-[#FF3366]/20",
  },
};

export function StatusIndicator({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={
        "inline-flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-sm font-semibold " +
        config.color +
        " " +
        config.bg +
        " " +
        config.glow
      }
    >
      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
      {config.label} <span className="opacity-80 font-normal">/ {config.labelEn}</span>
    </span>
  );
}
