import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { rankApi, medicalFieldApi, specialtyApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface FormData {
  name: string
  name_ar: string
  code: string
  medical_field_id: number | null
  specialty_id: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  name_ar: '',
  code: '',
  medical_field_id: null,
  specialty_id: null,
  is_active: true,
}

export function RankForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { locale } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [medicalFields, setMedicalFields] = useState<{ id: number; name: string }[]>([])
  const [specialties, setSpecialties] = useState<{ id: number; name: string }[]>([])
  const [filteredSpecialties, setFilteredSpecialties] = useState<{ id: number; name: string }[]>([])

  const fetchData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await rankApi.getById(Number(id))
      const rank = res.data.data
      setFormData({
        name: rank.name || '',
        name_ar: rank.name_ar || '',
        code: rank.code || '',
        medical_field_id: rank.medical_field_id || null,
        specialty_id: rank.specialty_id || null,
        is_active: rank.is_active ?? true,
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

  useEffect(() => {
    const fetchMedicalFields = async () => {
      try {
        const res = await medicalFieldApi.getAll({ per_page: 100 })
        setMedicalFields(res.data.data || [])
      } catch (err) {
        console.error('Failed to load medical fields:', err)
      }
    }
    fetchMedicalFields()
  }, [])

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await specialtyApi.getAll({ per_page: 200 })
        setSpecialties(res.data.data || [])
      } catch (err) {
        console.error('Failed to load specialties:', err)
      }
    }
    fetchSpecialties()
  }, [])

  useEffect(() => {
    if (formData.medical_field_id) {
      setFilteredSpecialties(specialties.filter(s => s.medical_field_id === formData.medical_field_id))
      if (formData.specialty_id && !specialties.find(s => s.id === formData.specialty_id && s.medical_field_id === formData.medical_field_id)) {
        setFormData(prev => ({ ...prev, specialty_id: null }))
      }
    } else {
      setFilteredSpecialties([])
      setFormData(prev => ({ ...prev, specialty_id: null }))
    }
  }, [formData.medical_field_id, specialties])

  const updateField = (field: keyof FormData, value: string | number | boolean | null) => {
    if (field === 'medical_field_id') {
      setFormData(prev => ({ ...prev, [field]: value, specialty_id: null }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
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
        await rankApi.update(Number(id), {
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          medical_field_id: formData.medical_field_id,
          specialty_id: formData.specialty_id,
          is_active: formData.is_active,
        })
      } else {
        await rankApi.create({
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          medical_field_id: formData.medical_field_id,
          specialty_id: formData.specialty_id,
          is_active: formData.is_active,
        })
      }
      navigate('/ranks')
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
              ? locale === 'ar' ? 'تعديل الرتبة' : 'Edit Rank'
              : locale === 'ar' ? 'إضافة رتبة' : 'Add Rank'}
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
              value={formData.medical_field_id ?? ''}
              onChange={(val) => updateField('medical_field_id', val ? Number(val) : null)}
              options={[
                { value: '', label: locale === 'ar' ? 'اختر الحقل الطبي' : 'Select Medical Field' },
                ...medicalFields.map(mf => ({ value: mf.id, label: mf.name }))
              ]}
              searchable
              searchPlaceholder={locale === 'ar' ? 'بحث...' : 'Search...'}
            />
            <Select
              label={locale === 'ar' ? 'التخصص' : 'Specialty'}
              value={formData.specialty_id ?? ''}
              onChange={(val) => updateField('specialty_id', val ? Number(val) : null)}
              options={[
                { value: '', label: locale === 'ar' ? 'اختر التخصص' : 'Select Specialty' },
                ...filteredSpecialties.map(s => ({ value: s.id, label: s.name }))
              ]}
              searchable
              searchPlaceholder={locale === 'ar' ? 'بحث...' : 'Search...'}
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
            <Button variant="secondary" onClick={() => navigate('/ranks')}>
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