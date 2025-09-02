import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // สร้างตาราง workout_programs
    await query(`
      CREATE TABLE IF NOT EXISTS workout_programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20) NOT NULL,
        duration_weeks INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // สร้างตาราง workout_exercises
    await query(`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        muscle_group VARCHAR(100),
        equipment VARCHAR(100),
        difficulty VARCHAR(20) NOT NULL,
        instructions TEXT,
        video_url VARCHAR(500),
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // สร้างตาราง program_exercises
    await query(`
      CREATE TABLE IF NOT EXISTS program_exercises (
        id SERIAL PRIMARY KEY,
        program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES workout_exercises(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        sets INTEGER,
        reps INTEGER,
        duration_minutes INTEGER,
        rest_seconds INTEGER,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Ensure a unique index exists to support ON CONFLICT in seed-workout-data
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_program_exercises_unique
      ON program_exercises (program_id, exercise_id, day_of_week, order_index)
    `)

    // สร้างตาราง user_active_programs
    await query(`
      CREATE TABLE IF NOT EXISTS user_active_programs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
        start_date DATE DEFAULT CURRENT_DATE,
        current_week INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    return NextResponse.json({ 
      message: 'สร้างตารางโปรแกรมการออกกำลังกายเรียบร้อยแล้ว'
    })
  } catch (error) {
    console.error('Error creating tables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}

