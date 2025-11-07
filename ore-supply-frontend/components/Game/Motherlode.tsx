'use client'

interface MotherlodeProps {
  amount: number
}

export default function Motherlode({ amount }: MotherlodeProps) {
  return (
    <div className="relative bg-gradient-to-r from-accent-purple to-accent-blue rounded-xl p-6 text-center border-2 border-accent-yellow">
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-4xl font-bold">◎</span>
        <span className="text-4xl font-bold">{amount.toFixed(1)}</span>
      </div>
      <p className="text-sm text-text-secondary">Motherlode</p>
    </div>
  )
}