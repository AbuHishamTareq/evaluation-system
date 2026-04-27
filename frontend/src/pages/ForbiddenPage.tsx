import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { Layout } from '@/components/Layout'
import { ShieldOff, Home } from 'lucide-react'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { locale, direction } = useAppStore()
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Layout>
      <div className={`min-h-[calc(100vh-200px)] flex items-center justify-center ${fontClass}`} dir={direction}>
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {locale === 'ar' ? 'وصول مرفوض' : 'Access Forbidden'}
          </h1>

          <p className="text-gray-600 mb-2">
            {locale === 'ar' 
              ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.' 
              : 'You do not have permission to access this page.'}
          </p>

          <p className="text-sm text-gray-500 mb-8">
            {locale === 'ar' 
              ? 'يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.' 
              : 'Please contact the administrator if you believe this is an error.'}
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              {locale === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}