import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const result = await query(
      'SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY date ASC',
      [userId]
    )

    return NextResponse.json({ entries: result.rows })
  } catch (error) {
    console.error('Get weight entries error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const { date, weightKg, note } = await req.json()
    const entryDate = date || new Date().toISOString().split('T')[0]

    // ใช้ UPSERT (INSERT ... ON CONFLICT)
    const result = await query(
      `INSERT INTO weight_entries (user_id, date, weight_kg, note) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, date) 
       DO UPDATE SET weight_kg = $3, note = $4 
       RETURNING *`,
      [userId, entryDate, weightKg, note || null]
    )

    return NextResponse.json({ entry: result.rows[0] })
  } catch (error) {
    console.error('Create weight entry error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกน้ำหนัก' }, { status: 500 })
  }
}
