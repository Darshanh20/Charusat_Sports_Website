import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    facility_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    booking_date: {
      type: String,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    duration_minutes: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_approval', 'approved', 'confirmed', 'rejected', 'cancelled', 'expired'],
      required: true,
      default: 'pending_approval',
    },
    user_type_snapshot: {
      type: String,
      enum: ['internal', 'external'],
      required: true,
    },
    total_amount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
    rejection_reason: {
      type: String,
      default: null,
      trim: true,
    },
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancellation_reason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

bookingSchema.index(
  { facility_id: 1, booking_date: 1, start_time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending_approval', 'approved', 'confirmed'] },
    },
  },
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking