import React, { useState, useEffect } from "react";
import { Train, RotateCcw } from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { KpiCard } from "./KpiCard";

const REGION_OPTIONS: Array<{ id: string; name: string }> = [
  { id: "national", name: "全国" },
  { id: "huabei", name: "华北" },
  { id: "huadong", name: "华东" },
  { id: "huanan", name: "华南" },
  { id: "huazhong", name: "华中" },
  { id: "xinan", name: "西南" },
  { id: "xibei", name: "西北" },
  { id: "dongbei", name: "东北" },
];

export default TopBar;

export function TopBar() {
  const selectedRegion = useDataStore((s) => s.selectedRegion);
  const setSelectedRegion = useDataStore((s) => s.setSelectedRegion);
  const resetMock = useDataStore((s) => s.resetMock);
  const { totalKpis } = useDerivedStats();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div
      className="h-[70px] bg-gradient-to-b from-slate-900/90 to-slate-900/50 backdrop-blur border-b border-cyan-500/20 flex items-center justify-between px-6"
      style={{ boxShadow: "0 2px 20px rgba(34,211,238,0.08)" }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Train
            className="w-9 h-9 text-cyan-400"
            style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.8))" }}
          />
        </div>
        <div className="flex flex-col">
          <h1
            className="font-[Orbitron] text-2xl font-bold tracking-wider"
            style={{
              background: "linear-gradient(90deg, #22d3ee, #a5f3fc, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 20px rgba(34,211,238,0.4)",
            }}
          >
            铁路旅游运行监测大屏
          </h1>
          <span
            className="font-[Orbitron] text-[10px] tracking-[0.3em] text-cyan-400/70 mt-0.5"
            style={{ textShadow: "0 0 10px rgba(34,211,238,0.5)" }}
          >
            RAIL TOUR MONITOR
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 rounded-lg bg-slate-800/40 border border-cyan-500/20">
        {REGION_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedRegion(opt.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
              selectedRegion === opt.id
                ? "bg-cyan-500/90 text-white"
                : "text-slate-300 hover:text-white hover:bg-slate-700/50 border border-transparent hover:border-cyan-500/30"
            }`}
            style={
              selectedRegion === opt.id
                ? {
                    boxShadow:
                      "0 0 12px rgba(34,211,238,0.7), inset 0 0 8px rgba(165,243,252,0.3)",
                  }
                : {}
            }
          >
            {opt.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <KpiCard
          label="总开行线路数"
          value={totalKpis.totalRoutes}
          color="#22d3ee"
        />
        <KpiCard
          label="同比增幅"
          value={totalKpis.yoyGrowth * 100}
          suffix="%"
          color="#10b981"
        />
        <KpiCard
          label="累计客流(万人次)"
          value={totalKpis.totalPassengers}
          color="#f59e0b"
        />

        <div className="flex flex-col items-end ml-2">
          <div className="text-cyan-300 text-xs font-medium tracking-wide">
            {dateStr}
          </div>
          <div className="font-[Orbitron] text-lg text-white tracking-wider">
            {timeStr}
          </div>
        </div>

        <button
          onClick={resetMock}
          className="ml-2 w-9 h-9 rounded-lg bg-slate-800/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200"
          title="重置数据"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
