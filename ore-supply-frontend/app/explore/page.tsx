'use client'

import Header from '@/components/Header'
import StatsCards from '@/components/Explore/StatsCards'
import MiningTable from '@/components/Explore/MiningTable'

// Mock data
const statsData = [
  { label: 'Max Supply', value: '5,000,000', icon: 'token' as const },
  { label: 'Circulating Supply', value: '413,399', icon: 'token' as const },
  { label: 'Buried (7d)', value: '9,060', icon: 'token' as const },
  { label: 'Protocol Rev (7d)', value: '10,067', icon: 'sol' as const }
]

const miningHistory = [
  { round: 45691, block: 1, result: 'Split', players: 781, deployed: 30.2814, fee: 2.8679, distributed: 25.8054, winner: '—', time: 'Just now' },
  { round: 45690, block: 19, result: 'Split', players: 780, deployed: 32.3243, fee: 3.0618, distributed: 27.5562, winner: '—', time: '2 min ago' },
  { round: 45689, block: 25, result: 'Split', players: 770, deployed: 33.3424, fee: 3.1561, distributed: 28.4056, winner: '—', time: '3 min ago' },
  { round: 45688, block: 10, result: 'Split', players: 750, deployed: 30.3329, fee: 2.8876, distributed: 25.9892, winner: '—', time: '5 min ago' },
  { round: 45687, block: 22, result: 'Lb4k...nAdR', players: 747, deployed: 28.4845, fee: 2.7007, distributed: 24.3069, winner: '—', time: '6 min ago' },
  { round: 45686, block: 3, result: '5KQq...XQBE', players: 782, deployed: 29.0143, fee: 2.7491, distributed: 24.7419, winner: '—', time: '7 min ago' },
  { round: 45685, block: 21, result: 'eCuH...TzHZ', players: 750, deployed: 30.8535, fee: 2.9234, distributed: 26.3108, winner: '—', time: '9 min ago' },
  { round: 45684, block: 11, result: 'Split', players: 765, deployed: 34.0937, fee: 3.2272, distributed: 29.0453, winner: '—', time: '10 min ago' },
  { round: 45683, block: 11, result: 'Split', players: 786, deployed: 73.7660, fee: 6.9773, distributed: 62.7961, winner: '—', time: '11 min ago' },
]

export default function ExplorePage() {
  return (
    <>
      <Header />
      <main className="mt-[72px] px-8 py-12 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-[36px] font-bold mb-3">Explore</h1>
          <p className="text-base text-[#a0a0a0]">Review protocol stats and activity.</p>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <StatsCards stats={statsData} />
        </div>

        {/* Mining Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Mining</h2>
            <p className="text-sm text-[#a0a0a0]">Recent mining activity.</p>
          </div>

          <MiningTable data={miningHistory} />
        </div>
      </main>
    </>
  )
}