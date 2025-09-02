import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    
    // ดึงข้อมูลผู้ใช้
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    )
    const user = userResult.rows[0]

    // ดึงข้อมูลน้ำหนักล่าสุด
    const weightResult = await query(
      'SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY date DESC LIMIT 1',
      [userId]
    )
    const lastWeight = weightResult.rows[0]

    // ดึงข้อมูลเป้าหมาย
    const goalResult = await query(
      'SELECT * FROM goals WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [userId]
    )
    const currentGoal = goalResult.rows[0]

    // คำนวณ BMI
    let bmi = null
    if (lastWeight && user?.height_cm) {
      const heightInMeters = user.height_cm / 100
      bmi = lastWeight.weight_kg / (heightInMeters * heightInMeters)
    }

    // กำหนดความยากตาม BMI และเป้าหมาย
    let difficulty = 'beginner'
    if (bmi) {
      if (bmi >= 30) {
        difficulty = 'beginner' // สำหรับคนที่มีน้ำหนักมาก เริ่มด้วยโปรแกรมเบา
      } else if (bmi >= 25) {
        difficulty = 'intermediate'
      } else {
        difficulty = 'intermediate'
      }
    }

    // กำหนดประเภทโปรแกรมตามเป้าหมาย
    let category = 'weight_loss'
    if (currentGoal) {
      const targetWeight = currentGoal.target_weight_kg
      const startWeight = currentGoal.start_weight_kg
      const currentWeight = lastWeight?.weight_kg || startWeight
      
      if (targetWeight < currentWeight) {
        category = 'weight_loss'
      } else if (targetWeight > currentWeight) {
        category = 'muscle_gain'
      } else {
        category = 'cardio' // สำหรับการรักษาน้ำหนัก
      }
    }

    // ดึงโปรแกรมที่แนะนำ
    const programsResult = await query(
      `SELECT * FROM workout_programs 
       WHERE difficulty = $1 AND category = $2
       ORDER BY duration_weeks ASC
       LIMIT 3`,
      [difficulty, category]
    )

    // ถ้าไม่มีโปรแกรมที่ตรงกับเงื่อนไข ให้ดึงโปรแกรมทั่วไป
    let recommendedPrograms = programsResult.rows
    if (recommendedPrograms.length === 0) {
      const generalProgramsResult = await query(
        `SELECT * FROM workout_programs 
         WHERE difficulty = $1
         ORDER BY duration_weeks ASC
         LIMIT 3`,
        [difficulty]
      )
      recommendedPrograms = generalProgramsResult.rows
    }

    // เพิ่มข้อมูลการวิเคราะห์
    const analysis = {
      user_bmi: bmi ? bmi.toFixed(1) : null,
      difficulty_reason: bmi ? 
        (bmi >= 30 ? 'น้ำหนักเกินมาก ควรเริ่มด้วยโปรแกรมเบา' :
         bmi >= 25 ? 'น้ำหนักเกินเล็กน้อย ใช้โปรแกรมปานกลาง' :
         'น้ำหนักปกติ ใช้โปรแกรมปานกลาง') : 'ไม่สามารถคำนวณได้',
      category_reason: currentGoal ? 
        (category === 'weight_loss' ? 'เป้าหมายคือลดน้ำหนัก' :
         category === 'muscle_gain' ? 'เป้าหมายคือเพิ่มกล้ามเนื้อ' :
         'เป้าหมายคือรักษาน้ำหนัก') : 'ไม่มีเป้าหมายที่ชัดเจน',
      recommended_count: recommendedPrograms.length
    }

    return NextResponse.json({
      recommended_programs: recommendedPrograms,
      analysis: analysis,
      user_data: {
        current_weight: lastWeight?.weight_kg,
        target_weight: currentGoal?.target_weight_kg,
        height: user?.height_cm,
        gender: user?.gender
      }
    })

  } catch (error) {
    console.error('Error recommending programs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
