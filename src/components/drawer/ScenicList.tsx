import type { Route } from "@/types";
import { useDataStore } from "@/store/useDataStore";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { Mountain } from "lucide-react";

interface ScenicListProps {
  route: Route;
}

export default function ScenicList({ route }: ScenicListProps) {
  const stations = useDataStore((s) => s.stations);
  const { stationMap, scenicMap } = useDerivedStats();

  const allScenicIds: string[] = [];
  route.stationIds.forEach((sid) => {
    const station = stationMap[sid];
    if (station) {
      station.scenicIds.forEach((id) => {
        if (!allScenicIds.includes(id)) {
          allScenicIds.push(id);
        }
      });
    }
  });

  const scenicWithStation = allScenicIds
    .map((scenicId) => {
      const scenic = scenicMap[scenicId];
      const station = stations.find((st) => st.scenicIds.includes(scenicId));
      return scenic && station ? { scenic, station } : null;
    })
    .filter(Boolean);

  if (scenicWithStation.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/30">
        <div className="text-center">
          <Mountain className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">暂无挂接景区</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {scenicWithStation.map((item) => {
        if (!item) return null;
        const { scenic, station } = item;
        const is5A = scenic.level === "5A";

        return (
          <div
            key={scenic.id}
            className="group relative cursor-pointer rounded-lg border border-cyan-500/20 bg-slate-800/40 p-3 transition hover:bg-slate-700/40"
          >
            <div
              className="absolute left-2.5 top-2.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: route.color }}
            />

            <div className="flex items-start justify-between pl-4">
              <h5 className="pr-1 text-sm font-bold text-white leading-tight">
                {scenic.name}
              </h5>
              <span
                className={
                  is5A
                    ? "flex-shrink-0 rounded-md border border-amber-400 bg-amber-500/20 px-1.5 py-0.5 font-[Orbitron] text-[10px] font-bold text-amber-300"
                    : "flex-shrink-0 rounded-md border border-slate-300 bg-slate-400/10 px-1.5 py-0.5 font-[Orbitron] text-[10px] font-bold text-slate-200"
                }
              >
                {scenic.level}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1 pl-4">
              <Mountain
                className={
                  is5A
                    ? "h-3 w-3 text-amber-400/70"
                    : "h-3 w-3 text-slate-400/70"
                }
              />
              <span className="text-[11px] text-slate-400">{station.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
