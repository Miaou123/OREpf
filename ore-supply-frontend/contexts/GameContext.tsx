'use client'

import React, { createContext, useContext, useState } from 'react'

interface GameContextType {
  selectedSquares: number[]
  setSelectedSquares: (squares: number[]) => void
  deployedSquares: number[]
  setDeployedSquares: (squares: number[]) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [selectedSquares, setSelectedSquares] = useState<number[]>([])
  const [deployedSquares, setDeployedSquares] = useState<number[]>([])

  return (
    <GameContext.Provider 
      value={{
        selectedSquares,
        setSelectedSquares,
        deployedSquares,
        setDeployedSquares
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}