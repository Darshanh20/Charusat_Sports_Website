import mongoose from 'mongoose'

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: null,
      trim: true,
    },
    category: {
      type: String,
      enum: ['indoor', 'outdoor'],
      required: true,
    },
    sport_type: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    ext_rate_per_hour: {
      type: Number,
      required: true,
    },
    operating_start: {
      type: String,
      required: true,
    },
    operating_end: {
      type: String,
      required: true,
    },
    slot_duration_minutes: {
      type: Number,
      required: true,
      default: 60,
    },
    buffer_minutes: {
      type: Number,
      default: 0,
    },
    is_free_for_internal: {
      type: Boolean,
      default: true,
    },
    internal_rate_per_hour: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'disabled'],
      default: 'active',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    image_url: {
      type: String,
      default: null,
      trim: true,
    },
    icon_type: {
      type: String,
      default: null,
      trim: true,
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

const Facility = mongoose.model('Facility', facilitySchema)

export default Facility