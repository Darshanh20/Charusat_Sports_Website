import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    password_hash: {
      type: String,
    },
    role: {
      type: String,
      enum: ['internal', 'external', 'admin'],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    university_id: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    org_name: {
      type: String,
      trim: true,
    },
    gst_number: {
      type: String,
      trim: true,
    },
    contact_person: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)

export default User