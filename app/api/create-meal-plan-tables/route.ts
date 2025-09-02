import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // Create food_items table
    await query(`
      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        calories_per_100g DECIMAL(8,2) NOT NULL,
        protein_per_100g DECIMAL(6,2),
        carbs_per_100g DECIMAL(6,2),
        fat_per_100g DECIMAL(6,2),
        fiber_per_100g DECIMAL(6,2),
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create meal_plans table
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

    // Create meals table
    await query(`
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
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

    // Create meal_plan_meals table (junction table)
    await query(`
      CREATE TABLE IF NOT EXISTS meal_plan_meals (
        id SERIAL PRIMARY KEY,
        meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
        meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL, -- 1-7 (Monday-Sunday)
        meal_order INTEGER NOT NULL, -- 1, 2, 3, 4 (breakfast, lunch, dinner, snack)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(meal_plan_id, meal_id, day_of_week, meal_order)
      )
    `)

    // Create user_meal_plans table
    await query(`
      CREATE TABLE IF NOT EXISTS user_meal_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        meal_plan_id INTEGER NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        target_calories INTEGER,
        current_weight DECIMAL(5,2),
        target_weight DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create meal_food_items table (junction table for meal ingredients)
    await query(`
      CREATE TABLE IF NOT EXISTS meal_food_items (
        id SERIAL PRIMARY KEY,
        meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
        food_item_id INTEGER NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
        quantity_grams DECIMAL(8,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_meal_plans_category ON meal_plans(category)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_meal_plans_difficulty ON meal_plans(difficulty)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_meals_meal_type ON meals(meal_type)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_plan_id ON meal_plan_meals(meal_plan_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_day ON meal_plan_meals(day_of_week)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_user_meal_plans_user_id ON user_meal_plans(user_id)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_user_meal_plans_active ON user_meal_plans(is_active)`)
    await query(`CREATE INDEX IF NOT EXISTS idx_meal_food_items_meal_id ON meal_food_items(meal_id)`)

    // Create updated_at triggers
    await query(`
      CREATE OR REPLACE FUNCTION update_food_items_updated_at() RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await query(`
      CREATE OR REPLACE FUNCTION update_meal_plans_updated_at() RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await query(`
      CREATE OR REPLACE FUNCTION update_meals_updated_at() RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await query(`
      CREATE OR REPLACE FUNCTION update_user_meal_plans_updated_at() RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    // Create triggers
    await query(`DROP TRIGGER IF EXISTS trigger_update_food_items_updated_at ON food_items`)
    await query(`
      CREATE TRIGGER trigger_update_food_items_updated_at
      BEFORE UPDATE ON food_items
      FOR EACH ROW EXECUTE FUNCTION update_food_items_updated_at()
    `)

    await query(`DROP TRIGGER IF EXISTS trigger_update_meal_plans_updated_at ON meal_plans`)
    await query(`
      CREATE TRIGGER trigger_update_meal_plans_updated_at
      BEFORE UPDATE ON meal_plans
      FOR EACH ROW EXECUTE FUNCTION update_meal_plans_updated_at()
    `)

    await query(`DROP TRIGGER IF EXISTS trigger_update_meals_updated_at ON meals`)
    await query(`
      CREATE TRIGGER trigger_update_meals_updated_at
      BEFORE UPDATE ON meals
      FOR EACH ROW EXECUTE FUNCTION update_meals_updated_at()
    `)

    await query(`DROP TRIGGER IF EXISTS trigger_update_user_meal_plans_updated_at ON user_meal_plans`)
    await query(`
      CREATE TRIGGER trigger_update_user_meal_plans_updated_at
      BEFORE UPDATE ON user_meal_plans
      FOR EACH ROW EXECUTE FUNCTION update_user_meal_plans_updated_at()
    `)

    return NextResponse.json({ message: 'สร้างตาราง Meal Plan เรียบร้อยแล้ว' })
  } catch (error) {
    console.error('Error creating meal plan tables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

