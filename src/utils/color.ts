import { TRAIN_TYPES } from '@/data/constants';
import type { TrainType } from '@/types';

export function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getTrainTypeColor(type: TrainType): string {
  return TRAIN_TYPES[type]?.color ?? '#888';
}

export function lightenColor(hex: string, percent: number): string {
  const v = hex.replace('#', '');
  const num = parseInt(v, 16);
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0xff) + Math.round(255 * percent);
  let b = (num & 0xff) + Math.round(255 * percent);
  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
