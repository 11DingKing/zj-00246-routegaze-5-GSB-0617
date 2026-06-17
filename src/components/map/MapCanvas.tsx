import { useViewport } from "@/hooks/useViewport";
import ProvinceLayer from "./ProvinceLayer";
import RouteLayer from "./RouteLayer";
import StationLayer from "./StationLayer";
import StationPopup from "./StationPopup";
import { useDataStore } from "@/store/useDataStore";
import { TRAIN_TYPE_LIST, REGIONS } from "@/data/constants";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export default function MapCanvas() {
  const { scale, offset, bind, reset, zoomIn, zoomOut } = useViewport();
  const selectedRegion = useDataStore((s) => s.selectedRegion);

  const regionName =
    selectedRegion === "national"
      ? "全国"
      : (REGIONS.find((r) => r.id === selectedRegion)?.name ?? "全国");
  const regionLabel = regionName + "视图";

  return (
    <div
      className="relative overflow-hidden w-full h-full"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0f172a 100%)",
      }}
      {...bind}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 800"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.08)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1000" height="800" fill="url(#bg-glow)" />
        <g transform={`translate(${offset.x},${offset.y}) scale(${scale})`}>
          <ProvinceLayer />
          <RouteLayer />
          <StationLayer />
        </g>
        <g>
          <g transform="translate(20,20)">
            <rect
              x="0"
              y="0"
              width="110"
              height="36"
              rx="8"
              fill="rgba(15,23,42,0.75)"
              stroke="rgba(6,182,212,0.3)"
              strokeWidth="1"
            />
            <g
              transform="translate(10,8)"
              style={{ cursor: "pointer" }}
              onClick={zoomIn}
            >
              <rect
                x="0"
                y="0"
                width="28"
                height="20"
                rx="4"
                fill="rgba(6,182,212,0.15)"
                stroke="rgba(6,182,212,0.4)"
              />
              <ZoomIn x="6" y="2" className="w-4 h-4 text-cyan-300" />
            </g>
            <g
              transform="translate(42,8)"
              style={{ cursor: "pointer" }}
              onClick={zoomOut}
            >
              <rect
                x="0"
                y="0"
                width="28"
                height="20"
                rx="4"
                fill="rgba(6,182,212,0.15)"
                stroke="rgba(6,182,212,0.4)"
              />
              <ZoomOut x="6" y="2" className="w-4 h-4 text-cyan-300" />
            </g>
            <g
              transform="translate(74,8)"
              style={{ cursor: "pointer" }}
              onClick={reset}
            >
              <rect
                x="0"
                y="0"
                width="28"
                height="20"
                rx="4"
                fill="rgba(6,182,212,0.15)"
                stroke="rgba(6,182,212,0.4)"
              />
              <RefreshCw x="6" y="2" className="w-4 h-4 text-cyan-300" />
            </g>
          </g>
          <g transform="translate(980,20)" textAnchor="end">
            <rect
              x="-180"
              y="0"
              width="180"
              height="44"
              rx="8"
              fill="rgba(15,23,42,0.75)"
              stroke="rgba(6,182,212,0.3)"
              strokeWidth="1"
            />
            <text x="-14" y="17" fontSize="10" fill="#94a3b8" letterSpacing="2">
              当前口径
            </text>
            <text
              x="-14"
              y="36"
              fontSize="16"
              fill="#22d3ee"
              fontWeight="bold"
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              {regionLabel}
            </text>
          </g>
          <g transform="translate(20,740)">
            <rect
              x="0"
              y="0"
              width="340"
              height="48"
              rx="8"
              fill="rgba(15,23,42,0.75)"
              stroke="rgba(6,182,212,0.25)"
              strokeWidth="1"
            />
            <text x="12" y="16" fontSize="10" fill="#64748b" letterSpacing="1">
              专列类型图例
            </text>
            {TRAIN_TYPE_LIST.map((t, i) => (
              <g key={t.id} transform={`translate(${12 + i * 64}, 28)`}>
                <circle cx="0" cy="0" r="4" fill={t.color} />
                <text x="10" y="3" fontSize="10" fill="#cbd5e1">
                  {t.name}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
      <StationPopup />
    </div>
  );
}
