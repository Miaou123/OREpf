'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import * as anchor from '@coral-xyz/anchor'
import { BN } from '@coral-xyz/anchor'

// Your program ID
const PROGRAM_ID = new PublicKey('B1ETcSDAmhsESxL3R3Sc9at1PLiyr4riRD2ss9TRYUa8')

interface Square {
  id: number
  sol: number
  players: number
}

interface GameState {
  roundId: number
  motherlode: number
  timeRemaining: number
  totalDeployed: number
  winningSquare: number
  squares: Square[]
}

interface MinerStats {
  totalDeployed: number
  rewards: number
}

// ============================================
// BROWSER-COMPATIBLE BUFFER HELPERS
// ============================================

/**
 * Write a BigInt as u64 in little-endian format (browser-compatible)
 */
function writeBigUInt64LE(buffer: Buffer, value: bigint, offset: number = 0): void {
  const bigIntValue = BigInt(value)
  for (let i = 0; i < 8; i++) {
    buffer[offset + i] = Number((bigIntValue >> BigInt(i * 8)) & BigInt(0xff))
  }
}

/**
 * Write a UInt32 in little-endian format (browser-compatible)
 */
function writeUInt32LE(buffer: Buffer, value: number, offset: number = 0): void {
  buffer[offset] = value & 0xff
  buffer[offset + 1] = (value >> 8) & 0xff
  buffer[offset + 2] = (value >> 16) & 0xff
  buffer[offset + 3] = (value >> 24) & 0xff
}

// PDA helpers
function getBoardPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('board')],
    PROGRAM_ID
  )[0]
}

function getRoundPDA(roundId: number) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('round'), new BN(roundId).toArrayLike(Buffer, 'le', 8)],
    PROGRAM_ID
  )[0]
}

function getTreasuryPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('treasury')],
    PROGRAM_ID
  )[0]
}

function getMinerPDA(authority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('miner'), authority.toBuffer()],
    PROGRAM_ID
  )[0]
}

function getConfigPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  )[0]
}

// Safe conversion from BigInt to number (for lamports -> SOL)
function lamportsToSol(lamports: bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL
}

// Safe read of u64 as BigInt
function readU64LE(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64LE(offset)
}

