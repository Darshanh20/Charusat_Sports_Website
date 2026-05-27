const base64UrlDecode = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  return atob(padded)
}

export const decodeToken = (token) => {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(base64UrlDecode(payload))
  } catch {
    return null
  }
}

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token)

  if (!decoded?.exp) {
    return true
  }

  return decoded.exp * 1000 <= Date.now()
}

export const getStoredAuth = () => {
  const token = localStorage.getItem('token')

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token')
    return null
  }

  const decoded = decodeToken(token)

  if (!decoded) {
    localStorage.removeItem('token')
    return null
  }

  return decoded
}

export const getRedirectPathForRole = (role) => {
  if (role === 'external') {
    return '/org/dashboard'
  }

  if (role === 'admin') {
    return '/admin/dashboard'
  }

  return '/facilities'
}

export const getStoredProfile = () => {
  const auth = getStoredAuth()

  if (!auth) {
    return null
  }

  const isExternal = auth.role === 'external'
  const displayName = isExternal ? auth.org_name || auth.full_name || 'External Partner' : auth.full_name || 'CHARUSAT Member'
  const subtitle = isExternal ? 'External Partner' : auth.university_id ? `STUDENT ID: ${auth.university_id}` : 'Internal Member'

  return {
    ...auth,
    displayName,
    subtitle,
    avatarText: displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
  }
}