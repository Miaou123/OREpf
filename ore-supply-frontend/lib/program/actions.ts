import { 
    Connection, 
    PublicKey, 
    Transaction,
    sendAndConfirmTransaction,
    Keypair
  } from '@solana/web3.js'
  import { RPC_ENDPOINT, lamportsToSol } from './constants'
  import { findBoardPda, findMinerPda, findRoundPda, findStakePda } from './pdas'
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
   * Fetch current game state
   */
  export async function fetchGameState(): Promise<any> {
    try {
      const [boardPda] = findBoardPda()
      
      const accountInfo = await connection.getAccountInfo(boardPda)
      if (!accountInfo) {
        throw new Error('Board account not found')
      }
  
      // Parse board account data
      const data = accountInfo.data
      
      // Board structure (adjust offsets based on your actual struct):
      // - round_id: u64 (8 bytes) at offset 8
      // - unix_timestamp: i64 (8 bytes) at offset 16
      // - etc.
      
      const roundId = Number(data.readBigUInt64LE(8))
      const timestamp = Number(data.readBigInt64LE(16))
      
      // Fetch round data
      const [roundPda] = findRoundPda(roundId)
      const roundInfo = await connection.getAccountInfo(roundPda)
      
      if (!roundInfo) {
        return {
          roundId,
          timestamp,
          squares: [],
          motherlode: 0,
          timeRemaining: 0,
        }
      }
  
      // Parse round data
      const roundData = roundInfo.data
      // Adjust these offsets based on your Round struct
      const motherlode = lamportsToSol(Number(roundData.readBigUInt64LE(8)))
      
      // Parse squares (25 squares with amount data)
      const squares = []
      for (let i = 0; i < 25; i++) {
        const offset = 16 + (i * 16) // Adjust based on your struct
        const amount = lamportsToSol(Number(roundData.readBigUInt64LE(offset)))
        const players = roundData.readUInt32LE(offset + 8)
        
        squares.push({
          id: i + 1,
          sol: amount,
          players: players
        })
      }
  
      return {
        roundId,
        timestamp,
        squares,
        motherlode,
        timeRemaining: 0, // Calculate from timestamp
        winningSquare: 1, // Determine winning square logic
      }
    } catch (error) {
      console.error('Error fetching game state:', error)
      throw error
    }
  }
  
  /**
   * Fetch user's miner stats
   */
  export async function fetchMinerStats(userPubkey: PublicKey): Promise<any> {
    try {
      const [minerPda] = findMinerPda(userPubkey)
      
      const accountInfo = await connection.getAccountInfo(minerPda)
      if (!accountInfo) {
        // User hasn't deployed yet
        return {
          totalDeployed: 0,
          rewardsSOL: 0,
          rewardsORE: 0,
          roundId: 0,
          deployed: new Array(25).fill(0),
        }
      }
  
      // Parse miner data
      const data = accountInfo.data
      
      // Adjust offsets based on your Miner struct
      const roundId = Number(data.readBigUInt64LE(8))
      const rewardsSOL = lamportsToSol(Number(data.readBigUInt64LE(16)))
      const rewardsORE = Number(data.readBigUInt64LE(24))
      
      // Parse deployed array (25 u64 values)
      const deployed = []
      let totalDeployed = 0
      for (let i = 0; i < 25; i++) {
        const offset = 32 + (i * 8)
        const amount = lamportsToSol(Number(data.readBigUInt64LE(offset)))
        deployed.push(amount)
        totalDeployed += amount
      }
  
      return {
        roundId,
        totalDeployed,
        rewardsSOL,
        rewardsORE,
        deployed,
      }
    } catch (error) {
      console.error('Error fetching miner stats:', error)
      throw error
    }
  }
  
  /**
   * Fetch staking info for user
   */
  export async function fetchStakeInfo(userPubkey: PublicKey): Promise<any> {
    try {
      const [stakePda] = findStakePda(userPubkey)
      
      const accountInfo = await connection.getAccountInfo(stakePda)
      if (!accountInfo) {
        return {
          staked: 0,
          rewards: 0,
        }
      }
  
      const data = accountInfo.data
      const staked = Number(data.readBigUInt64LE(8))
      const rewards = Number(data.readBigUInt64LE(16))
  
      return {
        staked,
        rewards,
      }
    } catch (error) {
      console.error('Error fetching stake info:', error)
      throw error
    }
  }
  
  /**
   * Get current round ID from board
   */
  export async function getCurrentRoundId(): Promise<number> {
    const [boardPda] = findBoardPda()
    const accountInfo = await connection.getAccountInfo(boardPda)
    
    if (!accountInfo) {
      throw new Error('Board not initialized')
    }
  
    return Number(accountInfo.data.readBigUInt64LE(8))
  }