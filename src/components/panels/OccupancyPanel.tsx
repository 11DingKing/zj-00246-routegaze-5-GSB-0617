import { useDerivedStats } from "@/hooks/useDerivedStats";
import { useDataStore } from "@/store/useDataStore";
import PanelCard from "@/components/layout/PanelCard";
import ProgressBar from "@/components/charts/ProgressBar";
import { typeName } from "@/utils/format";
import { getTrainTypeColor } from "@/utils/color";
import { UserCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OccupancyPanel() {
  const { topOccupancy, routeMap } = useDerivedStats();
  const compareRouteIds = useDataStore((s) => s.compareRouteIds);
  const selectRoute = useDataStore((s) => s.selectRoute);
  const toggleCompareRoute = useDataStore((s) => s.toggleCompareRoute);

  return (
    <PanelCard title="热门线路上座率" icon={<UserCheck className="w-4 h-4" />}>
      <div className="space-y-1">
        {topOccupancy.map((item, idx) => {
          const route = routeMap[item.routeId];
          if (!route) return null;
          const isInCompare = compareRouteIds.includes(route.id);
          return (
            <div
              key={item.routeId}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                idx % 2 === 1 && "bg-slate-800/20",
                "hover:bg-slate-800/50",
                isInCompare && "ring-1 ring-cyan-500/50 bg-cyan-500/5",
              )}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompareRoute(route.id);
                }}
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all",
                  isInCompare
                    ? "bg-cyan-500 border-cyan-500 text-white"
                    : "border-slate-600 hover:border-slate-400",
                )}
              >
                {isInCompare && <Check className="w-3.5 h-3.5" />}
              </button>
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
                  idx === 0
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : idx === 1
                      ? "bg-slate-400/20 text-slate-300 border-slate-400/40"
                      : idx === 2
                        ? "bg-orange-600/20 text-orange-400 border-orange-600/40"
                        : "bg-slate-700/50 text-slate-400 border-slate-600/40",
                )}
                onClick={() => selectRoute(route.id)}
              >
                {idx + 1}
              </div>
              <div
                className="flex-1 min-w-0"
                onClick={() => selectRoute(route.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-semibold text-slate-100 truncate"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                  >
                    {item.routeName}
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white"
                    style={{
                      backgroundColor: getTrainTypeColor(route.type) + "cc",
                    }}
                  >
                    {typeName(route.type)}
                  </span>
                  {isInCompare && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium text-cyan-400 bg-cyan-500/20 border border-cyan-500/30">
                      对比中
                    </span>
                  )}
                </div>
                <ProgressBar value={item.occupancy} showLabel />
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}
