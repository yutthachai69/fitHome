import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - ดึงรายละเอียดโปรแกรมการออกกำลังกาย
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const programId = parseInt(id)
    
    // ดึงข้อมูลโปรแกรม
    const programResult = await query(
      `SELECT * FROM workout_programs WHERE id = $1`,
      [programId]
    )
    
    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }
    
    const program = programResult.rows[0]
    
    // ดึงรายการท่าออกกำลังกายในโปรแกรม
    const exercisesResult = await query(
      `SELECT 
        pe.*,
        we.name as exercise_name,
        we.description as exercise_description,
        we.muscle_group,
        we.equipment,
        we.difficulty as exercise_difficulty,
        we.instructions,
        we.video_url,
        we.image_url as exercise_image
       FROM program_exercises pe
       JOIN workout_exercises we ON pe.exercise_id = we.id
       WHERE pe.program_id = $1
       ORDER BY pe.day_of_week, pe.order_index`,
      [programId]
    )
    
    // จัดกลุ่มท่าออกกำลังกายตามวัน
    const exercisesByDay = exercisesResult.rows.reduce((acc, exercise) => {
      const day = exercise.day_of_week
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push(exercise)
      return acc
    }, {} as Record<number, unknown[]>)
    
    return NextResponse.json({
      program,
      exercises: exercisesByDay
    })
  } catch (error) {
    console.error('Error fetching workout program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
