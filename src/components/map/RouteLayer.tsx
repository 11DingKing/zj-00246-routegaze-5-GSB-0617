import { useState } from "react";
import { useDerivedStats } from "@/hooks/useDerivedStats";
import { useDataStore } from "@/store/useDataStore";
import { buildRoutePathD, getRouteMidPoint } from "@/utils/coord";

export default function RouteLayer() {
  const { filteredRoutes, stationMap } = useDerivedStats();
  const selectedRouteId = useDataStore((s) => s.selectedRouteId);
  const compareRouteIds = useDataStore((s) => s.compareRouteIds);
  const selectRoute = useDataStore((s) => s.selectRoute);
  const toggleCompareRoute = useDataStore((s) => s.toggleCompareRoute);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <g>
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {filteredRoutes.map((route) => {
        const d = buildRoutePathD(route.stationIds, stationMap);
        if (!d) return null;
        const isSelected = selectedRouteId === route.id;
        const isInCompare = compareRouteIds.includes(route.id);
        const isHovered = hoveredId === route.id;
        const showLabel = isSelected || isHovered || isInCompare;
        const mid = getRouteMidPoint(route.stationIds, stationMap);
        const compareIndex = compareRouteIds.indexOf(route.id);
        const hasActiveHighlight = isSelected || compareRouteIds.length > 0;

        const getOpacity = () => {
          if (isSelected || isInCompare) return 1;
          if (hasActiveHighlight) return 0.2;
          return 0.85;
        };

        const getStrokeWidth = () => {
          if (isSelected) return 5;
          if (isInCompare) return 4;
          if (hasActiveHighlight) return 1;
          return 2;
        };

        const getFilter = () => {
          if (isSelected) return "url(#glow)";
          if (isInCompare) return "url(#glow)";
          return undefined;
        };

        const getStroke = () => {
          if (isInCompare && !isSelected) {
            return route.color;
          }
          return route.color;
        };

        return (
          <g key={route.id}>
            <path
              d={d}
              fill="none"
              stroke={getStroke()}
              opacity={getOpacity()}
              strokeWidth={getStrokeWidth()}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={getFilter()}
              style={{ transition: "all 0.3s ease", cursor: "pointer" }}
              onMouseEnter={() => setHoveredId(route.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={(e) => {
                if (e.shiftKey) {
                  e.stopPropagation();
                  toggleCompareRoute(route.id);
                } else {
                  selectRoute(route.id);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompareRoute(route.id);
              }}
            />
            {(isSelected || isHovered || isInCompare) && (
              <path
                d={d}
                fill="none"
                stroke={isInCompare && !isSelected ? route.color : "#ffffff"}
                strokeOpacity={isInCompare && !isSelected ? 0.8 : 0.6}
                strokeWidth={isSelected ? 3 : isInCompare ? 2.5 : 1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={isInCompare && !isSelected ? "0" : "6 10"}
                className={
                  isInCompare && !isSelected ? "" : "route-dash-animate"
                }
                style={{ pointerEvents: "none" }}
              />
            )}
            {showLabel && mid && (
              <>
                <text
                  x={mid[0]}
                  y={mid[1] - 12}
                  fontSize="10"
                  fill="#ffffff"
                  fillOpacity={0.9}
                  textAnchor="middle"
                  style={{
                    paintOrder: "stroke",
                    stroke: "rgba(15,23,42,0.8)",
                    strokeWidth: 3,
                    pointerEvents: "none",
                    fontWeight: 600,
                  }}
                >
                  {route.name}
                </text>
                {isInCompare && (
                  <g>
                    <circle
                      cx={mid[0] + 28}
                      cy={mid[1] - 15}
                      r={9}
                      fill={route.color}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      style={{ pointerEvents: "none" }}
                    />
                    <text
                      x={mid[0] + 28}
                      y={mid[1] - 11}
                      fontSize="9"
                      fill="#ffffff"
                      textAnchor="middle"
                      fontWeight="bold"
                      style={{ pointerEvents: "none", fontFamily: "Orbitron" }}
                    >
                      {compareIndex + 1}
                    </text>
                  </g>
                )}
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
