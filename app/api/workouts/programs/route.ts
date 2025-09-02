import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET - ดึงรายการโปรแกรมการออกกำลังกายทั้งหมด
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    
    let sql = `
      SELECT 
        wp.*,
        COUNT(DISTINCT pe.exercise_id) as exercise_count,
        AVG(pe.duration_minutes) as avg_duration
      FROM workout_programs wp
      LEFT JOIN program_exercises pe ON wp.id = pe.program_id
    `
    
    const conditions = []
    const params = []
    
    if (category) {
      conditions.push(`wp.category = $${params.length + 1}`)
      params.push(category)
    }
    
    if (difficulty) {
      conditions.push(`wp.difficulty = $${params.length + 1}`)
      params.push(difficulty)
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`
    }
    
    sql += ` GROUP BY wp.id ORDER BY wp.created_at DESC`
    
    const result = await query(sql, params)
    
    return NextResponse.json({
      programs: result.rows
    })
  } catch (error) {
    console.error('Error fetching workout programs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - สร้างโปรแกรมการออกกำลังกายใหม่ (สำหรับ admin)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, difficulty, duration_weeks, category, image_url } = await req.json()
    
    if (!name || !difficulty || !duration_weeks || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO workout_programs (name, description, difficulty, duration_weeks, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, difficulty, duration_weeks, category, image_url]
    )

    return NextResponse.json({
      program: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating workout program:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
