import React, { useEffect, useState } from 'react';
import { formatNumber } from '@/utils/format';

export interface DonutItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutItem[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

function DonutChart({ data, size = 200, thickness = 24, centerLabel, centerValue, className }: DonutChartProps) {
  const [mounted, setMounted] = useState(false);
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  let accumulated = 0;
  const segments = data.map((item) => {
    const percent = item.value / total;
    const dashLength = percent * circumference;
    const dashOffset = -accumulated * circumference;
    accumulated += percent;
    return {
      ...item,
      percent,
      dashLength,
      dashOffset,
    };
  });

  return (
    <div
      className="flex flex-col items-center"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'scale(1)' : 'scale(0.9)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={thickness}
        />
        {segments.map((seg, i) => (
          <circle
            key={`${seg.name}-${i}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
            strokeDashoffset={seg.dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            style={{
              filter: `drop-shadow(0 0 6px ${seg.color}80)`,
            }}
          />
        ))}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#94a3b8"
          fontSize={12}
        >
          {centerLabel || '总计'}
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#f1f5f9"
          fontSize={22}
          fontFamily="Orbitron"
          fontWeight="bold"
        >
          {centerValue || formatNumber(total)}
        </text>
      </svg>

      <div className="mt-4 w-full grid grid-cols-1 gap-2">
        {segments.map((seg, i) => (
          <div key={`legend-${i}`} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  background: seg.color,
                  boxShadow: `0 0 6px ${seg.color}`,
                }}
              />
              <span className="text-slate-300">{seg.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-100 font-semibold font-[Orbitron]">
                {formatNumber(seg.value)}
              </span>
              <span className="text-slate-500 w-12 text-right">
                {(seg.percent * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonutChart;
export type { DonutChartProps };
