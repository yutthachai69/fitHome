'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StartWorkoutProgramButtonProps {
  programId: number
}

export default function StartWorkoutProgramButton({ programId }: StartWorkoutProgramButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const startProgram = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/workouts/user-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_id: programId })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'เริ่มโปรแกรมไม่สำเร็จ')
      }

      router.push('/workout-tracker')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={startProgram}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 transition-all transform hover:scale-105"
      >
        {loading ? 'กำลังเริ่มโปรแกรม...' : 'เริ่มโปรแกรมนี้'}
      </button>
      {error && (
        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  )
}


