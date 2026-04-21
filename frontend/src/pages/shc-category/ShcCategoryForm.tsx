import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { shcCategoryApi, medicalFieldApi, specialtyApi, rankApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface MedicalField {
  id: number
  name: string
  name_ar: string
}

interface Specialty {
  id: number
  name: string
  name_ar: string
}

interface Rank {
  id: number
  name: string
  name_ar: string
}

interface FormData {
  code: string
  description: string
  description_ar: string
  medical_field_id: number | null
  specialty_id: number | null
  rank_id: number | null
  is_active: boolean
}

const initialFormData: FormData = {
  code: '',
  description: '',
  description_ar: '',
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
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [ranks, setRanks] = useState<Rank[]>([])

  const fetchDropdowns = async () => {
    try {
      const [mfRes, spRes, rRes] = await Promise.all([
        medicalFieldApi.getAll({ is_active: true }),
        specialtyApi.getAll({ is_active: true }),
        rankApi.getAll({ is_active: true }),
      ])
      setMedicalFields(mfRes.data.data || [])
      setSpecialties(spRes.data.data || [])
      setRanks(rRes.data.data || [])
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
        description: category.description || '',
        description_ar: category.description_ar || '',
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

  const updateField = (field: keyof FormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          description: formData.description,
          description_ar: formData.description_ar,
          medical_field_id: formData.medical_field_id ?? undefined,
          specialty_id: formData.specialty_id ?? undefined,
          rank_id: formData.rank_id ?? undefined,
          is_active: formData.is_active,
        })
      } else {
        await shcCategoryApi.create({
          code: formData.code,
          description: formData.description,
          description_ar: formData.description_ar,
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

  const getMedicalFieldName = (item: MedicalField) => {
    return locale === 'ar' ? item.name_ar || item.name : item.name
  }

  const getSpecialtyName = (item: Specialty) => {
    return locale === 'ar' ? item.name_ar || item.name : item.name
  }

  const getRankName = (item: Rank) => {
    return locale === 'ar' ? item.name_ar || item.name : item.name
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
            <Input
              label={locale === 'ar' ? 'الوصف' : 'Description'}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            <Input
              label={locale === 'ar' ? 'الوصف بالعربي' : 'Arabic Description'}
              value={formData.description_ar}
              onChange={(e) => updateField('description_ar', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'المجال الطبي' : 'Medical Field'}
              </label>
              <select
                value={formData.medical_field_id ?? ''}
                onChange={(e) => updateField('medical_field_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="">
                  {locale === 'ar' ? 'اختر المجال الطبي' : 'Select Medical Field'}
                </option>
                {medicalFields.map((mf) => (
                  <option key={mf.id} value={mf.id}>
                    {getMedicalFieldName(mf)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'التخصص' : 'Specialty'}
              </label>
              <select
                value={formData.specialty_id ?? ''}
                onChange={(e) => updateField('specialty_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="">
                  {locale === 'ar' ? 'اختر التخصص' : 'Select Specialty'}
                </option>
                {specialties.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {getSpecialtyName(sp)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الرتبة' : 'Rank'}
              </label>
              <select
                value={formData.rank_id ?? ''}
                onChange={(e) => updateField('rank_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="">
                  {locale === 'ar' ? 'اختر الرتبة' : 'Select Rank'}
                </option>
                {ranks.map((r) => (
                  <option key={r.id} value={r.id}>
                    {getRankName(r)}
                  </option>
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