import React from 'react';

interface CenterLocation {
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

interface GeographicMapProps {
  data: CenterLocation[];
}

export const GeographicMap: React.FC<GeographicMapProps> = ({ data }) => {
  const centersWithCoords = data.filter(
    (c) => c.latitude !== null && c.longitude !== null
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    if (percentage >= 40) return '#f97316';
    return '#f43f5e';
  };

  if (centersWithCoords.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Center Locations</h3>
          <p className="text-sm text-slate-500">Geographic distribution of centers</p>
        </div>
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No location data available</p>
            <p className="text-xs mt-1">Add latitude/longitude to centers to see the map</p>
          </div>
        </div>
      </div>
    );
  }

  const minLat = Math.min(...centersWithCoords.map((c) => c.latitude!));
  const maxLat = Math.max(...centersWithCoords.map((c) => c.latitude!));
  const minLng = Math.min(...centersWithCoords.map((c) => c.longitude!));
  const maxLng = Math.max(...centersWithCoords.map((c) => c.longitude!));

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const padding = 40;
  const width = 600;
  const height = 400;

  const scaleX = (lng: number) => padding + ((lng - minLng) / lngRange) * (width - padding * 2);
  const scaleY = (lat: number) => height - padding - ((lat - minLat) / latRange) * (height - padding * 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">Center Locations</h3>
        <p className="text-sm text-slate-500">Geographic distribution of centers</p>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
        >
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={padding + (i * (height - padding * 2)) / 4}
                x2={width - padding}
                y2={padding + (i * (height - padding * 2)) / 4}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={padding + (i * (width - padding * 2)) / 4}
                y1={padding}
                x2={padding + (i * (width - padding * 2)) / 4}
                y2={height - padding}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            </g>
          ))}

          {/* Center markers */}
          {centersWithCoords.map((center) => (
            <g key={center.id}>
              <circle
                cx={scaleX(center.longitude!)}
                cy={scaleY(center.latitude!)}
                r={Math.max(8, Math.min(16, center.evaluations_count * 2))}
                fill={getScoreColor(center.avg_percentage)}
                opacity={center.is_active ? 0.8 : 0.4}
                className="cursor-pointer"
              >
                <title>{`${center.name}\nScore: ${center.avg_percentage}%\nEvaluations: ${center.evaluations_count}`}</title>
              </circle>
              <circle
                cx={scaleX(center.longitude!)}
                cy={scaleY(center.latitude!)}
                r={4}
                fill="#fff"
                opacity={0.9}
              />
              <text
                x={scaleX(center.longitude!)}
                y={scaleY(center.latitude!) - 20}
                textAnchor="middle"
                className="text-xs"
                fill="#475569"
                fontSize="10"
                fontWeight="500"
              >
                {center.name.length > 20 ? center.name.substring(0, 20) + '...' : center.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600">Excellent (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500" />
          <span className="text-xs text-slate-600">Good (60-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span className="text-xs text-slate-600">Fair (40-59%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-rose-500" />
          <span className="text-xs text-slate-600">Needs Improvement (&lt;40%)</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-3 rounded-lg bg-slate-50 text-center">
          <p className="text-2xl font-bold text-slate-800">{centersWithCoords.length}</p>
          <p className="text-xs text-slate-500">Centers with Location</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 text-center">
          <p className="text-2xl font-bold text-slate-800">
            {Math.round(centersWithCoords.reduce((sum, c) => sum + c.avg_percentage, 0) / centersWithCoords.length)}%
          </p>
          <p className="text-xs text-slate-500">Average Score</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 text-center">
          <p className="text-2xl font-bold text-slate-800">
            {centersWithCoords.reduce((sum, c) => sum + c.evaluations_count, 0)}
          </p>
          <p className="text-xs text-slate-500">Total Evaluations</p>
        </div>
      </div>
    </div>
  );
};
