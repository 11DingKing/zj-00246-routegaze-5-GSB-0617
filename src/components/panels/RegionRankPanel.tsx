import { useDerivedStats } from '@/hooks/useDerivedStats';
import PanelCard from '@/components/layout/PanelCard';
import BarChart from '@/components/charts/BarChart';
import { BarChart3 } from 'lucide-react';
import type { BarChartItem } from '@/components/charts/BarChart';

export default function RegionRankPanel() {
  const { regionRank } = useDerivedStats();

  const chartData: BarChartItem[] = regionRank.map((r, idx) => ({
    label: r.regionName,
    value: r.trips,
    color: r.color,
    rank: idx + 1,
  }));

  const totalTrips = regionRank.reduce((sum, r) => sum + r.trips, 0);
  const growthPct = 12.6;

  return (
    <PanelCard
      title="各区域开行排行"
      icon={<BarChart3 className="w-4 h-4" />}
      footer={
        <div className="flex items-center justify-between">
          <span>
            总计 <span className="text-cyan-400 font-semibold">{totalTrips.toLocaleString()}</span> 趟
          </span>
          <span className="text-emerald-400 font-semibold">环比上月 +{growthPct}%</span>
        </div>
      }
    >
      <BarChart data={chartData} showRank unit="趟" barHeight={32} />
    </PanelCard>
  );
}
