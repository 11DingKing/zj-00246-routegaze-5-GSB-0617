import type { Route, Station, Scenic, RegionId, TrainType } from '@/types';
import { ALL_REGION_IDS, REGIONS, TRAIN_TYPES } from '@/data/constants';

const STATION_NAMES: Record<RegionId, string[]> = {
  huabei: ['北京南', '天津西', '石家庄', '太原南', '呼和浩特东', '承德', '张家口', '秦皇岛', '唐山', '保定东'],
  huadong: ['上海虹桥', '南京南', '杭州东', '合肥南', '福州南', '济南西', '青岛北', '宁波', '苏州北', '徐州东', '厦门北', '南昌西'],
  huanan: ['广州南', '深圳北', '珠海', '南宁东', '海口东', '湛江西', '桂林北', '三亚', '佛山西', '惠州南'],
  huazhong: ['武汉', '郑州东', '长沙南', '南昌', '洛阳龙门', '信阳东', '岳阳东', '衡阳东', '株洲西', '商丘'],
  xinan: ['成都东', '重庆北', '贵阳北', '昆明南', '拉萨', '广元', '绵阳', '宜宾西', '大理', '丽江'],
  xibei: ['西安北', '兰州西', '西宁', '银川', '乌鲁木齐南', '宝鸡南', '天水南', '敦煌', '嘉峪关南', '哈密'],
  dongbei: ['沈阳北', '长春西', '哈尔滨西', '大连北', '吉林', '齐齐哈尔南', '牡丹江', '佳木斯', '丹东', '锦州南'],
  national: [],
};

const SCENIC_NAMES: Record<RegionId, Array<{ name: string; level: '5A' | '4A' }>> = {
  huabei: [
    { name: '故宫博物院', level: '5A' },
    { name: '八达岭长城', level: '5A' },
    { name: '颐和园', level: '5A' },
    { name: '天坛公园', level: '5A' },
    { name: '承德避暑山庄', level: '5A' },
  ],
  huadong: [
    { name: '西湖', level: '5A' },
    { name: '黄山', level: '5A' },
    { name: '乌镇', level: '5A' },
    { name: '鼓浪屿', level: '5A' },
    { name: '泰山', level: '5A' },
    { name: '崂山', level: '5A' },
  ],
  huanan: [
    { name: '长隆旅游度假区', level: '5A' },
    { name: '桂林山水', level: '5A' },
    { name: '三亚亚龙湾', level: '5A' },
    { name: '丹霞山', level: '5A' },
  ],
  huazhong: [
    { name: '黄鹤楼', level: '5A' },
    { name: '少林寺', level: '5A' },
    { name: '张家界', level: '5A' },
    { name: '岳阳楼', level: '5A' },
  ],
  xinan: [
    { name: '九寨沟', level: '5A' },
    { name: '峨眉山', level: '5A' },
    { name: '丽江古城', level: '5A' },
    { name: '布达拉宫', level: '5A' },
    { name: '黄果树瀑布', level: '5A' },
  ],
  xibei: [
    { name: '兵马俑', level: '5A' },
    { name: '莫高窟', level: '5A' },
    { name: '青海湖', level: '5A' },
    { name: '天山天池', level: '5A' },
  ],
  dongbei: [
    { name: '长白山', level: '5A' },
    { name: '哈尔滨冰雪大世界', level: '5A' },
    { name: '沈阳故宫', level: '4A' },
    { name: '镜泊湖', level: '5A' },
  ],
  national: [],
};

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateMockData(): { routes: Route[]; stations: Station[]; scenics: Scenic[] } {
  const stations: Station[] = [];
  const scenics: Scenic[] = [];

  ALL_REGION_IDS.forEach((regionId) => {
    const region = REGIONS.find((r) => r.id === regionId)!;
    const stationNames = STATION_NAMES[regionId];
    const scenicNames = SCENIC_NAMES[regionId];

    stationNames.forEach((name, i) => {
      const offsetLon = rand(-3, 3);
      const offsetLat = rand(-2.5, 2.5);
      stations.push({
        id: `${regionId}_st_${i}`,
        name,
        coord: [region.center[0] + offsetLon, region.center[1] + offsetLat],
        regionId,
        scenicIds: [],
      });
    });

    scenicNames.forEach((s, i) => {
      const offsetLon = rand(-4, 4);
      const offsetLat = rand(-3, 3);
      const scenicId = `${regionId}_sc_${i}`;
      scenics.push({
        id: scenicId,
        name: s.name,
        level: s.level,
        coord: [region.center[0] + offsetLon, region.center[1] + offsetLat],
        regionId,
      });
      const nearStation = stations.filter((st) => st.regionId === regionId)[i % stationNames.length];
      if (nearStation) nearStation.scenicIds.push(scenicId);
    });
  });

  const typeList: TrainType[] = ['silver', 'research', 'sightseeing', 'red', 'family'];
  const routes: Route[] = [];
  let routeCounter = 0;

  ALL_REGION_IDS.forEach((regionId) => {
    const regionStations = stations.filter((s) => s.regionId === regionId);
    const routeCount = randInt(6, 10);

    for (let i = 0; i < routeCount; i++) {
      const stationCount = randInt(3, Math.min(6, regionStations.length));
      const pickedStations = shuffle(regionStations).slice(0, stationCount);
      const type = pick(typeList);
      const trips = randInt(40, 280);
      const occupancy = +rand(0.55, 0.98).toFixed(2);
      const passengers = Math.round(trips * 800 * occupancy * rand(0.6, 1.2));
      const dailyTrips: number[] = [];
      for (let d = 0; d < 30; d++) {
        dailyTrips.push(randInt(Math.max(0, Math.round(trips / 30) - 4), Math.round(trips / 30) + 6));
      }

      routes.push({
        id: `route_${routeCounter++}`,
        name: `${pickedStations[0].name} -> ${pickedStations[pickedStations.length - 1].name}`,
        type,
        regionId,
        stationIds: pickedStations.map((s) => s.id),
        tripsLastMonth: trips,
        occupancy,
        totalPassengers: passengers,
        dailyTrips,
        color: TRAIN_TYPES[type].color,
      });
    }
  });

  return { routes, stations, scenics };
}
