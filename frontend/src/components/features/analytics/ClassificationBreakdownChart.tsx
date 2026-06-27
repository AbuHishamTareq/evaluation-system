import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ClassificationData {
  classification: string;
  count: number;
  avg_percentage: number;
  medication_avg_percentage: number;
  composite_avg_percentage: number;
}

interface ClassificationBreakdownChartProps {
  data: ClassificationData[];
}

export const ClassificationBreakdownChart: React.FC<ClassificationBreakdownChartProps> = ({ data }) => {
  const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

  const labels: Record<string, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    specialized: 'Specialized',
    community: 'Community',
  };

  const chartData = data.map((item) => ({
    name: labels[item.classification] || item.classification,
    value: item.count,
    avg_percentage: item.avg_percentage,
    medication_avg_percentage: item.medication_avg_percentage,
    composite_avg_percentage: item.composite_avg_percentage,
    classification: item.classification,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Center Classification</h3>
        <p className="text-sm text-slate-500">Distribution by center type</p>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm">No classification data available</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(_value: unknown, _name: any, props: any) => [
                  `${props.payload.value} centers (${((Number(props.payload.value) / total) * 100).toFixed(1)}%)`,
                  props.payload.name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
            {chartData.map((item, index) => (
              <div key={item.classification} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.value} centers</p>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="text-emerald-600">R: {item.avg_percentage}%</span>
                    <span className="text-amber-600">M: {item.medication_avg_percentage ?? 0}%</span>
                    <span className="text-slate-700 font-medium">C: {item.composite_avg_percentage ?? 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
