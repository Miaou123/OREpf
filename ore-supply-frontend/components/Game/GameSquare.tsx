'use client'

interface GameSquareProps {
  number: number
  sol: number
  players: number
  isWinning?: boolean
  isSelected?: boolean
  onClick: () => void
}

export default function GameSquare({
  number,
  sol,
  players,
  isWinning = false,
  isSelected = false,
  onClick
}: GameSquareProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#1a1a1a] border border-[#333] rounded-lg p-2 sm:p-4 aspect-square 
        flex flex-col justify-between cursor-pointer transition-all duration-300
        hover:border-[#555] hover:shadow-[0_0_20px_rgba(255,215,0,0.1)]
        ${isWinning ? 'winning' : ''}
        ${isSelected ? 'winning' : ''}
      `}
    >
      <div className="flex justify-between items-center text-[10px] sm:text-xs text-[#666]">
        <span className="font-semibold">#{number}</span>
        <span className="flex items-center gap-1">
          {players} 👤
        </span>
      </div>
      
      <div className="text-center text-sm sm:text-xl font-bold my-auto">
        {sol.toFixed(4)}
      </div>
    </div>
  )
}