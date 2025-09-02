# FitAI Coach - AI Personal Trainer

แอพพลิเคชันสำหรับติดตามการลดน้ำหนัก ตั้งเป้า อัปเดตน้ำหนักรายสัปดาห์ และดูกราฟความคืบหน้า

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (ใช้ pgAdmin)
- **Authentication**: NextAuth.js v4
- **Charts**: Recharts
- **Styling**: Tailwind CSS v3

## การติดตั้ง

### 1. Clone โปรเจกต์
```bash
git clone <repository-url>
cd fit-home
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่าฐานข้อมูล PostgreSQL

#### 3.1 สร้างฐานข้อมูล
เปิด pgAdmin และสร้างฐานข้อมูลใหม่ชื่อ `fitdb`

#### 3.2 รัน SQL Schema
คัดลอกเนื้อหาจากไฟล์ `database/schema.sql` และรันใน pgAdmin หรือ psql:

```sql
-- สร้างตาราง Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  height_cm INTEGER,
  gender VARCHAR(10),
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Goals
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE DEFAULT CURRENT_DATE,
  start_weight_kg DECIMAL(5,2) NOT NULL,
  target_weight_kg DECIMAL(5,2) NOT NULL,
  target_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Weight Entries
CREATE TABLE IF NOT EXISTS weight_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- สร้าง Indexes
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, is_active);
```

### 4. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์หลัก:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=fitdb
DB_PASSWORD=your_password_here
DB_PORT=5432

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
```

### 5. รันโปรเจกต์
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

## การใช้งาน

### 1. สมัครสมาชิก
- ไปที่หน้า `/register`
- กรอกข้อมูลส่วนตัว อีเมล รหัสผ่าน
- เลือกส่วนสูงและเพศ (ไม่บังคับ)

### 2. เข้าสู่ระบบ
- ไปที่หน้า `/login`
- กรอกอีเมลและรหัสผ่าน

### 3. ตั้งเป้าการลดน้ำหนัก
- ไปที่หน้า `/dashboard`
- กรอกน้ำหนักเริ่มต้น น้ำหนักเป้า และวันที่เป้าหมาย
- กดบันทึกเป้า

### 4. บันทึกน้ำหนัก
- กรอกวันที่ น้ำหนัก และโน้ต (ไม่บังคับ)
- กดบันทึกน้ำหนัก

### 5. ดูกราฟความคืบหน้า
- กราฟจะแสดงน้ำหนักตามเวลาอัตโนมัติ
- ดูแนวโน้มการลดน้ำหนัก

## โครงสร้างโปรเจกต์

```
fit-home/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # NextAuth
│   │   ├── goal/              # จัดการเป้า
│   │   ├── register/          # สมัครสมาชิก
│   │   └── weight/            # บันทึกน้ำหนัก
│   ├── dashboard/             # หน้าหลัก
│   ├── login/                 # หน้าล็อกอิน
│   ├── register/              # หน้าสมัครสมาชิก
│   ├── globals.css            # Global CSS
│   ├── layout.tsx             # Root Layout
│   └── page.tsx               # หน้าแรก
├── components/                # React Components
│   ├── GoalForm.tsx          # ฟอร์มตั้งเป้า
│   ├── ProgressChart.tsx     # กราฟความคืบหน้า
│   └── WeightForm.tsx        # ฟอร์มบันทึกน้ำหนัก
├── lib/                      # Utilities
│   ├── auth.ts               # NextAuth config
│   ├── db.ts                 # Database connection
│   └── utils.ts              # Helper functions
├── database/
│   └── schema.sql            # Database schema
└── package.json
```

## ฟีเจอร์

- ✅ สมัครสมาชิกและล็อกอิน
- ✅ ตั้งเป้าการลดน้ำหนัก
- ✅ บันทึกน้ำหนักรายสัปดาห์
- ✅ กราฟความคืบหน้าแบบเรียลไทม์
- ✅ คำนวณ BMI
- ✅ Responsive Design
- ✅ TypeScript Support

## การพัฒนาต่อ

### ฟีเจอร์ที่แนะนำเพิ่มเติม:
- การออกกำลังกาย (Exercise tracking)
- การบันทึกอาหาร (Meal logging)
- การคำนวณแคลอรี (Calorie calculation)
- การแจ้งเตือน (Notifications)
- การส่งออกข้อมูล (Data export)
- การแชร์ผลลัพธ์ (Social sharing)

## การแก้ไขปัญหา

### 1. ฐานข้อมูลไม่เชื่อมต่อ
- ตรวจสอบการตั้งค่าใน `.env.local`
- ตรวจสอบว่า PostgreSQL ทำงานอยู่
- ตรวจสอบสิทธิ์การเข้าถึงฐานข้อมูล

### 2. NextAuth ไม่ทำงาน
- ตรวจสอบ `NEXTAUTH_SECRET` ใน `.env.local`
- ตรวจสอบ `NEXTAUTH_URL` ให้ตรงกับ URL ที่ใช้งาน

### 3. Tailwind CSS ไม่แสดงผล
- ตรวจสอบการ import `globals.css` ใน `layout.tsx`
- รัน `npm run dev` ใหม่

## License

MIT License
