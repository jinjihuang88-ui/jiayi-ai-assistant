"use client";

import { useEffect, useState } from "react";

interface RiskGaugeProps {
  score: number; // 0-100
  label: string;
}

export default function RiskGauge({ score, label }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setAnimatedScore(Math.round(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  // SVG arc math
  const radius = 120;
  const cx = 150;
  const cy = 150;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle; // 240 degrees
  const sweepAngle = (animatedScore / 100) * totalAngle;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(cx: number, cy: number, r: number, startAngleDeg: number, endAngleDeg: number) {
    const start = polarToCartesian(cx, cy, r, endAngleDeg);
    const end = polarToCartesian(cx, cy, r, startAngleDeg);
    const largeArc = endAngleDeg - startAngleDeg <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  const bgArc = describeArc(cx, cy, radius, startAngle, endAngle);
  const valueArc = describeArc(cx, cy, radius, startAngle, startAngle + sweepAngle);

  // Color based on score
  const getColor = (s: number) => {
    if (s <= 30) return "#00FF88"; // neon green - safe
    if (s <= 60) return "#FFB800"; // amber - warning
    return "#FF3355"; // red - high risk
  };

  const getRiskLevel = (s: number) => {
    if (s <= 30) return { text: "LOW RISK", textCn: "低风险" };
    if (s <= 60) return { text: "MODERATE RISK", textCn: "中等风险" };
    return { text: "HIGH RISK", textCn: "高风险" };
  };

  const color = getColor(animatedScore);
  const riskLevel = getRiskLevel(animatedScore);

  return (
    <div className="flex flex-col items-center">
      <svg width="300" height="220" viewBox="0 0 300 220" className="drop-shadow-2xl">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF88" />
            <stop offset="50%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF3355" />
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((tick) => {
          const angle = startAngle + (tick / 100) * totalAngle;
          const innerPoint = polarToCartesian(cx, cy, radius - 14, angle);
          const outerPoint = polarToCartesian(cx, cy, radius + 14, angle);
          return (
            <line
              key={tick}
              x1={innerPoint.x}
              y1={innerPoint.y}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="#333355"
              strokeWidth={tick % 50 === 0 ? 2 : 1}
              opacity={0.6}
            />
          );
        })}

        {/* Value arc */}
        {animatedScore > 0 && (
          <path
            d={valueArc}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        )}

        {/* Center score */}
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill={color}
          fontSize="52"
          fontFamily="monospace"
          fontWeight="bold"
          filter="url(#glow)"
        >
          {animatedScore}
        </text>

        {/* Score label */}
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fill="#7777aa"
          fontSize="12"
          fontFamily="monospace"
          letterSpacing="2"
        >
          RISK INDEX
        </text>

        {/* Risk level text */}
        <text
          x={cx}
          y={cy + 38}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="3"
        >
          {riskLevel.text}
        </text>
      </svg>

      <div className="mt-2 text-center">
        <p className="text-sm font-mono" style={{ color }}>{riskLevel.textCn}</p>
        <p className="text-xs text-[#555588] font-mono mt-1">{label}</p>
      </div>
    </div>
  );
}
