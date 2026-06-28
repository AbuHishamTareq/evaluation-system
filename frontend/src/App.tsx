import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { BlankLayout } from './layouts/BlankLayout';
import { ToastProvider } from './components/ui/toast';
import { TranslationProvider } from './contexts/TranslationContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { useAuthStore } from './stores/authStore';

// Lazy-loaded pages
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const StaffPage = React.lazy(() => import('./pages/staff').then(m => ({ default: m.StaffPage })));
const QuestionsPage = React.lazy(() => import('./pages/questions').then(m => ({ default: m.QuestionsPage })));
const TemplateBuilderPage = React.lazy(() => import('./pages/templates').then(m => ({ default: m.TemplateBuilderPage })));
const EvaluationsPage = React.lazy(() => import('./pages/evaluations').then(m => ({ default: m.EvaluationsPage })));
const EvaluationTakingPage = React.lazy(() => import('./pages/evaluations').then(m => ({ default: m.EvaluationTakingPage })));
const CentersPage = React.lazy(() => import('./pages/centers').then(m => ({ default: m.CentersPage })));
const ReportsPage = React.lazy(() => import('./pages/reports').then(m => ({ default: m.ReportsPage })));
const ZonesPage = React.lazy(() => import('./pages/zones'));
const ActionPlansPage = React.lazy(() => import('./pages/action-plans'));
const TeamCodesPage = React.lazy(() => import('./pages/team-codes').then(m => ({ default: m.TeamCodesPage })));
const MedicationsPage = React.lazy(() => import('./pages/medications/MedicationsPage').then(m => ({ default: m.MedicationsPage })));
const PhcMedicationsPage = React.lazy(() => import('./pages/medications/PhcMedicationsPage').then(m => ({ default: m.PhcMedicationsPage })));
const ClassificationPage = React.lazy(() => import('./pages/classification/ClassificationPage').then(m => ({ default: m.ClassificationPage })));
const QuestionCategoriesPage = React.lazy(() => import('./pages/question-categories').then(m => ({ default: m.QuestionCategoriesPage })));
const QuestionSubCategoriesPage = React.lazy(() => import('./pages/question-sub-categories').then(m => ({ default: m.QuestionSubCategoriesPage })));
const EducationalDegreesPage = React.lazy(() => import('./pages/educational-degrees/EducationalDegreesPage').then(m => ({ default: m.EducationalDegreesPage })));
const DepartmentsPage = React.lazy(() => import('./pages/departments/DepartmentsPage').then(m => ({ default: m.DepartmentsPage })));
const ClinicAssignmentsPage = React.lazy(() => import('./pages/clinicAssignments/ClinicAssignmentsPage').then(m => ({ default: m.ClinicAssignmentsPage })));
const ProfessionalsPage = React.lazy(() => import('./pages/professionals/ProfessionalsPage').then(m => ({ default: m.ProfessionalsPage })));
const RolesPage = React.lazy(() => import('./pages/roles').then(m => ({ default: m.RolesPage })));
const PermissionsPage = React.lazy(() => import('./pages/permissions').then(m => ({ default: m.PermissionsPage })));
const MedTemplatesPage = React.lazy(() => import('./pages/medication-evaluations').then(m => ({ default: m.TemplatesPage })));
const EvaluationsListPage = React.lazy(() => import('./pages/medication-evaluations').then(m => ({ default: m.EvaluationsListPage })));
const MedEvalTakingPage = React.lazy(() => import('./pages/medication-evaluations').then(m => ({ default: m.EvaluationTakingPage })));
const UsersPage = React.lazy(() => import('./pages/users').then(m => ({ default: m.UsersPage })));
const ChangePasswordPage = React.lazy(() => import('./pages/change-password/ChangePasswordPage').then(m => ({ default: m.ChangePasswordPage })));
const LoginPage = React.lazy(() => import('./pages/auth').then(m => ({ default: m.LoginPage })));

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
            <Route path="/templates" element={<TemplateBuilderPage />} />
            <Route path="/evaluations" element={<EvaluationsPage />} />
            <Route path="/evaluations/:id/take" element={<EvaluationTakingPage />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/zones" element={<ZonesPage />} />
            <Route path="/action-plans" element={<ActionPlansPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
            <Route path="/phc-medications" element={<PhcMedicationsPage />} />
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
            <Route path="/medication-evaluation-templates" element={<MedTemplatesPage />} />
            <Route path="/medication-evaluations" element={<EvaluationsListPage />} />
            <Route path="/medication-evaluations/:id" element={<MedEvalTakingPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
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