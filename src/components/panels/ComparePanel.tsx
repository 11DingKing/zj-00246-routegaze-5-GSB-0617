import { X, Trash2, GitCompare, Minus, Plus } from "lucide-react";
import { useDataStore } from "@/store/useDataStore";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { BarChart } from "@/components/charts/BarChart";
import type { BarChartItem } from "@/components/charts/BarChart";
import { formatNumber, formatPercent, typeName } from "@/utils/format";
import { getTrainTypeColor } from "@/utils/color";
import { cn } from "@/lib/utils";

export default function ComparePanel() {
  const comparePanelOpen = useDataStore((s) => s.comparePanelOpen);
  const toggleCompareRoute = useDataStore((s) => s.toggleCompareRoute);
  const clearCompareRoutes = useDataStore((s) => s.clearCompareRoutes);
  const setComparePanelOpen = useDataStore((s) => s.setComparePanelOpen);
  const { compareStats, routeMap } = useDerivedStats();
  const {
    compareRoutes,
    routeGrowth,
    maxGrowth,
    maxDailyTrips,
    maxTrips,
    maxOccupancy,
    maxPassengers,
  } = compareStats;

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

  const passengerData: BarChartItem[] = compareRoutes.map((route, idx) => ({
    label: route.name,
    value: route.totalPassengers,
    color: route.color,
    rank: idx + 1,
  }));

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
          {compareRoutes.map((route, idx) => (
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
              <button
                onClick={() => toggleCompareRoute(route.id)}
                className="ml-1 rounded p-0.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
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
              <h4 className="text-sm font-semibold text-white">累计客流</h4>
              <span className="font-orbitron text-[10px] text-slate-500">
                PASSENGERS
              </span>
            </div>
            <BarChart
              data={passengerData}
              showRank={false}
              unit="人"
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
                        route.totalPassengers === maxPassengers
                          ? "text-amber-400"
                          : "text-white",
                      )}
                    >
                      {formatNumber(route.totalPassengers)}
                    </span>
                    <span className="text-slate-500">人</span>
                    {route.totalPassengers === maxPassengers && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
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
                MOM
              </span>
            </div>
            <div className="space-y-3">
              {routeGrowth.map((g) => {
                const route = routeMap[g.routeId];
                const barWidth =
                  maxGrowth > 0
                    ? Math.min((Math.abs(g.growth) / maxGrowth) * 45, 45)
                    : 0;
                const isPositive = g.growth >= 0;
                return (
                  <div key={g.routeId}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: route.color }}
                        />
                        <span className="text-slate-400">{route.name}</span>
                      </div>
                      <span
                        className={cn(
                          "font-orbitron font-bold",
                          isPositive ? "text-emerald-400" : "text-rose-400",
                        )}
                      >
                        {isPositive ? "+" : ""}
                        {formatPercent(g.growth)}
                      </span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-slate-700/50">
                      <div className="absolute left-1/2 top-0 h-full w-px bg-slate-600" />
                      <div
                        className={cn(
                          "absolute top-0 h-full rounded-full",
                          isPositive
                            ? "left-1/2 bg-gradient-to-r from-emerald-500/60 to-emerald-400"
                            : "right-1/2 bg-gradient-to-l from-rose-500/60 to-rose-400",
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
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
              客流趋势对比 · 近30天
            </h4>
            <span className="font-orbitron text-[10px] text-slate-500">
              DAILY TRIPS
            </span>
          </div>
          <div className="h-48">
            <svg
              viewBox="0 0 620 192"
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
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor={route.color}
                      stopOpacity="0"
                    />
                  </linearGradient>
                ))}
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <g key={ratio}>
                  <line
                    x1="56"
                    y1={16 + ratio * 150}
                    x2="600"
                    y2={16 + ratio * 150}
                    stroke="#334155"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="48"
                    y={16 + ratio * 150 + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="Orbitron"
                  >
                    {Math.round(maxDailyTrips * (1 - ratio)).toLocaleString()}
                  </text>
                </g>
              ))}

              {compareRoutes.map((route) => {
                const points = route.dailyTrips.map((val, i) => {
                  const x = 56 + (i / 29) * 540;
                  const y = 166 - (val / maxDailyTrips) * 150;
                  return [x, y] as const;
                });
                const areaPath = `M${points.map(([x, y]) => `${x},${y}`).join(" L")} L600,176 L56,176 Z`;
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
                    x={56 + idx * 130}
                    y={2}
                    width="8"
                    height="8"
                    fill={route.color}
                    rx="2"
                  />
                  <text
                    x={70 + idx * 130}
                    y={9}
                    fontSize="10"
                    fill="#94a3b8"
                    dominantBaseline="middle"
                  >
                    {route.name}
                  </text>
                  <text
                    x={70 + idx * 130}
                    y={22}
                    fontSize="9"
                    fill={routeGrowth[idx]?.growth >= 0 ? "#34d399" : "#fb7185"}
                    fontFamily="Orbitron"
                    fontWeight="bold"
                  >
                    {routeGrowth[idx]?.growth >= 0 ? "↑" : "↓"}
                    {formatPercent(Math.abs(routeGrowth[idx]?.growth || 0))}
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
