'use client'

import Header from '@/components/Header'
import StakeInterface from '@/components/Stake/StakeInterface'
import Summary from '@/components/Stake/Summary'

const summaryStats = [
  {
    label: 'Total deposits',
    value: '245,612',
    tooltip: 'Total ORE staked in the protocol',
    icon: 'token' as const
  },
  {
    label: 'APR',
    value: '21.31%',
    tooltip: 'Annual Percentage Rate - estimated yearly return'
  },
  {
    label: 'TVL',
    value: '$75,867,792',
    tooltip: 'Total Value Locked - USD value of all staked ORE'
  }
]

export default function StakePage() {
  const handleStake = (amount: number, action: 'deposit' | 'withdraw') => {
    console.log(`${action} ${amount} ORE`)
    // Add your staking logic here
  }

  return (
    <>
      <Header />
      <main className="mt-[72px] px-8 py-12 max-w-[800px] mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-[36px] font-bold mb-3">Stake</h1>
          <p className="text-base text-[#a0a0a0]">Earn a share of protocol revenue.</p>
        </div>

        {/* Info Banner */}
        <div className="bg-[rgba(74,144,226,0.1)] border border-[rgba(74,144,226,0.3)] rounded-lg px-6 py-4 mb-8 flex justify-between items-center">
          <span className="text-sm text-[#4A90E2]">Looking for the old stake page?</span>
          <a 
            href="#" 
            className="text-sm font-semibold text-[#4A90E2] flex items-center gap-1 hover:text-[#6BA8E5] transition-colors"
          >
            Click here →
          </a>
        </div>

        {/* Stake Interface */}
        <StakeInterface maxBalance={100} onStake={handleStake} />

        {/* Summary Section */}
        <Summary stats={summaryStats} />
      </main>
    </>
  )
}