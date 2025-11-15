// Client API for stats operations
const API_BASE = '/api/stats'

export interface Stats {
  totalUsers: string
  totalBetsPlaced: string
  totalPoolsCreated: string
  totalPointsAwarded: string
}

export interface StatsResponse {
  stats: Stats
}

export async function getStatsAPI(): Promise<StatsResponse> {
  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch stats')
  }

  const data = await response.json()
  return {
    stats: data.stats || {
      totalUsers: '0',
      totalBetsPlaced: '0',
      totalPoolsCreated: '0',
      totalPointsAwarded: '0',
    },
  }
}

