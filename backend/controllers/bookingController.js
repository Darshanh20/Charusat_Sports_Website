import Booking from '../models/Booking.js'
import Facility from '../models/Facility.js'

function parseDateStringToLocalMidnight(dateStr) {
  // Expecting YYYY-MM-DD
  const parts = String(dateStr).split('-').map((p) => Number(p))
  if (parts.length !== 3) return null
  const [y, m, d] = parts
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

export const createBooking = async (req, res) => {
  try {
    const { facility_id, booking_date, start_time, end_time, duration_minutes, notes, selectedSlots } = req.body || {}

    // If client sent selectedSlots array, use that
    if (Array.isArray(selectedSlots) && selectedSlots.length > 0) {
      // all slots must belong to same date
      const slotDates = Array.from(new Set(selectedSlots.map((s) => s.date)))
      if (slotDates.length !== 1) {
        return res.status(400).json({ message: 'All selected slots must be on the same date.' })
      }

      const date = slotDates[0]

      const facility = await Facility.findById(facility_id).lean()
      if (!facility) return res.status(404).json({ message: 'Facility not found.' })

      // enforce max slots per booking
      const maxAllowed = facility.max_slots_per_booking || 4
      if (selectedSlots.length > maxAllowed) {
        return res.status(400).json({ message: `Maximum ${maxAllowed} slots allowed per booking.` })
      }

      // check for conflicts by matching any start_time
      const startTimes = selectedSlots.map((s) => s.start)
      const conflict = await Booking.findOne({
        facility_id,
        booking_date: date,
        start_time: { $in: startTimes },
        status: { $in: ['pending_approval', 'approved', 'confirmed'] },
      })
      if (conflict) {
        return res.status(409).json({ message: 'One or more selected slots are no longer available.' })
      }

      const first = selectedSlots[0]
      const last = selectedSlots[selectedSlots.length - 1]
      const totalDuration = selectedSlots.length * (facility.slot_duration_minutes || 60)

      const bookingDoc = new Booking({
        user_id: req.user._id,
        facility_id,
        booking_date: date,
        start_time: first.start,
        end_time: last.end,
        duration_minutes: Number(totalDuration),
        user_type_snapshot: req.user.role || 'external',
        total_amount: 0,
        notes: notes || null,
      })

      const saved = await bookingDoc.save()
      return res.status(201).json(saved)
    }

    // Fallback: single-slot style (legacy)
    if (!facility_id || !booking_date || !start_time || !end_time || !duration_minutes) {
      return res.status(400).json({ message: 'Missing required booking fields.' })
    }

    const bookingDateObj = parseDateStringToLocalMidnight(booking_date)
    if (!bookingDateObj) {
      return res.status(400).json({ message: 'Invalid booking_date format. Use YYYY-MM-DD.' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (bookingDateObj < today) {
      return res.status(400).json({ message: 'Cannot create bookings for past dates.' })
    }

    // Optional: verify facility exists
    const facility = await Facility.findById(facility_id).lean()
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found.' })
    }

    // Build booking document
    const bookingDoc = new Booking({
      user_id: req.user._id,
      facility_id,
      booking_date,
      start_time,
      end_time,
      duration_minutes: Number(duration_minutes),
      user_type_snapshot: req.user.role || 'external',
      total_amount: 0,
      notes: notes || null,
    })

    const saved = await bookingDoc.save()

    return res.status(201).json(saved)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This slot was just booked by someone else. Please select another slot.',
      })
    }

    console.error('createBooking error:', error)
    return res.status(500).json({ message: 'Server error while creating booking' })
  }
}

export const getMyBookings = async (req, res) => {
  try {
    const rows = await Booking.find({ user_id: req.user._id }).populate('facility_id').sort({ createdAt: -1 })
    return res.json(rows)
  } catch (error) {
    console.error('getMyBookings error:', error)
    return res.status(500).json({ message: 'Server error while loading bookings' })
  }
}