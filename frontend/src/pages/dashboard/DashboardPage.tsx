import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/features/analytics/StatsCard';
import {
  ScoreTrendChart,
  ScoreDistributionChart,
  ClassificationBreakdownChart,
  CenterRankingTable,
  GeographicMap,
  RecentActivity,
} from '../../components/features/analytics';
import { analyticsService } from '../../api/services';
import { useTranslationContext } from '../../contexts/TranslationContext';

const quickActions = [
  {
    titleKey: 'dashboard.newEvaluation',
    descriptionKey: 'dashboard.newEvaluationDesc',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    color: 'from-cyan-500 to-teal-500',
    link: '/evaluations',
  },
  {
    titleKey: 'dashboard.addStaff',
    descriptionKey: 'dashboard.addStaffDesc',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    color: 'from-violet-500 to-purple-500',
    link: '/staff',
  },
  {
    titleKey: 'dashboard.addQuestion',
    descriptionKey: 'dashboard.addQuestionDesc',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    color: 'from-blue-500 to-cyan-500',
    link: '/questions',
  },
  {
    titleKey: 'dashboard.viewReports',
    descriptionKey: 'dashboard.viewReportsDesc',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
    link: '/reports',
  },
];

export const DashboardPage: React.FC = () => {
  const { t } = useTranslationContext();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [scoreDistribution, setScoreDistribution] = useState<Record<string, number>>({});
  const [classificationBreakdown, setClassificationBreakdown] = useState<any[]>([]);
  const [centerPerformance, setCenterPerformance] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadTrendData(trendPeriod);
  }, [trendPeriod]);

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const response = await analyticsService.exportPdf();
      const url = window.URL.createObjectURL(new Blob([response as BlobPart], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await analyticsService.exportExcel();
      const url = window.URL.createObjectURL(new Blob([response as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [
        dashboardRes,
        distributionRes,
        classificationRes,
        centersRes,
        activityRes,
      ] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getScoreDistribution(),
        analyticsService.getClassificationBreakdown(),
        analyticsService.getCenterPerformance(),
        analyticsService.getRecentActivity(10),
      ]);

      const dashboard = (dashboardRes as any)?.data ?? dashboardRes;
      const distribution = (distributionRes as any)?.data ?? distributionRes;
      const classification = (classificationRes as any)?.data ?? classificationRes;
      const centers = (centersRes as any)?.data ?? centersRes;
      const activity = (activityRes as any)?.data ?? activityRes;

      setDashboardData(dashboard);
      setScoreDistribution(distribution || {});
      setClassificationBreakdown(classification || []);
      setCenterPerformance(centers || []);
      setRecentActivity(activity || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async (period: string) => {
    try {
      const trendsRes = await analyticsService.getEvaluationTrends(period);
      const trends = (trendsRes as any)?.data ?? trendsRes;
      setTrendData(trends || []);
    } catch (error) {
      console.error('Failed to load trend data:', error);
      setTrendData([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-teal-500 to-violet-500 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-sm">
                {t('dashboard.welcome')} 👋
              </h1>
              <p className="text-cyan-50 text-lg max-w-xl">
                {t('dashboard.welcomeDesc')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/evaluations"
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20"
              >
                View Evaluations
              </Link>
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/20 disabled:opacity-50"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="px-6 py-3 bg-white text-cyan-600 font-semibold rounded-xl hover:bg-cyan-50 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.titleKey}
              to={action.link}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 border border-slate-100 hover:border-cyan-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full -mr-8 -mt-8`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                {action.icon}
              </div>
              <h3 className="mt-4 font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                {t(action.titleKey)}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t(action.descriptionKey)}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Overview</h2>
          <span className="text-sm text-slate-500">Live data</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Staff"
            value={dashboardData?.total_staff ?? 0}
            change={dashboardData?.active_staff ? Math.round((dashboardData.active_staff / dashboardData.total_staff) * 100) : 0}
            changeLabel="active"
            trend="up"
            color="from-cyan-500 to-teal-500"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Total Centers"
            value={dashboardData?.total_centers ?? 0}
            change={dashboardData?.active_centers ? Math.round((dashboardData.active_centers / dashboardData.total_centers) * 100) : 0}
            changeLabel="active"
            trend="up"
            color="from-violet-500 to-purple-500"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatsCard
            title="Evaluations"
            value={dashboardData?.total_evaluations ?? 0}
            change={dashboardData?.completion_rate ?? 0}
            changeLabel="completion rate"
            trend={dashboardData?.completion_rate > 50 ? 'up' : 'neutral'}
            color="from-blue-500 to-cyan-500"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatsCard
            title="Avg. Score"
            value={`${dashboardData?.average_percentage ?? 0}%`}
            change={dashboardData?.average_percentage ? (dashboardData.average_percentage >= 70 ? 5 : -2) : 0}
            changeLabel="vs target"
            trend={dashboardData?.average_percentage >= 70 ? 'up' : 'down'}
            color="from-emerald-500 to-teal-500"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreTrendChart
          data={trendData}
          period={trendPeriod}
          onPeriodChange={setTrendPeriod}
        />
        <ScoreDistributionChart data={scoreDistribution} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassificationBreakdownChart data={classificationBreakdown} />
        <GeographicMap data={centerPerformance} />
      </div>

      {/* Center Rankings */}
      <CenterRankingTable data={centerPerformance} />

      {/* Recent Activity */}
      <RecentActivity data={recentActivity} />
    </div>
  );
};

export default DashboardPage;
