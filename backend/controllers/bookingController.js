import Booking from '../models/Booking.js'

export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body)
    return res.status(201).json(booking)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This slot was just booked by someone else. Please select another slot.',
      })
    }

    return res.status(500).json({ message: 'Server error while creating booking' })
  }
}