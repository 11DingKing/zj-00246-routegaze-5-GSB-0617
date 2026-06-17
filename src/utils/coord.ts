import { LON_LAT_BOUNDS, SVG_VIEW_BOX } from "@/data/constants";
import type { Station } from "@/types";

export function lonLatToSvg(lon: number, lat: number): [number, number] {
  const padding = 50;
  const innerW = SVG_VIEW_BOX.width - padding * 2;
  const innerH = SVG_VIEW_BOX.height - padding * 2;
  const x =
    padding +
    ((lon - LON_LAT_BOUNDS.minLon) /
      (LON_LAT_BOUNDS.maxLon - LON_LAT_BOUNDS.minLon)) *
      innerW;
  const y =
    padding +
    (1 -
      (lat - LON_LAT_BOUNDS.minLat) /
        (LON_LAT_BOUNDS.maxLat - LON_LAT_BOUNDS.minLat)) *
      innerH;
  return [x, y];
}

export function buildStationMap(stations: Station[]): Record<string, Station> {
  return stations.reduce<Record<string, Station>>((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});
}

export function buildRoutePathD(
  stationIds: string[],
  stationMap: Record<string, Station>,
): string {
  const coords = stationIds
    .map((id) => stationMap[id])
    .filter(Boolean)
    .map((st) => lonLatToSvg(st.coord[0], st.coord[1]));
  if (coords.length < 2) return "";
  return coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

export function getRouteMidPoint(
  stationIds: string[],
  stationMap: Record<string, Station>,
): [number, number] | null {
  const coords = stationIds
    .map((id) => stationMap[id])
    .filter(Boolean)
    .map((st) => lonLatToSvg(st.coord[0], st.coord[1]));
  if (coords.length === 0) return null;
  const mid = Math.floor(coords.length / 2);
  return coords[mid];
}

export function getActiveStationIds(
  routes: { stationIds: string[] }[],
): Set<string> {
  const activeIds = new Set<string>();
  routes.forEach((r) => r.stationIds.forEach((id) => activeIds.add(id)));
  return activeIds;
}
