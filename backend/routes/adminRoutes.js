import express from 'express'
import { getDashboardStats } from '../controllers/adminController.js'
import protect, { isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/dashboard/stats', protect, isAdmin, getDashboardStats)

export default router
