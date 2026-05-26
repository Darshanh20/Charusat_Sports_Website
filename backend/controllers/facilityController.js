import Facility from '../models/Facility.js'
import BlockedSlot from '../models/BlockedSlot.js'
import Booking from '../models/Booking.js'
import generateSlots from '../utils/generateSlots.js'

const toMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

const hasValidOperatingWindow = (operatingStart, operatingEnd) => toMinutes(operatingEnd) > toMinutes(operatingStart)

const parseDateTime = (dateString, timeString) => new Date(`${dateString}T${timeString}:00`)

const isBookingOverlap = (slotStart, slotEnd, booking) => {
  const bookingStart = toMinutes(booking.start_time)
  const bookingEnd = toMinutes(booking.end_time)
  return slotStart < bookingEnd && slotEnd > bookingStart
}

const isBlockedOverlap = (slotStartDateTime, slotEndDateTime, blockedSlot) =>
  blockedSlot.start_datetime < slotEndDateTime && blockedSlot.end_datetime > slotStartDateTime

const sendError = (res, error) => res.status(500).json({ message: 'Something went wrong' })

export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ is_active: true, status: 'active' }).sort({ createdAt: -1 })
    return res.json(facilities)
  } catch (error) {
    return sendError(res, error)
  }
}

export const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    return res.json(facility)
  } catch (error) {
    return sendError(res, error)
  }
}

export const createFacility = async (req, res) => {
  try {
    const {
      name,
      subtitle,
      category,
      sport_type,
      location,
      capacity,
      ext_rate_per_hour,
      is_free_for_internal,
      internal_rate_per_hour,
      operating_start,
      operating_end,
      slot_duration_minutes = 60,
      buffer_minutes = 0,
      image_url,
      icon_type,
    } = req.body

    if (!hasValidOperatingWindow(operating_start, operating_end)) {
      return res.status(400).json({ message: 'Operating end must be later than operating start' })
    }

    const facility = await Facility.create({
      name,
      subtitle: subtitle ?? null,
      category,
      sport_type,
      location,
      capacity,
      ext_rate_per_hour,
      is_free_for_internal: is_free_for_internal ?? true,
      internal_rate_per_hour: internal_rate_per_hour ?? 0,
      operating_start,
      operating_end,
      slot_duration_minutes,
      buffer_minutes,
      image_url: image_url ?? null,
      icon_type: icon_type ?? null,
      created_by: req.user._id,
    })

    return res.status(201).json(facility)
  } catch (error) {
    return sendError(res, error)
  }
}

export const updateFacility = async (req, res) => {
  try {
    const {
      name,
      subtitle,
      category,
      sport_type,
      location,
      capacity,
      ext_rate_per_hour,
      is_free_for_internal,
      internal_rate_per_hour,
      operating_start,
      operating_end,
      slot_duration_minutes = 60,
      buffer_minutes = 0,
      image_url,
      icon_type,
    } = req.body

    if (!hasValidOperatingWindow(operating_start, operating_end)) {
      return res.status(400).json({ message: 'Operating end must be later than operating start' })
    }

    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      {
        name,
        subtitle: subtitle ?? null,
        category,
        sport_type,
        location,
        capacity,
        ext_rate_per_hour,
        is_free_for_internal: is_free_for_internal ?? true,
        internal_rate_per_hour: internal_rate_per_hour ?? 0,
        operating_start,
        operating_end,
        slot_duration_minutes,
        buffer_minutes,
        image_url: image_url ?? null,
        icon_type: icon_type ?? null,
      },
      { new: true, runValidators: true },
    )

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    return res.json(facility)
  } catch (error) {
    return sendError(res, error)
  }
}

