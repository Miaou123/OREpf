'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function MiningGrid() {
  const { connected } = useWallet()
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([])
  const [deployAmount, setDeployAmount] = useState('0.1')
  const [useAutominer, setUseAutominer] = useState(false)

  const toggleBlock = (index: number) => {
    if (selectedBlocks.includes(index)) {
      setSelectedBlocks(selectedBlocks.filter(i => i !== index))
    } else {
      setSelectedBlocks([...selectedBlocks, index])
    }
  }

  const handleDeploy = async () => {
    if (!connected) {
      alert('Please connect your wallet first')
      return
    }
    // TODO: Implement deploy logic
    console.log('Deploying to blocks:', selectedBlocks, 'Amount:', deployAmount)
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <h2 className="text-2xl font-bold mb-6">Mining Board</h2>
      
      <div className="mb-6">
        <p className="text-zinc-400 mb-4">Select blocks to deploy SOL. Winners are selected randomly each minute.</p>
        
        <div className="grid grid-cols-5 gap-2 mb-6">
          {Array.from({ length: 25 }).map((_, index) => (
            <button
              key={index}
              onClick={() => toggleBlock(index)}
              className={`aspect-square rounded border-2 transition-all ${
                selectedBlocks.includes(index)
                  ? 'bg-ore-green border-ore-green text-black font-bold'
                  : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            SOL per block
          </label>
          <input
            type="number"
            value={deployAmount}
            onChange={(e) => setDeployAmount(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 focus:outline-none focus:border-ore-green"
            min="0.01"
            step="0.01"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="autominer"
            checked={useAutominer}
            onChange={(e) => setUseAutominer(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="autominer" className="text-sm">
            Use Autominer (automatically select optimal blocks)
          </label>
        </div>

        <button
          onClick={handleDeploy}
          disabled={!connected || (selectedBlocks.length === 0 && !useAutominer)}
          className="w-full bg-ore-green hover:bg-ore-dark-green disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-bold py-3 rounded transition-colors"
        >
          Deploy
        </button>
      </div>
    </div>
  )
}