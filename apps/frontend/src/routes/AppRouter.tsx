import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { DistrictAdminLayout } from '../layouts/DistrictAdminLayout'
import { SchoolAdminLayout } from '../layouts/SchoolAdminLayout'
import { StudentLayout } from '../layouts/StudentLayout'
import { TeacherLayout } from '../layouts/TeacherLayout'
import { AdminConsolePage } from '../pages/AdminConsolePage'
import { AnalyticsPage } from '../pages/AnalyticsPage'
import { LoginPage } from '../pages/LoginPage'
import { StudentPortalPage } from '../pages/StudentPortalPage'
import { TeacherDashboardPage } from '../pages/TeacherDashboardPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        element={(
          <ProtectedRoute allowRoles={['district_admin']}>
            <DistrictAdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/admin" element={<AdminConsolePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute allowRoles={['school_admin']}>
            <SchoolAdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/admin" element={<AdminConsolePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute allowRoles={['teacher']}>
            <TeacherLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/teacher" element={<TeacherDashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route
        element={(
          <ProtectedRoute allowRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/student" element={<StudentPortalPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
