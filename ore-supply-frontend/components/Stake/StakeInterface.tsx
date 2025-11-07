'use client'

import { useState } from 'react'

interface StakeInterfaceProps {
  maxBalance: number
  onStake: (amount: number, action: 'deposit' | 'withdraw') => void
}

export default function StakeInterface({ maxBalance, onStake }: StakeInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState(1.0)

  const setHalf = () => {
    setAmount(maxBalance / 2)
  }

  const setAll = () => {
    setAmount(maxBalance)
  }

  const handleAction = () => {
    onStake(amount, activeTab)
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8">
      {/* Tab Toggle */}
      <div className="flex border-b border-[#333] mb-8">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 bg-transparent border-none py-4 text-base font-semibold cursor-pointer transition-all border-b-2 ${
            activeTab === 'deposit'
              ? 'text-white border-white'
              : 'text-[#a0a0a0] border-transparent hover:text-white'
          }`}
        >
          Deposit
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 bg-transparent border-none py-4 text-base font-semibold cursor-pointer transition-all border-b-2 ${
            activeTab === 'withdraw'
              ? 'text-white border-white'
              : 'text-[#a0a0a0] border-transparent hover:text-white'
          }`}
        >
          Withdraw
        </button>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-[#a0a0a0]">0 ORE</span>
          <div className="flex gap-2">
            <button
              onClick={setHalf}
              className="bg-[#252525] text-white border border-[#333] rounded px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all hover:bg-[#333] hover:border-[#555]"
            >
              HALF
            </button>
            <button
              onClick={setAll}
              className="bg-[#252525] text-white border border-[#333] rounded px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all hover:bg-[#333] hover:border-[#555]"
            >
              ALL
            </button>
          </div>
        </div>

        {/* Main Input */}
        <div className="bg-[#252525] border border-[#333] rounded-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-[#9D4AE2] to-[#4A90E2] rounded-full"></div>
            <span className="text-base font-semibold text-[#a0a0a0]">ORE</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            step="0.1"
            min="0"
            className="bg-transparent border-none text-white text-2xl font-bold w-[120px] outline-none text-right"
          />
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={handleAction}
        className="w-full bg-gradient-to-r from-[#9D4AE2] to-[#4A90E2] text-white border-none rounded-lg py-4 text-base font-bold cursor-pointer transition-all mt-6 hover:brightness-110 hover:-translate-y-0.5"
      >
        {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
      </button>
    </div>
  )
}