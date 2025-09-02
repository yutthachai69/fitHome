import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const mealPlanId = parseInt(id)
    if (isNaN(mealPlanId)) {
      return NextResponse.json({ error: 'Invalid meal plan ID' }, { status: 400 })
    }

    // Get meal plan details
    const mealPlanResult = await query('SELECT * FROM meal_plans WHERE id = $1', [mealPlanId])
    if (mealPlanResult.rows.length === 0) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    const mealPlan = mealPlanResult.rows[0]

    // Get meals for this plan organized by day
    const mealsResult = await query(`
      SELECT mpm.day_of_week, mpm.meal_order, m.*
      FROM meal_plan_meals mpm
      JOIN meals m ON mpm.meal_id = m.id
      WHERE mpm.meal_plan_id = $1
      ORDER BY mpm.day_of_week ASC, mpm.meal_order ASC
    `, [mealPlanId])

    // Organize meals by day
    const mealsByDay: { [key: number]: unknown[] } = {}
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']

    mealsResult.rows.forEach((meal: unknown) => {
      const mealData = meal as { day_of_week: number; meal_order: number }
      const day = mealData.day_of_week
      if (!mealsByDay[day]) {
        mealsByDay[day] = []
      }
      mealsByDay[day].push({
        ...(meal as Record<string, unknown>),
        meal_type_label: mealTypes[mealData.meal_order - 1] || 'other'
      })
    })

    // Calculate total calories and macros for the plan
    const totalCalories = mealsResult.rows.reduce((sum: number, meal: unknown) => {
      const mealData = meal as { calories?: number }
      return sum + (mealData.calories || 0)
    }, 0)
    const totalProtein = mealsResult.rows.reduce((sum: number, meal: unknown) => {
      const mealData = meal as { protein?: number }
      return sum + (mealData.protein || 0)
    }, 0)
    const totalCarbs = mealsResult.rows.reduce((sum: number, meal: unknown) => {
      const mealData = meal as { carbs?: number }
      return sum + (mealData.carbs || 0)
    }, 0)
    const totalFat = mealsResult.rows.reduce((sum: number, meal: unknown) => {
      const mealData = meal as { fat?: number }
      return sum + (mealData.fat || 0)
    }, 0)

    const planSummary = {
      total_calories: totalCalories,
      total_protein: Math.round(totalProtein * 10) / 10,
      total_carbs: Math.round(totalCarbs * 10) / 10,
      total_fat: Math.round(totalFat * 10) / 10,
      meal_count: mealsResult.rows.length
    }

    return NextResponse.json({
      meal_plan: mealPlan,
      meals_by_day: mealsByDay,
      plan_summary: planSummary
    })
  } catch (error) {
    console.error('Error fetching meal plan details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
