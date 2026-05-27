import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import FacilityManagement from './pages/admin/FacilityManagement'
import PrivateRoute from './components/PrivateRoute'
import { getRedirectPathForRole, getStoredAuth } from './utils/auth'
import FacilityListing from './pages/FacilityListing'
import FacilityDetail from './pages/FacilityDetail'
import OrgDashboard from './pages/external/OrgDashboard'

function RootRedirect() {
  const auth = getStoredAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getRedirectPathForRole(auth.role)} replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/facilities"
        element={
          <PrivateRoute>
            <FacilityListing />
          </PrivateRoute>
        }
      />
      <Route
        path="/facilities/:id"
        element={
          <PrivateRoute>
            <FacilityDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/org/dashboard"
        element={
          <PrivateRoute allowedRoles={["external"]} forbiddenTo="/facilities">
            <OrgDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <PrivateRoute allowedRoles={["internal", "external"]}>
            <OrgDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/facilities"
        element={
          <PrivateRoute requiredRole="admin">
            <FacilityManagement />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
