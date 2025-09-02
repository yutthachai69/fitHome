-- สร้างตาราง workout_programs ถ้ายังไม่มี
CREATE TABLE IF NOT EXISTS workout_programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL,
  duration_weeks INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง workout_exercises ถ้ายังไม่มี
CREATE TABLE IF NOT EXISTS workout_exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  muscle_group VARCHAR(100),
  equipment VARCHAR(100),
  difficulty VARCHAR(20) NOT NULL,
  instructions TEXT,
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- เพิ่มข้อมูลโปรแกรมการออกกำลังกาย
INSERT INTO workout_programs (name, description, difficulty, duration_weeks, category) VALUES
('โปรแกรมลดน้ำหนักสำหรับผู้เริ่มต้น', 'โปรแกรม 4 สัปดาห์สำหรับผู้ที่ต้องการลดน้ำหนักและเริ่มต้นการออกกำลังกาย', 'beginner', 4, 'weight_loss'),
('โปรแกรมเพิ่มกล้ามเนื้อพื้นฐาน', 'โปรแกรม 6 สัปดาห์สำหรับการสร้างกล้ามเนื้อและความแข็งแรง', 'beginner', 6, 'muscle_gain'),
('โปรแกรมคาร์ดิโอเข้มข้น', 'โปรแกรม 3 สัปดาห์สำหรับการเผาผลาญไขมันอย่างรวดเร็ว', 'intermediate', 3, 'cardio'),
('โปรแกรมยืดหยุ่นและผ่อนคลาย', 'โปรแกรม 2 สัปดาห์สำหรับการยืดกล้ามเนื้อและผ่อนคลาย', 'beginner', 2, 'flexibility'),
('โปรแกรมลดน้ำหนักขั้นสูง', 'โปรแกรม 8 สัปดาห์สำหรับผู้ที่มีประสบการณ์การออกกำลังกาย', 'advanced', 8, 'weight_loss'),
('โปรแกรมสร้างกล้ามเนื้อขั้นสูง', 'โปรแกรม 12 สัปดาห์สำหรับการสร้างกล้ามเนื้ออย่างเต็มรูปแบบ', 'advanced', 12, 'muscle_gain')
ON CONFLICT (name) DO NOTHING;

-- เพิ่มข้อมูลท่าออกกำลังกาย
INSERT INTO workout_exercises (name, description, muscle_group, equipment, difficulty, instructions) VALUES
('Burpees', 'ท่าออกกำลังกายแบบเต็มตัวที่ช่วยเผาผลาญไขมัน', 'full_body', 'bodyweight', 'intermediate', '1. ยืนตรง 2. นั่งยองๆ 3. วางมือลงพื้น 4. กระโดดกลับไปท่า plank 5. กระโดดกลับมาท่า squat 6. กระโดดขึ้นพร้อมยกมือ'),
('Jumping Jacks', 'ท่ากระโดดตบที่ช่วยเผาผลาญไขมันและเพิ่มอัตราการเต้นของหัวใจ', 'full_body', 'bodyweight', 'beginner', '1. ยืนตรง 2. กระโดดพร้อมแยกขาและยกมือขึ้น 3. กระโดดกลับมาท่าเริ่มต้น'),
('Mountain Climbers', 'ท่าที่ช่วยเผาผลาญไขมันและเสริมความแข็งแรงของแกนกลาง', 'core', 'bodyweight', 'beginner', '1. อยู่ในท่า plank 2. ดึงเข่าข้างหนึ่งเข้ามาหาอก 3. สลับข้างอย่างรวดเร็ว'),
('High Knees', 'ท่ากระโดดเข่าสูงที่ช่วยเผาผลาญไขมัน', 'legs', 'bodyweight', 'beginner', '1. ยืนตรง 2. กระโดดเข่าสูงสลับข้าง 3. ใช้แขนช่วยในการเคลื่อนไหว'),
('Push-ups', 'ท่าวิดพื้นที่ช่วยเสริมความแข็งแรงของอก แขน และไหล่', 'chest', 'bodyweight', 'beginner', '1. อยู่ในท่า plank 2. ลดตัวลงโดยงอข้อศอก 3. ดันตัวขึ้นกลับมาท่าเริ่มต้น'),
('Squats', 'ท่าลุกนั่งที่ช่วยเสริมความแข็งแรงของขาและก้น', 'legs', 'bodyweight', 'beginner', '1. ยืนแยกขากว้างเท่าหัวไหล่ 2. นั่งยองๆ เหมือนนั่งเก้าอี้ 3. ลุกขึ้นกลับมาท่าเริ่มต้น'),
('Lunges', 'ท่าก้าวยาวที่ช่วยเสริมความแข็งแรงของขา', 'legs', 'bodyweight', 'beginner', '1. ยืนตรง 2. ก้าวขาข้างหนึ่งไปข้างหน้า 3. ลดตัวลงจนเข่าหลังเกือบแตะพื้น 4. ดันตัวขึ้นกลับมาท่าเริ่มต้น'),
('Plank', 'ท่าค้างที่ช่วยเสริมความแข็งแรงของแกนกลาง', 'core', 'bodyweight', 'beginner', '1. อยู่ในท่า push-up แต่ใช้แขนงอ 2. ค้างไว้โดยให้ลำตัวเป็นเส้นตรง'),
('Running in Place', 'วิ่งอยู่กับที่เพื่อเพิ่มอัตราการเต้นของหัวใจ', 'legs', 'bodyweight', 'beginner', '1. ยืนตรง 2. วิ่งอยู่กับที่โดยยกเข่าสูง'),
('Butterfly Kicks', 'ท่าเตะขาสลับที่ช่วยเผาผลาญไขมัน', 'core', 'bodyweight', 'beginner', '1. นอนหงาย 2. ยกขาขึ้นเล็กน้อย 3. เตะขาสลับข้างอย่างรวดเร็ว'),
('Star Jumps', 'ท่ากระโดดดาวที่ช่วยเผาผลาญไขมัน', 'full_body', 'bodyweight', 'intermediate', '1. ยืนตรง 2. กระโดดพร้อมแยกขาและแขนออกเป็นรูปดาว 3. กระโดดกลับมาท่าเริ่มต้น'),
('Cat-Cow Stretch', 'ท่ายืดหลังที่ช่วยเพิ่มความยืดหยุ่น', 'back', 'bodyweight', 'beginner', '1. คุกเข่าบนพื้น 2. วางมือลงพื้น 3. โค้งหลังขึ้น (cat) 4. แอ่นหลังลง (cow)'),
('Child''s Pose', 'ท่ายืดหลังและไหล่', 'back', 'bodyweight', 'beginner', '1. คุกเข่าบนพื้น 2. นั่งบนส้นเท้า 3. โน้มตัวไปข้างหน้าพร้อมยืดแขน'),
('Hamstring Stretch', 'ท่ายืดกล้ามเนื้อหลังขา', 'legs', 'bodyweight', 'beginner', '1. นั่งบนพื้น 2. ยืดขาตรง 3. โน้มตัวไปข้างหน้าพยายามแตะปลายเท้า')
ON CONFLICT (name) DO NOTHING;
