import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { getStoredAuth } from '../utils/auth'

function StatCard({ loading, children, className }) {
  return (
    <div className={`rounded-2xl border px-6 py-6 shadow-sm ${className} ${loading ? 'animate-pulse' : ''}`}>
      {children}
    </div>
  )
}

function ActionCard({ title, description, onClick }) {
  return (
    <button onClick={onClick} className="rounded-2xl border p-6 text-left hover:shadow-md hover:border-emerald-300 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        <div className="text-slate-300">→</div>
      </div>
    </button>
  )
}

function AdminDashboardPage() {
  const navigate = useNavigate()
  // Memoize auth so the object identity stays stable between renders
  // Prevents the effect from re-running continuously when decode returns a new object
  const auth = useMemo(() => getStoredAuth(), [])

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth || auth.role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }

    let mounted = true

    const fetchStats = async () => {
      try {
        // only show loading for the initial fetch
        if (!stats) setLoading(true)
        setError('')
        const res = await api.get('/admin/dashboard/stats')
        if (!mounted) return
        setStats(res.data)
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load dashboard data')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchStats()
    const id = setInterval(fetchStats, 60000)
    return () => {
      mounted = false
      clearInterval(id)
    }
    // auth is memoized and navigate is stable — safe to omit stats and other transient values
  }, [navigate, auth])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const totalBookings = stats?.totalBookings ?? 0
  const pendingApprovals = stats?.pendingApprovals ?? 0
  const revenueCollectedMTD = stats?.revenueCollectedMTD ?? 0
  const activeFacilities = stats?.activeFacilities ?? 0

  const pendingProgress = useMemo(() => Math.min(100, (pendingApprovals / 50) * 100), [pendingApprovals])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="fixed left-0 right-0 top-0 border-b bg-white/80 backdrop-blur z-20">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="text-emerald-600 font-bold">CHARUSAT Sports Admin</div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-700">{auth?.name || 'Admin'}</div>
            <button onClick={logout} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Logout</button>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">ADMIN CONTROLS</p>
            <h1 className="mt-2 text-3xl font-semibold">Dashboard Overview</h1>
            <p className="mt-2 text-sm text-slate-600">Welcome back! Here's what's happening today at CHARUSAT Sports.</p>
          </div>

          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard loading={loading} className="bg-emerald-50 border-0">
              <p className="text-sm font-semibold text-emerald-700">Total Bookings</p>
              <p className="mt-4 text-3xl font-bold">{loading ? '—' : totalBookings}</p>
              <p className="mt-2 text-sm text-slate-500">All confirmed bookings</p>
            </StatCard>

            <StatCard loading={loading} className="bg-white border-l-4 border-emerald-400">
              <p className="text-sm font-semibold text-slate-700">Pending Approvals</p>
              <p className="mt-4 text-3xl font-bold">{loading ? '—' : pendingApprovals}</p>
              <div className="mt-3 w-full rounded-full bg-slate-100 h-2">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pendingProgress}%` }} />
              </div>
              {pendingApprovals > 0 ? <p className="mt-2 text-xs text-amber-700">Action required</p> : null}
            </StatCard>

            <StatCard loading={loading} className="bg-white">
              <p className="text-sm font-semibold text-slate-700">Revenue Collected MTD</p>
              <p className="mt-4 text-3xl font-bold">{loading ? '—' : `₹${Number(revenueCollectedMTD).toLocaleString('en-IN')}`}</p>
              <p className="mt-2 text-sm text-slate-500">Current billing cycle</p>
            </StatCard>

            <StatCard loading={loading} className="bg-amber-50">
              <p className="text-sm font-semibold text-amber-700">Active Facilities</p>
              <p className="mt-4 text-3xl font-bold">{loading ? '—' : activeFacilities}</p>
              <p className="mt-2 text-sm text-slate-500">Currently operational</p>
            </StatCard>
          </section>

          <section className="mt-10">
            <p className="text-xs uppercase text-slate-500">Quick Actions</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ActionCard title="Manage Facilities" description="Add, edit, disable facilities and block slots" onClick={() => navigate('/admin/facilities')} />
              <ActionCard title="View Bookings" description="Approve or reject external booking requests" onClick={() => navigate('/admin/bookings')} />
              <ActionCard title="Reports & Revenue" description="Download booking and revenue reports" onClick={() => navigate('/admin/reports')} />
              <ActionCard title="Manage Users" description="View, deactivate or flag user accounts" onClick={() => navigate('/admin/users')} />
            </div>
          </section>

          {error ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              <div>{error}</div>
              <div className="mt-2">
                <button onClick={() => window.location.reload()} className="rounded-xl bg-red-600 px-3 py-2 text-white">Retry</button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage