import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import FacilitiesPage from './pages/FacilitiesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import PrivateRoute from './components/PrivateRoute'
import { getStoredAuth } from './utils/auth'

function RootRedirect() {
  const auth = getStoredAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  return auth.role === 'admin' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/facilities" replace />
  )
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
            <FacilitiesPage />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
