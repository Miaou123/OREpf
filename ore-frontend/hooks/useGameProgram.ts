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
  const parseBoardData = (data: Buffer) => {
    const roundId = new BN(data.slice(8, 16), 'le').toNumber()
    const startSlot = new BN(data.slice(16, 24), 'le').toNumber()
    const endSlot = new BN(data.slice(24, 32), 'le').toNumber()
    return { roundId, startSlot, endSlot }
  }

  // Parse round data
  const parseRoundData = (data: Buffer) => {
    let offset = 8
    const roundId = new BN(data.slice(offset, offset + 8), 'le').toNumber()
    offset += 8
    
    const deployed: number[] = []
    for (let i = 0; i < 25; i++) {
      deployed.push(new BN(data.slice(offset, offset + 8), 'le').toNumber())
      offset += 8
    }
    
    offset += 32 // slot_hash
    
    const count: number[] = []
    for (let i = 0; i < 25; i++) {
      count.push(new BN(data.slice(offset, offset + 8), 'le').toNumber())
      offset += 8
    }
    
    // Get total_deployed (adjust offset based on your struct)
    offset = 8 + 200 + 32 + 200 + 200 + 8 + 8 + 8
    const totalDeployed = new BN(data.slice(offset, offset + 8), 'le').toNumber()
    
    return { roundId, deployed, count, totalDeployed }
  }

  // Store last deployed amounts to detect changes
  const lastDeployedRef = useRef<number[]>(Array(25).fill(0))

  // Parse treasury data
  const parseTreasuryData = (data: Buffer) => {
    let offset = 8 + 8 // discriminator + balance
    const motherlode = new BN(data.slice(offset, offset + 8), 'le').toNumber()
    return { motherlode }
  }

  // Parse miner data
  const parseMinerData = (data: Buffer) => {
    let offset = 8 + 32 // discriminator + authority
    const deployed: number[] = []
    for (let i = 0; i < 25; i++) {
      deployed.push(new BN(data.slice(offset, offset + 8), 'le').toNumber())
      offset += 8
    }
    const totalDeployed = deployed.reduce((sum, amount) => sum + amount, 0)
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
      
      // Create squares data and detect changes
      const squares = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        sol: round.deployed[i] / LAMPORTS_PER_SOL,
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
        console.log(`💰 Someone deployed! Total now: ${round.totalDeployed / LAMPORTS_PER_SOL} SOL`)
      }
      
      // Update last deployed amounts
      lastDeployedRef.current = round.deployed
      
      const newGameState: GameState = {
        roundId: board.roundId,
        motherlode: treasury.motherlode / 1e11,
        timeRemaining,
        totalDeployed: round.totalDeployed / LAMPORTS_PER_SOL,
        winningSquare: 0,
        squares
      }
      
      setGameState(newGameState)
      console.log('🔄 Game state updated:', { roundId: newGameState.roundId, totalDeployed: newGameState.totalDeployed })
      
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
            info ? parseMinerData(info.data) : { totalDeployed: 0 }
          )
      
      setMinerStats({
        totalDeployed: miner.totalDeployed / LAMPORTS_PER_SOL,
        rewards: 0
      })
      
      console.log('⛏️  Miner stats updated:', miner.totalDeployed / LAMPORTS_PER_SOL, 'SOL')
      
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
        updateGameState(undefined, undefined, accountInfo.data)
      },
      'confirmed'
    )
    
    subscriptionsRef.current.push(treasurySub)
    
    // Initial fetch
    updateGameState()
    
    console.log('✅ WebSocket subscriptions active')
    
    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket subscriptions...')
      subscriptionsRef.current.forEach(id => {
        connection.removeAccountChangeListener(id)
      })
      subscriptionsRef.current = []
    }
  }, [connection, updateGameState])

  // Subscribe to round account changes (updates when round changes)
  useEffect(() => {
    if (!gameState) return
    
    const roundPda = getRoundPDA(gameState.roundId)
    
    console.log(`📡 Subscribing to round ${gameState.roundId}...`)
    
    const roundSub = connection.onAccountChange(
      roundPda,
      (accountInfo) => {
        console.log(`📡 Round ${gameState.roundId} account changed!`)
        updateGameState(undefined, accountInfo.data)
      },
      'confirmed'
    )
    
    subscriptionsRef.current.push(roundSub)
    
    return () => {
      connection.removeAccountChangeListener(roundSub)
    }
  }, [gameState?.roundId, connection, updateGameState])

  // Subscribe to miner account when wallet connects
  useEffect(() => {
    if (!wallet.publicKey) return
    
    const minerPda = getMinerPDA(wallet.publicKey)
    
    console.log('📡 Subscribing to miner account...')
    
    const minerSub = connection.onAccountChange(
      minerPda,
      (accountInfo) => {
        console.log('📡 Miner account changed!')
        updateMinerStats(accountInfo.data)
      },
      'confirmed'
    )
    
    subscriptionsRef.current.push(minerSub)
    
    // Initial fetch
    updateMinerStats()
    
    return () => {
      connection.removeAccountChangeListener(minerSub)
    }
  }, [wallet.publicKey, connection, updateMinerStats])

  // Manual refresh
  const refreshGameState = useCallback(async () => {
    await updateGameState()
    await updateMinerStats()
  }, [updateGameState, updateMinerStats])

  // Deploy SOL to selected squares
  const deploy = async (squareIds: number[], solAmount: number): Promise<string> => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🚀 Deploying:', { squareIds, solAmount })
      
      let squaresMask = 0
      for (const id of squareIds) {
        squaresMask |= (1 << (id - 1))
      }
      
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL)
      
      const boardPda = getBoardPDA()
      const minerPda = getMinerPDA(wallet.publicKey)
      
      const boardAccountInfo = await connection.getAccountInfo(boardPda)
      if (!boardAccountInfo) throw new Error('Board account not found')
      
      const roundId = new BN(boardAccountInfo.data.slice(8, 16), 'le').toNumber()
      const roundPda = getRoundPDA(roundId)
      
      // Build instruction
      const deployDiscriminator = Buffer.from([0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      const amountBuffer = Buffer.alloc(8)
      amountBuffer.writeBigUInt64LE(BigInt(lamports))
      const squaresBuffer = Buffer.alloc(4)
      squaresBuffer.writeUInt32LE(squaresMask)
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
      
      // WebSocket will automatically update the state!
      // No need to manually refresh
      
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