import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { calcBMI } from '@/lib/utils'
import ProfileForm from '@/components/ProfileForm'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6">เพื่อเข้าถึงโปรไฟล์ของคุณ</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    )
  }

  // ดึงข้อมูลผู้ใช้
  const userResult = await query(
    'SELECT * FROM users WHERE id = $1',
    [session.user.id]
  )
  const user = userResult.rows[0]

  // ดึงข้อมูลเป้าหมาย
  const goalResult = await query(
    'SELECT * FROM goals WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
    [session.user.id]
  )
  const currentGoal = goalResult.rows[0]

  // ดึงโปรแกรมออกกำลังกายที่กำลังใช้งาน
  const activeWorkoutResult = await query(`
    SELECT 
      uap.*, 
      wp.id as program_id,
      wp.name as program_name,
      wp.description as program_description,
      wp.difficulty,
      wp.duration_weeks,
      wp.category
    FROM user_active_programs uap
    JOIN workout_programs wp ON uap.program_id = wp.id
    WHERE uap.user_id = $1 AND uap.is_active = true
    ORDER BY uap.created_at DESC
    LIMIT 1
  `, [session.user.id])
  const activeWorkout = activeWorkoutResult.rows[0]

  // ดึงโปรแกรมอาหารที่กำลังใช้งาน
  const activeMealPlanResult = await query(`
    SELECT 
      ump.*,
      mp.id as meal_plan_id,
      mp.name as plan_name,
      mp.description as plan_description,
      mp.target_calories,
      mp.duration_weeks,
      mp.category
    FROM user_meal_plans ump
    JOIN meal_plans mp ON ump.meal_plan_id = mp.id
    WHERE ump.user_id = $1 AND ump.is_active = true
    ORDER BY ump.created_at DESC
    LIMIT 1
  `, [session.user.id])
  const activeMealPlan = activeMealPlanResult.rows[0]

  // ดึงข้อมูลน้ำหนัก
  const weightResult = await query(
    'SELECT * FROM weight_entries WHERE user_id = $1 ORDER BY date DESC',
    [session.user.id]
  )
  const weightEntries = weightResult.rows

  // คำนวณสถิติ
  const totalEntries = weightEntries.length
  const latestWeight = weightEntries[0]?.weight_kg
  const firstWeight = weightEntries[weightEntries.length - 1]?.weight_kg
  const totalLost = firstWeight && latestWeight ? firstWeight - latestWeight : 0
  const bmi = latestWeight ? calcBMI(Number(latestWeight), user?.height_cm || undefined) : null

  // คำนวณเปอร์เซ็นต์ความคืบหน้า
  let progressPercent = 0
  if (currentGoal && firstWeight && latestWeight) {
    const totalToLose = currentGoal.start_weight_kg - currentGoal.target_weight_kg
    const currentLost = firstWeight - latestWeight
    progressPercent = Math.min(Math.max((currentLost / totalToLose) * 100, 0), 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
                              <Link href="/dashboard" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
                  FitAI Coach
                </Link>
              <div className="hidden sm:block text-gray-500">|</div>
              <div className="text-sm sm:text-base text-gray-700">โปรไฟล์</div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-transform text-sm sm:text-base flex items-center space-x-2 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>หน้าหลัก</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-100 mb-6 sm:mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {user?.name || 'ผู้ใช้'}
                </h1>
                <p className="text-gray-600 mb-3">{user?.email}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {user?.height_cm && (
                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                      ส่วนสูง: {user.height_cm} ซม.
                    </span>
                  )}
                  {user?.gender && (
                    <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                      เพศ: {user.gender === 'male' ? 'ชาย' : user.gender === 'female' ? 'หญิง' : 'อื่น ๆ'}
                    </span>
                  )}
                  {bmi && (
                    <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full font-medium">
                      BMI: {bmi}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="group bg-white rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">น้ำหนักปัจจุบัน</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {latestWeight ? `${latestWeight} กก.` : '-'}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:animate-pulse">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">น้ำหนักที่ลดได้</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {totalLost > 0 ? `-${totalLost.toFixed(1)} กก.` : '0 กก.'}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:animate-pulse">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">จำนวนการบันทึก</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalEntries}</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:animate-pulse">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">ความคืบหน้า</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{progressPercent.toFixed(1)}%</p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:animate-pulse">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Active Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                โปรแกรมออกกำลังกายที่ใช้งาน
              </h2>
              {activeWorkout && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">กำลังทำอยู่</span>
              )}
            </div>
            {activeWorkout ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold">{activeWorkout.program_name}</p>
                    <p className="text-sm text-gray-600">เริ่มเมื่อ: {new Date(activeWorkout.start_date).toLocaleDateString('th-TH')}</p>
                  </div>
                  <Link href={`/workouts/program/${activeWorkout.program_id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">ดูรายละเอียด</Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded">{activeWorkout.duration_weeks} สัปดาห์</span>
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded">สัปดาห์ที่ {activeWorkout.current_week}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-sm">ยังไม่ได้เริ่มโปรแกรมออกกำลังกาย</div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                โปรแกรมอาหารที่ใช้งาน
              </h2>
              {activeMealPlan && (
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">กำลังทำอยู่</span>
              )}
            </div>
            {activeMealPlan ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold">{activeMealPlan.plan_name}</p>
                    <p className="text-sm text-gray-600">เริ่มเมื่อ: {new Date(activeMealPlan.start_date).toLocaleDateString('th-TH')}</p>
                  </div>
                  <Link href={`/meal-plans/${activeMealPlan.meal_plan_id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">ดูรายละเอียด</Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded">{activeMealPlan.target_calories} แคล/วัน</span>
                  <span className="bg-pink-50 text-pink-700 border border-pink-200 px-2 py-1 rounded">{activeMealPlan.duration_weeks} สัปดาห์</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-sm">ยังไม่ได้เริ่มโปรแกรมอาหาร</div>
            )}
          </div>
        </div>

        {/* Current Goal */}
        {currentGoal && (
          <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 rounded-3xl shadow-2xl p-6 sm:p-8 border border-green-100 mb-6 sm:mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full -translate-y-12 translate-x-12 animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">เป้าหมายปัจจุบัน</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <p className="text-sm font-medium text-blue-600 mb-1">น้ำหนักเริ่มต้น</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-900">{currentGoal.start_weight_kg} กก.</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <p className="text-sm font-medium text-green-600 mb-1">น้ำหนักเป้าหมาย</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-900">{currentGoal.target_weight_kg} กก.</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <p className="text-sm font-medium text-purple-600 mb-1">ต้องลด</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-900">
                    {(currentGoal.start_weight_kg - currentGoal.target_weight_kg).toFixed(1)} กก.
                  </p>
                </div>
              </div>

              {currentGoal.target_date && (
                <div className="mt-4 sm:mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-orange-800">
                      เป้าหมายภายใน: {new Date(currentGoal.target_date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Form */}
        <ProfileForm user={user} />
      </main>
    </div>
  )
}
