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
      'SELECT * FROM goals WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [userId]
    )

    return NextResponse.json({ goal: result.rows[0] || null })
  } catch (error) {
    console.error('Get goal error:', error)
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
    const { startWeightKg, targetWeightKg, targetDate } = await req.json()

    // ปิดเป้าเก่าทั้งหมด
    await query(
      'UPDATE goals SET is_active = false WHERE user_id = $1',
      [userId]
    )

    // สร้างเป้าใหม่
    const result = await query(
      `INSERT INTO goals (user_id, start_weight_kg, target_weight_kg, target_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, startWeightKg, targetWeightKg, targetDate || null]
    )

    return NextResponse.json({ goal: result.rows[0] })
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างเป้า' }, { status: 500 })
  }
}
