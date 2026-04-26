import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { shcCategoryApi, medicalFieldApi, specialtyApi, rankApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface MedicalField {
  id: number
  name: string
  name_ar: string
}

interface Specialty {
  id: number
  name: string
  name_ar: string
  medical_field_id: number
}

interface Rank {
  id: number
  name: string
  name_ar: string
  medical_field_id: number
  specialty_id: number
}

interface FormData {
  code: string
  medical_field_id: number | null
  specialty_id: number | null
  rank_id: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  code: '',
  medical_field_id: null,
  specialty_id: null,
  rank_id: null,
  is_active: true,
}

export function ShcCategoryForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { locale } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [medicalFields, setMedicalFields] = useState<MedicalField[]>([])
  const [allSpecialties, setAllSpecialties] = useState<Specialty[]>([])
  const [allRanks, setAllRanks] = useState<Rank[]>([])
  const [filteredSpecialties, setFilteredSpecialties] = useState<Specialty[]>([])
  const [filteredRanks, setFilteredRanks] = useState<Rank[]>([])

  const fetchDropdowns = async () => {
    try {
      const [mfRes, spRes, rRes] = await Promise.all([
        medicalFieldApi.getAll({ per_page: 200 }),
        specialtyApi.getAll({ per_page: 200 }),
        rankApi.getAll({ per_page: 200 }),
      ])
      setMedicalFields(mfRes.data.data || [])
      setAllSpecialties(spRes.data.data || [])
      setAllRanks(rRes.data.data || [])
    } catch (err) {
      console.error('Failed to load dropdowns:', err)
    }
  }

  const fetchData = async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await shcCategoryApi.getById(Number(id))
      const category = res.data.data
      setFormData({
        code: category.code || '',
        medical_field_id: category.medical_field_id ?? null,
        specialty_id: category.specialty_id ?? null,
        rank_id: category.rank_id ?? null,
        is_active: category.is_active ?? true,
      })
    } catch {
      setError(locale === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDropdowns()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      fetchData()
    }
  }, [id])

  useEffect(() => {
    if (formData.medical_field_id) {
      const filtered = allSpecialties.filter(s => s.medical_field_id === formData.medical_field_id)
      setFilteredSpecialties(filtered)
      if (formData.specialty_id && !filtered.find(s => s.id === formData.specialty_id)) {
        setFormData(prev => ({ ...prev, specialty_id: null, rank_id: null }))
      }
    } else {
      setFilteredSpecialties([])
      setFormData(prev => ({ ...prev, specialty_id: null, rank_id: null }))
    }
  }, [formData.medical_field_id, allSpecialties])

  useEffect(() => {
    if (formData.specialty_id) {
      const filtered = allRanks.filter(r => r.specialty_id === formData.specialty_id)
      setFilteredRanks(filtered)
      if (formData.rank_id && !filtered.find(r => r.id === formData.rank_id)) {
        setFormData(prev => ({ ...prev, rank_id: null }))
      }
    } else if (formData.medical_field_id) {
      const filtered = allRanks.filter(r => r.medical_field_id === formData.medical_field_id && !r.specialty_id)
      setFilteredRanks(filtered)
    } else {
      setFilteredRanks([])
    }
  }, [formData.specialty_id, formData.medical_field_id, allRanks])

  const updateField = (field: keyof FormData, value: string | number | boolean | null) => {
    if (field === 'medical_field_id') {
      setFormData(prev => ({ ...prev, [field]: value, specialty_id: null, rank_id: null }))
    } else if (field === 'specialty_id') {
      setFormData(prev => ({ ...prev, [field]: value, rank_id: null }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.code) {
      setError(locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      if (isEdit && id) {
        await shcCategoryApi.update(Number(id), {
          code: formData.code,
          medical_field_id: formData.medical_field_id ?? undefined,
          specialty_id: formData.specialty_id ?? undefined,
          rank_id: formData.rank_id ?? undefined,
          is_active: formData.is_active,
        })
      } else {
        await shcCategoryApi.create({
          code: formData.code,
          medical_field_id: formData.medical_field_id ?? undefined,
          specialty_id: formData.specialty_id ?? undefined,
          rank_id: formData.rank_id ?? undefined,
          is_active: formData.is_active,
        })
      }
      navigate('/shc-categories')
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
              ? locale === 'ar' ? 'تعديل الفئة' : 'Edit Category'
              : locale === 'ar' ? 'إضافة فئة' : 'Add Category'}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label={locale === 'ar' ? 'الرمز' : 'Code'}
              value={formData.code}
              onChange={(e) => updateField('code', e.target.value)}
              required
            />
            <Select
              label={locale === 'ar' ? 'المجال الطبي' : 'Medical Field'}
              value={formData.medical_field_id ?? ''}
              onChange={(val) => updateField('medical_field_id', val ? Number(val) : null)}
              options={[
                { value: '', label: locale === 'ar' ? 'اختر المجال الطبي' : 'Select Medical Field' },
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
                ...filteredSpecialties.map(sp => ({ value: sp.id, label: sp.name }))
              ]}
              searchable
              searchPlaceholder={locale === 'ar' ? 'بحث...' : 'Search...'}
            />
            <Select
              label={locale === 'ar' ? 'الرتبة' : 'Rank'}
              value={formData.rank_id ?? ''}
              onChange={(val) => updateField('rank_id', val ? Number(val) : null)}
              options={[
                { value: '', label: locale === 'ar' ? 'اختر الرتبة' : 'Select Rank' },
                ...filteredRanks.map(r => ({ value: r.id, label: r.name }))
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
            <Button variant="secondary" onClick={() => navigate('/shc-categories')}>
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