import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // เพิ่มท่าออกกำลังกายพื้นฐาน
    const exercises = [
      // ท่าลดน้ำหนัก
      { name: 'Burpees', description: 'ท่าออกกำลังกายแบบเต็มตัวที่ช่วยเผาผลาญไขมัน', muscle_group: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate', instructions: '1. ยืนตรง 2. นั่งยองๆ 3. วางมือลงพื้น 4. กระโดดกลับไปท่า plank 5. กระโดดกลับมาท่า squat 6. กระโดดขึ้นพร้อมยกมือ' },
      { name: 'Jumping Jacks', description: 'ท่ากระโดดตบที่ช่วยเผาผลาญไขมันและเพิ่มอัตราการเต้นของหัวใจ', muscle_group: 'full_body', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. กระโดดพร้อมแยกขาและยกมือขึ้น 3. กระโดดกลับมาท่าเริ่มต้น' },
      { name: 'Mountain Climbers', description: 'ท่าที่ช่วยเผาผลาญไขมันและเสริมความแข็งแรงของแกนกลาง', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. อยู่ในท่า plank 2. ดึงเข่าข้างหนึ่งเข้ามาหาอก 3. สลับข้างอย่างรวดเร็ว' },
      { name: 'High Knees', description: 'ท่ากระโดดเข่าสูงที่ช่วยเผาผลาญไขมัน', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. กระโดดเข่าสูงสลับข้าง 3. ใช้แขนช่วยในการเคลื่อนไหว' },
      
      // ท่าเพิ่มกล้ามเนื้อ
      { name: 'Push-ups', description: 'ท่าวิดพื้นที่ช่วยเสริมความแข็งแรงของอก แขน และไหล่', muscle_group: 'chest', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. อยู่ในท่า plank 2. ลดตัวลงโดยงอข้อศอก 3. ดันตัวขึ้นกลับมาท่าเริ่มต้น' },
      { name: 'Squats', description: 'ท่าลุกนั่งที่ช่วยเสริมความแข็งแรงของขาและก้น', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนแยกขากว้างเท่าหัวไหล่ 2. นั่งยองๆ เหมือนนั่งเก้าอี้ 3. ลุกขึ้นกลับมาท่าเริ่มต้น' },
      { name: 'Lunges', description: 'ท่าก้าวยาวที่ช่วยเสริมความแข็งแรงของขา', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. ก้าวขาข้างหนึ่งไปข้างหน้า 3. ลดตัวลงจนเข่าหลังเกือบแตะพื้น 4. ดันตัวขึ้นกลับมาท่าเริ่มต้น' },
      { name: 'Plank', description: 'ท่าค้างที่ช่วยเสริมความแข็งแรงของแกนกลาง', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. อยู่ในท่า push-up แต่ใช้แขนงอ 2. ค้างไว้โดยให้ลำตัวเป็นเส้นตรง' },
      
      // ท่าคาร์ดิโอ
      { name: 'Running in Place', description: 'วิ่งอยู่กับที่เพื่อเพิ่มอัตราการเต้นของหัวใจ', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. ยืนตรง 2. วิ่งอยู่กับที่โดยยกเข่าสูง' },
      { name: 'Butterfly Kicks', description: 'ท่าเตะขาสลับที่ช่วยเผาผลาญไขมัน', muscle_group: 'core', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. นอนหงาย 2. ยกขาขึ้นเล็กน้อย 3. เตะขาสลับข้างอย่างรวดเร็ว' },
      { name: 'Star Jumps', description: 'ท่ากระโดดดาวที่ช่วยเผาผลาญไขมัน', muscle_group: 'full_body', equipment: 'bodyweight', difficulty: 'intermediate', instructions: '1. ยืนตรง 2. กระโดดพร้อมแยกขาและแขนออกเป็นรูปดาว 3. กระโดดกลับมาท่าเริ่มต้น' },
      
      // ท่ายืดหยุ่น
      { name: 'Cat-Cow Stretch', description: 'ท่ายืดหลังที่ช่วยเพิ่มความยืดหยุ่น', muscle_group: 'back', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. คุกเข่าบนพื้น 2. วางมือลงพื้น 3. โค้งหลังขึ้น (cat) 4. แอ่นหลังลง (cow)' },
      { name: 'Child\'s Pose', description: 'ท่ายืดหลังและไหล่', muscle_group: 'back', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. คุกเข่าบนพื้น 2. นั่งบนส้นเท้า 3. โน้มตัวไปข้างหน้าพร้อมยืดแขน' },
      { name: 'Hamstring Stretch', description: 'ท่ายืดกล้ามเนื้อหลังขา', muscle_group: 'legs', equipment: 'bodyweight', difficulty: 'beginner', instructions: '1. นั่งบนพื้น 2. ยืดขาตรง 3. โน้มตัวไปข้างหน้าพยายามแตะปลายเท้า' }
    ]

    // เพิ่มท่าออกกำลังกาย
    for (const exercise of exercises) {
      await query(
        `INSERT INTO workout_exercises (name, description, muscle_group, equipment, difficulty, instructions)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO NOTHING`,
        [exercise.name, exercise.description, exercise.muscle_group, exercise.equipment, exercise.difficulty, exercise.instructions]
      )
    }

    // เพิ่มโปรแกรมการออกกำลังกาย
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

    // ดึง ID ของโปรแกรมและท่าออกกำลังกาย
    const programResult = await query('SELECT id, name FROM workout_programs ORDER BY id')
    const exerciseResult = await query('SELECT id, name FROM workout_exercises ORDER BY id')

    const programsMap = programResult.rows.reduce((acc, p) => { acc[p.name] = p.id; return acc }, {} as Record<string, number>)
    const exercisesMap = exerciseResult.rows.reduce((acc, e) => { acc[e.name] = e.id; return acc }, {} as Record<string, number>)

    // เพิ่มความสัมพันธ์ระหว่างโปรแกรมและท่าออกกำลังกาย
    const programExercises = [
      // โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Burpees', day: 1, sets: 3, reps: 10, rest: 60, order: 1 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Jumping Jacks', day: 1, sets: 3, reps: 20, rest: 30, order: 2 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Mountain Climbers', day: 1, sets: 3, reps: 15, rest: 45, order: 3 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'High Knees', day: 1, sets: 3, reps: 30, rest: 30, order: 4 },
      
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Jumping Jacks', day: 3, sets: 4, reps: 25, rest: 30, order: 1 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Burpees', day: 3, sets: 3, reps: 12, rest: 60, order: 2 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'High Knees', day: 3, sets: 4, reps: 35, rest: 30, order: 3 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Mountain Climbers', day: 3, sets: 3, reps: 20, rest: 45, order: 4 },
      
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Burpees', day: 5, sets: 4, reps: 15, rest: 60, order: 1 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Jumping Jacks', day: 5, sets: 3, reps: 30, rest: 30, order: 2 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'High Knees', day: 5, sets: 4, reps: 40, rest: 30, order: 3 },
      { program: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', exercise: 'Mountain Climbers', day: 5, sets: 4, reps: 25, rest: 45, order: 4 },

      // โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Push-ups', day: 1, sets: 3, reps: 10, rest: 90, order: 1 },
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Plank', day: 1, sets: 3, reps: 30, rest: 60, order: 2 },
      
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Squats', day: 2, sets: 3, reps: 15, rest: 90, order: 1 },
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Lunges', day: 2, sets: 3, reps: 10, rest: 90, order: 2 },
      
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Push-ups', day: 4, sets: 4, reps: 12, rest: 90, order: 1 },
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Plank', day: 4, sets: 3, reps: 45, rest: 60, order: 2 },
      
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Squats', day: 5, sets: 4, reps: 18, rest: 90, order: 1 },
      { program: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', exercise: 'Lunges', day: 5, sets: 3, reps: 12, rest: 90, order: 2 },

      // โปรแกรมคาร์ดิโอเข้มข้น
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Burpees', day: 1, sets: 4, reps: 15, rest: 45, order: 1 },
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Running in Place', day: 1, sets: null, reps: null, duration: 10, rest: 30, order: 2 },
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Butterfly Kicks', day: 1, sets: 3, reps: 50, rest: 30, order: 3 },
      
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Star Jumps', day: 3, sets: 4, reps: 20, rest: 45, order: 1 },
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Running in Place', day: 3, sets: null, reps: null, duration: 15, rest: 30, order: 2 },
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Burpees', day: 3, sets: 3, reps: 20, rest: 45, order: 3 },
      
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Burpees', day: 5, sets: 5, reps: 18, rest: 45, order: 1 },
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Star Jumps', day: 5, sets: 4, reps: 25, rest: 45, order: 2 },
      { program: 'โปรแกรมคาร์ดิโอเข้มข้น', exercise: 'Butterfly Kicks', day: 5, sets: 4, reps: 60, rest: 30, order: 3 },

      // โปรแกรมยืดหยุ่นและผ่อนคลาย
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Cat-Cow Stretch', day: 1, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Child\'s Pose', day: 1, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Hamstring Stretch', day: 1, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Cat-Cow Stretch', day: 2, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Child\'s Pose', day: 2, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Hamstring Stretch', day: 2, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Cat-Cow Stretch', day: 3, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Child\'s Pose', day: 3, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Hamstring Stretch', day: 3, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Cat-Cow Stretch', day: 4, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Child\'s Pose', day: 4, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Hamstring Stretch', day: 4, sets: 3, reps: null, duration: 2, rest: 30, order: 3 },
      
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Cat-Cow Stretch', day: 5, sets: 3, reps: null, duration: 2, rest: 30, order: 1 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Child\'s Pose', day: 5, sets: 3, reps: null, duration: 2, rest: 30, order: 2 },
      { program: 'โปรแกรมยืดหยุ่นและผ่อนคลาย', exercise: 'Hamstring Stretch', day: 5, sets: 3, reps: null, duration: 2, rest: 30, order: 3 }
    ]

    for (const pe of programExercises) {
      const programId = programsMap[pe.program]
      const exerciseId = exercisesMap[pe.exercise]
      
      if (programId && exerciseId) {
        await query(
          `INSERT INTO program_exercises (program_id, exercise_id, day_of_week, sets, reps, duration_minutes, rest_seconds, order_index)
           SELECT $1, $2, $3, $4, $5, $6, $7, $8
           WHERE NOT EXISTS (
             SELECT 1 FROM program_exercises 
             WHERE program_id = $1 AND exercise_id = $2 AND day_of_week = $3 AND order_index = $8
           )`,
          [
            programId,
            exerciseId,
            pe.day,
            pe.sets ?? null,
            pe.reps ?? null,
            pe.duration ?? null,
            pe.rest ?? null,
            pe.order
          ]
        )
      }
    }

    return NextResponse.json({ 
      message: 'เพิ่มข้อมูลตัวอย่างโปรแกรมการออกกำลังกายเรียบร้อยแล้ว',
      exercises: exercises.length,
      programs: programs.length,
      programExercises: programExercises.length
    })
  } catch (error) {
    console.error('Error seeding workout data:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: message }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}

