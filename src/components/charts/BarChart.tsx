import React, { useEffect, useState } from 'react';
import { lightenColor, hexToRgba } from '@/utils/color';

export interface BarChartItem {
  label: string;
  value: number;
  color: string;
  rank?: number;
}

interface BarChartProps {
  data: BarChartItem[];
  barHeight?: number;
  showRank?: boolean;
  unit?: string;
  className?: string;
}

export default function BarChart({ data, barHeight = 28, showRank = true, unit = '' }: BarChartProps) {
  const [mounted, setMounted] = useState(false);
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const paddingTop = 8;
  const paddingBottom = 8;
  const rowGap = 10;
  const rankWidth = showRank ? 32 : 0;
  const labelWidth = 110;
  const valueWidth = 70;
  const viewBoxWidth = 600;
  const barAreaWidth = viewBoxWidth - rankWidth - labelWidth - valueWidth - 20;
  const viewBoxHeight = data.length * (barHeight + rowGap) + paddingTop + paddingBottom;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="w-full h-auto"
      preserveAspectRatio="none"
    >
      {data.map((item, index) => {
        const y = paddingTop + index * (barHeight + rowGap);
        const barWidthRatio = item.value / maxValue;
        const barWidth = mounted ? barWidthRatio * barAreaWidth : 0;
        const barX = rankWidth + labelWidth + 10;
        const gradientId = `bar-gradient-${index}-${item.label.replace(/\s/g, '')}`;

        return (
          <g key={`${item.label}-${index}`}>
            {showRank && (
              <g>
                <circle
                  cx={rankWidth / 2}
                  cy={y + barHeight / 2}
                  r={11}
                  fill={
                    item.rank !== undefined && item.rank <= 3
                      ? item.rank === 1
                        ? '#FBBF24'
                        : item.rank === 2
                        ? '#9CA3AF'
                        : '#D97706'
                      : '#334155'
                  }
                  style={{
                    filter:
                      item.rank !== undefined && item.rank <= 3
                        ? `drop-shadow(0 0 6px ${item.rank === 1 ? '#FBBF24' : item.rank === 2 ? '#9CA3AF' : '#D97706'})`
                        : 'none',
                  }}
                />
                <text
                  x={rankWidth / 2}
                  y={y + barHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={item.rank !== undefined && item.rank <= 3 ? '#1e293b' : '#94a3b8'}
                  fontSize={11}
                  fontWeight="bold"
                >
                  {item.rank ?? index + 1}
                </text>
              </g>
            )}

            <text
              x={rankWidth + 6}
              y={y + barHeight / 2}
              dominantBaseline="central"
              fill="#cbd5e1"
              fontSize={12}
            >
              {item.label}
            </text>

            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={item.color} />
                <stop offset="100%" stopColor={lightenColor(item.color, 0.35)} />
              </linearGradient>
            </defs>

            <rect
              x={barX}
              y={y + (barHeight - 18) / 2}
              width={barWidth}
              height={18}
              rx={4}
              fill={`url(#${gradientId})`}
              style={{
                transition: 'width 1.2s ease',
                filter: `drop-shadow(0 0 6px ${hexToRgba(item.color, 0.6)})`,
              }}
            />

            {mounted && barWidth > 40 && (
              <text
                x={barX + barWidth - 8}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={11}
                fontWeight="600"
              >
                {item.value.toLocaleString()}{unit}
              </text>
            )}

            <text
              x={viewBoxWidth - 8}
              y={y + barHeight / 2}
              textAnchor="end"
              dominantBaseline="central"
              fill="#e2e8f0"
              fontSize={12}
              fontWeight="600"
              fontFamily="Orbitron"
            >
              {item.value.toLocaleString()}{unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export { BarChart };
export type { BarChartProps };
