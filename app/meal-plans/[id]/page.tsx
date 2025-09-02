import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import StartMealPlanButton from '@/components/StartMealPlanButton'

interface PageProps {
  params: { id: string }
}

export default async function MealPlanDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h1>
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    )
  }

  const mealPlanId = parseInt(params.id)
  if (isNaN(mealPlanId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบโปรแกรมอาหาร</h1>
          <Link href="/meal-plans" className="text-blue-600 hover:text-blue-800">
            กลับไปหน้าโปรแกรมอาหาร
          </Link>
        </div>
      </div>
    )
  }

  const userResult = await query('SELECT * FROM users WHERE id = $1', [session.user.id])
  const user = userResult.rows[0]

  // Get meal plan details
  const mealPlanResult = await query('SELECT * FROM meal_plans WHERE id = $1', [mealPlanId])
  if (mealPlanResult.rows.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบโปรแกรมอาหาร</h1>
          <Link href="/meal-plans" className="text-blue-600 hover:text-blue-800">
            กลับไปหน้าโปรแกรมอาหาร
          </Link>
        </div>
      </div>
    )
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
      ...meal,
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

  // Fallback macro ratios if not stored on meal plan
  const caloriesFromProtein = totalProtein * 4
  const caloriesFromCarbs = totalCarbs * 4
  const caloriesFromFat = totalFat * 9
  const totalCaloriesFromMacros = caloriesFromProtein + caloriesFromCarbs + caloriesFromFat
  const proteinRatio = typeof mealPlan.protein_ratio === 'number'
    ? Number(mealPlan.protein_ratio)
    : (totalCaloriesFromMacros > 0 ? caloriesFromProtein / totalCaloriesFromMacros : 0)
  const carbsRatio = typeof mealPlan.carbs_ratio === 'number'
    ? Number(mealPlan.carbs_ratio)
    : (totalCaloriesFromMacros > 0 ? caloriesFromCarbs / totalCaloriesFromMacros : 0)
  const fatRatio = typeof mealPlan.fat_ratio === 'number'
    ? Number(mealPlan.fat_ratio)
    : (totalCaloriesFromMacros > 0 ? caloriesFromFat / totalCaloriesFromMacros : 0)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'เริ่มต้น'
      case 'intermediate': return 'ปานกลาง'
      case 'advanced': return 'ขั้นสูง'
      default: return difficulty
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'weight_loss': return 'ลดน้ำหนัก'
      case 'muscle_gain': return 'เพิ่มกล้ามเนื้อ'
      case 'general': return 'สุขภาพทั่วไป'
      case 'vegetarian': return 'มังสวิรัติ'
      default: return category
    }
  }

  const getMealTypeText = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'อาหารเช้า'
      case 'lunch': return 'อาหารกลางวัน'
      case 'dinner': return 'อาหารเย็น'
      case 'snack': return 'ของว่าง'
      default: return mealType
    }
  }

  const dayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800">
                FitAI Coach
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  หน้าหลัก
                </Link>
                <Link href="/workouts" className="text-gray-600 hover:text-gray-900">
                  โปรแกรมออกกำลังกาย
                </Link>
                <Link href="/meal-plans" className="text-blue-600 font-medium">
                  โปรแกรมอาหาร
                </Link>
                <Link href="/workout-tracker" className="text-gray-600 hover:text-gray-900">
                  ติดตามการออกกำลังกาย
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">สวัสดี, {user?.name || 'ผู้ใช้'}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/meal-plans" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับไปหน้าโปรแกรมอาหาร
          </Link>
        </div>

        {/* Meal Plan Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mealPlan.name}</h1>
              <p className="text-gray-600 text-lg mb-4">{mealPlan.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(mealPlan.difficulty)}`}>
                  {getDifficultyText(mealPlan.difficulty)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getCategoryText(mealPlan.category)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {mealPlan.duration_weeks} สัปดาห์
                </span>
              </div>
            </div>
            <div className="mt-6 lg:mt-0">
              <StartMealPlanButton mealPlanId={mealPlan.id} />
            </div>
          </div>

          {/* Plan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{mealPlan.target_calories}</div>
              <div className="text-sm text-blue-700">แคลอรี่/วัน</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(proteinRatio * 100)}%</div>
              <div className="text-sm text-green-700">โปรตีน</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{Math.round(carbsRatio * 100)}%</div>
              <div className="text-sm text-yellow-700">คาร์โบไฮเดรต</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{Math.round(fatRatio * 100)}%</div>
              <div className="text-sm text-red-700">ไขมัน</div>
            </div>
          </div>
        </div>

        {/* Weekly Meal Plan */}
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">แผนอาหารรายสัปดาห์</h2>
          
          <div className="space-y-8">
            {Object.keys(mealsByDay).map((day) => {
              const dayNumber = parseInt(day)
              const dayMeals = mealsByDay[dayNumber]
              
              return (
                <div key={day} className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    วัน{dayNames[dayNumber - 1]}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dayMeals.map((meal, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {getMealTypeText(meal.meal_type_label)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {meal.preparation_time_minutes} นาที
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-2">{meal.name}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{meal.description}</p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">แคลอรี่:</span>
                            <span className="font-medium">{meal.calories}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">โปรตีน:</span>
                            <span className="font-medium">{meal.protein}g</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">คาร์โบไฮเดรต:</span>
                            <span className="font-medium">{meal.carbs}g</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">ไขมัน:</span>
                            <span className="font-medium">{meal.fat}g</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
