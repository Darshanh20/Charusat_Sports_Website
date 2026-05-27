import { useEffect, useState } from 'react'
import api from '../../api/axios'
import FacilityModalShell from './FacilityModalShell'
import FacilityFormFields from './FacilityFormFields'

const initialForm = {
  name: '',
  subtitle: '',
  category: '',
  sport_type: '',
  location: '',
  capacity: '',
  ext_rate_per_hour: '',
  is_free_for_internal: true,
  internal_rate_per_hour: 0,
  operating_start: '',
  operating_end: '',
  slot_duration_minutes: 60,
  buffer_minutes: 0,
  max_slots_per_booking: 4,
  image_url: '',
}

const toPayload = (form) => ({
  ...form,
  subtitle: form.subtitle.trim() || null,
  capacity: Number(form.capacity),
  ext_rate_per_hour: Number(form.ext_rate_per_hour),
  is_free_for_internal: Boolean(form.is_free_for_internal),
  internal_rate_per_hour: Number(form.internal_rate_per_hour),
  slot_duration_minutes: Number(form.slot_duration_minutes),
  buffer_minutes: Number(form.buffer_minutes),
  max_slots_per_booking: Number(form.max_slots_per_booking || 4),
  image_url: form.image_url.trim() || null,
})

const isLaterTime = (startTime, endTime) => Boolean(startTime && endTime && endTime > startTime)

function AddFacilityModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm)
      setErrors({})
      setServerError('')
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setServerError('')
  }

  const validate = () => {
    const nextErrors = {}

    if (!form.name.trim()) nextErrors.name = 'Facility name is required.'
    if (!form.category) nextErrors.category = 'Category is required.'
    if (!form.sport_type.trim()) nextErrors.sport_type = 'Sport type is required.'
    if (!form.location.trim()) nextErrors.location = 'Location is required.'
    if (!form.capacity || Number(form.capacity) <= 0) nextErrors.capacity = 'Capacity is required.'
    if (!form.ext_rate_per_hour || Number(form.ext_rate_per_hour) < 0) nextErrors.ext_rate_per_hour = 'External rate is required.'
    if (form.is_free_for_internal === false && (form.internal_rate_per_hour === '' || Number(form.internal_rate_per_hour) < 0)) nextErrors.internal_rate_per_hour = 'Internal rate is required when charging internal users.'
    if (!form.operating_start) nextErrors.operating_start = 'Operating start time is required.'
    if (!form.operating_end) nextErrors.operating_end = 'Operating end time is required.'
    if (form.operating_start && form.operating_end && !isLaterTime(form.operating_start, form.operating_end)) {
      nextErrors.operating_end = 'Operating end must be later than operating start.'
    }
    if (form.slot_duration_minutes === '' || Number(form.slot_duration_minutes) < 15) nextErrors.slot_duration_minutes = 'Slot duration is required.'
    if (!form.max_slots_per_booking || Number(form.max_slots_per_booking) < 1) nextErrors.max_slots_per_booking = 'Max slots per booking is required.'
    if (form.buffer_minutes === '' || Number(form.buffer_minutes) < 0) nextErrors.buffer_minutes = 'Buffer must be zero or greater.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setLoading(true)
      setServerError('')
      await api.post('/admin/facilities', toPayload(form))
      onSuccess()
      onClose()
    } catch (error) {
      const responseErrors = error?.response?.data?.errors || {}
      setErrors((current) => ({ ...current, ...responseErrors }))
      setServerError(error?.response?.data?.message || 'Unable to add facility.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose}>
      <FacilityModalShell title="Add Facility" description="Create a new sports facility record." onClose={onClose}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FacilityFormFields form={form} errors={errors} onChange={handleChange} />
          {serverError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Adding
                </span>
              ) : (
                'Add Facility'
              )}
            </button>
          </div>
        </form>
      </FacilityModalShell>
    </div>
  )
}

export default AddFacilityModal