/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'
import { Layout } from '@/components/Layout'
import { dashboardApi } from '@/lib/api'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Activity, Users, AlertTriangle, ClipboardCheck,
  TrendingUp, TrendingDown, ChevronRight, RefreshCw, Shield
} from 'lucide-react'

interface KpiData {
  incidents: { total: number; open: number; high_critical: number; by_type: Record<string, number> }
  evaluations: { total: number; completed: number; avg_score: number }
  issues: { total: number; open: number; urgent: number }
  staff: { total: number; active: number }
  shifts: { total: number; scheduled: number }
}

interface DrillDownData {
  current: { name: string; code: string; stats?: KpiData; center_count?: number; staff_count?: number }
  breadcrumbs: { type: string; id: number; label: string }[]
  children: { id: number; name: string; code: string }[]
}

const COLORS = ['#2E4565', '#289ED5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function DashboardPage() {
  const { user } = useAuthStore()
  const { locale, direction } = useAppStore()
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'

  const [kpiData, setKpiData] = useState<KpiData | null>(null)
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  interface ApiError {
  response?: { data?: { message?: string } }
}

const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const kpiParams: { phc_center_id?: number; region_id?: number } = {}
      if (user?.phc_center_id) {
        kpiParams.phc_center_id = user.phc_center_id
      }
      const kpiRes = await dashboardApi.getKpiSummary(kpiParams)
      setKpiData(kpiRes.data)

      if (!selectedEntity) {
        const drillRes = await dashboardApi.getDrillDown(
          user?.phc_center_id ? 'phc_center' : 'region',
          user?.phc_center_id || user?.tenant?.id || 1
        )
        setDrillDownData(drillRes.data)
      }
    } catch (err) {
      const error = err as ApiError
      setError(error.response?.data?.message || 'Failed to load dashboard data')
      setKpiData(getDefaultKpi())
      setDrillDownData(getDefaultDrillDown())
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrillDown = async (type: string, id: number) => {
    setSelectedEntity({ type, id })
    try {
      const res = await dashboardApi.getDrillDown(type, id)
      setDrillDownData(res.data)
    } catch (err) {
      console.error('Drill down error:', err)
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    if (!drillDownData) return
    if (index < drillDownData.breadcrumbs.length - 1) {
      const crumb = drillDownData.breadcrumbs[index]
      handleDrillDown(crumb.type, crumb.id)
    }
  }

  const incidentTypes = kpiData?.incidents?.by_type
    ? Object.entries(kpiData.incidents.by_type).map(([name, value]) => ({ name, value }))
    : []

  const pieData = incidentTypes.length > 0
    ? incidentTypes
    : [
        { name: 'Medication', value: kpiData?.incidents?.total || 12 },
        { name: 'Treatment', value: 8 },
        { name: 'Equipment', value: 5 },
        { name: 'Near Miss', value: 3 },
      ]

  const trendData = [
    { name: 'Mon', incidents: 4, evaluations: 8, issues: 2 },
    { name: 'Tue', incidents: 3, evaluations: 12, issues: 5 },
    { name: 'Wed', incidents: 5, evaluations: 6, issues: 3 },
    { name: 'Thu', incidents: 2, evaluations: 9, issues: 4 },
    { name: 'Fri', incidents: 6, evaluations: 11, issues: 2 },
    { name: 'Sat', incidents: 4, evaluations: 7, issues: 3 },
    { name: 'Sun', incidents: 3, evaluations: 10, issues: 4 },
  ]

  return (
    <Layout>
      <div className={`space-y-6 ${fontClass}`} dir={direction}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getTranslation(locale, 'dashboard.welcome')}, {user?.name}!
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.tenant?.name || 'PHC System'} - {new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {getTranslation(locale, 'common.refresh')}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getTranslation(locale, 'dashboard.incidents')}</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData?.incidents?.total || 0}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className="text-red-600 font-medium">{kpiData?.incidents?.high_critical || 0}</span>
              <span className="text-gray-500">{getTranslation(locale, 'dashboard.highCritical')}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getTranslation(locale, 'dashboard.evaluations')}</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData?.evaluations?.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">{kpiData?.evaluations?.completed || 0}</span>
              <span className="text-gray-500">{getTranslation(locale, 'dashboard.completed')}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getTranslation(locale, 'dashboard.staff')}</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData?.staff?.total || 0}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className="text-green-600 font-medium">{kpiData?.staff?.active || 0}</span>
              <span className="text-gray-500">{getTranslation(locale, 'dashboard.active')}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{getTranslation(locale, 'dashboard.issues')}</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData?.issues?.total || 0}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Activity className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <span className="text-red-600 font-medium">{kpiData?.issues?.urgent || 0}</span>
              <span className="text-gray-500">{getTranslation(locale, 'dashboard.urgent')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getTranslation(locale, 'dashboard.weeklyTrends')}
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="incidents" name={getTranslation(locale, 'dashboard.incidents')} fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="evaluations" name={getTranslation(locale, 'dashboard.evaluations')} fill="#289ED5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="issues" name={getTranslation(locale, 'dashboard.issues')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getTranslation(locale, 'dashboard.incidentTypes')}
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {getTranslation(locale, 'dashboard.organization')}
          </h3>
          
          {drillDownData?.breadcrumbs && drillDownData.breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 mb-4 text-sm">
              {drillDownData.breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`text-brand-600 hover:text-brand-800 ${index === drillDownData.breadcrumbs.length - 1 ? 'font-semibold' : ''}`}
                  >
                    {crumb.label}
                  </button>
                  {index < drillDownData.breadcrumbs.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drillDownData?.children?.map((child) => (
              <button
                key={child.id}
                onClick={() => handleDrillDown('phc_center', child.id)}
                className="p-4 border border-gray-200 rounded-lg text-left hover:border-brand-500 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-brand-600">{child.name}</p>
                    <p className="text-sm text-gray-500">{child.code}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500" />
                </div>
              </button>
            ))}
          </div>

          {(!drillDownData?.children || drillDownData.children.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>{getTranslation(locale, 'dashboard.noData')}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getTranslation(locale, 'dashboard.avgScore')}
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-gray-900">
                {((kpiData?.evaluations?.avg_score) || 0).toFixed(1)}%
              </div>
              <div className={`p-4 rounded-full ${(kpiData?.evaluations?.avg_score || 0) >= 70 ? 'bg-green-50' : 'bg-red-50'}`}>
                {(kpiData?.evaluations?.avg_score || 0) >= 70 ? (
                  <TrendingUp className="w-8 h-8 text-green-500" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {getTranslation(locale, 'dashboard.shiftCoverage')}
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-gray-900">
                {((kpiData?.shifts?.scheduled || 0) / Math.max(kpiData?.shifts?.total || 1, 1) * 100).toFixed(0)}%
              </div>
              <div className="p-4 rounded-full bg-blue-50">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function getDefaultKpi(): KpiData {
  return {
    incidents: { total: 0, open: 0, high_critical: 0, by_type: {} },
    evaluations: { total: 0, completed: 0, avg_score: 0 },
    issues: { total: 0, open: 0, urgent: 0 },
    staff: { total: 0, active: 0 },
    shifts: { total: 0, scheduled: 0 },
  }
}

function getDefaultDrillDown(): DrillDownData {
  return {
    current: { name: 'PHC System', code: 'PHC' },
    breadcrumbs: [],
    children: [],
  }
}