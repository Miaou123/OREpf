'use client'

import { useState } from 'react'
import Header from '@/components/Header'

export default function StakePage() {
  const [amount, setAmount] = useState('')
  const [selectedOption, setSelectedOption] = useState<'boost' | 'lp'>('boost')

  return (
    <>
      <Header />
      <main className="mt-[72px] px-8 py-12 max-w-[800px] mx-auto">
        <h1 className="text-[48px] font-bold mb-8 text-center">Stake ORE</h1>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex gap-8 border-b border-[#333] justify-center">
            <button
              onClick={() => setSelectedOption('boost')}
              className={`pb-4 px-4 text-lg font-medium transition-colors relative ${
                selectedOption === 'boost' ? 'text-white' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              Mining Boost
              {selectedOption === 'boost' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
              )}
            </button>
            <button
              onClick={() => setSelectedOption('lp')}
              className={`pb-4 px-4 text-lg font-medium transition-colors relative ${
                selectedOption === 'lp' ? 'text-white' : 'text-[#a0a0a0] hover:text-white'
              }`}
            >
              LP Rewards
              {selectedOption === 'lp' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
              )}
            </button>
          </div>
        </div>

        {/* Mining Boost Content */}
        {selectedOption === 'boost' && (
          <div className="space-y-8">
            {/* Info Card */}
            <div className="bg-gradient-to-r from-[rgba(157,74,226,0.1)] to-[rgba(74,144,226,0.1)] border border-[#4A90E2] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Boost Your Mining Power</h3>
              <p className="text-[#a0a0a0] mb-4">
                Stake your ORE tokens to increase your mining power multiplier. The more you stake, the higher your boost!
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#4A90E2]">1.5x</div>
                  <div className="text-sm text-[#a0a0a0]">100 ORE</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#9D4AE2]">2x</div>
                  <div className="text-sm text-[#a0a0a0]">500 ORE</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#FFD700]">3x</div>
                  <div className="text-sm text-[#a0a0a0]">1000 ORE</div>
                </div>
              </div>
            </div>

            {/* Staking Form */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">Amount to Stake</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4A90E2]"
                      placeholder="0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button className="text-[#4A90E2] hover:text-[#6ba2e8] text-sm font-medium">MAX</button>
                      <div className="w-px h-6 bg-[#333]"></div>
                      <div className="flex items-center gap-1">
                        <div className="token-icon"></div>
                        <span className="text-[#a0a0a0]">ORE</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-[#a0a0a0]">
                    Balance: 0.0000 ORE
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-[#252525] rounded-lg">
                  <div>
                    <div className="text-sm text-[#a0a0a0] mb-1">Current Boost</div>
                    <div className="text-xl font-bold">1.0x</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#a0a0a0] mb-1">New Boost</div>
                    <div className="text-xl font-bold text-[#4A90E2]">
                      {amount ? (parseFloat(amount) >= 1000 ? '3.0x' : parseFloat(amount) >= 500 ? '2.0x' : parseFloat(amount) >= 100 ? '1.5x' : '1.0x') : '1.0x'}
                    </div>
                  </div>
                </div>

                <button className="w-full bg-white text-[#0a0a0a] rounded-full py-4 text-lg font-semibold transition-all hover:bg-[#f5f5f5] hover:-translate-y-[2px] disabled:bg-[#666] disabled:cursor-not-allowed">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LP Rewards Content */}
        {selectedOption === 'lp' && (
          <div className="space-y-8">
            {/* Info Card */}
            <div className="bg-gradient-to-r from-[rgba(157,74,226,0.1)] to-[rgba(74,144,226,0.1)] border border-[#4A90E2] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Provide Liquidity, Earn Rewards</h3>
              <p className="text-[#a0a0a0] mb-4">
                Add liquidity to the ORE/SOL pool and stake your LP tokens to earn additional ORE rewards.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#4A90E2]">245.6%</div>
                  <div className="text-sm text-[#a0a0a0]">Current APR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <div className="token-icon"></div>
                    <span>1,234.56</span>
                  </div>
                  <div className="text-sm text-[#a0a0a0]">Daily Rewards</div>
                </div>
              </div>
            </div>

            {/* LP Staking Form */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">LP Tokens to Stake</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4A90E2]"
                      placeholder="0"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button className="text-[#4A90E2] hover:text-[#6ba2e8] text-sm font-medium">MAX</button>
                      <div className="w-px h-6 bg-[#333]"></div>
                      <span className="text-[#a0a0a0]">LP</span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-[#a0a0a0]">
                    Balance: 0.0000 LP
                  </div>
                </div>

                <div className="p-4 bg-[#252525] rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">Estimated Daily Rewards</span>
                    <span className="flex items-center gap-1">
                      <div className="small-icon"></div>
                      <span>0.00</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a0a0a0]">Estimated APR</span>
                    <span className="text-[#4A90E2]">245.6%</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href="#"
                    className="flex-1 bg-[#333] text-white rounded-full py-3 text-center font-medium hover:bg-[#444] transition-colors"
                  >
                    Add Liquidity
                  </a>
                  <button className="flex-1 bg-white text-[#0a0a0a] rounded-full py-3 font-semibold transition-all hover:bg-[#f5f5f5] hover:-translate-y-[1px]">
                    Stake LP
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}