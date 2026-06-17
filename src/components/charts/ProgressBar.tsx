import React, { useEffect, useState } from 'react';
import { formatPercent } from '@/utils/format';
import { lightenColor } from '@/utils/color';

interface ProgressBarProps {
  value: number;
  color?: string;
  showLabel?: boolean;
  height?: number;
}

export default ProgressBar;

export function ProgressBar({ value, color = '#22d3ee', showLabel = true, height = 10 }: ProgressBarProps) {
  const [mounted, setMounted] = useState(false);
  const safeValue = Math.max(0, Math.min(1, value));

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const displayWidth = mounted ? `${safeValue * 100}%` : '0%';
  const gradientId = `progress-grad-${color.replace('#', '')}`;

  return (
    <div className="flex items-center gap-3 w-full">
      <div
        className="relative flex-1 rounded-full bg-slate-800 overflow-hidden"
        style={{ height }}
      >
        <svg
          width="0"
          height="0"
          style={{ position: 'absolute' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={lightenColor(color, 0.3)} />
            </linearGradient>
          </defs>
        </svg>
        <div
          className="h-full rounded-full relative"
          style={{
            width: displayWidth,
            background: `linear-gradient(90deg, ${color}, ${lightenColor(color, 0.3)})`,
            transition: 'width 1.2s ease-out',
            boxShadow: `0 0 10px ${color}80, inset 0 0 6px ${lightenColor(color, 0.4)}80`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full"
            style={{
              background: `linear-gradient(180deg, ${lightenColor(color, 0.5)}80 0%, transparent 100%)`,
            }}
          />
        </div>
      </div>
      {showLabel && (
        <span
          className="text-sm font-semibold font-[Orbitron] min-w-[52px] text-right"
          style={{ color: lightenColor(color, 0.15) }}
        >
          {formatPercent(safeValue)}
        </span>
      )}
    </div>
  );
}
