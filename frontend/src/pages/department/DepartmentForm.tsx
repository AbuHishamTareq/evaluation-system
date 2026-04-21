import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { departmentApi, phcCenterApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FormData {
  name: string
  name_ar: string
  code: string
  phc_center_id: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  name_ar: '',
  code: '',
  phc_center_id: null,
  is_active: true,
}

export function DepartmentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { locale } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phcCenters, setPhcCenters] = useState<{ id: number; name: string }[]>([])
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const fetchData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await departmentApi.getById(Number(id))
      const dept = res.data.data
      setFormData({
        name: dept.name || '',
        name_ar: dept.name_ar || '',
        code: dept.code || '',
        phc_center_id: dept.phc_center_id || null,
        is_active: dept.is_active ?? true,
      })
    } catch (err) {
      setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPhcCenters = async () => {
    try {
      const res = await phcCenterApi.getAll()
      setPhcCenters(res.data.data || [])
    } catch (err) {
      console.error('Failed to load PHC centers:', err)
    }
  }

  useEffect(() => {
    fetchPhcCenters()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      fetchData()
    }
  }, [id])

  const updateField = (field: keyof FormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.phc_center_id) {
      setError(locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      if (isEdit && id) {
        await departmentApi.update(Number(id), {
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          phc_center_id: formData.phc_center_id,
          is_active: formData.is_active,
        })
      } else {
        await departmentApi.create({
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          phc_center_id: formData.phc_center_id!,
          is_active: formData.is_active,
        })
      }
      navigate('/departments')
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setError(errObj.response?.data?.message || (locale === 'ar' ? 'فشل الحفظ' : 'Failed to save'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit
              ? locale === 'ar' ? 'تعديل القسم' : 'Edit Department'
              : locale === 'ar' ? 'إضافة قسم' : 'Add Department'}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={locale === 'ar' ? 'اسم القسم' : 'Department Name'}
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
            <Input
              label={locale === 'ar' ? 'الاسم بالعربي' : 'Arabic Name'}
              value={formData.name_ar}
              onChange={(e) => updateField('name_ar', e.target.value)}
            />
            <Input
              label={locale === 'ar' ? 'الرمز' : 'Code'}
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'مركز الصحة' : 'PHC Center'}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.phc_center_id || ''}
                onChange={(e) => updateField('phc_center_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">{locale === 'ar' ? 'اختر المركز' : 'Select PHC Center'}</option>
                {phcCenters.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => updateField('is_active', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                {locale === 'ar' ? 'نشط' : 'Active'}
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate('/departments')}>
              {locale === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              {locale === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}