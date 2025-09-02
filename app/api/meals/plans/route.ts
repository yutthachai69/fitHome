import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const limit = searchParams.get('limit') || '10'

    let queryString = 'SELECT * FROM meal_plans WHERE 1=1'
    const queryParams: (string | number)[] = []

    if (category) {
      queryParams.push(category)
      queryString += ` AND category = $${queryParams.length}`
    }

    if (difficulty) {
      queryParams.push(difficulty)
      queryString += ` AND difficulty = $${queryParams.length}`
    }

    queryString += ' ORDER BY name ASC'
    
    if (limit !== 'all') {
      queryParams.push(parseInt(limit))
      queryString += ` LIMIT $${queryParams.length}`
    }

    const result = await query(queryString, queryParams)
    return NextResponse.json({ meal_plans: result.rows })
  } catch (error) {
    console.error('Error fetching meal plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
