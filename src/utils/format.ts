import { TRAIN_TYPES } from "@/data/constants";
import type { TrainType } from "@/types";

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("zh-CN");
}

export function formatPercent(n: number, digits = 1): string {
  return (n * 100).toFixed(digits) + "%";
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getLast30Days(): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}

export function calcMomGrowth(dailyTrips: number[]): number {
  const firstHalf = dailyTrips.slice(0, 15).reduce((s, v) => s + v, 0);
  const secondHalf = dailyTrips.slice(15, 30).reduce((s, v) => s + v, 0);
  if (firstHalf === 0) return 0;
  return (secondHalf - firstHalf) / firstHalf;
}

export function typeName(type: TrainType): string {
  return TRAIN_TYPES[type]?.name ?? type;
}
