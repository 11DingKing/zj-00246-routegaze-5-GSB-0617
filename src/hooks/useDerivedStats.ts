import { useMemo } from "react";
import { useDataStore } from "@/store/useDataStore";
import { REGIONS, TRAIN_TYPE_LIST } from "@/data/constants";
import { getLast30Days, calcMomGrowth } from "@/utils/format";
import { buildStationMap, getActiveStationIds } from "@/utils/coord";
import type {
  Route,
  Station,
  Scenic,
  RegionId,
  TrainType,
  CompareStats,
} from "@/types";

export function useDerivedStats() {
  const selectedRegion = useDataStore((s) => s.selectedRegion);
  const selectedRouteId = useDataStore((s) => s.selectedRouteId);
  const compareRouteIds = useDataStore((s) => s.compareRouteIds);
  const routes = useDataStore((s) => s.routes);
  const stations = useDataStore((s) => s.stations);
  const scenics = useDataStore((s) => s.scenics);

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
    const momGrowth = calcMomGrowth(trendData.values);
    return {
      totalRoutes,
      totalTrips,
      totalPassengers,
      momGrowth,
    };
  }, [filteredRoutes, trendData.values]);

  const compareStats = useMemo<CompareStats>(() => {
    const compareRoutes = compareRouteIds
      .map((id) => routeMap[id])
      .filter((r): r is Route => Boolean(r));

    const tripsData = compareRoutes.map((route, idx) => ({
      label: route.name,
      value: route.tripsLastMonth,
      color: route.color,
      rank: idx + 1,
    }));

    const occupancyData = compareRoutes.map((route, idx) => ({
      label: route.name,
      value: Math.round(route.occupancy * 1000) / 10,
      color: route.color,
      rank: idx + 1,
    }));

    const passengerData = compareRoutes.map((route, idx) => ({
      label: route.name,
      value: route.totalPassengers,
      color: route.color,
      rank: idx + 1,
    }));

    const maxTrips = Math.max(...compareRoutes.map((r) => r.tripsLastMonth), 0);
    const maxOccupancy = Math.max(...compareRoutes.map((r) => r.occupancy), 0);
    const maxPassengers = Math.max(
      ...compareRoutes.map((r) => r.totalPassengers),
      0,
    );

    const routeGrowth = compareRoutes.map((r) => ({
      routeId: r.id,
      growth: calcMomGrowth(r.dailyTrips),
    }));
    const maxGrowth = Math.max(...routeGrowth.map((g) => g.growth), 0);
    const minGrowth = Math.min(...routeGrowth.map((g) => g.growth), 0);

    const trendMax = Math.max(...compareRoutes.flatMap((r) => r.dailyTrips), 1);

    return {
      compareRoutes,
      tripsData,
      occupancyData,
      passengerData,
      routeGrowth,
      maxTrips,
      maxOccupancy,
      maxPassengers,
      maxGrowth,
      minGrowth,
      trendMax,
    };
  }, [compareRouteIds, routeMap]);

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
    compareStats,
    stations,
    scenics,
  };
}
