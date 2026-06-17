import {
  X,
  Trash2,
  GitCompare,
  Minus,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { BarChart } from "@/components/charts/BarChart";
import type { BarChartItem } from "@/components/charts/BarChart";
import { formatNumber, formatPercent, typeName } from "@/utils/format";
import { getTrainTypeColor } from "@/utils/color";
import { cn } from "@/lib/utils";
import type { Route } from "@/types";

function calcMomGrowth(route: Route): number {
  let first = 0;
  let second = 0;
  for (let i = 0; i < 15; i++) first += route.dailyTrips[i] ?? 0;
  for (let i = 15; i < 30; i++) second += route.dailyTrips[i] ?? 0;
  return first > 0 ? (second - first) / first : 0;
}

export default function ComparePanel() {
  const compareRouteIds = useDataStore((s) => s.compareRouteIds);
  const comparePanelOpen = useDataStore((s) => s.comparePanelOpen);
  const toggleCompareRoute = useDataStore((s) => s.toggleCompareRoute);
  const clearCompareRoutes = useDataStore((s) => s.clearCompareRoutes);
  const setComparePanelOpen = useDataStore((s) => s.setComparePanelOpen);
  const { routeMap } = useDerivedStats();

  const compareRoutes = compareRouteIds
    .map((id) => routeMap[id])
    .filter(Boolean) as Route[];

  if (compareRoutes.length === 0) return null;

  const tripsData: BarChartItem[] = compareRoutes.map((route, idx) => ({
    label: route.name,
    value: route.tripsLastMonth,
    color: route.color,
    rank: idx + 1,
  }));

  const occupancyData: BarChartItem[] = compareRoutes.map((route, idx) => ({
    label: route.name,
    value: Math.round(route.occupancy * 1000) / 10,
    color: route.color,
    rank: idx + 1,
  }));

  const momData: BarChartItem[] = compareRoutes.map((route, idx) => ({
    label: route.name,
    value: Math.round(calcMomGrowth(route) * 1000) / 10,
    color: route.color,
    rank: idx + 1,
  }));

  const maxTrips = Math.max(...compareRoutes.map((r) => r.tripsLastMonth));
  const maxOccupancy = Math.max(...compareRoutes.map((r) => r.occupancy));

  const globalMaxDaily = Math.max(
    ...compareRoutes.flatMap((r) => r.dailyTrips),
    1,
  );

  return (
    <div
      className={cn(
        "fixed left-1/2 bottom-6 z-40 w-[calc(100%-3rem)] max-w-5xl -translate-x-1/2 rounded-xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl shadow-cyan-900/50 backdrop-blur-xl transition-all duration-500",
        comparePanelOpen
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none",
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-700/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <GitCompare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white">专线对比</h3>
            <p className="text-xs text-slate-400">
              已选择{" "}
              <span className="font-orbitron text-cyan-400">
                {compareRoutes.length}
              </span>{" "}
              条专线进行对比
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCompareRoutes}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空对比
          </button>
          <button
            onClick={() => setComparePanelOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-5">
        <div className="mb-5 flex flex-wrap gap-2">
          {compareRoutes.map((route, idx) => {
            const mom = calcMomGrowth(route);
            return (
              <div
                key={route.id}
                className="group flex items-center gap-2 rounded-lg border px-3 py-1.5"
                style={{
                  borderColor: `${route.color}50`,
                  backgroundColor: `${route.color}10`,
                }}
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: route.color }}
                >
                  {idx + 1}
                </div>
                <span className="text-sm font-medium text-white">
                  {route.name}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${getTrainTypeColor(route.type)}30`,
                    color: getTrainTypeColor(route.type),
                  }}
                >
                  {typeName(route.type)}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium",
                    mom >= 0
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400",
                  )}
                >
                  {mom >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {mom >= 0 ? "+" : ""}
                  {(mom * 100).toFixed(1)}%
                </span>
                <button
                  onClick={() => toggleCompareRoute(route.id)}
                  className="ml-1 rounded p-0.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">月开行趟次</h4>
              <span className="font-orbitron text-[10px] text-slate-500">
                TRIPS
              </span>
            </div>
            <BarChart
              data={tripsData}
              showRank={false}
              unit="列"
              barHeight={24}
            />
            <div className="mt-3 space-y-1.5">
              {compareRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-slate-400">{route.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-orbitron font-bold",
                        route.tripsLastMonth === maxTrips
                          ? "text-cyan-400"
                          : "text-white",
                      )}
                    >
                      {formatNumber(route.tripsLastMonth)}
                    </span>
                    <span className="text-slate-500">列</span>
                    {route.tripsLastMonth === maxTrips && (
                      <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-400">
                        最高
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">平均上座率</h4>
              <span className="font-orbitron text-[10px] text-slate-500">
                OCCUPANCY
              </span>
            </div>
            <BarChart
              data={occupancyData}
              showRank={false}
              unit="%"
              barHeight={24}
            />
            <div className="mt-3 space-y-1.5">
              {compareRoutes.map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-slate-400">{route.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-orbitron font-bold",
                        route.occupancy === maxOccupancy
                          ? "text-emerald-400"
                          : "text-white",
                      )}
                    >
                      {formatPercent(route.occupancy)}
                    </span>
                    {route.occupancy === maxOccupancy && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        最高
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">环比增幅</h4>
              <span className="font-orbitron text-[10px] text-slate-500">
                MoM
              </span>
            </div>
            <BarChart data={momData} showRank={false} unit="%" barHeight={24} />
            <div className="mt-3 space-y-1.5">
              {compareRoutes.map((route) => {
                const mom = calcMomGrowth(route);
                const maxMom = Math.max(
                  ...compareRoutes.map((r) => calcMomGrowth(r)),
                );
                return (
                  <div
                    key={route.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: route.color }}
                      />
                      <span className="text-slate-400">{route.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-orbitron font-bold",
                          mom === maxMom ? "text-amber-400" : "text-white",
                        )}
                      >
                        {mom >= 0 ? "+" : ""}
                        {(mom * 100).toFixed(1)}%
                      </span>
                      {mom === maxMom && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                          最优
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">
              日开行趋势对比 · 近30天
            </h4>
            <span className="text-[10px] text-slate-500">
              统一量纲 · 前15天 vs 后15天
            </span>
          </div>
          <div className="h-48">
            <svg
              viewBox="0 0 640 192"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                {compareRoutes.map((route) => (
                  <linearGradient
                    key={route.id}
                    id={`trend-gradient-${route.id}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={route.color}
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor={route.color}
                      stopOpacity="0"
                    />
                  </linearGradient>
                ))}
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = 10 + ratio * 160;
                const val = Math.round(globalMaxDaily * (1 - ratio));
                return (
                  <g key={ratio}>
                    <line
                      x1="50"
                      y1={y}
                      x2="620"
                      y2={y}
                      stroke="#334155"
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="46"
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              <line
                x1={50 + (14 / 29) * 570}
                y1="10"
                x2={50 + (14 / 29) * 570}
                y2="170"
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="6 3"
              />
              <text
                x={50 + (7 / 29) * 570}
                y="185"
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
              >
                前15天
              </text>
              <text
                x={50 + (22 / 29) * 570}
                y="185"
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
              >
                后15天
              </text>

              {compareRoutes.map((route) => {
                const points = route.dailyTrips.map((val, i) => {
                  const x = 50 + (i / 29) * 570;
                  const y = 170 - (val / globalMaxDaily) * 160;
                  return [x, y] as const;
                });
                const areaPath = `M${points.map(([x, y]) => `${x},${y}`).join(" L")} L620,170 L50,170 Z`;
                const linePath = `M${points.map(([x, y]) => `${x},${y}`).join(" L")}`;

                return (
                  <g key={route.id}>
                    <path
                      d={areaPath}
                      fill={`url(#trend-gradient-${route.id})`}
                      style={{ transition: "all 0.5s ease" }}
                    />
                    <path
                      d={linePath}
                      fill="none"
                      stroke={route.color}
                      strokeWidth="2"
                      style={{ transition: "all 0.5s ease" }}
                    />
                  </g>
                );
              })}

              {compareRoutes.map((route, idx) => (
                <g key={`legend-${route.id}`}>
                  <rect
                    x={50 + idx * 120}
                    y={2}
                    width="8"
                    height="8"
                    fill={route.color}
                    rx="2"
                  />
                  <text
                    x={62 + idx * 120}
                    y={9}
                    fontSize="10"
                    fill="#94a3b8"
                    dominantBaseline="middle"
                  >
                    {route.name}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Plus className="h-3.5 w-3.5" />
            <span>
              提示：按住{" "}
              <kbd className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[10px]">
                Shift
              </kbd>{" "}
              点击线路，或右键点击线路添加到对比篮
            </span>
          </div>
          <button
            onClick={() => setComparePanelOpen(false)}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            收起面板 ↑
          </button>
        </div>
      </div>

      {!comparePanelOpen && (
        <button
          onClick={() => setComparePanelOpen(true)}
          className="absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400"
        >
          <GitCompare className="h-4 w-4" />
          展开对比面板 ({compareRoutes.length})
        </button>
      )}
    </div>
  );
}
