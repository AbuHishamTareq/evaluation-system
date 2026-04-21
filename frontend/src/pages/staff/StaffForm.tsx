import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { staffApi, departmentApi, zoneApi, phcCenterApi, nationalityApi, medicalFieldApi, specialtyApi, rankApi, shcCategoryApi } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { User, Phone, Briefcase, Award, FileText, Upload, X, Image as ImageIcon } from 'lucide-react'

interface FormData {
  employee_id: string
  first_name: string
  last_name: string
  first_name_ar: string
  last_name_ar: string
  phone: string
  email: string
  national_id: string
  nationality_id: number | null
  birth_date: string
  gender: string
  zone_id: number | null
  phc_center_id: number | null
  department_id: number | null
  shc_category_id: number | null
  scfhs_license: string
  scfhs_license_expiry: string
  malpractice_insurance: string
  malpractice_expiry: string
  certifications: string
  education: string
  employment_status: string
  hire_date: string
}

const initialFormData: FormData = {
  employee_id: '',
  first_name: '',
  last_name: '',
  first_name_ar: '',
  last_name_ar: '',
  phone: '',
  email: '',
  national_id: '',
  nationality_id: null,
  birth_date: '',
  gender: '',
  zone_id: null,
  phc_center_id: null,
  department_id: null,
  shc_category_id: null,
  scfhs_license: '',
  scfhs_license_expiry: '',
  malpractice_insurance: '',
  malpractice_expiry: '',
  certifications: '',
  education: '',
  employment_status: 'active',
  hire_date: '',
}

const fmtDate = (d: string) => d ? d.split('T')[0] : ''

interface Step {
  id: string
  title: string
  titleAr: string
  icon: React.ReactNode
}

const steps: Step[] = [
  { id: 'personal', title: 'Personal', titleAr: 'شخصي', icon: <User className="w-5 h-5" /> },
  { id: 'contact', title: 'Contact', titleAr: 'اتصال', icon: <Phone className="w-5 h-5" /> },
  { id: 'job', title: 'Job', titleAr: 'وظيفي', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'education', title: 'Education', titleAr: 'تعليم', icon: <Award className="w-5 h-5" /> },
  { id: 'certificates', title: 'Certificates', titleAr: 'شهادات', icon: <Award className="w-5 h-5" /> },
  { id: 'experience', title: 'Experience', titleAr: 'خبرة', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'licenses', title: 'Licenses', titleAr: 'رخصة', icon: <Award className="w-5 h-5" /> },
  { id: 'documents', title: 'Documents', titleAr: 'مستندات', icon: <FileText className="w-5 h-5" /> },
]

