// Client API for points operations
const API_BASE = '/api/points'

export async function getUserPointsAPI(
  userAddress: `0x${string}`
): Promise<{ points: string; totalPoints: string }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'getUserPoints',
      userAddress,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch user points')
  }

  const data = await response.json()
  return {
    points: data.points || '0',
    totalPoints: data.totalPoints || '0',
  }
}

