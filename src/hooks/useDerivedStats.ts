import { useMemo } from "react";
import { useDataStore } from "@/store/useDataStore";
import { REGIONS, TRAIN_TYPE_LIST } from "@/data/constants";
import { getLast30Days } from "@/utils/format";
import { buildStationMap, getActiveStationIds } from "@/utils/coord";
import type { Route, Station, Scenic, RegionId, TrainType } from "@/types";

export interface CompareRouteStats {
  id: string;
  name: string;
  color: string;
  type: Route["type"];
  tripsLastMonth: number;
  occupancy: number;
  totalPassengers: number;
  momGrowth: number;
  dailyTrips: number[];
}

export function useDerivedStats() {
  const selectedRegion = useDataStore((s) => s.selectedRegion);
  const selectedRouteId = useDataStore((s) => s.selectedRouteId);
  const routes = useDataStore((s) => s.routes);
  const stations = useDataStore((s) => s.stations);
  const scenics = useDataStore((s) => s.scenics);
  const compareRouteIds = useDataStore((s) => s.compareRouteIds);

  const stationMap = useMemo<Record<string, Station>>(() => {
    return buildStationMap(stations);
  }, [stations]);

  const routeMap = useMemo<Record<string, Route>>(() => {
    return routes.reduce<Record<string, Route>>((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {});
  }, [routes]);

  const scenicMap = useMemo<Record<string, Scenic>>(() => {
    return scenics.reduce<Record<string, Scenic>>((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {});
  }, [scenics]);

  const filteredRoutes = useMemo<Route[]>(() => {
    if (selectedRegion === "national") return routes;
    return routes.filter((r) => r.regionId === selectedRegion);
  }, [routes, selectedRegion]);

  const filteredStations = useMemo<Station[]>(() => {
    if (selectedRegion === "national") return stations;
    return stations.filter((s) => s.regionId === selectedRegion);
  }, [stations, selectedRegion]);

  const filteredScenics = useMemo<Scenic[]>(() => {
    if (selectedRegion === "national") return scenics;
    return scenics.filter((s) => s.regionId === selectedRegion);
  }, [scenics, selectedRegion]);

  const visibleRoutes = useMemo<Route[]>(() => {
    if (selectedRouteId) {
      const route = routeMap[selectedRouteId];
      return route ? [route] : [];
    }
    return filteredRoutes;
  }, [selectedRouteId, routeMap, filteredRoutes]);

  const activeStationIds = useMemo<Set<string>>(() => {
    return getActiveStationIds(visibleRoutes);
  }, [visibleRoutes]);

  const regionRank = useMemo(() => {
    return REGIONS.map((region) => {
      const regionRoutes = routes.filter((r) => r.regionId === region.id);
      const trips = regionRoutes.reduce((sum, r) => sum + r.tripsLastMonth, 0);
      return {
        regionId: region.id as Exclude<RegionId, "national">,
        regionName: region.name,
        trips,
        color: region.color,
        routeCount: regionRoutes.length,
      };
    }).sort((a, b) => b.trips - a.trips);
  }, [routes]);

  const typeDistribution = useMemo(() => {
    const totalTrips = filteredRoutes.reduce(
      (sum, r) => sum + r.tripsLastMonth,
      0,
    );
    return TRAIN_TYPE_LIST.map((t) => {
      const typeRoutes = filteredRoutes.filter((r) => r.type === t.id);
      const count = typeRoutes.length;
      const trips = typeRoutes.reduce((sum, r) => sum + r.tripsLastMonth, 0);
      const percent = totalTrips > 0 ? trips / totalTrips : 0;
      return {
        type: t.id as TrainType,
        name: t.name,
        color: t.color,
        count,
        percent,
        trips,
      };
    });
  }, [filteredRoutes]);

  const topOccupancy = useMemo(() => {
    return [...filteredRoutes]
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 10)
      .map((r) => ({
        routeId: r.id,
        routeName: r.name,
        occupancy: r.occupancy,
        trips: r.tripsLastMonth,
      }));
  }, [filteredRoutes]);

  const trendData = useMemo(() => {
    const dates = getLast30Days();
    const values = new Array(30).fill(0);
    filteredRoutes.forEach((route) => {
      for (let i = 0; i < 30; i++) {
        values[i] += route.dailyTrips[i] ?? 0;
      }
    });
    return { dates, values };
  }, [filteredRoutes]);

  const totalKpis = useMemo(() => {
    const totalRoutes = filteredRoutes.length;
    const totalTrips = filteredRoutes.reduce(
      (sum, r) => sum + r.tripsLastMonth,
      0,
    );
    const totalPassengers = filteredRoutes.reduce(
      (sum, r) => sum + r.totalPassengers,
      0,
    );
    let firstHalf = 0;
    let secondHalf = 0;
    filteredRoutes.forEach((r) => {
      for (let i = 0; i < 15; i++) firstHalf += r.dailyTrips[i] ?? 0;
      for (let i = 15; i < 30; i++) secondHalf += r.dailyTrips[i] ?? 0;
    });
    const momGrowth = firstHalf > 0 ? (secondHalf - firstHalf) / firstHalf : 0;
    return {
      totalRoutes,
      totalTrips,
      totalPassengers,
      momGrowth,
    };
  }, [filteredRoutes]);

  function calcRouteMom(route: Route): number {
    let first = 0;
    let second = 0;
    for (let i = 0; i < 15; i++) first += route.dailyTrips[i] ?? 0;
    for (let i = 15; i < 30; i++) second += route.dailyTrips[i] ?? 0;
    return first > 0 ? (second - first) / first : 0;
  }

  const compareStats = useMemo<CompareRouteStats[]>(() => {
    return compareRouteIds
      .map((id) => routeMap[id])
      .filter(Boolean)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        type: r.type,
        tripsLastMonth: r.tripsLastMonth,
        occupancy: r.occupancy,
        totalPassengers: r.totalPassengers,
        momGrowth: calcRouteMom(r),
        dailyTrips: r.dailyTrips,
      }));
  }, [compareRouteIds, routeMap]);

  const compareGlobalMaxDaily = useMemo(() => {
    if (compareStats.length === 0) return 1;
    return Math.max(...compareStats.flatMap((s) => s.dailyTrips), 1);
  }, [compareStats]);

  return {
    filteredRoutes,
    filteredStations,
    filteredScenics,
    stationMap,
    routeMap,
    scenicMap,
    visibleRoutes,
    activeStationIds,
    regionRank,
    typeDistribution,
    topOccupancy,
    trendData,
    totalKpis,
    stations,
    scenics,
    compareStats,
    compareGlobalMaxDaily,
  };
}
