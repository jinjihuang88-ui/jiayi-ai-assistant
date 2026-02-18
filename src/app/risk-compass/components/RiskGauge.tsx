"use client";

interface RiskGaugeProps {
  value: number; // 0-100
  size?: number;
}

export function RiskGauge({ value, size = 200 }: RiskGaugeProps) {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2 - 8;
  const cy = size * 0.6 - 16;
  const cx = size / 2;
  const circumference = Math.PI * radius; // half circle
  const clamped = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const getColor = () => {
    if (clamped <= 33) return "#00FF88";
    if (clamped <= 66) return "#00D4FF";
    if (clamped <= 85) return "#FFB800";
    return "#FF3366";
  };

  const pathD = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}`;

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size * 0.6} className="overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={pathD}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()})`,
            transition: "stroke-dashoffset 0.8s ease-out",
          }}
        />
      </svg>
      <p className="font-mono text-2xl font-bold mt-2" style={{ color: getColor() }}>
        {Math.round(clamped)}%
      </p>
      <p className="text-white/50 text-xs font-mono mt-0.5">综合风险指数 / Overall Risk Index</p>
    </div>
  );
}
