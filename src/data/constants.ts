import type { Region, RegionId, TrainType } from "@/types";

export const LON_LAT_BOUNDS = {
  minLon: 73,
  maxLon: 135,
  minLat: 18,
  maxLat: 54,
};

export const SVG_VIEW_BOX = {
  width: 1000,
  height: 800,
};

export const STORAGE_KEY = "routegaze_data_v1";
export const COMPARE_STORAGE_KEY = "routegaze_compare_v1";

export const REGIONS: Region[] = [
  { id: "huabei", name: "华北", center: [116.4, 39.9], color: "#3B82F6" },
  { id: "huadong", name: "华东", center: [121.47, 31.23], color: "#10B981" },
  { id: "huanan", name: "华南", center: [113.26, 23.13], color: "#F59E0B" },
  { id: "huazhong", name: "华中", center: [114.3, 30.6], color: "#8B5CF6" },
  { id: "xinan", name: "西南", center: [104.06, 30.67], color: "#EC4899" },
  { id: "xibei", name: "西北", center: [108.95, 34.27], color: "#06B6D4" },
  { id: "dongbei", name: "东北", center: [123.43, 41.8], color: "#EF4444" },
];

export const ALL_REGION_IDS: Exclude<RegionId, "national">[] = [
  "huabei",
  "huadong",
  "huanan",
  "huazhong",
  "xinan",
  "xibei",
  "dongbei",
];

export const TRAIN_TYPES: Record<TrainType, { name: string; color: string }> = {
  silver: { name: "银发专列", color: "#FF8C42" },
  research: { name: "研学专列", color: "#34D399" },
  sightseeing: { name: "观光专列", color: "#F472B6" },
  red: { name: "红色专列", color: "#DC2626" },
  family: { name: "亲子专列", color: "#FBBF24" },
};

export const TRAIN_TYPE_LIST: { id: TrainType; name: string; color: string }[] =
  [
    { id: "silver", name: "银发专列", color: "#FF8C42" },
    { id: "research", name: "研学专列", color: "#34D399" },
    { id: "sightseeing", name: "观光专列", color: "#F472B6" },
    { id: "red", name: "红色专列", color: "#DC2626" },
    { id: "family", name: "亲子专列", color: "#FBBF24" },
  ];
