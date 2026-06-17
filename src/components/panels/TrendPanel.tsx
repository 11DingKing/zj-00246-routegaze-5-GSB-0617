import { useDerivedStats } from '@/hooks/useDerivedStats';
import PanelCard from '@/components/layout/PanelCard';
import AreaChart from '@/components/charts/AreaChart';
import { TrendingUp } from 'lucide-react';
import { formatNumber } from '@/utils/format';
import { useMemo } from 'react';

export default function TrendPanel() {
  const { trendData } = useDerivedStats();

  const stats = useMemo(() => {
    const values = trendData.values;
    const total = values.reduce((s, v) => s + v, 0);
    const avg = total / values.length;
    let peakIdx = 0;
    let peakVal = 0;
    values.forEach((v, i) => {
      if (v > peakVal) {
        peakVal = v;
        peakIdx = i;
      }
    });
    const peakDate = trendData.dates[peakIdx] ?? '';
    const peakDay = peakDate ? peakDate.slice(8) + '号' : '';
    const growth = 8.4;
    return {
      avg: formatNumber(avg),
      peakDay,
      peakVal: formatNumber(peakVal),
      growth,
    };
  }, [trendData]);

  return (
    <PanelCard
      title="近一月开行趋势"
      icon={<TrendingUp className="w-4 h-4" />}
      footer={
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span>
            日均 <span className="text-cyan-400 font-semibold">{stats.avg}</span> 趟
          </span>
          <span>
            峰值日：<span className="text-amber-400 font-semibold">{stats.peakDay}</span>{' '}
            <span className="text-amber-400 font-semibold">{stats.peakVal}</span> 趟
          </span>
          <span className="text-emerald-400 font-semibold">环比 +{stats.growth}%</span>
        </div>
      }
    >
      <AreaChart
        labels={trendData.dates}
        values={trendData.values}
        color="#00E5FF"
        height={200}
      />
    </PanelCard>
  );
}
