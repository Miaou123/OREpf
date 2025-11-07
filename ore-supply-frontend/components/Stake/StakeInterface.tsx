'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function StakeInterface() {
  const { connected } = useWallet()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')

  const handleHalf = () => {
    // Mock balance for now
    const balance = 100
    setAmount((balance / 2).toString())
  }

  const handleAll = () => {
    // Mock balance for now
    const balance = 100
    setAmount(balance.toString())
  }

  const handleAction = () => {
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }
    console.log(`${activeTab}ing ${amount} ORE`)
  }

  return (
    <div className="card">
      {/* Tab Toggle */}
      <div className="flex border-b border-border -mx-6 -mt-6 mb-6">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-4 font-medium transition-colors relative ${
            activeTab === 'deposit' 
              ? 'text-white' 
              : 'text-text-secondary hover:text-white'
          }`}
        >
          Deposit
          {activeTab === 'deposit' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 py-4 font-medium transition-colors relative ${
            activeTab === 'withdraw' 
              ? 'text-white' 
              : 'text-text-secondary hover:text-white'
          }`}
        >
          Withdraw
          {activeTab === 'withdraw' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          )}
        </button>
      </div>

      {/* Balance Display */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-text-secondary">0 ORE</span>
        <div className="flex gap-2">
          <button
            onClick={handleHalf}
            className="px-3 py-1 text-xs bg-surface-elevated rounded hover:bg-border transition-colors"
          >
            HALF
          </button>
          <button
            onClick={handleAll}
            className="px-3 py-1 text-xs bg-surface-elevated rounded hover:bg-border transition-colors"
          >
            ALL
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative mb-6">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <span className="text-accent-purple text-lg">◎</span>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input pl-10 pr-16"
          placeholder="1.0"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
          ORE
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleAction}
        disabled={!connected || !amount || parseFloat(amount) <= 0}
        className="btn btn-primary w-full"
      >
        {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
      </button>
    </div>
  )
}