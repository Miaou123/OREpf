'use client'

import { useState } from 'react'
import Header from '@/components/Header'

// Mock data for miners
const mockMiners = [
  { address: '5vYsJjWpNzhVnjzRBNRgXPehGqCCgmfyJhQKHfEgPump', miningPower: 67635.52, percentage: 28.78 },
  { address: 'So11111111111111111111111111111111111111112', miningPower: 20439.52, percentage: 8.70 },
  { address: 'GCXyGXhBb3kZWqJhnY9g6FHCakA3S6T27bCpgdBCPump', miningPower: 15764.00, percentage: 6.71 },
  { address: 'E6jdstGpXM89QjqEzDr8u6iV8TJfN29MwfzNvGUqJump', miningPower: 13200.00, percentage: 5.62 },
  { address: 'DPnVY6MWqT8s8JTz9voKQ4ALnUYSJKpMoCYjRYzxGnj3', miningPower: 12000.00, percentage: 5.11 },
  { address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', miningPower: 10800.00, percentage: 4.60 },
  { address: 'FidaWgbL8X77GiJPGh32tZRNNoJSWzban12PKh4g89u4', miningPower: 9600.00, percentage: 4.09 },
  { address: 'HDUBZcGGw1BqFXKitPJuKsUfxfZUus22V3idP8PuQwp5', miningPower: 8400.00, percentage: 3.58 },
  { address: 'J9BcrQfX4p9D1eM2R9MgSfXcHht1SZtgdEhGyHBK9JuN', miningPower: 7200.00, percentage: 3.07 },
  { address: 'LASSMXUzgKqxaYqJ8VdENDfEfxVhFodRciDMQgnxtXd', miningPower: 6000.00, percentage: 2.55 }
]

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rewards'>('leaderboard')

  return (
    <>
      <Header />
      <main className="mt-[72px] px-8 py-12 max-w-[1600px] mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
            <div className="text-[32px] font-bold mb-2 flex items-center justify-center gap-2">
              <div className="token-icon"></div>
              <span>6,892,435.21</span>
            </div>
            <div className="text-sm text-[#a0a0a0]">Total supply</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
            <div className="text-[32px] font-bold mb-2 flex items-center justify-center gap-2">
              <div className="sol-icon"></div>
              <span>235,029.52</span>
            </div>
            <div className="text-sm text-[#a0a0a0]">Total mining power</div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
            <div className="text-[32px] font-bold mb-2">$2,124,128,416</div>
            <div className="text-sm text-[#a0a0a0]">Market cap</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-8 border-b border-[#333]">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-4 px-2 text-lg font-medium transition-colors relative ${
                activeTab === 'leaderboard' ? 'text-white' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              Mining Power Leaderboard
              {activeTab === 'leaderboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`pb-4 px-2 text-lg font-medium transition-colors relative ${
                activeTab === 'rewards' ? 'text-white' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              Rewards
              {activeTab === 'rewards' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        {activeTab === 'leaderboard' && (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-[#333]">
                <tr className="text-left">
                  <th className="p-6 text-[#a0a0a0] font-medium">#</th>
                  <th className="p-6 text-[#a0a0a0] font-medium">Miner</th>
                  <th className="p-6 text-[#a0a0a0] font-medium text-right">Mining Power</th>
                  <th className="p-6 text-[#a0a0a0] font-medium text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {mockMiners.map((miner, index) => (
                  <tr key={miner.address} className="border-b border-[#333] hover:bg-[#252525] transition-colors">
                    <td className="p-6">{index + 1}</td>
                    <td className="p-6">
                      <a href="#" className="text-[#4A90E2] hover:underline font-mono text-sm">
                        {miner.address}
                      </a>
                    </td>
                    <td className="p-6 text-right">
                      <span className="flex items-center justify-end gap-1">
                        <div className="sol-icon"></div>
                        <span className="font-medium">{miner.miningPower.toLocaleString()}</span>
                      </span>
                    </td>
                    <td className="p-6 text-right font-medium">{miner.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-12 text-center">
            <p className="text-[#a0a0a0]">Rewards data coming soon...</p>
          </div>
        )}
      </main>
    </>
  )
}