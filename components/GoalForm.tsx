'use client'
import { useEffect, useState } from 'react'

export default function GoalForm() {
  const [goal, setGoal] = useState<unknown>(null)
  const [form, setForm] = useState({ startWeightKg: '', targetWeightKg: '', targetDate: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGoal()
  }, [])

  const fetchGoal = async () => {
    try {
      const res = await fetch('/api/goal')
      const data = await res.json()
      setGoal(data.goal)
    } catch (error) {
      console.error('Error fetching goal:', error)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startWeightKg: Number(form.startWeightKg),
          targetWeightKg: Number(form.targetWeightKg),
          targetDate: form.targetDate || null,
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setGoal(data.goal)
        setForm({ startWeightKg: '', targetWeightKg: '', targetDate: '' })
        alert('บันทึกเป้าเรียบร้อยแล้ว!')
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกเป้า')
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกเป้า')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-blue-100 relative overflow-hidden transition-all duration-500 hover:shadow-3xl">
      {/* Animated background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full -translate-x-8 -translate-y-8 animate-ping"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform hover:scale-110 transition-all duration-300 hover:rotate-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ตั้งเป้าการลดน้ำหนัก
          </h2>
        </div>
        
        {goal && (
          <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base font-semibold text-blue-800">เป้าปัจจุบัน</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-blue-900">
              {goal.start_weight_kg} → {goal.target_weight_kg} กก.
              {goal.target_date && (
                <span className="text-sm font-normal text-blue-700 ml-2 block sm:inline">
                  (ภายใน {new Date(goal.target_date).toLocaleDateString('th-TH')})
                </span>
              )}
            </div>
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                น้ำหนักเริ่มต้น (กก.)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                  placeholder="70.0"
                  type="number"
                  step="0.1"
                  value={form.startWeightKg}
                  onChange={e => setForm(f => ({ ...f, startWeightKg: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                น้ำหนักเป้า (กก.)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                  placeholder="60.0"
                  type="number"
                  step="0.1"
                  value={form.targetWeightKg}
                  onChange={e => setForm(f => ({ ...f, targetWeightKg: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-1 group">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                วันที่เป้าหมาย
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg text-base flex items-center justify-center space-x-3"
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
                <span>บันทึกเป้า</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
