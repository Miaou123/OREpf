'use client'

import { useState } from 'react'

interface DeployControlsProps {
  selectedBlocks: number
}

export default function DeployControls({ selectedBlocks }: DeployControlsProps) {
  const [solAmount, setSolAmount] = useState('0.1')
  const [split, setSplit] = useState(false)

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 space-y-6">
      <div>
        <label className="block text-sm text-[#a0a0a0] mb-2">Deploy amount</label>
        <div className="relative">
          <input
            type="number"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4A90E2]"
            placeholder="0"
            step="0.1"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] flex items-center gap-2">
            <div className="sol-icon"></div>
            <span>SOL</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
          <span>Split</span>
          <span className="info-icon"></span>
        </div>
        <button
          onClick={() => setSplit(!split)}
          className={`w-[52px] h-[28px] rounded-full relative transition-all duration-300 ${
            split ? 'bg-[#4A90E2]' : 'bg-[#333]'
          }`}
        >
          <div
            className={`w-[24px] h-[24px] bg-white rounded-full absolute top-[2px] transition-all duration-300 ${
              split ? 'left-[26px]' : 'left-[2px]'
            }`}
          />
        </button>
      </div>

      {selectedBlocks > 0 && split && (
        <div className="text-sm text-[#a0a0a0] text-center">
          {(parseFloat(solAmount) / selectedBlocks).toFixed(4)} SOL per block
        </div>
      )}

      <button className="w-full bg-white text-[#0a0a0a] rounded-full py-4 text-lg font-semibold transition-all hover:bg-[#f5f5f5] hover:-translate-y-[2px] disabled:bg-[#666] disabled:cursor-not-allowed">
        Deploy
      </button>

      <div className="text-center text-sm text-[#a0a0a0]">
        Selected blocks: {selectedBlocks}
      </div>
    </div>
  )
}