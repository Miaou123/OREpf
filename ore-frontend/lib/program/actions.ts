import { 
  Connection, 
  PublicKey, 
  Transaction,
  Keypair
} from '@solana/web3.js'
import { RPC_ENDPOINT, lamportsToSol, SLOTS_PER_SECOND } from './constants'
import { findBoardPda, findMinerPda, findRoundPda } from './pdas'
import { createDeployInstruction, createSquaresArray } from './instructions'

// Create connection
export const connection = new Connection(RPC_ENDPOINT, 'confirmed')

/**
 * Deploy SOL to selected squares
 */
export async function deployToSquares(
  wallet: any,
  selectedSquareIds: number[], // Array of 1-25 (not 0-24)
  amountPerSquare: number, // SOL amount per square
  roundId: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected')
  }

  // Convert square IDs (1-25) to indices (0-24)
  const selectedIndices = selectedSquareIds.map(id => id - 1)
  
  // Create boolean array
  const squares = createSquaresArray(selectedIndices)

  // Create deploy instruction
  const instruction = createDeployInstruction(
    wallet.publicKey,
    wallet.publicKey,
    amountPerSquare,
    squares,
    roundId
  )

  // Create transaction
  const transaction = new Transaction().add(instruction)
  transaction.feePayer = wallet.publicKey
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  // Sign and send
  const signed = await wallet.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())

  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed')

  console.log('Deploy successful! Signature:', signature)
  return signature
}

/**
 * Get current round ID from Board account
 */
export async function getCurrentRoundId(): Promise<number> {
  const [boardPda] = findBoardPda()
  
  const accountInfo = await connection.getAccountInfo(boardPda)
  if (!accountInfo) {
    throw new Error('Board account not found - program may not be initialized')
  }

  const data = accountInfo.data
  
  // Board structure (from board.rs):
  // - discriminator: u64 (8 bytes) at offset 0
  // - round_id: u64 (8 bytes) at offset 8
  const roundId = data.readBigUInt64LE(8)
  
  return Number(roundId)
}

/**
 * Fetch current game state
 */
