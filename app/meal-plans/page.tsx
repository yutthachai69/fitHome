import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import LogoutButton from '@/components/LogoutButton'
import MealPlansList from '@/components/MealPlansList'
import Link from 'next/link'

export default async function MealPlansPage() {
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

  const userResult = await query('SELECT * FROM users WHERE id = $1', [session.user.id])
  const user = userResult.rows[0]

  const activeMealPlansResult = await query(`
    SELECT ump.*, mp.name as plan_name, mp.description as plan_description, 
           mp.difficulty, mp.duration_weeks, mp.category
    FROM user_meal_plans ump
    JOIN meal_plans mp ON ump.meal_plan_id = mp.id
    WHERE ump.user_id = $1 AND ump.is_active = true
    ORDER BY ump.created_at DESC
  `, [session.user.id])
  const activeMealPlans = activeMealPlansResult.rows

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-blue-200">
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
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            โปรแกรมอาหาร AI
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ค้นพบโปรแกรมอาหารที่เหมาะกับคุณ ระบบ AI จะแนะนำโปรแกรมที่เหมาะสมกับเป้าหมายและไลฟ์สไตล์ของคุณ
          </p>
        </div>

        {/* Active Meal Plans Info */}
        {activeMealPlans.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              โปรแกรมอาหารที่กำลังใช้งาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMealPlans.map((plan: unknown) => (
                <div key={plan.id} className="bg-white rounded-xl p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">{plan.plan_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{plan.plan_description}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">แคลอรี่: {plan.target_calories}</span>
                    <span className="text-gray-500">{plan.duration_weeks} สัปดาห์</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <MealPlansList />
      </main>
    </div>
  )
}
