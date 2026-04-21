import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { phcCenterApi, zoneApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FormData {
  name: string
  name_ar: string
  code: string
  address: string
  phone: string
  region_id: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  name_ar: '',
  code: '',
  address: '',
  phone: '',
  region_id: null,
  is_active: true,
}

export function PhcCenterForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { locale } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zones, setZones] = useState<{ id: number; name: string }[]>([])
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const fetchData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await phcCenterApi.getById(Number(id))
      const phc = res.data.data
      setFormData({
        name: phc.name || '',
        name_ar: phc.name_ar || '',
        code: phc.code || '',
        address: phc.address || '',
        phone: phc.phone || '',
        region_id: phc.region_id || null,
        is_active: phc.is_active ?? true,
      })
    } catch (err) {
      setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchZones = async () => {
    try {
      const res = await zoneApi.getAll()
      setZones(res.data.data || [])
    } catch (err) {
      console.error('Failed to load zones:', err)
    }
  }

  useEffect(() => {
    fetchZones()
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
    if (!formData.name || !formData.code || !formData.region_id) {
      setError(locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        name: formData.name,
        name_ar: formData.name_ar,
        code: formData.code,
        address: formData.address,
        phone: formData.phone,
        region_id: formData.region_id,
        is_active: formData.is_active,
      }

      if (isEdit && id) {
        await phcCenterApi.update(Number(id), payload)
      } else {
        await phcCenterApi.create(payload)
      }
      navigate('/phc-centers')
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
              ? locale === 'ar' ? 'تعديل المركز' : 'Edit PHC Center'
              : locale === 'ar' ? 'إضافة مركز' : 'Add PHC Center'}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={locale === 'ar' ? 'اسم المركز' : 'PHC Center Name'}
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
            <Input
              label={locale === 'ar' ? 'العنوان' : 'Address'}
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <Input
              label={locale === 'ar' ? 'الهاتف' : 'Phone'}
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'المنطقة' : 'Zone'}
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region_id || ''}
                onChange={(e) => updateField('region_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">{locale === 'ar' ? 'اختر المنطقة' : 'Select Zone'}</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
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
            <Button variant="outline" onClick={() => navigate('/phc-centers')}>
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