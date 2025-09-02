'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface WorkoutProgram {
  id: number
  name: string
  description: string
  difficulty: string
  duration_weeks: number
  category: string
  image_url?: string
  exercise_count: number
  avg_duration: number
}

export default function WorkoutProgramsList() {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')

  useEffect(() => {
    fetchPrograms()
  }, [selectedCategory, selectedDifficulty])

  const fetchPrograms = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
      
      const res = await fetch(`/api/workouts/programs?${params.toString()}`)
      const data = await res.json()
      setPrograms(data.programs || [])
    } catch (error) {
      console.error('Error fetching programs:', error)
    } finally {
      setLoading(false)
    }
  }
  const getDefaultImage = (category: string) => {
    switch (category) {
      case 'weight_loss':
        return 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1600&auto=format&fit=crop';
      case 'muscle_gain':
        return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop';
      case 'cardio':
        return 'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=1600&auto=format&fit=crop';
      case 'flexibility':
        return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop';
      default:
        return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop';
    }
  }

  const getOverlayClass = (category: string) => {
    switch (category) {
      case 'weight_loss':
        return 'bg-green-500/20'
      case 'muscle_gain':
        return 'bg-purple-500/20'
      case 'cardio':
        return 'bg-orange-500/20'
      case 'flexibility':
        return 'bg-indigo-500/20'
      default:
        return 'bg-blue-500/20'
    }
  }

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight_loss':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'muscle_gain':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'cardio':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'flexibility':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">หมวดหมู่</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium min-w-[160px]"
          >
            <option value="">ทุกหมวดหมู่</option>
            <option value="weight_loss">ลดน้ำหนัก</option>
            <option value="muscle_gain">เพิ่มกล้ามเนื้อ</option>
            <option value="cardio">คาร์ดิโอ</option>
            <option value="flexibility">ยืดหยุ่น</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">ระดับความยาก</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-800 font-medium min-w-[160px]"
          >
            <option value="">ทุกระดับ</option>
            <option value="beginner">เริ่มต้น</option>
            <option value="intermediate">ปานกลาง</option>
            <option value="advanced">ขั้นสูง</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบโปรแกรม</h3>
          <p className="text-gray-600">ลองเปลี่ยนตัวกรองหรือกลับมาดูใหม่ภายหลัง</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="group bg-white rounded-3xl shadow-xl border-2 border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
              {/* Program Image */}
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={program.image_url || getDefaultImage(program.category)} 
                  alt={program.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter contrast-110 saturate-110 brightness-95"
                  loading="lazy"
                />
                {/* Color wash to unify look */}
                <div className={`absolute inset-0 ${getOverlayClass(program.category)} mix-blend-multiply`}></div>
                {/* Subtle top-to-bottom gradient for consistency */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(program.difficulty)}`}>
                    {getDifficultyText(program.difficulty)}
                  </span>
                </div>
              </div>

              {/* Program Content */}
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    {getCategoryIcon(program.category)}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {getCategoryText(program.category)}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {program.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {program.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {program.duration_weeks} สัปดาห์</span>
                  <span>🏋️ {program.exercise_count} ท่า</span>
                  {program.avg_duration && (
                    <span>⏰ {Math.round(program.avg_duration)} นาที</span>
                  )}
                </div>

                <Link
                  href={`/workouts/program/${program.id}`}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-center block transform hover:scale-105"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
