import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'
import { Layout } from '@/components/Layout'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { locale } = useAppStore()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {getTranslation(locale, 'dashboard.welcome')}, {user?.name}!
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getTranslation(locale, 'dashboard.recentIncidents')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getTranslation(locale, 'dashboard.pendingEvaluations')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getTranslation(locale, 'dashboard.staffShortage')}
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-600">0</p>
          </div>
        </div>

        {user?.tenant && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {getTranslation(locale, 'organization.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">{getTranslation(locale, 'organization.tenant')}:</span>
                <p className="text-gray-900">{user.tenant.name}</p>
              </div>
              {user.phc_center && (
                <div>
                  <span className="text-sm text-gray-500">{getTranslation(locale, 'organization.phcCenter')}:</span>
                  <p className="text-gray-900">{user.phc_center.name}</p>
                </div>
              )}
              {user.department && (
                <div>
                  <span className="text-sm text-gray-500">{getTranslation(locale, 'organization.department')}:</span>
                  <p className="text-gray-900">{user.department.name}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500">{getTranslation(locale, 'organization.role')}:</span>
                <p className="text-gray-900">
                  {user.roles.map((r) => r.name).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}