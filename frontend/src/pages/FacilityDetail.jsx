import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'
import BookingFilters from '../components/booking/BookingFilters'
import WeeklySchedule from '../components/booking/WeeklySchedule'
import BookingSummaryCard from '../components/booking/BookingSummaryCard'
import { getStoredProfile } from '../utils/auth'
import { formatLongDate, getDateKey as toDateKey } from '../utils/booking'

const placeholderImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="%2306b6d4"/><stop offset="1" stop-color="%23065f46"/></linearGradient></defs><rect width="1400" height="800" rx="52" fill="url(%23g)"/><path d="M0 560C220 460 420 420 700 510s430 150 700 70v220H0Z" fill="rgba(255,255,255,0.12)"/><circle cx="980" cy="210" r="170" fill="rgba(255,255,255,0.16)"/><text x="90" y="150" fill="white" font-size="74" font-family="Arial, sans-serif" font-weight="700">CHARUSAT SPORTS</text></svg>'

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.7 11.1 6.6-3.2" />
      <path d="m8.7 12.9 6.6 3.2" />
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

function FacilityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const profile = getStoredProfile()
  const [facility, setFacility] = useState(null)
  const [facilityLoading, setFacilityLoading] = useState(true)
  const [facilityError, setFacilityError] = useState('')
  const [availabilityByDate, setAvailabilityByDate] = useState({})
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week')
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingMessage, setBookingMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const loadFacility = async () => {
      try {
        setFacilityLoading(true)
        setFacilityError('')
        const response = await api.get(`/facilities/${id}`)
        if (!mounted) return
        setFacility(response.data)
      } catch (requestError) {
        if (!mounted) return
        const status = requestError?.response?.status
        if (status === 404) {
          setFacilityError('Facility not found')
        } else if (status === 500) {
          setFacilityError('Something went wrong. Please try again.')
        } else {
          setFacilityError(requestError?.response?.data?.message || 'Unable to load facility details.')
        }
      } finally {
        if (mounted) setFacilityLoading(false)
      }
    }

    loadFacility()

    return () => {
      mounted = false
    }
  }, [id])

  useEffect(() => {
    if (!facility) return

    let mounted = true

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true)
        const dates = viewMode === 'week'
          ? Array.from({ length: 7 }, (_, index) => {
              const current = new Date(selectedDate)
              const offset = current.getDay() === 0 ? -6 : 1 - current.getDay()
              current.setDate(current.getDate() + offset + index)
              return current
            })
          : [selectedDate]

        const responses = await Promise.all(
          dates.map((date) => api.get(`/facilities/${facility._id}/availability`, { params: { date: toDateKey(date) } })),
        )

        if (!mounted) return

        const nextAvailability = {}
        responses.forEach((response) => {
          nextAvailability[response.data.date] = response.data
        })
        setAvailabilityByDate(nextAvailability)
      } catch (requestError) {
        if (!mounted) return
        const status = requestError?.response?.status
        if (status === 404) {
          setAvailabilityByDate({})
          setBookingMessage('Facility not found')
        } else if (status === 500) {
          setBookingMessage('Something went wrong. Please try again.')
        } else {
          setBookingMessage(requestError?.response?.data?.message || 'Unable to load availability.')
        }
      } finally {
        if (mounted) setAvailabilityLoading(false)
      }
    }

    loadAvailability()

    return () => {
      mounted = false
    }
  }, [facility, selectedDate, viewMode])

  const selectedDateKey = toDateKey(selectedDate)
  const selectedAvailability = availabilityByDate[selectedDateKey]

  const selectedAddOnDetails = useMemo(() => {
    const addOnData = [
      { id: 'badminton_rackets', label: 'Badminton Rackets x2', price: 0 },
      { id: 'shuttlecocks_pack', label: 'Shuttlecocks Pack of 3', price: 0 },
    ]

    return addOnData.filter((item) => selectedAddOns.includes(item.id))
  }, [selectedAddOns])

  const handleToggleAddOn = (addOnId) => {
    setSelectedAddOns((current) => (current.includes(addOnId) ? current.filter((item) => item !== addOnId) : [...current, addOnId]))
  }


  // clear selection when date changes

  const handleConfirmBooking = async () => {
    if (!selectedSlots || selectedSlots.length === 0 || !facility) return

    // Client-side: prevent booking for past dates
    try {
      const parts = String(selectedSlots[0].date).split('-').map((p) => Number(p))
      if (parts.length === 3) {
        const [y, m, d] = parts
        const bookingDate = new Date(y, m - 1, d)
        bookingDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (bookingDate < today) {
          setBookingMessage('Cannot book a date that has already passed.')
          return
        }
      }
    } catch (e) {
      // ignore parse errors; server will validate
    }

    try {
      setBookingLoading(true)
      setBookingMessage('')

      const payload = {
        facility_id: facility._id,
        selectedSlots: selectedSlots.map((s) => ({ start: s.start, end: s.end, date: s.date })),
        notes: selectedAddOns.length ? `Add-ons: ${selectedAddOns.join(', ')}` : undefined,
      }

      await api.post('/bookings', payload)
      setBookingMessage('Booking submitted successfully')
    } catch (requestError) {
      const status = requestError?.response?.status
      if (status === 501 || status === 404) {
        setBookingMessage('Booking submission is not implemented yet. Your selection has been prepared.')
      } else if (status === 500) {
        setBookingMessage('Something went wrong. Please try again.')
      } else {
        setBookingMessage(requestError?.response?.data?.message || 'Unable to submit booking.')
      }
    } finally {
      setBookingLoading(false)
    }
  }

  const selectedSlotDetails = selectedSlots && selectedSlots.length ? { start: selectedSlots[0].start, end: selectedSlots[selectedSlots.length - 1].end } : null

  if (facilityLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar activeLink="/facilities" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6">
          <div className="h-64 animate-pulse rounded-4xl bg-slate-200" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.4fr_0.9fr]">
            <div className="h-180 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-180 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-180 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    )   
  }

  if (facilityError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-lg rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-900">{facilityError}</h1>
          <p className="mt-3 text-sm text-slate-600">Return to the facility list to browse available sports spaces.</p>
          <button type="button" onClick={() => navigate('/facilities')} className="mt-6 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Back to Facilities
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <Navbar
        activeLink="/facilities"
        searchValue=""
        onSearchChange={() => {}}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-6">
        <section className="relative overflow-hidden rounded-4xl border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-900/15">
          <img src={facility.image_url || placeholderImage} alt={facility.name} className="h-90 w-full object-cover opacity-95" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute left-6 top-6 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${facility.category === 'indoor' ? 'bg-emerald-600' : 'bg-blue-600'}`}>{facility.category === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Professional Grade</span>
          </div>
          <div className="absolute right-6 top-6 flex items-center gap-2 text-white">
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20">
              <HeartIcon />
            </button>
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20">
              <ShareIcon />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Facility Details</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{facility.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2"><PinIcon />{facility.location}</span>
              <span className="inline-flex items-center gap-2"><PeopleIcon />{facility.capacity > 10 ? `${Number(facility.capacity).toLocaleString('en-IN')} Spectators` : `Max ${facility.capacity} Players`}</span>
              {facility.subtitle ? <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">{facility.subtitle}</span> : null}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.3fr_0.9fr]">
          <BookingFilters
            facility={facility}
            selectedDate={selectedDate}
            onDateChange={(date) => {
              setSelectedDate(date)
              setSelectedSlots([])
            }}
            selectedAddOns={selectedAddOns}
            onToggleAddOn={handleToggleAddOn}
          />

          <WeeklySchedule
            facility={facility}
            selectedDate={selectedDate}
            availabilityByDate={availabilityByDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedSlots={selectedSlots}
            setSelectedSlots={setSelectedSlots}
            maxSlotsPerBooking={facility?.max_slots_per_booking}
            loading={availabilityLoading}
          />

          <BookingSummaryCard
            facility={facility}
            user={profile}
            selectedDate={selectedSlots && selectedSlots.length ? selectedSlots[0].date : selectedDate}
            selectedSlots={selectedSlots}
            selectedAddOns={selectedAddOnDetails}
            onConfirm={handleConfirmBooking}
            loading={bookingLoading}
            message={bookingMessage}
            onRequestQuote={() => setBookingMessage('Quote request coming soon')}
          />
        </section>

        <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <span className="font-semibold text-slate-900">Availability on {formatLongDate(selectedDate)}:</span> {selectedSlotDetails ? `${selectedSlotDetails.start} - ${selectedSlotDetails.end} selected` : 'Choose a green slot to continue.'}
        </div>
      </main>
    </div>
  )
}

export default FacilityDetail