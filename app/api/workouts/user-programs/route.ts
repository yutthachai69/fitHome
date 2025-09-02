import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - ดึงโปรแกรมการออกกำลังกายที่ผู้ใช้กำลังทำอยู่
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const result = await query(
      `SELECT 
        uap.*,
        wp.name as program_name,
        wp.description as program_description,
        wp.difficulty,
        wp.duration_weeks,
        wp.category,
        wp.image_url
       FROM user_active_programs uap
       JOIN workout_programs wp ON uap.program_id = wp.id
       WHERE uap.user_id = $1 AND uap.is_active = true
       ORDER BY uap.created_at DESC`,
      [userId]
    )

    return NextResponse.json({
      activePrograms: result.rows
    })
  } catch (error) {
    console.error('Error fetching user programs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - เริ่มโปรแกรมการออกกำลังกายใหม่
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Support JSON, form-url-encoded and multipart form submissions
    let program_id: unknown
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      program_id = body.program_id
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text()
      const params = new URLSearchParams(text)
      program_id = params.get('program_id')
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      program_id = form.get('program_id')
    } else {
      const body = await req.json().catch(() => ({}))
      program_id = (body as Record<string, unknown>).program_id
    }
    
    if (!program_id) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 })
    }

    // ตรวจสอบว่าโปรแกรมมีอยู่จริง
    const programResult = await query(
      'SELECT * FROM workout_programs WHERE id = $1',
      [Number(program_id)]
    )
    
    if (programResult.rows.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
    }

    const userId = (session.user as { id: string }).id
    
    // ปิดโปรแกรมเก่าทั้งหมด
    await query(
      'UPDATE user_active_programs SET is_active = false WHERE user_id = $1',
      [userId]
    )

    // เริ่มโปรแกรมใหม่
    const result = await query(
      `INSERT INTO user_active_programs (user_id, program_id, start_date, current_week, is_active)
       VALUES ($1, $2, CURRENT_DATE, 1, true)
       RETURNING *`,
      [userId, Number(program_id)]
    )

    return NextResponse.json({
      activeProgram: result.rows[0]
    })
  } catch (error) {
    console.error('Error starting workout program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
