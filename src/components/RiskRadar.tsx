"use client";

import { RiskScores } from "@/lib/types";

const dimensions = [
  { key: "commercial" as const, label: "Commercial" },
  { key: "technical" as const, label: "Technical" },
  { key: "financial" as const, label: "Financial" },
  { key: "leadership" as const, label: "Leadership" },
  { key: "esg" as const, label: "ESG" },
  { key: "regulatory" as const, label: "Regulatory" },
  { key: "competitive" as const, label: "Competitive" },
];

function polarToCartesian(angle: number, radius: number, cx: number, cy: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Weak";
  return "Critical";
}

export function RiskRadar({ scores }: { scores: RiskScores }) {
  const cx = 150;
  const cy = 150;
  const maxR = 110;
  const angleStep = 360 / dimensions.length;

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = dimensions.map((dim, i) => {
    const angle = i * angleStep;
    const val = scores[dim.key] / 100;
    return polarToCartesian(angle, maxR * val, cx, cy);
  });

  const pathData =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
      {/* Radar SVG */}
      <div className="relative flex-shrink-0">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Grid */}
          {gridLevels.map((level) => {
            const points = dimensions
              .map((_, i) => {
                const p = polarToCartesian(i * angleStep, maxR * level, cx, cy);
                return `${p.x},${p.y}`;
              })
              .join(" ");
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines */}
          {dimensions.map((_, i) => {
            const p = polarToCartesian(i * angleStep, maxR, cx, cy);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="rgba(99,102,241,0.2)"
            stroke="rgba(99,102,241,0.8)"
            strokeWidth="2"
          />

          {/* Data points */}
          {dataPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#fff" strokeWidth="1.5" />
          ))}

          {/* Labels */}
          {dimensions.map((dim, i) => {
            const p = polarToCartesian(i * angleStep, maxR + 22, cx, cy);
            return (
              <text
                key={dim.key}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.6)"
                fontSize="11"
                fontWeight="500"
              >
                {dim.label}
              </text>
            );
          })}
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold ${scoreColor(scores.overall)}`}>
              {scores.overall}
            </span>
            <span className="text-xs text-zinc-400 mt-1">{scoreLabel(scores.overall)}</span>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="flex flex-col gap-3 min-w-[200px]">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Score Breakdown
        </h3>
        {dimensions.map((dim) => {
          const val = scores[dim.key];
          return (
            <div key={dim.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{dim.label}</span>
                <span className={`font-semibold ${scoreColor(val)}`}>{val}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${val}%`,
                    background:
                      val >= 75
                        ? "linear-gradient(90deg, #34d399, #10b981)"
                        : val >= 50
                          ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                          : "linear-gradient(90deg, #f87171, #ef4444)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OverallScoreBadge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          r="54"
          fill="none"
          stroke={score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {scoreLabel(score)}
        </span>
      </div>
    </div>
  );
}
