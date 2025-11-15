// Client API for DiceMania pool operations
import type { Pool, PlayerBet } from '@/lib/somnia/gameService'

const API_BASE = '/api/pool'
function deserializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deserializeBigInt)
  }
  
  if (typeof obj === 'object') {
    const deserialized: any = {}
    for (const key in obj) {
      // Convert string BigInt fields back to BigInt
      if (
        (key === 'poolId' || 
         key === 'endTime' || 
         key === 'startTime' || 
         key === 'totalAmount' || 
         key === 'totalPlayers' || 
         key === 'playersLeft' || 
         key === 'result' || 
         key === 'baseAmount' ||
         key === 'amount' ||
         key === 'targetScore' ||
         key === 'claimedAmount' ||
         key === 'reward') && 
        typeof obj[key] === 'string'
      ) {
        try {
          if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
            deserialized[key] = BigInt(0)
          } else {
            deserialized[key] = BigInt(obj[key])
          }
        } catch (error) {
          console.warn(`Failed to convert ${key} to BigInt:`, obj[key], error)
          deserialized[key] = BigInt(0)
        }
      } else {
        deserialized[key] = deserializeBigInt(obj[key])
      }
    }
    return deserialized
  }
  
  return obj
}

export async function createPoolAPI(
  poolId: string,
  totalPlayers: string,
  baseAmount: string
): Promise<{ poolId: string; txHash: string }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'createPool',
      poolId,
      totalPlayers,
      baseAmount
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create pool')
  }

  const data = await response.json()
  return {
    poolId: data.poolId,
    txHash: data.txHash,
  }
}

export async function placeBetAPI(
  poolId: string,
  userAddress: `0x${string}`,
  amount: string,
  targetValue: string
): Promise<{ success: boolean }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'placeBet',
      poolId,
      userAddress,
      amount,
      targetValue,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to place bet')
  }

  return response.json()
}

export async function claimBetAPI(
  poolId: string,
  userAddress: `0x${string}`,
  reward: string
): Promise<{ txHash: string }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'claimBet',
      poolId,
      userAddress,
      reward,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to claim bet')
  }

  return response.json()
}

export async function setResultAPI(
  poolId: string,
  resultValue: string
): Promise<{ txHash: string }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'setResult',
      poolId,
      resultValue,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to set result')
  }

  return response.json()
}


export async function getUserPoolsAPI(
  userAddress: `0x${string}`
): Promise<string[]> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getUserPools',
      userAddress,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch user pools')
  }

  const data = await response.json()
  return (data.poolIds || []).map((id: string) => id.toString())
}

export async function getPoolBetsAPI(
  poolId: string
): Promise<PlayerBet[]> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getPoolBets',
      poolId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch pool bets')
  }

  const data = await response.json()
  
  if (!data.bets || !Array.isArray(data.bets)) {
    return []
  }

  // Deserialize BigInt values from strings
  const deserializedBets = deserializeBigInt(data.bets) as PlayerBet[]

  return deserializedBets
}

// Get all pools - fetches all pools from data streams
export async function getAllPoolsAPI(
  totalPoolCount?: number
): Promise<Pool[]> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getAllPools',
      totalPoolCount: totalPoolCount || undefined,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch all pools')
  }

  const data = await response.json()
  
  if (!data.pools || !Array.isArray(data.pools)) {
    return []
  }

  // Deserialize BigInt values from strings
  const deserializedPools = deserializeBigInt(data.pools) as Pool[]

  return deserializedPools
}

// Get single pool by ID
export async function getPoolByIdAPI(
  poolId: string
): Promise<Pool | null> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getPoolById',
      poolId,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch pool')
  }

  const data = await response.json()
  
  if (!data.pool) {
    return null
  }

  // Deserialize BigInt values from strings
  const deserializedPool = deserializeBigInt(data.pool) as Pool

  return deserializedPool
}


