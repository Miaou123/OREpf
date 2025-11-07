'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import GameSquare from '@/components/Game/GameSquare'
import DeployControls from '@/components/Game/DeployControls'

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

  return (
    <>
      <Header />
      <main className="mt-[72px] px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 max-w-[1600px] mx-auto">
        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-[800px] mx-auto lg:mx-0">
          {mockSquares.map((square) => (
            <GameSquare
              key={square.id}
              number={square.id}
              sol={square.sol}
              players={square.players}
              isWinning={square.id === winningSquare}
              isSelected={selectedSquares.includes(square.id)}
              onClick={() => handleSquareClick(square.id)}
            />
          ))}
        </div>

        {/* Right Panel */}
        <aside className="flex flex-col gap-6">
          {/* Motherlode Card */}
          <div className="bg-gradient-to-br from-[rgba(157,74,226,0.1)] to-[rgba(74,144,226,0.1)] border-2 border-[#FFD700] rounded-xl p-6 text-center">
            <div className="text-[36px] font-bold mb-2 flex items-center justify-center gap-2">
              <div className="token-icon"></div>
              <span>98.6</span>
            </div>
            <div className="text-sm text-[#a0a0a0]">Motherlode</div>
          </div>

          {/* Timer Card */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
            <div className="font-mono text-2xl font-bold mb-2">00:00</div>
            <div className="text-sm text-[#a0a0a0]">Time remaining</div>
          </div>

          {/* Stats Card */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold mb-1 flex items-center justify-center gap-1">
                  <div className="sol-icon"></div>
                  <span>32.2714</span>
                </div>
                <div className="text-sm text-[#a0a0a0]">Total deployed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold mb-1 flex items-center justify-center gap-1">
                  <div className="sol-icon"></div>
                  <span>0.0000</span>
                </div>
                <div className="text-sm text-[#a0a0a0]">You deployed</div>
              </div>
            </div>
          </div>

          {/* Deploy Controls Card */}
          <DeployControls selectedBlocks={selectedSquares.length} />
        </aside>
      </main>
    </>
  )
}