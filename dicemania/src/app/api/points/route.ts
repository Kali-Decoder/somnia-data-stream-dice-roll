import { NextRequest, NextResponse } from 'next/server'
import { getUserPoints } from '@/lib/somnia/gameService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userAddress } = body

    if (action === 'getUserPoints') {
      if (!userAddress) {
        return NextResponse.json(
          { error: 'Missing required field: userAddress' },
          { status: 400 }
        )
      }

      const points = await getUserPoints(userAddress as `0x${string}`)
      
      return NextResponse.json({ 
        points: points.toString(),
        totalPoints: points.toString()
      })
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

