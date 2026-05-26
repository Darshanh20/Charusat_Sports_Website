import express from 'express'
import {
	createBlockedSlot,
	createFacility,
	deleteFacility,
	getAllFacilities,
	getAllFacilitiesAdmin,
	getBlockedSlots,
	getFacilityAvailability,
	getFacilityById,
	removeBlockedSlot,
	toggleFacility,
	updateFacility,
} from '../controllers/facilityController.js'
import protect, { isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/facilities', getAllFacilities)
router.get('/facilities/:id', getFacilityById)
router.get('/facilities/:id/availability', getFacilityAvailability)

router.post('/admin/facilities', protect, isAdmin, createFacility)
router.put('/admin/facilities/:id', protect, isAdmin, updateFacility)
router.patch('/admin/facilities/:id/toggle', protect, isAdmin, toggleFacility)
router.delete('/admin/facilities/:id', protect, isAdmin, deleteFacility)
router.post('/admin/facilities/block', protect, isAdmin, createBlockedSlot)
router.get('/admin/facilities/blocks/:facilityId', protect, isAdmin, getBlockedSlots)
router.delete('/admin/facilities/blocks/:blockId', protect, isAdmin, removeBlockedSlot)
router.get('/admin/facilities/all', protect, isAdmin, getAllFacilitiesAdmin)

export default router