import { Link, useNavigate } from 'react-router-dom'

function FacilitiesPage() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Facilities</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome to CHARUSAT Sports Booking</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              Home
            </Link>
            <button onClick={logout} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Logout
            </button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-900 p-6 text-white">
            <p className="text-sm text-slate-300">Quick Access</p>
            <h2 className="mt-3 text-2xl font-semibold">Book courts, fields, and indoor spaces.</h2>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">Next step</p>
            <p className="mt-3 text-lg font-medium">Connect this page to your facility catalog and booking workflow.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacilitiesPage