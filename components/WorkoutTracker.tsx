'use client'

import { useState, useEffect } from 'react'

interface Program {
  id: number
  name: string
  description: string
  difficulty: string
  category: string
}

interface Exercise {
  id: number
  name: string
  description: string
  muscle_group: string
  equipment: string
  difficulty: string
}

interface WorkoutLog {
  id: number
  program_name: string
  exercise_name: string
  sets_completed: number
  reps_completed: number
  weight_kg: number
  duration_minutes: number
  notes: string
  workout_date: string
  created_at: string
}

export default function WorkoutTracker() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    program_id: '',
    exercise_id: '',
    sets_completed: '',
    reps_completed: '',
    weight_kg: '',
    duration_minutes: '',
    notes: '',
    workout_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // ดึงโปรแกรม
      const programsResponse = await fetch('/api/workouts/programs')
      const programsData = await programsResponse.json()
      setPrograms(programsData.programs || [])

      // ดึงท่าออกกำลังกาย
      const exercisesResponse = await fetch('/api/workouts/exercises')
      const exercisesData = await exercisesResponse.json()
      setExercises(exercisesData.exercises || [])

      // ดึงประวัติการออกกำลังกาย
      const logsResponse = await fetch('/api/workouts/log')
      const logsData = await logsResponse.json()
      setWorkoutLogs(logsData.workout_logs || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.program_id || !form.exercise_id) {
      alert('กรุณาเลือกโปรแกรมและท่าออกกำลังกาย')
      return
    }

    try {
      setSubmitting(true)
      
      const response = await fetch('/api/workouts/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          sets_completed: form.sets_completed ? parseInt(form.sets_completed) : null,
          reps_completed: form.reps_completed ? parseInt(form.reps_completed) : null,
          weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
          duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        }),
      })

      if (response.ok) {
        alert('บันทึกการออกกำลังกายเรียบร้อยแล้ว!')
        setForm({
          program_id: '',
          exercise_id: '',
          sets_completed: '',
          reps_completed: '',
          weight_kg: '',
          duration_minutes: '',
          notes: '',
          workout_date: new Date().toISOString().split('T')[0]
        })
        fetchData() // รีเฟรชข้อมูล
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      console.error('Error logging workout:', error)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Log Workout Form */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">บันทึกการออกกำลังกาย</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                โปรแกรม *
              </label>
              <select
                value={form.program_id}
                onChange={(e) => setForm({ ...form, program_id: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">เลือกโปรแกรม</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ท่าออกกำลังกาย *
              </label>
              <select
                value={form.exercise_id}
                onChange={(e) => setForm({ ...form, exercise_id: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">เลือกท่าออกกำลังกาย</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เซ็ต
              </label>
              <input
                type="number"
                value={form.sets_completed}
                onChange={(e) => setForm({ ...form, sets_completed: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ครั้ง
              </label>
              <input
                type="number"
                value={form.reps_completed}
                onChange={(e) => setForm({ ...form, reps_completed: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                น้ำหนัก (กก.)
              </label>
              <input
                type="number"
                step="0.5"
                value={form.weight_kg}
                onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เวลา (นาที)
              </label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่ออกกำลังกาย
            </label>
            <input
              type="date"
              value={form.workout_date}
              onChange={(e) => setForm({ ...form, workout_date: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              บันทึกเพิ่มเติม
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="บันทึกความรู้สึกหรือข้อสังเกต..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </div>
            ) : (
              'บันทึกการออกกำลังกาย'
            )}
          </button>
        </form>
      </div>

      {/* Workout History */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">ประวัติการออกกำลังกาย</h2>
        
        {workoutLogs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีประวัติ</h3>
            <p className="text-gray-600">เริ่มบันทึกการออกกำลังกายของคุณเลย!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutLogs.map((log) => (
              <div key={log.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{log.exercise_name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{log.program_name}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {log.sets_completed && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {log.sets_completed} เซ็ต
                        </span>
                      )}
                      {log.reps_completed && (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                          {log.reps_completed} ครั้ง
                        </span>
                      )}
                      {log.weight_kg && (
                        <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                          {log.weight_kg} กก.
                        </span>
                      )}
                      {log.duration_minutes && (
                        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                          {log.duration_minutes} นาที
                        </span>
                      )}
                    </div>
                    {log.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">&quot;{log.notes}&quot;</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(log.workout_date).toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
