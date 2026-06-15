import React from 'react';
import { Card, CardContent } from '../../components/ui/cards';
import { Button } from '../../components/ui/buttons/Button';

export const ReportsPage: React.FC = () => {
  const reports = [
    {
      title: 'Staff Reports',
      description: 'View staff statistics and performance metrics',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-cyan-500 to-teal-500',
      stats: '124 staff members',
    },
    {
      title: 'Evaluation Reports',
      description: 'View evaluation results and completion rates',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-500',
      stats: '32 evaluations',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        </svg>
      ),
      color: 'from-violet-500 to-purple-500',
      stats: 'Full analytics',
    },
    {
      title: 'Center Performance',
      description: 'Compare health center performance metrics',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-orange-500 to-amber-500',
      stats: '15 centers',
    },
    {
      title: 'Question Analysis',
      description: 'Analyze question bank and difficulty levels',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
      stats: '342 questions',
    },
    {
      title: 'Export Data',
      description: 'Export reports in various formats',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      color: 'from-pink-500 to-rose-500',
      stats: 'PDF, Excel, CSV',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">Generate insights and export data</p>
        </div>
        <Button 
          variant="gradient"
          gradient="from-pink-500 to-rose-500"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Export All
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card 
            key={report.title}
            variant="elevated"
            className="group cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  {report.icon}
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {report.stats}
                </span>
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {report.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;