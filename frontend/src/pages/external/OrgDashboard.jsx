import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Navbar from '../../components/layout/Navbar'
import StatusBadge from '../../components/common/StatusBadge'
import { formatCurrency, formatShortMonthDay, formatLongDate } from '../../utils/booking'

function FacilityIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M9 20v-6h6v6" />
      </svg>
    </div>
  )
}

function OrgDashboard() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')
  const pageSize = 5

  useEffect(() => {
    let mounted = true

    const loadBookings = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/bookings/mine')
        if (!mounted) return
        setBookings(response.data || [])
      } catch (requestError) {
        if (!mounted) return
        const status = requestError?.response?.status
        if (status === 404 || status === 501) {
          setBookings([])
        } else if (status === 500) {
          setError('Something went wrong. Please try again.')
        } else {
          setError(requestError?.response?.data?.message || 'Unable to load bookings.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadBookings()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  const filteredBookings = useMemo(() => {
    if (activeTab === 'pending') {
      return bookings.filter((booking) => ['pending_approval', 'awaiting_payment'].includes(String(booking.status || '').toLowerCase()))
    }
    if (activeTab === 'completed') {
      return bookings.filter((booking) => ['confirmed', 'completed'].includes(String(booking.status || '').toLowerCase()))
    }
    return bookings
  }, [activeTab, bookings])

  const totalBookings = bookings.length
  const totalExpenditure = 0
  const upcomingSessions = bookings
    .filter((booking) => ['confirmed', 'approved'].includes(String(booking.status || '').toLowerCase()))
    .slice(0, 2)

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleBookings = filteredBookings.slice((safePage - 1) * pageSize, safePage * pageSize)

  const showToast = (message) => setToast(message)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <Navbar
        activeLink="/org/dashboard"
        searchValue=""
        onSearchChange={() => {}}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Organization Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back, manage your facility reservations and track expenditure.</h1>
          </div>
          <button type="button" onClick={() => navigate('/facilities')} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Book New Facility
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-2 rounded-xl bg-red-600 px-3 py-2 text-white">
              Retry
            </button>
          </div>
        ) : null}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">My Bookings</h2>
                <p className="mt-1 text-sm text-slate-500">Track your bookings, payments, and approvals.</p>
              </div>
              <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
                {['all', 'pending', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-2xl px-4 py-2 capitalize transition ${activeTab === tab ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Facility</th>
                    <th className="px-5 py-4">Date &amp; Time</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="4" className="px-5 py-10 text-center text-sm text-slate-500">Loading bookings...</td></tr>
                  ) : visibleBookings.length > 0 ? (
                    visibleBookings.map((booking) => {
                      const status = String(booking.status || 'pending_approval').toLowerCase()
                      return (
                        <tr key={booking._id || `${booking.booking_date}-${booking.start_time}`} className="transition hover:bg-emerald-50/40">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <FacilityIcon />
                              <div>
                                <p className="font-semibold text-slate-900">{booking.facility_name || booking.facility?.name || 'Facility Booking'}</p>
                                <p className="text-sm text-slate-500">{booking.facility_location || booking.facility?.location || 'CHARUSAT Sports'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-900">{booking.booking_date ? formatLongDate(booking.booking_date) : 'Date pending'}</p>
                            <p className="mt-1">{booking.start_time && booking.end_time ? `${booking.start_time} - ${booking.end_time}` : 'Time pending'}</p>
                          </td>
                          <td className="px-5 py-4"><StatusBadge status={status} /></td>
                          <td className="px-5 py-4">
                            {status === 'awaiting_payment' ? (
                              <button type="button" onClick={() => showToast('Payment coming soon')} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                                Pay Now
                              </button>
                            ) : status === 'confirmed' ? (
                              <button type="button" className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
                                View Details
                              </button>
                            ) : (
                              <span className="text-slate-400">...</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan="4" className="px-5 py-14 text-center">
                      <p className="text-lg font-semibold text-slate-900">No bookings yet. Book your first facility!</p>
                      <button type="button" onClick={() => navigate('/facilities')} className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                        Book New Facility
                      </button>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
              <p>Showing {filteredBookings.length ? (safePage - 1) * pageSize + 1 : 0} of {filteredBookings.length} bookings</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                  Prev
                </button>
                <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Expenditure</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">{formatCurrency(totalExpenditure)}</p>
              <p className="mt-2 text-sm text-slate-500">vs last month</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Bookings</p>
              <p className="mt-3 text-4xl font-bold text-slate-900">{totalBookings}</p>
              <p className="mt-2 text-sm text-slate-500">0 upcoming this month</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Next Sessions</h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">LIVE</span>
              </div>
              <div className="mt-4 space-y-3">
                {upcomingSessions.length > 0 ? upcomingSessions.map((booking) => (
                  <div key={booking._id || `${booking.booking_date}-${booking.start_time}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                    <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-700">
                      <div>{formatShortMonthDay(booking.booking_date || new Date()).split(' ')[0]}</div>
                      <div className="text-lg font-bold">{formatShortMonthDay(booking.booking_date || new Date()).split(' ')[1]}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{booking.facility_name || 'Booking Session'}</p>
                      <p className="truncate text-xs text-slate-500">{booking.start_time && booking.end_time ? `${booking.start_time} - ${booking.end_time}` : 'Time pending'}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                )) : (
                  <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">No upcoming sessions</p>
                )}
              </div>
              <a href="/facilities" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800">View Full Schedule</a>
            </div>

            <div className="rounded-2xl bg-emerald-950 p-5 text-white shadow-sm">
              <h3 className="text-xl font-semibold">Need help?</h3>
              <p className="mt-2 text-sm text-emerald-100/80">Get support with booking rules, approvals, and invoice management.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="rounded-2xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900">Booking Guidelines</button>
                <button type="button" className="rounded-2xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900">Contact Support</button>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2023 CHARUSAT University. Sports Management System.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/facilities" className="hover:text-emerald-700">Terms of Service</a>
            <a href="/facilities" className="hover:text-emerald-700">Privacy Policy</a>
            <a href="/facilities" className="hover:text-emerald-700">Refund Policy</a>
          </div>
        </footer>
      </main>

      {toast ? <div className="fixed bottom-6 right-6 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
    </div>
  )
}

export default OrgDashboard