import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // สร้างตาราง workout_exercises และ program_exercises
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

    // เพิ่มข้อมูลท่าออกกำลังกาย
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

    // เพิ่มท่าออกกำลังกาย
    const exerciseIds: { [key: string]: number } = {}
    for (const exercise of exercises) {
      try {
        const result = await query(
          `INSERT INTO workout_exercises (name, description, muscle_group, equipment, difficulty, instructions)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [exercise.name, exercise.description, exercise.muscle_group, exercise.equipment, exercise.difficulty, exercise.instructions]
        )
        exerciseIds[exercise.name] = result.rows[0].id
      } catch (error) {
        // ถ้ามีอยู่แล้ว ให้ดึง ID มา
        const result = await query('SELECT id FROM workout_exercises WHERE name = $1', [exercise.name])
        if (result.rows.length > 0) {
          exerciseIds[exercise.name] = result.rows[0].id
        }
      }
    }

    // เพิ่มความสัมพันธ์ระหว่างโปรแกรมและท่าออกกำลังกาย
    const programExercises = [
      // โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น (ID: 1)
      { program_id: 1, exercise_name: 'Burpees', day: 1, sets: 3, reps: 10, rest: 60, order: 1 },
      { program_id: 1, exercise_name: 'Jumping Jacks', day: 1, sets: 3, reps: 20, rest: 30, order: 2 },
      { program_id: 1, exercise_name: 'Mountain Climbers', day: 1, sets: 3, reps: 15, rest: 45, order: 3 },
      { program_id: 1, exercise_name: 'High Knees', day: 1, sets: 3, reps: 30, rest: 30, order: 4 },
      
      { program_id: 1, exercise_name: 'Jumping Jacks', day: 3, sets: 4, reps: 25, rest: 30, order: 1 },
      { program_id: 1, exercise_name: 'Burpees', day: 3, sets: 3, reps: 12, rest: 60, order: 2 },
      { program_id: 1, exercise_name: 'High Knees', day: 3, sets: 4, reps: 35, rest: 30, order: 3 },
      { program_id: 1, exercise_name: 'Mountain Climbers', day: 3, sets: 3, reps: 20, rest: 45, order: 4 },
      
      { program_id: 1, exercise_name: 'Burpees', day: 5, sets: 4, reps: 15, rest: 60, order: 1 },
      { program_id: 1, exercise_name: 'Jumping Jacks', day: 5, sets: 3, reps: 30, rest: 30, order: 2 },
      { program_id: 1, exercise_name: 'High Knees', day: 5, sets: 4, reps: 40, rest: 30, order: 3 },
      { program_id: 1, exercise_name: 'Mountain Climbers', day: 5, sets: 4, reps: 25, rest: 45, order: 4 },

      // โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน (ID: 2)
      { program_id: 2, exercise_name: 'Push-ups', day: 1, sets: 3, reps: 10, rest: 90, order: 1 },
      { program_id: 2, exercise_name: 'Plank', day: 1, sets: 3, reps: null, duration: 30, rest: 60, order: 2 },
      
      { program_id: 2, exercise_name: 'Squats', day: 2, sets: 3, reps: 15, rest: 90, order: 1 },
      { program_id: 2, exercise_name: 'Lunges', day: 2, sets: 3, reps: 10, rest: 90, order: 2 },
      
      { program_id: 2, exercise_name: 'Push-ups', day: 4, sets: 4, reps: 12, rest: 90, order: 1 },
      { program_id: 2, exercise_name: 'Plank', day: 4, sets: 3, reps: null, duration: 45, rest: 60, order: 2 },
      
      { program_id: 2, exercise_name: 'Squats', day: 5, sets: 4, reps: 18, rest: 90, order: 1 },
      { program_id: 2, exercise_name: 'Lunges', day: 5, sets: 3, reps: 12, rest: 90, order: 2 },

      // โปรแกรมคาร์ดิโอเข้มข้น (ID: 3)
      { program_id: 3, exercise_name: 'Burpees', day: 1, sets: 4, reps: 15, rest: 45, order: 1 },
      { program_id: 3, exercise_name: 'Running in Place', day: 1, sets: null, reps: null, duration: 10, rest: 30, order: 2 },
      { program_id: 3, exercise_name: 'Butterfly Kicks', day: 1, sets: 3, reps: 50, rest: 30, order: 3 },
      
      { program_id: 3, exercise_name: 'Star Jumps', day: 3, sets: 4, reps: 20, rest: 45, order: 1 },
      { program_id: 3, exercise_name: 'Running in Place', day: 3, sets: null, reps: null, duration: 15, rest: 30, order: 2 },
      { program_id: 3, exercise_name: 'Burpees', day: 3, sets: 3, reps: 20, rest: 45, order: 3 },
      
      { program_id: 3, exercise_name: 'Burpees', day: 5, sets: 5, reps: 18, rest: 45, order: 1 },
      { program_id: 3, exercise_name: 'Star Jumps', day: 5, sets: 4, reps: 25, rest: 45, order: 2 },
      { program_id: 3, exercise_name: 'Butterfly Kicks', day: 5, sets: 4, reps: 60, rest: 30, order: 3 },

      // โปรแกรมยืดหยุ่นและผ่อนคลาย (ID: 4)
      { program_id: 4, exercise_name: 'Cat-Cow Stretch', day: 1, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program_id: 4, exercise_name: 'Child\'s Pose', day: 1, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program_id: 4, exercise_name: 'Hamstring Stretch', day: 1, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program_id: 4, exercise_name: 'Cat-Cow Stretch', day: 2, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program_id: 4, exercise_name: 'Child\'s Pose', day: 2, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program_id: 4, exercise_name: 'Hamstring Stretch', day: 2, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program_id: 4, exercise_name: 'Cat-Cow Stretch', day: 3, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program_id: 4, exercise_name: 'Child\'s Pose', day: 3, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program_id: 4, exercise_name: 'Hamstring Stretch', day: 3, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program_id: 4, exercise_name: 'Cat-Cow Stretch', day: 4, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program_id: 4, exercise_name: 'Child\'s Pose', day: 4, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program_id: 4, exercise_name: 'Hamstring Stretch', day: 4, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program_id: 4, exercise_name: 'Cat-Cow Stretch', day: 5, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program_id: 4, exercise_name: 'Child\'s Pose', day: 5, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program_id: 4, exercise_name: 'Hamstring Stretch', day: 5, sets: 3, reps: null, duration: 2, rest: 30, order: 3 }
    ]

    let addedCount = 0
    for (const pe of programExercises) {
      try {
        const exerciseId = exerciseIds[pe.exercise_name]
        if (exerciseId) {
          await query(
            `INSERT INTO program_exercises (program_id, exercise_id, day_of_week, sets, reps, duration_minutes, rest_seconds, order_index)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [pe.program_id, exerciseId, pe.day, pe.sets, pe.reps, pe.duration, pe.rest, pe.order]
          )
          addedCount++
        }
      } catch (error) {
        console.log(`Exercise relationship already exists or error:`, error)
      }
    }

    return NextResponse.json({ 
      message: 'เพิ่มข้อมูลท่าออกกำลังกายเรียบร้อยแล้ว',
      exercises: exercises.length,
      relationships: addedCount
    })
  } catch (error) {
    console.error('Error seeding exercises:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

