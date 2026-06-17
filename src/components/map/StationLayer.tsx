import { useDerivedStats } from "@/hooks/useDerivedStats";
import { useDataStore } from "@/store/useDataStore";
import { lonLatToSvg } from "@/utils/coord";

export default function StationLayer() {
  const stations = useDataStore((s) => s.stations);
  const selectedStation = useDataStore((s) => s.selectedStation);
  const openStationPopup = useDataStore((s) => s.openStationPopup);
  const { activeStationIds } = useDerivedStats();

  const handleClick = (
    e: React.MouseEvent<SVGCircleElement>,
    stationId: string,
  ) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    openStationPopup({ stationId, x: svgP.x, y: svgP.y });
  };

  return (
    <g>
      {stations
        .filter((st) => activeStationIds.has(st.id))
        .map((st) => {
          const [x, y] = lonLatToSvg(st.coord[0], st.coord[1]);
          const isSelected = selectedStation?.stationId === st.id;
          return (
            <g key={st.id}>
              {isSelected && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={14}
                    fill="rgba(6,182,212,0.12)"
                    className="station-pulse-ring"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={11}
                    fill="none"
                    stroke="rgba(6,182,212,0.5)"
                    strokeWidth={1}
                  />
                </>
              )}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 9 : 5}
                fill={isSelected ? "#22d3ee" : "#06b6d4"}
                stroke="#ffffff"
                strokeWidth={isSelected ? 2 : 1}
                style={{
                  cursor: "pointer",
                  filter: "drop-shadow(0 0 4px rgba(6,182,212,0.7))",
                  transition: "all 0.2s ease",
                }}
                onClick={(e) => handleClick(e, st.id)}
              >
                <animate
                  attributeName="r"
                  values="4;6;4"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={x + 10}
                y={y + 3}
                fontSize="9"
                fill="#ffffff"
                fillOpacity={0.8}
                style={{
                  paintOrder: "stroke",
                  stroke: "rgba(15,23,42,0.85)",
                  strokeWidth: 2.5,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {st.name}
              </text>
            </g>
          );
        })}
    </g>
  );
}
