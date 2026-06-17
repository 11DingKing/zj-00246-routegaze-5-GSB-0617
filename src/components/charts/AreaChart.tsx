import React, { useEffect, useMemo, useState } from 'react';
import { hexToRgba, lightenColor } from '@/utils/color';

interface AreaChartProps {
  labels: string[];
  values: number[];
  color?: string;
  height?: number;
}

export default AreaChart;

export function AreaChart({ labels, values, color = '#22d3ee', height = 160 }: AreaChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const padding = { top: 20, right: 20, bottom: 30, left: 10 };
  const labelStep = 20;
  const width = labels.length * labelStep + padding.left + padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxVal = Math.max(...values, 1);
  const gradientId = `area-gradient-${color.replace('#', '')}`;
  const lineGradientId = `line-gradient-${color.replace('#', '')}`;

  const points = useMemo(() => {
    return values.map((v, i) => ({
      x: padding.left + i * labelStep,
      y: padding.top + chartHeight - (v / maxVal) * chartHeight,
      value: v,
    }));
  }, [values, maxVal, chartHeight]);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const areaPath =
    `M ${points[0].x} ${padding.top + chartHeight} ` +
    points.map((p) => `L ${p.x} ${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`;

  const pathLength = useMemo(() => {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }, [points]);

  const visibleLabelIndices = [0, 6, 13, 20, 27, 29].filter((i) => i < labels.length);

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lightenColor(color, 0.2)} stopOpacity={0.7} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={lineGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lightenColor(color, 0.1)} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={`grid-${i}`}
            x1={padding.left}
            y1={padding.top + chartHeight - ratio * chartHeight}
            x2={width - padding.right}
            y2={padding.top + chartHeight - ratio * chartHeight}
            stroke="#1e293b"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 1.5s ease',
          }}
        />

        <path
          d={linePath}
          fill="none"
          stroke={`url(#${lineGradientId})`}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: mounted ? 0 : pathLength,
            transition: 'stroke-dashoffset 1.8s ease-in-out',
            filter: `drop-shadow(0 0 4px ${hexToRgba(color, 0.8)})`,
          }}
        />

        {points.map((p, i) => {
          const isRecent = i >= values.length - 5;
          const isHovered = hoverIndex === i;
          const showDot = isRecent || isHovered;
          return (
            <g key={`dot-${i}`}>
              {showDot && (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? lightenColor(color, 0.3) : color}
                    style={{
                      filter: `drop-shadow(0 0 ${isHovered ? 8 : 4}px ${hexToRgba(color, 0.9)})`,
                      transition: 'all 0.2s ease',
                    }}
                  />
                  {isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={9}
                      fill="none"
                      stroke={color}
                      strokeWidth={1}
                      opacity={0.4}
                    />
                  )}
                </>
              )}
              <rect
                x={p.x - labelStep / 2}
                y={padding.top}
                width={labelStep}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          );
        })}

        {visibleLabelIndices.map((i) => (
          <text
            key={`label-${i}`}
            x={points[i].x}
            y={height - 10}
            textAnchor="middle"
            fill="#64748b"
            fontSize={10}
          >
            {labels[i]?.slice(5) || ''}
          </text>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="absolute pointer-events-none px-2 py-1 rounded-md bg-slate-800/95 border border-cyan-500/30 text-xs text-white shadow-lg"
          style={{
            left: `${(points[hoverIndex].x / width) * 100}%`,
            top: `${(points[hoverIndex].y / height) * 100 - 8}%`,
            transform: 'translate(-50%, -100%)',
            whiteSpace: 'nowrap',
            boxShadow: `0 0 12px ${hexToRgba(color, 0.5)}`,
          }}
        >
          <div className="text-slate-400 text-[10px]">{labels[hoverIndex]}</div>
          <div className="font-[Orbitron] font-bold text-cyan-300">
            {values[hoverIndex].toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
