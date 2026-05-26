import Booking from '../models/Booking.js'
import Facility from '../models/Facility.js'
import BlockedSlot from '../models/BlockedSlot.js'

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const [totalBookings, pendingApprovals, revenueAgg, activeFacilities, activeBlocks, externalBookingsMTD] = await Promise.all([
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'pending_approval' }),
      Booking.aggregate([
        { $match: { status: 'confirmed', createdAt: { $gte: monthStart, $lt: nextMonthStart } } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } },
      ]),
      Facility.countDocuments({ is_active: true, status: 'active' }),
      BlockedSlot.countDocuments({ end_datetime: { $gt: new Date() } }),
      Booking.countDocuments({ status: 'confirmed', user_type_snapshot: 'external', createdAt: { $gte: monthStart, $lt: nextMonthStart } }),
    ])

    const revenueCollectedMTD = (revenueAgg && revenueAgg[0] && revenueAgg[0].total) || 0

    return res.json({
      totalBookings: totalBookings || 0,
      pendingApprovals: pendingApprovals || 0,
      revenueCollectedMTD: revenueCollectedMTD || 0,
      activeFacilities: activeFacilities || 0,
      activeBlocks: activeBlocks || 0,
      externalBookingsMTD: externalBookingsMTD || 0,
    })
  } catch (error) {
    console.error('getDashboardStats error:', error)
    return res.status(500).json({ message: 'Unable to load dashboard stats' })
  }
}

export default { getDashboardStats }
