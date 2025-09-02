'use client'
import { useState } from 'react'

interface User {
  id: number
  name: string | null
  email: string
  height_cm: number | null
  gender: string | null
  birth_date: string | null
}

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: user.name || '',
    heightCm: user.height_cm?.toString() || '',
    gender: user.gender || '',
    birthDate: user.birth_date || ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name || null,
          heightCm: form.heightCm ? Number(form.heightCm) : null,
          gender: form.gender || null,
          birthDate: form.birthDate || null,
        })
      })
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว!' })
        // รีเฟรชหน้าเพื่อแสดงข้อมูลใหม่
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setForm({
      name: user.name || '',
      heightCm: user.height_cm?.toString() || '',
      gender: user.gender || '',
      birthDate: user.birth_date || ''
    })
    setMessage(null)
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-blue-100 relative overflow-hidden transition-all duration-500 hover:shadow-3xl">
      {/* Animated background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full -translate-x-8 -translate-y-8 animate-ping"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform hover:scale-110 transition-all duration-300 hover:rotate-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ข้อมูลส่วนตัว
            </h2>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg text-sm sm:text-base flex items-center space-x-3 hover:animate-wiggle"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>แก้ไขโปรไฟล์</span>
            </button>
          )}
        </div>

        {!isEditing ? (
          // แสดงข้อมูลแบบอ่านอย่างเดียว
          <div className="space-y-6 opacity-0 animate-fadeIn" style={{animationFillMode: 'forwards'}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mr-3 group-hover:animate-pulse">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-blue-700">ชื่อ</p>
                </div>
                <p className="text-xl font-bold text-blue-900">{user.name || 'ไม่ระบุ'}</p>
              </div>
              
              <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center mr-3 group-hover:animate-pulse">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-green-700">ส่วนสูง</p>
                </div>
                <p className="text-xl font-bold text-green-900">{user.height_cm ? `${user.height_cm} ซม.` : 'ไม่ระบุ'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-xl flex items-center justify-center mr-3 group-hover:animate-pulse">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-purple-700">เพศ</p>
                </div>
                <p className="text-xl font-bold text-purple-900">
                  {user.gender === 'male' ? 'ชาย' : user.gender === 'female' ? 'หญิง' : user.gender === 'other' ? 'อื่น ๆ' : 'ไม่ระบุ'}
                </p>
              </div>
              
              <div className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center mr-3 group-hover:animate-pulse">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-orange-700">วันเกิด</p>
                </div>
                <p className="text-xl font-bold text-orange-900">
                  {user.birth_date ? new Date(user.birth_date).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                </p>
              </div>
            </div>
            
            <div className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center mr-3 group-hover:animate-pulse">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-indigo-700">อีเมล</p>
              </div>
              <p className="text-xl font-bold text-indigo-900">{user.email}</p>
            </div>
          </div>
        ) : (
          // แสดงฟอร์มแก้ไข
          <div className="opacity-0 animate-slideIn" style={{animationFillMode: 'forwards'}}>
            {message && (
              <div className={`mb-6 p-4 rounded-2xl border-2 ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
              } animate-bounce`}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className="font-semibold">{message.text}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ชื่อ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                      placeholder="ชื่อของคุณ"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ส่วนสูง (ซม.)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                      type="number"
                      placeholder="170"
                      value={form.heightCm}
                      onChange={e => setForm(f => ({ ...f, heightCm: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    เพศ
                  </label>
                  <select
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  >
                    <option value="">ไม่ระบุ</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่น ๆ</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    วันเกิด
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 text-base bg-white shadow-sm hover:shadow-md"
                      type="date"
                      value={form.birthDate}
                      onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-xl">
                  อีเมล: <span className="font-semibold text-gray-800">{user.email}</span>
                </div>
                
                <div className="flex space-x-4 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-gray-500 to-gray-600 text-white py-4 px-8 rounded-2xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-base"
                  >
                    ยกเลิก
                  </button>
                  <button
                    disabled={loading}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg text-base flex items-center justify-center space-x-3"
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
                        <span>บันทึกการเปลี่ยนแปลง</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
