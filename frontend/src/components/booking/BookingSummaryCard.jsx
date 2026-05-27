import StatusBadge from '../common/StatusBadge'
import { formatCurrency, formatLongDate } from '../../utils/booking'

function BookingSummaryCard({ facility, user, selectedDate, selectedSlots = [], selectedAddOns, onConfirm, loading, message, onRequestQuote }) {
  const slotDuration = Number(facility?.slot_duration_minutes || 60)
  const totalSlots = selectedSlots?.length || 0
  const durationMinutes = totalSlots * slotDuration
  const durationHours = durationMinutes / 60
  const isInternal = user?.role === 'internal'
  const isFreeForInternal = isInternal && facility?.is_free_for_internal

  const baseFee = (() => {
    if (totalSlots === 0) return 0
    if (isFreeForInternal) return 0
    if (isInternal) return Number(facility?.internal_rate_per_hour || 0) * durationHours
    return Number(facility?.ext_rate_per_hour || 0) * durationHours
  })()

  const addOnTotal = selectedAddOns?.reduce((total, item) => total + Number(item?.price || 0), 0) || 0
  const total = baseFee + addOnTotal
  const startTime = totalSlots > 0 ? selectedSlots[0].start : ''
  const endTime = totalSlots > 0 ? selectedSlots[totalSlots - 1].end : ''

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isInternal ? (
        <div className="absolute right-[-42px] top-6 rotate-45 bg-emerald-600 px-12 py-1 text-[10px] font-bold tracking-[0.24em] text-white shadow-lg">
          STUDENT BENEFIT APPLIED
        </div>
      ) : null}

      <div className="border-b border-slate-200 bg-emerald-600 px-5 py-4 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.16em]">Your Booking</p>
      </div>

      <div className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-semibold text-slate-900">{facility?.name || 'Select a facility'}</p>
            <p className="mt-1 text-sm text-slate-500">{facility?.location || ''}</p>
          </div>
          <StatusBadge status={selectedSlots && selectedSlots.length ? 'available' : 'pending'} />
        </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <Row label="Selected Date" value={selectedDate ? formatLongDate(selectedDate) : 'Select a date'} />
          <Row label="Slot Time" value={totalSlots ? `${startTime} - ${endTime} (${totalSlots} slot${totalSlots > 1 ? 's' : ''} · ${durationHours} hour${durationHours > 1 ? 's' : ''})` : 'Select slots from the schedule'} />
          <Row label="Base Fee" value={totalSlots ? (isFreeForInternal ? '₹0' : formatCurrency(baseFee)) : '₹0'} />
          <Row label="Add-ons" value={formatCurrency(addOnTotal)} />
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold">
            <span className="text-slate-700">Total Amount</span>
            <span className={isFreeForInternal ? 'text-emerald-700' : 'text-slate-900'}>{totalSlots && isFreeForInternal ? 'FREE' : formatCurrency(total)}</span>
          </div>
          {isFreeForInternal ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Student benefit applied</p> : null}
        </div>

        {message ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div> : null}

        <button
          type="button"
          disabled={!(selectedSlots && selectedSlots.length) || loading}
          onClick={() => onConfirm?.(selectedSlots)}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Confirming...' : (selectedSlots && selectedSlots.length ? 'CONFIRM BOOKING' : 'Select slots first')}
        </button>

        <p className="text-xs text-slate-500">By clicking confirm, you agree to the University Sports Code of Conduct</p>

        {!isInternal ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">External Booking View</p>
            <p className="mt-2 text-sm text-slate-600">Organisation price per hour: {formatCurrency(facility?.ext_rate_per_hour || 0)}</p>
            <button type="button" onClick={onRequestQuote} className="mt-4 inline-flex rounded-2xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white">
              Request Quote
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  )
}

export default BookingSummaryCard