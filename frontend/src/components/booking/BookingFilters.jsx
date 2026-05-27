import { useMemo, useState } from 'react'
import { formatMonthYear, getMonthGrid, getDateKey, isSameDate } from '../../utils/booking'

const addOns = [
  { id: 'badminton_rackets', label: 'Badminton Rackets x2', price: 0 },
  { id: 'shuttlecocks_pack', label: 'Shuttlecocks Pack of 3', price: 0 },
]

const rules = ['Non-marking shoes mandatory', 'Carry a valid ID card', 'No outside food or drinks']

function ChevronButton({ direction, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full border text-slate-600 transition ${disabled ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 hover:border-emerald-200 hover:text-emerald-700'}`}
      aria-disabled={disabled}
    >
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${direction === 'left' ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  )
}

function BookingFilters({ facility, selectedDate, onDateChange, selectedAddOns, onToggleAddOn }) {
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(selectedDate || new Date()))

  const monthGrid = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = getDateKey(new Date())
  const isCalendarMonthBeforeCurrent = (() => {
    const cm = calendarMonth
    const cur = new Date()
    return cm.getFullYear() < cur.getFullYear() || (cm.getFullYear() === cur.getFullYear() && cm.getMonth() < cur.getMonth())
  })()

  return (
    <aside className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v3" />
            <path d="M16 3v3" />
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 10h18" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Booking Filters</h2>
          <p className="text-sm text-slate-500">Refine your date and duration</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Select Date Range</p>
          <div className="flex items-center gap-2">
            <ChevronButton
              direction="left"
              onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              disabled={isCalendarMonthBeforeCurrent}
            />
            <ChevronButton direction="right" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-700">{formatMonthYear(calendarMonth)}</p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Today</span>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => <div key={day}>{day}</div>)}
        </div>

        <div className="mt-3 space-y-2">
            {monthGrid.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day) => {
                const inMonth = day.getMonth() === calendarMonth.getMonth()
                const isSelected = isSameDate(day, selectedDate)
                  const isToday = getDateKey(day) === todayKey
                  const dayCopy = new Date(day)
                  dayCopy.setHours(0, 0, 0, 0)
                  const isPastDay = dayCopy < today

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => !isPastDay && onDateChange?.(day)}
                      disabled={isPastDay}
                      aria-disabled={isPastDay}
                      className={`flex h-11 flex-col items-center justify-center rounded-2xl border text-xs transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : isPastDay
                            ? 'border-transparent bg-slate-50 text-slate-300 cursor-not-allowed'
                            : inMonth
                              ? 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
                              : 'border-transparent bg-slate-50 text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{day.getDate()}</span>
                      {isToday && !isSelected ? <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" /> : null}
                    </button>
                  )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Duration dropdown removed — selection now via schedule grid */}

      <div>
        <p className="text-sm font-semibold text-slate-700">Facility Rules</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {rules.map((rule) => <li key={rule} className="rounded-2xl bg-slate-50 px-4 py-3">{rule}</li>)}
        </ul>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">Stadium Location</p>
        <div className="mt-3 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-4 text-sm text-slate-600">
          <div className="h-36 rounded-2xl bg-[linear-gradient(135deg,_rgba(5,150,105,0.12),_rgba(255,255,255,0.95))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Map Preview</p>
            <p className="mt-3 max-w-sm leading-6">{facility?.location || 'Location details will appear here.'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default BookingFilters