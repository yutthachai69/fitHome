import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import WorkoutProgramsList from '@/components/WorkoutProgramsList'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6">เพื่อเข้าถึงโปรแกรมการออกกำลังกาย</p>
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

  // ดึงโปรแกรมที่ผู้ใช้กำลังทำอยู่
  const activeProgramsResult = await query(
    `SELECT 
      uap.*,
      wp.name as program_name,
      wp.description as program_description,
      wp.difficulty,
      wp.duration_weeks,
      wp.category,
      wp.image_url
     FROM user_active_programs uap
     JOIN workout_programs wp ON uap.program_id = wp.id
     WHERE uap.user_id = $1 AND uap.is_active = true
     ORDER BY uap.created_at DESC`,
    [session.user.id]
  )
  const activePrograms = activeProgramsResult.rows

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
                              <Link href="/dashboard" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
                  FitAI Coach
                </Link>
              <div className="hidden sm:block text-gray-500">|</div>
              <div className="text-sm sm:text-base text-gray-700">โปรแกรมการออกกำลังกาย</div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base flex items-center space-x-2 hover:scale-105 transform"
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  โปรแกรมการออกกำลังกาย 💪
                </h1>
              </div>
              <p className="text-white/90 text-lg sm:text-xl">
                  เลือกโปรแกรมที่เหมาะกับคุณและเริ่มต้นการเดินทางสู่สุขภาพที่ดีขึ้น
              </p>
            </div>
          </div>
        </div>

        {/* Active Programs */}
        {activePrograms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">โปรแกรมที่กำลังทำอยู่</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePrograms.map((program) => (
                <div key={program.id} className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                      สัปดาห์ที่ {program.current_week}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{program.program_name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{program.program_description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>ความยาก: {program.difficulty}</span>
                    <span>{program.duration_weeks} สัปดาห์</span>
                  </div>
                  <Link
                    href={`/workouts/program/${program.program_id}`}
                    className="mt-4 w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all text-center block"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Programs */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">โปรแกรมที่แนะนำ</h2>
          <WorkoutProgramsList />
        </div>
      </main>
    </div>
  )
}

