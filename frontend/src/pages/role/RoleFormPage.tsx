import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useAppStore } from '@/stores/appStore'
import { roleApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft, Save } from 'lucide-react'

interface Permission {
  id: number
  name: string
}

export function RoleFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { locale, direction } = useAppStore()
  const fontClass = locale === 'ar' ? 'font-ar' : 'font-en'
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    permissions: [] as number[],
  })
  const [saving, setSaving] = useState(false)
  const [allPermissions, setAllPermissions] = useState<Record<string, Permission[]>>({})

  useEffect(() => {
    fetchPermissions()
    if (isEdit && id) {
      fetchRole()
    }
  }, [id])

  const fetchRole = async () => {
    try {
      const res = await roleApi.getById(Number(id))
      const role = res.data.data
      setFormData({
        name: role.name || '',
        name_ar: role.name_ar || '',
        description: role.description || '',
        permissions: role.permissions?.map((p: { id: number }) => p.id) || [],
      })
    } catch (err) {
      console.error('Failed to load role:', err)
    }
  }

  const fetchPermissions = async () => {
    try {
      const res = await roleApi.getPermissions()
      setAllPermissions(res.data.data || {})
    } catch (err) {
      console.error('Failed to load permissions:', err)
    }
  }

  const updateField = (field: string, value: string | number | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId)
        : [...prev.permissions, permId],
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name) {
      Swal.fire({
        icon: 'error',
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: locale === 'ar' ? 'الاسم مطلوب' : 'Name is required',
      })
      return
    }

    setSaving(true)
    try {
      if (isEdit) {
        await roleApi.update(Number(id), formData)
      } else {
        await roleApi.create(formData)
      }

      Swal.fire({
        icon: 'success',
        title: locale === 'ar' ? 'تم' : 'Done',
        text: isEdit
          ? locale === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully'
          : locale === 'ar' ? 'تم الإنشاء بنجاح' : 'Created successfully',
      })
      navigate('/roles')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: locale === 'ar' ? 'خطأ' : 'Error',
        text: isEdit
          ? locale === 'ar' ? 'فشل التحديث' : 'Failed to update'
          : locale === 'ar' ? 'فشل الإنشاء' : 'Failed to create',
      })
    } finally {
      setSaving(false)
    }
  }

  const permissionLabels: Record<string, string> = {
    staff: locale === 'ar' ? 'الموظفين' : 'Staff',
    department: locale === 'ar' ? 'الأقسام' : 'Departments',
    zone: locale === 'ar' ? 'المناطق' : 'Zones',
    'phc-center': locale === 'ar' ? 'مراكز الصحة' : 'PHC Centers',
    nationality: locale === 'ar' ? 'الجنسيات' : 'Nationalities',
    medicalField: locale === 'ar' ? 'الحقول الطبية' : 'Medical Fields',
    specialty: locale === 'ar' ? 'التخصصات' : 'Specialties',
    rank: locale === 'ar' ? 'الرتبة' : 'Ranks',
    shcCategory: locale === 'ar' ? 'فئات الهيئة' : 'SHC Categories',
    role: locale === 'ar' ? 'الأدوار' : 'Roles',
  }

  return (
    <Layout>
      <div className={`space-y-6 ${fontClass}`} dir={direction}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/roles')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'ar' ? 'العودة للقائمة' : 'Back'}
            </button>
            <h1 className="text-2xl font-bold">
              {isEdit
                ? locale === 'ar' ? 'تعديل الدور' : 'Edit Role'
                : locale === 'ar' ? 'إضافة دور' : 'Add Role'}
            </h1>
          </div>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="w-4 h-4 me-2" />
            {saving
              ? locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'
              : locale === 'ar'
              ? 'حفظ'
              : 'Save'}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={locale === 'ar' ? 'الاسم' : 'Name'}
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('name', e.target.value)
              }
              required
            />
            <Input
              label={locale === 'ar' ? 'الاسم بالعربي' : 'Name (Arabic)'}
              value={formData.name_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('name_ar', e.target.value)
              }
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الوصف' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateField('description', e.target.value)
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {locale === 'ar' ? 'الصلاحيات' : 'Permissions'}
            </h2>
            <div className="space-y-4">
              {Object.entries(allPermissions).map(([group, perms]) => (
                <div key={group} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {permissionLabels[group] || group}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {perms.map(perm => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                        />
                        <span className="text-sm">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}