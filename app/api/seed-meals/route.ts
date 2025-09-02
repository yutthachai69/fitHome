import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // Create tables if not exist
    await query(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        target_calories INTEGER NOT NULL,
        protein_ratio DECIMAL(3,2) DEFAULT 0.25,
        carbs_ratio DECIMAL(3,2) DEFAULT 0.45,
        fat_ratio DECIMAL(3,2) DEFAULT 0.30,
        difficulty VARCHAR(50) DEFAULT 'beginner',
        category VARCHAR(100) DEFAULT 'general',
        duration_weeks INTEGER DEFAULT 4,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        meal_type VARCHAR(50) NOT NULL,
        estimated_calories INTEGER,
        estimated_protein DECIMAL(6,2),
        estimated_carbs DECIMAL(6,2),
        estimated_fat DECIMAL(6,2),
        preparation_time_minutes INTEGER,
        difficulty VARCHAR(50) DEFAULT 'easy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS meal_plan_meals (
        id SERIAL PRIMARY KEY,
        meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
        meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
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
        description: 'โปรแกรมอาหารสำหรับลดน้ำหนัก เน้นโปรตีนสูง คาร์โบไฮเดรตต่ำ',
        target_calories: 1500,
        protein_ratio: 0.35,
        carbs_ratio: 0.35,
        fat_ratio: 0.30,
        difficulty: 'beginner',
        category: 'weight_loss',
        duration_weeks: 4
      },
      {
        name: 'โปรแกรมเพิ่มกล้ามเนื้อ',
        description: 'โปรแกรมอาหารสำหรับเพิ่มกล้ามเนื้อ เน้นโปรตีนสูง แคลอรี่สูง',
        target_calories: 2200,
        protein_ratio: 0.30,
        carbs_ratio: 0.50,
        fat_ratio: 0.20,
        difficulty: 'intermediate',
        category: 'muscle_gain',
        duration_weeks: 8
      },
      {
        name: 'โปรแกรมสุขภาพทั่วไป',
        description: 'โปรแกรมอาหารสมดุลสำหรับสุขภาพที่ดี',
        target_calories: 1800,
        protein_ratio: 0.25,
        carbs_ratio: 0.45,
        fat_ratio: 0.30,
        difficulty: 'beginner',
        category: 'general',
        duration_weeks: 4
      },
      {
        name: 'โปรแกรมมังสวิรัติ',
        description: 'โปรแกรมอาหารมังสวิรัติที่สมดุลและมีประโยชน์',
        target_calories: 1600,
        protein_ratio: 0.20,
        carbs_ratio: 0.55,
        fat_ratio: 0.25,
        difficulty: 'beginner',
        category: 'vegetarian',
        duration_weeks: 4
      }
    ]

    const mealPlanIds = []
    for (const plan of mealPlans) {
      const result = await query(`
        INSERT INTO meal_plans (name, description, target_calories, protein_ratio, carbs_ratio, fat_ratio, difficulty, category, duration_weeks)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          target_calories = EXCLUDED.target_calories,
          protein_ratio = EXCLUDED.protein_ratio,
          carbs_ratio = EXCLUDED.carbs_ratio,
          fat_ratio = EXCLUDED.fat_ratio,
          difficulty = EXCLUDED.difficulty,
          category = EXCLUDED.category,
          duration_weeks = EXCLUDED.duration_weeks
        RETURNING id
      `, [plan.name, plan.description, plan.target_calories, plan.protein_ratio, plan.carbs_ratio, plan.fat_ratio, plan.difficulty, plan.category, plan.duration_weeks])
      mealPlanIds.push(result.rows[0].id)
    }

    // Insert meals
    const meals = [
      // Breakfast meals
      {
        name: 'ข้าวโอ๊ตกับกล้วยและอัลมอนด์',
        description: 'ข้าวโอ๊ตต้มกับกล้วยหั่นและอัลมอนด์บด โรยด้วยน้ำผึ้ง',
        meal_type: 'breakfast',
        estimated_calories: 320,
        estimated_protein: 12,
        estimated_carbs: 45,
        estimated_fat: 12,
        preparation_time_minutes: 10,
        difficulty: 'easy'
      },
      {
        name: 'ไข่เจียวกับผักคะน้า',
        description: 'ไข่เจียวกับผักคะน้าสับ โรยด้วยพริกไทย',
        meal_type: 'breakfast',
        estimated_calories: 280,
        estimated_protein: 18,
        estimated_carbs: 8,
        estimated_fat: 20,
        preparation_time_minutes: 15,
        difficulty: 'easy'
      },
      {
        name: 'ขนมปังโฮลวีทกับไข่ต้ม',
        description: 'ขนมปังโฮลวีท 2 แผ่น กับไข่ต้ม 2 ฟอง',
        meal_type: 'breakfast',
        estimated_calories: 350,
        estimated_protein: 20,
        estimated_carbs: 35,
        estimated_fat: 15,
        preparation_time_minutes: 8,
        difficulty: 'easy'
      },

      // Lunch meals
      {
        name: 'อกไก่ย่างกับข้าวกล้องและผัก',
        description: 'อกไก่ย่าง 150g กับข้าวกล้อง 1 ถ้วย และผักคะน้าต้ม',
        meal_type: 'lunch',
        estimated_calories: 450,
        estimated_protein: 35,
        estimated_carbs: 45,
        estimated_fat: 12,
        preparation_time_minutes: 25,
        difficulty: 'easy'
      },
      {
        name: 'สลัดปลาแซลมอน',
        description: 'สลัดผักสดกับปลาแซลมอนย่าง โรยด้วยน้ำมันมะกอก',
        meal_type: 'lunch',
        estimated_calories: 380,
        estimated_protein: 28,
        estimated_carbs: 15,
        estimated_fat: 22,
        preparation_time_minutes: 20,
        difficulty: 'easy'
      },
      {
        name: 'ต้มยำกุ้งกับข้าวกล้อง',
        description: 'ต้มยำกุ้งแบบไม่ใส่กะทิ กับข้าวกล้อง 1 ถ้วย',
        meal_type: 'lunch',
        estimated_calories: 420,
        estimated_protein: 25,
        estimated_carbs: 50,
        estimated_fat: 8,
        preparation_time_minutes: 30,
        difficulty: 'intermediate'
      },

      // Dinner meals
      {
        name: 'เต้าหู้ผัดผักคะน้า',
        description: 'เต้าหู้ผัดกับผักคะน้าและแครอท ปรุงด้วยน้ำมันรำข้าว',
        meal_type: 'dinner',
        estimated_calories: 320,
        estimated_protein: 18,
        estimated_carbs: 25,
        estimated_fat: 15,
        preparation_time_minutes: 20,
        difficulty: 'easy'
      },
      {
        name: 'เนื้อวัวย่างกับมันเทศ',
        description: 'เนื้อวัวย่าง 120g กับมันเทศอบ 1 หัวกลาง',
        meal_type: 'dinner',
        estimated_calories: 480,
        estimated_protein: 32,
        estimated_carbs: 40,
        estimated_fat: 20,
        preparation_time_minutes: 35,
        difficulty: 'intermediate'
      },
      {
        name: 'แกงเขียวหวานไก่',
        description: 'แกงเขียวหวานไก่แบบไม่ใส่กะทิ กับข้าวกล้อง',
        meal_type: 'dinner',
        estimated_calories: 380,
        estimated_protein: 22,
        estimated_carbs: 45,
        estimated_fat: 10,
        preparation_time_minutes: 40,
        difficulty: 'intermediate'
      },

      // Snacks
      {
        name: 'โยเกิร์ตกับผลไม้',
        description: 'โยเกิร์ตธรรมชาติ 1 ถ้วย กับแอปเปิ้ลหั่น',
        meal_type: 'snack',
        estimated_calories: 180,
        estimated_protein: 12,
        estimated_carbs: 25,
        estimated_fat: 4,
        preparation_time_minutes: 5,
        difficulty: 'easy'
      },
      {
        name: 'อัลมอนด์และวอลนัท',
        description: 'อัลมอนด์ 10 เม็ด และวอลนัท 5 เม็ด',
        meal_type: 'snack',
        estimated_calories: 220,
        estimated_protein: 8,
        estimated_carbs: 8,
        estimated_fat: 18,
        preparation_time_minutes: 2,
        difficulty: 'easy'
      },
      {
        name: 'ส้มตำมะละกอ',
        description: 'ส้มตำมะละกอแบบไม่ใส่กะทิ โรยด้วยถั่วลิสง',
        meal_type: 'snack',
        estimated_calories: 120,
        estimated_protein: 6,
        estimated_carbs: 20,
        estimated_fat: 3,
        preparation_time_minutes: 15,
        difficulty: 'easy'
      }
    ]

    const mealIds = []
    for (const meal of meals) {
      const result = await query(`
        INSERT INTO meals (name, description, meal_type, estimated_calories, estimated_protein, estimated_carbs, estimated_fat, preparation_time_minutes, difficulty)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          meal_type = EXCLUDED.meal_type,
          estimated_calories = EXCLUDED.estimated_calories,
          estimated_protein = EXCLUDED.estimated_protein,
          estimated_carbs = EXCLUDED.estimated_carbs,
          estimated_fat = EXCLUDED.estimated_fat,
          preparation_time_minutes = EXCLUDED.preparation_time_minutes,
          difficulty = EXCLUDED.difficulty
        RETURNING id
      `, [meal.name, meal.description, meal.meal_type, meal.estimated_calories, meal.estimated_protein, meal.estimated_carbs, meal.estimated_fat, meal.preparation_time_minutes, meal.difficulty])
      mealIds.push(result.rows[0].id)
    }

    // Create meal plan relationships (assign meals to plans)
    const mealPlanMeals = [
      // Weight Loss Plan (Plan 1)
      { plan_id: mealPlanIds[0], meal_id: mealIds[0], day: 1, order: 1 }, // Breakfast
      { plan_id: mealPlanIds[0], meal_id: mealIds[3], day: 1, order: 2 }, // Lunch
      { plan_id: mealPlanIds[0], meal_id: mealIds[6], day: 1, order: 3 }, // Dinner
      { plan_id: mealPlanIds[0], meal_id: mealIds[9], day: 1, order: 4 }, // Snack
      
      { plan_id: mealPlanIds[0], meal_id: mealIds[1], day: 2, order: 1 },
      { plan_id: mealPlanIds[0], meal_id: mealIds[4], day: 2, order: 2 },
      { plan_id: mealPlanIds[0], meal_id: mealIds[7], day: 2, order: 3 },
      { plan_id: mealPlanIds[0], meal_id: mealIds[10], day: 2, order: 4 },

      // Muscle Gain Plan (Plan 2)
      { plan_id: mealPlanIds[1], meal_id: mealIds[2], day: 1, order: 1 },
      { plan_id: mealPlanIds[1], meal_id: mealIds[5], day: 1, order: 2 },
      { plan_id: mealPlanIds[1], meal_id: mealIds[8], day: 1, order: 3 },
      { plan_id: mealPlanIds[1], meal_id: mealIds[11], day: 1, order: 4 },

      // General Health Plan (Plan 3)
      { plan_id: mealPlanIds[2], meal_id: mealIds[0], day: 1, order: 1 },
      { plan_id: mealPlanIds[2], meal_id: mealIds[3], day: 1, order: 2 },
      { plan_id: mealPlanIds[2], meal_id: mealIds[6], day: 1, order: 3 },
      { plan_id: mealPlanIds[2], meal_id: mealIds[9], day: 1, order: 4 },

      // Vegetarian Plan (Plan 4)
      { plan_id: mealPlanIds[3], meal_id: mealIds[0], day: 1, order: 1 },
      { plan_id: mealPlanIds[3], meal_id: mealIds[6], day: 1, order: 2 },
      { plan_id: mealPlanIds[3], meal_id: mealIds[9], day: 1, order: 3 },
      { plan_id: mealPlanIds[3], meal_id: mealIds[10], day: 1, order: 4 }
    ]

    for (const relationship of mealPlanMeals) {
      await query(`
        INSERT INTO meal_plan_meals (meal_plan_id, meal_id, day_of_week, meal_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (meal_plan_id, meal_id, day_of_week, meal_order) DO NOTHING
      `, [relationship.plan_id, relationship.meal_id, relationship.day, relationship.order])
    }

    return NextResponse.json({ 
      message: 'เพิ่มข้อมูล Meal Plans และ Meals เรียบร้อยแล้ว',
      meal_plans: mealPlans.length,
      meals: meals.length,
      relationships: mealPlanMeals.length
    })
  } catch (error) {
    console.error('Error seeding meals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

