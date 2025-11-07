interface StatsProps {
  totalDeployed: number
  youDeployed: number
}

export default function Stats({ totalDeployed, youDeployed }: StatsProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold mb-1 flex items-center justify-center gap-1">
            <div className="sol-icon"></div>
            <span>{totalDeployed.toFixed(4)}</span>
          </div>
          <div className="text-sm text-[#a0a0a0]">Total deployed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold mb-1 flex items-center justify-center gap-1">
            <div className="sol-icon"></div>
            <span>{youDeployed.toFixed(4)}</span>
          </div>
          <div className="text-sm text-[#a0a0a0]">You deployed</div>
        </div>
      </div>
    </div>
  )
}