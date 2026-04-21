import { useAppStore } from '@/stores/appStore'
import { X, RotateCcw } from 'lucide-react'
import { useStaffFilters } from '@/stores/filtersStore'

interface StaffFiltersProps {
  departments: { id: number; name: string }[]
  onClose?: () => void
}

export function StaffFilters({ departments, onClose }: StaffFiltersProps) {
  const { locale } = useAppStore()
  const { status, department_id, license_expiry, setStatus, setDepartment, setLicenseExpiry, reset } = useStaffFilters()

  const statusOptions = [
    { value: '', label: locale === 'ar' ? 'الكل' : 'All' },
    { value: 'active', label: locale === 'ar' ? 'نشط' : 'Active' },
    { value: 'inactive', label: locale === 'ar' ? 'غير نشط' : 'Inactive' },
  ]

  const expiryOptions = [
    { value: '', label: locale === 'ar' ? 'الكل' : 'All' },
    { value: 'expired', label: locale === 'ar' ? 'منتهية' : 'Expired' },
    { value: 'expiring_soon', label: locale === 'ar' ? 'تنتهي قريباً' : 'Expiring Soon' },
    { value: 'valid', label: locale === 'ar' ? 'سارية' : 'Valid' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          {locale === 'ar' ? 'تصفية' : 'Filters'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded"
            title={locale === 'ar' ? 'إعادة تعيين' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {locale === 'ar' ? 'الحالة' : 'Status'}
          </label>
          <select
            value={status || ''}
            onChange={(e) => setStatus(e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {locale === 'ar' ? 'القسم' : 'Department'}
          </label>
          <select
            value={department_id || ''}
            onChange={(e) => setDepartment(e.target.value ? Number(e.target.value) : null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          >
            <option value="">{locale === 'ar' ? 'الكل' : 'All'}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {locale === 'ar' ? 'رخصة الهيئة' : 'SCFHS License'}
          </label>
          <select
            value={license_expiry || ''}
            onChange={(e) => setLicenseExpiry(e.target.value || null)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          >
            {expiryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}