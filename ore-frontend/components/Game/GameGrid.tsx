'use client'

import { useEffect, useState, useRef } from 'react'

interface Square {
  id: number
  sol: number
  players: number
}

interface GameGridProps {
  squares: Square[]
  selectedSquares: number[]
  winningSquare: number
  onSquareClick: (id: number) => void
}

export default function GameGrid({ 
  squares, 
  selectedSquares, 
  winningSquare,
  onSquareClick 
}: GameGridProps) {
  // Track which squares just updated for visual feedback
  const [flashingSquares, setFlashingSquares] = useState<Set<number>>(new Set())
  const previousSquaresRef = useRef<Square[]>(squares)

  // Detect changes and flash updated squares
  useEffect(() => {
    const newFlashing = new Set<number>()
    
    squares.forEach((square, index) => {
      const prevSquare = previousSquaresRef.current[index]
      
      // Check if SOL amount or player count changed
      if (prevSquare && 
          (square.sol !== prevSquare.sol || square.players !== prevSquare.players)) {
        newFlashing.add(square.id)
        console.log(`✨ Square ${square.id} updated! ${prevSquare.sol.toFixed(4)} → ${square.sol.toFixed(4)} SOL`)
      }
    })
    
    if (newFlashing.size > 0) {
      setFlashingSquares(newFlashing)
      
      // Clear flash after animation
      setTimeout(() => {
        setFlashingSquares(new Set())
      }, 1000)
    }
    
    previousSquaresRef.current = squares
  }, [squares])

  return (
    <div className="relative">
      {/* Multiplayer indicator */}
      {flashingSquares.size > 0 && (
        <div className="absolute -top-12 left-0 right-0 text-center animate-pulse">
          <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-bold">
            🎮 Live Update! Someone just deployed!
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-5 gap-3 w-full max-w-[600px]">
        {squares.map((square) => {
          const isSelected = selectedSquares.includes(square.id)
          const isWinning = square.id === winningSquare
          const isFlashing = flashingSquares.has(square.id)
          
          return (
            <button
              key={square.id}
              onClick={() => onSquareClick(square.id)}
              className={`
                aspect-square rounded-lg border-2 transition-all duration-200
                flex flex-col items-center justify-center p-2
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/20 scale-95' 
                  : 'border-[#333] bg-[#1a1a1a]'
                }
                ${isWinning 
                  ? 'border-yellow-500 bg-yellow-500/20 animate-pulse' 
                  : ''
                }
                ${isFlashing 
                  ? 'animate-flash border-green-400 bg-green-500/30 scale-105' 
                  : ''
                }
                hover:border-[#555] hover:bg-[#252525]
                active:scale-90
              `}
            >
              {/* Square number */}
              <div className="text-xs text-[#666] mb-1">#{square.id}</div>
              
              {/* SOL amount */}
              <div className={`
                text-sm font-bold mb-1 flex items-center gap-1
                ${isFlashing ? 'text-green-400 scale-110' : ''}
              `}>
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]"></div>
                <span>{square.sol.toFixed(2)}</span>
              </div>
              
              {/* Player count */}
              <div className={`
                text-xs text-[#a0a0a0]
                ${isFlashing ? 'text-green-300' : ''}
              `}>
                {square.players} {square.players === 1 ? 'player' : 'players'}
              </div>
              
              {/* Flash indicator */}
              {isFlashing && (
                <div className="absolute inset-0 rounded-lg border-2 border-green-400 animate-ping opacity-75"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Add CSS for flash animation */}
      <style jsx>{`
        @keyframes flash {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        .animate-flash {
          animation: flash 0.5s ease-in-out 2;
        }
      `}</style>
    </div>
  )
}