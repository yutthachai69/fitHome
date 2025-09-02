import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // สร้างตาราง workout_logs
    await query(`
      CREATE TABLE IF NOT EXISTS workout_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
        exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
        sets_completed INTEGER,
        reps_completed INTEGER,
        weight_kg DECIMAL(5,2),
        duration_minutes INTEGER,
        notes TEXT,
        workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // สร้าง index สำหรับการค้นหา
    await query(`
      CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_workout_logs_program_id ON workout_logs(program_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_date ON workout_logs(workout_date)
    `)

    // สร้าง trigger สำหรับ updated_at
    await query(`
      CREATE OR REPLACE FUNCTION update_workout_logs_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await query(`
      DROP TRIGGER IF EXISTS trigger_update_workout_logs_updated_at ON workout_logs
    `)

    await query(`
      CREATE TRIGGER trigger_update_workout_logs_updated_at
      BEFORE UPDATE ON workout_logs
      FOR EACH ROW
      EXECUTE FUNCTION update_workout_logs_updated_at()
    `)

    return NextResponse.json({
      message: 'สร้างตาราง workout_logs เรียบร้อยแล้ว'
    })

  } catch (error) {
    console.error('Error creating workout_logs table:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

