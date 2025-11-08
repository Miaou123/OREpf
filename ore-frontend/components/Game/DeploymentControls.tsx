'use client'

import { useState } from 'react'

interface DeploymentControlsProps {
  selectedBlocks: number
  onDeploy: (amount: number, blocks: number) => void
  loading?: boolean
}

export default function DeploymentControls({ 
  selectedBlocks, 
  onDeploy,
  loading = false 
}: DeploymentControlsProps) {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')
  const [solAmount, setSolAmount] = useState(0.01)

  const incrementAmount = (value: number) => {
    setSolAmount(prev => Math.max(0, Number((prev + value).toFixed(4))))
  }

  const totalCost = Number((selectedBlocks * solAmount).toFixed(4))

  const handleDeploy = () => {
    if (selectedBlocks > 0 && solAmount > 0) {
      onDeploy(solAmount, selectedBlocks)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      {/* Toggle */}
      <div className="flex rounded-lg overflow-hidden mb-6">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-4 font-semibold transition-colors ${
            mode === 'manual'
              ? 'bg-white text-[#0a0a0a]'
              : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode('auto')}
          className={`flex-1 py-2 px-4 font-semibold transition-colors ${
            mode === 'auto'
              ? 'bg-white text-[#0a0a0a]'
              : 'bg-[#252525] text-[#a0a0a0] hover:bg-[#333]'
          }`}
        >
          Auto
        </button>
      </div>

      {/* Amount Selector */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-[#a0a0a0]">0 SOL</div>
          <div className="flex gap-2">
            <button
              onClick={() => incrementAmount(1)}
              className="bg-[#252525] border border-[#333] rounded px-3 py-1 text-xs font-semibold hover:bg-[#333] transition-colors"
            >
              +1
            </button>
            <button
              onClick={() => incrementAmount(0.1)}
              className="bg-[#252525] border border-[#333] rounded px-3 py-1 text-xs font-semibold hover:bg-[#333] transition-colors"
            >
              +0.1
            </button>
            <button
              onClick={() => incrementAmount(0.01)}
              className="bg-[#252525] border border-[#333] rounded px-3 py-1 text-xs font-semibold hover:bg-[#333] transition-colors"
            >
              +0.01
            </button>
          </div>
        </div>

        {/* SOL Input */}
        <div className="bg-[#252525] border border-[#333] rounded-lg p-4 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195]"></div>
            <span className="text-base mr-2">SOL</span>
            <input
              type="number"
              value={solAmount}
              onChange={(e) => setSolAmount(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="bg-transparent border-none text-white text-2xl font-bold w-[100px] outline-none"
            />
          </div>
          <div className="text-sm text-[#a0a0a0]">x{selectedBlocks}</div>
        </div>

        {/* Summary */}
        <div className="flex justify-between mb-4 text-sm">
          <span className="text-[#a0a0a0]">Blocks</span>
          <span className="font-semibold">x{selectedBlocks}</span>
        </div>
        <div className="flex justify-between mb-6 text-sm">
          <span className="text-[#a0a0a0]">Total</span>
          <span className="font-semibold">{totalCost} SOL</span>
        </div>

        {/* Deploy Button - Shows total cost in button text */}
        <button
          onClick={handleDeploy}
          disabled={selectedBlocks === 0 || solAmount === 0 || loading}
          className="w-full bg-gradient-to-r from-[#9D4AE2] to-[#4A90E2] text-white border-none rounded-lg py-4 text-base font-bold cursor-pointer transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:bg-[#333] disabled:text-[#666] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50"
        >
          {loading 
            ? 'Deploying...' 
            : `Deploy ${totalCost} SOL`
          }
        </button>
      </div>
    </div>
  )
}