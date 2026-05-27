import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import SkeletonCard from '../components/common/SkeletonCard'
import StatusBadge from '../components/common/StatusBadge'
import { formatCurrency } from '../utils/booking'
import { getStoredProfile } from '../utils/auth'

const categories = ['All Sports', 'Cricket', 'Badminton', 'Table Tennis', 'Gymnasium', 'Box Cricket', 'Pickleball']
const placeholderImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="%2306b6d4"/><stop offset="1" stop-color="%23065f46"/></linearGradient></defs><rect width="1200" height="800" rx="48" fill="url(%23g)"/><circle cx="350" cy="300" r="170" fill="rgba(255,255,255,0.16)"/><circle cx="860" cy="520" r="240" fill="rgba(255,255,255,0.12)"/><path d="M270 520c120-170 250-170 360 0 80 130 200 170 320 110" fill="none" stroke="white" stroke-width="24" stroke-linecap="round" opacity="0.65"/><text x="80" y="140" fill="white" font-size="72" font-family="Arial, sans-serif" font-weight="700">CHARUSAT SPORTS</text></svg>'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a3 3 0 0 1 0 5.74" />
    </svg>
  )
}

function FacilityListing() {
  const navigate = useNavigate()
  const profile = getStoredProfile()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('All Sports')

  useEffect(() => {
    let mounted = true

    const loadFacilities = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await api.get('/facilities')
        if (!mounted) return
        setFacilities(response.data || [])
      } catch (requestError) {
        if (!mounted) return
        const status = requestError?.response?.status
        if (status === 404) {
          setError('Facilities not found.')
        } else if (status === 500) {
          setError('Something went wrong. Please try again.')
        } else {
          setError(requestError?.response?.data?.message || 'Unable to load facilities.')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadFacilities()

    return () => {
      mounted = false
    }
  }, [])

  const filteredFacilities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return facilities.filter((facility) => {
      const matchesSearch = !query || [facility.name, facility.sport_type, facility.location].some((field) => String(field || '').toLowerCase().includes(query))
      const matchesCategory = category === 'All Sports' || String(facility.sport_type || '').toLowerCase() === category.toLowerCase()
      return matchesSearch && matchesCategory
    })
  }, [category, facilities, searchTerm])

  const isInternal = profile?.role === 'internal'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <Navbar
        activeLink="/facilities"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6">
        <div className="rounded-4xl border border-white/60 bg-white/85 p-5 shadow-xl shadow-emerald-100/40 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Browse Facilities</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Popular Facilities</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Search and book CHARUSAT sports spaces for training, tournaments, and recreation.</p>
            </div>
            <button type="button" onClick={() => { setSearchTerm(''); setCategory('All Sports') }} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View All
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.3fr_0.85fr_auto] lg:items-center">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              <SearchIcon />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="e.g. Badminton, Cricket Ground..."
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>

            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>

            <button type="button" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Filter
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

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)
            ) : filteredFacilities.length > 0 ? (
              filteredFacilities.map((facility) => {
                const imageSrc = facility.image_url || placeholderImage
                const facilityStatus = facility.is_active ? 'booking_open' : 'maintenance'

                return (
                  <article key={facility._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      <img src={imageSrc} alt={facility.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                      <div className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg ${facility.category === 'indoor' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                        {facility.category === 'indoor' ? 'Indoor' : 'Outdoor'}
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">{facility.name}</h3>
                          {facility.subtitle ? <p className="mt-1 text-sm text-slate-500">{facility.subtitle}</p> : null}
                        </div>
                        {isInternal && facility.is_free_for_internal ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">FREE</span> : null}
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600"><PinIcon /></span>
                          <span>{facility.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600"><PeopleIcon /></span>
                          <span>{facility.capacity > 10 ? `${Number(facility.capacity).toLocaleString('en-IN')} Spectators` : `Max ${facility.capacity} Players`}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={facilityStatus} />
                          {facility.is_free_for_internal && isInternal ? null : <span className="text-sm font-semibold text-slate-700">{formatCurrency(facility.ext_rate_per_hour)}/hr</span>}
                        </div>
                        <button type="button" onClick={() => navigate(`/facilities/${facility._id}`)} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                          Check Availability
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <p className="text-lg font-semibold text-slate-900">No facilities match your search</p>
                <p className="mt-2 text-sm text-slate-500">Try a different facility name or sport category.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default FacilityListing