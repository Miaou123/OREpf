interface Stat {
  label: string
  value: string | number
  icon?: 'token' | 'sol'
}

interface StatsCardsProps {
  stats: Stat[]
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8 text-center transition-all hover:border-[#555] hover:-translate-y-1"
        >
          <div className="text-[28px] font-bold mb-3 flex items-center justify-center gap-2">
            {stat.icon && (
              <div className={stat.icon === 'token' ? 'token-icon' : 'sol-icon'}></div>
            )}
            <span>{stat.value}</span>
          </div>
          <div className="text-sm text-[#a0a0a0]">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}