import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { authApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Key, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export function PasswordChangePage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { locale } = useAppStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/

  const validatePassword = (pwd: string) => {
    if (pwd.length < 12) {
      return locale === 'ar' ? 'يجب أن تكون كلمة المرور 12 حرفًا على الأقل' : 'Password must be at least 12 characters'
    }
    if (!passwordRegex.test(pwd)) {
      return locale === 'ar' ? 'يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز' : 'Password must contain uppercase, lowercase, numbers and special characters'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validatePassword(newPassword)
    if (validationError) {
      setError(validationError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      setSuccess(true)
      setTimeout(async () => {
        await logout()
        navigate('/login')
      }, 2000)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || (locale === 'ar' ? 'فشل في تغيير كلمة المرور' : 'Failed to change password'))
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-surface border border-primary/10 rounded-2xl shadow-color-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text">
                {locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>
              <p className="text-sm text-muted">
                {locale === 'ar' ? 'حدث كلمة المرور الخاصة بك' : 'Update your password'}
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-text">
                {locale === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'}
              </p>
              <p className="text-sm text-muted mt-2">
                {locale === 'ar' ? 'جاري إعادة التوجيه لتسجيل الدخول...' : 'Redirecting to login...'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pr-10 px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pr-10 px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-muted mt-1">
                  {locale === 'ar' 
                    ? '12+ حرف، أحرف كبيرة وصغيرة، أرقام ورموز'
                    : '12+ chars, uppercase, lowercase, numbers & symbols'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  {locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10 px-4 py-3 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full py-3 bg-gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (locale === 'ar' ? 'جاري التغيير...' : 'Changing...')
                  : (locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password')}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}