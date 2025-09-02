import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">FitAI Coach</div>
          <div className="space-x-3 sm:space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
              ล็อกอิน
            </Link>
            <Link href="/register" className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm sm:text-base">
              สมัครสมาชิก
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Personal Trainer
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            เทรนเนอร์อัจฉริยะ
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 block">ส่วนตัวของคุณ</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-800 mb-6 sm:mb-8 leading-relaxed max-w-3xl mx-auto">
            ระบบ AI ที่จะแนะนำโปรแกรมการออกกำลังกายและโภชนาการที่เหมาะกับคุณ
            <br className="hidden md:block" />
            ติดตามความคืบหน้า วิเคราะห์ข้อมูล และปรับโปรแกรมอัตโนมัติ
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              เริ่มใช้งานฟรี
            </Link>
            <Link
              href="/login"
              className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-blue-50 transition-all"
            >
              ล็อกอิน
            </Link>
          </div>

          {/* AI Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-20">
            <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">AI แนะนำโปรแกรม</h3>
              <p className="text-sm sm:text-base text-gray-700">เลือกโปรแกรมที่เหมาะกับคุณโดยอัตโนมัติ</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">โปรแกรมออกกำลังกาย</h3>
              <p className="text-sm sm:text-base text-gray-700">ยิมและบอดี้เวท ครบทุกความต้องการ</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">วิเคราะห์ข้อมูล</h3>
              <p className="text-sm sm:text-base text-gray-700">ติดตาม BMI และความคืบหน้าอย่างละเอียด</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">ปรับโปรแกรมอัตโนมัติ</h3>
              <p className="text-sm sm:text-base text-gray-700">ปรับความยากตามความคืบหน้าของคุณ</p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-16 sm:mt-24">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">วิธีการทำงาน</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">กรอกข้อมูล</h3>
                <p className="text-gray-700">บอกเราเกี่ยวกับเป้าหมายและข้อมูลร่างกายของคุณ</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">AI แนะนำ</h3>
                <p className="text-gray-700">ระบบ AI จะเลือกโปรแกรมที่เหมาะกับคุณ</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">ติดตามผล</h3>
                <p className="text-gray-700">ดูความคืบหน้าและปรับโปรแกรมตามผลลัพธ์</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 sm:mt-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 sm:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">พร้อมเริ่มต้นการเดินทางสู่สุขภาพที่ดีขึ้น?</h2>
            <p className="text-lg mb-6 opacity-90">เข้าร่วมกับเราและพบกับเทรนเนอร์อัจฉริยะส่วนตัวของคุณ</p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              เริ่มต้นตอนนี้
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12 sm:mt-20 py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-gray-700 text-sm sm:text-base">
          <p>&copy; 2024 FitAI Coach. สร้างด้วย Next.js และ Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}
