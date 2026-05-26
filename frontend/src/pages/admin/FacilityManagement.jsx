import { useEffect, useMemo, useRef, useState } from 'react'
import Breadcrumbs from '../../components/admin/Breadcrumbs'
import api from '../../api/axios'
import AddFacilityModal from '../../components/admin/AddFacilityModal'
import EditFacilityModal from '../../components/admin/EditFacilityModal'

const pageSize = 5

const blockFormInitial = {
  facility_id: '',
  reason: 'Maintenance',
  start_datetime: '',
  end_datetime: '',
}

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const formatOperatingHours = (facility) => `${facility.operating_start} - ${facility.operating_end}`

const isValidTimeRange = (startDateTime, endDateTime) => Boolean(startDateTime && endDateTime && new Date(endDateTime) > new Date(startDateTime))

function Badge({ children, tone }) {
  const toneClasses = {
    indoor: 'bg-sky-100 text-sky-700',
    outdoor: 'bg-emerald-100 text-emerald-700',
    maintenance: 'bg-amber-100 text-amber-700',
    active: 'bg-emerald-100 text-emerald-700',
    disabled: 'bg-slate-200 text-slate-700',
  }

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone] || 'bg-slate-100 text-slate-700'}`}>{children}</span>
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-slate-300'} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
}

function FacilityManagement() {
  const [facilities, setFacilities] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, maintenance: 0, disabled: 0, activeBlocks: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState(null)
  const [blockForm, setBlockForm] = useState(blockFormInitial)
  const [blockErrors, setBlockErrors] = useState({})
  const [blockMessage, setBlockMessage] = useState('')
  const [blockLoading, setBlockLoading] = useState(false)
  const [togglingId, setTogglingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const blockSectionRef = useRef(null)

  const loadFacilities = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/admin/facilities/all')
      setFacilities(response.data.facilities || [])
      setStats({
        total: response.data.total || 0,
        active: response.data.active || 0,
        maintenance: response.data.maintenance || 0,
        disabled: response.data.disabled || 0,
        activeBlocks: response.data.activeBlocks || 0,
      })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load facility data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFacilities()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const filteredFacilities = useMemo(
    () => (activeTab === 'maintenance' ? facilities.filter((facility) => facility.status === 'maintenance') : facilities),
    [activeTab, facilities],
  )

  const totalPages = Math.max(1, Math.ceil(filteredFacilities.length / pageSize))
  const visibleFacilities = filteredFacilities.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const openBlockForFacility = (facilityId) => {
    setBlockForm((current) => ({ ...current, facility_id: facilityId }))
    setBlockMessage('')
    setBlockErrors({})
    blockSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleToggle = async (facilityId) => {
    try {
      setTogglingId(facilityId)
      await api.patch(`/admin/facilities/${facilityId}/toggle`)
      await loadFacilities()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to toggle facility status.')
    } finally {
      setTogglingId('')
    }
  }

  const handleDelete = async (facilityId) => {
    const confirmed = window.confirm('Delete this facility only if it has no bookings? This action cannot be undone.')

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(facilityId)
      setError('')
      await api.delete(`/admin/facilities/${facilityId}`)
      await loadFacilities()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to delete facility.')
    } finally {
      setDeletingId('')
    }
  }

  const validateBlockForm = () => {
    const nextErrors = {}

    if (!blockForm.facility_id) nextErrors.facility_id = 'Facility is required.'
    if (!blockForm.reason) nextErrors.reason = 'Reason is required.'
    if (!blockForm.start_datetime) nextErrors.start_datetime = 'Start date and time is required.'
    if (!blockForm.end_datetime) nextErrors.end_datetime = 'End date and time is required.'
    if (blockForm.start_datetime && blockForm.end_datetime && !isValidTimeRange(blockForm.start_datetime, blockForm.end_datetime)) {
      nextErrors.end_datetime = 'End time must be after start time'
    }

    setBlockErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleBlockSubmit = async (event) => {
    event.preventDefault()

    if (!validateBlockForm()) {
      return
    }

    try {
      setBlockLoading(true)
      setBlockMessage('')
      await api.post('/admin/facilities/block', blockForm)
      setBlockMessage('Slot blocked successfully')
      setBlockForm(blockFormInitial)
      await loadFacilities()
    } catch (requestError) {
      const responseMessage = requestError?.response?.data?.message || 'Unable to apply block.'
      setBlockMessage(responseMessage)
    } finally {
      setBlockLoading(false)
    }
  }

  const selectedFacility = facilities.find((facility) => facility._id === blockForm.facility_id)

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8 rounded-4xl border border-emerald-100 bg-white/95 p-6 shadow-2xl shadow-emerald-100/40 backdrop-blur sm:p-8">
        <Breadcrumbs items={[{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Facility Management' }]} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Admin Controls</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">Facility Management & Controls</h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">Manage sports infrastructure, external organization pricing, and schedule maintenance blocks</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Add New Facility
          </button>
        </div>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
            <p className="text-sm font-medium text-emerald-700">Total Facilities</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">External Bookings MTD</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">0</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Revenue Collected</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">₹0</p>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
            <p className="text-sm font-medium text-amber-700">Active Blocks</p>
            <p className="mt-3 text-4xl font-semibold text-slate-900">{stats.activeBlocks}</p>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All Facilities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('maintenance')}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'maintenance' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Under Maintenance
              </button>
            </div>
            <p className="text-sm text-slate-500">Showing {filteredFacilities.length} facilities</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Facility Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Ext. Pricing</th>
                  <th className="px-6 py-4">Operating Hours</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                      Loading facilities...
                    </td>
                  </tr>
                ) : visibleFacilities.length > 0 ? (
                  visibleFacilities.map((facility) => (
                    <tr key={facility._id} className="transition hover:bg-emerald-50/50">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-slate-900">{facility.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{facility.subtitle || 'No subtitle'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge tone={facility.category}>{facility.category === 'indoor' ? 'Indoor' : 'Outdoor'}</Badge>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">{formatCurrency(facility.ext_rate_per_hour)}/hr</p>
                        {facility.is_free_for_internal ? (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">INTERNAL: FREE</p>
                        ) : (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">INTERNAL: {formatCurrency(facility.internal_rate_per_hour)}/hr</p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-900">{formatOperatingHours(facility)}</p>
                        <p className="mt-1 text-sm text-slate-500">{facility.slot_duration_minutes} min slots</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <ToggleSwitch checked={facility.is_active} disabled={togglingId === facility._id} onChange={() => handleToggle(facility._id)} />
                          <Badge tone={facility.status}>{facility.status}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingFacility(facility)}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openBlockForFacility(facility._id)}
                            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                          >
                            Block Slot
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(facility._id)}
                            disabled={deletingId === facility._id}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === facility._id ? (
                              <span className="inline-flex items-center gap-2">
                                <Spinner />
                                Deleting
                              </span>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                      No facilities found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-5">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div ref={blockSectionRef} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 10V8a6 6 0 1 1 12 0v2" />
                <rect x="4" y="10" width="16" height="10" rx="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Quick Block Slot</h2>
              <p className="mt-1 text-sm text-slate-500">Create maintenance or event blocks without leaving the page.</p>
            </div>
          </div>

          <form onSubmit={handleBlockSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Select Facility</span>
              <select
                value={blockForm.facility_id}
                onChange={(event) => {
                  setBlockForm((current) => ({ ...current, facility_id: event.target.value }))
                  setBlockErrors((current) => ({ ...current, facility_id: '' }))
                  setBlockMessage('')
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600"
              >
                <option value="">Choose a facility</option>
                {facilities.map((facility) => (
                  <option key={facility._id} value={facility._id}>
                    {facility.name}
                  </option>
                ))}
              </select>
              {blockErrors.facility_id ? <p className="mt-2 text-sm text-red-600">{blockErrors.facility_id}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Reason</span>
              <select
                value={blockForm.reason}
                onChange={(event) => setBlockForm((current) => ({ ...current, reason: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600"
              >
                <option>Maintenance</option>
                <option>University Event</option>
                <option>Tournament</option>
                <option>Other</option>
              </select>
              {blockErrors.reason ? <p className="mt-2 text-sm text-red-600">{blockErrors.reason}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start Date & Time</span>
              <input
                type="datetime-local"
                value={blockForm.start_datetime}
                onChange={(event) => {
                  setBlockForm((current) => ({ ...current, start_datetime: event.target.value }))
                  setBlockErrors((current) => ({ ...current, start_datetime: '', end_datetime: '' }))
                  setBlockMessage('')
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600"
              />
              {blockErrors.start_datetime ? <p className="mt-2 text-sm text-red-600">{blockErrors.start_datetime}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">End Date & Time</span>
              <input
                type="datetime-local"
                value={blockForm.end_datetime}
                onChange={(event) => {
                  setBlockForm((current) => ({ ...current, end_datetime: event.target.value }))
                  setBlockErrors((current) => ({ ...current, end_datetime: '' }))
                  setBlockMessage('')
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-600"
              />
              {blockErrors.end_datetime ? <p className="mt-2 text-sm text-red-600">{blockErrors.end_datetime}</p> : null}
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center lg:col-span-2 lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  setBlockForm(blockFormInitial)
                  setBlockErrors({})
                  setBlockMessage('')
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={blockLoading}
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {blockLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner />
                    Applying
                  </span>
                ) : (
                  'Apply Block'
                )}
              </button>
            </div>

            {selectedFacility ? <p className="text-sm text-slate-500 lg:col-span-2">Selected facility: {selectedFacility.name}</p> : null}
            {blockMessage ? (
              <p className={`rounded-xl px-4 py-3 text-sm lg:col-span-2 ${blockMessage === 'Slot blocked successfully' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {blockMessage}
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <AddFacilityModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={loadFacilities} />
      <EditFacilityModal isOpen={Boolean(editingFacility)} facility={editingFacility} onClose={() => setEditingFacility(null)} onSuccess={loadFacilities} />
    </div>
  )
}

export default FacilityManagement