export type RegionId =
  | 'huabei'
  | 'huadong'
  | 'huanan'
  | 'huazhong'
  | 'xinan'
  | 'xibei'
  | 'dongbei'
  | 'national';

export type TrainType = 'silver' | 'research' | 'sightseeing' | 'red' | 'family';

export interface Region {
  id: RegionId;
  name: string;
  center: [number, number];
  color: string;
}

export interface Scenic {
  id: string;
  name: string;
  level: '5A' | '4A';
  coord: [number, number];
  regionId: RegionId;
}

export interface Station {
  id: string;
  name: string;
  coord: [number, number];
  regionId: RegionId;
  scenicIds: string[];
}

export interface Route {
  id: string;
  name: string;
  type: TrainType;
  regionId: RegionId;
  stationIds: string[];
  tripsLastMonth: number;
  occupancy: number;
  totalPassengers: number;
  dailyTrips: number[];
  color: string;
}

export interface StationPopupData {
  stationId: string;
  x: number;
  y: number;
}
