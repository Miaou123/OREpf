'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import Header from '@/components/Header'
import GameGrid from '@/components/Game/GameGrid'
import Motherlode from '@/components/Game/Motherlode'
import Timer from '@/components/Game/Timer'
import Stats from '@/components/Game/Stats'
import DeploymentControls from '@/components/Game/DeploymentControls'
import { useGameProgram } from '@/hooks/useGameProgram'

// Fallback mock data (used while loading)
const mockSquares = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  sol: 0,
  players: 0
}))

export default function Home() {
  const wallet = useWallet()
  const { gameState, minerStats, loading, error, deploy } = useGameProgram()
  const [selectedSquares, setSelectedSquares] = useState<number[]>([])
  const [deploymentError, setDeploymentError] = useState<string | null>(null)

  const handleSquareClick = (id: number) => {
    setSelectedSquares(prev =>
      prev.includes(id)
        ? prev.filter(squareId => squareId !== id)
        : [...prev, id]
    )
  }

  const handleDeploy = async (amount: number, blocks: number) => {
    if (!wallet.connected) {
      setDeploymentError('Please connect your wallet first')
      return
    }

    if (selectedSquares.length === 0) {
      setDeploymentError('Please select at least one square')
      return
    }

    setDeploymentError(null)

    try {
      const signature = await deploy(selectedSquares, amount)
      
      // Success!
      console.log('Deployment successful!', signature)
      setSelectedSquares([]) // Clear selection
      
      // Show success message (you can use a toast library)
      alert(`Successfully deployed! Transaction: ${signature.slice(0, 8)}...`)
    } catch (err: any) {
      console.error('Deployment error:', err)
      setDeploymentError(err.message || 'Deployment failed')
    }
  }

  // Use real data if available, fallback to mock
  const squares = gameState?.squares || mockSquares
  const motherlode = gameState?.motherlode || 0
  const timeRemaining = gameState?.timeRemaining || 0
  const winningSquare = gameState?.winningSquare || 0
  const totalDeployed = gameState?.totalDeployed || 0
  const youDeployed = minerStats?.totalDeployed || 0

  return (
    <>
      <Header />
      <main className="mt-[72px] px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-[1600px] mx-auto">
        {/* Error Message */}
        {(error || deploymentError) && (
          <div className="lg:col-span-2 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
            {error || deploymentError}
          </div>
        )}

        {/* Loading State */}
        {!gameState && !error && (
          <div className="lg:col-span-2 text-center text-[#a0a0a0] py-12">
            Loading game state...
          </div>
        )}

        {/* 5x5 Grid */}
        <GameGrid
          squares={squares}
          selectedSquares={selectedSquares}
          winningSquare={winningSquare}
          onSquareClick={handleSquareClick}
        />

        {/* Right Panel */}
        <aside className="flex flex-col gap-6">
          <Motherlode amount={motherlode} />
          <Timer initialTime={timeRemaining} />
          <Stats 
            totalDeployed={totalDeployed} 
            youDeployed={youDeployed} 
          />
          <DeploymentControls 
            selectedBlocks={selectedSquares.length}
            onDeploy={handleDeploy}
            loading={loading}
          />
        </aside>
      </main>
    </>
  )
}