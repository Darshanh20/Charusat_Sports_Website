import express from 'express'
import protect from '../middleware/authMiddleware.js'
import { createBooking, getMyBookings } from '../controllers/bookingController.js'

const router = express.Router()

router.get('/bookings/mine', protect, getMyBookings)
router.post('/bookings', protect, createBooking)

export default router