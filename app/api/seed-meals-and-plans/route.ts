import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // Create tables if not exist
    await query(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50),
        duration_weeks INTEGER,
        target_calories INTEGER,
        protein_ratio DECIMAL(4,2),
        carbs_ratio DECIMAL(4,2),
        fat_ratio DECIMAL(4,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Ensure ratio columns exist for older databases
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'meal_plans' AND column_name = 'protein_ratio'
        ) THEN
          ALTER TABLE meal_plans ADD COLUMN protein_ratio DECIMAL(4,2);
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'meal_plans' AND column_name = 'carbs_ratio'
        ) THEN
          ALTER TABLE meal_plans ADD COLUMN carbs_ratio DECIMAL(4,2);
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'meal_plans' AND column_name = 'fat_ratio'
        ) THEN
          ALTER TABLE meal_plans ADD COLUMN fat_ratio DECIMAL(4,2);
        END IF;
      END $$;
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        meal_type VARCHAR(50) NOT NULL,
        calories INTEGER,
        protein DECIMAL(6,2),
        carbs DECIMAL(6,2),
        fat DECIMAL(6,2),
        fiber DECIMAL(6,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS meal_plan_meals (
        id SERIAL PRIMARY KEY,
        meal_plan_id INTEGER REFERENCES meal_plans(id) ON DELETE CASCADE,
        meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL,
        meal_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(meal_plan_id, meal_id, day_of_week, meal_order)
      )
    `)

    // Insert meal plans
    const mealPlans = [
      {
        name: 'โปรแกรมลดน้ำหนัก',
        description: 'โปรแกรมอาหารสำหรับลดน้ำหนักอย่างปลอดภัย',
        category: 'weight_loss',
        difficulty: 'beginner',
        duration_weeks: 8,
        target_calories: 1500,
        protein_ratio: 0.35,
        carbs_ratio: 0.35,
        fat_ratio: 0.30
      },
      {
        name: 'โปรแกรมเพิ่มกล้ามเนื้อ',
        description: 'โปรแกรมอาหารสำหรับเพิ่มกล้ามเนื้อและความแข็งแรง',
        category: 'muscle_gain',
        difficulty: 'intermediate',
        duration_weeks: 12,
        target_calories: 2200,
        protein_ratio: 0.30,
        carbs_ratio: 0.50,
        fat_ratio: 0.20
      },
      {
        name: 'โปรแกรมรักษาน้ำหนัก',
        description: 'โปรแกรมอาหารสำหรับรักษาน้ำหนักและสุขภาพที่ดี',
        category: 'maintenance',
        difficulty: 'beginner',
        duration_weeks: 4,
        target_calories: 1800,
        protein_ratio: 0.25,
        carbs_ratio: 0.45,
        fat_ratio: 0.30
      },
      {
        name: 'โปรแกรมลดไขมัน (คาร์บต่ำ)',
        description: 'เน้นโปรตีนและไขมันที่ดี ลดคาร์บเพื่อคุมอินซูลิน',
        category: 'weight_loss',
        difficulty: 'intermediate',
        duration_weeks: 6,
        target_calories: 1600,
        protein_ratio: 0.35,
        carbs_ratio: 0.25,
        fat_ratio: 0.40
      },
      {
        name: 'โปรแกรมเพิ่มกล้าม (โปรตีนสูง)',
        description: 'โปรตีนสูงและคาร์บพอดีสำหรับการสร้างกล้ามเนื้อ',
        category: 'muscle_gain',
        difficulty: 'advanced',
        duration_weeks: 10,
        target_calories: 2400,
        protein_ratio: 0.35,
        carbs_ratio: 0.45,
        fat_ratio: 0.20
      },
      {
        name: 'โปรแกรมเมดิเตอเรเนียน (สมดุล)',
        description: 'แนวทางเมดิเตอเรเนียน เน้นผัก ผลไม้ ธัญพืช และไขมันดี',
        category: 'general',
        difficulty: 'beginner',
        duration_weeks: 4,
        target_calories: 1900,
        protein_ratio: 0.30,
        carbs_ratio: 0.45,
        fat_ratio: 0.25
      },
      {
        name: 'โปรแกรมบาลานซ์รายวัน',
        description: 'แผนสมดุลสำหรับการดูแลสุขภาพโดยรวม',
        category: 'general',
        difficulty: 'beginner',
        duration_weeks: 4,
        target_calories: 2000,
        protein_ratio: 0.30,
        carbs_ratio: 0.45,
        fat_ratio: 0.25
      }
    ]

    const mealPlanIds = []
    for (const plan of mealPlans) {
      const result = await query(`
        INSERT INTO meal_plans (name, description, category, difficulty, duration_weeks, target_calories, protein_ratio, carbs_ratio, fat_ratio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          difficulty = EXCLUDED.difficulty,
          duration_weeks = EXCLUDED.duration_weeks,
          target_calories = EXCLUDED.target_calories,
          protein_ratio = EXCLUDED.protein_ratio,
          carbs_ratio = EXCLUDED.carbs_ratio,
          fat_ratio = EXCLUDED.fat_ratio
        RETURNING id
      `, [
        plan.name,
        plan.description,
        plan.category,
        plan.difficulty,
        plan.duration_weeks,
        plan.target_calories,
        plan.protein_ratio,
        plan.carbs_ratio,
        plan.fat_ratio
      ])
      mealPlanIds.push(result.rows[0].id)
    }

    // Insert meals
    const meals = [
      // Breakfast meals
      { name: 'ข้าวโอ๊ตกับกล้วย', meal_type: 'breakfast', calories: 300, protein: 12, carbs: 55, fat: 6, fiber: 8 },
      { name: 'ไข่เจียวกับผักคะน้า', meal_type: 'breakfast', calories: 250, protein: 18, carbs: 8, fat: 15, fiber: 3 },
      { name: 'ขนมปังโฮลวีทกับไข่ต้ม', meal_type: 'breakfast', calories: 280, protein: 15, carbs: 35, fat: 10, fiber: 5 },
      
      // Lunch meals
      { name: 'อกไก่ย่างกับข้าวกล้อง', meal_type: 'lunch', calories: 400, protein: 35, carbs: 45, fat: 8, fiber: 4 },
      { name: 'ปลาแซลมอนกับผักบุ้ง', meal_type: 'lunch', calories: 350, protein: 28, carbs: 12, fat: 18, fiber: 5 },
      { name: 'แกงเขียวหวานไก่', meal_type: 'lunch', calories: 320, protein: 22, carbs: 18, fat: 12, fiber: 4 },
      
      // Dinner meals
      { name: 'เต้าหู้ผัดผักคะน้า', meal_type: 'dinner', calories: 280, protein: 16, carbs: 25, fat: 12, fiber: 6 },
      { name: 'กุ้งต้มยำ', meal_type: 'dinner', calories: 200, protein: 24, carbs: 8, fat: 6, fiber: 3 },
      { name: 'เนื้อวัวย่างกับแครอท', meal_type: 'dinner', calories: 380, protein: 32, carbs: 15, fat: 20, fiber: 4 },
      
      // Snacks
      { name: 'โยเกิร์ตกับอัลมอนด์', meal_type: 'snack', calories: 180, protein: 12, carbs: 8, fat: 12, fiber: 3 },
      { name: 'กล้วยกับถั่วลิสง', meal_type: 'snack', calories: 220, protein: 8, carbs: 28, fat: 10, fiber: 4 },
      { name: 'แอปเปิ้ลกับชีส', meal_type: 'snack', calories: 160, protein: 8, carbs: 18, fat: 6, fiber: 3 }
    ]

    const mealIds = []
    for (const meal of meals) {
      const result = await query(`
        INSERT INTO meals (name, meal_type, calories, protein, carbs, fat, fiber)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO UPDATE SET
          meal_type = EXCLUDED.meal_type,
          calories = EXCLUDED.calories,
          protein = EXCLUDED.protein,
          carbs = EXCLUDED.carbs,
          fat = EXCLUDED.fat,
          fiber = EXCLUDED.fiber
        RETURNING id
      `, [meal.name, meal.meal_type, meal.calories, meal.protein, meal.carbs, meal.fat, meal.fiber])
      mealIds.push(result.rows[0].id)
    }

    // Create meal plan relationships
    // Build 7-day rotation for each plan using available meals per type
    const breakfastIds = mealIds.slice(0, 3)
    const lunchIds = mealIds.slice(3, 6)
    const dinnerIds = mealIds.slice(6, 9)
    const snackIds = mealIds.slice(9, 12)

    const mealPlanMeals: { meal_plan_id: number; meal_id: number; day_of_week: number; meal_order: number }[] = []

    for (const planId of mealPlanIds) {
      for (let day = 1; day <= 7; day++) {
        mealPlanMeals.push(
          { meal_plan_id: planId, meal_id: breakfastIds[(day - 1) % breakfastIds.length], day_of_week: day, meal_order: 1 },
          { meal_plan_id: planId, meal_id: lunchIds[(day - 1) % lunchIds.length], day_of_week: day, meal_order: 2 },
          { meal_plan_id: planId, meal_id: dinnerIds[(day - 1) % dinnerIds.length], day_of_week: day, meal_order: 3 },
          { meal_plan_id: planId, meal_id: snackIds[(day - 1) % snackIds.length], day_of_week: day, meal_order: 4 },
        )
      }
    }

    for (const relationship of mealPlanMeals) {
      await query(`
        INSERT INTO meal_plan_meals (meal_plan_id, meal_id, day_of_week, meal_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (meal_plan_id, meal_id, day_of_week, meal_order) DO NOTHING
      `, [relationship.meal_plan_id, relationship.meal_id, relationship.day_of_week, relationship.meal_order])
    }

    return NextResponse.json({
      message: 'เพิ่มข้อมูล Meal Plans และ Meals เรียบร้อยแล้ว',
      meal_plans: mealPlans.length,
      meals: meals.length,
      relationships: mealPlanMeals.length
    })
  } catch (error) {
    console.error('Error seeding meals:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 })
  }
}
