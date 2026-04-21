import { create } from 'zustand'

interface StaffFilters {
  search: string
  status: string | null
  department_id: number | null
  license_expiry: string | null
  setSearch: (search: string) => void
  setStatus: (status: string | null) => void
  setDepartment: (department: number | null) => void
  setLicenseExpiry: (expiry: string | null) => void
  reset: () => void
}

export const useStaffFilters = create<StaffFilters>((set) => ({
  search: '',
  status: null,
  department_id: null,
  license_expiry: null,
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setDepartment: (department_id) => set({ department_id }),
  setLicenseExpiry: (license_expiry) => set({ license_expiry }),
  reset: () =>
    set({
      search: '',
      status: null,
      department_id: null,
      license_expiry: null,
    }),
}))