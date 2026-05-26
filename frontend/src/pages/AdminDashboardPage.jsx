import { useNavigate } from 'react-router-dom'

function AdminDashboardPage() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold">Restricted administrative access</h1>
          </div>
          <button onClick={logout} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">
            Logout
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Bookings</p>
            <p className="mt-3 text-3xl font-semibold">Manage</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Users</p>
            <p className="mt-3 text-3xl font-semibold">Review</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-300">Reports</p>
            <p className="mt-3 text-3xl font-semibold">Track</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage