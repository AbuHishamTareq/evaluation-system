import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { teamBasedCodeApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'

interface FormData {
  code: string
  role: string
}

const initialFormData: FormData = {
  code: '',
  role: '',
}

export function TeamBasedCodeForm() {
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
      const res = await teamBasedCodeApi.getById(Number(id))
      const data = res.data.data
      setFormData({
        code: data.code || '',
        role: data.role || '',
      })
    } catch (err) {
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

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.code || !formData.role) {
      setError(locale === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        ...formData,
        is_active: true,
      }
      if (isEdit && id) {
        await teamBasedCodeApi.update(Number(id), payload)
      } else {
        await teamBasedCodeApi.create(payload)
      }
      navigate('/team-based-codes')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || (locale === 'ar' ? 'فشل الحفظ' : 'Failed to save'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-text mb-6">
          {isEdit
            ? locale === 'ar'
              ? 'تعديل الرمز'
              : 'Edit Code'
            : locale === 'ar'
            ? 'إضافة رمز جديد'
            : 'Add New Code'}
        </h1>

        <div className="bg-surface border border-primary/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              {locale === 'ar' ? 'الرمز *' : 'Code *'}
            </label>
            <Input
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder={locale === 'ar' ? 'أدخل الرمز' : 'Enter code'}
              disabled={isEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              {locale === 'ar' ? 'الدور *' : 'Role *'}
            </label>
            <Input
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              placeholder={locale === 'ar' ? 'أدخل الدور' : 'Enter role'}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Link to="/team-based-codes" className="flex-1">
              <Button variant="outline" className="w-full">
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading
                ? locale === 'ar'
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : locale === 'ar'
                ? 'حفظ'
                : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}