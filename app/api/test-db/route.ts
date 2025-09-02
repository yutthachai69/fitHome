import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // ทดสอบการเชื่อมต่อฐานข้อมูล
    const result = await query('SELECT NOW() as current_time')
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      current_time: result.rows[0].current_time
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }
}