export function useGameProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [minerStats, setMinerStats] = useState<MinerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Store subscription IDs to clean up later
  const subscriptionsRef = useRef<number[]>([])

  // Parse board data
  // Board struct:
  // - discriminator: u64 (8 bytes) at offset 0
  // - round_id: u64 (8 bytes) at offset 8
  // - start_slot: u64 (8 bytes) at offset 16
  // - end_slot: u64 (8 bytes) at offset 24
  const parseBoardData = (data: Buffer) => {
    const roundId = Number(readU64LE(data, 8))
    const startSlot = Number(readU64LE(data, 16))
    const endSlot = Number(readU64LE(data, 24))
    return { roundId, startSlot, endSlot }
  }

  // Parse round data with CORRECT offsets from round.rs
  // Round struct:
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
  const parseRoundData = (data: Buffer) => {
    // Read id
    const roundId = Number(readU64LE(data, 8))
    
    // Read deployed array (25 x u64)
    const deployed: bigint[] = []
    for (let i = 0; i < 25; i++) {
      const offset = 16 + (i * 8)
      deployed.push(readU64LE(data, offset))
    }
    
    // Read count array (25 x u64)
    const count: number[] = []
    for (let i = 0; i < 25; i++) {
      const offset = 248 + (i * 8)
      count.push(Number(readU64LE(data, offset)))
    }
    
    // Read motherlode at offset 456
    const motherlode = readU64LE(data, 456)
    
    // Read total_deployed at offset 536 (NOT 664!)
    const totalDeployed = readU64LE(data, 536)
    
    return { roundId, deployed, count, motherlode, totalDeployed }
  }

  // Store last deployed amounts to detect changes
  const lastDeployedRef = useRef<bigint[]>(Array(25).fill(BigInt(0)))

  // Parse treasury data
  const parseTreasuryData = (data: Buffer) => {
    // Treasury struct varies, adjust based on your actual struct
    let offset = 8 + 8 // discriminator + balance
    const motherlode = readU64LE(data, offset)
    return { motherlode }
  }

  // Parse miner data
  const parseMinerData = (data: Buffer) => {
    let offset = 8 + 32 // discriminator + authority
    const deployed: bigint[] = []
    for (let i = 0; i < 25; i++) {
      deployed.push(readU64LE(data, offset))
      offset += 8
    }
    // Sum BigInts properly
    const totalDeployed = deployed.reduce((sum, amount) => sum + amount, BigInt(0))
    return { totalDeployed }
  }

  // Fetch and update game state
  const updateGameState = useCallback(async (boardData?: Buffer, roundData?: Buffer, treasuryData?: Buffer) => {
    try {
      const boardPda = getBoardPDA()
      const treasuryPda = getTreasuryPDA()
      
      // Fetch board if not provided
      const board = boardData 
        ? parseBoardData(boardData)
        : parseBoardData((await connection.getAccountInfo(boardPda))!.data)
      
      const roundPda = getRoundPDA(board.roundId)
      
      // Fetch round if not provided
      const round = roundData
        ? parseRoundData(roundData)
        : parseRoundData((await connection.getAccountInfo(roundPda))!.data)
      
      // Fetch treasury if not provided
      const treasury = treasuryData
        ? parseTreasuryData(treasuryData)
        : parseTreasuryData((await connection.getAccountInfo(treasuryPda))!.data)
      
      // Calculate time remaining
      const currentSlot = await connection.getSlot()
      let timeRemaining = 0
      
      if (board.endSlot > 4000000000) {
        timeRemaining = 0
      } else {
        const slotsRemaining = Math.max(0, board.endSlot - currentSlot)
        timeRemaining = Math.floor(slotsRemaining * 0.4)
      }
      
      // Create squares data - divide BigInt first, then convert to number
      const squares = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        sol: lamportsToSol(round.deployed[i]),
        players: round.count[i]
      }))
      
      // Detect which squares changed for multiplayer feedback
      const changedSquares: number[] = []
      for (let i = 0; i < 25; i++) {
        if (round.deployed[i] !== lastDeployedRef.current[i]) {
          changedSquares.push(i + 1)
        }
      }
      
      if (changedSquares.length > 0) {
        console.log(`🎮 MULTIPLAYER UPDATE! Squares changed: ${changedSquares.join(', ')}`)
        console.log(`💰 Someone deployed! Total now: ${lamportsToSol(round.totalDeployed)} SOL`)
      }
      
      // Update last deployed amounts (keep as BigInt)
      lastDeployedRef.current = round.deployed
      
      const newGameState: GameState = {
        roundId: board.roundId,
        motherlode: lamportsToSol(round.motherlode) / 1e11, // From round.motherlode
        timeRemaining,
        totalDeployed: lamportsToSol(round.totalDeployed),
        winningSquare: 0,
        squares
      }
      
      setGameState(newGameState)
      console.log('🔄 Game state updated:', { 
        roundId: newGameState.roundId, 
        totalDeployed: newGameState.totalDeployed,
        motherlode: newGameState.motherlode 
      })
      
    } catch (err: any) {
      console.error('Error updating game state:', err)
      setError(err.message || 'Failed to update game state')
    }
  }, [connection])

  // Update miner stats
  const updateMinerStats = useCallback(async (minerData?: Buffer) => {
    if (!wallet.publicKey) return
    
    try {
      const minerPda = getMinerPDA(wallet.publicKey)
      
      const miner = minerData
        ? parseMinerData(minerData)
        : await connection.getAccountInfo(minerPda).then(info => 
            info ? parseMinerData(info.data) : { totalDeployed: BigInt(0) }
          )
      
      setMinerStats({
        totalDeployed: lamportsToSol(miner.totalDeployed),
        rewards: 0
      })
      
      console.log('⛏️  Miner stats updated:', lamportsToSol(miner.totalDeployed), 'SOL')
      
    } catch (err: any) {
      console.log('No miner account yet (normal for new users)')
      setMinerStats({ totalDeployed: 0, rewards: 0 })
    }
  }, [wallet.publicKey, connection])

  // Setup WebSocket subscriptions
  useEffect(() => {
    console.log('🔌 Setting up WebSocket subscriptions...')
    
    const boardPda = getBoardPDA()
    const treasuryPda = getTreasuryPDA()
    
    // Subscribe to board account changes
    const boardSub = connection.onAccountChange(
      boardPda,
      (accountInfo) => {
        console.log('📡 Board account changed!')
        updateGameState(accountInfo.data)
      },
      'confirmed'
    )
    
    subscriptionsRef.current.push(boardSub)
    
    // Subscribe to treasury account changes
    const treasurySub = connection.onAccountChange(
      treasuryPda,
      (accountInfo) => {
        console.log('📡 Treasury account changed!')
        updateGameState()
      },
      'confirmed'
    )
    
    subscriptionsRef.current.push(treasurySub)
    
    // Subscribe to miner account if wallet connected
    if (wallet.publicKey) {
      const minerPda = getMinerPDA(wallet.publicKey)
      const minerSub = connection.onAccountChange(
        minerPda,
        (accountInfo) => {
          console.log('📡 Miner account changed!')
          updateMinerStats(accountInfo.data)
        },
        'confirmed'
      )
      subscriptionsRef.current.push(minerSub)
    }
    
    // Initial fetch
    updateGameState()
    if (wallet.publicKey) {
      updateMinerStats()
    }
    
    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket subscriptions...')
      subscriptionsRef.current.forEach(subId => {
        connection.removeAccountChangeListener(subId)
      })
      subscriptionsRef.current = []
    }
  }, [connection, wallet.publicKey, updateGameState, updateMinerStats])

  // Manual refresh function
  const refreshGameState = useCallback(async () => {
    await updateGameState()
    if (wallet.publicKey) {
      await updateMinerStats()
    }
  }, [updateGameState, updateMinerStats, wallet.publicKey])

  // Deploy function
  const deploy = async (squareIds: number[], amountPerSquare: number): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      // Convert SOL to lamports (safe as BigInt)
      const lamports = BigInt(Math.floor(amountPerSquare * LAMPORTS_PER_SOL))

      // Convert square IDs (1-25) to a bitmask
      let squaresMask = 0
      squareIds.forEach(id => {
        const index = id - 1 // Convert to 0-indexed
        squaresMask |= (1 << index)
      })

      const boardPda = getBoardPDA()
      const minerPda = getMinerPDA(wallet.publicKey)
      
      const boardAccountInfo = await connection.getAccountInfo(boardPda)
      if (!boardAccountInfo) throw new Error('Board account not found')
      
      const roundId = Number(readU64LE(boardAccountInfo.data, 8))
      const roundPda = getRoundPDA(roundId)
      
      // Build instruction data using browser-compatible helpers
      const deployDiscriminator = Buffer.from([0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      
      const amountBuffer = Buffer.alloc(8)
      writeBigUInt64LE(amountBuffer, lamports, 0)  // Use our browser-compatible function
      
      const squaresBuffer = Buffer.alloc(4)
      writeUInt32LE(squaresBuffer, squaresMask, 0)  // Use our browser-compatible function
      
      const instructionData = Buffer.concat([deployDiscriminator, amountBuffer, squaresBuffer])
      
      const instruction = {
        programId: PROGRAM_ID,
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: wallet.publicKey, isSigner: false, isWritable: true },
          { pubkey: PublicKey.default, isSigner: false, isWritable: true },
          { pubkey: boardPda, isSigner: false, isWritable: true },
          { pubkey: minerPda, isSigner: false, isWritable: true },
          { pubkey: roundPda, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: instructionData,
      }
      
      const transaction = new Transaction().add(instruction)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey
      
      const signedTransaction = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      
      console.log('📤 Transaction sent:', signature)
      
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight })
      
      console.log('✅ Transaction confirmed!')
      
      return signature
      
    } catch (err: any) {
      console.error('Deploy error:', err)
      setError(err.message || 'Deployment failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    gameState,
    minerStats,
    loading,
    error,
    deploy,
    refreshGameState,
  }
}