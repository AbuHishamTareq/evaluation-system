import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { BlankLayout } from './layouts/BlankLayout';
import { ToastProvider } from './components/ui/toast';
import { TranslationProvider } from './contexts/TranslationContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { StaffPage } from './pages/staff';
import { QuestionsPage } from './pages/questions';
import { EvaluationsPage, EvaluationTakingPage } from './pages/evaluations';
import { CentersPage } from './pages/centers';
import { ReportsPage } from './pages/reports';
import ZonesPage from './pages/zones';
import ActionPlansPage from './pages/action-plans';
import { TeamCodesPage } from './pages/team-codes';
import { ClassificationPage } from './pages/classification/ClassificationPage';
import { QuestionCategoriesPage } from './pages/question-categories';
import { QuestionSubCategoriesPage } from './pages/question-sub-categories';
import { EducationalDegreesPage } from './pages/educational-degrees/EducationalDegreesPage';
import { DepartmentsPage } from './pages/departments/DepartmentsPage';
import { ClinicAssignmentsPage } from './pages/clinicAssignments/ClinicAssignmentsPage';
import { ProfessionalsPage } from './pages/professionals/ProfessionalsPage';
import { RolesPage } from './pages/roles';
import { PermissionsPage } from './pages/permissions';
import { UsersPage } from './pages/users';
import { LoginPage } from './pages/auth';
import { useAuthStore } from './stores/authStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <TranslationProvider>
        <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route element={<BlankLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Routes - Main Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/evaluations" element={<EvaluationsPage />} />
            <Route path="/evaluations/:id/take" element={<EvaluationTakingPage />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/action-plans" element={<ActionPlansPage />} />
            <Route path="/team-codes" element={<TeamCodesPage />} />
            <Route path="/classification" element={<ClassificationPage />} />
            <Route path="/question-categories" element={<QuestionCategoriesPage />} />
            <Route path="/question-sub-categories" element={<QuestionSubCategoriesPage />} />
            <Route path="/educational-degrees" element={<EducationalDegreesPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/clinic-assignments" element={<ClinicAssignmentsPage />} />
            <Route path="/professionals" element={<ProfessionalsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route
              path="/change-password"
              element={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Change Password</h2>
                    <p className="text-slate-500 mt-2">Password change form coming soon.</p>
                  </div>
                </div>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
      </TranslationProvider>
    </ToastProvider>
  );
}

export default App;