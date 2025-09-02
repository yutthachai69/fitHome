import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // สร้างตารางทีละตัว
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        height_cm INTEGER,
        gender VARCHAR(10),
        birth_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        start_date DATE DEFAULT CURRENT_DATE,
        start_weight_kg DECIMAL(5,2) NOT NULL,
        target_weight_kg DECIMAL(5,2) NOT NULL,
        target_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS weight_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE DEFAULT CURRENT_DATE,
        weight_kg DECIMAL(5,2) NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )`,
      
      `CREATE TABLE IF NOT EXISTS workout_programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(20) NOT NULL,
        duration_weeks INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS workout_exercises (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS program_exercises (
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
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_workout_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
        exercise_id INTEGER REFERENCES workout_exercises(id) ON DELETE CASCADE,
        workout_date DATE DEFAULT CURRENT_DATE,
        sets_completed INTEGER,
        reps_completed INTEGER,
        duration_minutes INTEGER,
        weight_kg DECIMAL(5,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_active_programs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
        start_date DATE DEFAULT CURRENT_DATE,
        current_week INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ]

    // สร้างตารางทีละตัว
    for (const tableSQL of tables) {
      await query(tableSQL)
    }

    // สร้าง indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date)',
      'CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_program_exercises_program_day ON program_exercises(program_id, day_of_week)',
      'CREATE INDEX IF NOT EXISTS idx_user_workout_progress_user_date ON user_workout_progress(user_id, workout_date)',
      'CREATE INDEX IF NOT EXISTS idx_user_active_programs_user_active ON user_active_programs(user_id, is_active)'
    ]

    for (const indexSQL of indexes) {
      await query(indexSQL)
    }

    // สร้าง function และ trigger
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    await query('DROP TRIGGER IF EXISTS update_users_updated_at ON users')
    await query(`
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    // เพิ่มข้อมูลตัวอย่าง
    const exercises = [
      { name: 'Burpees', description: 'ท่าออกกำลังกายแบบเต็มตัวที่ช่วยเผาผลาญไขมัน', muscle_group: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate', instructions: '1. ยืนตรง 2. นั่งยองๆ 3. วางมือลงพื้น 4. กระโดดกลับไปท่า plank 5. กระโดดกลับมาท่า squat 6. กระโดดขึ้นพร้อมยกมือ' },
      { name: 'Jumping Jacks', description: 'ท่ากระโดดตบที่ช่วยเผาผลาญไขมันและเพิ่มอัตราการเต้นของหัวใจ', muscle_group: 'full_body', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. กระโดดพร้อมแยกขาและยกมือขึ้น 3. กระโดดกลับมาท่าเริ่มต้น' },
      { name: 'Mountain Climbers', description: 'ท่าที่ช่วยเผาผลาญไขมันและเสริมความแข็งแรงของแกนกลาง', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. อยู่ในท่า plank 2. ดึงเข่าข้างหนึ่งเข้ามาหาอก 3. สลับข้างอย่างรวดเร็ว' },
      { name: 'High Knees', description: 'ท่ากระโดดเข่าสูงที่ช่วยเผาผลาญไขมัน', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. กระโดดเข่าสูงสลับข้าง 3. ใช้แขนช่วยในการเคลื่อนไหว' },
      { name: 'Push-ups', description: 'ท่าวิดพื้นที่ช่วยเสริมความแข็งแรงของอก แขน และไหล่', muscle_group: 'chest', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. อยู่ในท่า plank 2. ลดตัวลงโดยงอข้อศอก 3. ดันตัวขึ้นกลับมาท่าเริ่มต้น' },
      { name: 'Squats', description: 'ท่าลุกนั่งที่ช่วยเสริมความแข็งแรงของขาและก้น', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนแยกขากว้างเท่าหัวไหล่ 2. นั่งยองๆ เหมือนนั่งเก้าอี้ 3. ลุกขึ้นกลับมาท่าเริ่มต้น' },
      { name: 'Lunges', description: 'ท่าก้าวยาวที่ช่วยเสริมความแข็งแรงของขา', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. ก้าวขาข้างหนึ่งไปข้างหน้า 3. ลดตัวลงจนเข่าหลังเกือบแตะพื้น 4. ดันตัวขึ้นกลับมาท่าเริ่มต้น' },
      { name: 'Plank', description: 'ท่าค้างที่ช่วยเสริมความแข็งแรงของแกนกลาง', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. อยู่ในท่า push-up แต่ใช้แขนงอ 2. ค้างไว้โดยให้ลำตัวเป็นเส้นตรง' },
      { name: 'Running in Place', description: 'วิ่งอยู่กับที่เพื่อเพิ่มอัตราการเต้นของหัวใจ', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. วิ่งอยู่กับที่โดยยกเข่าสูง' },
      { name: 'Butterfly Kicks', description: 'ท่าเตะขาสลับที่ช่วยเผาผลาญไขมัน', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. นอนหงาย 2. ยกขาขึ้นเล็กน้อย 3. เตะขาสลับข้างอย่างรวดเร็ว' },
      { name: 'Star Jumps', description: 'ท่ากระโดดดาวที่ช่วยเผาผลาญไขมัน', muscle_group: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate', instructions: '1. ยืนตรง 2. กระโดดพร้อมแยกขาและแขนออกเป็นรูปดาว 3. กระโดดกลับมาท่าเริ่มต้น' },
      { name: 'Cat-Cow Stretch', description: 'ท่ายืดหลังที่ช่วยเพิ่มความยืดหยุ่น', muscle_group: 'back', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. คุกเข่าบนพื้น 2. วางมือลงพื้น 3. โค้งหลังขึ้น (cat) 4. แอ่นหลังลง (cow)' },
      { name: 'Child\'s Pose', description: 'ท่ายืดหลังและไหล่', muscle_group: 'back', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. คุกเข่าบนพื้น 2. นั่งบนส้นเท้า 3. โน้มตัวไปข้างหน้าพร้อมยืดแขน' },
      { name: 'Hamstring Stretch', description: 'ท่ายืดกล้ามเนื้อหลังขา', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. นั่งบนพื้น 2. ยืดขาตรง 3. โน้มตัวไปข้างหน้าพยายามแตะปลายเท้า' }
    ]

    for (const exercise of exercises) {
      await query(
        `INSERT INTO workout_exercises (name, description, muscle_group, equipment, difficulty, instructions)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO NOTHING`,
        [exercise.name, exercise.description, exercise.muscle_group, exercise.equipment, exercise.difficulty, exercise.instructions]
      )
    }

    const programs = [
      { name: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', description: 'โปรแกรม 4 สัปดาห์สำหรับผู้ที่ต้องการลดน้ำหนักและเริ่มต้นการออกกำลังกาย', difficulty: 'beginner', duration_weeks: 4, category: 'weight_loss' },
      { name: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', description: 'โปรแกรม 6 สัปดาห์สำหรับการสร้างกล้ามเนื้อและความแข็งแรง', difficulty: 'beginner', duration_weeks: 6, category: 'muscle_gain' },
      { name: 'โปรแกรมคาร์ดิโอเข้มข้น', description: 'โปรแกรม 3 สัปดาห์สำหรับการเผาผลาญไขมันอย่างรวดเร็ว', difficulty: 'intermediate', duration_weeks: 3, category: 'cardio' },
      { name: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', description: 'โปรแกรม 2 สัปดาห์สำหรับการยืดกล้ามเนื้อและผ่อนคลาย', difficulty: 'beginner', duration_weeks: 2, category: 'flexibility' },
      { name: 'โปรแกรมลดน้ำหนักขั้นสูง', description: 'โปรแกรม 8 สัปดาห์สำหรับผู้ที่มีประสบการณ์การออกกำลังกาย', difficulty: 'advanced', duration_weeks: 8, category: 'weight_loss' },
      { name: 'โปรแกรมสร้างกล้ามเนื้อขั้นสูง', description: 'โปรแกรม 12 สัปดาห์สำหรับการสร้างกล้ามเนื้ออย่างเต็มรูปแบบ', difficulty: 'advanced', duration_weeks: 12, category: 'muscle_gain' }
    ]

    for (const program of programs) {
      await query(
        `INSERT INTO workout_programs (name, description, difficulty, duration_weeks, category)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO NOTHING`,
        [program.name, program.description, program.difficulty, program.duration_weeks, program.category]
      )
    }

    return NextResponse.json({ 
      message: 'สร้างฐานข้อมูลและเพิ่มข้อมูลตัวอย่างเรียบร้อยแล้ว',
      exercises: exercises.length,
      programs: programs.length
    })
  } catch (error) {
    console.error('Error setting up database:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Convenience: allow opening this endpoint in a browser (GET) to run the same logic
export async function GET() {
  return POST()
}
