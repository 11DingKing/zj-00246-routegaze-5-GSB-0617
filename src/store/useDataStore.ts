import { create } from "zustand";
import type {
  Route,
  Station,
  Scenic,
  RegionId,
  StationPopupData,
} from "@/types";
import { STORAGE_KEY, COMPARE_STORAGE_KEY } from "@/data/constants";
import { generateMockData } from "@/data/mock";

interface DataState {
  routes: Route[];
  stations: Station[];
  scenics: Scenic[];
  selectedRegion: RegionId;
  selectedRouteId: string | null;
  selectedStation: StationPopupData | null;
  drawerOpen: boolean;
  compareRouteIds: string[];
  comparePanelOpen: boolean;
  initData: () => void;
  setSelectedRegion: (r: RegionId) => void;
  selectRoute: (id: string | null) => void;
  openStationPopup: (data: StationPopupData) => void;
  closeStationPopup: () => void;
  toggleDrawer: () => void;
  resetMock: () => void;
  toggleCompareRoute: (id: string) => void;
  clearCompareRoutes: () => void;
  setComparePanelOpen: (open: boolean) => void;
}

function readFromStorage(): {
  routes: Route[];
  stations: Station[];
  scenics: Scenic[];
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.routes && parsed.stations && parsed.scenics) {
      return parsed as {
        routes: Route[];
        stations: Station[];
        scenics: Scenic[];
      };
    }
    return null;
  } catch {
    return null;
  }
}

function writeToStorage(
  routes: Route[],
  stations: Station[],
  scenics: Scenic[],
): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ routes, stations, scenics }),
    );
  } catch {
    // ignore
  }
}

function readCompareFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function writeCompareToStorage(ids: string[]): void {
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export const useDataStore = create<DataState>((set) => {
  const initial = readFromStorage() ?? generateMockData();
  writeToStorage(initial.routes, initial.stations, initial.scenics);
  const initialCompareIds = readCompareFromStorage();

  return {
    routes: initial.routes,
    stations: initial.stations,
    scenics: initial.scenics,
    selectedRegion: "national",
    selectedRouteId: null,
    selectedStation: null,
    drawerOpen: false,
    compareRouteIds: initialCompareIds,
    comparePanelOpen: initialCompareIds.length > 0,

    initData: () => {
      const data = readFromStorage() ?? generateMockData();
      writeToStorage(data.routes, data.stations, data.scenics);
      const compareIds = readCompareFromStorage();
      set({
        routes: data.routes,
        stations: data.stations,
        scenics: data.scenics,
        compareRouteIds: compareIds,
        comparePanelOpen: compareIds.length > 0,
      });
    },

    setSelectedRegion: (r: RegionId) => {
      set({ selectedRegion: r });
    },

    selectRoute: (id: string | null) => {
      set({
        selectedRouteId: id,
        selectedStation: null,
        drawerOpen: id !== null,
      });
    },

    openStationPopup: (data: StationPopupData) => {
      set({ selectedStation: data });
    },

    closeStationPopup: () => {
      set({ selectedStation: null });
    },

    toggleDrawer: () => {
      set((state) => ({ drawerOpen: !state.drawerOpen }));
    },

    resetMock: () => {
      const data = generateMockData();
      writeToStorage(data.routes, data.stations, data.scenics);
      set({
        routes: data.routes,
        stations: data.stations,
        scenics: data.scenics,
      });
    },

    toggleCompareRoute: (id: string) => {
      set((state) => {
        const exists = state.compareRouteIds.includes(id);
        const newIds = exists
          ? state.compareRouteIds.filter((rid) => rid !== id)
          : [...state.compareRouteIds, id];
        writeCompareToStorage(newIds);
        return {
          compareRouteIds: newIds,
          comparePanelOpen: newIds.length > 0,
        };
      });
    },

    clearCompareRoutes: () => {
      writeCompareToStorage([]);
      set({ compareRouteIds: [], comparePanelOpen: false });
    },

    setComparePanelOpen: (open: boolean) => {
      set({ comparePanelOpen: open });
    },
  };
});
