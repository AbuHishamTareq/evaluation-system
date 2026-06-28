import React from 'react';
import { GeographicMap } from '../../components/features/analytics';

const ScoreTrendChart = React.lazy(() =>
  import('../../components/features/analytics/ScoreTrendChart').then(m => ({ default: m.ScoreTrendChart }))
);
const ScoreDistributionChart = React.lazy(() =>
  import('../../components/features/analytics/ScoreDistributionChart').then(m => ({ default: m.ScoreDistributionChart }))
);
const ClassificationBreakdownChart = React.lazy(() =>
  import('../../components/features/analytics/ClassificationBreakdownChart').then(m => ({ default: m.ClassificationBreakdownChart }))
);

interface DashboardChartsSectionProps {
  trendData: any[];
  trendPeriod: string;
  scoreDistribution: Record<string, number>;
  classificationBreakdown: any[];
  centerPerformance: any[];
  onTrendPeriodChange: (period: string) => void;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({
  trendData,
  trendPeriod,
  scoreDistribution,
  classificationBreakdown,
  centerPerformance,
  onTrendPeriodChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <React.Suspense fallback={<div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-80" />}>
          <ScoreTrendChart
            data={trendData}
            period={trendPeriod}
            onPeriodChange={onTrendPeriodChange}
          />
        </React.Suspense>
        <React.Suspense fallback={<div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-80" />}>
          <ScoreDistributionChart data={scoreDistribution} />
        </React.Suspense>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <React.Suspense fallback={<div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse h-80" />}>
          <ClassificationBreakdownChart data={classificationBreakdown} />
        </React.Suspense>
        <GeographicMap data={centerPerformance} />
      </div>
    </>
  );
};

export default DashboardChartsSection;
