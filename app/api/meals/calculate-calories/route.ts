import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { age, weight_kg, height_cm, gender, activity_level, goal } = body

    // Validate required fields
    if (!age || !weight_kg || !height_cm || !gender || !activity_level || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0
    if (gender === 'male') {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    } else {
      bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,      // Little or no exercise
      lightly_active: 1.375, // Light exercise 1-3 days/week
      moderately_active: 1.55, // Moderate exercise 3-5 days/week
      very_active: 1.725,   // Hard exercise 6-7 days/week
      extremely_active: 1.9 // Very hard exercise, physical job
    }

    const tdee = bmr * activityMultipliers[activity_level as keyof typeof activityMultipliers]

    // Adjust calories based on goal
    let targetCalories = tdee
    let calorieAdjustment = 0
    let goalDescription = ''

    switch (goal) {
      case 'weight_loss':
        calorieAdjustment = -500 // 500 calorie deficit for ~0.5kg/week loss
        targetCalories = tdee + calorieAdjustment
        goalDescription = 'ลดน้ำหนัก'
        break
      case 'muscle_gain':
        calorieAdjustment = 300 // 300 calorie surplus for muscle gain
        targetCalories = tdee + calorieAdjustment
        goalDescription = 'เพิ่มกล้ามเนื้อ'
        break
      case 'maintenance':
        calorieAdjustment = 0
        targetCalories = tdee
        goalDescription = 'รักษาน้ำหนัก'
        break
      default:
        calorieAdjustment = 0
        targetCalories = tdee
        goalDescription = 'สุขภาพทั่วไป'
    }

    // Calculate macronutrient ratios
    let proteinRatio = 0.25
    let carbsRatio = 0.45
    let fatRatio = 0.30

    if (goal === 'weight_loss') {
      proteinRatio = 0.35 // Higher protein for satiety
      carbsRatio = 0.35
      fatRatio = 0.30
    } else if (goal === 'muscle_gain') {
      proteinRatio = 0.30
      carbsRatio = 0.50 // Higher carbs for energy
      fatRatio = 0.20
    }

    // Calculate macronutrient amounts in grams
    const proteinGrams = Math.round((targetCalories * proteinRatio) / 4) // 4 cal/g
    const carbsGrams = Math.round((targetCalories * carbsRatio) / 4) // 4 cal/g
    const fatGrams = Math.round((targetCalories * fatRatio) / 9) // 9 cal/g

    // Get recommended meal plans
    const mealPlansResult = await query(`
      SELECT * FROM meal_plans 
      WHERE category = $1 OR category = 'general'
      ORDER BY 
        CASE WHEN category = $1 THEN 0 ELSE 1 END,
        ABS(target_calories - $2) ASC
      LIMIT 3
    `, [goal, targetCalories])

    const recommendedPlans = mealPlansResult.rows

    // Calculate BMI
    const bmi = weight_kg / Math.pow(height_cm / 100, 2)
    let bmiCategory = ''
    if (bmi < 18.5) bmiCategory = 'น้ำหนักต่ำกว่าเกณฑ์'
    else if (bmi < 25) bmiCategory = 'น้ำหนักปกติ'
    else if (bmi < 30) bmiCategory = 'น้ำหนักเกิน'
    else bmiCategory = 'อ้วน'

    // Create analysis summary
    const analysis = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target_calories: Math.round(targetCalories),
      calorie_adjustment: calorieAdjustment,
      goal_description: goalDescription,
      bmi: Math.round(bmi * 10) / 10,
      bmi_category: bmiCategory,
      macronutrients: {
        protein: {
          grams: proteinGrams,
          calories: Math.round(proteinGrams * 4),
          percentage: Math.round(proteinRatio * 100)
        },
        carbs: {
          grams: carbsGrams,
          calories: Math.round(carbsGrams * 4),
          percentage: Math.round(carbsRatio * 100)
        },
        fat: {
          grams: fatGrams,
          calories: Math.round(fatGrams * 9),
          percentage: Math.round(fatRatio * 100)
        }
      },
      recommendations: [
        `ควรรับประทาน ${Math.round(targetCalories)} แคลอรี่ต่อวัน`,
        `โปรตีน ${proteinGrams}g (${Math.round(proteinRatio * 100)}%)`,
        `คาร์โบไฮเดรต ${carbsGrams}g (${Math.round(carbsRatio * 100)}%)`,
        `ไขมัน ${fatGrams}g (${Math.round(fatRatio * 100)}%)`,
        `ดัชนีมวลกาย (BMI): ${Math.round(bmi * 10) / 10} (${bmiCategory})`
      ]
    }

    return NextResponse.json({
      analysis,
      recommended_meal_plans: recommendedPlans,
      user_data: {
        age,
        weight_kg,
        height_cm,
        gender,
        activity_level,
        goal
      }
    })
  } catch (error) {
    console.error('Error calculating calories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
