import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' })

    if (existingAdmin) {
      console.log('Admin already exists. Skipping seed.')
      return
    }

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured')
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await User.create({
      full_name: 'Sports Office Admin',
      email,
      password: hashedPassword,
      password_hash: hashedPassword,
      role: 'admin',
      is_active: true,
    })

    console.log('Admin created successfully')
  } catch (error) {
    console.error('Failed to seed admin:', error)
  }
}