import mongoose from 'mongoose'

const blockedSlotSchema = new mongoose.Schema(
  {
    facility_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    reason: {
      type: String,
      enum: ['Maintenance', 'University Event', 'Tournament', 'Other'],
      required: true,
    },
    start_datetime: {
      type: Date,
      required: true,
    },
    end_datetime: {
      type: Date,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

blockedSlotSchema.pre('validate', function validateEndTime(next) {
  if (this.end_datetime && this.start_datetime && this.end_datetime <= this.start_datetime) {
    next(new Error('End time must be after start time'))
    return
  }

  next()
})

const BlockedSlot = mongoose.model('BlockedSlot', blockedSlotSchema)

export default BlockedSlot