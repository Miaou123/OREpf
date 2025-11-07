'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import GameGrid from '@/components/Game/GameGrid'
import Motherlode from '@/components/Game/Motherlode'
import Timer from '@/components/Game/Timer'
import Stats from '@/components/Game/Stats'
import DeploymentControls from '@/components/Game/DeploymentControls'

// Mock data matching the HTML
const mockSquares = [
  { id: 1, sol: 1.3141, players: 764 },
  { id: 2, sol: 1.1924, players: 764 },
  { id: 3, sol: 1.2117, players: 766 },
  { id: 4, sol: 1.1840, players: 775 },
  { id: 5, sol: 1.3179, players: 762 },
  { id: 6, sol: 1.2608, players: 774 },
  { id: 7, sol: 1.3399, players: 773 },
  { id: 8, sol: 1.3044, players: 787 },
  { id: 9, sol: 1.2726, players: 774 },
  { id: 10, sol: 1.2258, players: 763 },
  { id: 11, sol: 1.2909, players: 787 },
  { id: 12, sol: 1.4171, players: 791 },
  { id: 13, sol: 1.4203, players: 789 },
  { id: 14, sol: 1.2216, players: 766 },
  { id: 15, sol: 1.3061, players: 775 },
  { id: 16, sol: 1.3324, players: 762 },
  { id: 17, sol: 1.2787, players: 768 },
  { id: 18, sol: 1.3943, players: 785 },
  { id: 19, sol: 1.3318, players: 765 },
  { id: 20, sol: 1.1842, players: 772 },
  { id: 21, sol: 1.2447, players: 757 },
  { id: 22, sol: 1.2504, players: 759 },
  { id: 23, sol: 1.2845, players: 774 },
  { id: 24, sol: 1.2630, players: 749 },
  { id: 25, sol: 1.4286, players: 772 }
]

export default function Home() {
  const [selectedSquares, setSelectedSquares] = useState<number[]>([])
  const [winningSquare] = useState(1) // Square 1 is winning by default

  const handleSquareClick = (id: number) => {
    setSelectedSquares(prev =>
      prev.includes(id)
        ? prev.filter(squareId => squareId !== id)
        : [...prev, id]
    )
  }

  const handleDeploy = (amount: number, blocks: number) => {
    console.log(`Deploying ${amount} SOL to ${blocks} blocks`)
    // Add your deployment logic here
  }

  return (
    <>
      <Header />
      <main className="mt-[72px] px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-[1600px] mx-auto">
        {/* 5x5 Grid */}
        <GameGrid
          squares={mockSquares}
          selectedSquares={selectedSquares}
          winningSquare={winningSquare}
          onSquareClick={handleSquareClick}
        />

        {/* Right Panel */}
        <aside className="flex flex-col gap-6">
          <Motherlode amount={98.6} />
          <Timer initialTime={0} />
          <Stats totalDeployed={32.2714} youDeployed={0.0000} />
          <DeploymentControls 
            selectedBlocks={selectedSquares.length}
            onDeploy={handleDeploy}
          />
        </aside>
      </main>
    </>
  )
}