export function StaffForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { locale } = useAppStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zones, setZones] = useState<{ id: number; name: string }[]>([])
  const [phcCenters, setPhcCenters] = useState<{ id: number; name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [nationalities, setNationalities] = useState<{ id: number; name: string }[]>([])
  const [medicalFields, setMedicalFields] = useState<{ id: number; name: string }[]>([])
  const [specialties, setSpecialties] = useState<{ id: number; name: string; medical_field_id: number }[]>([])
  const [ranks, setRanks] = useState<{ id: number; name: string }[]>([])
  const [shcCategories, setShcCategories] = useState<{ id: number; code: string; description: string }[]>([])
  const [zonesLoading, setZonesLoading] = useState(false)
  const [phcCentersLoading, setPhcCentersLoading] = useState(false)
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [nationalitiesLoading, setNationalitiesLoading] = useState(false)
  
  const [selectedMedicalFieldId, setSelectedMedicalFieldId] = useState<number | null>(null)
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null)
  const [selectedRankId, setSelectedRankId] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<File[]>([])
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null)
  const [existingCertificates, setExistingCertificates] = useState<{ name: string; url: string }[]>([])
  const [staffEducations, setStaffEducations] = useState<{ id?: number; school_name: string; degree: string; field_of_study: string; gpa: string; start_date: string; graduation_date: string; notes: string }[]>([])
  const [staffCertificates, setStaffCertificates] = useState<{ id?: number; institute_name: string; certificate_name: string; certificate_type: string; issue_date: string; expiry_date: string; notes: string }[]>([])
  const [staffExperiences, setStaffExperiences] = useState<{ id?: number; company_name: string; position: string; start_date: string; end_date: string; is_current: boolean; responsibilities: string }[]>([])

  const fetchZones = useCallback(async () => {
    setZonesLoading(true)
    try {
      const res = await zoneApi.getAll({ is_active: true })
      setZones(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setZonesLoading(false)
    }
  }, [])

  const fetchNationalities = useCallback(async () => {
    setNationalitiesLoading(true)
    try {
      const res = await nationalityApi.getAll({ is_active: true, per_page: 200 })
      setNationalities(res.data.data || [])
    } catch {
      // ignore
    } finally {
      setNationalitiesLoading(false)
    }
  }, [])

  const fetchMedicalFields = useCallback(async (search?: string) => {
    try {
      const res = await medicalFieldApi.getAll({ is_active: true, search, per_page: 100 })
      setMedicalFields(res.data.data || [])
    } catch {
      // ignore
    }
  }, [])

  const fetchSpecialties = useCallback(async (medicalFieldId: number, search?: string) => {
    try {
      const res = await specialtyApi.getAll({ medical_field_id: medicalFieldId, is_active: true, search, per_page: 100 })
      setSpecialties(res.data.data || [])
    } catch {
      setSpecialties([])
    }
  }, [])

  const fetchRanks = useCallback(async (search?: string) => {
    try {
      const res = await rankApi.getAll({ is_active: true, search, per_page: 100 })
      setRanks(res.data.data || [])
    } catch {
      setRanks([])
    }
  }, [])

  useEffect(() => {
    fetchZones()
    fetchNationalities()
    fetchMedicalFields()
    fetchRanks()
    if (isEdit && id) {
      fetchStaff()
    } else {
      fetchNextEmployeeId()
    }
  }, [id, fetchZones, fetchNationalities, fetchMedicalFields, fetchRanks])

  const fetchNextEmployeeId = async () => {
    try {
      const res = await staffApi.getNextEmployeeId()
      setFormData((prev) => ({ ...prev, employee_id: res.data.employee_id }))
    } catch {
      // ignore
    }
  }

  const fetchPhcCenters = useCallback(async (zoneId: number) => {
    setPhcCentersLoading(true)
    try {
      const res = await phcCenterApi.getAll({ region_id: zoneId, is_active: true })
      setPhcCenters(res.data.data || [])
    } catch {
      setPhcCenters([])
    } finally {
      setPhcCentersLoading(false)
    }
  }, [])

  const fetchDepartments = useCallback(async (phcCenterId: number, search?: string) => {
    setDepartmentsLoading(true)
    try {
      const res = await departmentApi.getAll({ phc_center_id: phcCenterId, is_active: true, search })
      setDepartments(res.data.data || [])
    } catch {
      setDepartments([])
    } finally {
      setDepartmentsLoading(false)
    }
  }, [])

  const handleZoneChange = (zoneId: string | number) => {
    const zid = zoneId ? Number(zoneId) : null
    setFormData((prev) => ({ ...prev, zone_id: zid, phc_center_id: null, department_id: null }))
    setPhcCenters([])
    setDepartments([])
    if (zid) {
      fetchPhcCenters(zid)
    }
  }

  const handlePhcCenterChange = (phcCenterId: string | number) => {
    const pid = phcCenterId ? Number(phcCenterId) : null
    setFormData((prev) => ({ ...prev, phc_center_id: pid, department_id: null }))
    setDepartments([])
    if (pid) {
      fetchDepartments(pid)
    }
  }

  const fetchStaff = async () => {
    setIsLoading(true)
    try {
      const res = await staffApi.getById(Number(id))
      const staff = res.data.data
      setFormData({
        employee_id: staff.employee_id || '',
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        first_name_ar: staff.first_name_ar || '',
        last_name_ar: staff.last_name_ar || '',
        phone: staff.phone || '',
        email: staff.email || staff.user?.email || '',
        national_id: staff.national_id || '',
        nationality_id: staff.nationality_id || null,
        birth_date: staff.birth_date?.split('T')[0] || '',
        gender: staff.gender || '',
        zone_id: staff.zone_id || null,
        phc_center_id: staff.phc_center_id || null,
        department_id: staff.department_id || null,
        shc_category_id: staff.shc_category_id || null,
        scfhs_license: staff.scfhs_license || '',
        scfhs_license_expiry: staff.scfhs_license_expiry?.split('T')[0] || '',
        malpractice_insurance: staff.malpractice_insurance || '',
        malpractice_expiry: staff.malpractice_expiry?.split('T')[0] || '',
        certifications: staff.certifications || '',
        education: staff.education || '',
        employment_status: staff.employment_status || 'active',
        hire_date: fmtDate(staff.hire_date),
      })
      if (staff.photo_url) {
        setExistingPhotoUrl(staff.photo_url)
      }
      if (staff.certificate_urls && Array.isArray(staff.certificate_urls)) {
        setExistingCertificates(staff.certificate_urls)
      }
      if (staff.shc_category) {
        const shc = staff.shc_category
        setSelectedMedicalFieldId(shc.medical_field_id || null)
        setSelectedSpecialtyId(shc.specialty_id || null)
        setSelectedRankId(shc.rank_id || null)
        if (shc.medical_field_id) {
          await fetchSpecialties(shc.medical_field_id)
        }
        setShcCategories([shc])
      }
      const fmt = (d: string) => d ? d.split('T')[0] : ''
      const formatEdu = (e: { id: number; school_name: string; degree: string; field_of_study?: string; gpa?: number; start_date?: string; graduation_date?: string; notes?: string }) => ({
        id: e.id, school_name: e.school_name, degree: e.degree, field_of_study: e.field_of_study || '', gpa: e.gpa?.toString() || '', start_date: fmt(e.start_date || ''), graduation_date: fmt(e.graduation_date || ''), notes: e.notes || ''
      } as { id: number; school_name: string; degree: string; field_of_study: string; gpa: string; start_date: string; graduation_date: string; notes: string })
      const formatCert = (c: { id: number; institute_name: string; certificate_name: string; certificate_type?: string; issue_date?: string; expiry_date?: string; notes?: string }) => ({
        id: c.id, institute_name: c.institute_name, certificate_name: c.certificate_name, certificate_type: c.certificate_type || '', issue_date: fmt(c.issue_date || ''), expiry_date: fmt(c.expiry_date || ''), notes: c.notes || ''
      } as { id: number; institute_name: string; certificate_name: string; certificate_type: string; issue_date: string; expiry_date: string; notes: string })
      const formatExp = (x: { id: number; company_name: string; position: string; start_date?: string; end_date?: string; is_current?: boolean; responsibilities?: string }) => ({
        id: x.id, company_name: x.company_name, position: x.position, start_date: fmt(x.start_date || ''), end_date: fmt(x.end_date || ''), is_current: x.is_current || false, responsibilities: x.responsibilities || ''
      } as { id: number; company_name: string; position: string; start_date: string; end_date: string; is_current: boolean; responsibilities: string })
      const [eduRes, certRes, expRes] = await Promise.all([
        staffApi.getEducations(Number(id)),
        staffApi.getCertificates(Number(id)),
        staffApi.getExperiences(Number(id))
      ])
      setStaffEducations(eduRes.data.data?.map(formatEdu) || [])
      setStaffCertificates(certRes.data.data?.map(formatCert) || [])
      setStaffExperiences(expRes.data.data?.map(formatExp) || [])

      if (staff.zone_id) {
        const zonesRes = await zoneApi.getAll({ is_active: true })
        setZones(zonesRes.data.data || [])
        if (staff.phc_center_id) {
          const phcRes = await phcCenterApi.getAll({ region_id: staff.zone_id, is_active: true })
          setPhcCenters(phcRes.data.data || [])
          if (staff.department_id) {
            const deptRes = await departmentApi.getAll({ phc_center_id: staff.phc_center_id, is_active: true })
            setDepartments(deptRes.data.data || [])
          }
        }
      }
    } catch {
      navigate('/staff')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCertificatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setCertificates([...certificates, ...Array.from(files)])
    }
  }

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = {
        ...formData,
        department_id: formData.department_id || null,
        zone_id: formData.zone_id || null,
        phc_center_id: formData.phc_center_id || null,
        nationality_id: formData.nationality_id || null,
      }
      let savedId: number
      if (isEdit && id) {
        await staffApi.update(Number(id), {
          first_name: data.first_name,
          last_name: data.last_name,
          first_name_ar: data.first_name_ar,
          last_name_ar: data.last_name_ar,
          phone: data.phone,
          email: data.email,
          national_id: data.national_id,
          birth_date: data.birth_date,
          gender: data.gender,
          zone_id: data.zone_id,
          phc_center_id: data.phc_center_id,
          nationality_id: data.nationality_id,
          department_id: data.department_id,
          shc_category_id: data.shc_category_id,
          scfhs_license: data.scfhs_license,
          scfhs_license_expiry: data.scfhs_license_expiry,
          malpractice_insurance: data.malpractice_insurance,
          malpractice_expiry: data.malpractice_expiry,
          certifications: data.certifications,
          education: data.education,
          employment_status: data.employment_status,
          hire_date: data.hire_date,
        })
        savedId = Number(id)
      } else {
        const res = await staffApi.create(data)
        savedId = res.data.data?.id
      }
      if (savedId) {
        if (photo) {
          const photoFormData = new FormData()
          photoFormData.append('photo', photo)
          await staffApi.uploadPhoto(savedId, photoFormData)
        }
        for (const file of certificates) {
          const certFormData = new FormData()
          certFormData.append('certificate', file)
          await staffApi.uploadCertificate(savedId, certFormData)
        }
        for (const edu of staffEducations) {
          if (edu.school_name && edu.degree) {
            if (edu.id) {
              await staffApi.updateEducation(savedId, edu.id, {
                school_name: edu.school_name,
                degree: edu.degree,
                field_of_study: edu.field_of_study || undefined,
                gpa: edu.gpa ? Number(edu.gpa) : undefined,
                start_date: edu.start_date || undefined,
                graduation_date: edu.graduation_date || undefined,
                notes: edu.notes || undefined
              })
            } else {
              await staffApi.addEducation(savedId, {
                school_name: edu.school_name,
                degree: edu.degree,
                field_of_study: edu.field_of_study || undefined,
                gpa: edu.gpa ? Number(edu.gpa) : undefined,
                start_date: edu.start_date || undefined,
                graduation_date: edu.graduation_date || undefined,
                notes: edu.notes || undefined
              })
            }
          }
        }
        for (const cert of staffCertificates) {
          if (cert.institute_name && cert.certificate_name) {
            if (cert.id) {
              await staffApi.updateCertificate(savedId, cert.id, {
                institute_name: cert.institute_name,
                certificate_name: cert.certificate_name,
                certificate_type: cert.certificate_type || undefined,
                issue_date: cert.issue_date || undefined,
                expiry_date: cert.expiry_date || undefined,
                notes: cert.notes || undefined
              })
            } else {
              await staffApi.addCertificate(savedId, {
                institute_name: cert.institute_name,
                certificate_name: cert.certificate_name,
                certificate_type: cert.certificate_type || undefined,
                issue_date: cert.issue_date || undefined,
                expiry_date: cert.expiry_date || undefined,
                notes: cert.notes || undefined
              })
            }
          }
        }
        for (const exp of staffExperiences) {
          if (exp.company_name && exp.position) {
            if (exp.id) {
              await staffApi.updateExperience(savedId, exp.id, {
                company_name: exp.company_name,
                position: exp.position,
                start_date: exp.start_date || undefined,
                end_date: exp.end_date || undefined,
                is_current: exp.is_current,
                responsibilities: exp.responsibilities || undefined
              })
            } else {
              await staffApi.addExperience(savedId, {
                company_name: exp.company_name,
                position: exp.position,
                start_date: exp.start_date || undefined,
                end_date: exp.end_date || undefined,
                is_current: exp.is_current,
                responsibilities: exp.responsibilities || undefined
              })
            }
          }
        }
      }
      navigate('/staff')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Failed to save staff')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateEducation = (index: number, field: string, value: string) => {
    setStaffEducations(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addNewEducation = () => {
    setStaffEducations([...staffEducations, { school_name: '', degree: '', field_of_study: '', gpa: '', start_date: '', graduation_date: '', notes: '' }])
  }

  const removeEducation = async (index: number) => {
    const edu = staffEducations[index]
    if (edu.id && isEdit && id) {
      try {
        await staffApi.deleteEducation(Number(id), edu.id)
      } catch (err) {
        console.error('Failed to delete education:', err)
      }
    }
    setStaffEducations(prev => prev.filter((_, i) => i !== index))
  }

  const updateCertificate = (index: number, field: string, value: string) => {
    setStaffCertificates(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addNewCertificate = () => {
    setStaffCertificates([...staffCertificates, { institute_name: '', certificate_name: '', certificate_type: '', issue_date: '', expiry_date: '', notes: '' }])
  }

  const removeStaffCertificate = async (index: number) => {
    const cert = staffCertificates[index]
    if (cert.id && isEdit && id) {
      try {
        await staffApi.deleteCertificate(Number(id), cert.id)
      } catch (err) {
        console.error('Failed to delete certificate:', err)
      }
    }
    setStaffCertificates(prev => prev.filter((_, i) => i !== index))
  }

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    setStaffExperiences(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addNewExperience = () => {
    setStaffExperiences([...staffExperiences, { company_name: '', position: '', start_date: '', end_date: '', is_current: false, responsibilities: '' }])
  }

  const removeExperience = async (index: number) => {
    const exp = staffExperiences[index]
    if (exp.id && isEdit && id) {
      try {
        await staffApi.deleteExperience(Number(id), exp.id)
      } catch (err) {
        console.error('Failed to delete experience:', err)
      }
    }
    setStaffExperiences(prev => prev.filter((_, i) => i !== index))
  }

  const renderEducationStep = () => (
    <div className="space-y-4">
      {staffEducations.map((edu, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">{locale === 'ar' ? `التعليم ${index + 1}` : `Education ${index + 1}`}</span>
            <button type="button" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label={locale === 'ar' ? 'اسم المدرسة' : 'School Name'} value={edu.school_name} onChange={(e) => updateEducation(index, 'school_name', e.target.value)} required />
            <Input label={locale === 'ar' ? 'الدرجة' : 'Degree'} value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} required />
            <Input label={locale === 'ar' ? 'التخصص' : 'Field of Study'} value={edu.field_of_study} onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)} />
            <Input label={locale === 'ar' ? 'التقدير (GPA)' : 'GPA'} type="number" value={edu.gpa} onChange={(e) => updateEducation(index, 'gpa', e.target.value)} />
            <Input label={locale === 'ar' ? 'تاريخ البداية' : 'Start Date'} type="date" value={edu.start_date} onChange={(e) => updateEducation(index, 'start_date', e.target.value)} />
            <Input label={locale === 'ar' ? 'تاريخ التخرج' : 'Graduation Date'} type="date" value={edu.graduation_date} onChange={(e) => updateEducation(index, 'graduation_date', e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addNewEducation} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-500 hover:text-brand-500">
        {locale === 'ar' ? '+ إضافة تعليم' : '+ Add Education'}
      </button>
    </div>
  )

  const renderCertificatesStep = () => (
    <div className="space-y-4">
      {staffCertificates.map((cert, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">{locale === 'ar' ? `شهادة ${index + 1}` : `Certificate ${index + 1}`}</span>
            <button type="button" onClick={() => removeStaffCertificate(index)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label={locale === 'ar' ? 'اسم المعهد' : 'Institute Name'} value={cert.institute_name} onChange={(e) => updateCertificate(index, 'institute_name', e.target.value)} required />
            <Input label={locale === 'ar' ? 'اسم الشهادة' : 'Certificate Name'} value={cert.certificate_name} onChange={(e) => updateCertificate(index, 'certificate_name', e.target.value)} required />
            <Input label={locale === 'ar' ? 'نوع الشهادة' : 'Certificate Type'} value={cert.certificate_type} onChange={(e) => updateCertificate(index, 'certificate_type', e.target.value)} />
            <Input label={locale === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'} type="date" value={cert.issue_date} onChange={(e) => updateCertificate(index, 'issue_date', e.target.value)} />
            <Input label={locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'} type="date" value={cert.expiry_date} onChange={(e) => updateCertificate(index, 'expiry_date', e.target.value)} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addNewCertificate} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-500 hover:text-brand-500">
        {locale === 'ar' ? '+ إضافة شهادة' : '+ Add Certificate'}
      </button>
    </div>
  )

  const renderExperienceStep = () => (
    <div className="space-y-4">
      {staffExperiences.map((exp, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">{locale === 'ar' ? `خبرة ${index + 1}` : `Experience ${index + 1}`}</span>
            <button type="button" onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label={locale === 'ar' ? 'اسم الشركة' : 'Company Name'} value={exp.company_name} onChange={(e) => updateExperience(index, 'company_name', e.target.value)} required />
            <Input label={locale === 'ar' ? 'المنصب' : 'Position'} value={exp.position} onChange={(e) => updateExperience(index, 'position', e.target.value)} required />
            <Input label={locale === 'ar' ? 'تاريخ البداية' : 'Start Date'} type="date" value={exp.start_date} onChange={(e) => updateExperience(index, 'start_date', e.target.value)} />
            <Input label={locale === 'ar' ? 'تاريخ النهاية' : 'End Date'} type="date" value={exp.end_date} onChange={(e) => updateExperience(index, 'end_date', e.target.value)} disabled={exp.is_current} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={exp.is_current} onChange={(e) => updateExperience(index, 'is_current', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm">{locale === 'ar' ? 'حالي' : 'Current'}</span>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addNewExperience} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-500 hover:text-brand-500">
        {locale === 'ar' ? '+ إضافة خبرة' : '+ Add Experience'}
      </button>
    </div>
  )

  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const fontClass = locale === 'ar' ? 'font-arabic' : 'font-sans'

  const genderOptions = [
    { value: 'male', label: locale === 'ar' ? 'ذكر' : 'Male' },
    { value: 'female', label: locale === 'ar' ? 'أنثى' : 'Female' },
  ]

  const statusOptions = [
    { value: 'active', label: locale === 'ar' ? 'نشط' : 'Active' },
    { value: 'on_leave', label: locale === 'ar' ? 'في إجازة' : 'On Leave' },
    { value: 'suspended', label: locale === 'ar' ? 'موقوف' : 'Suspended' },
    { value: 'terminated', label: locale === 'ar' ? 'منتهي' : 'Terminated' },
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={locale === 'ar' ? 'رقم الموظف' : 'Employee ID'}
              value={formData.employee_id}
              disabled
            />
            <Input
              label={locale === 'ar' ? 'الاسم الأول' : 'First Name'}
              value={formData.first_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('first_name', e.target.value)
              }
              required
            />
            <Input
              label={locale === 'ar' ? 'الاسم الأخير' : 'Last Name'}
              value={formData.last_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('last_name', e.target.value)
              }
              required
            />
            <Input
              label={locale === 'ar' ? 'الاسم الأول (عربي)' : 'First Name (Arabic)'}
              value={formData.first_name_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('first_name_ar', e.target.value)
              }
            />
            <Input
              label={locale === 'ar' ? 'الاسم الأخير (عربي)' : 'Last Name (Arabic)'}
              value={formData.last_name_ar}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('last_name_ar', e.target.value)
              }
            />
            <Input
              label={locale === 'ar' ? 'رقم الهوية' : 'National ID'}
              value={formData.national_id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('national_id', e.target.value)
              }
            />
            <SearchableSelect
              label={locale === 'ar' ? 'الجنسية' : 'Nationality'}
              value={formData.nationality_id?.toString() || ''}
              onChange={(val: string | number) =>
                updateField('nationality_id', val ? Number(val) : null)
              }
              options={nationalities.map((n) => ({
                value: n.id.toString(),
                label: n.name,
              }))}
              onSearch={async (query) => {
                if (query) {
                  const res = await nationalityApi.getAll({ is_active: true, search: query, per_page: 200 })
                  setNationalities(res.data.data || [])
                } else {
                  const res = await nationalityApi.getAll({ is_active: true, per_page: 200 })
                  setNationalities(res.data.data || [])
                }
              }}
              loading={nationalitiesLoading}
            />
            <Input
              label={locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
              type="date"
              value={formData.birth_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('birth_date', e.target.value)
              }
            />
            <Select
              label={locale === 'ar' ? 'الجنس' : 'Gender'}
              value={formData.gender}
              onChange={(val: string | number) => updateField('gender', val)}
              options={genderOptions}
            />
          </div>
        )
      case 1: // Contact
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={locale === 'ar' ? 'الهاتف' : 'Phone'}
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('phone', e.target.value)
              }
            />
            <Input
              label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('email', e.target.value)
              }
            />
          </div>
        )
      case 2: // Job
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={locale === 'ar' ? 'المنطقة' : 'Zone'}
              value={formData.zone_id?.toString() || ''}
              onChange={handleZoneChange}
              options={zones.map((z) => ({
                value: z.id.toString(),
                label: z.name,
              }))}
              disabled={zonesLoading}
            />
            <Select
              label={locale === 'ar' ? 'مركز الصحة' : 'PHC Center'}
              value={formData.phc_center_id?.toString() || ''}
              onChange={handlePhcCenterChange}
              options={phcCenters.map((p) => ({
                value: p.id.toString(),
                label: p.name,
              }))}
              disabled={phcCentersLoading || !formData.zone_id}
            />
            <SearchableSelect
              label={locale === 'ar' ? 'القسم' : 'Department'}
              value={formData.department_id?.toString() || ''}
              onChange={(val: string | number) =>
                updateField('department_id', val ? Number(val) : null)
              }
              options={departments.map((d) => ({
                value: d.id.toString(),
                label: d.name,
              }))}
              disabled={!formData.phc_center_id}
              onSearch={(query) => {
                if (formData.phc_center_id) {
                  fetchDepartments(formData.phc_center_id, query)
                }
              }}
              loading={departmentsLoading}
            />
            <SearchableSelect
              label={locale === 'ar' ? 'الحقل الطبي' : 'Medical Field'}
              value={selectedMedicalFieldId?.toString() || ''}
              onChange={async (val: string | number) => {
                const mfId = val ? Number(val) : null
                setSelectedMedicalFieldId(mfId)
                setSelectedSpecialtyId(null)
                setSelectedRankId(null)
                updateField('shc_category_id', null)
                setShcCategories([])
                if (mfId) {
                  await fetchSpecialties(mfId)
                } else {
                  setSpecialties([])
                }
              }}
              options={medicalFields.map((m) => ({
                value: m.id.toString(),
                label: m.name,
              }))}
              onSearch={fetchMedicalFields}
            />
            <SearchableSelect
              label={locale === 'ar' ? 'التخصص' : 'Specialty'}
              value={selectedSpecialtyId?.toString() || ''}
              onChange={async (val: string | number) => {
                const spId = val ? Number(val) : null
                setSelectedSpecialtyId(spId)
                setSelectedRankId(null)
                updateField('shc_category_id', null)
                setShcCategories([])
              }}
              options={specialties.map((s) => ({
                value: s.id.toString(),
                label: s.name,
              }))}
              disabled={!selectedMedicalFieldId}
              onSearch={(query) => {
                if (selectedMedicalFieldId) {
                  fetchSpecialties(selectedMedicalFieldId, query)
                }
              }}
            />
            <SearchableSelect
              label={locale === 'ar' ? 'الرتبة' : 'Rank'}
              value={selectedRankId?.toString() || ''}
              onChange={async (val: string | number) => {
                const rId = val ? Number(val) : null
                setSelectedRankId(rId)
                if (rId && selectedMedicalFieldId && selectedSpecialtyId) {
                  const res = await shcCategoryApi.getAll({
                    medical_field_id: selectedMedicalFieldId,
                    specialty_id: selectedSpecialtyId,
                    rank_id: rId,
                    is_active: true,
                    per_page: 1
                  })
                  const categories = res.data.data || []
                  if (categories.length > 0) {
                    updateField('shc_category_id', categories[0].id)
                    setShcCategories(categories)
                  } else {
                    updateField('shc_category_id', null)
                    setShcCategories([])
                  }
                } else {
                  updateField('shc_category_id', null)
                  setShcCategories([])
                }
              }}
              options={ranks.map((r) => ({
                value: r.id.toString(),
                label: r.name,
              }))}
              disabled={!selectedSpecialtyId}
              onSearch={fetchRanks}
            />
            {shcCategories.length > 0 && (
              <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  {locale === 'ar' ? 'فئة الهيئة المختارة' : 'Selected SHC Category'}: 
                  <span className="font-bold mr-2">{shcCategories[0].code}</span>
                </p>
              </div>
            )}
            <Select
              label={locale === 'ar' ? 'الحالة' : 'Status'}
              value={formData.employment_status}
              onChange={(val: string | number) => updateField('employment_status', val)}
              options={statusOptions}
            />
            <Input
              label={locale === 'ar' ? 'تاريخ التعيين' : 'Hire Date'}
              type="date"
              value={formData.hire_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('hire_date', e.target.value)
              }
            />
          </div>
        )
      case 3: // Education
        return renderEducationStep()
      case 4: // Certificates
        return renderCertificatesStep()
      case 5: // Experience
        return renderExperienceStep()
      case 6: // Licenses
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" />
                {locale === 'ar' ? 'رخصة الهيئة' : 'SCFHS License'}
              </h3>
            </div>
            <Input
              label={locale === 'ar' ? 'رقم الرخصة' : 'License Number'}
              value={formData.scfhs_license}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('scfhs_license', e.target.value)
              }
            />
            <Input
              label={locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
              type="date"
              value={formData.scfhs_license_expiry}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('scfhs_license_expiry', e.target.value)
              }
            />
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" />
                {locale === 'ar' ? 'التأمين' : 'Insurance'}
              </h3>
            </div>
            <Input
              label={locale === 'ar' ? 'رقم الوثيقة' : 'Policy Number'}
              value={formData.malpractice_insurance}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('malpractice_insurance', e.target.value)
              }
            />
            <Input
              label={locale === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
              type="date"
              value={formData.malpractice_expiry}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateField('malpractice_expiry', e.target.value)
              }
            />
          </div>
        )
      case 7: // Documents
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {locale === 'ar' ? 'صورة الموظف' : 'Staff Photo'}
              </h3>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-brand-500 transition-colors">
                    {photoPreview || existingPhotoUrl ? (
                      <img
                        src={photoPreview || existingPhotoUrl || ''}
                        alt="Staff"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">
                          {locale === 'ar' ? 'رفع صورة' : 'Upload'}
                        </span>
                      </>
                    )}
                  </div>
                </label>
                {(photoPreview || existingPhotoUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null)
                      setPhotoPreview(null)
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {locale === 'ar' ? 'الشهادات والمستندات' : 'Certificates & Documents'}
              </h3>
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleCertificatesChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-brand-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-1">
                    {locale === 'ar'
                      ? 'رفع ملفات (PDF, JPG, PNG)'
                      : 'Upload files (PDF, JPG, PNG)'}
                  </span>
                </div>
              </label>

              {certificates.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {certificates.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {existingCertificates.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {existingCertificates.map((cert, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-600 hover:underline truncate"
                      >
                        {cert.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <Layout>
      <div className={fontClass} dir={direction}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit
                ? locale === 'ar'
                  ? 'تعديل موظف'
                  : 'Edit Staff'
                : locale === 'ar'
                  ? 'إضافة موظف'
                  : 'Add Staff'}
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex" aria-label="Tabs">
                {steps.map((step, idx) => (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors
                      ${currentStep === idx
                        ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    {step.icon}
                    {locale === 'ar' ? step.titleAr : step.title}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {renderStepContent()}

              <div className="flex justify-between mt-8 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(currentStep - 1)
                    } else {
                      navigate('/staff')
                    }
                  }}
                >
                  <Upload className="w-4 h-4 rotate-180 me-2" />
                  {locale === 'ar' ? 'السابق' : 'Previous'}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    {locale === 'ar' ? 'التالي' : 'Next'}
                    <Upload className="w-4 h-4 ms-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    isLoading={isLoading}
                  >
                    {locale === 'ar' ? 'حفظ' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}