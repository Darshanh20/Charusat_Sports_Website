import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import User from '../models/User.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again later.',
  },
})

const allowedDepartments = [
  'Computer Science',
  'Information Technology',
  'Mechanical',
  'Civil',
  'Electrical',
]

const createToken = (user) =>
  jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  })

const buildAuthResponse = (user) => ({
  token: createToken(user),
  user: {
    id: user._id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  },
})

router.post('/register', async (req, res) => {
  try {
    const {
      role,
      full_name,
      email,
      password,
      university_id,
      department,
      org_name,
      gst_number,
      contact_person,
      phone,
    } = req.body

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const errors = {}

    if (!role || !['internal', 'external'].includes(role)) {
      errors.role = 'Role must be internal or external.'
    }

    if (!full_name?.trim()) {
      errors.full_name = 'Full name is required.'
    }

    if (!normalizedEmail) {
      errors.email = 'Email is required.'
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }

    if (role === 'internal') {
      if (normalizedEmail && !normalizedEmail.endsWith('@charusat.edu.in')) {
        errors.email = 'Internal member email must end with @charusat.edu.in.'
      }

      if (!university_id?.trim()) {
        errors.university_id = 'University ID is required.'
      }

      if (!department?.trim()) {
        errors.department = 'Department is required.'
      } else if (!allowedDepartments.includes(department)) {
        errors.department = 'Please select a valid department.'
      }
    }

    if (role === 'external') {
      if (!org_name?.trim()) {
        errors.org_name = 'Organisation name is required.'
      }

      if (!gst_number?.trim()) {
        errors.gst_number = 'GST number is required.'
      }

      if (!contact_person?.trim()) {
        errors.contact_person = 'Contact person name is required.'
      }

      if (!phone?.trim()) {
        errors.phone = 'Phone is required.'
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
        errors: { email: 'An account with this email already exists.' },
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      role,
      full_name: full_name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      university_id: role === 'internal' ? university_id.trim() : undefined,
      department: role === 'internal' ? department.trim() : undefined,
      org_name: role === 'external' ? org_name.trim() : undefined,
      gst_number: role === 'external' ? gst_number.trim() : undefined,
      contact_person: role === 'external' ? contact_person.trim() : undefined,
      phone: role === 'external' ? phone.trim() : undefined,
    })

    return res.status(201).json(buildAuthResponse(user))
  } catch (error) {
    return res.status(500).json({ message: 'Server error while registering user' })
  }
})

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: {
          email: !normalizedEmail ? 'Email is required.' : undefined,
          password: !password ? 'Password is required.' : undefined,
        },
      })
    }

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    return res.json(buildAuthResponse(user))
  } catch (error) {
    return res.status(500).json({ message: 'Server error while logging in' })
  }
})

router.get('/me', protect, async (req, res) => {
  return res.json({ user: req.user })
})

export default router