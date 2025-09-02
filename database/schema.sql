-- สร้างตาราง Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  height_cm INTEGER,
  gender VARCHAR(10), -- 'male', 'female', 'other'
  birth_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Goals (เป้าการลดน้ำหนัก)
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

-- สร้างตาราง Weight Entries (บันทึกน้ำหนัก)
CREATE TABLE IF NOT EXISTS weight_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- สร้างตาราง Workout Programs (โปรแกรมการออกกำลังกาย)
CREATE TABLE IF NOT EXISTS workout_programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  duration_weeks INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'weight_loss', 'muscle_gain', 'cardio', 'flexibility'
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Workout Exercises (ท่าออกกำลังกาย)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  muscle_group VARCHAR(100), -- 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'
  equipment VARCHAR(100), -- 'bodyweight', 'dumbbells', 'barbell', 'machine', 'cardio'
  difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  instructions TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง Program Exercises (ความสัมพันธ์ระหว่างโปรแกรมและท่าออกกำลังกาย)
CREATE TABLE IF NOT EXISTS program_exercises (
  id SERIAL PRIMARY KEY,
  program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES workout_exercises(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 1-7 (จันทร์-อาทิตย์)
  sets INTEGER,
  reps INTEGER,
  duration_minutes INTEGER,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง User Workout Progress (ความคืบหน้าของผู้ใช้)
CREATE TABLE IF NOT EXISTS user_workout_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES workout_exercises(id) ON DELETE CASCADE,
  workout_date DATE DEFAULT CURRENT_DATE,
  sets_completed INTEGER,
  reps_completed INTEGER,
  duration_minutes INTEGER,
  weight_kg DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง User Active Programs (โปรแกรมที่ผู้ใช้กำลังทำอยู่)
CREATE TABLE IF NOT EXISTS user_active_programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  program_id INTEGER REFERENCES workout_programs(id) ON DELETE CASCADE,
  start_date DATE DEFAULT CURRENT_DATE,
  current_week INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Indexes เพื่อเพิ่มประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_weight_entries_user_date ON weight_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_active ON goals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_program_exercises_program_day ON program_exercises(program_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_user_workout_progress_user_date ON user_workout_progress(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_user_active_programs_user_active ON user_active_programs(user_id, is_active);

-- สร้าง Function สำหรับอัปเดต updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- เพิ่ม birth_date column ถ้ายังไม่มี (สำหรับการอัปเดต schema ที่มีอยู่แล้ว)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'birth_date') THEN
        ALTER TABLE users ADD COLUMN birth_date DATE;
    END IF;
END $$;
