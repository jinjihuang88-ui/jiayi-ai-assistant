"use client";

import { useEffect, useState } from "react";

interface RadarChartProps {
  dimensions: {
    label: string;
    labelCn: string;
    value: number; // 0-100
  }[];
}

export default function RadarChart({ dimensions }: RadarChartProps) {
  const [animatedValues, setAnimatedValues] = useState(dimensions.map(() => 0));

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      setAnimatedValues(dimensions.map((d) => d.value * eased));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [dimensions]);

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 110;
  const levels = 5;

  function getPoint(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  function getLabelPoint(index: number) {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const r = maxRadius + 30;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  // Grid lines
  const gridLines = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius;
    const points = dimensions
      .map((_, j) => {
        const angle = (Math.PI * 2 * j) / dimensions.length - Math.PI / 2;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      })
      .join(" ");
    return points;
  });

  // Axis lines
  const axisLines = dimensions.map((_, i) => {
    const angle = (Math.PI * 2 * i) / dimensions.length - Math.PI / 2;
    return {
      x2: cx + maxRadius * Math.cos(angle),
      y2: cy + maxRadius * Math.sin(angle),
    };
  });

  // Data polygon
  const dataPoints = animatedValues
    .map((v, i) => {
      const p = getPoint(i, v);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="radarGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00AAFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00AAFF" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Grid */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#1a1a3e"
            strokeWidth={i === levels - 1 ? 1.5 : 0.5}
            opacity={0.6}
          />
        ))}

        {/* Axes */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={line.x2}
            y2={line.y2}
            stroke="#1a1a3e"
            strokeWidth="0.5"
            opacity={0.6}
          />
        ))}

        {/* Data polygon fill */}
        <polygon
          points={dataPoints}
          fill="url(#radarFill)"
          stroke="#00AAFF"
          strokeWidth="2"
          filter="url(#radarGlow)"
        />

        {/* Data points */}
        {animatedValues.map((v, i) => {
          const p = getPoint(i, v);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#00AAFF"
              stroke="#000"
              strokeWidth="1"
              filter="url(#radarGlow)"
            />
          );
        })}

        {/* Labels */}
        {dimensions.map((d, i) => {
          const lp = getLabelPoint(i);
          return (
            <g key={i}>
              <text
                x={lp.x}
                y={lp.y - 6}
                textAnchor="middle"
                fill="#00AAFF"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {d.label}
              </text>
              <text
                x={lp.x}
                y={lp.y + 8}
                textAnchor="middle"
                fill="#555588"
                fontSize="9"
                fontFamily="monospace"
              >
                {d.labelCn}
              </text>
              <text
                x={lp.x}
                y={lp.y + 20}
                textAnchor="middle"
                fill="#888"
                fontSize="10"
                fontFamily="monospace"
              >
                {Math.round(animatedValues[i])}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
