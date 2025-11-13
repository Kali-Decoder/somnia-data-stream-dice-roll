import { NextRequest, NextResponse } from 'next/server'
import { getStats } from '@/lib/somnia/gameService'

// Helper to serialize BigInt values to strings for JSON
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString()
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt)
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const key in obj) {
      serialized[key] = serializeBigInt(obj[key])
    }
    return serialized
  }
  
  return obj
}

export async function GET(request: NextRequest) {
  try {
    const stats = await getStats()
    
    return NextResponse.json({ 
      stats: serializeBigInt(stats)
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const stats = await getStats()
    
    return NextResponse.json({ 
      stats: serializeBigInt(stats)
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