export async function fetchGameState(): Promise<any> {
  try {
    const [boardPda] = findBoardPda()
    
    const accountInfo = await connection.getAccountInfo(boardPda)
    if (!accountInfo) {
      throw new Error('Board account not found - program may not be initialized')
    }

    // Parse board account data
    const boardData = accountInfo.data
    
    // Board structure (from board.rs):
    // - discriminator: u64 (8 bytes) at offset 0
    // - round_id: u64 (8 bytes) at offset 8
    // - start_slot: u64 (8 bytes) at offset 16
    // - end_slot: u64 (8 bytes) at offset 24
    
    const roundId = Number(boardData.readBigUInt64LE(8))
    const startSlot = Number(boardData.readBigUInt64LE(16))
    const endSlot = Number(boardData.readBigUInt64LE(24))
    
    // Get current slot to calculate time remaining
    const currentSlot = await connection.getSlot()
    
    // Calculate time remaining in seconds
    // Each slot is approximately 400ms (2.5 slots per second)
    const slotsRemaining = Math.max(0, endSlot - currentSlot)
    const timeRemaining = Math.floor(slotsRemaining / SLOTS_PER_SECOND)
    
    // Fetch round data
    const [roundPda] = findRoundPda(roundId)
    const roundAccountInfo = await connection.getAccountInfo(roundPda)
    
    let squares = []
    let motherlode = 0
    let totalDeployed = 0
    let winningSquare = 0
    
    if (roundAccountInfo) {
      const roundData = roundAccountInfo.data
      
      // Round structure (from round.rs):
      // - discriminator: u64 (8 bytes) at offset 0
      // - id: u64 (8 bytes) at offset 8
      // - deployed: [u64; 25] (200 bytes) at offset 16
      // - slot_hash: [u8; 32] (32 bytes) at offset 216
      // - count: [u64; 25] (200 bytes) at offset 248
      // - expires_at: u64 (8 bytes) at offset 448
      // - motherlode: u64 (8 bytes) at offset 456
      // - rent_payer: Pubkey (32 bytes) at offset 464
      // - top_miner: Pubkey (32 bytes) at offset 496
      // - top_miner_reward: u64 (8 bytes) at offset 528
      // - total_deployed: u64 (8 bytes) at offset 536
      // - total_vaulted: u64 (8 bytes) at offset 544
      // - total_winnings: u64 (8 bytes) at offset 552
      
      // Parse deployed amounts for each square
      for (let i = 0; i < 25; i++) {
        const offset = 16 + (i * 8)
        const deployedLamports = Number(roundData.readBigUInt64LE(offset))
        const playersOffset = 248 + (i * 8)
        const players = Number(roundData.readBigUInt64LE(playersOffset))
        
        squares.push({
          id: i + 1,
          sol: lamportsToSol(deployedLamports),
          players: players
        })
      }
      
      // Parse other round data
      motherlode = lamportsToSol(Number(roundData.readBigUInt64LE(456)))
      totalDeployed = lamportsToSol(Number(roundData.readBigUInt64LE(536)))
      
      // Check if round has ended and winning square is determined
      const slotHash = roundData.slice(216, 248)
      const isRoundEnded = !slotHash.every(byte => byte === 0)
      
      if (isRoundEnded) {
        // Calculate winning square from slot hash
        const r1 = roundData.readBigUInt64LE(216)
        const r2 = roundData.readBigUInt64LE(224)
        const r3 = roundData.readBigUInt64LE(232)
        const r4 = roundData.readBigUInt64LE(240)
        const rng = r1 ^ r2 ^ r3 ^ r4
        winningSquare = Number(rng % 25n) + 1 // Convert to 1-based index
      }
    } else {
      // If round account doesn't exist, create empty squares
      squares = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        sol: 0,
        players: 0
      }))
    }
    
    return {
      roundId,
      startSlot,
      endSlot,
      timeRemaining,
      squares,
      motherlode,
      totalDeployed,
      winningSquare
    }
  } catch (err) {
    console.error('Failed to fetch game state:', err)
    throw err
  }
}

/**
 * Fetch miner stats for a given authority
 */
export async function fetchMinerStats(authority: PublicKey): Promise<any> {
  try {
    const [minerPda] = findMinerPda(authority)
    
    const accountInfo = await connection.getAccountInfo(minerPda)
    if (!accountInfo) {
      // Miner account doesn't exist yet - user hasn't deployed
      return {
        totalDeployed: 0,
        rewardsSol: 0,
        rewardsOre: 0,
        exists: false
      }
    }

    const data = accountInfo.data
    
    // Miner structure (from miner.rs):
    // - discriminator: u64 (8 bytes) at offset 0
    // - authority: Pubkey (32 bytes) at offset 8
    // - deployed: [u64; 25] (200 bytes) at offset 40
    // - cumulative: [u64; 25] (200 bytes) at offset 240
    // - rewards_sol: u64 (8 bytes) at offset 440
    // - rewards_ore: u64 (8 bytes) at offset 448
    // ... more fields
    
    const rewardsSol = Number(data.readBigUInt64LE(440))
    const rewardsOre = Number(data.readBigUInt64LE(448))
    
    // Calculate total deployed by summing deployed array
    let totalDeployedLamports = 0
    for (let i = 0; i < 25; i++) {
      const offset = 40 + (i * 8)
      totalDeployedLamports += Number(data.readBigUInt64LE(offset))
    }
    
    return {
      totalDeployed: lamportsToSol(totalDeployedLamports),
      rewardsSol: lamportsToSol(rewardsSol),
      rewardsOre: rewardsOre / 1e11, // ORE has 11 decimals
      exists: true
    }
  } catch (err) {
    console.error('Failed to fetch miner stats:', err)
    return {
      totalDeployed: 0,
      rewardsSol: 0,
      rewardsOre: 0,
      exists: false
    }
  }
}