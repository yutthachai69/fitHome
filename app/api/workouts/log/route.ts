import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      program_id, 
      exercise_id, 
      sets_completed, 
      reps_completed, 
      weight_kg, 
      duration_minutes, 
      notes,
      workout_date 
    } = body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!program_id || !exercise_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = (session.user as { id: string }).id
    
    // บันทึกการออกกำลังกาย
    const result = await query(
      `INSERT INTO workout_logs (
        user_id, program_id, exercise_id, sets_completed, reps_completed, 
        weight_kg, duration_minutes, notes, workout_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        userId, program_id, exercise_id, sets_completed, reps_completed,
        weight_kg, duration_minutes, notes, workout_date || new Date().toISOString().split('T')[0]
      ]
    )

    return NextResponse.json({
      message: 'บันทึกการออกกำลังกายเรียบร้อยแล้ว',
      workout_log: result.rows[0]
    })

  } catch (error) {
    console.error('Error logging workout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('program_id')
    const limit = searchParams.get('limit') || '10'

    let queryString = `
      SELECT 
        wl.*,
        wp.name as program_name,
        we.name as exercise_name,
        we.description as exercise_description
      FROM workout_logs wl
      JOIN workout_programs wp ON wl.program_id = wp.id
      JOIN workout_exercises we ON wl.exercise_id = we.id
      WHERE wl.user_id = $1
    `
    const userId = (session.user as { id: string }).id
    const queryParams: (string | number)[] = [userId]

    if (programId) {
      queryString += ' AND wl.program_id = $2'
      queryParams.push(programId)
    }

    queryString += ' ORDER BY wl.workout_date DESC, wl.created_at DESC LIMIT $' + (queryParams.length + 1)
    queryParams.push(parseInt(limit))

    const result = await query(queryString, queryParams)

    return NextResponse.json({
      workout_logs: result.rows
    })

  } catch (error) {
    console.error('Error fetching workout logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
