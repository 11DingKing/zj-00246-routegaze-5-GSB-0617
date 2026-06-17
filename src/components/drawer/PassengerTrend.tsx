import type { Route } from "@/types";
import AreaChart from "@/components/charts/AreaChart";
import {
  formatNumber,
  formatPercent,
  getLast30Days,
  typeName,
} from "@/utils/format";

interface PassengerTrendProps {
  route: Route;
}

export default function PassengerTrend({ route }: PassengerTrendProps) {
  const totalPassengers = route.dailyTrips.reduce((sum, val) => sum + val, 0);
  const avgOccupancy = route.occupancy;
  const maxDaily = Math.max(...route.dailyTrips);
  const totalDistance = route.stationIds.length * 120;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            近30天总客流
          </div>
          <div
            className="mt-1 font-orbitron text-2xl font-bold text-white"
            style={{ color: route.color }}
          >
            {formatNumber(totalPassengers)}
          </div>
          <div className="text-[10px] text-slate-500">人次</div>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            平均上座率
          </div>
          <div className="mt-1 font-orbitron text-2xl font-bold text-emerald-400">
            {formatPercent(avgOccupancy)}
          </div>
          <div className="text-[10px] text-slate-500">满座率</div>
        </div>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            最高单日
          </div>
          <div className="mt-1 font-orbitron text-2xl font-bold text-amber-400">
            {formatNumber(maxDaily)}
          </div>
          <div className="text-[10px] text-slate-500">人次/日</div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">
            客流趋势 · 近30天
          </h4>
          <span className="font-orbitron text-[10px] text-slate-500">
            DAILY TRIPS
          </span>
        </div>
        <AreaChart
          labels={getLast30Days()}
          values={route.dailyTrips}
          color={route.color}
          height={180}
        />
      </div>

      <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
        <h4 className="mb-2 text-sm font-semibold text-white">线路运营说明</h4>
        <p className="text-xs leading-relaxed text-slate-400">
          <span className="font-orbitron font-bold text-white">
            {route.name}
          </span>
          为<span style={{ color: route.color }}>{typeName(route.type)}</span>，
          全线共经停{" "}
          <span className="font-orbitron font-bold text-cyan-400">
            {route.stationIds.length}
          </span>{" "}
          个车站， 总里程约{" "}
          <span className="font-orbitron font-bold text-cyan-400">
            {formatNumber(totalDistance)}
          </span>{" "}
          公里， 月均发车{" "}
          <span className="font-orbitron font-bold text-amber-400">
            {formatNumber(route.tripsLastMonth)}
          </span>{" "}
          列次， 平均上座率{" "}
          <span className="font-orbitron font-bold text-emerald-400">
            {formatPercent(route.occupancy)}
          </span>
          ， 是该区域重要的旅游客流通道。
        </p>
      </div>
    </div>
  );
}
