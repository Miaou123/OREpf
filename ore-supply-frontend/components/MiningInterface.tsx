'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { OreProgram } from '@/lib/ore-program'

export default function MiningInterface() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [isMining, setIsMining] = useState(false)
  const [miningStats, setMiningStats] = useState({
    hashRate: 0,
    totalMined: 0,
    elapsedTime: 0
  })

  const startMining = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setIsMining(true)
      const oreProgram = new OreProgram(connection)
      const transaction = await oreProgram.startMining(publicKey)
      
      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')
      
      // TODO: Start actual mining process
    } catch (error) {
      console.error('Mining error:', error)
      setIsMining(false)
    }
  }

  const stopMining = () => {
    setIsMining(false)
  }

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-ore-surface rounded-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold mb-8 text-center">Mining Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-ore-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm">Hash Rate</p>
              <p className="text-xl font-bold">{miningStats.hashRate} H/s</p>
            </div>
            <div className="bg-ore-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Mined</p>
              <p className="text-xl font-bold">{miningStats.totalMined} ORE</p>
            </div>
            <div className="bg-ore-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm">Mining Time</p>
              <p className="text-xl font-bold">{miningStats.elapsedTime} min</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={isMining ? stopMining : startMining}
              className={`px-12 py-6 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                isMining 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-ore-accent hover:bg-ore-accent/90'
              }`}
            >
              {isMining ? 'Stop Mining' : 'Start Mining'}
            </button>
          </div>

          {isMining && (
            <div className="mt-8">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ore-accent"></div>
              </div>
              <p className="text-center text-gray-400">Mining in progress...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}