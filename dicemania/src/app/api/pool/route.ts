import { NextRequest, NextResponse } from 'next/server'
import {
  createPool,
  placeBet,
  claimBet,
  setResult,
  getPools,
  getPoolById,
  getPoolBets,
} from '@/lib/somnia/gameService'
import { parseEther } from 'viem'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'createPool': {
        const { poolId, totalPlayers, baseAmount } = body
        
        if (!poolId || !totalPlayers || !baseAmount ) {
          return NextResponse.json(
            { error: 'Missing required fields: poolId, totalPlayers, baseAmount' },
            { status: 400 }
          )
        }

        console.log('Creating pool with (10 minutes fixed duration):', { poolId, totalPlayers, baseAmount })

        const result = await createPool(
          BigInt(poolId),
          BigInt(totalPlayers),
          parseEther(baseAmount)
        )

        return NextResponse.json(serializeBigInt(result))
      }

      case 'placeBet': {
        const { poolId, userAddress, amount, targetValue } = body
        console.log('Placing bet with:', { poolId, userAddress, amount, targetValue })
        if (!poolId || !userAddress || !amount || !targetValue) {
          return NextResponse.json(
            { error: 'Missing required fields: poolId, userAddress, amount, targetValue' },
            { status: 400 }
          )
        }

        const result = await placeBet(
          BigInt(poolId),
          userAddress as `0x${string}`,
          BigInt(amount),
          BigInt(targetValue)
        )

        return NextResponse.json(serializeBigInt(result))
      }

      case 'claimBet': {
        const { poolId, userAddress, reward } = body
        
        if (!poolId || !userAddress || reward === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: poolId, userAddress, reward' },
            { status: 400 }
          )
        }

        const result = await claimBet(
          BigInt(poolId),
          userAddress as `0x${string}`,
          BigInt(reward)
        )

        return NextResponse.json(serializeBigInt(result))
      }

      case 'setResult': {
        const { poolId, resultValue } = body
        
        if (!poolId || !resultValue) {
          return NextResponse.json(
            { error: 'Missing required fields: poolId, resultValue' },
            { status: 400 }
          )
        }

        const result = await setResult(
          BigInt(poolId),
          BigInt(resultValue)
        )

        return NextResponse.json(serializeBigInt(result))
      }
      case 'getAllPools': {
        const { totalPoolCount } = body
        console.log("totalPoolCount in pool client api", totalPoolCount);
        
        // Validate totalPoolCount if provided
        let poolCount: number | undefined = undefined
        if (totalPoolCount !== undefined && totalPoolCount !== null) {
          poolCount = Number(totalPoolCount)
          if (isNaN(poolCount) || poolCount < 0) {
            return NextResponse.json(
              { error: 'Invalid totalPoolCount value' },
              { status: 400 }
            )
          }
        }

        if (poolCount === 0) {
          return NextResponse.json({ pools: [] })
        }

        console.log("poolCount in pool client api", poolCount);

        // Call getPools from gameService
        const pools = await getPools(poolCount)
        
        return NextResponse.json({ pools: serializeBigInt(pools) })
      }

      case 'getPoolById': {
        const { poolId } = body
        
        if (!poolId) {
          return NextResponse.json(
            { error: 'Missing required field: poolId' },
            { status: 400 }
          )
        }

        const pool = await getPoolById(BigInt(poolId))
        
        if (!pool) {
          return NextResponse.json(
            { error: 'Pool not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({ pool: serializeBigInt(pool) })
      }

      case 'getPoolBets': {
        const { poolId } = body
        
        if (!poolId) {
          return NextResponse.json(
            { error: 'Missing required field: poolId' },
            { status: 400 }
          )
        }

        const bets = await getPoolBets(BigInt(poolId))
        
        return NextResponse.json({ bets: serializeBigInt(bets) })
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

