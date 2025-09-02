import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    // Create table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
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

    const foodItems = [
      // Rice and Grains
      { name: 'ข้าวขาว', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, category: 'grains' },
      { name: 'ข้าวกล้อง', calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, category: 'grains' },
      { name: 'ข้าวโอ๊ต', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, fiber: 10.6, category: 'grains' },
      { name: 'ขนมปังโฮลวีท', calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, category: 'grains' },
      { name: 'ขนมปังขาว', calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, category: 'grains' },

      // Proteins
      { name: 'อกไก่', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, category: 'protein' },
      { name: 'ไข่ไก่', calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, category: 'protein' },
      { name: 'ปลาแซลมอน', calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0, category: 'protein' },
      { name: 'เนื้อวัว', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, category: 'protein' },
      { name: 'เต้าหู้', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, category: 'protein' },
      { name: 'กุ้ง', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0, category: 'protein' },

      // Vegetables
      { name: 'ผักคะน้า', calories: 32, protein: 3.3, carbs: 4.4, fat: 0.4, fiber: 2.8, category: 'vegetables' },
      { name: 'บรอกโคลี', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, category: 'vegetables' },
      { name: 'แครอท', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, category: 'vegetables' },
      { name: 'ผักบุ้ง', calories: 19, protein: 2.6, carbs: 3.1, fat: 0.2, fiber: 2.1, category: 'vegetables' },
      { name: 'มะเขือเทศ', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, category: 'vegetables' },
      { name: 'แตงกวา', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, category: 'vegetables' },

      // Fruits
      { name: 'กล้วย', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, category: 'fruits' },
      { name: 'แอปเปิ้ล', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, category: 'fruits' },
      { name: 'ส้ม', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, category: 'fruits' },
      { name: 'มะม่วง', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, category: 'fruits' },
      { name: 'สตรอเบอร์รี่', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, fiber: 2, category: 'fruits' },

      // Dairy
      { name: 'นมสด', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, category: 'dairy' },
      { name: 'โยเกิร์ต', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, category: 'dairy' },
      { name: 'ชีส', calories: 113, protein: 7, carbs: 0.4, fat: 9, fiber: 0, category: 'dairy' },
      { name: 'ไข่ขาว', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0, category: 'dairy' },

      // Nuts and Seeds
      { name: 'อัลมอนด์', calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, category: 'nuts' },
      { name: 'วอลนัท', calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7, category: 'nuts' },
      { name: 'เมล็ดฟักทอง', calories: 559, protein: 19, carbs: 54, fat: 19, fiber: 18.4, category: 'nuts' },
      { name: 'ถั่วลิสง', calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, category: 'nuts' },

      // Oils and Fats
      { name: 'น้ำมันมะกอก', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, category: 'oils' },
      { name: 'น้ำมันรำข้าว', calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, category: 'oils' },
      { name: 'เนย', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, category: 'oils' },

      // Thai Foods
      { name: 'ต้มยำกุ้ง', calories: 120, protein: 15, carbs: 8, fat: 4, fiber: 2, category: 'thai_food' },
      { name: 'ผัดไทย', calories: 300, protein: 12, carbs: 45, fat: 8, fiber: 3, category: 'thai_food' },
      { name: 'แกงเขียวหวาน', calories: 180, protein: 18, carbs: 12, fat: 6, fiber: 2, category: 'thai_food' },
      { name: 'ส้มตำ', calories: 80, protein: 4, carbs: 15, fat: 1, fiber: 4, category: 'thai_food' },
      { name: 'ลาบหมู', calories: 200, protein: 20, carbs: 8, fat: 10, fiber: 2, category: 'thai_food' },

      // Beverages
      { name: 'น้ำเปล่า', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'beverages' },
      { name: 'ชาเขียว', calories: 1, protein: 0, carbs: 0.2, fat: 0, fiber: 0, category: 'beverages' },
      { name: 'กาแฟดำ', calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0, category: 'beverages' },
      { name: 'น้ำส้มคั้น', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2, category: 'beverages' }
    ]

    for (const item of foodItems) {
      await query(`
        INSERT INTO food_items (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO NOTHING
      `, [item.name, item.calories, item.protein, item.carbs, item.fat, item.fiber, item.category])
    }

    return NextResponse.json({ message: 'เพิ่มข้อมูลอาหารเรียบร้อยแล้ว', count: foodItems.length })
  } catch (error) {
    console.error('Error seeding food items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
