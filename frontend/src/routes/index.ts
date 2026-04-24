import type { ComponentType } from 'react'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { StaffListPage } from '@/pages/staff/StaffListPage'
import { StaffDetailPage } from '@/pages/staff/StaffDetailPage'
import { StaffForm } from '@/pages/staff/StaffForm'
import { DepartmentListPage } from '@/pages/department/DepartmentListPage'
import { DepartmentForm } from '@/pages/department/DepartmentForm'
import { ZoneListPage } from '@/pages/zone/ZoneListPage'
import { ZoneForm } from '@/pages/zone/ZoneForm'
import { PhcCenterListPage } from '@/pages/phc-center/PhcCenterListPage'
import { PhcCenterForm } from '@/pages/phc-center/PhcCenterForm'
import { NationalityListPage } from '@/pages/nationality/NationalityListPage'
import { NationalityForm } from '@/pages/nationality/NationalityForm'
import { MedicalFieldListPage } from '@/pages/medical-field/MedicalFieldListPage'
import { MedicalFieldForm } from '@/pages/medical-field/MedicalFieldForm'
import { SpecialtyListPage } from '@/pages/specialty/SpecialtyListPage'
import { SpecialtyForm } from '@/pages/specialty/SpecialtyForm'
import { RankListPage } from '@/pages/rank/RankListPage'
import { RankForm } from '@/pages/rank/RankForm'
import { ShcCategoryListPage } from '@/pages/shc-category/ShcCategoryListPage'
import { ShcCategoryForm } from '@/pages/shc-category/ShcCategoryForm'
import { RoleListPage } from '@/pages/role/RoleListPage'
import { RoleFormPage } from '@/pages/role/RoleFormPage'
import { UserListPage } from '@/pages/user/UserListPage'
import { PasswordChangePage } from '@/pages/PasswordChangePage'

export interface RouteConfig {
  path: string
  element: ComponentType<unknown>
  public?: boolean
}

export const routes: RouteConfig[] = [
  { path: '/login', element: LoginPage, public: true },
  { path: '/', element: DashboardPage },
  { path: '/staff', element: StaffListPage },
  { path: '/staff/new', element: StaffForm },
  { path: '/staff/:id', element: StaffDetailPage },
  { path: '/staff/:id/edit', element: StaffForm },
  { path: '/departments', element: DepartmentListPage },
  { path: '/departments/new', element: DepartmentForm },
  { path: '/departments/:id', element: DepartmentForm },
  { path: '/zones', element: ZoneListPage },
  { path: '/zones/new', element: ZoneForm },
  { path: '/zones/:id', element: ZoneForm },
  { path: '/phc-centers', element: PhcCenterListPage },
  { path: '/phc-centers/new', element: PhcCenterForm },
  { path: '/phc-centers/:id', element: PhcCenterForm },
  { path: '/nationalities', element: NationalityListPage },
  { path: '/nationalities/new', element: NationalityForm },
  { path: '/nationalities/:id', element: NationalityForm },
  { path: '/medical-fields', element: MedicalFieldListPage },
  { path: '/medical-fields/new', element: MedicalFieldForm },
  { path: '/medical-fields/:id', element: MedicalFieldForm },
  { path: '/specialties', element: SpecialtyListPage },
  { path: '/specialties/new', element: SpecialtyForm },
  { path: '/specialties/:id', element: SpecialtyForm },
  { path: '/ranks', element: RankListPage },
  { path: '/ranks/new', element: RankForm },
  { path: '/ranks/:id', element: RankForm },
  { path: '/shc-categories', element: ShcCategoryListPage },
  { path: '/shc-categories/new', element: ShcCategoryForm },
  { path: '/shc-categories/:id', element: ShcCategoryForm },
  { path: '/roles', element: RoleListPage },
  { path: '/roles/new', element: RoleFormPage },
  { path: '/roles/:id', element: RoleFormPage },
  { path: '/users', element: UserListPage },
  { path: '/profile/password', element: PasswordChangePage },
]