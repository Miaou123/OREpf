'use client'

import { useState } from 'react'

interface MiningRecord {
  round: number
  block: number
  result: string
  players: number
  deployed: number
  fee: number
  distributed: number
  winner: string
  time: string
}

interface MiningTableProps {
  data: MiningRecord[]
}

export default function MiningTable({ data }: MiningTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-[#252525]">
          <tr>
            <th 
              onClick={() => handleSort('round')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Round
            </th>
            <th 
              onClick={() => handleSort('block')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Block
            </th>
            <th 
              onClick={() => handleSort('result')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Result
            </th>
            <th 
              onClick={() => handleSort('players')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Players
            </th>
            <th 
              onClick={() => handleSort('deployed')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Deployed
            </th>
            <th 
              onClick={() => handleSort('fee')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Fee
            </th>
            <th 
              onClick={() => handleSort('distributed')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Distributed
            </th>
            <th 
              onClick={() => handleSort('winner')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Winner
            </th>
            <th 
              onClick={() => handleSort('time')}
              className="px-4 py-4 text-left text-sm font-semibold text-[#a0a0a0] border-b border-[#333] cursor-pointer hover:text-white transition-colors"
            >
              Time
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr 
              key={row.round} 
              className="border-b border-[#333] last:border-b-0 hover:bg-[#252525] transition-colors"
            >
              <td className="px-4 py-4 text-sm font-mono text-[#9D4AE2]">
                #{row.round.toLocaleString()}
              </td>
              <td className="px-4 py-4 text-sm">#{row.block}</td>
              <td className="px-4 py-4 text-sm">
                {row.result === 'Split' ? (
                  <span className="split-badge">Split</span>
                ) : (
                  <span className="font-mono text-[#a0a0a0]">{row.result}</span>
                )}
              </td>
              <td className="px-4 py-4 text-sm">{row.players}</td>
              <td className="px-4 py-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="small-icon"></div>
                  <span>{row.deployed.toFixed(4)}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="small-icon"></div>
                  <span>{row.fee.toFixed(4)}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="small-icon"></div>
                  <span>{row.distributed.toFixed(4)}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-[#a0a0a0]">{row.winner}</td>
              <td className="px-4 py-4 text-sm text-[#a0a0a0]">{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}