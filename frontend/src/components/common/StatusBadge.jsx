const badgeMap = {
  available: { label: 'Available Now', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  available_now: { label: 'Available Now', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  booking_open: { label: 'Booking Open', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  free: { label: 'FREE', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  booked: { label: 'Booked', classes: 'bg-red-100 text-red-700 border-red-200' },
  confirmed: { label: 'Confirmed', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  pending_approval: { label: 'Pending Approval', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
  awaiting_payment: { label: 'Awaiting Payment', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700 border-red-200' },
  cancelled: { label: 'Cancelled', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  blocked: { label: 'Blocked', classes: 'bg-slate-200 text-slate-700 border-slate-300' },
  maintenance: { label: 'Maintenance', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  disabled: { label: 'Disabled', classes: 'bg-slate-200 text-slate-700 border-slate-300' },
}

function StatusBadge({ status, className = '' }) {
  const key = String(status || 'available').toLowerCase().replace(/\s+/g, '_')
  const config = badgeMap[key] || { label: status || 'Status', classes: 'bg-slate-100 text-slate-700 border-slate-200' }

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${config.classes} ${className}`}>{config.label}</span>
}

export default StatusBadge