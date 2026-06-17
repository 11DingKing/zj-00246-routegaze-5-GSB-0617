# 铁路旅游监测大屏 — 数据流向与运行机制

> 本文档旨在帮助接手开发的同学快速理解大屏从数据生成、存储到联动渲染的完整流程。

---

## 目录
1. [一、首次进入：演示线路与客流生成](#一首次进入演示线路与客流生成)
2. [二、本地持久化：localStorage 读写机制](#二本地持久化localStorage-读写机制)
3. [三、区域切换：各面板数据联动重算](#三区域切换各面板数据联动重算)
4. [四、专线点击：联动高亮与抽屉明细](#四专线点击联动高亮与抽屉明细)
5. [五、整体数据流向图](#五整体数据流向图)
6. [六、核心文件速查表](#六核心文件速查表)

---

## 一、首次进入：演示线路与客流生成

### 1.1 入口触发

应用启动时，[App.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/App.tsx#L16-L18) 的 `useEffect` 钩子会调用 `initData()` 初始化数据：

```tsx
// App.tsx
useEffect(() => {
  initData();
}, [initData]);
```

### 1.2 数据生成核心函数

`initData()` 定义在 [useDataStore.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L107-L118)，流程如下：

1. **先读本地存储**：调用 `readFromStorage()` 尝试读取 `localStorage`
2. **若无数据则生成**：调用 `generateMockData()` 生成演示数据
3. **写回本地存储**：调用 `writeToStorage()` 持久化

### 1.3 generateMockData() 生成逻辑

完整实现在 [mock.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/data/mock.ts#L86-L159)，分三步生成：

#### 第一步：生成车站（Station）

- 按 7 大区域（华北、华东、华南、华中、西南、西北、东北）遍历
- 每个区域有预设的车站名列表（如华北有北京南、天津西等 10 个站）
- 每个车站的经纬度 = 区域中心坐标 + 随机偏移量
- 偏移范围：经度 ±3°，纬度 ±2.5°

```typescript
// mock.ts L95-L105
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
```

#### 第二步：生成景区（Scenic）并关联车站

- 每个区域有预设的 5A/4A 景区列表
- 经纬度生成方式同车站，偏移范围稍大（经度 ±4°，纬度 ±3°）
- 每个景区就近挂接到同区域的一个车站（按索引取模分配）

```typescript
// mock.ts L107-L120
const nearStation = stations.filter((st) => st.regionId === regionId)[i % stationNames.length];
if (nearStation) nearStation.scenicIds.push(scenicId);
```

#### 第三步：生成线路（Route）与客流数据

- 每个区域随机生成 6~10 条线路
- 每条线路：
  - 从同区域车站中随机抽 3~6 个站，打乱后组成线路
  - 随机分配专列类型（银发/研学/观光/红色/亲子）
  - 上月开行趟数：40~280 随机
  - 上座率：55%~98% 随机
  - 总客流 = 趟数 × 800（编组定员） × 上座率 × 随机系数 0.6~1.2
  - 近 30 天每日开行数据：围绕日均趟数 ±4~6 波动

```typescript
// mock.ts L131-L155
const trips = randInt(40, 280);
const occupancy = +rand(0.55, 0.98).toFixed(2);
const passengers = Math.round(trips * 800 * occupancy * rand(0.6, 1.2));
const dailyTrips: number[] = [];
for (let d = 0; d < 30; d++) {
  dailyTrips.push(randInt(Math.max(0, Math.round(trips / 30) - 4), Math.round(trips / 30) + 6));
}
```

---

## 二、本地持久化：localStorage 读写机制

### 2.1 存储键定义

在 [constants.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/data/constants.ts#L15-L16) 中定义了两个存储键：

```typescript
export const STORAGE_KEY = "routegaze_data_v1";          // 主数据
export const COMPARE_STORAGE_KEY = "routegaze_compare_v1"; // 对比线路
```

### 2.2 读流程 readFromStorage()

实现在 [useDataStore.ts L34-L54](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L34-L54)：

```
1. 调用 localStorage.getItem(STORAGE_KEY)
2. 若无数据 → return null
3. 尝试 JSON.parse 解析
4. 校验是否包含 routes/stations/scenics 三个字段
5. 校验通过 → 返回数据，否则 → return null
6. 任何异常都 catch，返回 null
```

### 2.3 写流程 writeToStorage()

实现在 [useDataStore.ts L56-L69](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L56-L69)：

```
1. 将 { routes, stations, scenics } 序列化
2. 调用 localStorage.setItem(STORAGE_KEY, jsonString)
3. 异常忽略（如 localStorage 不可用、存储空间满等）
```

### 2.4 写入时机

| 触发场景 | 调用方 | 写入内容 |
|---------|--------|---------|
| 首次启动（store 初始化） | [useDataStore.ts L93](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L93) | 完整数据 |
| initData() 调用 | [useDataStore.ts L109](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L109) | 完整数据 |
| 重置数据（点刷新按钮） | [useDataStore.ts L146](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L146) | 重新生成的完整数据 |
| 加入/移除对比线路 | [useDataStore.ts L160](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L160) | 对比线路 ID 列表 |
| 清空对比线路 | [useDataStore.ts L169](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts#L169) | 空数组 |

### 2.5 为何用 localStorage 而不是内存？

1. **刷新不丢失**：用户刷新页面后，之前的演示数据和对比选择都保留
2. **减少重复计算**：Mock 数据生成有一定随机性，保持一致体验
3. **离线可用**：纯前端演示，无需后端服务

---

## 三、区域切换：各面板数据联动重算

### 3.1 状态流总览

```
用户点击顶栏区域按钮
    ↓
setSelectedRegion(regionId) 更新 store
    ↓
useDerivedStats 中所有依赖 selectedRegion 的 useMemo 全部重算
    ↓
各面板组件订阅 useDerivedStats 的数据，自动重新渲染
```

### 3.2 触发源：TopBar 区域切换

在 [TopBar.tsx L70-L92](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/layout/TopBar.tsx#L70-L92)，点击按钮调用 `setSelectedRegion()`：

```tsx
{REGION_OPTIONS.map((opt) => (
  <button
    key={opt.id}
    onClick={() => setSelectedRegion(opt.id as any)}
    // ...
  >
    {opt.name}
  </button>
))}
```

### 3.3 核心：useDerivedStats 派生计算

[useDerivedStats.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/hooks/useDerivedStats.ts) 是整个数据联动的中枢，所有面板数据都通过它派生。

#### 第一层过滤：按区域筛选

```typescript
// L33-L46
const filteredRoutes = useMemo<Route[]>(() => {
  if (selectedRegion === "national") return routes;
  return routes.filter((r) => r.regionId === selectedRegion);
}, [routes, selectedRegion]);

// filteredStations / filteredScenics 同理
```

#### 第二层：各面板数据派生

| 派生数据 | 用途 | 关联面板 |
|---------|------|---------|
| `regionRank` | 各区域按开行趟数排名 | [RegionRankPanel](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/panels/RegionRankPanel.tsx) |
| `typeDistribution` | 专列类型分布（饼图数据） | [TypePiePanel](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/panels/TypePiePanel.tsx) |
| `topOccupancy` | 上座率 Top10 线路 | [OccupancyPanel](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/panels/OccupancyPanel.tsx) |
| `trendData` | 近 30 天开行趋势（面积图） | [TrendPanel](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/panels/TrendPanel.tsx) |
| `totalKpis` | 总线路数、总趟数、总客流 | [TopBar KpiCard](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/layout/KpiCard.tsx) |
| `visibleRoutes` | 地图上应显示的线路 | [RouteLayer](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/map/RouteLayer.tsx) |
| `activeStationIds` | 活跃站点集合（仅显示有线路经过的站） | [StationLayer](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/map/StationLayer.tsx) |

#### 关键派生逻辑示例：trendData 趋势数据

```typescript
// useDerivedStats.ts L107-L116
const trendData = useMemo(() => {
  const dates = getLast30Days();
  const values = new Array(30).fill(0);
  filteredRoutes.forEach((route) => {
    for (let i = 0; i < 30; i++) {
      values[i] += route.dailyTrips[i] ?? 0; // 逐日累加
    }
  });
  return { dates, values };
}, [filteredRoutes]);
```

#### 关键派生逻辑示例：totalKpis 总指标

```typescript
// useDerivedStats.ts L118-L134
const totalKpis = useMemo(() => {
  const totalRoutes = filteredRoutes.length;
  const totalTrips = filteredRoutes.reduce((sum, r) => sum + r.tripsLastMonth, 0);
  const totalPassengers = filteredRoutes.reduce((sum, r) => sum + r.totalPassengers, 0);
  return { totalRoutes, totalTrips, totalPassengers, yoyGrowth: 0.31 };
}, [filteredRoutes]);
```

### 3.4 React 重渲染机制

1. `selectedRegion` 是 store 中的 state，更新时触发所有订阅组件重渲染
2. `useDerivedStats` 内部的 `useMemo` 依赖 `selectedRegion`，会重新执行计算
3. 各面板组件通过 `useDerivedStats()` 订阅数据，拿到新值后重渲染
4. 整个过程是响应式的，无需手动调用更新方法

---

## 四、专线点击：联动高亮与抽屉明细

### 4.1 点击交互流程

```
用户点击地图上的线路
    ↓
RouteLayer onClick 触发 → 调用 selectRoute(route.id)
    ↓
store 更新: selectedRouteId = id, drawerOpen = true
    ↓
├─ RouteLayer：重新计算每条线路的高亮样式
├─ 地图其他线路：opacity 降为 0.2，选中线路加粗发光
├─ RouteDrawer：根据 selectedRouteId 显示详情
└─ 右侧面板：让位（margin-right 420px）
```

### 4.2 高亮逻辑：RouteLayer

在 [RouteLayer.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/map/RouteLayer.tsx) 中，每条线路根据状态计算样式：

```typescript
// L28-L30
const isSelected = selectedRouteId === route.id;
const isInCompare = compareRouteIds.includes(route.id);
const hasActiveHighlight = isSelected || compareRouteIds.length > 0;
```

#### 样式规则

| 状态 | opacity | strokeWidth | filter（发光） |
|-----|---------|-------------|----------------|
| 选中 | 1.0 | 5px | glow 滤镜 |
| 对比中 | 1.0 | 4px | glow 滤镜 |
| 有高亮但未选中 | 0.2 | 1px | 无 |
| 普通 | 0.85 | 2px | 无 |

```typescript
// L36-L53
const getOpacity = () => {
  if (isSelected || isInCompare) return 1;
  if (hasActiveHighlight) return 0.2;
  return 0.85;
};
```

#### 附加动画层

选中/悬停/对比中的线路还会叠加一层白色流动虚线：

```tsx
// RouteLayer.tsx L90-L104
{(isSelected || isHovered || isInCompare) && (
  <path
    d={d}
    fill="none"
    stroke="#ffffff"
    strokeDasharray="6 10"
    className="route-dash-animate"  // CSS 动画实现流动效果
    style={{ pointerEvents: "none" }}
  />
)}
```

### 4.3 抽屉明细：RouteDrawer

[RouteDrawer.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/drawer/RouteDrawer.tsx) 根据 `selectedRouteId` 渲染：

```typescript
// L22-L25
if (!selectedRouteId) return null;
const selectedRoute = routes.find((r) => r.id === selectedRouteId);
if (!selectedRoute) return null;
```

#### 三个 Tab 页

| Tab | 组件 | 内容 |
|-----|------|------|
| 客流趋势 | [PassengerTrend](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/drawer/PassengerTrend.tsx) | 单条线路近 30 天客流 + 核心指标卡 |
| 停靠车站 | [StationList](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/drawer/StationList.tsx) | 途经车站列表，点击可跳转地图定位 |
| 挂接景区 | [ScenicList](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/drawer/ScenicList.tsx) | 线路途经景区列表，含 5A/4A 标识 |

### 4.4 右侧面板让位动画

在 [App.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/App.tsx#L46-L50) 中，右侧面板容器根据 `drawerOpen` 状态添加 margin：

```tsx
<div className={`flex flex-col gap-3 shrink-0 transition-all duration-500 ease-out ${
  drawerOpen ? "mr-[420px]" : ""
}`}>
```

---

## 五、整体数据流向图

```mermaid
flowchart TD
    subgraph 初始化阶段 [1. 首次进入初始化]
        A1[App.tsx useEffect] --> A2[调用 initData()]
        A2 --> A3{localStorage 有数据?}
        A3 -->|有| A4[readFromStorage 读取]
        A3 -->|无| A5[generateMockData 生成]
        A4 --> A6[writeToStorage 写入]
        A5 --> A6
        A6 --> A7[store 初始化完成]
    end

    subgraph 持久化层 [2. 本地存储]
        B1[(localStorage<br/>routegaze_data_v1)]
        B2[(localStorage<br/>routegaze_compare_v1)]
    end

    subgraph 状态层 [3. Zustand Store]
        C1[routes / stations / scenics]
        C2[selectedRegion]
        C3[selectedRouteId]
        C4[drawerOpen]
        C5[compareRouteIds]
    end

    subgraph 派生层 [4. useDerivedStats 派生计算]
        D1[filteredRoutes<br/>按区域过滤]
        D2[filteredStations<br/>按区域过滤]
        D3[filteredScenics<br/>按区域过滤]
        D4[visibleRoutes<br/>选中线路过滤]
        D5[activeStationIds<br/>活跃站点]
        D6[regionRank<br/>区域排行]
        D7[typeDistribution<br/>类型分布]
        D8[topOccupancy<br/>上座率Top10]
        D9[trendData<br/>30天趋势]
        D10[totalKpis<br/>总指标]
    end

    subgraph 渲染层 [5. UI 渲染]
        E1[TopBar KPI 卡片]
        E2[RegionRankPanel<br/>区域排行]
        E3[TypePiePanel<br/>类型饼图]
        E4[OccupancyPanel<br/>上座率排行]
        E5[TrendPanel<br/>趋势图]
        E6[RouteLayer<br/>地图线路]
        E7[StationLayer<br/>地图站点]
        E8[RouteDrawer<br/>线路详情抽屉]
        E9[ComparePanel<br/>对比面板]
    end

    subgraph 交互事件 [6. 用户交互]
        F1[点击区域切换]
        F2[点击线路]
        F3[Shift+点击<br/>加入对比]
        F4[点击重置按钮]
    end

    %% 初始化流向
    A4 --> B1
    A5 --> B1
    A7 --> C1

    %% 持久化关联
    B1 <--> C1
    B2 <--> C5

    %% 状态到派生
    C1 --> D1 & D2 & D3 & D6 & D7 & D8 & D9 & D10
    C2 --> D1 & D2 & D3
    C3 --> D4
    D4 --> D5

    %% 派发到渲染
    D10 --> E1
    D6 --> E2
    D7 --> E3
    D8 --> E4
    D9 --> E5
    D4 --> E6
    D5 --> E7
    C3 & C4 --> E8
    C5 --> E9

    %% 交互反馈
    F1 -->|setSelectedRegion| C2
    F2 -->|selectRoute| C3 & C4
    F3 -->|toggleCompareRoute| C5
    F4 -->|resetMock| A5

    %% 样式说明
    classDef store fill:#fef3c7,stroke:#f59e0b
    classDef derived fill:#dbeafe,stroke:#3b82f6
    classDef ui fill:#dcfce7,stroke:#10b981
    classDef event fill:#fce7f3,stroke:#ec4899

    class C1,C2,C3,C4,C5 store
    class D1,D2,D3,D4,D5,D6,D7,D8,D9,D10 derived
    class E1,E2,E3,E4,E5,E6,E7,E8,E9 ui
    class F1,F2,F3,F4 event
```

### 图例说明

| 颜色 | 层级 | 说明 |
|-----|------|------|
| 🟡 黄色 | 状态层 | Zustand store 中的核心状态，数据唯一真相源 |
| 🔵 蓝色 | 派生层 | useDerivedStats 中通过 useMemo 派生的计算属性 |
| 🟢 绿色 | 渲染层 | React 组件，订阅派生数据并渲染 UI |
| 🩷 粉色 | 交互层 | 用户操作，反向更新状态 |

---

## 六、核心文件速查表

| 文件 | 职责 | 关键函数/导出 |
|------|------|--------------|
| [mock.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/data/mock.ts) | 演示数据生成 | `generateMockData()` |
| [useDataStore.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/store/useDataStore.ts) | 状态管理 + 本地存储 | `useDataStore`, `initData`, `selectRoute`, `setSelectedRegion` |
| [useDerivedStats.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/hooks/useDerivedStats.ts) | 数据派生计算中枢 | `useDerivedStats()` |
| [constants.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/data/constants.ts) | 常量定义 | `STORAGE_KEY`, `REGIONS`, `TRAIN_TYPES` |
| [coord.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/utils/coord.ts) | 坐标转换与线路几何 | `lonLatToSvg()`, `buildRoutePathD()` |
| [types.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/types/index.ts) | TypeScript 类型定义 | `Route`, `Station`, `Scenic`, `RegionId` |
| [App.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/App.tsx) | 应用根组件 | 布局结构 |
| [TopBar.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/layout/TopBar.tsx) | 顶栏 + 区域切换 | `setSelectedRegion` 调用点 |
| [MapCanvas.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/map/MapCanvas.tsx) | 地图容器 | SVG 画布 + 缩放控制 |
| [RouteLayer.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/map/RouteLayer.tsx) | 线路渲染 + 点击 | 高亮逻辑 + `selectRoute` 调用点 |
| [RouteDrawer.tsx](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/components/drawer/RouteDrawer.tsx) | 线路详情抽屉 | 三 Tab 明细 |

---

## 快速问答

**Q: 我想修改演示数据的生成规则，改哪里？**
A: 改 [mock.ts](file:///Users/ding/Documents/SOLOCODE%203/0611/macmini/zj-00246-routegaze-5/src/data/mock.ts)，然后点顶栏重置按钮生效。

**Q: 我想清空本地存储恢复初始状态？**
A: 浏览器控制台执行 `localStorage.removeItem('routegaze_data_v1')` 后刷新。

**Q: 新增一个面板需要接入现有数据体系？**
A: 在 `useDerivedStats` 中新增对应 `useMemo` 派生数据，组件内调用 `useDerivedStats()` 订阅即可自动联动。

**Q: 高亮动画不流畅怎么办？**
A: 检查 `RouteLayer.tsx` 中 `transition` 属性，当前是 0.3s，可按需调整。数据量大时考虑减少同时显示的线路数。
