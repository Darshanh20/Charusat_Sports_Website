const base64UrlDecode = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  return atob(padded)
}

export const decodeToken = (token) => {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(base64UrlDecode(payload))
  } catch (error) {
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
  if (role === 'admin') {
    return '/admin/dashboard'
  }

  return '/facilities'
}