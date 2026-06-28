import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import type { Staff } from '../../../types/staff';
import { STAFF_EMPLOYMENT_TYPE_OPTIONS } from '../../../types/staff';
import type { TeamCode } from '../../../types/teamCode';
import { COUNTRIES } from '../../../data/countries';
import { useFieldStore, useSpecialtyStore, useRankStore, useEducationalDegreeStore, useClassificationStore, useCenterStore, useZoneStore, useTeamCodeStore, useProfessionalStore, useClinicAssignmentStore, useDepartmentStore } from '../../../stores';

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: any, files: { photo: File | null; documents: File[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TABS = [
  {
    key: 'personal',
    label: 'Personal Information',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'professional',
    label: 'Professional',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'education',
    label: 'Education',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l-9 5 9 5 9-5-9-5zm-5-3l-4 2 9 5 9-5-4-2" />
      </svg>
    ),
  },
  {
    key: 'experience',
    label: 'Experience',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'certificate',
    label: 'Certificate',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    key: 'classification',
    label: 'SHC Classification',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const mapDegreesFromStaff = (staff?: Staff): any[] => {
  if (!staff?.educational_degrees) return [];
  return staff.educational_degrees.map((deg) => ({
    id: deg.id,
    educational_degree_id: deg.id,
    name: deg.name,
    degree_field: (deg.pivot as any).degree_field || '',
    gpa_type: (deg.pivot as any).gpa_type || 'point',
    gpa_value: (deg.pivot as any).gpa_value || '',
    institution: deg.pivot.institution || '',
    year_obtained: deg.pivot.year_obtained ?? null,
  }));
};

const mapExperiencesFromStaff = (staff?: Staff): any[] => {
  if (!staff?.experiences) return [];
  return staff.experiences.map((exp) => ({
    company: exp.company || '',
    position: exp.position || '',
    from_date: exp.from_date || '',
    to_date: exp.to_date || null,
    description: exp.description || '',
    is_current: exp.is_current ?? false,
  }));
};

const mapCertificatesFromStaff = (staff?: Staff): any[] => {
  if (!staff?.certifications) return [];
  return staff.certifications.map((cert) => ({
    name: cert.name || '',
    issuing_organization: cert.issuing_organization || '',
    issue_date: cert.issue_date || '',
    expiry_date: cert.expiry_date || null,
    credential_id: cert.credential_id || '',
  }));
};

export const StaffForm: React.FC<StaffFormProps> = ({
  staff,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    staff_id: staff?.employee_id || staff?.staff_id || '',
    first_name: staff?.first_name || '',
    middle_name: staff?.middle_name || null,
    last_name: staff?.last_name || '',
    email: staff?.email || null,
    phone: staff?.phone || null,
    mobile: staff?.mobile || null,
    gender: staff?.gender || null,
    date_of_birth: formatDate(staff?.date_of_birth) || null,
    nationality: staff?.nationality || null,
    national_id: staff?.national_id || null,
    address: staff?.address || null,
    notes: staff?.notes || null,
    department_id: staff?.department_id ?? null,
    professional_id: staff?.professional_id ?? null,
    clinic_assignment_id: staff?.clinic_assignment_id ?? null,
    employment_type: staff?.employment_type || 'full_time',
    hire_date: formatDate(staff?.hire_date) || null,
    termination_date: formatDate(staff?.termination_date) || null,
    scfhs_registration_no: staff?.scfhs_registration_no || null,
    scfhs_issue_date: formatDate(staff?.scfhs_issue_date) || null,
    scfhs_expiry_date: formatDate(staff?.scfhs_expiry_date) || null,
    malpractice_insurance_no: staff?.malpractice_insurance_no || null,
    malpractice_issue_date: formatDate(staff?.malpractice_issue_date) || null,
    malpractice_expiry_date: formatDate(staff?.malpractice_expiry_date) || null,
    status: staff?.status || 'active',
    phc_center_id: staff?.phc_center_id ?? null,
    is_active: staff?.is_active ?? true,
    is_care_provider: staff?.is_care_provider ?? false,
    });

  const [selectedDegrees, setSelectedDegrees] = useState<any[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [classification, setClassification] = useState<{field_id: number|null; specialty_id: number|null; rank_id: number|null; category_id: number|null}>({
    field_id: null,
    specialty_id: null,
    rank_id: null,
    category_id: null,
  });
  const [resolvedCategory, setResolvedCategory] = useState<{id: number; name: string; code: string} | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [isInTeam, setIsInTeam] = useState(false);
  const [selectedTeamCodeId, setSelectedTeamCodeId] = useState<number | null>(null);
  const [teamCodes, setTeamCodes] = useState<TeamCode[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    setFormData({
      staff_id: staff?.employee_id || staff?.staff_id || '',
      first_name: staff?.first_name || '',
      middle_name: staff?.middle_name || null,
      last_name: staff?.last_name || '',
      email: staff?.email || null,
      phone: staff?.phone || null,
      mobile: staff?.mobile || null,
      gender: staff?.gender || null,
      date_of_birth: formatDate(staff?.date_of_birth) || null,
      nationality: staff?.nationality || null,
      national_id: staff?.national_id || null,
      address: staff?.address || null,
      notes: staff?.notes || null,
      department_id: staff?.department_id ?? null,
      professional_id: staff?.professional_id ?? null,
      clinic_assignment_id: staff?.clinic_assignment_id ?? null,
      employment_type: staff?.employment_type || 'full_time',
      hire_date: formatDate(staff?.hire_date) || null,
      termination_date: formatDate(staff?.termination_date) || null,
      scfhs_registration_no: staff?.scfhs_registration_no || null,
      scfhs_issue_date: formatDate(staff?.scfhs_issue_date) || null,
      scfhs_expiry_date: formatDate(staff?.scfhs_expiry_date) || null,
      malpractice_insurance_no: staff?.malpractice_insurance_no || null,
      malpractice_issue_date: formatDate(staff?.malpractice_issue_date) || null,
      malpractice_expiry_date: formatDate(staff?.malpractice_expiry_date) || null,
      status: staff?.status || 'active',
      phc_center_id: staff?.phc_center_id ?? null,
      is_active: staff?.is_active ?? true,
      is_care_provider: staff?.is_care_provider ?? false,
    });
    setSelectedDegrees(mapDegreesFromStaff(staff));
    setExperiences(mapExperiencesFromStaff(staff));
    setCertificates(mapCertificatesFromStaff(staff));
    setClassification({
      field_id: staff?.field_id ?? null,
      specialty_id: staff?.specialty_id ?? null,
      rank_id: staff?.rank_id ?? null,
      category_id: staff?.classification_category_id ?? null,
    });
    if (staff?.classification_category_id && staff?.field_id && staff?.specialty_id && staff?.rank_id) {
      fetchCategory({
        field_id: staff.field_id,
        specialty_id: staff.specialty_id,
        rank_id: staff.rank_id,
      }).then((category) => {
        if (category) {
          setResolvedCategory({ id: category.id, name: category.name, code: category.code });
        }
      });
    } else {
      setResolvedCategory(null);
    }
    setPhoto(null);
    setPhotoPreview(staff?.photo_url || null);
    setDocuments([]);
    setErrors({});
  }, [staff]);

  useEffect(() => {
    if (staff?.center?.zone_id) {
      setSelectedZoneId(staff.center.zone_id);
    } else {
      setSelectedZoneId(null);
    }
  }, [staff]);

  const fields = useFieldStore((s) => s.fields);
  const fetchFields = useFieldStore((s) => s.fetchFields);
  const specialties = useSpecialtyStore((s) => s.specialties);
  const fetchSpecialtiesByField = useSpecialtyStore((s) => s.fetchSpecialtiesByField);
  const ranks = useRankStore((s) => s.ranks);
  const fetchRanks = useRankStore((s) => s.fetchRanks);
  const educationalDegrees = useEducationalDegreeStore((s) => s.educationalDegrees);
  const fetchEducationalDegrees = useEducationalDegreeStore((s) => s.fetchEducationalDegrees);
  const fetchCategory = useClassificationStore((s) => s.fetchCategory);
  const centers = useCenterStore((s) => s.centers);
  const fetchCenters = useCenterStore((s) => s.fetchCenters);
  const centerError = useCenterStore((s) => s.error);
  const zones = useZoneStore((s) => s.zones);
  const fetchZones = useZoneStore((s) => s.fetchZones);
  const zoneError = useZoneStore((s) => s.error);
  const fetchTeamCodes = useTeamCodeStore((s) => s.fetchTeamCodes);
  const professionals = useProfessionalStore((s) => s.professionals);
  const fetchProfessionals = useProfessionalStore((s) => s.fetchProfessionals);
  const clinicAssignments = useClinicAssignmentStore((s) => s.assignments);
  const fetchClinicAssignments = useClinicAssignmentStore((s) => s.fetchAssignments);
  const departmentsList = useDepartmentStore((s) => s.departments);
  const fetchDepartmentsList = useDepartmentStore((s) => s.fetchDepartments);

  useEffect(() => {
    fetchFields();
    fetchRanks();
    fetchEducationalDegrees();
    fetchZones({ per_page: 1000 });
    fetchProfessionals({ per_page: 1000 });
    fetchClinicAssignments({ per_page: 1000 });
  }, [fetchFields, fetchRanks, fetchEducationalDegrees, fetchZones, fetchProfessionals, fetchClinicAssignments]);

  useEffect(() => {
    if (staff?.team_code_id) {
      setIsInTeam(true);
      setSelectedTeamCodeId(staff.team_code_id);
      if (staff.phc_center_id) {
        fetchTeamCodes({ filters: { center_id: staff.phc_center_id } }).then(() => {
          setTeamCodes(useTeamCodeStore.getState().teamCodes);
        });
      }
    } else {
      setIsInTeam(false);
      setSelectedTeamCodeId(null);
      setTeamCodes([]);
    }
  }, [staff, fetchTeamCodes]);

  useEffect(() => {
    if (formData.phc_center_id && isInTeam) {
      fetchTeamCodes({ filters: { center_id: formData.phc_center_id } }).then(() => {
        setTeamCodes(useTeamCodeStore.getState().teamCodes);
      });
    } else {
      setTeamCodes([]);
    }
  }, [formData.phc_center_id, isInTeam, fetchTeamCodes]);

  useEffect(() => {
    if (formData.phc_center_id) {
      fetchDepartmentsList({ per_page: 1000, filters: { center_id: formData.phc_center_id } });
    } else {
      useDepartmentStore.setState({ departments: [] });
    }
  }, [formData.phc_center_id, fetchDepartmentsList]);

  // Fetch centers when zone changes (server-side filtered), mirroring the department pattern
  useEffect(() => {
    if (selectedZoneId) {
      fetchCenters({ per_page: 1000, filters: { zone_id: selectedZoneId } });
    } else {
      useCenterStore.setState({ centers: [] });
    }
  }, [selectedZoneId, fetchCenters]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (classification.field_id && classification.specialty_id && classification.rank_id) {
        setIsResolving(true);
        fetchCategory({
          field_id: classification.field_id,
          specialty_id: classification.specialty_id,
          rank_id: classification.rank_id,
        }).then((category) => {
          if (cancelled) return;
          if (category) {
            setClassification((prev) => ({ ...prev, category_id: category.id }));
            setResolvedCategory({ id: category.id, name: category.name, code: category.code });
          } else {
            setClassification((prev) => ({ ...prev, category_id: null }));
            setResolvedCategory(null);
          }
        }).finally(() => {
          if (!cancelled) setIsResolving(false);
        });
      } else {
        setClassification((prev) => ({ ...prev, category_id: null }));
        setResolvedCategory(null);
      }
    });
    return () => { cancelled = true; };
  }, [classification.field_id, classification.specialty_id, classification.rank_id, fetchCategory]);

  const handleFetchSpecialties = useCallback((fieldId: number) => {
    fetchSpecialtiesByField(fieldId);
  }, [fetchSpecialtiesByField]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.staff_id.trim()) {
      newErrors.staff_id = 'Employee ID is required';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      setActiveTab('personal');
      return;
    }
    const { staff_id, ...formDataRest } = formData;
    const payload: Record<string, unknown> = {
      ...formDataRest,
      employee_id: staff_id,
      is_care_provider: formData.is_care_provider,
      ...(classification.field_id ? { field_id: classification.field_id } : {}),
      ...(classification.specialty_id ? { specialty_id: classification.specialty_id } : {}),
      ...(classification.rank_id ? { rank_id: classification.rank_id } : {}),
      ...(classification.category_id ? { classification_category_id: classification.category_id } : {}),
      ...(selectedTeamCodeId ? { team_code_id: selectedTeamCodeId } : {}),
      selectedDegrees: selectedDegrees.map((d) => ({
        educational_degree_id: d.educational_degree_id,
        degree_field: d.degree_field,
        gpa_type: d.gpa_type,
        gpa_value: d.gpa_value,
        institution: d.institution,
        year_obtained: d.year_obtained,
      })),
      experiences,
      certificates,
    };
    onSubmit(payload, { photo, documents });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let processedValue: string | null = value;
    if (value === '') {
      const nullableFields = ['middle_name', 'email', 'phone', 'mobile', 'gender', 'date_of_birth', 'nationality', 'national_id', 'address', 'notes', 'hire_date', 'termination_date', 'scfhs_registration_no', 'scfhs_issue_date', 'scfhs_expiry_date', 'malpractice_insurance_no', 'malpractice_issue_date', 'malpractice_expiry_date', 'is_care_provider'];
      if (nullableFields.includes(name)) {
        processedValue = null;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddDegree = () => {
    setSelectedDegrees((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        educational_degree_id: null,
        name: '',
        degree_field: '',
        gpa_type: 'point',
        gpa_value: '',
        institution: '',
        year_obtained: null,
      },
    ]);
  };

  const handleRemoveDegree = (index: number) => {
    setSelectedDegrees((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDegreeChange = (index: number, field: 'name' | 'educational_degree_id' | 'degree_field' | 'gpa_type' | 'gpa_value' | 'institution' | 'year_obtained', value: string | number | boolean | null) => {
    setSelectedDegrees((prev) =>
      prev.map((d, i) =>
        i === index
          ? {
              ...d,
              [field]: field === 'year_obtained'
                ? (value ? parseInt(String(value), 10) : null)
              : field === 'educational_degree_id'
                ? (typeof value === 'number' ? value : typeof value === 'string' ? parseInt(value, 10) : null)
                  : field === 'gpa_type'
                    ? value
                    : (value as string) || '',
            }
          : d
      )
    );
  };

  const handleAddExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { company: '', position: '', from_date: '', to_date: null, description: '', is_current: false },
    ]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: string, value: string | boolean | null) => {
    setExperiences((prev) =>
      prev.map((exp, i) =>
        i === index
          ? { ...exp, [field]: value, ...(field === 'is_current' && value === true ? { to_date: null } : {}) }
          : exp
      )
    );
  };

  const handleAddCertificate = () => {
    setCertificates((prev) => [
      ...prev,
      { name: '', issuing_organization: '', issue_date: '', expiry_date: null, credential_id: '' },
    ]);
  };

  const handleRemoveCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCertificateChange = (index: number, field: string, value: string | null) => {
    setCertificates((prev) =>
      prev.map((cert, i) => (i === index ? { ...cert, [field]: value } : cert))
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="scroll-mt-20">
      {/* Tab Bar - Modern Glass Effect */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-1.5 overflow-x-auto -mx-0.5">
        <div className="flex gap-1 min-w-max md:min-w-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`
                group relative flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap
                ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-violet-200'
                  : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50/50'
                }
              `}
            >
              <span className={activeTab === tab.key ? 'text-white' : 'text-slate-400 group-hover:text-violet-500 transition-colors duration-300'}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.key && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white sm:hidden" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-22rem)] space-y-6 mt-6 transition-all duration-300">
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center ring-1 ring-violet-200/50">
                  <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
                  <p className="text-sm text-slate-500">Core identification and contact details</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Identification */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-purple-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Identification</h4>
                </div>
                <div>
                  <Label htmlFor="staff-id" required>Employee ID</Label>
                  <Input
                    id="staff-id"
                    name="staff_id"
                    value={formData.staff_id}
                    onChange={handleChange}
                    placeholder="e.g., EMP-001"
                    error={errors.staff_id}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Full Name */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-400 to-blue-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Full Name</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="first-name" required>First Name</Label>
                    <Input
                      id="first-name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      error={errors.first_name}
                    />
                  </div>
                  <div>
                    <Label htmlFor="middle-name">Middle Name</Label>
                    <Input
                      id="middle-name"
                      name="middle_name"
                      value={formData.middle_name || ''}
                      onChange={handleChange}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last-name" required>Last Name</Label>
                    <Input
                      id="last-name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      error={errors.last_name}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Identity Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-rose-400 to-pink-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Identity Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="national-id">National ID</Label>
                    <Input
                      id="national-id"
                      name="national_id"
                      value={formData.national_id || ''}
                      onChange={handleChange}
                      placeholder="e.g., 1234567890"
                    />
                  </div>
                  <div>
                    <SearchableCombobox
                      id="nationality"
                      label="Nationality"
                      placeholder="Search nationality..."
                      value={formData.nationality}
                      options={COUNTRIES}
                      onChange={(val) => {
                        setFormData((prev) => ({ ...prev, nationality: val as string | null }));
                      }}
                      clearable
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-of-birth">Date of Birth</Label>
                    <Input
                      id="date-of-birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Contact Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={formData.mobile || ''}
                      onChange={handleChange}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                  <div>
                    <SearchableCombobox
                      id="gender"
                      label="Gender"
                      placeholder="Select gender"
                      value={formData.gender}
                      options={GENDER_OPTIONS}
                      onChange={(val) => {
                        setFormData((prev) => ({ ...prev, gender: val as string | null }));
                      }}
                      clearable
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Additional */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Additional</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      placeholder="Full address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes || ''}
                      onChange={handleChange}
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="space-y-4">
            {/* PHC Center */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">PHC Center</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <SearchableCombobox
                    id="zone"
                    placeholder="Select a zone"
                    value={selectedZoneId}
                    options={zones.map((z) => ({ value: z.id, label: z.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setSelectedZoneId(numVal);
                      setFormData((prev) => ({ ...prev, phc_center_id: null }));
                    }}
                    clearable
                    error={zoneError ? 'Failed to load zones' : undefined}
                  />
                </div>
                <div>
                  <Label htmlFor="phc-center">PHC Center</Label>
                  <SearchableCombobox
                    id="phc-center"
                    placeholder="Select a PHC center"
                    value={formData.phc_center_id}
                    options={centers.map((c) => ({ value: c.id, label: c.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setFormData((prev) => ({ ...prev, phc_center_id: numVal, department_id: null }));
                    }}
                    clearable
                    error={centerError ? 'Failed to load centers' : undefined}
                  />
                </div>
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Job Information</h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_care_provider}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, is_care_provider: e.target.checked }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">Is Care Provider</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SearchableCombobox
                    id="professional-id"
                    label="Role Name"
                    placeholder="Select a professional role"
                    value={formData.professional_id}
                    options={professionals.map((p) => ({ value: p.id, label: p.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setFormData((prev) => ({ ...prev, professional_id: numVal }));
                    }}
                    clearable
                  />
                </div>
                <div>
                  <SearchableCombobox
                    id="department-id"
                    label="Department"
                    placeholder="Select a department"
                    value={formData.department_id}
                    options={departmentsList.map((d) => ({ value: d.id, label: d.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setFormData((prev) => ({ ...prev, department_id: numVal }));
                    }}
                    clearable
                  />
                </div>
              </div>
              <div>
                <SearchableCombobox
                  id="clinic-assignment-id"
                  label="Clinic Assignment"
                  placeholder="Select clinic assignment"
                  value={formData.clinic_assignment_id}
                  options={clinicAssignments.map((a) => ({ value: a.id, label: a.name }))}
                  onChange={(val) => {
                    const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                    setFormData((prev) => ({ ...prev, clinic_assignment_id: numVal }));
                  }}
                  clearable
                />
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Employment Details</h3>
              </div>
              <SearchableCombobox
                id="employment-type"
                label="Employment Type"
                placeholder="Select employment type"
                value={formData.employment_type}
                options={STAFF_EMPLOYMENT_TYPE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                }))}
                onChange={(val) => {
                  setFormData((prev) => ({
                    ...prev,
                    employment_type: (val as 'full_time' | 'part_time' | 'contract' | 'temporary') || 'full_time',
                  }));
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hire-date">Hire Date</Label>
                  <Input
                    id="hire-date"
                    name="hire_date"
                    type="date"
                    value={formData.hire_date || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="termination-date">Termination Date</Label>
                  <Input
                    id="termination-date"
                    name="termination_date"
                    type="date"
                    value={formData.termination_date || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {formData.is_care_provider && (
              <>
            {/* Team Based Code */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Team Based Code</h3>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInTeam}
                    onChange={(e) => {
                      setIsInTeam(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedTeamCodeId(null);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500"></div>
                </label>
                <span className="text-sm font-medium text-slate-700">In a Team</span>
              </div>
              {isInTeam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableCombobox
                    id="team-code"
                    label="Team Code"
                    placeholder="Select a team code"
                    value={selectedTeamCodeId}
                    options={teamCodes.map((tc) => ({ value: tc.id, label: tc.code }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setSelectedTeamCodeId(numVal);
                    }}
                    clearable
                  />
                  {selectedTeamCodeId && (() => {
                    const selected = teamCodes.find((tc) => tc.id === selectedTeamCodeId);
                    return selected?.role ? (
                      <div className="flex items-end pb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 border border-violet-200 capitalize">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {selected.role.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* SCFHS Registration */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">SCFHS Registration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scfhs-reg-no">SCFHS Registration No.</Label>
                  <Input
                    id="scfhs-reg-no"
                    name="scfhs_registration_no"
                    value={formData.scfhs_registration_no || ''}
                    onChange={handleChange}
                    placeholder="e.g., SCFHS-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="scfhs-issue-date">Issue Date</Label>
                  <Input
                    id="scfhs-issue-date"
                    name="scfhs_issue_date"
                    type="date"
                    value={formData.scfhs_issue_date || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="scfhs-expiry-date">Expiry Date</Label>
                  <Input
                    id="scfhs-expiry-date"
                    name="scfhs_expiry_date"
                    type="date"
                    value={formData.scfhs_expiry_date || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Malpractice Insurance */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Malpractice Insurance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="malpractice-no">Policy No.</Label>
                  <Input
                    id="malpractice-no"
                    name="malpractice_insurance_no"
                    value={formData.malpractice_insurance_no || ''}
                    onChange={handleChange}
                    placeholder="e.g., MPI-2024-001"
                  />
                </div>
                <div>
                  <Label htmlFor="malpractice-issue-date">Issue Date</Label>
                  <Input
                    id="malpractice-issue-date"
                    name="malpractice_issue_date"
                    type="date"
                    value={formData.malpractice_issue_date || ''}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="malpractice-expiry-date">Expiry Date</Label>
                  <Input
                    id="malpractice-expiry-date"
                    name="malpractice_expiry_date"
                    type="date"
                    value={formData.malpractice_expiry_date || ''}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            {selectedDegrees.length === 0 && (
              <div className="text-sm text-slate-500 italic py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No degrees added yet. Click below to add your first degree.
              </div>
            )}
            {selectedDegrees.map((deg, index) => (
              <div key={deg.id} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm border-l-4 border-l-violet-400 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">#{index + 1}</span>
                    <span className="text-sm font-semibold text-slate-700">Degree Entry</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDegree(index)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div>
                  <SearchableCombobox
                    id={`deg-combobox-${index}`}
                    label="Degree"
                    placeholder="Search saved degrees..."
                    value={deg.educational_degree_id}
                    options={educationalDegrees.map((d) => ({ value: d.id, label: d.name }))}
                    onChange={(val) => {
                      const selected = educationalDegrees.find((d) => d.id === val);
                      handleDegreeChange(index, 'educational_degree_id', val);
                      handleDegreeChange(index, 'name', selected ? selected.name : '');
                    }}
                    clearable
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`deg-field-${index}`}>Degree Field / Specialization</Label>
                    <Input
                      id={`deg-field-${index}`}
                      value={deg.degree_field}
                      onChange={(e) => handleDegreeChange(index, 'degree_field', e.target.value)}
                      placeholder="e.g., Pediatrics, Critical Care"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`deg-institution-${index}`}>Institution</Label>
                    <Input
                      id={`deg-institution-${index}`}
                      value={deg.institution}
                      onChange={(e) => handleDegreeChange(index, 'institution', e.target.value)}
                      placeholder="Institution name"
                    />
                  </div>
                </div>
                <div>
                  <Label>GPA</Label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => handleDegreeChange(index, 'gpa_type', 'point')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        deg.gpa_type === 'point'
                          ? 'bg-violet-100 text-violet-700 border border-violet-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      4.0 Scale
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDegreeChange(index, 'gpa_type', 'percentage')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        deg.gpa_type === 'percentage'
                          ? 'bg-violet-100 text-violet-700 border border-violet-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      Percentage
                    </button>
                  </div>
                  <Input
                    id={`deg-gpa-${index}`}
                    value={deg.gpa_value}
                    onChange={(e) => handleDegreeChange(index, 'gpa_value', e.target.value)}
                    placeholder={deg.gpa_type === 'point' ? 'e.g., 3.75' : 'e.g., 85'}
                    type="number"
                    step={deg.gpa_type === 'point' ? '0.01' : '1'}
                    min={deg.gpa_type === 'point' ? '0' : '0'}
                    max={deg.gpa_type === 'point' ? '4' : '100'}
                  />
                </div>
                <div>
                  <Label htmlFor={`deg-year-${index}`}>Year Obtained</Label>
                  <Input
                    id={`deg-year-${index}`}
                    type="number"
                    min="1900"
                    max="2099"
                    value={deg.year_obtained ?? ''}
                    onChange={(e) => handleDegreeChange(index, 'year_obtained', e.target.value)}
                    placeholder="e.g., 2020"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddDegree}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              className="w-full border-dashed border-2 border-slate-300 hover:border-violet-400 hover:bg-violet-50/50 py-3"
            >
              Add Degree
            </Button>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-4">
            {experiences.length === 0 && (
              <div className="text-sm text-slate-500 italic py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No experience entries yet. Click below to add your first experience.
              </div>
            )}
            {experiences.map((exp, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm border-l-4 border-l-violet-400 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">#{index + 1}</span>
                    <span className="text-sm font-semibold text-slate-700">Experience Entry</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`exp-company-${index}`}>Company</Label>
                    <Input
                      id={`exp-company-${index}`}
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-position-${index}`}>Position</Label>
                    <Input
                      id={`exp-position-${index}`}
                      value={exp.position}
                      onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`exp-from-${index}`}>From Date</Label>
                    <Input
                      id={`exp-from-${index}`}
                      type="date"
                      value={exp.from_date}
                      onChange={(e) => handleExperienceChange(index, 'from_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-to-${index}`}>To Date</Label>
                    <Input
                      id={`exp-to-${index}`}
                      type="date"
                      value={exp.to_date || ''}
                      onChange={(e) => handleExperienceChange(index, 'to_date', e.target.value || null)}
                      disabled={exp.is_current}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id={`exp-current-${index}`}
                      type="checkbox"
                      checked={exp.is_current}
                      onChange={(e) => handleExperienceChange(index, 'is_current', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-purple-500"></div>
                  </label>
                  <label htmlFor={`exp-current-${index}`} className="text-sm text-slate-600 select-none cursor-pointer">I currently work here</label>
                </div>
                <div>
                  <Label htmlFor={`exp-desc-${index}`}>Description</Label>
                  <Textarea
                    id={`exp-desc-${index}`}
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    placeholder="Describe your role and responsibilities"
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddExperience}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              className="w-full border-dashed border-2 border-slate-300 hover:border-violet-400 hover:bg-violet-50/50 py-3"
            >
              Add Experience
            </Button>
          </div>
        )}

        {activeTab === 'certificate' && (
          <div className="space-y-4">
            {certificates.length === 0 && (
              <div className="text-sm text-slate-500 italic py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No certificates added yet. Click below to add your first certificate.
              </div>
            )}
            {certificates.map((cert, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-white shadow-sm border-l-4 border-l-violet-400 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center">#{index + 1}</span>
                    <span className="text-sm font-semibold text-slate-700">Certificate Entry</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(index)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`cert-name-${index}`}>Certificate Name</Label>
                    <Input
                      id={`cert-name-${index}`}
                      value={cert.name}
                      onChange={(e) => handleCertificateChange(index, 'name', e.target.value)}
                      placeholder="Certificate name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`cert-org-${index}`}>Issuing Organization</Label>
                    <Input
                      id={`cert-org-${index}`}
                      value={cert.issuing_organization}
                      onChange={(e) => handleCertificateChange(index, 'issuing_organization', e.target.value)}
                      placeholder="Organization name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`cert-issue-${index}`}>Issue Date</Label>
                    <Input
                      id={`cert-issue-${index}`}
                      type="date"
                      value={cert.issue_date}
                      onChange={(e) => handleCertificateChange(index, 'issue_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`cert-expiry-${index}`}>Expiry Date</Label>
                    <Input
                      id={`cert-expiry-${index}`}
                      type="date"
                      value={cert.expiry_date || ''}
                      onChange={(e) => handleCertificateChange(index, 'expiry_date', e.target.value || null)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`cert-cred-${index}`}>Credential ID</Label>
                  <Input
                    id={`cert-cred-${index}`}
                    value={cert.credential_id}
                    onChange={(e) => handleCertificateChange(index, 'credential_id', e.target.value)}
                    placeholder="Optional credential ID"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCertificate}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              className="w-full border-dashed border-2 border-slate-300 hover:border-violet-400 hover:bg-violet-50/50 py-3"
            >
              Add Certificate
            </Button>
          </div>
        )}

        {activeTab === 'classification' && (
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800">SHC Classification Path</h3>
            </div>

            {/* Visual Path Indicator */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pb-2 overflow-x-auto">
              <span className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 ${classification.field_id ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400'}`}>Field</span>
              <svg className="w-4 h-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 ${classification.specialty_id ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400'}`}>Specialty</span>
              <svg className="w-4 h-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 ${classification.rank_id ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400'}`}>Rank</span>
              <svg className="w-4 h-4 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-300 inline-flex items-center gap-1.5 ${classification.category_id ? 'bg-violet-100 text-violet-700' : 'bg-slate-50 text-slate-400'}`}>
                {isResolving ? (
                  <span className="w-3 h-3 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                ) : null}
                Category
              </span>
            </div>

            {/* Field & Specialty */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Field & Specialty</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SearchableCombobox
                    id="class-field"
                    label="Field"
                    placeholder="Select a field"
                    value={classification.field_id}
                    options={fields.map((f) => ({ value: f.id, label: f.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setResolvedCategory(null);
                      setClassification((prev) => ({ ...prev, field_id: numVal, specialty_id: null }));
                      if (numVal) handleFetchSpecialties(numVal);
                    }}
                    clearable
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Choose the professional field</p>
                </div>
                <div>
                  <SearchableCombobox
                    id="class-specialty"
                    label="Specialty"
                    placeholder="Select a specialty"
                    value={classification.specialty_id}
                    options={specialties.map((s) => ({ value: s.id, label: s.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setResolvedCategory(null);
                      setClassification((prev) => ({ ...prev, specialty_id: numVal }));
                    }}
                    clearable
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Select a specialty within the field</p>
                </div>
              </div>
            </div>

            {/* Rank & Category */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rank & Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SearchableCombobox
                    id="class-rank"
                    label="Rank"
                    placeholder="Select a rank"
                    value={classification.rank_id}
                    options={ranks.map((r) => ({ value: r.id, label: r.name }))}
                    onChange={(val) => {
                      const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
                      setResolvedCategory(null);
                      setClassification((prev) => ({ ...prev, rank_id: numVal }));
                    }}
                    clearable
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Select the professional rank</p>
                </div>
                <div>
                  <Label htmlFor="class-category">Category</Label>
                  {isResolving ? (
                    <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-500">Resolving category...</span>
                    </div>
                  ) : resolvedCategory ? (
                    <div className="flex items-center gap-2 px-4 py-3 border border-emerald-200 rounded-xl bg-emerald-50">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">{resolvedCategory.code}</span>
                          <span className="text-sm font-medium text-emerald-700">{resolvedCategory.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl bg-slate-50">
                      <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-slate-500">
                        {classification.field_id && classification.specialty_id && classification.rank_id
                          ? 'No mapping found for the selected path'
                          : 'Select field, specialty, and rank to auto-resolve'}
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1.5">Automatically determined from the classification path</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Staff Photo</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {photoPreview ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-violet-100 shadow-md flex-shrink-0">
                    <img src={photoPreview} alt="Preview" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ) : staff?.photo_url ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-violet-100 shadow-md flex-shrink-0">
                    <img src={staff.photo_url} alt="Staff photo" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0 bg-slate-50">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 w-full">
                  <label
                    htmlFor="staff-photo"
                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-300"
                  >
                    <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium text-slate-600">Click to upload staff photo</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                    <input
                      id="staff-photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {photo && (
                    <p className="text-sm text-slate-500 mt-2 text-center">{photo.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Supporting Documents</h3>
              </div>
              <label
                htmlFor="staff-documents"
                className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-300"
              >
                <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-slate-600">Upload documents</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, XLSX — Multiple files allowed</p>
                <input
                  id="staff-documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                  onChange={handleDocumentsChange}
                  className="hidden"
                />
              </label>
              {staff?.documents && staff.documents.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {staff.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-700 hover:text-emerald-800 underline truncate block">
                            {doc.name}
                          </a>
                          <p className="text-xs text-emerald-500">{doc.file_size ? formatFileSize(doc.file_size) : ''}{doc.file_type ? ` \u00B7 ${doc.file_type}` : ''}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {documents.length > 0 && (
                <ul className="space-y-2">
                  {documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 transition-all duration-200 hover:bg-slate-100/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all shrink-0 ml-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-5 mt-6 border-t border-transparent"
        style={{
          borderImage: 'linear-gradient(to right, transparent, rgb(226 232 240), transparent) 1',
        }}
      >
        <div className="flex gap-2">
          {activeTab !== TABS[0].key && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.key === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].key);
              }}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {activeTab === TABS[TABS.length - 1].key ? (
            <Button
              type="button"
              variant="secondary"
              isLoading={isLoading}
              onClick={handleSubmit}
              className="shadow-lg shadow-violet-500/25"
            >
              {staff ? 'Update Staff' : 'Create Staff'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.key === activeTab);
                if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].key);
              }}
              className="shadow-lg shadow-violet-500/25"
              rightIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffForm;
