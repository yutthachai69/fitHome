import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const { name, heightCm, gender, birthDate } = await req.json()

    // อัปเดตข้อมูลผู้ใช้
    const result = await query(
      `UPDATE users 
       SET name = $1, height_cm = $2, gender = $3, birth_date = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, height_cm, gender, birth_date`,
      [name, heightCm, gender, birthDate, userId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      user: result.rows[0] 
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
