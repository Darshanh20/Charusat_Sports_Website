import { Link, useLocation, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

const getLinksForRole = (role) => {
  if (role === 'external') {
    return [
      { label: 'Facilities', to: '/facilities' },
      { label: 'My Bookings', to: '/org/dashboard' },
    ]
  }

  if (role === 'admin') {
    return [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Facilities', to: '/facilities' },
    ]
  }

  return [
    { label: 'Facilities', to: '/facilities' },
    { label: 'My Bookings', to: '/my-bookings' },
  ]
}

const getInitials = (value) =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 17h5l-1.5-1.5A2 2 0 0 1 18 14.1V11a6 6 0 0 0-5-5.91V4a1 1 0 1 0-2 0v1.09A6 6 0 0 0 6 11v3.1a2 2 0 0 1-.5 1.4L4 17h5" />
      <path d="M9 17a3 3 0 0 0 6 0" />
    </svg>
  )
}

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h16" />
        <path d="M12 4v16" />
        <path d="M7 7h10" />
        <path d="M7 17h10" />
      </svg>
    </div>
  )
}

function Navbar({ links, activeLink, searchValue = '', onSearchChange, searchPlaceholder, rightSlot = null }) {
  const location = useLocation()
  const navigate = useNavigate()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const profile = (() => {
    if (!token) return null

    try {
      return jwtDecode(token)
    } catch {
      return null
    }
  })()

  const currentPath = activeLink || location.pathname
  const resolvedLinks = links || getLinksForRole(profile?.role)
  const resolvedSearchPlaceholder = searchPlaceholder || (profile?.role === 'external' ? 'Find a facility...' : 'Search facilities...')

  const isFacilitiesPath = currentPath === '/facilities' || currentPath.startsWith('/facilities/')
  const isBookingsPath = currentPath === '/my-bookings' || currentPath === '/org/dashboard'

  const isExternal = profile?.role === 'external'
  const resolvedName = isExternal ? profile?.org_name || 'External Partner' : profile?.full_name || 'CHARUSAT Member'
  const resolvedSubtitle = isExternal ? 'External Partner' : profile?.university_id ? `STUDENT ID: ${profile.university_id}` : 'Internal Member'
  const avatar = isExternal
    ? String(profile?.org_name || 'E').trim().charAt(0).toUpperCase()
    : getInitials(resolvedName || 'CM')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-emerald-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(profile?.role === 'external' ? '/org/dashboard' : '/facilities')} className="flex items-center gap-3 text-left">
            <LogoMark />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">CHARUSAT Sports</p>
              <p className="text-xs text-slate-500">Facility booking platform</p>
            </div>
          </button>
        </div>

        <nav className="flex flex-wrap items-center gap-2 md:gap-3">
          {resolvedLinks.map((link) => {
            const isActive =
              link.to === '/facilities'
                ? isFacilitiesPath
                : link.to === '/org/dashboard' || link.to === '/my-bookings'
                  ? isBookingsPath
                  : currentPath === link.to || (link.to !== '/' && currentPath.startsWith(link.to))

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex flex-col gap-3 lg:min-w-105 lg:flex-row lg:items-center lg:justify-end">
          <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 lg:max-w-60">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={resolvedSearchPlaceholder}
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700">
              <BellIcon />
              <span className="sr-only">Notifications</span>
            </button>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                {avatar || 'CS'}
              </div>
              <div className="leading-tight">
                <p className="max-w-42.5 truncate text-sm font-semibold text-slate-900">{resolvedName}</p>
                <p className="max-w-42.5 truncate text-xs text-slate-500">{resolvedSubtitle}</p>
              </div>
            </div>

            {profile ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-700"
              >
                Logout
              </button>
            ) : null}

            {rightSlot}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar