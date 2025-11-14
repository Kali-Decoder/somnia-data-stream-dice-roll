import { SDK, SchemaEncoder, zeroBytes32 } from '@somnia-chain/streams'
import { getPublicClient, getWalletClient, getPublisherAddress } from './clients'
import { somniaTestnet } from './chain'
import { waitForTransactionReceipt, readContract, writeContract } from 'viem/actions'
import { toHex, keccak256, stringToHex, type Hex } from 'viem'
import { DiceManiaABI, DiceManiaAddress } from '@/constant'
import {
  poolSchema,
  poolCreatedSchema,
  betPlacedSchema,
  betClaimedSchema,
  resultSetSchema,
  fundsDistributedSchema,
  fundsWithdrawnSchema,
  etherReceivedSchema,
  pointsAwardedSchema,
  pointsAddedSchema,
  playerBetSchema,
  userPointsSchema,
  poolBetsHistorySchema,
  platformStatsSchema,
  POOL_CREATED_EVENT_ID,
  BET_PLACED_EVENT_ID,
  BET_CLAIMED_EVENT_ID,
  RESULT_SET_EVENT_ID,
  FUNDS_DISTRIBUTED_EVENT_ID,
  FUNDS_WITHDRAWN_EVENT_ID,
  ETHER_RECEIVED_EVENT_ID,
  POINTS_AWARDED_EVENT_ID,
  POINTS_ADDED_EVENT_ID,
  PLATFORM_STATS_UPDATED_EVENT_ID,
} from './schemas'

// Pool type definition
export interface Pool {
  poolId: bigint
  endTime: bigint
  startTime: bigint
  totalAmount: bigint
  totalPlayers: bigint
  playersLeft: bigint
  result: bigint
  ended: boolean
  baseAmount: bigint
}

// Player bet type definition
export interface PlayerBet {
  user: string
  amount: bigint
  targetScore: bigint
  claimedAmount: bigint
  claimed: boolean
}

// Helper to get SDK instance
function getSdk(write = false) {
  const publicClient = getPublicClient()
  const walletClient = write ? getWalletClient() : null
  
  if (!walletClient && write) {
    throw new Error('Wallet client not available. PRIVATE_KEY must be set for write operations.')
  }

  return new SDK({
    public: publicClient,
    wallet: walletClient || undefined,
  })
}

// Ensure schemas are registered
async function ensureSchemasRegistered() {
  const walletClient = getWalletClient()
  if (!walletClient) {
    throw new Error('Wallet client not available. Please set PRIVATE_KEY in environment variables.')
  }

  const sdk = getSdk(true)
  const schemas = [
    { id: 'pool', schema: poolSchema },
    { id: 'poolCreated', schema: poolCreatedSchema },
    { id: 'betPlaced', schema: betPlacedSchema },
    { id: 'betClaimed', schema: betClaimedSchema },
    { id: 'resultSet', schema: resultSetSchema },
    { id: 'fundsDistributed', schema: fundsDistributedSchema },
    { id: 'fundsWithdrawn', schema: fundsWithdrawnSchema },
    { id: 'etherReceived', schema: etherReceivedSchema },
    { id: 'pointsAwarded', schema: pointsAwardedSchema },
    { id: 'pointsAdded', schema: pointsAddedSchema },
    { id: 'playerBet', schema: playerBetSchema },
    { id: 'userPoints', schema: userPointsSchema },
    { id: 'poolBetsHistory', schema: poolBetsHistorySchema },
    { id: 'platformStats', schema: platformStatsSchema },
  ]

  for (const { id, schema } of schemas) {
    const schemaId = await sdk.streams.computeSchemaId(schema)
    if (!schemaId) continue
    const isRegistered = await sdk.streams.isDataSchemaRegistered(schemaId)
    if (!isRegistered) {
      try {
        const tx = await sdk.streams.registerDataSchemas([
          { id, schema, parentSchemaId: zeroBytes32 as `0x${string}` }
        ], true)
        if (tx) {
          await waitForTransactionReceipt(getPublicClient(), { hash: tx as Hex })
        }
      } catch (error: any) {
        const errorMessage = error?.message || String(error)
        
        // If schema is already registered, that's fine - continue
        if (
          errorMessage.includes('IDAlreadyUsed') ||
          errorMessage.includes('already registered') ||
          errorMessage.includes('AlreadyRegistered') ||
          errorMessage.includes('SchemaAlreadyRegistered')
        ) {
          console.log(`Schema ${id} is already registered, skipping...`)
          continue
        }
        
        if (errorMessage.includes('account does not exist') || errorMessage.includes('insufficient funds')) {
          const walletAddress = walletClient.account?.address || 'unknown'
          throw new Error(
            `Account not funded or does not exist on Somnia Testnet. ` +
            `Please fund your wallet (address: ${walletAddress}) with STT tokens from the Somnia faucet. ` +
            `Original error: ${errorMessage}`
          )
        }
        console.warn(`Failed to register schema ${id}:`, errorMessage)
      }
    }
  }
}

// Register event schemas
async function ensureEventSchemasRegistered() {
  const walletClient = getWalletClient()
  if (!walletClient) {
    throw new Error('Wallet client not available. Please set PRIVATE_KEY in environment variables.')
  }

  const sdk = getSdk(true)

  try {
    await sdk.streams.registerEventSchemas(
      [
        POOL_CREATED_EVENT_ID,
        BET_PLACED_EVENT_ID,
        BET_CLAIMED_EVENT_ID,
        RESULT_SET_EVENT_ID,
        FUNDS_DISTRIBUTED_EVENT_ID,
        FUNDS_WITHDRAWN_EVENT_ID,
        ETHER_RECEIVED_EVENT_ID,
        POINTS_AWARDED_EVENT_ID,
        POINTS_ADDED_EVENT_ID,
      ],
      [
        {
          params: [{ name: 'poolId', paramType: 'uint256', isIndexed: true }],
          eventTopic: 'PoolCreated(uint256 indexed poolId)',
        },
        {
          params: [
            { name: 'user', paramType: 'address', isIndexed: true },
            { name: 'poolId', paramType: 'uint256', isIndexed: true },
          ],
          eventTopic: 'BetPlaced(address indexed user, uint256 indexed poolId)',
        },
        {
          params: [
            { name: 'user', paramType: 'address', isIndexed: true },
            { name: 'poolId', paramType: 'uint256', isIndexed: true },
          ],
          eventTopic: 'BetClaimed(address indexed user, uint256 indexed poolId)',
        },
        {
          params: [{ name: 'poolId', paramType: 'uint256', isIndexed: true }],
          eventTopic: 'ResultSet(uint256 indexed poolId)',
        },
        {
          params: [{ name: 'poolId', paramType: 'uint256', isIndexed: true }],
          eventTopic: 'FundsDistributed(uint256 indexed poolId)',
        },
        {
          params: [{ name: 'owner', paramType: 'address', isIndexed: true }],
          eventTopic: 'FundsWithdrawn(address indexed owner)',
        },
        {
          params: [{ name: 'sender', paramType: 'address', isIndexed: true }],
          eventTopic: 'EtherReceived(address indexed sender)',
        },
        {
          params: [{ name: 'user', paramType: 'address', isIndexed: true }],
          eventTopic: 'PointsAwarded(address indexed user)',
        },
        {
          params: [{ name: 'user', paramType: 'address', isIndexed: true }],
          eventTopic: 'PointsAdded(address indexed user)',
        },
      ]
    )
  } catch (error: any) {
    const errorMessage = error?.message || String(error)
    
    if (
      errorMessage.includes('EventSchemaAlreadyRegistered') ||
      errorMessage.includes('already registered') ||
      errorMessage.includes('AlreadyRegistered')
    ) {
      return
    }
    
    if (errorMessage.includes('account does not exist') || errorMessage.includes('insufficient funds')) {
      const walletAddress = walletClient.account?.address || 'unknown'
      throw new Error(
        `Account not funded or does not exist on Somnia Testnet. ` +
        `Please fund your wallet (address: ${walletAddress}) with STT tokens from the Somnia faucet. ` +
        `Original error: ${errorMessage}`
      )
    }
    console.warn('Failed to register event schemas:', errorMessage)
  }
}





// Get all pools from smart contract using readContract
export async function getAllPools(): Promise<Pool[]> {
  const publicClient = getPublicClient();
  const pools: Pool[] = [];
  try {
    // 1️⃣ Get total pool count from contract
    const totalPoolCount = await readContract(publicClient, {
      address: DiceManiaAddress,
      abi: DiceManiaABI,
      functionName: 'poolId',
    }) as bigint;

    const poolCount = Number(totalPoolCount);
    console.log(`📊 Total pools in contract: ${poolCount}`);

    if (poolCount === 0) {
      return [];
    }

    // 2️⃣ Fetch pool details from contract for each pool using readContract
    const poolPromises = [];
    for (let i = 0; i < poolCount; i++) {
      poolPromises.push(
        readContract(publicClient, {
          address: DiceManiaAddress,
          abi: DiceManiaABI,
          functionName: 'getPoolDetail',
          args: [BigInt(i)],
        }).then((poolDetailResult: any) => {
          // getPoolDetail returns: totalplayers, baseamount, endtime, result, totalamount, playersLeft, ended
          const [
            totalPlayers,
            baseAmount,
            endTime,
            poolResult,
            totalAmount,
            playersLeft,
            ended,
          ] = poolDetailResult as [bigint, bigint, bigint, bigint, bigint, bigint, boolean];

          // startTime is not returned by getPoolDetail, set to 0
          // Note: startTime can be obtained from PoolCreated events if needed
          const startTime = BigInt(0);

          return {
            poolId: BigInt(i),
            endTime,
            startTime,
            totalAmount,
            totalPlayers,
            playersLeft,
            result: poolResult,
            ended,
            baseAmount,
          } as Pool;
        }).catch((error: any) => {
          console.error(`⚠️ Failed to fetch pool ${i}:`, error?.message);
          return null;
        })
      );
    }

    // 3️⃣ Wait for all pool details to be fetched
    const poolResults = await Promise.all(poolPromises);
    
    // Filter out null results and sort by poolId
    const validPools = poolResults.filter((pool): pool is Pool => pool !== null);
    validPools.sort((a, b) => {
      if (a.poolId < b.poolId) return -1;
      if (a.poolId > b.poolId) return 1;
      return 0;
    });

    console.log(`✅ Loaded ${validPools.length} pools from smart contract using readContract`);
    return validPools;
  } catch (error: any) {
    console.error('❌ Error fetching pools from contract:', error?.message);
    throw new Error(`Failed to fetch pools from contract: ${error?.message}`);
  }
}

// Get pools - optionally limited by totalPoolCount
export async function getPools(totalPoolCount?: number): Promise<Pool[]> {
  console.log("getPools", totalPoolCount);
  const allPools = await getAllPools();
  console.log("allPools", allPools);  
  if (totalPoolCount !== undefined && totalPoolCount !== null) {
    const count = Number(totalPoolCount);
    if (!isNaN(count) && count >= 0) {
      return allPools.slice(0, count);
    }
  }
  
  return allPools;
}

export async function createPool(
  poolId: bigint,
  totalPlayers: bigint,   // number of players
  baseAmount: bigint,     // entry/base amount per player
) {
  const walletClient = getWalletClient();
  if (!walletClient || !walletClient.account) {
    throw new Error('Wallet client not available. PRIVATE_KEY must be set for write operations.');
  }
  console.log("createPool - storing in Somnia streams", { poolId, totalPlayers, baseAmount });
  const publicClient = getPublicClient();
  
  try {
    let streamTx: string | undefined;
    try {
      const sdk = getSdk(true);
      await ensureSchemasRegistered();
      await ensureEventSchemasRegistered();

      // Calculate values needed for encoding
      const timestamp = Date.now().toString();
      const startTime = BigInt(timestamp);
      const endTime = startTime + BigInt(10 * 60 * 1000);

      // Encode pool created event data
      const poolCreatedEncoder = new SchemaEncoder(poolCreatedSchema);
      const poolCreatedData = poolCreatedEncoder.encodeData([
        { name: 'poolId', value: poolId.toString(), type: 'uint256' },
        { name: 'endTime', value: endTime.toString(), type: 'uint256' },
        { name: 'totalPlayers', value: totalPlayers.toString(), type: 'uint256' },
        { name: 'baseAmount', value: baseAmount.toString(), type: 'uint256' },
        { name: 'startTime', value: startTime.toString(), type: 'uint256' },
      ]);

      // Encode full pool state data (initial state for new pool)
      const poolEncoder = new SchemaEncoder(poolSchema);
      const poolData = poolEncoder.encodeData([
        { name: 'timestamp', value: timestamp, type: 'uint64' },
        { name: 'poolId', value: poolId.toString(), type: 'uint256' },
        { name: 'endTime', value: endTime.toString(), type: 'uint256' },
        { name: 'startTime', value: startTime.toString(), type: 'uint256' },
        { name: 'totalAmount', value: '0', type: 'uint256' },
        { name: 'totalPlayers', value: totalPlayers.toString(), type: 'uint256' },
        { name: 'playersLeft', value: totalPlayers.toString(), type: 'uint256' },
        { name: 'result', value: '0', type: 'uint256' },
        { name: 'ended', value: false, type: 'bool' },
        { name: 'baseAmount', value: baseAmount.toString(), type: 'uint256' },
      ]);

      // Compute schema IDs
      const poolCreatedSchemaId = await sdk.streams.computeSchemaId(poolCreatedSchema);
      const poolSchemaId = await sdk.streams.computeSchemaId(poolSchema);

      if (!poolCreatedSchemaId || !poolSchemaId) {
        throw new Error('Failed to compute schema IDs');
      }

      // Create keys for data storage
      const poolCreatedKey = toHex(`created-${poolId}`, { size: 32 });
      const poolStateKey = toHex(`pool-${poolId}`, { size: 32 });

      const eventTopics = [toHex(poolId.toString(), { size: 32 })];
      const streamTxResult = await sdk.streams.setAndEmitEvents(
        [
          { id: poolCreatedKey, schemaId: poolCreatedSchemaId, data: poolCreatedData },
          { id: poolStateKey, schemaId: poolSchemaId, data: poolData },
        ],
        [
          {
            id: POOL_CREATED_EVENT_ID,
            argumentTopics: eventTopics,
            data: '0x' as `0x${string}`,
          },
        ]
      );

      if (!streamTxResult || typeof streamTxResult !== 'string') {
        throw new Error('Failed to create pool in Somnia streams');
      }

      streamTx = streamTxResult;

      // Wait for stream transaction confirmation
      await waitForTransactionReceipt(publicClient, { hash: streamTx as Hex });
      console.log('✅ Pool data stored in Somnia streams');
      
      console.log('✅ Pool data stored in Somnia streams successfully!');
      console.log(`🆔 Pool ID: ${poolId}`);
      console.log(`📦 Stream Tx Hash: ${streamTx}`);

      return {
        poolId: poolId.toString(),
        txHash: streamTx,
      };
    } catch (streamError: any) {
      console.warn('⚠️ Failed to store pool in Somnia streams:', streamError?.message);
      throw streamError;
    }
  } catch (error: any) {
    console.error('❌ Error storing pool in Somnia streams:', error);
    throw new Error(`Failed to store pool in Somnia streams: ${error?.message || 'Unknown error'}`);
  }
}

// Place a bet in a pool
export async function placeBet(
  poolId: bigint,
  userAddress: `0x${string}`,
  amount: bigint,
  targetValue: bigint
) {
  const walletClient = getWalletClient();
  if (!walletClient || !walletClient.account) {
    throw new Error('Wallet client not available. PRIVATE_KEY must be set for write operations.');
  }

  try {
    // Store in Somnia data streams (for indexing/searching)
    const sdk = getSdk(true);
    await ensureSchemasRegistered();
    await ensureEventSchemasRegistered();

    // Fetch updated pool state
    const poolState = await getPoolById(poolId);

    console.log("poolState", poolState);
    // if (!poolState) {
    //   throw new Error('Pool not found after bet placement');
    // }

    // const timestamp = Date.now();

    // // Encode bet placed data
    // const betPlacedEncoder = new SchemaEncoder(betPlacedSchema)
    // const betPlacedData = betPlacedEncoder.encodeData([
    //   { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    //   { name: 'user', value: userAddress, type: 'address' },
    //   { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    //   { name: 'amount', value: amount.toString(), type: 'uint256' },
    //   { name: 'targetValue', value: targetValue.toString(), type: 'uint256' }
    // ])

    // Encode player bet data
    // const playerBetEncoder = new SchemaEncoder(playerBetSchema)
    // const playerBetData = playerBetEncoder.encodeData([
    //   { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    //   { name: 'user', value: userAddress, type: 'address' },
    //   { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    //   { name: 'amount', value: amount.toString(), type: 'uint256' },
    //   { name: 'targetScore', value: targetValue.toString(), type: 'uint256' },
    //   { name: 'claimedAmount', value: '0', type: 'uint256' },
    //   { name: 'claimed', value: false, type: 'bool' },
    // ])
    // const poolEncoder = new SchemaEncoder(poolSchema)
    // const poolData = poolEncoder.encodeData([
    //   { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    //   { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    //   { name: 'endTime', value: poolState.endTime.toString(), type: 'uint256' },
    //   { name: 'startTime', value: poolState.startTime.toString(), type: 'uint256' },
    //   { name: 'totalAmount', value: poolState.totalAmount.toString(), type: 'uint256' },
    //   { name: 'totalPlayers', value: poolState.totalPlayers.toString(), type: 'uint256' },
    //   { name: 'playersLeft', value: poolState.playersLeft.toString(), type: 'uint256' },
    //   { name: 'result', value: poolState.result.toString(), type: 'uint256' },
    //   { name: 'ended', value: poolState.ended, type: 'bool' },
    //   { name: 'baseAmount', value: poolState.baseAmount.toString(), type: 'uint256' },
    // ])

    // const betPlacedKey = toHex(`bet-placed-${poolId}-${userAddress}`, { size: 32 })
    // const playerBetKey = keccak256(stringToHex(`bet-${poolId}-${userAddress}`)) as `0x${string}`
    // const poolStateKey = toHex(`pool-${poolId}`, { size: 32 })

    // const betPlacedSchemaId = await sdk.streams.computeSchemaId(betPlacedSchema)
    // const playerBetSchemaId = await sdk.streams.computeSchemaId(playerBetSchema)
    // const poolSchemaId = await sdk.streams.computeSchemaId(poolSchema)

    // if (betPlacedSchemaId && playerBetSchemaId && poolSchemaId) {
    //   const poolIdHex = toHex(poolId.toString(), { size: 32 })
    //   const eventTopics = [
    //     toHex(userAddress, { size: 20 }),
    //     poolIdHex,
    //   ]

    //   try {
    //     await sdk.streams.setAndEmitEvents(
    //       [
    //         { id: betPlacedKey, schemaId: betPlacedSchemaId, data: betPlacedData },
    //         { id: playerBetKey, schemaId: playerBetSchemaId, data: playerBetData },
    //         { id: poolStateKey, schemaId: poolSchemaId, data: poolData },
    //       ],
    //       [
    //         {
    //           id: BET_PLACED_EVENT_ID,
    //           argumentTopics: eventTopics,
    //           data: '0x' as `0x${string}`,
    //         },
    //       ]
    //     );
    //     console.log('✅ Bet data stored in Somnia streams');
    //   } catch (streamError: any) {
    //     console.warn('⚠️ Failed to store bet in Somnia streams:', streamError?.message);
    //     // Don't fail the whole operation if stream storage fails
    //   }
    // }

    // console.log('✅ Bet placed successfully and stored in Somnia streams!');

    // return { success: true };
  } catch (error: any) {
    console.error('❌ Error placing bet:', error);
    throw new Error(`Failed to place bet: ${error?.message || 'Unknown error'}`);
  }
}

// Claim bet reward
export async function claimBet(
  poolId: bigint,
  userAddress: `0x${string}`,
  reward: bigint
) {
  const sdk = getSdk(true)
  await ensureSchemasRegistered()
  await ensureEventSchemasRegistered()

  const poolState = await getPoolById(poolId)
  if (!poolState) {
    throw new Error('Pool not found')
  }
  if (!poolState.ended) {
    throw new Error('Pool is not resolved yet')
  }
  if (reward === BigInt(0)) {
    throw new Error('No reward to claim')
  }

  const timestamp = Date.now()

  // Encode bet claimed data
  const betClaimedEncoder = new SchemaEncoder(betClaimedSchema)
  const betClaimedData = betClaimedEncoder.encodeData([
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    { name: 'user', value: userAddress, type: 'address' },
    { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    { name: 'reward', value: reward.toString(), type: 'uint256' },
  ])

  // Update player bet to mark as claimed
  const playerBetEncoder = new SchemaEncoder(playerBetSchema)
  const playerBetData = playerBetEncoder.encodeData([
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    { name: 'user', value: userAddress, type: 'address' },
    { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    { name: 'amount', value: '0', type: 'uint256' }, // Will be fetched from existing bet
    { name: 'targetScore', value: '0', type: 'uint256' }, // Will be fetched from existing bet
    { name: 'claimedAmount', value: reward.toString(), type: 'uint256' },
    { name: 'claimed', value: true, type: 'bool' },
  ])

  // Award points for winning (if reward > 0, they won)
  let pointsAwardedData: string | null = null
  let userPointsData: string | null = null
  let pointsAwardedKey: `0x${string}` | null = null
  let userPointsKey: `0x${string}` | null = null
  let pointsAwardedSchemaId: `0x${string}` | null = null
  let userPointsSchemaId: `0x${string}` | null = null

  if (reward > BigInt(0)) {
    const userPoints = await getUserPoints(userAddress)
    const newTotalPoints = userPoints + BigInt(50) // POINTS_PER_WIN = 50

    const pointsAwardedEncoder = new SchemaEncoder(pointsAwardedSchema)
    pointsAwardedData = pointsAwardedEncoder.encodeData([
      { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
      { name: 'user', value: userAddress, type: 'address' },
      { name: 'points', value: '50', type: 'uint256' },
      { name: 'totalPoints', value: newTotalPoints.toString(), type: 'uint256' },
      { name: 'reason', value: 'Bet Won', type: 'string' },
    ])

    const userPointsEncoder = new SchemaEncoder(userPointsSchema)
    userPointsData = userPointsEncoder.encodeData([
      { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
      { name: 'user', value: userAddress, type: 'address' },
      { name: 'totalPoints', value: newTotalPoints.toString(), type: 'uint256' },
    ])

    pointsAwardedKey = keccak256(stringToHex(`points-${userAddress}-${timestamp}`)) as `0x${string}`
    userPointsKey = keccak256(stringToHex(`user-points-${userAddress}`)) as `0x${string}`

    pointsAwardedSchemaId = await sdk.streams.computeSchemaId(pointsAwardedSchema)
    userPointsSchemaId = await sdk.streams.computeSchemaId(userPointsSchema)
  }

  const betClaimedKey = toHex(`bet-claimed-${poolId}-${userAddress}`, { size: 32 })
  const playerBetKey = keccak256(stringToHex(`bet-${poolId}-${userAddress}`)) as `0x${string}`

  const betClaimedSchemaId = await sdk.streams.computeSchemaId(betClaimedSchema)
  const playerBetSchemaId = await sdk.streams.computeSchemaId(playerBetSchema)

  if (!betClaimedSchemaId || !playerBetSchemaId) {
    throw new Error('Failed to compute schema IDs')
  }

  const eventTopics = [
    toHex(userAddress, { size: 20 }),
    toHex(poolId.toString(), { size: 32 }),
  ]

  const dataStreams: Array<{ id: `0x${string}`; schemaId: `0x${string}`; data: `0x${string}` }> = [
    { id: betClaimedKey, schemaId: betClaimedSchemaId, data: betClaimedData as `0x${string}` },
    { id: playerBetKey, schemaId: playerBetSchemaId, data: playerBetData as `0x${string}` },
  ]

  const eventStreams: Array<{ id: string; argumentTopics: `0x${string}`[]; data: `0x${string}` }> = [
    {
      id: BET_CLAIMED_EVENT_ID,
      argumentTopics: eventTopics,
      data: '0x' as `0x${string}`,
    },
  ]

  if (reward > BigInt(0) && pointsAwardedData && userPointsData && pointsAwardedKey && userPointsKey && pointsAwardedSchemaId && userPointsSchemaId) {
    dataStreams.push(
      { id: pointsAwardedKey, schemaId: pointsAwardedSchemaId, data: pointsAwardedData as `0x${string}` },
      { id: userPointsKey, schemaId: userPointsSchemaId, data: userPointsData as `0x${string}` }
    )
    eventStreams.push({
      id: POINTS_AWARDED_EVENT_ID,
      argumentTopics: [toHex(userAddress, { size: 20 })],
      data: '0x' as `0x${string}`,
    })
  }

  const tx = await sdk.streams.setAndEmitEvents(dataStreams, eventStreams)
  if (!tx) throw new Error('Failed to claim bet')

  await waitForTransactionReceipt(getPublicClient(), { hash: tx as Hex })

  return { txHash: tx }
}

// Set pool result (owner only)
export async function setResult(
  poolId: bigint,
  resultValue: bigint
) {
  const walletClient = getWalletClient();
  if (!walletClient || !walletClient.account) {
    throw new Error('Wallet client not available. PRIVATE_KEY must be set for write operations.');
  }

  const publicClient = getPublicClient();

  try {
    // 1️⃣ First, call the smart contract to set the result
    console.log('📝 Calling smart contract setResult function...');
    const contractTxHash = await writeContract(walletClient, {
      address: DiceManiaAddress,
      abi: DiceManiaABI,
      functionName: 'setResult',
      args: [resultValue, poolId], // Contract expects: setResult(uint256 _resultvalue, uint256 _poolId)
      chain: somniaTestnet,
      account: walletClient.account,
    });

    console.log(`📦 Contract transaction hash: ${contractTxHash}`);

    // 2️⃣ Wait for contract transaction confirmation
    const receipt = await waitForTransactionReceipt(publicClient, { 
      hash: contractTxHash 
    });

    console.log('✅ Contract result set confirmed!');

    // 3️⃣ Optionally store in Somnia data streams (for indexing/searching)
    // COMMENTED OUT - Data stream integration temporarily disabled
    /*
    const sdk = getSdk(true);
    await ensureSchemasRegistered();
    await ensureEventSchemasRegistered();

    // Fetch updated pool state
    const poolState = await getPoolById(poolId);
  if (!poolState) {
      throw new Error('Pool not found after setting result');
  }

    const timestamp = Date.now();

  // Encode result set data
  const resultSetEncoder = new SchemaEncoder(resultSetSchema)
  const resultSetData = resultSetEncoder.encodeData([
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    { name: 'resultValue', value: resultValue.toString(), type: 'uint256' },
  ])

  // Update pool state
  const poolEncoder = new SchemaEncoder(poolSchema)
  const poolData = poolEncoder.encodeData([
    { name: 'timestamp', value: timestamp.toString(), type: 'uint64' },
    { name: 'poolId', value: poolId.toString(), type: 'uint256' },
    { name: 'endTime', value: poolState.endTime.toString(), type: 'uint256' },
    { name: 'startTime', value: poolState.startTime.toString(), type: 'uint256' },
    { name: 'totalAmount', value: poolState.totalAmount.toString(), type: 'uint256' },
    { name: 'totalPlayers', value: poolState.totalPlayers.toString(), type: 'uint256' },
    { name: 'playersLeft', value: poolState.playersLeft.toString(), type: 'uint256' },
    { name: 'result', value: resultValue.toString(), type: 'uint256' },
    { name: 'ended', value: true, type: 'bool' },
    { name: 'baseAmount', value: poolState.baseAmount.toString(), type: 'uint256' },
  ])

  const resultSetKey = toHex(`result-set-${poolId}`, { size: 32 })
  const poolStateKey = toHex(`pool-${poolId}`, { size: 32 })

  const resultSetSchemaId = await sdk.streams.computeSchemaId(resultSetSchema)
  const poolSchemaId = await sdk.streams.computeSchemaId(poolSchema)

    if (resultSetSchemaId && poolSchemaId) {
  const eventTopics = [toHex(poolId.toString(), { size: 32 })]

      try {
        await sdk.streams.setAndEmitEvents(
    [
      { id: resultSetKey, schemaId: resultSetSchemaId, data: resultSetData },
      { id: poolStateKey, schemaId: poolSchemaId, data: poolData },
    ],
    [
      {
        id: RESULT_SET_EVENT_ID,
        argumentTopics: eventTopics,
        data: '0x' as `0x${string}`,
      },
    ]
        );
        console.log('✅ Result data stored in Somnia streams');
      } catch (streamError: any) {
        console.warn('⚠️ Failed to store result in Somnia streams:', streamError?.message);
        // Don't fail the whole operation if stream storage fails
      }
    }
    */

    console.log('✅ Result set successfully on smart contract!');
    console.log(`📦 Contract Tx Hash: ${contractTxHash}`);

    return { txHash: contractTxHash };
  } catch (error: any) {
    console.error('❌ Error setting result:', error);
    throw new Error(`Failed to set result: ${error?.message || 'Unknown error'}`);
  }
}
// Get pool by ID - reads from Somnia data streams
export async function getPoolById(poolId: bigint): Promise<Pool | null> {
  const sdk = getSdk(false);
  let publisher = getPublisherAddress();

  // Fallback to env variable if wallet client unavailable
  if (!publisher) {
    publisher = process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS as `0x${string}` | null;
  }

  if (!publisher) {
    throw new Error('Publisher address not configured. Set NEXT_PUBLIC_PUBLISHER_ADDRESS in environment variables.');
  }

  try {
    const poolSchemaId = await sdk.streams.computeSchemaId(poolSchema);
    if (!poolSchemaId) return null;

    const poolStateKey = toHex(`pool-${poolId}`, { size: 32 });
    const data = await sdk.streams.getByKey(poolSchemaId, publisher, poolStateKey);

    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const decoded = data[0] as any[];

    if (!Array.isArray(decoded) || decoded.length < 10) {
      return null;
    }

    const getValue = (field: any) => field?.value?.value ?? field?.value;

    // Extract values from decoded data
    // Schema order: timestamp, poolId, endTime, startTime, totalAmount, totalPlayers, playersLeft, result, ended, baseAmount
    const timestampValue = getValue(decoded[0]);
    const poolIdValue = getValue(decoded[1]);
    const endTimeValue = getValue(decoded[2]);
    const startTimeValue = getValue(decoded[3]);
    const totalAmountValue = getValue(decoded[4]);
    const totalPlayersValue = getValue(decoded[5]);
    const playersLeftValue = getValue(decoded[6]);
    const resultValue = getValue(decoded[7]);
    const endedValue = getValue(decoded[8]);
    const baseAmountValue = getValue(decoded[9]);

    // Validate required fields
    if (poolIdValue === undefined || poolIdValue === null || poolIdValue === '') {
      throw new Error('Pool ID is missing from pool data');
    }

    // Convert to string first, then validate
    const poolIdStr = String(poolIdValue).trim();
    if (!poolIdStr || poolIdStr === 'undefined' || poolIdStr === 'null') {
      throw new Error('Pool ID is invalid');
    }

    // Validate that the string represents a valid number before BigInt conversion
    if (isNaN(Number(poolIdStr))) {
      throw new Error(`Pool ID is not a valid number: ${poolIdStr}`);
    }

    // Convert values to appropriate types
    const poolIdBigInt = BigInt(poolIdStr);
    const endTime = endTimeValue !== undefined && endTimeValue !== null && endTimeValue !== ''
      ? BigInt(String(endTimeValue))
      : BigInt(0);
    const startTime = startTimeValue !== undefined && startTimeValue !== null && startTimeValue !== ''
      ? BigInt(String(startTimeValue))
      : BigInt(0);
    const totalAmount = totalAmountValue !== undefined && totalAmountValue !== null && totalAmountValue !== ''
      ? BigInt(String(totalAmountValue))
      : BigInt(0);
    const totalPlayers = totalPlayersValue !== undefined && totalPlayersValue !== null && totalPlayersValue !== ''
      ? BigInt(String(totalPlayersValue))
      : BigInt(0);
    const playersLeft = playersLeftValue !== undefined && playersLeftValue !== null && playersLeftValue !== ''
      ? BigInt(String(playersLeftValue))
      : BigInt(0);
    const result = resultValue !== undefined && resultValue !== null && resultValue !== ''
      ? BigInt(String(resultValue))
      : BigInt(0);
    const ended = Boolean(endedValue ?? false);
    const baseAmount = baseAmountValue !== undefined && baseAmountValue !== null && baseAmountValue !== ''
      ? BigInt(String(baseAmountValue))
      : BigInt(0);

    return {
      poolId: poolIdBigInt,
      endTime,
      startTime,
      totalAmount,
      totalPlayers,
      playersLeft,
      result,
      ended,
      baseAmount,
    } as Pool;
  } catch (error: any) {
    console.error(`⚠️ Failed to fetch pool ${poolId}:`, error?.message);
    return null;
  }
}

// Get pool bets - reads from smart contract using readContract
export async function getPoolBets(poolId: bigint): Promise<PlayerBet[]> {
  const publicClient = getPublicClient();

  try {
    // Fetch bets from contract using readContract
    const bets = await readContract(publicClient, {
      address: DiceManiaAddress,
      abi: DiceManiaABI,
      functionName: 'getBets',
      args: [poolId],
    }) as Array<{
      user: `0x${string}`;
      amount: bigint;
      targetScore: bigint;
      claimedAmount: bigint;
      claimed: boolean;
    }>;

    // Convert contract bets to PlayerBet format
    const playerBets: PlayerBet[] = bets.map((bet) => ({
      user: bet.user,
      amount: bet.amount,
      targetScore: bet.targetScore,
      claimedAmount: bet.claimedAmount,
      claimed: bet.claimed,
    }));

    return playerBets;
  } catch (error: any) {
    console.error(`⚠️ Failed to fetch bets for pool ${poolId}:`, error?.message);
    return [];
  }
}

export async function getUserPoints(userAddress: `0x${string}`): Promise<bigint> {
  const sdk = getSdk(false)
  let publisher = getPublisherAddress()
  
  if (!publisher) {
    publisher = process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS as `0x${string}` | null
  }
  
  if (!publisher) {
    return BigInt(0)
  }

  const userPointsSchemaId = await sdk.streams.computeSchemaId(userPointsSchema)
  if (!userPointsSchemaId) return BigInt(0)

  const userPointsKey = keccak256(stringToHex(`user-points-${userAddress}`)) as `0x${string}`
  const data = await sdk.streams.getByKey(userPointsSchemaId, publisher, userPointsKey)

  if (!data || !Array.isArray(data) || data.length === 0) {
    return BigInt(0)
  }

  const decoded = data[0] as any[]
  if (!Array.isArray(decoded) || decoded.length < 3) {
    return BigInt(0)
  }

  const getValue = (field: any) => field?.value?.value ?? field?.value
  const totalPoints = getValue(decoded[2])

  return BigInt(String(totalPoints || '0'))
}

// Get stats from contract
export interface Stats {
  totalUsers: bigint
  totalBetsPlaced: bigint
  totalPoolsCreated: bigint
  totalPointsAwarded: bigint
}

export async function getStats(): Promise<Stats> {
  const publicClient = getPublicClient()

  try {
    const stats = await readContract(publicClient, {
      address: DiceManiaAddress,
      abi: DiceManiaABI,
      functionName: 'getStats',
    }) as [bigint, bigint, bigint, bigint]

    const [totalUsers, totalBetsPlaced, totalPoolsCreated, totalPointsAwarded] = stats

    return {
      totalUsers,
      totalBetsPlaced,
      totalPoolsCreated,
      totalPointsAwarded,
    }
  } catch (error: any) {
    console.error('⚠️ Failed to fetch stats:', error?.message)
    return {
      totalUsers: BigInt(0),
      totalBetsPlaced: BigInt(0),
      totalPoolsCreated: BigInt(0),
      totalPointsAwarded: BigInt(0),
    }
  }
}

// export async function getAllPools(): Promise<Pool[]> {
//   const sdk = getSdk(false);
//   let publisher = getPublisherAddress();

//   if (!publisher) {
//     publisher = process.env.NEXT_PUBLIC_PUBLISHER_ADDRESS as `0x${string}` | null;
//   }

//   if (!publisher) {
//     throw new Error('Publisher address not configured. Set NEXT_PUBLIC_PUBLISHER_ADDRESS in environment variables.');
//   }

//   const poolSchemaId = await sdk.streams.computeSchemaId(poolSchema);
//   if (!poolSchemaId) {
//     console.error('❌ Failed to compute poolSchemaId');
//     return [];
//   }

//   try {
//     const allPools = await sdk.streams.getAllPublisherDataForSchema(poolSchemaId, publisher);
//     if (!allPools || !Array.isArray(allPools) || allPools.length === 0) {
//       return [];
//     }

//     const pools: Pool[] = [];

//     for (const row of allPools) {
//       if (!Array.isArray(row) || row.length < 10) continue;

//       const getValue = (field: any) => field?.value?.value ?? field?.value;

//       const poolId = BigInt(String(getValue(row[1]) || '0'));
//       const endTime = BigInt(String(getValue(row[2]) || '0'));
//       const startTime = BigInt(String(getValue(row[3]) || '0'));
//       const totalAmount = BigInt(String(getValue(row[4]) || '0'));
//       const totalPlayers = BigInt(String(getValue(row[5]) || '0'));
//       const playersLeft = BigInt(String(getValue(row[6]) || '0'));
//       const result = BigInt(String(getValue(row[7]) || '0'));
//       const ended = Boolean(getValue(row[8]) ?? false);
//       const baseAmount = BigInt(String(getValue(row[9]) || '0'));

//       pools.push({
//         poolId,
//         endTime,
//         startTime,
//         totalAmount,
//         totalPlayers,
//         playersLeft,
//         result,
//         ended,
//         baseAmount,
//       });
//     }

//     // Sort by poolId ascending
//     pools.sort((a, b) => Number(a.poolId - b.poolId));

//     console.log(`✅ Loaded ${pools.length} pools`);
//     return pools;
//   } catch (error) {
//     console.error('❌ Error fetching all pools:', error);
//     return [];
//   }
// }