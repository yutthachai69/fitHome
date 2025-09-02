'use client'
import { useState } from 'react'

export default function WeightForm({ onSaved }: { onSaved?: () => void }) {
  const [date, setDate] = useState<string>('')
  const [weightKg, setWeightKg] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date || undefined,
          weightKg: Number(weightKg),
          note: note || undefined,
        })
      })
      
      if (res.ok) {
        setWeightKg('')
        setNote('')
        setDate('')
        alert('บันทึกน้ำหนักเรียบร้อยแล้ว!')
        if (onSaved) onSaved()
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกน้ำหนัก')
      }
    } catch (error) {
      console.error('Error saving weight:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกน้ำหนัก')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white via-green-50 to-blue-50 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-green-100 relative overflow-hidden transition-all duration-500 hover:shadow-3xl">
      {/* Animated background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-green-400/10 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-green-400/5 to-blue-400/5 rounded-full -translate-x-8 -translate-y-8 animate-ping"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform hover:scale-110 transition-all duration-300 hover:rotate-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            อัปเดตน้ำหนัก (รายสัปดาห์)
          </h2>
        </div>
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                วันที่
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                น้ำหนัก (กก.) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                  placeholder="65.5"
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="sm:col-span-2 group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                โน้ต (เช่น เช้า/เย็น)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                  placeholder="บันทึกในตอนเช้า"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white py-4 px-8 rounded-2xl font-semibold hover:from-green-600 hover:via-blue-600 hover:to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg text-base flex items-center justify-center space-x-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>บันทึกน้ำหนัก</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
