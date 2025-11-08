'use client'

import { useState } from 'react'

interface MotherlodeProps {
  amount: number
  onRefresh?: () => void
}

export default function Motherlode({ amount, onRefresh }: MotherlodeProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  return (
    <div className="bg-gradient-to-br from-[rgba(157,74,226,0.1)] to-[rgba(74,144,226,0.1)] border-2 border-[#FFD700] rounded-xl p-4 text-center">
      <div className="text-2xl font-bold mb-1 flex items-center justify-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1 hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
          title="Refresh motherlode"
        >
          <svg 
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
        <span>{amount.toFixed(1)}</span>
      </div>
      <div className="text-xs text-[#a0a0a0]">Motherlode</div>
    </div>
  )
}