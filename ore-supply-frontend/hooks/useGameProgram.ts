'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { 
  deployToSquares, 
  fetchGameState, 
  fetchMinerStats,
  getCurrentRoundId 
} from '@/lib/program/actions'

export function useGameProgram() {
  const wallet = useWallet()
  
  // State
  const [gameState, setGameState] = useState<any>(null)
  const [minerStats, setMinerStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentRoundId, setCurrentRoundId] = useState<number>(0)

  // Fetch game state
  const refreshGameState = useCallback(async () => {
    try {
      setError(null)
      const state = await fetchGameState()
      setGameState(state)
      setCurrentRoundId(state.roundId)
    } catch (err) {
      console.error('Failed to fetch game state:', err)
      setError('Failed to load game state')
    }
  }, [])

  // Fetch miner stats
  const refreshMinerStats = useCallback(async () => {
    if (!wallet.publicKey) return
    
    try {
      setError(null)
      const stats = await fetchMinerStats(wallet.publicKey)
      setMinerStats(stats)
    } catch (err) {
      console.error('Failed to fetch miner stats:', err)
      // Don't set error for miner stats as user might not have deployed yet
    }
  }, [wallet.publicKey])

  // Deploy to squares
  const deploy = useCallback(async (
    selectedSquareIds: number[], 
    amountPerSquare: number
  ): Promise<string> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    if (selectedSquareIds.length === 0) {
      throw new Error('No squares selected')
    }

    if (amountPerSquare <= 0) {
      throw new Error('Invalid amount')
    }

    setLoading(true)
    setError(null)

    try {
      // Get current round ID
      const roundId = currentRoundId || await getCurrentRoundId()

      // Deploy
      const signature = await deployToSquares(
        wallet,
        selectedSquareIds,
        amountPerSquare,
        roundId
      )

      // Refresh state after successful deployment
      await Promise.all([
        refreshGameState(),
        refreshMinerStats()
      ])

      return signature
    } catch (err: any) {
      const errorMessage = err.message || 'Deployment failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wallet, currentRoundId, refreshGameState, refreshMinerStats])

  // Initial load and wallet connection effect
  useEffect(() => {
    refreshGameState()
  }, [refreshGameState])

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      refreshMinerStats()
    } else {
      setMinerStats(null)
    }
  }, [wallet.connected, wallet.publicKey, refreshMinerStats])

  // Poll for updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshGameState()
      if (wallet.connected && wallet.publicKey) {
        refreshMinerStats()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [wallet.connected, wallet.publicKey, refreshGameState, refreshMinerStats])

  return {
    // State
    gameState,
    minerStats,
    loading,
    error,
    
    // Actions
    deploy,
    refresh: () => {
      refreshGameState()
      if (wallet.connected) {
        refreshMinerStats()
      }
    },
    
    // Utilities
    isConnected: wallet.connected,
    publicKey: wallet.publicKey,
  }
}