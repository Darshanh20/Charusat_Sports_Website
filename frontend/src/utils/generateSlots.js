const toMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

const formatMinutes = (totalMinutes) => {
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalizedMinutes / 60)
  const minutes = normalizedMinutes % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function generateSlots(operatingStart, operatingEnd, slotDurationMinutes, bufferMinutes = 0) {
  const startMinutes = toMinutes(operatingStart)
  const endMinutes = toMinutes(operatingEnd)
  const stepMinutes = Number(slotDurationMinutes) + Number(bufferMinutes)
  const slots = []

  for (let currentMinutes = startMinutes; currentMinutes + slotDurationMinutes <= endMinutes; currentMinutes += stepMinutes) {
    slots.push({
      start: formatMinutes(currentMinutes),
      end: formatMinutes(currentMinutes + slotDurationMinutes),
      status: 'available',
    })
  }

  return slots
}

export default generateSlots