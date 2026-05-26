import mongoose from 'mongoose'
import Facility from '../models/Facility.js'

const facilities = [
  {
    name: 'Cricket Ground',
    subtitle: 'Main Campus Arena',
    category: 'outdoor',
    sport_type: 'Cricket',
    location: 'North Campus',
    capacity: 22,
    ext_rate_per_hour: 2000,
    operating_start: '06:00',
    operating_end: '21:00',
    slot_duration_minutes: 120,
    buffer_minutes: 15,
  },
  {
    name: 'Badminton Court 1',
    subtitle: 'Indoor Multi-sport Hall',
    category: 'indoor',
    sport_type: 'Badminton',
    location: 'Sports Complex Block A',
    capacity: 4,
    ext_rate_per_hour: 500,
    operating_start: '06:00',
    operating_end: '22:00',
    slot_duration_minutes: 60,
    buffer_minutes: 10,
  },
  {
    name: 'Table Tennis Hall',
    subtitle: 'Recreation Center',
    category: 'indoor',
    sport_type: 'Table Tennis',
    location: 'Sports Complex Block B',
    capacity: 4,
    ext_rate_per_hour: 200,
    operating_start: '08:00',
    operating_end: '20:00',
    slot_duration_minutes: 30,
    buffer_minutes: 5,
  },
  {
    name: 'Gymnasium',
    subtitle: 'Fitness Center',
    category: 'indoor',
    sport_type: 'Gymnasium',
    location: 'Main Building Ground Floor',
    capacity: 30,
    ext_rate_per_hour: 300,
    operating_start: '06:00',
    operating_end: '21:00',
    slot_duration_minutes: 60,
    buffer_minutes: 0,
  },
]

const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return
  }

  const mongoUri = process.env.MONGO_URI

  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured')
  }

  await mongoose.connect(mongoUri)
}

export async function seedFacilities() {
  try {
    await ensureConnection()

    const existingFacilities = await Facility.countDocuments()

    if (existingFacilities > 0) {
      console.log('Facilities already exist. Skipping seed.')
      return
    }

    const createdBy = new mongoose.Types.ObjectId()

    await Facility.insertMany(
      facilities.map((facility) => ({
        ...facility,
        created_by: createdBy,
      })),
    )

    console.log('Facilities seeded successfully')
  } catch (error) {
    console.error('Failed to seed facilities:', error)
  }
}