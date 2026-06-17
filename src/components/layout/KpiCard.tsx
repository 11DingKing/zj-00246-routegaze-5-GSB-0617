import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  trend?: number;
  color: string;
}

export default KpiCard;

export function KpiCard({ label, value, suffix, trend, color }: KpiCardProps) {
  const displayValue = useCountUp(value);

  return (
    <div className="relative bg-slate-900/70 backdrop-blur border border-cyan-500/20 rounded-lg p-3 overflow-hidden min-w-[140px]">
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-slate-400 text-xs mb-1">{label}</div>
          <div className="font-[Orbitron] text-2xl font-bold text-white">
            {displayValue.toLocaleString()}
            {suffix && (
              <span className="text-sm text-slate-400 ml-0.5">{suffix}</span>
            )}
          </div>
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-xs mb-1 ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-0.5" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5" />
            )}
            <span>{Math.abs(trend * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
