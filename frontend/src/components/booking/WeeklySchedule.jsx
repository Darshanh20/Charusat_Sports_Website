import { useMemo } from 'react'
import generateSlots from '../../utils/generateSlots'
import { formatDateLabel, getDateKey, getWeekDates } from '../../utils/booking'

const statusStyles = {
  available: 'bg-emerald-500 border-emerald-600 text-white',
  booked: 'bg-red-500 border-red-600 text-white',
  pending: 'bg-amber-400 border-amber-500 text-slate-900',
  blocked: 'bg-slate-300 border-slate-400 text-slate-700',
}

function LegendDot({ tone, label }) {
  const toneClasses = {
    available: 'bg-emerald-500',
    booked: 'bg-red-500',
    pending: 'bg-amber-400',
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span className={`h-2.5 w-2.5 rounded-full ${toneClasses[tone]}`} />
      {label}
    </div>
  )
}

function WeeklySchedule({ facility, selectedDate, availabilityByDate, viewMode, onViewModeChange, selectedSlots = [], setSelectedSlots, maxSlotsPerBooking = 4, loading }) {
  const timeSlots = useMemo(
    () => generateSlots(facility.operating_start, facility.operating_end, facility.slot_duration_minutes, facility.buffer_minutes),
    [facility],
  )

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate])
  const visibleDates = viewMode === 'day' ? [selectedDate] : weekDates

  const gridColumns = viewMode === 'day' ? 'grid-cols-[96px_minmax(0,1fr)]' : 'grid-cols-[96px_repeat(7,minmax(0,1fr))]'

  // helper to check if a date+slot is in the past
  const isSlotInPast = (date, slotStart) => {
    try {
      const parts = String(slotStart).split(':').map((p) => Number(p))
      const [h, m] = parts.length === 2 ? parts : [0, 0]
      const d = new Date(date)
      d.setHours(h, m, 0, 0)
      return d.getTime() < Date.now()
    } catch (e) {
      return false
    }
  }

  const timeToMins = (time) => {
    const [h, m] = String(time).split(':').map(Number)
    return h * 60 + (m || 0)
  }

  const isConsecutive = (lastSlot, newSlot, bufferMinutes) => {
    const lastEndMins = timeToMins(lastSlot.end)
    const newStartMins = timeToMins(newSlot.start)
    return newStartMins === lastEndMins + Number(bufferMinutes || 0)
  }

  const handleSlotClick = (date, slot, state) => {
    const dateKey = getDateKey(date)
    if (state !== 'available') {
      // simple toast
      alert('This slot is not available')
      return
    }

    const newSlot = { start: slot.start, end: slot.end, date: dateKey }

    const existingIndex = selectedSlots.findIndex((s) => s.date === dateKey && s.start === slot.start)

    // Case 4: clicking an already selected slot
    if (existingIndex !== -1) {
      if (existingIndex === selectedSlots.length - 1) {
        // deselect last
        setSelectedSlots(selectedSlots.slice(0, -1))
        return
      }

      // clear from this slot onwards
      setSelectedSlots(selectedSlots.slice(0, existingIndex))
      return
    }

    // Case 1: no slots selected yet
    if (selectedSlots.length === 0) {
      setSelectedSlots([newSlot])
      return
    }

    // Ensure same date as existing selection
    const lastSelected = selectedSlots[selectedSlots.length - 1]
    if (newSlot.date !== lastSelected.date) {
      setSelectedSlots([newSlot])
      alert('Slots must be consecutive. Selection reset.')
      return
    }

    // Check consecutive
    if (isConsecutive(lastSelected, newSlot, facility.buffer_minutes)) {
      if (selectedSlots.length + 1 > (maxSlotsPerBooking || 4)) {
        alert(`Maximum ${maxSlotsPerBooking} slots allowed per booking`)
        return
      }

      setSelectedSlots([...selectedSlots, newSlot])
      return
    }

    // Non-consecutive click: reset
    setSelectedSlots([newSlot])
    alert('Slots must be consecutive. Selection reset.')
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
            Loading availability
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Weekly Schedule</h2>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <LegendDot tone="available" label="Available" />
            <LegendDot tone="booked" label="Booked" />
            <LegendDot tone="pending" label="Pending" />
          </div>
        </div>

        <div className="inline-flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => onViewModeChange?.('week')}
            className={`rounded-2xl px-4 py-2 transition ${viewMode === 'week' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Week View
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('day')}
            className={`rounded-2xl px-4 py-2 transition ${viewMode === 'day' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Day View
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
        <div className={`min-w-[720px] grid ${gridColumns} bg-slate-50 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500`}>
          <div className="border-b border-slate-200 px-3 py-3">Time</div>
          {visibleDates.map((date) => (
            <div key={date.toISOString()} className="border-b border-slate-200 px-3 py-3 text-center">
              {formatDateLabel(date).toUpperCase()}
            </div>
          ))}
        </div>

        <div className="min-w-[720px] bg-white">
          {timeSlots.map((slot) => (
            <div key={slot.start} className={`grid ${gridColumns} border-b border-slate-100 last:border-b-0`}>
              <div className="flex items-center border-r border-slate-100 px-3 py-3 text-sm font-medium text-slate-700">{`${slot.start} - ${slot.end}`}</div>

              {visibleDates.map((date) => {
                const dateKey = getDateKey(date)
                const availability = availabilityByDate[dateKey]
                const slotEntry = availability?.slots?.find((entry) => entry.start === slot.start)
                const state = slotEntry?.status || 'available'
                const slotKey = `${dateKey}-${slot.start}`
                const isSelectedIndex = selectedSlots.findIndex((s) => s.date === dateKey && s.start === slot.start)
                const isSelected = isSelectedIndex !== -1
                // disabled if not available OR the slot is in the past
                const disabled = state !== 'available' || isSlotInPast(date, slot.start)

                // available but max reached (and not selected)
                const maxReached = selectedSlots.length >= (maxSlotsPerBooking || 4) && !isSelected && selectedSlots.length > 0

                return (
                  <button
                    key={slotKey}
                    type="button"
                    disabled={disabled || maxReached}
                    onClick={() => handleSlotClick(date, slot, state)}
                    title={disabled ? '' : maxReached ? 'Max slots reached' : ''}
                    className={`relative min-h-[40px] border-r border-slate-100 p-2 transition last:border-r-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-white'
                        : statusStyles[state] || 'bg-white text-slate-700'
                    } ${disabled || maxReached ? 'cursor-not-allowed opacity-85' : 'cursor-pointer hover:scale-[1.01] hover:shadow-sm'}`}
                  >
                    <div className="flex h-full min-h-[40px] items-center justify-center rounded-xl border border-transparent text-sm font-semibold">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-2">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="m5 12 4 4L19 6" />
                          </svg>
                          <span className="sr-only">Selected</span>
                          {slot.start}
                        </span>
                      ) : state === 'available' ? (
                        <span className="text-emerald-700">Available</span>
                      ) : state === 'pending' ? (
                        <span>Pending</span>
                      ) : state === 'booked' ? (
                        <span>Booked</span>
                      ) : (
                        <span>Blocked</span>
                      )}
                    </div>
                    {/* start/end labels */}
                    {isSelected && isSelectedIndex === 0 ? <div className="absolute -mt-8 text-xs font-semibold text-white">Start</div> : null}
                    {isSelected && isSelectedIndex === selectedSlots.length - 1 ? <div className="absolute -mt-8 text-xs font-semibold text-white">End</div> : null}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {viewMode === 'day' ? `Viewing ${formatDateLabel(selectedDate)}.` : `Selected week anchored on ${formatDateLabel(selectedDate)}.`}
      </div>
    </section>
  )
}

export default WeeklySchedule