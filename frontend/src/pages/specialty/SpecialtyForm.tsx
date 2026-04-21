import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { specialtyApi, medicalFieldApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface MedicalField {
  id: number
  name: string
  name_ar: string
}

interface FormData {
  name: string
  name_ar: string
  code: string
  medical_field_id: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  name_ar: '',
  code: '',
  medical_field_id: null,
  is_active: true,
}

export function SpecialtyForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { locale } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [medicalFields, setMedicalFields] = useState<MedicalField[]>([])
  const [isLoadingMedicalFields, setIsLoadingMedicalFields] = useState(true)

  const fetchMedicalFields = async () => {
    setIsLoadingMedicalFields(true)
    try {
      const res = await medicalFieldApi.getAll({ per_page: 1000 })
      setMedicalFields(res.data.data || [])
    } catch {
      setError(locale === 'ar' ? 'فشل تحميل الحقول الطبية' : 'Failed to load medical fields')
    } finally {
      setIsLoadingMedicalFields(false)
    }
  }

  useEffect(() => {
    fetchMedicalFields()
  }, [])

  const fetchData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await specialtyApi.getById(Number(id))
      const specialty = res.data.data
      setFormData({
        name: specialty.name || '',
        name_ar: specialty.name_ar || '',
        code: specialty.code || '',
        medical_field_id: specialty.medical_field?.id || null,
        is_active: specialty.is_active ?? true,
      })
    } catch {
      setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isEdit && id) {
      fetchData()
    }
  }, [id])

  const updateField = (field: keyof FormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      setError(locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      if (isEdit && id) {
        await specialtyApi.update(Number(id), {
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          medical_field_id: formData.medical_field_id || undefined,
          is_active: formData.is_active,
        })
      } else {
        await specialtyApi.create({
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          medical_field_id: formData.medical_field_id || undefined,
          is_active: formData.is_active,
        })
      }
      navigate('/specialties')
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } }
      setError(errObj.response?.data?.message || (locale === 'ar' ? 'فشل الحفظ' : 'Failed to save'))
    } finally {
      setIsLoading(false)
    }
  }

  const medicalFieldOptions = medicalFields.map(mf => ({
    value: mf.id,
    label: locale === 'ar' ? mf.name_ar || mf.name : mf.name,
  }))

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit
              ? locale === 'ar' ? 'تعديل التخصص' : 'Edit Specialty'
              : locale === 'ar' ? 'إضافة تخصص' : 'Add Specialty'}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={locale === 'ar' ? 'الاسم' : 'Name'}
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
            />
            <Select
              label={locale === 'ar' ? 'الحقل الطبي' : 'Medical Field'}
              value={formData.medical_field_id?.toString() || ''}
              onChange={(val: string | number) =>
                updateField('medical_field_id', val ? Number(val) : null)
              }
              options={medicalFieldOptions}
              placeholder={locale === 'ar' ? 'اختر الحقل الطبي' : 'Select Medical Field'}
              disabled={isLoadingMedicalFields}
            />
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

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => navigate('/specialties')}>
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