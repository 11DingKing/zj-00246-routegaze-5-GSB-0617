import { useState } from 'react';
import { PROVINCE_PATHS } from '@/data/chinaOutline';
import { useDataStore } from '@/store/useDataStore';
import type { RegionId } from '@/types';

export default function ProvinceLayer() {
  const selectedRegion = useDataStore((s) => s.selectedRegion);
  const setSelectedRegion = useDataStore((s) => s.setSelectedRegion);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = (region: RegionId) => {
    if (selectedRegion !== region) {
      setSelectedRegion(region);
    } else {
      setSelectedRegion('national');
    }
  };

  return (
    <g>
      {PROVINCE_PATHS.map((p) => {
        const isHovered = hoveredId === p.id;
        const isSelected = selectedRegion === p.region;
        return (
          <path
            key={p.id}
            d={p.d}
            fill={isHovered || isSelected ? 'rgba(6,182,212,0.18)' : 'rgba(6,182,212,0.05)'}
            stroke={isHovered || isSelected ? 'rgba(6,182,212,0.75)' : 'rgba(6,182,212,0.25)'}
            strokeWidth={isHovered || isSelected ? 1.5 : 1}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={() => setHoveredId(p.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(p.region)}
          />
        );
      })}
    </g>
  );
}
