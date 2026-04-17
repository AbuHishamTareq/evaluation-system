import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const { locale, setLocale, direction } = useAppStore()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en'
    setLocale(newLocale)
  }

  return (
    <div className="min-h-screen bg-brand-50" dir={direction}>
      <nav className="bg-white shadow-sm border-b border-brand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-brand-700">
                PHC Evaluation
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLocale}
                className="text-sm text-brand-600 hover:text-brand-800"
              >
                {locale === 'en' ? 'العربية' : 'English'}
              </button>
              <span className="text-sm text-brand-700">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {getTranslation(locale, 'auth.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}