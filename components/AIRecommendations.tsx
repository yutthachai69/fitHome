'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Program {
  id: number
  name: string
  description: string
  difficulty: string
  duration_weeks: number
  category: string
}

interface Analysis {
  user_bmi: string | null
  difficulty_reason: string
  category_reason: string
  recommended_count: number
}

interface UserData {
  current_weight: number | null
  target_weight: number | null
  height: number | null
  gender: string | null
}

interface RecommendationData {
  recommended_programs: Program[]
  analysis: Analysis
  user_data: UserData
}

export default function AIRecommendations() {
  const [data, setData] = useState<RecommendationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workouts/recommend')
      
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">AI กำลังวิเคราะห์ข้อมูล...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.recommended_programs.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่มีโปรแกรมที่แนะนำ</h3>
          <p className="text-gray-600">กรุณากรอกข้อมูลเพิ่มเติมเพื่อให้ AI แนะนำโปรแกรมที่เหมาะสม</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      {/* AI Analysis Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI แนะนำโปรแกรม</h2>
            <p className="text-gray-600">โปรแกรมที่เหมาะกับคุณโดยเฉพาะ</p>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">การวิเคราะห์ BMI</h3>
              <p className="text-sm text-gray-600">
                {data.analysis.user_bmi ? `BMI: ${data.analysis.user_bmi}` : 'ไม่สามารถคำนวณได้'}
              </p>
              <p className="text-sm text-gray-600">{data.analysis.difficulty_reason}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">เป้าหมาย</h3>
              <p className="text-sm text-gray-600">{data.analysis.category_reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Programs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          โปรแกรมที่แนะนำ ({data.recommended_programs.length} โปรแกรม)
        </h3>
        
        {data.recommended_programs.map((program) => (
          <div key={program.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{program.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                    {getDifficultyText(program.difficulty)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getCategoryText(program.category)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {program.duration_weeks} สัปดาห์
                  </span>
                </div>
              </div>
              <Link
                href={`/workouts/program/${program.id}`}
                className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="mt-6 text-center">
        <Link
          href="/workouts"
          className="inline-block bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
        >
          ดูโปรแกรมทั้งหมด
        </Link>
      </div>
    </div>
  )
}

