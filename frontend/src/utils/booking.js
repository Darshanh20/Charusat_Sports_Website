const pad = (value) => String(value).padStart(2, '0')

const toDate = (value) => (value instanceof Date ? new Date(value.getTime()) : new Date(value))

export const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

export const getDateKey = (value) => {
  const date = toDate(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const formatDateLabel = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(toDate(value))

export const formatLongDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(toDate(value))

export const formatCalendarDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(toDate(value))

export const formatMonthYear = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(toDate(value))

export const formatShortMonthDay = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: '2-digit',
  }).format(toDate(value))

export const formatTimeLabel = (value) => {
  const date = toDate(value)
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export const addMinutesToTime = (timeString, minutesToAdd) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + Number(minutesToAdd || 0)
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440
  const nextHours = Math.floor(normalizedMinutes / 60)
  const nextMinutes = normalizedMinutes % 60

  return `${pad(nextHours)}:${pad(nextMinutes)}`
}

const toMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

export const humanizeDuration = (minutes) => {
  if (!minutes) {
    return '1 Hour session'
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return `${hours} Hour session`
  }

  return `${minutes} min session`
}

export const getDurationOptions = (facility) => {
  if (!facility?.operating_start || !facility?.operating_end) {
    return [{ value: 1, label: '1 Hour session' }]
  }

  const slotMinutes = Number(facility.slot_duration_minutes || 60)
  const operatingMinutes = Math.max(0, toMinutes(facility.operating_end) - toMinutes(facility.operating_start))
  const maxSessions = Math.max(1, Math.floor(operatingMinutes / slotMinutes))

  return Array.from({ length: maxSessions }, (_, index) => {
    const sessions = index + 1
    return {
      value: sessions,
      label: humanizeDuration(slotMinutes * sessions),
    }
  })
}

export const getWeekDates = (anchorDate) => {
  const anchor = toDate(anchorDate)
  anchor.setHours(0, 0, 0, 0)

  const currentDay = anchor.getDay()
  const offset = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() + offset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
}

export const getMonthGrid = (anchorDate) => {
  const anchor = toDate(anchorDate)
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const startDate = new Date(year, month, 1 - startOffset)
  const weeks = []

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week = []

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + weekIndex * 7 + dayIndex)
      week.push(date)
    }

    weeks.push(week)
  }

  return weeks
}

export const isSameDate = (left, right) => getDateKey(left) === getDateKey(right)

export const formatSlotRange = (startTime, endTime) => `${startTime} - ${endTime}`