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

    // เพิ่มข้อมูลโปรแกรมการออกกำลังกาย
    const programs = [
      {
        name: 'โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น',
        description: 'โปรแกรม 4 สัปดาห์สำหรับผู้ที่ต้องการลดน้ำหนักและเริ่มต้นการออกกำลังกาย',
        difficulty: 'beginner',
        duration_weeks: 4,
        category: 'weight_loss'
      },
      {
        name: 'โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน',
        description: 'โปรแกรม 6 สัปดาห์สำหรับการสร้างกล้ามเนื้อและความแข็งแรง',
        difficulty: 'beginner',
        duration_weeks: 6,
        category: 'muscle_gain'
      },
      {
        name: 'โปรแกรมคาร์ดิโอเข้มข้น',
        description: 'โปรแกรม 3 สัปดาห์สำหรับการเผาผลาญไขมันอย่างรวดเร็ว',
        difficulty: 'intermediate',
        duration_weeks: 3,
        category: 'cardio'
      },
      {
        name: 'โปรแกรมยืดหยุ่นและผ่อนคลาย',
        description: 'โปรแกรม 2 สัปดาห์สำหรับการยืดกล้ามเนื้อและผ่อนคลาย',
        difficulty: 'beginner',
        duration_weeks: 2,
        category: 'flexibility'
      },
      {
        name: 'โปรแกรมลดน้ำหนักขั้นสูง',
        description: 'โปรแกรม 8 สัปดาห์สำหรับผู้ที่มีประสบการณ์การออกกำลังกาย',
        difficulty: 'advanced',
        duration_weeks: 8,
        category: 'weight_loss'
      },
      {
        name: 'โปรแกรมสร้างกล้ามเนื้อขั้นสูง',
        description: 'โปรแกรม 12 สัปดาห์สำหรับการสร้างกล้ามเนื้ออย่างเต็มรูปแบบ',
        difficulty: 'advanced',
        duration_weeks: 12,
        category: 'muscle_gain'
      }
    ]

    let addedCount = 0
    for (const program of programs) {
      try {
        await query(
          `INSERT INTO workout_programs (name, description, difficulty, duration_weeks, category)
           VALUES ($1, $2, $3, $4, $5)`,
          [program.name, program.description, program.difficulty, program.duration_weeks, program.category]
        )
        addedCount++
      } catch (error) {
        console.log(`Program ${program.name} already exists or error:`, error)
      }
    }

    return NextResponse.json({ 
      message: 'เพิ่มข้อมูลโปรแกรมการออกกำลังกายเรียบร้อยแล้ว',
      added: addedCount,
      total: programs.length
    })
  } catch (error) {
    console.error('Error seeding workout data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}

