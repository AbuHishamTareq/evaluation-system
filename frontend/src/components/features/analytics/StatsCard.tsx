import React from 'react';
import { Card } from '../../ui/cards/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = 'neutral',
  color = 'from-cyan-500 to-teal-500',
}) => {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-rose-500',
    neutral: 'text-slate-500',
  };

  const trendBgColors = {
    up: 'bg-emerald-50',
    down: 'bg-rose-50',
    neutral: 'bg-slate-50',
  };

  const trendIcons = {
    up: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    down: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    neutral: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
      </svg>
    ),
  };

  return (
    <Card 
      variant="elevated" 
      padding="lg" 
      className="group hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 relative overflow-hidden"
    >
      {/* Background Gradient Accent */}
      <div className={`absolute top-0 left-0 w-24 h-24 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full -ml-8 -mt-8`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text">
            {value}
          </p>
          {change !== undefined && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-medium ${trendColors[trend]}`}>
              <span className={`flex items-center justify-center w-5 h-5 rounded-full ${trendBgColors[trend]}`}>
                {trendIcons[trend]}
              </span>
              <span>{Math.abs(change)}%</span>
              {changeLabel && <span className="text-slate-400 font-normal ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};