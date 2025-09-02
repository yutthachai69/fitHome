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
    const muscleGroup = searchParams.get('muscle_group')
    const difficulty = searchParams.get('difficulty')
    const equipment = searchParams.get('equipment')

    let queryString = 'SELECT * FROM workout_exercises WHERE 1=1'
    const queryParams: string[] = []

    if (muscleGroup) {
      queryParams.push(muscleGroup)
      queryString += ` AND muscle_group = $${queryParams.length}`
    }

    if (difficulty) {
      queryParams.push(difficulty)
      queryString += ` AND difficulty = $${queryParams.length}`
    }

    if (equipment) {
      queryParams.push(equipment)
      queryString += ` AND equipment = $${queryParams.length}`
    }

    queryString += ' ORDER BY name ASC'

    const result = await query(queryString, queryParams)

    return NextResponse.json({
      exercises: result.rows
    })

  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
