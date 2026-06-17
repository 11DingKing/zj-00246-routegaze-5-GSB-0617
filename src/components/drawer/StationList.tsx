import type { Route } from "@/types";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { MapPin } from "lucide-react";
import { REGIONS } from "@/data/constants";

interface StationListProps {
  route: Route;
}

export default function StationList({ route }: StationListProps) {
  const { stationMap } = useDerivedStats();

  const orderedStations = route.stationIds
    .map((id) => stationMap[id])
    .filter(Boolean);

  return (
    <div className="space-y-0">
      {orderedStations.map((station, index) => {
        if (!station) return null;
        const isLast = index === orderedStations.length - 1;
        const region = REGIONS.find((r) => r.id === station.regionId);

        return (
          <div key={station.id} className="relative">
            <div className="flex items-center justify-between border-b border-slate-700/50 py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full font-[Orbitron] text-xs font-bold text-white"
                    style={{ backgroundColor: route.color }}
                  >
                    {index + 1}
                  </div>
                </div>
                <div>
                  <div className="font-[Orbitron] text-sm font-bold text-white">
                    {station.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {region?.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-slate-800/60 px-2.5 py-1">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span className="font-[Orbitron] text-xs font-semibold text-cyan-400">
                  {station.scenicIds.length}
                </span>
              </div>
            </div>
            {!isLast && (
              <div
                className="absolute left-3.5 top-10 h-8 w-px -translate-x-1/2"
                style={{ backgroundColor: route.color, opacity: 0.3 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
