'use client'

import { useEffect, useState } from 'react'

interface StatsData {
  totalSupply: number
  activeMiners: number
  currentReward: number
  difficulty: number
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData>({
    totalSupply: 0,
    activeMiners: 0,
    currentReward: 0,
    difficulty: 0
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Set initial stats after mount to avoid hydration issues
    setStats({
      totalSupply: 1234567,
      activeMiners: 5432,
      currentReward: 1.0,
      difficulty: 987654
    })
  }, [])

  if (!mounted) {
    return (
      <section className="py-12 px-6 bg-black/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="bg-zinc-900/50 rounded-lg p-6 backdrop-blur-sm border border-zinc-800">
                <div className="h-4 bg-zinc-800 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-8 bg-zinc-800 rounded w-32 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const statItems = [
    { label: 'Total Supply', value: `${stats.totalSupply.toLocaleString()} ORE` },
    { label: 'Active Miners', value: stats.activeMiners.toLocaleString() },
    { label: 'Current Reward', value: `${stats.currentReward} ORE/min` },
    { label: 'Network Difficulty', value: stats.difficulty.toLocaleString() }
  ]

  return (
    <section className="py-12 px-6 bg-black/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <div key={index} className="bg-zinc-900/50 rounded-lg p-6 backdrop-blur-sm border border-zinc-800">
              <p className="text-zinc-400 text-sm mb-2">{item.label}</p>
              <p className="text-2xl font-bold text-green-400">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}