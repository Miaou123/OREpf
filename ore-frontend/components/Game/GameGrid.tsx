'use client'

interface GameGridProps {
  squares: Array<{
    id: number
    sol: number
    players: number
  }>
  selectedSquares: number[]
  winningSquare: number
  onSquareClick: (id: number) => void
}

export default function GameGrid({ squares, selectedSquares, winningSquare, onSquareClick }: GameGridProps) {
  return (
    <div className="grid grid-cols-5 gap-3 max-w-[800px]">
      {squares.map((square) => (
        <div
          key={square.id}
          onClick={() => onSquareClick(square.id)}
          className={`bg-[#1a1a1a] border rounded-lg p-4 aspect-square flex flex-col justify-between cursor-pointer transition-all hover:border-[#555] hover:shadow-[0_0_20px_rgba(255,215,0,0.1)] ${
            square.id === winningSquare
              ? 'border-2 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)]'
              : selectedSquares.includes(square.id)
              ? 'border-[#9D4AE2]'
              : 'border-[#333]'
          }`}
        >
          <div className="flex justify-between items-center text-xs text-[#666]">
            <span className="font-semibold">#{square.id}</span>
            <span className="flex items-center gap-1">
              {square.players} 👤
            </span>
          </div>
          <div className="text-center text-xl font-bold my-auto">
            {square.sol.toFixed(4)}
          </div>
        </div>
      ))}
    </div>
  )
}