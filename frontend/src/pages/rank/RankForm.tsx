import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { rankApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FormData {
  name: string
  name_ar: string
  code: string
  level: number
  is_active: boolean
}

const initialFormData: FormData = {
  name: '',
  name_ar: '',
  code: '',
  level: 1,
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
        level: rank.level ?? 1,
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

  const updateField = (field: keyof FormData, value: string | number | boolean) => {
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
        await rankApi.update(Number(id), {
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          level: formData.level,
          is_active: formData.is_active,
        })
      } else {
        await rankApi.create({
          name: formData.name,
          name_ar: formData.name_ar,
          code: formData.code,
          level: formData.level,
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
            <Input
              label={locale === 'ar' ? 'المستوى' : 'Level'}
              type="number"
              value={formData.level}
              onChange={(e) => updateField('level', Number(e.target.value))}
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