import React, { useState, useMemo } from 'react';

interface CenterPerformance {
  id: number;
  name: string;
  code: string;
  classification: string;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  staff_count: number;
  evaluations_count: number;
  avg_percentage: number;
  is_active: boolean;
}

interface CenterRankingTableProps {
  data: CenterPerformance[];
}

type SortField = 'name' | 'avg_percentage' | 'evaluations_count' | 'staff_count';
type SortDirection = 'asc' | 'desc';

export const CenterRankingTable: React.FC<CenterRankingTableProps> = ({ data }) => {
  const [sortField, setSortField] = useState<SortField>('avg_percentage');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterClassification, setFilterClassification] = useState<string>('all');

  const classifications = useMemo(() => {
    const unique = [...new Set(data.map((c) => c.classification))];
    return unique.sort();
  }, [data]);

  const sortedAndFilteredData = useMemo(() => {
    let filtered = filterClassification === 'all'
      ? data
      : data.filter((c) => c.classification === filterClassification);

    return filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [data, sortField, sortDirection, filterClassification]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-amber-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-rose-600';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-50';
    if (percentage >= 60) return 'bg-amber-50';
    if (percentage >= 40) return 'bg-orange-50';
    return 'bg-rose-50';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-cyan-600 ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Center Rankings</h3>
            <p className="text-sm text-slate-500">Performance ranking by average score</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All Classifications</option>
              {classifications.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedAndFilteredData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-sm">No center data available</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rank
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('name')}
                >
                  Center Name <SortIcon field="name" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Classification
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('evaluations_count')}
                >
                  Evaluations <SortIcon field="evaluations_count" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('staff_count')}
                >
                  Staff <SortIcon field="staff_count" />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('avg_percentage')}
                >
                  Avg Score <SortIcon field="avg_percentage" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredData.map((center, index) => (
                <tr
                  key={center.id}
                  className="hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-teal-50/50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-slate-800">{center.name}</p>
                      <p className="text-xs text-slate-500">{center.code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-cyan-50 text-cyan-700">
                      {center.classification}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {center.evaluations_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {center.staff_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(center.avg_percentage)} ${getScoreColor(center.avg_percentage)}`}>
                      {center.avg_percentage}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
