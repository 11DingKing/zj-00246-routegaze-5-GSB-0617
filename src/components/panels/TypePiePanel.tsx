import { useDerivedStats } from '@/hooks/useDerivedStats';
import PanelCard from '@/components/layout/PanelCard';
import DonutChart from '@/components/charts/DonutChart';
import { PieChart } from 'lucide-react';
import type { DonutItem } from '@/components/charts/DonutChart';

export default function TypePiePanel() {
  const { typeDistribution, totalKpis } = useDerivedStats();

  const donutData: DonutItem[] = typeDistribution.map((t) => ({
    name: t.name,
    value: t.count,
    color: t.color,
  }));

  return (
    <PanelCard title="专列类型占比" icon={<PieChart className="w-4 h-4" />}>
      <DonutChart
        data={donutData}
        size={200}
        thickness={24}
        centerLabel="专列总数"
        centerValue={String(totalKpis.totalRoutes)}
      />
    </PanelCard>
  );
}
