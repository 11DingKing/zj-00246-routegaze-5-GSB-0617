import { useEffect } from "react";
import { useDataStore } from "@/store/useDataStore";
import TopBar from "@/components/layout/TopBar";
import MapCanvas from "@/components/map/MapCanvas";
import RegionRankPanel from "@/components/panels/RegionRankPanel";
import TypePiePanel from "@/components/panels/TypePiePanel";
import OccupancyPanel from "@/components/panels/OccupancyPanel";
import TrendPanel from "@/components/panels/TrendPanel";
import ComparePanel from "@/components/panels/ComparePanel";
import RouteDrawer from "@/components/drawer/RouteDrawer";

export default function App() {
  const initData = useDataStore((s) => s.initData);
  const drawerOpen = useDataStore((s) => s.drawerOpen);

  useEffect(() => {
    initData();
  }, [initData]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-slate-100">
      <div className="shrink-0">
        <TopBar />
      </div>

      <div className="flex-1 flex min-h-0 gap-3 p-3">
        <div
          className="flex flex-col gap-3 shrink-0 panel-float-in"
          style={{ width: "340px", animationDelay: "0.05s" }}
        >
          <div className="flex-1 min-h-0">
            <RegionRankPanel />
          </div>
          <div className="flex-1 min-h-0" style={{ animationDelay: "0.15s" }}>
            <TypePiePanel />
          </div>
        </div>

        <div
          className="flex-1 min-w-0 rounded-xl overflow-hidden border border-cyan-500/15 shadow-2xl shadow-cyan-900/30 panel-float-in"
          style={{ animationDelay: "0.1s" }}
        >
          <MapCanvas />
        </div>

        <div
          className={`flex flex-col gap-3 shrink-0 transition-all duration-500 ease-out panel-float-in ${
            drawerOpen ? "mr-[420px]" : ""
          }`}
          style={{ width: "340px", animationDelay: "0.2s", zIndex: 10 }}
        >
          <div className="flex-1 min-h-0">
            <OccupancyPanel />
          </div>
          <div className="flex-1 min-h-0" style={{ animationDelay: "0.25s" }}>
            <TrendPanel />
          </div>
        </div>
      </div>

      <RouteDrawer />
      <ComparePanel />
    </div>
  );
}
