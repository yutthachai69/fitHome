import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'
import { notFound } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import StartWorkoutProgramButton from '@/components/StartWorkoutProgramButton'
import Link from 'next/link'

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center max-w-sm w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 mb-6">เพื่อเข้าถึงรายละเอียดโปรแกรม</p>
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

  const programId = parseInt(params.id)
  
  // ดึงข้อมูลโปรแกรม
  const programResult = await query(
    'SELECT * FROM workout_programs WHERE id = $1',
    [programId]
  )
  
  if (programResult.rows.length === 0) {
    notFound()
  }
  
  const program = programResult.rows[0]

  // ดึงข้อมูลท่าออกกำลังกายในโปรแกรมนี้
  const exercisesResult = await query(
    `SELECT 
      pe.*, we.name as exercise_name, we.description as exercise_description,
      we.muscle_group, we.equipment, we.difficulty as exercise_difficulty,
      we.instructions, we.video_url, we.image_url as exercise_image
     FROM program_exercises pe
     JOIN workout_exercises we ON pe.exercise_id = we.id
     WHERE pe.program_id = $1
     ORDER BY pe.day_of_week, pe.order_index`,
    [programId]
  )
  
  const exercises = exercisesResult.rows

  // จัดกลุ่มท่าตามวัน
  type ExerciseItem = {
    id: number
    day_of_week: number
    exercise_name: string
    exercise_description: string
    exercise_difficulty: string
    sets?: number | null
    reps?: number | null
    duration_minutes?: number | null
    rest_seconds?: number | null
  }

  const exercisesByDay = (exercises as ExerciseItem[]).reduce((acc, exercise) => {
    const day = exercise.day_of_week
    if (!acc[day]) { acc[day] = [] }
    acc[day].push(exercise)
    return acc
  }, {} as Record<number, ExerciseItem[]>)

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
      case 'cardio': return 'คาร์ดิโอ'
      case 'flexibility': return 'ยืดหยุ่น'
      default: return category
    }
  }

  const dayNames = ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
                              <Link href="/workouts" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
                  FitAI Coach
                </Link>
              <div className="hidden sm:block text-gray-500">|</div>
              <div className="text-sm sm:text-base text-gray-700">รายละเอียดโปรแกรม</div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/workouts"
                className="text-gray-600 hover:text-blue-600 transition-transform text-sm sm:text-base flex items-center space-x-2 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับ</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Program Header */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-100 mb-6 sm:mb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Program Icon */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                💪
              </div>

              {/* Program Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {program.name}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(program.difficulty)}`}>
                    {getDifficultyText(program.difficulty)}
                  </span>
                </div>
                <p className="text-gray-600 mb-3 text-lg">{program.description}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {getCategoryText(program.category)}
                  </span>
                  <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                    {program.duration_weeks} สัปดาห์
                  </span>
                  <span className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 px-3 py-1 rounded-full font-medium">
                    {exercises.length} ท่า
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Program Content */}
        {exercises.length > 0 ? (
          <div className="space-y-6">
            {Object.keys(exercisesByDay).sort((a, b) => parseInt(a) - parseInt(b)).map((day) => {
              const dayNumber = parseInt(day)
              const dayExercises = (exercisesByDay[dayNumber] || []) as ExerciseItem[]
              return (
              <div key={day} className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  วัน{dayNames[dayNumber]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayExercises.map((exercise, index) => (
                    <div key={exercise.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{exercise.exercise_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.exercise_difficulty)}`}>
                          {getDifficultyText(exercise.exercise_difficulty)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{exercise.exercise_description}</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        {exercise.sets && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">เซ็ต:</span>
                            <span>{exercise.sets}</span>
                          </div>
                        )}
                        {exercise.reps && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">ครั้ง:</span>
                            <span>{exercise.reps}</span>
                          </div>
                        )}
                        {exercise.duration_minutes && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">เวลา:</span>
                            <span>{exercise.duration_minutes} นาที</span>
                          </div>
                        )}
                        {exercise.rest_seconds && (
                          <div className="flex items-center">
                            <span className="font-medium w-16">พัก:</span>
                            <span>{exercise.rest_seconds} วินาที</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีท่าออกกำลังกาย</h3>
            <p className="text-gray-600">โปรแกรมนี้ยังไม่ได้เพิ่มท่าออกกำลังกาย</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <StartWorkoutProgramButton programId={program.id} />
          </div>
          <Link
            href="/workouts"
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all text-center"
          >
            ดูโปรแกรมอื่น
          </Link>
        </div>
      </main>
    </div>
  )
}
