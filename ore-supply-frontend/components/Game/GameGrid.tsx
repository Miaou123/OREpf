'use client'

import GridSquare from './GameSquare'
import { useGame } from '@/contexts/GameContext'

interface SquareData {
  id: number
  sol: number
  players: number
}

// Mock data for now
const mockSquares: SquareData[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  sol: Math.random() * 2 + 0.5,
  players: Math.floor(Math.random() * 900) + 100
}))

export default function GameGrid() {
  const { selectedSquares, setSelectedSquares, deployedSquares } = useGame()

  const handleSquareClick = (id: number) => {
    setSelectedSquares(
      selectedSquares.includes(id) 
        ? selectedSquares.filter(squareId => squareId !== id)
        : [...selectedSquares, id]
    )
  }

  return (
    <div className="grid grid-cols-5 gap-3">
      {mockSquares.map((square) => (
        <GridSquare
          key={square.id}
          number={square.id}
          sol={square.sol}
          players={square.players}
          isSelected={selectedSquares.includes(square.id)}
          onClick={() => handleSquareClick(square.id)}
        />
      ))}
    </div>
  )
}