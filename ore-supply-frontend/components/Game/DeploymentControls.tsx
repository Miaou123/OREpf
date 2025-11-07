'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

import { useGame } from '@/contexts/GameContext'

export default function DeploymentControls() {
  const { connected } = useWallet()
  const { selectedSquares, setDeployedSquares } = useGame()
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')
  const [amount, setAmount] = useState(1.0)

  const handleDeploy = () => {
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }
    // Mock deployment - in real app this would interact with Solana
    setDeployedSquares(selectedSquares)
    console.log('Deploying', amount, 'SOL to', selectedSquares.length, 'blocks')
  }

  const incrementAmount = (increment: number) => {
    setAmount(prev => Math.max(0.01, prev + increment))
  }

  const totalAmount = amount * selectedSquares.length
  
  return (
    <div className="card space-y-4">
      {/* Manual/Auto Toggle */}
      <div className="flex rounded-lg bg-surface-elevated p-1">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'manual' 
              ? 'bg-surface text-white' 
              : 'text-text-secondary hover:text-white'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setMode('auto')}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'auto' 
              ? 'bg-surface text-white' 
              : 'text-text-secondary hover:text-white'
          }`}
        >
          Auto
        </button>
      </div>

      {/* Amount Selector */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-text-secondary">0 SOL</label>
          <div className="flex gap-1">
            <button 
              onClick={() => incrementAmount(1)}
              className="px-2 py-1 text-xs bg-surface-elevated rounded hover:bg-border transition-colors"
            >
              +1
            </button>
            <button 
              onClick={() => incrementAmount(0.1)}
              className="px-2 py-1 text-xs bg-surface-elevated rounded hover:bg-border transition-colors"
            >
              +0.1
            </button>
            <button 
              onClick={() => incrementAmount(0.01)}
              className="px-2 py-1 text-xs bg-surface-elevated rounded hover:bg-border transition-colors"
            >
              +0.01
            </button>
          </div>
        </div>
        
        {/* SOL Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-blue">
            ≡
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0.01, parseFloat(e.target.value) || 0))}
            className="input pl-8 pr-16"
            step="0.01"
            min="0.01"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
            SOL
          </div>
        </div>
        
        <div className="text-xs text-text-secondary text-right mt-1">
          x{selectedSquares.length}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Blocks:</span>
          <span>x{selectedSquares.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Total:</span>
          <span>{totalAmount.toFixed(4)} SOL</span>
        </div>
      </div>

      {/* Deploy Button */}
      <button
        onClick={handleDeploy}
        disabled={!connected || selectedSquares.length === 0}
        className="btn btn-primary w-full"
      >
        Deploy
      </button>
    </div>
  )
}