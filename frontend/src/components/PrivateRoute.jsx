import { Navigate, useLocation } from 'react-router-dom'
import { getStoredAuth } from '../utils/auth'

function PrivateRoute({ children, requiredRole, allowedRoles, unauthenticatedTo = '/login', forbiddenTo = '/facilities' }) {
  const location = useLocation()
  const auth = getStoredAuth()

  if (!auth) {
    return <Navigate to={unauthenticatedTo} replace state={{ from: location.pathname }} />
  }

  const roles = allowedRoles || (requiredRole ? [requiredRole] : null)

  if (roles && !roles.includes(auth.role)) {
    return <Navigate to={forbiddenTo} replace />
  }

  return children
}

export default PrivateRoute