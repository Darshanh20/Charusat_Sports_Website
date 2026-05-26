import { Navigate, useLocation } from 'react-router-dom'
import { getStoredAuth } from '../utils/auth'

function PrivateRoute({ children, requiredRole }) {
  const location = useLocation()
  const auth = getStoredAuth()

  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (requiredRole && auth.role !== requiredRole) {
    return <Navigate to="/facilities" replace />
  }

  return children
}

export default PrivateRoute