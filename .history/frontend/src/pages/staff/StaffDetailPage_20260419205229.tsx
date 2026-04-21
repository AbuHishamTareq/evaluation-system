import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { getTranslation } from '@/i18n'
import { Layout } from '@/components/Layout'
import { staffApi } from '@/lib/api'
import { ArrowLeft, Edit2, Trash2, Award, Shield, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface StaffMember {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  first_name_ar: string
  last_name_ar: string
  phone: string
  email?: string
  gender?: string
  national_id?: string
  birth_date?: string
  employment_status: string
  hire_date?: string
  termination_date?: string
  job_title?: string
  zone_id?: number
  zone?: { id: number; name: string; name_ar: string }
  phc_center_id?: number
  phc_center?: { id: number; name: string; name_ar: string }
  department_id?: number
  department?: { id: number; name: string; name_ar: string }
  scfhs_license?: string
  scfhs_license_expiry?: string
  malpractice_insurance?: string
  malpractice_expiry?: string
  user?: { id: number; email: string; roles: { id: number; name: string }[] }
  certificates?: { id: number; certificate_name: string; institute_name: string; issue_date?: string }[]
}

export function StaffDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { locale, direction } = useAppStore()
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'

  const [staff, setStaff] = useState<StaffMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchStaff()
  }, [id])

  const fetchStaff = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await staffApi.getById(Number(id))
      setStaff(res.data.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to load staff')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 30
  }

  const isExpired = (dateStr?: string) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  const getTimeRemaining = (dateStr?: string) => {
    if (!dateStr) return null
    const expiry = new Date(dateStr)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    if (diff <= 0) return { years: 0, months: 0, days: 0, expired: true }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    const remainingDays = days % 30

    return { years, months: remainingMonths, days: remainingDays, expired: false }
  }

  const calculateAge = (dateStr?: string) => {
    if (!dateStr) return null
    const birth = new Date(dateStr)
    const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    let days = now.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      days += prevMonth.getDate()
    }
    if (months < 0) {
      years--
      months += 12
    }

    return { years, months, days }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-500">{getTranslation(locale, 'common.loading')}</p>
        </div>
      </Layout>
    )
  }

  if (error || !staff) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'Staff not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/staff')}>
            <ArrowLeft className="w-4 h-4 me-2" />
            {locale === 'ar' ? 'العودة للقائمة' : 'Back to List'}
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className={`space-y-6 ${fontClass}`} dir={direction}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/staff')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === 'ar' ? 'العودة للقائمة' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <Link to={`/staff/${id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 me-2" />
                {locale === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
            </Link>
            <Button variant="danger" size="sm">
              <Trash2 className="w-4 h-4 me-2" />
              {locale === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'الاسم' : 'Name'}</p>
                  <p className="font-medium">
                    {locale === 'ar'
                      ? `${staff.first_name_ar} ${staff.last_name_ar}`
                      : `${staff.first_name} ${staff.last_name}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'رقم الموظف' : 'Employee ID'}</p>
                  <p className="font-medium font-mono">{staff.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                  <p className="font-medium">{staff.email || staff.user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'الهاتف' : 'Phone'}</p>
                  <p className="font-medium">{staff.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}</p>
                  <p className="font-medium">{formatDate(staff.birth_date)}</p>
                  {staff.birth_date && (() => {
                    const age = calculateAge(staff.birth_date)
                    if (!age) return null
                    return (
                      <p className="text-sm text-gray-500 mt-1">
                        {age.years} {locale === 'ar' ? (age.years === 1 ? 'سنة' : 'سنة') : age.years === 1 ? 'Year' : 'Years'}
                        {age.months > 0 && `, ${age.months} ${locale === 'ar' ? 'شهر' : age.months === 1 ? 'Month' : 'Months'}`}
                      </p>
                    )
                  })()}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'الجنس' : 'Gender'}</p>
                  <p className="font-medium">
                    {staff.gender === 'male'
                      ? locale === 'ar' ? 'ذكر' : 'Male'
                      : staff.gender === 'female'
                      ? locale === 'ar' ? 'أنثى' : 'Female'
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {locale === 'ar' ? 'المعلومات الوظيفية' : 'Professional Information'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'المنطقة' : 'Zone'}</p>
                  <p className="font-medium">
                    {staff.zone?.name || staff.zone?.name_ar || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'مركز الصحة' : 'PHC Center'}</p>
                  <p className="font-medium">
                    {staff.phc_center?.name || staff.phc_center?.name_ar || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}</p>
                  <p className="font-medium">
                    {staff.job_title || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'القسم' : 'Department'}</p>
                  <p className="font-medium">
                    {staff.department?.name || staff.department?.name_ar || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'الحالة' : 'Status'}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      staff.employment_status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {locale === 'ar'
                      ? staff.employment_status === 'active' ? 'نشط' : 'غير نشط'
                      : staff.employment_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}</p>
                  <p className="font-medium">{formatDate(staff.hire_date)}</p>
                </div>
                {staff.termination_date && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {locale === 'ar' ? 'تاريخ انتهاء العمل' : 'Termination Date'}
                    </p>
                    <p className="font-medium">{formatDate(staff.termination_date)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`bg-white rounded-lg shadow-sm border p-6 ${isExpiringSoon(staff.scfhs_license_expiry) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {locale === 'ar' ? 'رخصة الهيئة' : 'SCFHS License'}
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'رقم الرخصة' : 'License Number'}</p>
                  <p className="font-medium font-mono">{staff.scfhs_license || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</p>
                  <p
                    className={`font-medium ${
                      isExpired(staff.scfhs_license_expiry)
                        ? 'text-red-600'
                        : isExpiringSoon(staff.scfhs_license_expiry)
                        ? 'text-red-600'
                        : ''
                    }`}
                  >
                    {formatDate(staff.scfhs_license_expiry)}
                  </p>
                </div>
                {staff.scfhs_license_expiry && (
                  <div className={`p-3 rounded-lg ${isExpired(staff.scfhs_license_expiry) ? 'bg-red-100' : isExpiringSoon(staff.scfhs_license_expiry) ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <p className="text-sm text-gray-500 mb-1">
                      {locale === 'ar' ? 'المتبقي' : 'Time Remaining'}
                    </p>
                    {(() => {
                      const remaining = getTimeRemaining(staff.scfhs_license_expiry)
                      if (!remaining) return null
                      if (remaining.expired) {
                        return (
                          <p className="font-medium text-red-600">
                            {locale === 'ar' ? 'منتهية' : 'Expired'}
                          </p>
                        )
                      }
                      const parts = []
                      if (remaining.years > 0) {
                        parts.push(`${remaining.years} ${locale === 'ar' ? 'سنة' : remaining.years === 1 ? 'Year' : 'Years'}`)
                      }
                      if (remaining.months > 0) {
                        parts.push(`${remaining.months} ${locale === 'ar' ? 'شهر' : remaining.months === 1 ? 'Month' : 'Months'}`)
                      }
                      if (remaining.days > 0 || parts.length === 0) {
                        parts.push(`${remaining.days} ${locale === 'ar' ? 'يوم' : remaining.days === 1 ? 'Day' : 'Days'}`)
                      }
                      return (
                        <p className={`font-medium ${isExpiringSoon(staff.scfhs_license_expiry) ? 'text-red-600' : ''}`}>
                          {parts.join(', ')}
                        </p>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow-sm border p-6 ${isExpiringSoon(staff.malpractice_expiry) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {locale === 'ar' ? 'التأمين' : 'Insurance'}
                </h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'رقم الوثيقة' : 'Policy Number'}</p>
                  <p className="font-medium font-mono">{staff.malpractice_insurance || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}</p>
                  <p
                    className={`font-medium ${
                      isExpired(staff.malpractice_expiry)
                        ? 'text-red-600'
                        : isExpiringSoon(staff.malpractice_expiry)
                        ? 'text-red-600'
                        : ''
                    }`}
                  >
                    {formatDate(staff.malpractice_expiry)}
                  </p>
                </div>
                {staff.malpractice_expiry && (
                  <div className={`p-3 rounded-lg ${isExpired(staff.malpractice_expiry) ? 'bg-red-100' : isExpiringSoon(staff.malpractice_expiry) ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <p className="text-sm text-gray-500 mb-1">
                      {locale === 'ar' ? 'المتبقي' : 'Time Remaining'}
                    </p>
                    {(() => {
                      const remaining = getTimeRemaining(staff.malpractice_expiry)
                      if (!remaining) return null
                      if (remaining.expired) {
                        return (
                          <p className="font-medium text-red-600">
                            {locale === 'ar' ? 'منتهية' : 'Expired'}
                          </p>
                        )
                      }
                      const parts = []
                      if (remaining.years > 0) {
                        parts.push(`${remaining.years} ${locale === 'ar' ? 'سنة' : remaining.years === 1 ? 'Year' : 'Years'}`)
                      }
                      if (remaining.months > 0) {
                        parts.push(`${remaining.months} ${locale === 'ar' ? 'شهر' : remaining.months === 1 ? 'Month' : 'Months'}`)
                      }
                      if (remaining.days > 0 || parts.length === 0) {
                        parts.push(`${remaining.days} ${locale === 'ar' ? 'يوم' : remaining.days === 1 ? 'Day' : 'Days'}`)
                      }
                      return (
                        <p className={`font-medium ${isExpiringSoon(staff.malpractice_expiry) ? 'text-red-600' : ''}`}>
                          {parts.join(', ')}
                        </p>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>

            {(staff.certificates && staff.certificates.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {locale === 'ar' ? 'الشهادات' : 'Certificates'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {staff.certificates.map((cert, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{cert.certificate_name}</span>
                        <span className="text-sm text-gray-500 ms-2">- {cert.institute_name}</span>
                      </div>
                      {cert.issue_date && (
                        <span className="text-xs text-gray-400">{cert.issue_date}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}