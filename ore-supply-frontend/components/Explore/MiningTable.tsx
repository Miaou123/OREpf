'use client'

import { useState } from 'react'

interface MiningActivity {
  round: number
  block: number
  winner: string
  winners: number
  deployed: number
  vaulted: number
  winnings: number
  motherlode: number | null
  timeAgo: string
}

// Mock data
const mockData: MiningActivity[] = [
  {
    round: 45691,
    block: 10,
    winner: 'HXxt...zbSt',
    winners: 740,
    deployed: 33.7162,
    vaulted: 3.2045,
    winnings: 28.8410,
    motherlode: null,
    timeAgo: '1 min ago'
  },
  {
    round: 45690,
    block: 23,
    winner: 'Split',
    winners: 612,
    deployed: 29.4521,
    vaulted: 2.9452,
    winnings: 25.1234,
    motherlode: null,
    timeAgo: '3 min ago'
  },
  {
    round: 45689,
    block: 7,
    winner: 'GHpx...91Kt',
    winners: 523,
    deployed: 27.8934,
    vaulted: 2.7893,
    winnings: 23.4567,
    motherlode: 98.6,
    timeAgo: '5 min ago'
  },
  // Add more mock data as needed
]

export default function MiningTable() {
  const [sortColumn, setSortColumn] = useState<keyof MiningActivity>('round')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [data, setData] = useState(mockData)

  const handleSort = (column: keyof MiningActivity) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th 
              className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-white"
              onClick={() => handleSort('round')}
            >
              Round
            </th>
            <th 
              className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-white"
              onClick={() => handleSort('block')}
            >
              Block
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              ORE Winner
            </th>
            <th 
              className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-white"
              onClick={() => handleSort('winners')}
            >
              Winners
            </th>
            <th 
              className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-white"
              onClick={() => handleSort('deployed')}
            >
              Deployed
            </th>
            <th 
              className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-white"
              onClick={() => handleSort('vaulted')}
            >
              Vaulted
            </th>
            <th 
              className="text-left py-3 px-4 text-sm font-medium text-text-secondary cursor-pointer hover:text-white"
              onClick={() => handleSort('winnings')}
            >
              Winnings
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
              Motherlode
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr 
              key={index} 
              className="border-b border-border hover:bg-surface-elevated transition-colors"
            >
              <td className="py-3 px-4 font-bold">#{row.round}</td>
              <td className="py-3 px-4">#{row.block}</td>
              <td className="py-3 px-4">
                {row.winner === 'Split' ? (
                  <span className="px-2 py-1 bg-accent-purple/20 text-accent-purple rounded text-xs font-medium">
                    Split
                  </span>
                ) : (
                  <span className="font-mono text-sm">{row.winner}</span>
                )}
              </td>
              <td className="py-3 px-4">{row.winners}</td>
              <td className="py-3 px-4">
                <span className="text-accent-blue">≡</span> {row.deployed.toFixed(4)}
              </td>
              <td className="py-3 px-4">
                <span className="text-accent-blue">≡</span> {row.vaulted.toFixed(4)}
              </td>
              <td className="py-3 px-4">
                <span className="text-accent-blue">≡</span> {row.winnings.toFixed(4)}
              </td>
              <td className="py-3 px-4">
                {row.motherlode ? `${row.motherlode} ORE` : '–'}
              </td>
              <td className="py-3 px-4 text-right text-text-secondary">
                {row.timeAgo}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-6 text-center">
        <button className="text-sm text-text-secondary hover:text-white transition-colors">
          Load more
        </button>
      </div>
    </div>
  )
}