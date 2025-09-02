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

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    let queryString = `
      SELECT ump.*, mp.name as plan_name, mp.description as plan_description, 
             mp.target_calories, mp.difficulty, mp.category, mp.duration_weeks
      FROM user_meal_plans ump
      JOIN meal_plans mp ON ump.meal_plan_id = mp.id
      WHERE ump.user_id = $1
    `
    const userId = (session.user as { id: string }).id
    const queryParams = [userId]

    if (!includeInactive) {
      queryString += ' AND ump.is_active = true'
    }

    queryString += ' ORDER BY ump.created_at DESC'

    const result = await query(queryString, queryParams)
    return NextResponse.json({ user_meal_plans: result.rows })
  } catch (error) {
    console.error('Error fetching user meal plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { meal_plan_id, target_calories, current_weight, target_weight } = body

    if (!meal_plan_id) {
      return NextResponse.json({ error: 'Missing meal_plan_id' }, { status: 400 })
    }

    const userId = (session.user as { id: string }).id
    
    // Deactivate any existing active meal plans
    await query(`
      UPDATE user_meal_plans 
      SET is_active = false, end_date = CURRENT_DATE 
      WHERE user_id = $1 AND is_active = true
    `, [userId])

    // Get meal plan details
    const mealPlanResult = await query('SELECT * FROM meal_plans WHERE id = $1', [meal_plan_id])
    if (mealPlanResult.rows.length === 0) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    const mealPlan = mealPlanResult.rows[0]

    // Create new user meal plan
    const result = await query(`
      INSERT INTO user_meal_plans (
        user_id, meal_plan_id, target_calories, current_weight, target_weight, 
        start_date, is_active
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, true)
      RETURNING *
    `, [
      userId,
      meal_plan_id,
      target_calories || mealPlan.target_calories,
      current_weight,
      target_weight
    ])

    return NextResponse.json({
      message: 'เริ่มโปรแกรมอาหารเรียบร้อยแล้ว',
      user_meal_plan: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating user meal plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_meal_plan_id, is_active, target_calories, current_weight, target_weight } = body

    if (!user_meal_plan_id) {
      return NextResponse.json({ error: 'Missing user_meal_plan_id' }, { status: 400 })
    }

    const userId = (session.user as { id: string }).id
    
    // Update user meal plan
    const updateFields = []
    const updateValues = [userId, user_meal_plan_id]
    let paramCount = 2

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${++paramCount}`)
      updateValues.push(is_active)
    }

    if (target_calories !== undefined) {
      updateFields.push(`target_calories = $${++paramCount}`)
      updateValues.push(target_calories)
    }

    if (current_weight !== undefined) {
      updateFields.push(`current_weight = $${++paramCount}`)
      updateValues.push(current_weight)
    }

    if (target_weight !== undefined) {
      updateFields.push(`target_weight = $${++paramCount}`)
      updateValues.push(target_weight)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const result = await query(`
      UPDATE user_meal_plans 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND id = $2
      RETURNING *
    `, updateValues)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User meal plan not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'อัปเดตโปรแกรมอาหารเรียบร้อยแล้ว',
      user_meal_plan: result.rows[0]
    })
  } catch (error) {
    console.error('Error updating user meal plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
