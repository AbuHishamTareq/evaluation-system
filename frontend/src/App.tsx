import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { ProtectedRoute } from '@/components/ProtectedRoute'
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

function App() {
  const { isAuthenticated } = useAuthStore()
  const { direction } = useAppStore()

  return (
    <div dir={direction} className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <StaffListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/new"
          element={
            <ProtectedRoute>
              <StaffForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id"
          element={
            <ProtectedRoute>
              <StaffDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:id/edit"
          element={
            <ProtectedRoute>
              <StaffForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <DepartmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/new"
          element={
            <ProtectedRoute>
              <DepartmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute>
              <DepartmentForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zones"
          element={
            <ProtectedRoute>
              <ZoneListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zones/new"
          element={
            <ProtectedRoute>
              <ZoneForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/zones/:id"
          element={
            <ProtectedRoute>
              <ZoneForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/phc-centers"
          element={
            <ProtectedRoute>
              <PhcCenterListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/phc-centers/new"
          element={
            <ProtectedRoute>
              <PhcCenterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/phc-centers/:id"
          element={
            <ProtectedRoute>
              <PhcCenterForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nationalities"
          element={
            <ProtectedRoute>
              <NationalityListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nationalities/new"
          element={
            <ProtectedRoute>
              <NationalityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nationalities/:id"
          element={
            <ProtectedRoute>
              <NationalityForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-fields"
          element={
            <ProtectedRoute>
              <MedicalFieldListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-fields/new"
          element={
            <ProtectedRoute>
              <MedicalFieldForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-fields/:id"
          element={
            <ProtectedRoute>
              <MedicalFieldForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/specialties"
          element={
            <ProtectedRoute>
              <SpecialtyListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/specialties/new"
          element={
            <ProtectedRoute>
              <SpecialtyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/specialties/:id"
          element={
            <ProtectedRoute>
              <SpecialtyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranks"
          element={
            <ProtectedRoute>
              <RankListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranks/new"
          element={
            <ProtectedRoute>
              <RankForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ranks/:id"
          element={
            <ProtectedRoute>
              <RankForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shc-categories"
          element={
            <ProtectedRoute>
              <ShcCategoryListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shc-categories/new"
          element={
            <ProtectedRoute>
              <ShcCategoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shc-categories/:id"
          element={
            <ProtectedRoute>
              <ShcCategoryForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <RoleListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/new"
          element={
            <ProtectedRoute>
              <RoleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roles/:id"
          element={
            <ProtectedRoute>
              <RoleFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserListPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App