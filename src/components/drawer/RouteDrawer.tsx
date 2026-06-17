import { useState } from "react";
import { X } from "lucide-react";
import type { Route } from "@/types";
import { useDataStore } from "@/store/useDataStore";
import { REGIONS } from "@/data/constants";
import { typeName } from "@/utils/format";
import { getTrainTypeColor } from "@/utils/color";
import PassengerTrend from "@/components/drawer/PassengerTrend";
import StationList from "@/components/drawer/StationList";
import ScenicList from "@/components/drawer/ScenicList";

type ActiveTab = "passenger" | "station" | "scenic";

export default function RouteDrawer() {
  const drawerOpen = useDataStore((s) => s.drawerOpen);
  const toggleDrawer = useDataStore((s) => s.toggleDrawer);
  const selectedRouteId = useDataStore((s) => s.selectedRouteId);
  const routes = useDataStore((s) => s.routes);

  const [activeTab, setActiveTab] = useState<ActiveTab>("passenger");

  if (!selectedRouteId) return null;

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  if (!selectedRoute) return null;

  const region = REGIONS.find((r) => r.id === selectedRoute.regionId);
  const typeColor = getTrainTypeColor(selectedRoute.type);

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: "passenger", label: "客流趋势" },
    { key: "station", label: "停靠车站" },
    { key: "scenic", label: "挂接景区" },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-400 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={toggleDrawer}
      />

      <div
        className="fixed top-0 right-0 z-50 h-full w-[420px] border-l border-cyan-500/30 bg-slate-900/95 shadow-2xl shadow-cyan-900/50 backdrop-blur-xl"
        style={{
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-5">
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full shadow-lg"
              style={{
                backgroundColor: selectedRoute.color,
                boxShadow: `0 0 12px ${selectedRoute.color}80`,
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-[Orbitron] text-xl font-bold text-white">
                  {selectedRoute.name}
                </h2>
                <span
                  className="rounded-md px-2 py-0.5 font-[Orbitron] text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${typeColor}25`,
                    color: typeColor,
                    border: `1px solid ${typeColor}50`,
                  }}
                >
                  {typeName(selectedRoute.type)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-700/50 px-5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{
                    backgroundColor: "#22d3ee",
                    boxShadow: "0 0 8px #22d3ee",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="h-[calc(100%-9rem)] overflow-y-auto px-5 py-4">
          {activeTab === "passenger" && (
            <PassengerTrend route={selectedRoute} />
          )}
          {activeTab === "station" && <StationList route={selectedRoute} />}
          {activeTab === "scenic" && <ScenicList route={selectedRoute} />}
        </div>

        <div className="flex justify-between border-t border-slate-700/50 p-4 text-xs text-slate-400">
          <span>所属区域：{region?.name ?? "--"}</span>
          <span className="font-[Orbitron]">ID: {selectedRoute.id}</span>
        </div>
      </div>
    </>
  );
}
