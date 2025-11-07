'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function MiningStats() {
  const { connected } = useWallet()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    currentRound: 0,
    timeRemaining: 60,
    motherlode: 0,
    yourDeployed: 0,
    yourRefined: 0,
    yourUnrefined: 0,
  })

  useEffect(() => {
    setMounted(true)
    // Simulate countdown
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining > 0 ? prev.timeRemaining - 1 : 60,
        currentRound: prev.timeRemaining === 0 ? prev.currentRound + 1 : prev.currentRound,
        motherlode: prev.currentRound * 0.2
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <div className="h-6 bg-zinc-800 rounded w-32 mb-3 animate-pulse"></div>
            <div className="h-8 bg-zinc-800 rounded w-24 animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <h3 className="text-xl font-bold mb-4">Current Round</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-zinc-400">Round #</span>
            <span className="font-mono">{stats.currentRound}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Time Remaining</span>
            <span className="font-mono text-ore-green">{stats.timeRemaining}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Motherlode</span>
            <span className="font-mono">{stats.motherlode.toFixed(1)} ORE</span>
          </div>
        </div>
      </div>

      {connected && (
        <>
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-xl font-bold mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">SOL Deployed</span>
                <span className="font-mono">{stats.yourDeployed} SOL</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
            <h3 className="text-xl font-bold mb-4">Your Rewards</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Refined ORE</span>
                <span className="font-mono text-ore-green">{stats.yourRefined} ORE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Unrefined ORE</span>
                <span className="font-mono">{stats.yourUnrefined} ORE</span>
              </div>
              <button className="w-full bg-ore-green hover:bg-ore-dark-green text-black font-bold py-2 rounded mt-4 transition-colors">
                Claim Rewards
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}