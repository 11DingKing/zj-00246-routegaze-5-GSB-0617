import { useDataStore } from "@/store/useDataStore";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { REGIONS } from "@/data/constants";
import { typeName } from "@/utils/format";
import { getTrainTypeColor } from "@/utils/color";
import { X } from "lucide-react";
import type { Route, Scenic } from "@/types";

export default function StationPopup() {
  const selectedStation = useDataStore((s) => s.selectedStation);
  const routes = useDataStore((s) => s.routes);
  const closeStationPopup = useDataStore((s) => s.closeStationPopup);
  const { stationMap, scenicMap } = useDerivedStats();

  if (!selectedStation) return null;

  const station = stationMap[selectedStation.stationId];
  if (!station) return null;

  const regionName = REGIONS.find((r) => r.id === station.regionId)?.name ?? "";
  const stopRoutes: Route[] = routes.filter((r) =>
    r.stationIds.includes(station.id),
  );
  const stationScenics: Scenic[] = station.scenicIds
    .map((id) => scenicMap[id])
    .filter(Boolean);

  return (
    <div
      className="fixed z-50"
      style={{
        left: selectedStation.x,
        top: selectedStation.y,
        transform: "translate(-50%, -110%)",
      }}
    >
      <div className="bg-slate-900/95 backdrop-blur border border-cyan-400/40 rounded-lg shadow-xl shadow-cyan-500/20 w-[280px] p-4 relative">
        <button
          onClick={closeStationPopup}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="mb-3 pr-6">
          <div className="flex items-baseline gap-2">
            <h4
              className="text-xl font-bold text-white"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {station.name}
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
              {regionName}
            </span>
          </div>
        </div>
        {stopRoutes.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-slate-400 mb-1.5">经停线路</div>
            <div className="flex flex-wrap gap-1.5">
              {stopRoutes.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white border"
                  style={{
                    backgroundColor: getTrainTypeColor(r.type) + "22",
                    borderColor: getTrainTypeColor(r.type) + "55",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getTrainTypeColor(r.type) }}
                  />
                  {r.name}
                  <span className="text-[10px] opacity-70">
                    ·{typeName(r.type)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
        {stationScenics.length > 0 && (
          <div>
            <div className="text-xs text-slate-400 mb-1.5">挂接景区</div>
            <div className="space-y-2">
              {stationScenics.map((sc) => (
                <div
                  key={sc.id}
                  className="relative bg-slate-800/60 border border-slate-700/60 rounded-md px-3 py-2"
                >
                  <span
                    className={`absolute top-1 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      sc.level === "5A"
                        ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900"
                        : "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800"
                    }`}
                  >
                    {sc.level}
                  </span>
                  <div className="text-sm font-medium text-slate-100 pr-8">
                    {sc.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