export const toggleFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    facility.is_active = !facility.is_active
    await facility.save()

    return res.json({
      message: facility.is_active ? 'Facility activated' : 'Facility deactivated',
      facility,
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export const deleteFacility = async (req, res) => {
  try {
    const bookingCount = await Booking.countDocuments({
      facility_id: req.params.id,
      status: { $in: ['pending_approval', 'approved', 'confirmed'] },
    })

    if (bookingCount > 0) {
      return res.status(409).json({
        message: 'This facility has existing bookings and cannot be deleted.',
      })
    }

    await BlockedSlot.deleteMany({ facility_id: req.params.id })

    const facility = await Facility.findByIdAndDelete(req.params.id)

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    return res.json({ message: 'Facility deleted successfully' })
  } catch (error) {
    return sendError(res, error)
  }
}

export const createBlockedSlot = async (req, res) => {
  try {
    const { facility_id, reason, start_datetime, end_datetime } = req.body

    if (!start_datetime || !end_datetime || new Date(end_datetime) <= new Date(start_datetime)) {
      return res.status(400).json({ message: 'End time must be after start time' })
    }

    const block = await BlockedSlot.create({
      facility_id,
      reason,
      start_datetime,
      end_datetime,
      created_by: req.user._id,
    })

    return res.status(201).json(block)
  } catch (error) {
    console.error('createBlockedSlot error:', error)

    if (error.message === 'End time must be after start time') {
      return res.status(400).json({ message: error.message })
    }

    // Return the actual error message to help debug client-side.
    return res.status(500).json({ message: error.message || 'Something went wrong' })
  }
}

export const getBlockedSlots = async (req, res) => {
  try {
    const blockedSlots = await BlockedSlot.find({ facility_id: req.params.facilityId })
      .populate('facility_id', 'name')
      .sort({ start_datetime: -1 })

    return res.json(blockedSlots)
  } catch (error) {
    return sendError(res, error)
  }
}

export const removeBlockedSlot = async (req, res) => {
  try {
    const block = await BlockedSlot.findByIdAndDelete(req.params.blockId)

    if (!block) {
      return res.status(404).json({ message: 'Blocked slot not found' })
    }

    return res.json({ message: 'Block removed successfully' })
  } catch (error) {
    return sendError(res, error)
  }
}

export const getAllFacilitiesAdmin = async (req, res) => {
  try {
    const [facilities, total, active, maintenance, disabled] = await Promise.all([
      Facility.find().sort({ createdAt: -1 }),
      Facility.countDocuments(),
      Facility.countDocuments({ status: 'active' }),
      Facility.countDocuments({ status: 'maintenance' }),
      Facility.countDocuments({ status: 'disabled' }),
    ])

    const activeBlocks = await BlockedSlot.countDocuments()

    return res.json({ total, active, maintenance, disabled, activeBlocks, facilities })
  } catch (error) {
    return sendError(res, error)
  }
}

export const getFacilityAvailability = async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query

    if (!date) {
      return res.status(400).json({ message: 'date query parameter is required' })
    }

    const facility = await Facility.findById(id)

    if (!facility || !facility.is_active) {
      return res.status(404).json({ message: 'Facility not found' })
    }

    const generatedSlots = generateSlots(
      facility.operating_start,
      facility.operating_end,
      facility.slot_duration_minutes,
      facility.buffer_minutes,
    )

    // Placeholder query structure for bookings collection:
    // const bookings = await Booking.find({
    //   facility_id: facility._id,
    //   booking_date: date,
    //   status: { $in: ['pending_approval', 'approved', 'confirmed'] },
    // })
    const bookings = await Booking.find({
      facility_id: facility._id,
      booking_date: date,
      status: { $in: ['pending_approval', 'approved', 'confirmed'] },
    }).select('start_time end_time status')

    const dayStart = new Date(`${date}T00:00:00`)
    const dayEnd = new Date(`${date}T23:59:59.999`)

    const blockedSlots = await BlockedSlot.find({
      facility_id: facility._id,
      start_datetime: { $lt: dayEnd },
      end_datetime: { $gt: dayStart },
    }).select('start_datetime end_datetime reason')

    const slots = generatedSlots.map((slot) => {
      const slotStartMinutes = toMinutes(slot.start)
      const slotEndMinutes = toMinutes(slot.end)
      const slotStartDateTime = parseDateTime(date, slot.start)
      const slotEndDateTime = parseDateTime(date, slot.end)

      const isBooked = bookings.some((booking) => isBookingOverlap(slotStartMinutes, slotEndMinutes, booking))
      const isBlocked = blockedSlots.some((blockedSlot) => isBlockedOverlap(slotStartDateTime, slotEndDateTime, blockedSlot))

      if (isBooked) {
        return { ...slot, status: 'booked' }
      }

      if (isBlocked) {
        return { ...slot, status: 'blocked' }
      }

      return slot
    })

    return res.json({
      facility_id: facility._id,
      facility_name: facility.name,
      date,
      slot_duration_minutes: facility.slot_duration_minutes,
      buffer_minutes: facility.buffer_minutes,
      slots,
    })
  } catch (error) {
    return sendError(res, error)
  }
}

export const calculateBookingAmount = (facility, userRole, durationHours) => {
  if (userRole === 'internal') {
    if (facility.is_free_for_internal) {
      return 0
    } else {
      return (facility.internal_rate_per_hour || 0) * durationHours
    }
  }

  if (userRole === 'external') {
    return (facility.ext_rate_per_hour || 0) * durationHours
  }

  return 0
}