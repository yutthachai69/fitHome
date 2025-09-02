import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { query } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { name, email, password, heightCm, gender } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 })
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 })
    }

    // เข้ารหัสพาสเวิร์ด
    const passwordHash = await bcrypt.hash(password, 10)

    // สร้างผู้ใช้ใหม่
    const result = await query(
      `INSERT INTO users (name, email, password_hash, height_cm, gender) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, name`,
      [name || null, email, passwordHash, heightCm || null, gender || null]
    )

    const user = result.rows[0]
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name } 
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 })
  }
}

