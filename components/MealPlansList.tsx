'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MealPlan {
  id: number
  name: string
  description: string
  target_calories: number
  protein_ratio: number
  carbs_ratio: number
  fat_ratio: number
  difficulty: string
  category: string
  duration_weeks: number
}

interface CalorieCalculation {
  age: number | ''
  weight_kg: number | ''
  height_cm: number | ''
  gender: string
  activity_level: string
  goal: string
}

interface CalorieAnalysis {
  bmr: number
  tdee: number
  target_calories: number
  calorie_adjustment: number
  goal_description: string
  bmi: number
  bmi_category: string
  macronutrients: {
    protein: { grams: number; calories: number; percentage: number }
    carbs: { grams: number; calories: number; percentage: number }
    fat: { grams: number; calories: number; percentage: number }
  }
  recommendations: string[]
}

export default function MealPlansList() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [showCalorieCalculator, setShowCalorieCalculator] = useState(false)
  const [calorieForm, setCalorieForm] = useState<CalorieCalculation>({
    age: 25,
    weight_kg: 70,
    height_cm: 170,
    gender: 'male',
    activity_level: 'moderately_active',
    goal: 'weight_loss'
  })
  const [calorieAnalysis, setCalorieAnalysis] = useState<CalorieAnalysis | null>(null)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    fetchMealPlans()
  }, [])

  const fetchMealPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meals/plans?limit=all')
      if (!response.ok) throw new Error('Failed to fetch meal plans')
      const data = await response.json()
      setMealPlans(data.meal_plans)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      console.error('Error fetching meal plans:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateCalories = async () => {
    try {
      setCalculating(true)
      // Validate required numeric fields and coerce
      if (calorieForm.age === '' || calorieForm.weight_kg === '' || calorieForm.height_cm === '') {
        setError('กรอกอายุ น้ำหนัก ส่วนสูงให้ครบ')
        setCalculating(false)
        return
      }
      const payload = {
        ...calorieForm,
        age: Number(calorieForm.age),
        weight_kg: Number(calorieForm.weight_kg),
        height_cm: Number(calorieForm.height_cm)
      }
      const response = await fetch('/api/meals/calculate-calories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Failed to calculate calories')
      const data = await response.json()
      setCalorieAnalysis(data.analysis)
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการคำนวณแคลอรี่')
      console.error('Error calculating calories:', err)
    } finally {
      setCalculating(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-200 text-green-900 border border-green-300'
      case 'intermediate': return 'bg-yellow-200 text-yellow-900 border border-yellow-300'
      case 'advanced': return 'bg-red-200 text-red-900 border border-red-300'
      default: return 'bg-gray-200 text-gray-900 border border-gray-300'
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

  const filteredMealPlans = mealPlans.filter(plan => {
    if (categoryFilter && plan.category !== categoryFilter) return false
    if (difficultyFilter && plan.difficulty !== difficultyFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchMealPlans}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ลองใหม่
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Calorie Calculator Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">คำนวณแคลอรี่ที่ต้องการ</h2>
          <button
            onClick={() => setShowCalorieCalculator(!showCalorieCalculator)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {showCalorieCalculator ? 'ซ่อนเครื่องคำนวณ' : 'แสดงเครื่องคำนวณ'}
          </button>
        </div>

                  {showCalorieCalculator && (
            <div className="space-y-8 bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">อายุ</label>
                <input
                  type="number"
                  value={calorieForm.age === '' ? '' : calorieForm.age}
                  onChange={(e) => {
                    const v = e.target.value
                    setCalorieForm({...calorieForm, age: v === '' ? '' : parseInt(v)})
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium"
                  min="15"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">น้ำหนัก (กก.)</label>
                <input
                  type="number"
                  value={calorieForm.weight_kg === '' ? '' : calorieForm.weight_kg}
                  onChange={(e) => {
                    const v = e.target.value
                    setCalorieForm({...calorieForm, weight_kg: v === '' ? '' : parseFloat(v)})
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium"
                  min="30"
                  max="200"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ส่วนสูง (ซม.)</label>
                <input
                  type="number"
                  value={calorieForm.height_cm === '' ? '' : calorieForm.height_cm}
                  onChange={(e) => {
                    const v = e.target.value
                    setCalorieForm({...calorieForm, height_cm: v === '' ? '' : parseInt(v)})
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium"
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">เพศ</label>
                <select
                  value={calorieForm.gender}
                  onChange={(e) => setCalorieForm({...calorieForm, gender: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ระดับกิจกรรม</label>
                <select
                  value={calorieForm.activity_level}
                  onChange={(e) => setCalorieForm({...calorieForm, activity_level: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium"
                >
                  <option value="sedentary">นั่งทำงาน (ออกกำลังกายน้อย)</option>
                  <option value="lightly_active">ออกกำลังกายเบา 1-3 วัน/สัปดาห์</option>
                  <option value="moderately_active">ออกกำลังกายปานกลาง 3-5 วัน/สัปดาห์</option>
                  <option value="very_active">ออกกำลังกายหนัก 6-7 วัน/สัปดาห์</option>
                  <option value="extremely_active">ออกกำลังกายหนักมาก หรือทำงานใช้แรงงาน</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">เป้าหมาย</label>
                <select
                  value={calorieForm.goal}
                  onChange={(e) => setCalorieForm({...calorieForm, goal: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium"
                >
                  <option value="weight_loss">ลดน้ำหนัก</option>
                  <option value="muscle_gain">เพิ่มกล้ามเนื้อ</option>
                  <option value="maintenance">รักษาน้ำหนัก</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculateCalories}
              disabled={calculating}
              className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {calculating ? 'กำลังคำนวณ...' : 'คำนวณแคลอรี่'}
            </button>

            {calorieAnalysis && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-blue-900 mb-6">ผลการวิเคราะห์</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-6 border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-4 text-lg">ข้อมูลพื้นฐาน</h4>
                    <ul className="space-y-4 text-base">
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">BMR:</span>
                        <span className="font-bold text-blue-900">{calorieAnalysis.bmr} แคลอรี่/วัน</span>
                      </li>
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">TDEE:</span>
                        <span className="font-bold text-blue-900">{calorieAnalysis.tdee} แคลอรี่/วัน</span>
                      </li>
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">เป้าหมาย:</span>
                        <span className="font-bold text-blue-900">{calorieAnalysis.target_calories} แคลอรี่/วัน</span>
                      </li>
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">BMI:</span>
                        <span className="font-bold text-blue-900">{calorieAnalysis.bmi} ({calorieAnalysis.bmi_category})</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-4 text-lg">สัดส่วนสารอาหาร</h4>
                    <ul className="space-y-4 text-base">
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">โปรตีน:</span>
                        <span className="font-bold text-blue-900">{calorieAnalysis.macronutrients.protein.grams}g ({calorieAnalysis.macronutrients.protein.percentage}%)</span>
                      </li>
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">คาร์โบไฮเดรต:</span>
                        <span className="font-bold text-blue-900">{calorieAnalysis.macronutrients.carbs.grams}g ({calorieAnalysis.macronutrients.carbs.percentage}%)</span>
                      </li>
                      <li className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-lg">
                        <span className="text-blue-700 font-medium">ไขมัน:</span>
                        <span className="text-blue-900 font-bold">{calorieAnalysis.macronutrients.fat.grams}g ({calorieAnalysis.macronutrients.fat.percentage}%)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">โปรแกรมอาหาร</h2>
        
        <div className="flex flex-wrap gap-8 mb-8">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">หมวดหมู่</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium min-w-[160px]"
            >
              <option value="">ทุกหมวดหมู่</option>
              <option value="weight_loss">ลดน้ำหนัก</option>
              <option value="muscle_gain">เพิ่มกล้ามเนื้อ</option>
              <option value="general">สุขภาพทั่วไป</option>
              <option value="vegetarian">มังสวิรัติ</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-2">ระดับความยาก</label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium min-w-[160px]"
            >
              <option value="">ทุกระดับ</option>
              <option value="beginner">เริ่มต้น</option>
              <option value="intermediate">ปานกลาง</option>
            <option value="advanced">ขั้นสูง</option>
            </select>
          </div>
        </div>

        {/* Meal Plans Grid */}
        {filteredMealPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบโปรแกรมอาหาร</h3>
            <p className="text-gray-600">ลองเปลี่ยนตัวกรองหรือกลับมาดูใหม่ภายหลัง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMealPlans.map((plan) => (
              <Link key={plan.id} href={`/meal-plans/${plan.id}`}>
                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-blue-200 rounded-2xl flex items-center justify-center border-2 border-blue-300">
                      <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                    </div>
                    <span className={`px-3 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(plan.difficulty)}`}>
                      {getDifficultyText(plan.difficulty)}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                  <p className="text-gray-700 text-base mb-6 line-clamp-2">{plan.description}</p>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">แคลอรี่:</span>
                      <span className="font-bold text-blue-700 text-lg">{plan.target_calories}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">หมวดหมู่:</span>
                      <span className="font-semibold text-gray-800">{getCategoryText(plan.category)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">ระยะเวลา:</span>
                      <span className="font-semibold text-gray-800">{plan.duration_weeks} สัปดาห์</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
