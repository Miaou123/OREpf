'use client'

import Header from '@/components/Header'
import MiningGrid from '@/components/MiningGrid'
import MiningStats from '@/components/MiningStats'

export default function MinePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MiningGrid />
          </div>
          <div className="lg:col-span-1">
            <MiningStats />
          </div>
        </div>
      </div>
    </main>
  )
}