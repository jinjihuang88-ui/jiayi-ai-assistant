"use client";

export interface RadarSeries {
  label: string;
  value: number; // 0-100
}

const AXES = [
  { key: "financial", label: "财务", labelEn: "Financial" },
  { key: "language", label: "语言", labelEn: "Language" },
  { key: "policy", label: "政策", labelEn: "Policy" },
  { key: "employer", label: "雇主", labelEn: "Employer" },
  { key: "background", label: "背景", labelEn: "Background" },
];

interface RadarChartProps {
  data: RadarSeries[];
  size?: number;
}

export function RadarChart({ data, size = 280 }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;

  const getPoint = (axisIndex: number, valueNorm: number) => {
    const angle = (axisIndex / AXES.length) * 2 * Math.PI - Math.PI / 2;
    const r = radius * (valueNorm / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = AXES.map((_, i) => {
    const d = data[i];
    return getPoint(i, d?.value ?? 0);
  });
  const pointsStr = polygonPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const axisLines = AXES.map((_, i) => {
    const end = getPoint(i, 100);
    return { x2: end.x, y2: end.y };
  });

  // 标签放在网格外侧：用半径的 1.28 倍距离，不是 0–100 的 valueNorm
  const labelDistance = radius * 1.28;
  const labelPoints = AXES.map((_, i) => {
    const angle = (i / AXES.length) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + labelDistance * Math.cos(angle),
      y: center + labelDistance * Math.sin(angle),
    };
  });

  return (
    <div
      className="inline-flex flex-col items-center"
      style={{ width: size, height: size, position: "relative" }}
    >
      {/* 仅图形用 SVG，无文字 */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          textRendering: "geometricPrecision",
          shapeRendering: "geometricPrecision",
        }}
      >
        {[1, 2, 3, 4].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(radius * level) / 4}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
        ))}
        <polygon
          points={pointsStr}
          fill="rgba(0, 255, 136, 0.15)"
          stroke="#00FF88"
          strokeWidth="2"
          style={{
            filter: "drop-shadow(0 0 8px rgba(0,255,136,0.4))",
            transition: "all 0.5s ease-out",
          }}
        />
      </svg>

      {/* 维度名称与数值用 HTML 渲染，按目标使用 data 中的 label */}
      {AXES.map((axis, i) => {
        const p = labelPoints[i];
        const d = data[i];
        const label = (d?.label && d.label.trim()) ? d.label : axis.label;
        return (
          <div
            key={axis.key + i}
            className="absolute text-center pointer-events-none"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="font-semibold text-white whitespace-nowrap"
              style={{ fontSize: "14px", marginBottom: "2px" }}
            >
              {label}
            </div>
            <div
              className="font-bold whitespace-nowrap"
              style={{ color: "#00FF88", fontSize: "18px" }}
            >
              {Math.round(d?.value ?? 0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
